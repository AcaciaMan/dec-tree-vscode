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
                webviewView.webview.postMessage({ command: "setTriesOption", currTry: iset.getCurrentTry() });
                break;
            case "selectTry":
                // Set the current try
                itries.setObjKey("current_try", message.text);
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

        //load html from file htmlShopConfig.html
        const fs = require('fs');
        const htmlPath = vscode.Uri.file(this._extensionUri.path + '/src/m_shop/htmlShopConfig.html');
        const html = fs.readFileSync(htmlPath.fsPath, 'utf8');


        return html.replace(
            /{{nonce}}/g,
            nonce
            ).replace(
                /{{styleUri}}/g,
                styleUri.toString()
                ).replace(
                    /{{scriptUri}}/g,
                    scriptUri.toString()
                    );
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

