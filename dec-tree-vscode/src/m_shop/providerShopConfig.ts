import * as vscode from "vscode";
import { M_Classifier } from "../m_classifier/m_classifier";
import { M_Settings } from "../m_settings/m_settings";
import M_App from "../m_app";


export class ProviderShopConfig implements vscode.WebviewViewProvider {
  public static readonly viewType = 'myExtension.shopConfig';

    constructor(private readonly _extensionUri: vscode.Uri) {
        console.log("ProviderShopConfig constructed!");
    }

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken
    ): void {
        console.log("ProviderShopConfig resolveWebviewView!");
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri],
        };

        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
        let m_classifier = new M_Classifier();
        const iset = M_Settings.getInstance();

        webviewView.webview.onDidReceiveMessage((message) => {
            switch (message.command) {
                case "execute":
                    vscode.window.showInformationMessage(`Executing: ${message.text}`);
                    break;
                case "load":
                    // Call the __call__ method of the M_Classifier class
                    // This will load the data and train the model
                    vscode.window.showInformationMessage(`Loading...`);

                    m_classifier.__call__().then(() => {
                        vscode.workspace.openTextDocument({ content: M_App.pyApp.channel.received_output }).then((doc) => {
                            vscode.window.showTextDocument(doc);
                        });
                    });

                    // close information message
                    vscode.window.showInformationMessage(`Loaded!`);

                    break;
                case "plot":
                    // Call the plot_tree method of the M_Classifier class
                    // This will plot the decision tree
                    vscode.window.showInformationMessage(`Plotting...`);

                    m_classifier.plot_tree().then(async () => {
                        const filePath = vscode.Uri.file(iset.obj["rootFolder"] + "/decision_tree.png");
                        await vscode.commands.executeCommand("vscode.open", filePath);
                    });

                    break;
                case "importance":
                    // Call the plot_importance method of the M_Classifier class
                    // This will plot the feature importance
                    vscode.window.showInformationMessage(`Plotting importance...`);

                    m_classifier.plot_importance().then(async () => {
                        const filePath = vscode.Uri.file(iset.obj["rootFolder"] + "/feature_importance.png");
                        await vscode.commands.executeCommand("vscode.open", filePath);
                    });

                    break;
                case "openJson":
                    vscode.window.showInformationMessage(`Opening Json...`);
                    //open message.text that contains json in new tab

                    const jsondata = message.text;
                    const filePath = vscode.Uri.file(iset.obj["rootFolder"] + "/shop-config.json");
                    vscode.workspace.fs.writeFile(filePath,
                        new TextEncoder().encode(jsondata)
                    );
                    vscode.commands.executeCommand("vscode.open", filePath);

                    break;
                case "saveJson":
                    vscode.window.showInformationMessage(`Saving Json...`);
                    break;
                case "loadJson":
                    vscode.window.showInformationMessage(`Loading Json...`);
                    break;
                case "sendJson":
                    vscode.window.showInformationMessage(`Sending Json...`);
                    break;


    }
    }
    );
    }

    private _getHtmlForWebview(webview: vscode.Webview): string {
        // Local path to main script run in the webview
        const scriptPathOnDisk = vscode.Uri.file(this._extensionUri.path + '/media/main.js');
        const scriptUri = scriptPathOnDisk.with({ scheme: 'vscode-resource' });

        // Local path to css styles
        const stylePathOnDisk = vscode.Uri.file(this._extensionUri.path + '/media/styles.css');
        const styleUri = stylePathOnDisk.with({ scheme: 'vscode-resource' });

        // Use a nonce to whitelist which scripts can be run
        const nonce = getNonce();

        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <!--
                Use a content security policy to only allow loading images from https or from our extension directory,
                and only allow scripts that have a specific nonce.
            -->
            <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src https: data: vscode-resource:; script-src 'nonce-${nonce}'; style-src vscode-resource: 'unsafe-inline';">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link href="${styleUri}" rel="stylesheet">
            <title>Shop Config</title>
        </head>
        <body>
            <h1>Shop Config</h1>
<!-- Add text box to enter json data
-->
            <textarea id="jsondata" rows="10" cols="50"></textarea>
            <!-- add posibility to open enetered json data in new tab -->
            <button id="openJson">Open Json</button>
            <button id="saveJson">Save Json</button>
            <button id="loadJson">Load Json</button>
            <button id="sendJson">Send Json</button>
            <br>
            <button id="executeButton">Execute</button>
            <br>
            <button id="loadButton">Load</button>
            <button id="plotButton">Decision Tree</button>
            <button id="importanceButton">Feature Importance</button>
            <script nonce="${nonce}">
                const vscode = acquireVsCodeApi();
                document.getElementById('executeButton').addEventListener('click', () => {
                    const inputText = document.getElementById('inputText').value;
                    vscode.postMessage({ command: 'execute', text: inputText });
                });
                document.getElementById('openJson').addEventListener('click', () => {
                    const jsondata = document.getElementById('jsondata').value;
                    vscode.postMessage({ command: 'openJson', text: jsondata });
                });
                document.getElementById('saveJson').addEventListener('click', () => {
                    const jsondata = document.getElementById('jsondata').value;
                    vscode.postMessage({ command: 'saveJson', text: jsondata });
                });
                document.getElementById('loadJson').addEventListener('click', () => {
                    vscode.postMessage({ command: 'loadJson' });
                });
                document.getElementById('sendJson').addEventListener('click', () => {
                    const jsondata = document.getElementById('jsondata').value;
                    vscode.postMessage({ command: 'sendJson', text: jsondata });
                });
                document.getElementById('loadButton').addEventListener('click', () => {
                    vscode.postMessage({ command: 'load' });
                });
                document.getElementById('plotButton').addEventListener('click', () => {
                    vscode.postMessage({ command: 'plot' });
                });
                document.getElementById('importanceButton').addEventListener('click', () => {
                    vscode.postMessage({ command: 'importance' });
                });
            </script>

            <script nonce="${nonce}" src="${scriptUri}"></script>
        </body>
        </html>`;
    }

}

function getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

