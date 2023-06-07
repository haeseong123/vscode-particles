import * as vscode from 'vscode';
import { ParticleType } from '../common/types';
import { amongUs, confetti, fireworks, fruitShop, lights, snow, starryNight } from '../common/options';

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
        // If we already have a panel, show it.
        if (ParticlePanel.currentPanel) {
            const panelColumn = ParticlePanel.currentPanel._panel.viewColumn;
            const isActive = ParticlePanel.currentPanel._panel.active;

            if (
                particleType !== ParticlePanel.currentPanel._particleType
            ) {
                ParticlePanel.currentPanel._particleType = particleType;
                ParticlePanel.currentPanel._update();
            }

            ParticlePanel.currentPanel._panel.reveal(panelColumn, isActive);
            return;
        }

        // Otherwise, create a new panel.
        const panel = vscode.window.createWebviewPanel(
            ParticlePanel.viewType,
            'Particle Coding',
            vscode.ViewColumn.Two,
            {
                enableScripts: true,
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

    private _getParticleOptions(): string {
        switch (this._particleType) {
            case ParticleType.snow:
                return JSON.stringify(snow);
            case ParticleType.lights:
                return JSON.stringify(lights);
            case ParticleType.amongUs:
                return JSON.stringify(amongUs);
            case ParticleType.fruitShop:
                return JSON.stringify(fruitShop);
            case ParticleType.fireworks:
                return JSON.stringify(fireworks);
            case ParticleType.confetti:
                return JSON.stringify(confetti);
            case ParticleType.starryNight:
                return JSON.stringify(starryNight);
            default:
                return JSON.stringify(amongUs);
        }
    }

    private _getHtmlForWebview(webview: vscode.Webview) {
        // Convert a TypeScript value or object to a JSON string.
        const particleOptions = this._getParticleOptions();

        // Use a nonce to only allow specific scripts to be run
        const nonce = getNonce();

        return `<!DOCTYPE html>
        	<html lang="en">
                <head>
                    <meta charset="UTF-8">

                    <!-- Use a content security policy to only allow scripts that have a specific nonce. -->
                    <meta http-equiv="Content-Security-Policy" 
                          content="default-src 'none'; 
                                   img-src ${webview.cspSource} https:;
                                   script-src 'nonce-${nonce}' 'strict-dynamic';
                                   "
                    >

                    <meta name="viewport" content="width=device-width, initial-scale=1.0">

                    <title>Particles Coding</title>
                </head>
                <body>
                    <div id="tsparticles"></div>
                    <script nonce="${nonce}" src="https://cdn.jsdelivr.net/npm/tsparticles@2.0.6/tsparticles.bundle.min.js"></script>
                    <script nonce="${nonce}" type="text/javascript">
                        tsParticles.load("tsparticles", ${particleOptions});
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
