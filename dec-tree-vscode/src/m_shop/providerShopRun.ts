import * as vscode from "vscode";
import { M_Settings } from "../m_settings/m_settings";
import M_App from "../m_app";
import { M_ShopPyCalls } from "./m_shop_py_calls";


export class ProviderShopRun implements vscode.WebviewViewProvider {
  public static readonly viewType = 'myExtension.shopRun';

    constructor(private readonly _extensionUri: vscode.Uri) {
        console.log("ProviderShopRun constructed!");
    }

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken
    ): void {
        console.log("ProviderShopRun resolveWebviewView!");
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri],
        };

        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
        let m_calls = new M_ShopPyCalls();
        const iset = M_Settings.getInstance();

        webviewView.webview.onDidReceiveMessage((message) => {
            switch (message.command) {
              case "analyse":
                // Call the analyse method of the M_ShopPyCalls class
                vscode.window.showInformationMessage(`Analysing...`);

                m_calls.analyse().then(async () => {
                  const filePath = vscode.Uri.file(
                    iset.getTryFolder() + "/yearly_sell.png"
                  );
                  await vscode.commands.executeCommand("vscode.open", filePath);
                });

                // close information message
                vscode.window.showInformationMessage(`Analysed!`);

                break;

              case "train":
                // Call the train method of the M_ShopPyCalls class
                vscode.window.showInformationMessage(`Loading...`);

                m_calls.train().then(() => {
                  vscode.workspace
                    .openTextDocument({
                      content: M_App.pyApp.channel.received_output,
                    })
                    .then((doc) => {
                      vscode.window.showTextDocument(doc);
                    });
                });

                // close information message
                vscode.window.showInformationMessage(`Trained!`);

                break;
              case "plot":
                // This will plot the decision tree
                vscode.window.showInformationMessage(`Plotting...`);

                m_calls.plot_tree().then(async () => {
                  const filePath = vscode.Uri.file(
                    iset.getTryFolder() + "/decision_tree.png"
                  );
                  await vscode.commands.executeCommand("vscode.open", filePath);
                });

                break;

              case "importance":
                // Call the plot_importance method of the M_Classifier class
                // This will plot the feature importance
                vscode.window.showInformationMessage(`Plotting importance...`);
                m_calls.plot_importance().then(async () => {
                  const filePath = vscode.Uri.file(
                    iset.getTryFolder() + "/feature_importance.png"
                  );
                  await vscode.commands.executeCommand("vscode.open", filePath);
                });
                break;
            }
            }
        );
    }

    private _getHtmlForWebview(webview: vscode.Webview) {
        // Local path to main script run in the webview
        const scriptPathOnDisk = vscode.Uri.file(
          this._extensionUri.path + "/media/main.js"
        );
        const scriptUri = scriptPathOnDisk.with({ scheme: "vscode-resource" });

        // Local path to css styles
        const stylePathOnDisk = vscode.Uri.file(
          this._extensionUri.path + "/media/styles.css"
        );
        const styleUri = stylePathOnDisk.with({ scheme: "vscode-resource" });

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
            <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src https: data:; style-src 'unsafe-inline' ${webview.cspSource}; script-src 'nonce-${nonce}';">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link href="${styleUri}" rel="stylesheet">
            <title>Shop Run</title>
        </head>
        <body>
            <h1>Shop Run</h1>
            <p>Click the buttons to run the shop.</p>
            <br>
            <button id="analyseButton">Analyse</button>
            <br>
        <button id="loadButton">Train</button>
        <button id="plotButton">Decision Tree</button>
        <button id="importanceButton">Feature Importance</button>
            <script nonce="${nonce}">
                const vscode = acquireVsCodeApi();
                document.getElementById('analyseButton').addEventListener('click', () => {
                    vscode.postMessage({ command: 'analyse' });
                });
                document.getElementById('loadButton').addEventListener('click', () => {
                    vscode.postMessage({ command: 'train' });
                });

                document.getElementById('plotButton').addEventListener('click', () => {
                    vscode.postMessage({ command: 'plot' });
                });

                document.getElementById('importanceButton').addEventListener('click', () => {
                    vscode.postMessage({ command: 'importance' });
                });
            

            </script>
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
