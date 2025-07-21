# Claude Code Spawn

A Node.js module for spawning and managing Claude CLI processes with proper error handling, logging, and support for fire-and-forget execution modes.

[![npm version](https://badge.fury.io/js/claude-code-spawn.svg)](https://badge.fury.io/js/claude-code-spawn)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- 🚀 **Easy Claude CLI Integration**: Simple API for running Claude commands
- 🔥 **Fire-and-Forget Mode**: Run long tasks in the background
- 📝 **Comprehensive Logging**: Detailed execution logs with configurable verbosity
- ⏱️ **Timeout Support**: Prevent hanging processes with customizable timeouts
- 🛡️ **Error Handling**: Robust error detection and reporting
- 🔧 **Flexible Configuration**: Extensive options for different use cases
- 🧪 **Built-in Testing**: Test suite to verify functionality

## Installation

### NPM Package (Coming Soon)
```bash
npm install claude-code-spawn
```

### GitHub Installation
```bash
npm install git+https://github.com/bartkim0426/claude-code-spawn.git
```

### Local Development
```bash
git clone https://github.com/bartkim0426/claude-code-spawn.git
cd claude-code-spawn
npm test
```

## Prerequisites

- Node.js 14.0.0 or higher
- Claude CLI installed (`npm install -g @anthropic-ai/claude-code`)

## Quick Start

```javascript
const { runClaude, runCommand, testSimpleCommand } = require('claude-code-spawn');

// Test the installation
await testSimpleCommand();

// Run a simple Claude command
const result = await runClaude('What is 2+2?');
console.log(result.stdout);

// Run Claude in fire-and-forget mode
const task = await runClaude('Analyze this project', {
  fireAndForget: true,
  cwd: './my-project'
});
console.log('Task started with PID:', task.pid);
```

## API Reference

### `runCommand(command, args, options)`

Execute any command with advanced options.

**Parameters:**
- `command` (string): Command to execute
- `args` (array): Command arguments
- `options` (object): Execution options

**Options:**
- `cwd` (string): Working directory (default: `process.cwd()`)
- `env` (object): Environment variables (default: `process.env`)
- `detached` (boolean): Run detached process (default: `false`)
- `stdio` (string|array): Stdio configuration (default: `'pipe'`)
- `timeout` (number): Timeout in milliseconds (default: `null`)
- `logging` (boolean): Enable logging (default: `true`)

**Returns:** Promise resolving to result object

```javascript
const result = await runCommand('ls', ['-la'], {
  cwd: '/tmp',
  timeout: 5000,
  logging: true
});
```

### `runClaude(prompt, options)`

Execute Claude CLI with a prompt.

**Parameters:**
- `prompt` (string): The prompt to send to Claude
- `options` (object): Execution options

**Options:**
- `cwd` (string): Working directory
- `dangerouslySkipPermissions` (boolean): Skip permission prompts (default: `true`)
- `detached` (boolean): Run detached process (default: `false`)
- `fireAndForget` (boolean): Run in background mode (default: `false`)
- `logging` (boolean): Enable logging (default: `true`)
- `timeout` (number): Timeout in milliseconds

**Returns:** Promise resolving to result object

```javascript
// Synchronous execution
const result = await runClaude('Explain Node.js streams', {
  timeout: 30000
});

// Fire-and-forget mode
const task = await runClaude('Write a comprehensive report', {
  fireAndForget: true,
  cwd: './project-directory'
});
```

### `runClaudeTask(prompt, projectDir, options)`

Convenience function for running Claude tasks in specific directories.

```javascript
const task = await runClaudeTask(
  'Improve the code in this project',
  '/path/to/project',
  { logging: true }
);
```

### `testSimpleCommand(options)`

Run built-in test suite to verify functionality.

```javascript
const results = await testSimpleCommand({ logging: true });
console.log('Test results:', results);
```

## Usage Examples

### Basic Usage

```javascript
const { runClaude } = require('claude-code-spawn');

async function basicExample() {
  try {
    const result = await runClaude('What is the capital of France?');
    console.log('Claude response:', result.stdout);
  } catch (error) {
    console.error('Error:', error.message);
  }
}
```

### Fire-and-Forget Mode

```javascript
const { runClaudeTask } = require('claude-code-spawn');

async function backgroundTask() {
  const task = await runClaudeTask(
    'Analyze all files and create documentation',
    './my-project',
    { fireAndForget: true }
  );
  
  console.log('Documentation task started:', task.pid);
  // Continue with other work while Claude runs in background
}
```

### Web Development Workflow

```javascript
const { runClaudeTask } = require('claude-code-spawn');

async function improveWebsite() {
  // Start analysis
  const analysis = await runClaudeTask(
    'Analyze this website and suggest improvements',
    './website-project'
  );
  
  // Start improvements in parallel
  const improvement = await runClaudeTask(
    'Implement the suggested improvements',
    './website-project',
    { fireAndForget: true }
  );
  
  console.log('Website improvement started:', improvement.pid);
}
```

### Error Handling

```javascript
const { runClaude } = require('claude-code-spawn');

async function robustExecution() {
  try {
    const result = await runClaude('Complex analysis task', {
      timeout: 60000,  // 1 minute timeout
      logging: true
    });
    
    if (result.success) {
      console.log('Task completed successfully');
    }
  } catch (error) {
    if (error.message.includes('timed out')) {
      console.log('Task took too long, consider running in fire-and-forget mode');
    } else if (error.message.includes('Credit balance')) {
      console.log('Credit issue - try running outside Claude Code environment');
    } else {
      console.error('Unexpected error:', error.message);
    }
  }
}
```

## Environment Considerations

### Running Inside Claude Code

When running inside Claude Code environment, you may encounter "Credit balance is too low" errors. This is detected automatically and warnings are displayed.

**Solutions:**
1. Run from a regular terminal
2. Deploy to a server environment
3. Use `unset CLAUDECODE` before running

### Server Deployment

For production use, deploy to a server environment:

```bash
# Install dependencies
npm install claude-code-spawn

# Set up environment
export CLAUDE_API_KEY="your-api-key"

# Run your application
node your-app.js
```

## Testing

Run the built-in test suite:

```bash
npm test
```

Or run tests programmatically:

```javascript
const { testSimpleCommand } = require('claude-code-spawn');

async function runTests() {
  const results = await testSimpleCommand();
  console.log('Test results:', results);
}
```

## Examples

The package includes comprehensive examples:

```bash
# Basic usage
npm run example:basic

# Fire-and-forget mode
npm run example:fire-and-forget

# Web improvement workflow
npm run example:web-improvement
```

## Troubleshooting

### Common Issues

1. **"Command not found: claude"**
   - Install Claude CLI: `npm install -g @anthropic-ai/claude-code`

2. **"Credit balance is too low"**
   - Running inside Claude Code environment
   - Try from regular terminal or server

3. **Process hangs**
   - Use timeout option
   - Check stdio configuration

4. **Permission errors**
   - Ensure Claude CLI has proper permissions
   - Use `dangerouslySkipPermissions: true` option

### Debug Mode

Enable detailed logging:

```javascript
const result = await runClaude('test', {
  logging: true,
  stdio: 'pipe'  // To capture all output
});
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Run the test suite
5. Submit a pull request

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history.

## Links

- [GitHub Repository](https://github.com/bartkim0426/claude-code-spawn)
- [NPM Package](https://www.npmjs.com/package/claude-code-spawn)
- [Issues](https://github.com/bartkim0426/claude-code-spawn/issues)
- [Claude CLI Documentation](https://docs.anthropic.com/claude/docs/claude-cli)