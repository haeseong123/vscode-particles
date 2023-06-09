// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as localize from '../common/localize';
import { ALL_PARTICLES, ParticleType } from '../common/types';
import { ParticlePanel } from '../panel/panel';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    // https://www.youtube.com/watch?v=5lBfKZoqaMA
    // https://www.youtube.com/watch?v=u8y2vCkZubk
    // https://github.com/microsoft/vscode-extension-samples/blob/main/webview-sample/README.md
    // https://medium.com/frontend-developers/vs-code-extension-%EA%B0%9C%EB%B0%9C%ED%95%98%EA%B8%B0-ae933343d2b5
    context.subscriptions.push(
        vscode.commands.registerCommand('vscode-particles.set-particle', async () => {
            const selectedParticleType = await vscode.window.showQuickPick(
                localize.stringListAsQuickPickItemList<ParticleType>(ALL_PARTICLES),
                {
                    placeHolder: vscode.l10n.t('Select a particle')
                }
            );
            if (selectedParticleType === undefined) {
                return;
            }

            ParticlePanel.createOrShow(selectedParticleType.value);
        })
    );
}
