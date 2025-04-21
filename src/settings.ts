import { App, PluginSettingTab, Setting, TFolder, TFile, SuggestModal } from 'obsidian';
import DailyNotesPlugin from './main';

export class DailyNotesSettingTab extends PluginSettingTab {
    plugin: DailyNotesPlugin;
    private preview: HTMLElement;

    constructor(app: App, plugin: DailyNotesPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const {containerEl} = this;
        containerEl.empty();

        containerEl.createEl('h2', {text: 'Daily Notes Settings'});

        // Folder selection for daily notes
        new Setting(containerEl)
            .setName('Daily Notes Folder')
            .setDesc('Select the folder where daily notes will be created')
            .addText(text => {
                text.setPlaceholder('Select folder')
                    .setValue(this.plugin.settings.dailyNotesPath)
                    .onChange(async (value) => {
                        this.plugin.settings.dailyNotesPath = value;
                        await this.plugin.saveSettings();
                        this.updatePreview();
                    });
            })
            .addButton(button => {
                button.setButtonText('Browse')
                    .setCta()
                    .onClick(async () => {
                        const folder = await this.selectFolder();
                        if (folder) {
                            this.plugin.settings.dailyNotesPath = folder.path;
                            await this.plugin.saveSettings();
                            this.updatePreview();
                            this.display(); // Refresh the settings display
                        }
                    });
            });

        // Template file selection
        new Setting(containerEl)
            .setName('Template File')
            .setDesc('Select a template file to use for daily notes (optional)')
            .addText(text => {
                text.setPlaceholder('Select template file')
                    .setValue(this.plugin.settings.templatePath || '')
                    .onChange(async (value) => {
                        this.plugin.settings.templatePath = value;
                        await this.plugin.saveSettings();
                        this.updatePreview();
                    });
            })
            .addButton(button => {
                button.setButtonText('Browse')
                    .setCta()
                    .onClick(async () => {
                        const file = await this.selectFile();
                        if (file) {
                            this.plugin.settings.templatePath = file.path;
                            await this.plugin.saveSettings();
                            this.updatePreview();
                            this.display(); // Refresh the settings display
                        }
                    });
            });

        new Setting(containerEl)
            .setName('Date Format')
            .setDesc('Format for the date in filenames. Use DD for day, MM for month, YYYY for year.')
            .addText(text => text
                .setPlaceholder('DDMMYYYY')
                .setValue(this.plugin.settings.dateFormat)
                .onChange(async (value) => {
                    this.plugin.settings.dateFormat = value;
                    await this.plugin.saveSettings();
                    this.updatePreview();
                }));

        new Setting(containerEl)
            .setName('Default Note Type')
            .setDesc('Choose between markdown or canvas for new daily notes')
            .addDropdown(dropdown => dropdown
                .addOption('markdown', 'Markdown')
                .addOption('canvas', 'Canvas')
                .setValue(this.plugin.settings.defaultNoteType)
                .onChange(async (value) => {
                    this.plugin.settings.defaultNoteType = value as 'markdown' | 'canvas';
                    await this.plugin.saveSettings();
                    this.updatePreview();
                }));

        new Setting(containerEl)
            .setName('Use YAML Frontmatter')
            .setDesc('Add YAML frontmatter to daily notes with metadata')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.useYamlFrontmatter)
                .onChange(async (value) => {
                    this.plugin.settings.useYamlFrontmatter = value;
                    await this.plugin.saveSettings();
                    this.updatePreview();
                }));

        // Add a preview section
        const previewContainer = containerEl.createEl('div', {cls: 'daily-notes-preview'});
        previewContainer.createEl('h3', {text: 'Template Preview'});
        this.preview = previewContainer.createEl('div', {cls: 'daily-notes-preview-content'});
        
        // Initial preview
        this.updatePreview();
    }

    private async selectFolder(): Promise<TFolder | null> {
        return new Promise((resolve) => {
            const modal = new FolderSuggestModal(this.app, (folder) => {
                resolve(folder);
            });
            modal.open();
        });
    }

    private async selectFile(): Promise<TFile | null> {
        return new Promise((resolve) => {
            const modal = new FileSuggestModal(this.app, (file) => {
                resolve(file);
            });
            modal.open();
        });
    }

    private async updatePreview(): Promise<void> {
        const date = new Date();
        const formattedDate = date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        let previewContent = this.plugin.settings.template;
        
        // If template path is set, try to read the template file
        if (this.plugin.settings.templatePath) {
            const templateFile = this.app.vault.getAbstractFileByPath(this.plugin.settings.templatePath);
            if (templateFile instanceof TFile) {
                try {
                    previewContent = await this.app.vault.read(templateFile);
                } catch (error) {
                    console.error('Error reading template file:', error);
                }
            }
        }
        
        previewContent = previewContent.replace(/{{date}}/g, formattedDate);
        
        if (this.plugin.settings.useYamlFrontmatter) {
            previewContent = `---
date: ${formattedDate}
type: daily-note
created: ${new Date().toISOString()}
---

` + previewContent;
        }
        
        this.preview.innerHTML = `<pre>${previewContent}</pre>`;
    }
}

// Helper class for folder selection
class FolderSuggestModal extends SuggestModal<TFolder> {
    constructor(app: App, private onChoose: (folder: TFolder) => void) {
        super(app);
    }

    getSuggestions(query: string): TFolder[] {
        const folders: TFolder[] = [];
        this.app.vault.getAllLoadedFiles().forEach(file => {
            if (file instanceof TFolder) {
                folders.push(file);
            }
        });
        return folders.filter(folder => 
            folder.path.toLowerCase().includes(query.toLowerCase())
        );
    }

    renderSuggestion(folder: TFolder, el: HTMLElement) {
        el.createEl('div', {text: folder.path});
    }

    onChooseItem(folder: TFolder) {
        this.onChoose(folder);
    }

    onChooseSuggestion(folder: TFolder) {
        this.onChoose(folder);
    }
}

// Helper class for file selection
class FileSuggestModal extends SuggestModal<TFile> {
    constructor(app: App, private onChoose: (file: TFile) => void) {
        super(app);
    }

    getSuggestions(query: string): TFile[] {
        const files: TFile[] = [];
        this.app.vault.getAllLoadedFiles().forEach(file => {
            if (file instanceof TFile && file.extension === 'md') {
                files.push(file);
            }
        });
        return files.filter(file => 
            file.path.toLowerCase().includes(query.toLowerCase())
        );
    }

    renderSuggestion(file: TFile, el: HTMLElement) {
        el.createEl('div', {text: file.path});
    }

    onChooseItem(file: TFile) {
        this.onChoose(file);
    }

    onChooseSuggestion(file: TFile) {
        this.onChoose(file);
    }
}