const { SettingTab, Setting } = require('obsidian');

class DailyNotesSettingTab extends SettingTab {
    constructor(app, plugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display() {
        const {containerEl} = this;
        containerEl.empty();

        // Create settings sections
        this.createPathSection(containerEl);
        this.createTemplateSection(containerEl);
        this.createHelpSection(containerEl);
    }

    createPathSection(containerEl) {
        const section = containerEl.createEl('div', {cls: 'daily-notes-settings-section'});
        section.createEl('h3', {text: 'Path Settings'});

        const pathSetting = new Setting(section)
            .setName('Daily Notes Path')
            .setDesc('The folder where daily notes will be created');

        pathSetting.controlEl.createEl('textarea', {
            cls: 'daily-notes-path-input',
            value: this.plugin.settings.dailyNotesPath,
            placeholder: '1-Calendar/Daily Notes',
            rows: 1
        }).addEventListener('input', async (e) => {
            this.plugin.settings.dailyNotesPath = e.target.value;
            await this.plugin.saveSettings();
        });
    }

    createTemplateSection(containerEl) {
        const section = containerEl.createEl('div', {cls: 'daily-notes-settings-section'});
        section.createEl('h3', {text: 'Template Settings'});

        const templateSetting = new Setting(section)
            .setName('Daily Note Template')
            .setDesc('Template for new daily notes. Use {{date}} for the current date.');

        templateSetting.controlEl.createEl('textarea', {
            cls: 'daily-notes-template-input',
            value: this.plugin.settings.template,
            placeholder: 'Enter your template here...',
            rows: 15
        }).addEventListener('input', async (e) => {
            this.plugin.settings.template = e.target.value;
            await this.plugin.saveSettings();
        });
    }

    createHelpSection(containerEl) {
        const section = containerEl.createEl('div', {cls: 'daily-notes-settings-section'});
        section.createEl('h3', {text: 'Help & Information'});

        const helpText = section.createEl('div', {cls: 'daily-notes-help-text'});
        helpText.createEl('p', {text: 'Available template variables:'});
        const list = helpText.createEl('ul');
        list.createEl('li', {text: '{{date}} - Current date in YYYY-MM-DD format'});
        list.createEl('li', {text: '{{date:YYYY-MM-DD}} - Current date in YYYY-MM-DD format'});
        list.createEl('li', {text: '{{date:DD.MM.YYYY}} - Current date in DD.MM.YYYY format'});
    }
}

module.exports = DailyNotesSettingTab; 