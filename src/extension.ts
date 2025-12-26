import * as vscode from 'vscode';
import { EmbedEditor } from './providers/embedEditor';

let currentEditor: EmbedEditor | undefined;

/**
 * @param {vscode.ExtensionContext} context
 */
export function activate(context: vscode.ExtensionContext) {
  const openEditorCommand = vscode.commands.registerCommand(
    'discordEmbed.openEditor',
    () => {
      const editor = vscode.window.activeTextEditor;

      if (!currentEditor) {
        currentEditor = new EmbedEditor(context);
      }

      currentEditor.openEditor(context, editor?.document);
    }
  );

  const openFromSelectionCommand = vscode.commands.registerCommand(
    'discordEmbed.openEditorFromSelection',
    () => {
      const editor = vscode.window.activeTextEditor;

      if (!editor) {
        vscode.window.showErrorMessage('Please select code in an editor first.');
        return;
      }

      const selection = editor.selection;
      if (selection.isEmpty) {
        vscode.window.showWarningMessage('Please select some code to edit.');
        return;
      }

      if (!currentEditor) {
        currentEditor = new EmbedEditor(context);
      }

      currentEditor.openEditor(context, editor.document, selection);
    }
  );

  const insertTemplateCommand = vscode.commands.registerCommand(
    'discordEmbed.insertEmbed',
    async () => {
      const editor = vscode.window.activeTextEditor;

      if (!editor) {
        vscode.window.showErrorMessage('Please open a file first.');
        return;
      }

      const format = await vscode.window.showQuickPick(
        ['JSON', 'Discord.js', 'discord.py'],
        { placeHolder: 'Select format for the embed template' }
      );

      if (!format) return;

      const formatKey = format
        .toLowerCase()
        .replace('.js', 'js')
        .replace(' ', '') as 'json' | 'discordjs' | 'discordpy';

      const templates = {
        json: `{\n  "title": "New Embed",\n  "description": "Embed description here",\n  "color": 5793266\n}`,
        discordjs: `new EmbedBuilder()\n  .setTitle("New Embed")\n  .setDescription("Embed description here")\n  .setColor(5793266)`,
        discordpy: `embed = discord.Embed(\n    title="New Embed",\n    description="Embed description here",\n    color=5793266\n)`
      };

      const template = templates[formatKey];

      await editor.edit(editBuilder => {
        const position = editor.selection.active;
        editBuilder.insert(position, template);
      });

      vscode.window.showInformationMessage(
        `Embed template inserted (${format})`
      );
    }
  );

  const copyAsCommand = vscode.commands.registerCommand(
    'discordEmbed.copyAs',
    async () => {
      const editor = vscode.window.activeTextEditor;

      if (!editor) {
        vscode.window.showErrorMessage('Please open a file first.');
        return;
      }

      const selection = editor.selection;
      const text = editor.document.getText(selection);

      if (!text.trim()) {
        vscode.window.showWarningMessage('Please select some code first.');
        return;
      }

      vscode.window.showInformationMessage('Copy feature coming soon!');
    }
  );

  context.subscriptions.push(
    openEditorCommand,
    openFromSelectionCommand,
    insertTemplateCommand,
    copyAsCommand
  );
}

/**
 * cleans up extension resources
 */
export function deactivate() {
  if (currentEditor) {
    currentEditor = undefined;
  }
}
