import * as vscode from "vscode";
import { M_Classifier } from "../m_classifier/m_classifier";
import { M_Settings } from "../m_settings/m_settings";
import M_App from "../m_app";
import { M_ShopPyCalls } from "./m_shop_py_calls";
import { M_TryConfig } from "../m_settings/m_try_config";


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
      const itries = M_TryConfig.getInstance();

      //add tries names to drop down list
      const tries = itries.getTries();
      //print tries names
        console.log(tries);

      //make array from dictionary keys
        const arrTries = Object.keys(tries);


      webviewView.webview.onDidReceiveMessage((message) => {
        switch (message.command) {
          case "openJson":
            vscode.window.showInformationMessage(`Opening Json...`);
            //open message.text that contains json in new tab

            const jsondata = message.text;
            const filePath = vscode.Uri.file(
              iset.obj["rootFolder"] + "/shop-config.json"
            );
            //vscode.workspace.fs.writeFile(filePath,
            //    new TextEncoder().encode(jsondata)
            //);
            vscode.commands.executeCommand("vscode.open", filePath);

            break;
          case "loadJson":
            vscode.window.showInformationMessage(`Loading Json...`);
            //load json from file shop-config.json
            itries.loadObj();
            iset.addSetting("shop-config", itries.obj);
            break;
          case "saveJson":
            vscode.window.showInformationMessage(`Saving Json...`);
            //save json to file shop-config.json
            itries.saveObj();
            break;
          case "generate":
            vscode.window.showInformationMessage(`Generating...`);
            //generate data

            m_calls.generateData().then(() => {
              vscode.window.showInformationMessage(`Generated!`);
            });
            break;
            case "webviewLoaded":
                // Send data to the webview
                webviewView.webview.postMessage({ command: "setTries", arrTries });
                break;
        }
      });
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
            <link href="${styleUri}" type="text/css" rel="stylesheet">
            <title>Shop Config</title>
        </head>
        <body>
            <h1>Shop Config</h1>
<!-- Add text box to enter json data
-->
            
            <!-- add posibility to open enetered json data in new tab -->
            <button id="openJson">Open Json</button>
            <button id="loadJson">Load Json</button>
            <button id="saveJson">Save Json</button>
            <br>
            <button id="generate">Generate Data</button>
            <br>

            
            <!-- add drop down list with tries names from M_TryConfig getTries() dictionary -->
            <select id="triesDropdown">
                <option value="0">Select...</option>
            </select>


            
            <br>
            <textarea id="jsondata" rows="10" cols="50"></textarea>
            <script nonce="${nonce}">
                const vscode = acquireVsCodeApi();
                document.getElementById('openJson').addEventListener('click', () => {
                    const jsondata = document.getElementById('jsondata').value;
                    vscode.postMessage({ command: 'openJson', text: jsondata });
                });
                document.getElementById('loadJson').addEventListener('click', () => {
                    vscode.postMessage({ command: 'loadJson' });
                });
                document.getElementById('saveJson').addEventListener('click', () => {
                    vscode.postMessage({ command: 'saveJson' });
                });
                document.getElementById('generate').addEventListener('click', () => {
                    vscode.postMessage({ command: 'generate' });
                    console.log("generate clicked");
                });

                //add tries names to drop down list
  window.addEventListener('message', event => {
    const message = event.data;

    switch (message.command) {
      case 'setTries':
        const triesDropdown = document.getElementById('triesDropdown');
        triesDropdown.innerHTML = '';
        message.arrTries.forEach(tryName => {
          const option = document.createElement('option');
          option.value = tryName;
          option.text = tryName;
          triesDropdown.add(option);
          console.log("try added");
    });




        //refresh dropdown list
        triesDropdown.value = '0';

        //add event listener to dropdown list
        triesDropdown.addEventListener('change', () => {
          const selectedTry = triesDropdown.options[triesDropdown.selectedIndex].text;
          vscode.postMessage({ command: 'selectTry', text: selectedTry });
        });

        //print tries names
        console.log(message.tries);
        
        break;
    }
    });

            // Notify the extension that the webview is loaded
            window.addEventListener('DOMContentLoaded', () => {
                vscode.postMessage({ command: 'webviewLoaded' });
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

