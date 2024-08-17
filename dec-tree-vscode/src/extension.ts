// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

import M_Config from './m_config';

import { MyViewProvider } from "./myViewProvider";
import M_App from './m_app';
import { M_Settings } from './m_settings/m_settings';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "dec-tree-vscode" is now active!');
	console.log("Something", vscode.workspace.workspaceFolders?.[0].uri.fsPath);
    console.log(M_Config.getString(M_Config.pyPath,""))
    
    const setInst = M_Settings.getInstance();
	const rootFolder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || 'c:/tmp';
	setInst.addSetting("rootFolder", rootFolder);


	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand('dec-tree-vscode.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from dec-tree-vscode!');
	});

	context.subscriptions.push(disposable);

  const provider = new MyViewProvider(context.extensionUri);
  const viewDisposable = vscode.window.registerWebviewViewProvider(
	MyViewProvider.viewType,
	provider
  );
  context.subscriptions.push(viewDisposable );

  console.log(viewDisposable);

}

// This method is called when your extension is deactivated
export function deactivate() {
	M_App.pyApp.destroy();
}
