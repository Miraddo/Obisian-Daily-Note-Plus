import { App, Plugin, TFile, WorkspaceLeaf, Notice, MarkdownView, SuggestModal } from 'obsidian';
import { DailyNotesSettingTab } from './settings';
import moment from 'moment';

interface DailyNotesSettings {
    dailyNotesPath: string;
    template: string;
    templatePath: string;
    dateFormat: string;
    useYamlFrontmatter: boolean;
    defaultNoteType: 'markdown' | 'canvas';
}

const DEFAULT_SETTINGS: DailyNotesSettings = {
    dailyNotesPath: 'Daily Notes',
    template: `---
date: {{date}}
type: daily-note
---

# {{date}}

## 🎯 Tasks
- [ ] 

## 📝 Notes


## 📅 Events


## 🔄 Daily Review
- [ ] Review today's tasks
- [ ] Plan for tomorrow
- [ ] Reflect on the day

## 📚 Links
- 
`,
    templatePath: '',
    dateFormat: 'DDMMYYYY',
    useYamlFrontmatter: true,
    defaultNoteType: 'markdown'
};

export default class DailyNotesPlugin extends Plugin {
    settings = DEFAULT_SETTINGS;

    async onload() {
        await this.loadSettings();

        // Add ribbon icon
        this.addRibbonIcon('calendar-with-checkmark', 'Create Daily Note', () => {
            this.createOrOpenDailyNote();
        });

        this.addSettingTab(new DailyNotesSettingTab(this.app, this));

        // Add commands
        this.addCommand({
            id: 'create-daily-note',
            name: 'Create Daily Note',
            callback: () => this.createOrOpenDailyNote()
        });

        this.addCommand({
            id: 'open-today-note',
            name: 'Open Today\'s Note',
            callback: () => this.openTodayNote()
        });

        // Register file open event
        this.registerEvent(
            this.app.workspace.on('file-open', async (file: TFile | null) => {
                if (!file) return;
                await this.handleFileOpen(file);
            })
        );
    }

    private async createOrOpenDailyNote() {
        try {
            const { filePath, fileName } = this.getDailyNotePath();
            let file = this.app.vault.getAbstractFileByPath(filePath);

            if (!(file instanceof TFile)) {
                const content = await this.getTemplateContent();
                const newFile = await this.app.vault.create(filePath, content);
                if (newFile instanceof TFile) {
                    await this.app.workspace.getLeaf().openFile(newFile);
                }
            } else {
                await this.app.workspace.getLeaf().openFile(file);
            }
        } catch (error) {
            new Notice('Failed to create daily note: ' + error.message);
        }
    }

    private async openTodayNote() {
        try {
            const { filePath } = this.getDailyNotePath();
            const file = this.app.vault.getAbstractFileByPath(filePath);
            
            if (file instanceof TFile) {
                await this.app.workspace.getLeaf().openFile(file);
            } else {
                new Notice('Today\'s note does not exist yet. Creating...');
                await this.createOrOpenDailyNote();
            }
        } catch (error) {
            new Notice('Failed to open today\'s note: ' + error.message);
        }
    }

    private async handleFileOpen(file: TFile) {
        try {
            // Check if this is a file containing a daily note link
            if (file.extension === 'md') {
                const content = await this.app.vault.read(file);
                const dailyNotePattern = /\[\[.*?\/Daily Notes\/DDMMYYYY-daily\|.*?\]\]/g;
                const matches = content.match(dailyNotePattern);
                
                if (matches) {
                    // Get the current date in the required format
                    const today = new Date();
                    const dateFormat = this.settings.dateFormat
                        .replace('DD', today.getDate().toString().padStart(2, '0'))
                        .replace('MM', (today.getMonth() + 1).toString().padStart(2, '0'))
                        .replace('YYYY', today.getFullYear().toString());
                    
                    // Replace all matches with the current date
                    let newContent = content;
                    matches.forEach(match => {
                        const newLinkText = match.replace('DDMMYYYY', dateFormat);
                        newContent = newContent.replace(match, newLinkText);
                    });
                    
                    // Update the file content
                    await this.app.vault.modify(file, newContent);

                    // Get the path for the daily note
                    const { filePath } = this.getDailyNotePath();
                    
                    // Check if the daily note exists
                    let dailyFile = this.app.vault.getAbstractFileByPath(filePath);
                    if (!(dailyFile instanceof TFile)) {
                        // Create the daily note
                        const content = await this.getTemplateContent();
                        const newFile = await this.app.vault.create(filePath, content);
                        if (newFile instanceof TFile) {
                            await this.app.workspace.getLeaf().openFile(newFile);
                        }
                    } else {
                        // Open the existing daily note
                        await this.app.workspace.getLeaf().openFile(dailyFile);
                    }
                    return; // Exit after handling the link
                }
            }

            // Only proceed with normal daily note creation if this isn't a link update
            const { filePath } = this.getDailyNotePath();
            
            if (file.path === filePath) {
                return; // File exists and is open
            }

            let dailyFile = this.app.vault.getAbstractFileByPath(filePath);
            if (!(dailyFile instanceof TFile)) {
                const content = await this.getTemplateContent();
                const newFile = await this.app.vault.create(filePath, content);
                if (newFile instanceof TFile) {
                    await this.app.workspace.getLeaf().openFile(newFile);
                }
            }
        } catch (error) {
            console.error('Error handling file open:', error);
            new Notice('Error handling daily note: ' + error.message);
        }
    }

    private getDailyNotePath() {
        const today = new Date();
        const dateFormat = this.settings.dateFormat
            .replace('DD', today.getDate().toString().padStart(2, '0'))
            .replace('MM', (today.getMonth() + 1).toString().padStart(2, '0'))
            .replace('YYYY', today.getFullYear().toString());
        
        const fileName = `${dateFormat}-daily${this.settings.defaultNoteType === 'canvas' ? '.canvas' : '.md'}`;
        const filePath = `${this.settings.dailyNotesPath}/${fileName}`;
        
        return { filePath, fileName };
    }

    private async getTemplateContent(): Promise<string> {
        const date = moment().format('MMMM D, YYYY');
        let content = this.settings.template;

        // If template path is set, try to read the template file
        if (this.settings.templatePath) {
            const templateFile = this.app.vault.getAbstractFileByPath(this.settings.templatePath);
            if (templateFile instanceof TFile) {
                try {
                    content = await this.app.vault.read(templateFile);
                } catch (error) {
                    console.error('Error reading template file:', error);
                }
            }
        }

        content = content.replace(/{{date}}/g, date);

        if (this.settings.useYamlFrontmatter) {
            const yamlFrontmatter = `---
date: ${date}
type: daily-note
created: ${moment().format()}
---

`;
            content = yamlFrontmatter + content;
        }

        return content;
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }
} 