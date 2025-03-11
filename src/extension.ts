// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as yaml from 'yaml';
import * as path from 'path';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "fastconfig" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand('fastconfig.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from fastconfig!');
	});

	// Register the update times command
	let updateTimesCommand = vscode.commands.registerCommand('fastconfig.updateTimes', async () => {
		try {
			// Get the workspace folder
			const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
			if (!workspaceFolder) {
				throw new Error('No workspace folder found');
			}

			// Read the config.yaml file
			const configPath = path.join(workspaceFolder.uri.fsPath, 'config.yaml');
			const configContent = fs.readFileSync(configPath, 'utf8');
			const config = yaml.parse(configContent);

			// Get current time
			const now = new Date();
			let currentHour = now.getHours();
			let currentMinute = now.getMinutes() + 1; // Start with current time + 1 minute

			// Update time fields for each source
			if (config.sources && Array.isArray(config.sources)) {
				config.sources.forEach((source: any, index: number) => {
					if (source.time && Array.isArray(source.time)) {
						// Handle minute overflow
						const adjustedHour = currentHour + Math.floor(currentMinute / 60);
						const adjustedMinute = currentMinute % 60;
						
						// First time is current + index minutes
						const time1 = `${(adjustedHour % 24).toString().padStart(2, '0')}:${adjustedMinute.toString().padStart(2, '0')}`;
						
						// Second time is 12 hours later
						const hour2 = (adjustedHour + 12) % 24;
						const time2 = `${hour2.toString().padStart(2, '0')}:${adjustedMinute.toString().padStart(2, '0')}`;
						
						source.time = [time1, time2];
						
						// Increment minute for next source
						currentMinute++;
					}
				});
			}

			// Write the updated config back to file
			fs.writeFileSync(configPath, yaml.stringify(config));
			vscode.window.showInformationMessage('Time fields updated successfully in config.yaml');
		} catch (error) {
			vscode.window.showErrorMessage(`Error updating times: ${error}`);
		}
	});

	context.subscriptions.push(disposable);
	context.subscriptions.push(updateTimesCommand);
}

// This method is called when your extension is deactivated
export function deactivate() {}
