# FastConfig - YAML Time Updater

A VS Code extension that helps you quickly update time fields in your YAML configuration files. This extension is particularly useful for managing scheduled tasks or batch operations where you need to set sequential times across multiple sources.

## Features

This extension provides a simple command to automatically update time fields in your YAML configuration files. It:

- Updates time fields for multiple sources sequentially
- Starts from current time + 1 minute
- Increments each source by 1 minute
- Sets two times per source (12 hours apart)
- Handles time overflow correctly (minutes > 60, hours > 24)

For example, if you run the command at 14:30, your sources.yml will be updated like this:

```yaml
sources:
  - name: "Source 1"
    time:
      - "14:31"
      - "02:31"
  - name: "Source 2"
    time:
      - "14:32"
      - "02:32"
  - name: "Source 3"
    time:
      - "14:33"
      - "02:33"
```

## Usage

1. Open your workspace containing the `sources.yml` file
2. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on macOS) to open the command palette
3. Type "Update Config Times" and select the command
4. Your sources file will be automatically updated with new times

## Requirements

- VS Code 1.98.0 or higher
- A YAML configuration file named `sources.yml` in your workspace

## Extension Settings

This extension currently doesn't require any additional settings.

## Known Issues

None at the moment.

## Release Notes

### 0.0.1

Initial release of FastConfig:
- Add command to update time fields in YAML configuration
- Support for multiple sources with incremental timing
- Automatic 12-hour offset for second time field

---

## Contributing

Feel free to open issues or submit pull requests on our repository.

**Enjoy!**
