# Daily Notes Plus

A powerful and flexible daily notes plugin for Obsidian that enhances your daily note-taking experience with smart templates, automatic date handling, and flexible organization.

![Daily Notes Plus](screenshots/daily-notes-plus.png)

## Features

- 📅 **Smart Date Handling**
  - Automatically updates links with current date
  - Supports custom date formats
  - Handles both markdown and canvas note types

- 📝 **Flexible Templates**
  - Use custom template files from your vault
  - Built-in default template with sections
  - YAML frontmatter support
  - Date variable replacement (`{{date}}`)

- 🗂️ **Customizable Organization**
  - Choose any folder for daily notes
  - Full path support
  - Automatic folder creation

- 🔄 **Automatic Link Updates**
  - Updates `DDMMYYYY-daily` links to current date
  - Maintains link structure
  - Prevents duplicate files

## Installation

1. Open Obsidian Settings
2. Go to Community Plugins
3. Disable Safe Mode (if enabled)
4. Click Browse
5. Search for "Daily Notes Plus"
6. Click Install
7. Enable the plugin

## Usage

### Creating Daily Notes

1. **Using the Ribbon Icon**
   - Click the calendar icon in the ribbon
   - A new daily note will be created for today

2. **Using Commands**
   - `Ctrl/Cmd + P` to open command palette
   - Search for "Create Daily Note" or "Open Today's Note"
   - Select the desired command

3. **Using Links**
   - Use the format: `[[path/to/Daily Notes/DDMMYYYY-daily|📅 Daily Notes]]`
   - Click the link to create/open today's note
   - The link will automatically update with the current date

### Configuration

1. **Daily Notes Folder**
   - Choose where your daily notes will be stored
   - Click "Browse" to select a folder
   - Supports full paths

2. **Template File**
   - Select a custom template file (optional)
   - Use `{{date}}` in your template for date replacement
   - Supports YAML frontmatter

3. **Date Format**
   - Customize the date format in filenames
   - Use DD for day, MM for month, YYYY for year
   - Default: DDMMYYYY

4. **Note Type**
   - Choose between Markdown and Canvas
   - Affects file extension (.md or .canvas)

### Default Template

```markdown
---
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
```

## Examples

### Basic Link
```markdown
[[Daily Notes/DDMMYYYY-daily|📅 Daily Notes]]
```

### Custom Path Link
```markdown
[[Calendar/Daily Notes/DDMMYYYY-daily|📅 Daily Notes]]
```

### Template with Date
```markdown
# {{date}}

## Tasks for Today
- [ ] Task 1
- [ ] Task 2

## Notes
- Note 1
- Note 2
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you find this plugin helpful, please consider:
- ⭐ Starring the repository
- 🐛 Reporting issues
- 💡 Suggesting improvements

## Credits

Created with ❤️ for the Obsidian community.