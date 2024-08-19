import * as vscode from "vscode";
import { M_Classifier } from "./m_classifier/m_classifier"; // Import the M_Classifier class
import M_App from "./m_app";
import { M_Settings } from "./m_settings/m_settings";

export class MyViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'myExtension.myWebview';

  constructor(private readonly _extensionUri: vscode.Uri) {
    console.log("MyViewProvider constructed!");
  }

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ): void {
    console.log("MyViewProvider resolveWebviewView!");
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
          }
          );
          }
          );

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
    }
  );
          
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
      }
    });
  }

  private _getHtmlForWebview(webview: vscode.Webview): string {
    const nonce = getNonce();
    console.log("MyViewProvider GetHtml!");
    return `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>My Webview</title>
      </head>
      <body>
        <input type="text" id="inputText" placeholder="Enter text here">
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
      </body>
      </html>`;
  }
}

function getNonce() {
  let text = "";
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}