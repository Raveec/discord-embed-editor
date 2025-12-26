import * as vscode from "vscode";
import * as path from "path";
import { EditorState } from "../types/embed";
import { EmbedFormatter } from "../formatters";
import { CodeParser } from "../parsers";
import { TemplateManager } from "../webview/template-manager";

/**
 * @class EmbedEditor
 * manages the Discord Embed editor webview lifecycle and state
 */
export class EmbedEditor {
  private panel: vscode.WebviewPanel | undefined;
  private context: vscode.ExtensionContext;
  private currentState: EditorState;
  private document: vscode.TextDocument | undefined;
  private selection: vscode.Selection | undefined;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
    this.currentState = {
      embed: {},
      format: "json",
    };
  }

  /**
   * opens or reveals the embed editor webview
   *
   * @param {vscode.ExtensionContext} context
   * @param {vscode.TextDocument} [document]
   * @param {vscode.Selection} [selection]
   */
  openEditor(
    context: vscode.ExtensionContext,
    document?: vscode.TextDocument,
    selection?: vscode.Selection
  ) {
    this.document = document;
    this.selection = selection;

    this.parseSelection(document, selection);

    const activeEditor = vscode.window.activeTextEditor;
    const columnToShowIn = activeEditor
      ? vscode.ViewColumn.Beside
      : vscode.ViewColumn.One;

    if (this.panel) {
      this.panel.reveal(columnToShowIn, true);
      this.sendInitialState();
      return;
    }

    this.panel = vscode.window.createWebviewPanel(
      "discordEmbedEditor",
      "Discord Embed Editor",
      { viewColumn: columnToShowIn, preserveFocus: false },
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [
          vscode.Uri.file(path.join(context.extensionPath, "src", "webview")),
        ],
      }
    );

    this.panel.webview.html = this.getWebviewContent();

    this.panel.webview.onDidReceiveMessage(async (message) => {
      await this.handleWebviewMessage(message);
    });

    this.panel.onDidDispose(
      () => {
        this.panel = undefined;
      },
      null,
      context.subscriptions
    );
  }

  /**
   * parses the current editor selection into an embed state
   *
   * @param {vscode.TextDocument} [document]
   * @param {vscode.Selection} [selection]
   */
  private parseSelection(
    document?: vscode.TextDocument,
    selection?: vscode.Selection
  ) {
    if (!document) {
      this.currentState = {
        embed: {},
        format: "json",
      };
      return;
    }

    let text = "";
    let format: "json" | "discord.js" | "discord.py" = "json";

    if (selection && !selection.isEmpty) {
      text = document.getText(selection);
    }

    const fileExt = path.extname(document.fileName).toLowerCase();

    if (
      fileExt === ".js" ||
      fileExt === ".ts" ||
      fileExt === ".jsx" ||
      fileExt === ".tsx"
    ) {
      format = "discord.js";
    } else if (fileExt === ".py") {
      format = "discord.py";
    }

    if (text.trim()) {
      const parsedEmbed = CodeParser.parse(text, format);

      if (parsedEmbed) {
        this.currentState = {
          embed: parsedEmbed,
          format,
          sourceFile: document.fileName,
          selection: selection
            ? {
                start: selection.start.line,
                end: selection.end.line,
              }
            : undefined,
        };
        return;
      }
    }

    this.currentState = {
      embed: {},
      format,
    };
  }

  /**
   * @returns {string} Webview HTML content
   */
  private getWebviewContent(): string {
    return TemplateManager.getWebviewHtml(
      this.currentState.embed,
      this.currentState.format,
      this.context.extensionPath
    );
  }

  /**
   * sends the initial state and generated code to the webview
   */
  private sendInitialState() {
    if (!this.panel) return;

    this.panel.webview.postMessage({
      type: "updateState",
      data: {
        embed: this.currentState.embed,
        format: this.currentState.format,
      },
    });

    this.sendCode();
  }

  /**
   * handles messages received from the webview
   *
   * @param {any} message
   */
  private async handleWebviewMessage(message: any) {
    switch (message.type) {
      case "updateEmbed":
        this.currentState.embed = message.data.embed;
        this.sendCode();
        break;

      case "changeFormat":
        this.currentState.format = message.data.format;
        this.sendCode();
        break;

      case "requestCode":
        this.sendCode();
        break;

      case "copyToClipboard":
        await vscode.env.clipboard.writeText(message.data.code);
        this.showNotification("Code copied to clipboard!");
        break;

      case "applyToFile":
        await this.applyToFile(message.data.code, message.data.format);
        break;

      case "closeEditor":
        if (this.panel) {
          this.panel.dispose();
        }
        break;
    }
  }

  /**
   * generates embed code and sends it to the webview
   */
  private sendCode() {
    if (!this.panel) return;

    const code = EmbedFormatter.format(
      this.currentState.embed,
      this.currentState.format
    );

    this.panel.webview.postMessage({
      type: "codeGenerated",
      data: { code },
    });
  }

  /**
   * applies generated code to the active document or selection
   *
   * @param {string} code
   * @param {string} _
   */
  private async applyToFile(code: string, _: string) {
    if (!this.document) {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showErrorMessage("Please open a file first.");
        return;
      }
      this.document = editor.document;
    }

    const editor = await vscode.window.showTextDocument(this.document, {
      viewColumn: vscode.ViewColumn.One,
      preserveFocus: false,
    });

    await editor.edit((editBuilder) => {
      if (
        this.selection &&
        !this.selection.isEmpty &&
        this.currentState.sourceFile === this.document!.fileName
      ) {
        editBuilder.replace(this.selection, code);
      } else {
        const position = editor.selection.active;
        editBuilder.insert(position, code + "\n");
      }
    });

    this.showNotification("Embed applied to file!");

    this.selection = undefined;
  }

  /**
   * sends a notification message to the webview
   *
   * @param {string} message
   */
  private showNotification(message: string) {
    if (this.panel) {
      this.panel.webview.postMessage({
        type: "showNotification",
        data: { message },
      });
    }
  }
}
