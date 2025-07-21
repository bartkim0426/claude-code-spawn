# Changelog

All notable changes to claude-code-spawn will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2025-01-21

### Added
- Session-based logging system with JSON Lines format
- Log viewing utilities (`getRecentSessions`, `viewLog`)
- CLI commands for log management (`claude-spawn logs`)
- `--save-log` and `--log-dir` options
- `-p` option added to all Claude CLI calls by default

### Changed
- Improved stdout/stderr handling with logging support
- Enhanced result object with sessionId and logFile when logging enabled

## [1.0.1] - 2025-01-21

### Fixed
- Fixed nested Claude execution issues by cleaning CLAUDECODE environment variable
- Improved compatibility when running from within Claude Code environment

## [1.0.0] - 2025-01-21

### Added

- Initial release of claude-code-spawn
- Core functionality for spawning Claude CLI processes
- Support for fire-and-forget execution mode
- Comprehensive error handling and logging
- Built-in test suite with multiple test scenarios
- CLI tool for command-line usage
- Extensive documentation and examples

### Features

- `runCommand()` - Execute any command with advanced options
- `runClaude()` - Execute Claude CLI with specific configurations
- `runClaudeTask()` - Convenience function for project-specific tasks
- `testSimpleCommand()` - Built-in test suite for functionality verification
- Environment detection for nested Claude execution
- Timeout support for preventing hanging processes
- Configurable stdio handling
- Detached process support for background execution

### Examples

- Basic usage example demonstrating core functionality
- Fire-and-forget mode example for background tasks
- Web improvement workflow example for development use cases
- Comprehensive test suite with multiple scenarios

### CLI Tool

- Command-line interface with full option support
- Built-in help and version commands
- Test suite execution from command line
- Environment variable support for default configurations

### Documentation

- Comprehensive README with API reference
- Usage examples for different scenarios
- Troubleshooting guide for common issues
- Installation instructions for multiple methods

### Infrastructure

- MIT License
- NPM package configuration
- GitHub repository setup
- Semantic versioning support