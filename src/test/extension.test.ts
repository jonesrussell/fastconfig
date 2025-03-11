import * as assert from 'assert';
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'yaml';
import * as os from 'os';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
// import * as myExtension from '../../extension';

suite('FastConfig Extension Test Suite', () => {
	const testWorkspacePath = path.join(os.tmpdir(), 'fastconfig-test');
	const sourcesPath = path.join(testWorkspacePath, 'sources.yml');

	suiteSetup(async () => {
		// Create test workspace
		if (!fs.existsSync(testWorkspacePath)) {
			fs.mkdirSync(testWorkspacePath, { recursive: true });
		}
	});

	setup(() => {
		// Create a test sources.yml before each test
		const testConfig = {
			sources: [
				{
					name: "Source 1",
					time: ["10:00", "22:00"]
				},
				{
					name: "Source 2",
					time: ["10:01", "22:01"]
				}
			]
		};
		fs.writeFileSync(sourcesPath, yaml.stringify(testConfig));
	});

	teardown(() => {
		// Clean up test file after each test
		if (fs.existsSync(sourcesPath)) {
			fs.unlinkSync(sourcesPath);
		}
	});

	suiteTeardown(() => {
		// Clean up test workspace
		if (fs.existsSync(testWorkspacePath)) {
			fs.rmdirSync(testWorkspacePath, { recursive: true });
		}
	});

	test('Extension should be present', () => {
		assert.ok(vscode.extensions.getExtension('fastconfig'));
	});

	test('Should update times in sources.yml', async () => {
		// Open the test workspace
		await vscode.commands.executeCommand('vscode.openFolder', vscode.Uri.file(testWorkspacePath));
		
		// Set a fixed time for testing
		const testDate = new Date('2024-01-01T14:30:00');
		const originalDateNow = Date.now;
		Date.now = () => testDate.getTime();

		try {
			// Execute the command
			await vscode.commands.executeCommand('fastconfig.updateTimes');

			// Read the updated file
			const updatedContent = fs.readFileSync(sourcesPath, 'utf8');
			const updatedConfig = yaml.parse(updatedContent);

			// Verify the times were updated correctly
			assert.ok(updatedConfig.sources);
			assert.strictEqual(updatedConfig.sources.length, 2);

			// First source should be current time + 1 minute
			assert.deepStrictEqual(updatedConfig.sources[0].time, ['14:31', '02:31']);

			// Second source should be current time + 2 minutes
			assert.deepStrictEqual(updatedConfig.sources[1].time, ['14:32', '02:32']);
		} finally {
			// Restore original Date.now
			Date.now = originalDateNow;
		}
	});

	test('Should handle minute overflow', async () => {
		// Open the test workspace
		await vscode.commands.executeCommand('vscode.openFolder', vscode.Uri.file(testWorkspacePath));
		
		// Set time to 14:59 to test minute overflow
		const testDate = new Date('2024-01-01T14:59:00');
		const originalDateNow = Date.now;
		Date.now = () => testDate.getTime();

		try {
			await vscode.commands.executeCommand('fastconfig.updateTimes');

			const updatedContent = fs.readFileSync(sourcesPath, 'utf8');
			const updatedConfig = yaml.parse(updatedContent);

			// First source should roll over to next hour
			assert.deepStrictEqual(updatedConfig.sources[0].time, ['15:00', '03:00']);

			// Second source should be one minute later
			assert.deepStrictEqual(updatedConfig.sources[1].time, ['15:01', '03:01']);
		} finally {
			Date.now = originalDateNow;
		}
	});

	test('Should handle hour overflow', async () => {
		// Open the test workspace
		await vscode.commands.executeCommand('vscode.openFolder', vscode.Uri.file(testWorkspacePath));
		
		// Set time to 23:59 to test hour overflow
		const testDate = new Date('2024-01-01T23:59:00');
		const originalDateNow = Date.now;
		Date.now = () => testDate.getTime();

		try {
			await vscode.commands.executeCommand('fastconfig.updateTimes');

			const updatedContent = fs.readFileSync(sourcesPath, 'utf8');
			const updatedConfig = yaml.parse(updatedContent);

			// First source should roll over to next day
			assert.deepStrictEqual(updatedConfig.sources[0].time, ['00:00', '12:00']);

			// Second source should be one minute into next day
			assert.deepStrictEqual(updatedConfig.sources[1].time, ['00:01', '12:01']);
		} finally {
			Date.now = originalDateNow;
		}
	});

	test('Should handle missing sources array', async () => {
		// Create invalid config
		const invalidConfig = { notSources: [] };
		fs.writeFileSync(sourcesPath, yaml.stringify(invalidConfig));

		await vscode.commands.executeCommand('vscode.openFolder', vscode.Uri.file(testWorkspacePath));
		
		// The command should execute without error
		await vscode.commands.executeCommand('fastconfig.updateTimes');

		// File should remain unchanged
		const updatedContent = fs.readFileSync(sourcesPath, 'utf8');
		const updatedConfig = yaml.parse(updatedContent);
		assert.deepStrictEqual(updatedConfig, invalidConfig);
	});
});
