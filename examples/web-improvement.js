/**
 * Web improvement example for claude-code-spawn
 * Demonstrates using Claude for website enhancement tasks
 */

const { runClaudeTask, runCommand } = require('../index');
const path = require('path');
const fs = require('fs').promises;

async function webImprovementExample() {
  console.log('=== Web Improvement Example ===\n');

  // Create a temporary directory for this example
  const exampleDir = path.join(process.cwd(), 'temp-web-example');
  
  try {
    // 1. Setup example project
    console.log('1. Setting up example web project...');
    await setupExampleProject(exampleDir);
    console.log('✓ Example project created');

    console.log('\n---\n');

    // 2. Analyze the project
    console.log('2. Starting Claude analysis task...');
    const analysisPrompt = `
Please analyze the web project in the current directory and provide suggestions for improvement.

Tasks:
1. Review the HTML structure in index.html
2. Examine the CSS styles in style.css
3. Suggest improvements for:
   - Accessibility
   - Performance
   - Modern design patterns
   - Code organization

Please provide specific, actionable recommendations.
    `.trim();

    try {
      const analysisResult = await runClaudeTask(analysisPrompt, exampleDir, {
        logging: true
      });
      
      console.log('✓ Claude analysis started successfully');
      console.log('Analysis PID:', analysisResult.pid);
      
    } catch (error) {
      console.error('✗ Failed to start analysis:', error.message);
      if (error.message.includes('Credit balance')) {
        console.log('  💡 This error suggests running inside Claude Code environment');
        console.log('     For production use, deploy to a server environment');
      }
    }

    console.log('\n---\n');

    // 3. Start improvement task
    console.log('3. Starting Claude improvement task...');
    const improvementPrompt = `
Please improve the web project in the current directory:

1. Enhance the HTML structure with semantic elements
2. Improve the CSS with modern techniques
3. Add responsive design features
4. Implement accessibility improvements
5. Optimize for performance

Make the website more modern and user-friendly while keeping the same basic content.
Save your changes to the existing files.
    `.trim();

    try {
      const improvementResult = await runClaudeTask(improvementPrompt, exampleDir, {
        logging: true
      });
      
      console.log('✓ Claude improvement started successfully');
      console.log('Improvement PID:', improvementResult.pid);
      
    } catch (error) {
      console.error('✗ Failed to start improvement:', error.message);
    }

    console.log('\n---\n');

    // 4. Monitor progress
    console.log('4. Example project location:', exampleDir);
    console.log('   You can monitor the changes to files in this directory');
    console.log('   Claude will modify the files as the tasks complete');

  } catch (error) {
    console.error('Setup failed:', error.message);
  }

  console.log('\n💡 Tips for web improvement tasks:');
  console.log('   • Provide clear, specific instructions');
  console.log('   • Include project structure information');
  console.log('   • Specify output requirements');
  console.log('   • Use fire-and-forget mode for long tasks');

  console.log('\n=== Example Complete ===');
  console.log('Note: Claude tasks are running in background');
  console.log('Check the files in:', exampleDir);
}

async function setupExampleProject(projectDir) {
  // Create directory
  await fs.mkdir(projectDir, { recursive: true });

  // Create a simple HTML file
  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Example Website</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">
        <h1>Welcome to My Website</h1>
        <p>This is a simple example website that needs improvement.</p>
        <div class="content">
            <h2>About Us</h2>
            <p>We are a company that does great things.</p>
            <button>Contact Us</button>
        </div>
    </div>
</body>
</html>`;

  // Create a simple CSS file
  const cssContent = `body {
    font-family: Arial, sans-serif;
    margin: 0;
    padding: 20px;
}

.container {
    max-width: 800px;
    margin: 0 auto;
}

h1 {
    color: #333;
}

.content {
    background: #f5f5f5;
    padding: 20px;
    margin: 20px 0;
}

button {
    background: #007cba;
    color: white;
    padding: 10px 20px;
    border: none;
    cursor: pointer;
}`;

  // Write files
  await fs.writeFile(path.join(projectDir, 'index.html'), htmlContent);
  await fs.writeFile(path.join(projectDir, 'style.css'), cssContent);

  // Create a README for the project
  const readmeContent = `# Example Web Project

This is a simple website created for testing Claude improvement capabilities.

## Files:
- index.html: Main HTML structure
- style.css: Basic styling

## Improvement Goals:
- Better accessibility
- Modern design
- Responsive layout
- Performance optimization
`;

  await fs.writeFile(path.join(projectDir, 'README.md'), readmeContent);
}

// Cleanup function
async function cleanupExample() {
  const exampleDir = path.join(process.cwd(), 'temp-web-example');
  try {
    await fs.rmdir(exampleDir, { recursive: true });
    console.log('✓ Cleaned up example directory');
  } catch (error) {
    console.log('Note: Example directory may still exist at:', exampleDir);
  }
}

// Run the example
if (require.main === module) {
  webImprovementExample().catch(console.error);
}

module.exports = { webImprovementExample, setupExampleProject, cleanupExample };