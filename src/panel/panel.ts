import * as vscode from 'vscode';
import { ParticleType } from '../common/types';

/**
 * Manages particle coding webview panels
 */
export class ParticlePanel {
    /**
     * Track the currently panel. Only allow a single panel to exist at a time.
     */
    public static currentPanel: ParticlePanel | undefined;

    public static readonly viewType = 'particleCoding';

    private readonly _panel: vscode.WebviewPanel;
    private _particleType: ParticleType;
    private _disposables: vscode.Disposable[] = [];

    public static createOrShow(particleType: ParticleType) {
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;

        // If we already have a panel, show it.
        if (ParticlePanel.currentPanel) {
            if (ParticlePanel.currentPanel._particleType !== particleType) {
                ParticlePanel.currentPanel._particleType = particleType;
                ParticlePanel.currentPanel._update();
            }

            ParticlePanel.currentPanel._panel.reveal(column);
            return;
        }

        // Otherwise, create a new panel.
        const panel = vscode.window.createWebviewPanel(
            ParticlePanel.viewType,
            'Particle Coding',
            column || vscode.ViewColumn.One,
            {
                enableScripts: true
            }
        );

        ParticlePanel.currentPanel = new ParticlePanel(panel, particleType);
    }

    public static revive(panel: vscode.WebviewPanel, particleType: ParticleType) {
        ParticlePanel.currentPanel = new ParticlePanel(panel, particleType);
    }

    private constructor(
        panel: vscode.WebviewPanel,
        particleType: ParticleType,
    ) {
        this._panel = panel;
        this._particleType = particleType;

        // Set the webview's initial html content
        this._update();

        // Listen for when the panel is disposed
        // This happens when the user closes the panel or when the panel is closed programmatically
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

       // Handle messages from the webview
        this._panel.webview.onDidReceiveMessage(
            message => {
                switch (message.command) {
                    case 'alert':
                        vscode.window.showErrorMessage(message.text);
                        return;
                }
            },
            null,
            this._disposables
        );
    }

    public doRefactor() {
        // Send a message to the webview webview.
        // You can send any JSON serializable data.
        this._panel.webview.postMessage({ command: 'refactor' });
    }

    public dispose() {
        ParticlePanel.currentPanel = undefined;

        // Clean up our resources
        this._panel.dispose();

        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }

    private _update() {
        const webview = this._panel.webview;
        webview.html = this._getHtmlForWebview(webview);
    }

    private _getHtmlForWebview(webview: vscode.Webview) {
        // Local path to main script run in the webview
        // const scriptPathOnDisk = vscode.Uri.joinPath(this._extensionUri, 'media', 'main.js');

        // And the uri we use to load this script in the webview
        // const scriptUri = webview.asWebviewUri(scriptPathOnDisk);

        // Local path to css styles
        // const styleResetPath = vscode.Uri.joinPath(this._extensionUri, 'media', 'reset.css');
        // const stylesPathMainPath = vscode.Uri.joinPath(this._extensionUri, 'media', 'vscode.css');

        // Uri to load styles into webview
        // const stylesResetUri = webview.asWebviewUri(styleResetPath);
        // const stylesMainUri = webview.asWebviewUri(stylesPathMainPath);

        // Use a nonce to only allow specific scripts to be run
        // const nonce = getNonce();

        // return `<!DOCTYPE html>
        // 	<html lang="en">
        // 	<head>
        // 		<meta charset="UTF-8">

        // 		<!--
        // 			Use a content security policy to only allow loading images from https or from our extension directory,
        // 			and only allow scripts that have a specific nonce.
        // 		-->
        // 		<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; img-src ${webview.cspSource} https:; script-src 'nonce-${nonce}';">

        // 		<meta name="viewport" content="width=device-width, initial-scale=1.0">

        // 		<link href="${stylesResetUri}" rel="stylesheet">
        // 		<link href="${stylesMainUri}" rel="stylesheet">

        // 		<title>Cat Coding</title>
        // 	</head>
        // 	<body>
        // 		<img src="${particleGifPath}" width="300" />
        // 		<h1 id="lines-of-code-counter">0</h1>

        // 		<script nonce="${nonce}" src="${scriptUri}"></script>
        // 	</body>
        // 	</html>`;
        return `<!DOCTYPE html>
			<html lang="en">
			<body>
                <h1>"${this._particleType}"</h1>
			</body>
			</html>`;
    }
}

// function getNonce() {
//     let text = '';
//     const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
//     for (let i = 0; i < 32; i++) {
//         text += possible.charAt(Math.floor(Math.random() * possible.length));
//     }
//     return text;
// }
