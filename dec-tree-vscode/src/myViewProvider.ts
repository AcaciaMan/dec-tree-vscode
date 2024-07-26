import * as vscode from "vscode";

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

    webviewView.webview.onDidReceiveMessage((message) => {
      switch (message.command) {
        case "execute":
          vscode.window.showInformationMessage(`Executing: ${message.text}`);
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
        <script nonce="${nonce}">
          const vscode = acquireVsCodeApi();
          document.getElementById('executeButton').addEventListener('click', () => {
            const inputText = document.getElementById('inputText').value;
            vscode.postMessage({ command: 'execute', text: inputText });
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