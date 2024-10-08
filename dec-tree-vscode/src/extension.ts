// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

import M_Config from './m_config';

import { MyViewProvider } from "./myViewProvider";
import M_App from './m_app';
import { M_Settings } from './m_settings/m_settings';
import { ProviderShopConfig } from './m_shop/providerShopConfig';
import { ProviderShopRun } from './m_shop/providerShopRun';
import { M_TryConfig } from './m_settings/m_try_config';


// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "dec-tree-vscode" is now active!');
	console.log("Something", vscode.workspace.workspaceFolders?.[0].uri.fsPath);
    console.log(M_Config.getString(M_Config.pyPath,""))
    
    const iset = M_Settings.getInstance();
	const rootFolder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || 'c:/tmp';
	iset.addSetting("rootFolder", rootFolder);

	const itries = M_TryConfig.getInstance();
	vscode.window.showInformationMessage(`Loading shop config...`);
	//load json from file shop-config.json
	itries.loadObj();
	iset.addSetting("shop-config", itries.obj);

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

  // add providerShopConfig
  const providerShopConfig = new ProviderShopConfig(context.extensionUri);
  const viewDisposableShopConfig = vscode.window.registerWebviewViewProvider(
    ProviderShopConfig.viewType,
    providerShopConfig
  );
  context.subscriptions.push(viewDisposableShopConfig);

  // add providerShopRun
  const providerShopRun = new ProviderShopRun(context.extensionUri);
  const viewDisposableShopRun = vscode.window.registerWebviewViewProvider(
	ProviderShopRun.viewType,
	providerShopRun
  );
  context.subscriptions.push(viewDisposableShopRun);
  


}

// This method is called when your extension is deactivated
export function deactivate() {
	const itries = M_TryConfig.getInstance();
	itries.saveObj();
	M_App.pyApp.destroy();
}
