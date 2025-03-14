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

	// Register the update times command
	let updateTimesCommand = vscode.commands.registerCommand('fastconfig.updateTimes', async () => {
		try {
			// Get the workspace folder
			const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
			if (!workspaceFolder) {
				throw new Error('No workspace folder found');
			}

			// Read the sources.yml file
			const sourcesPath = path.join(workspaceFolder.uri.fsPath, 'sources.yml');
			const sourcesContent = fs.readFileSync(sourcesPath, 'utf8');
			const config = yaml.parse(sourcesContent);

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
			fs.writeFileSync(sourcesPath, yaml.stringify(config));
			vscode.window.showInformationMessage('Time fields updated successfully in sources.yml');
		} catch (error) {
			vscode.window.showErrorMessage(`Error updating times: ${error}`);
		}
	});

	context.subscriptions.push(updateTimesCommand);
}

// This method is called when your extension is deactivated
export function deactivate() {}
