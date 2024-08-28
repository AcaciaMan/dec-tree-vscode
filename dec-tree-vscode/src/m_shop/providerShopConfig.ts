import * as vscode from "vscode";
import { M_Classifier } from "../m_classifier/m_classifier";
import { M_Settings } from "../m_settings/m_settings";
import M_App from "../m_app";
import { M_ShopPyCalls } from "./m_shop_py_calls";


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
        let m_calls = new M_ShopPyCalls();
        const iset = M_Settings.getInstance();

        webviewView.webview.onDidReceiveMessage((message) => {
            switch (message.command) {
                case "openJson":
                    vscode.window.showInformationMessage(`Opening Json...`);
                    //open message.text that contains json in new tab

                    const jsondata = message.text;
                    const filePath = vscode.Uri.file(iset.obj["rootFolder"] + "/shop-config.json");
                    //vscode.workspace.fs.writeFile(filePath,
                    //    new TextEncoder().encode(jsondata)
                    //);
                    vscode.commands.executeCommand("vscode.open", filePath);

                    break;
                case "loadJson":
                    vscode.window.showInformationMessage(`Loading Json...`);
                    //load json from file shop-config.json
                    const filePath2 = vscode.Uri.file(iset.obj["rootFolder"] + "/shop-config.json");
                    vscode.workspace.fs.readFile(filePath2).then(
                        (data) => {
                            //const jsondata = new TextDecoder().decode(data);
                            
                            //assign data to iset object 'shop-config' 
                            iset.addSetting("shop-config", JSON.parse(new TextDecoder().decode(data)));
                            
                        }
                    );
                    break;
                case "generate":
                    vscode.window.showInformationMessage(`Generating...`);
                    //generate data
                    
                    m_calls.generateData().then(() => {
                        vscode.window.showInformationMessage(`Generated!`);
                    });
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
            <button id="loadJson">Load Json</button>
            <button id="generate">Generate Data</button>
            <script nonce="${nonce}">
                const vscode = acquireVsCodeApi();
                document.getElementById('openJson').addEventListener('click', () => {
                    const jsondata = document.getElementById('jsondata').value;
                    vscode.postMessage({ command: 'openJson', text: jsondata });
                });
                document.getElementById('loadJson').addEventListener('click', () => {
                    vscode.postMessage({ command: 'loadJson' });
                });
                document.getElementById('generate').addEventListener('click', () => {
                    vscode.postMessage({ command: 'generate' });
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

