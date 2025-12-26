import { DiscordEmbed } from '../types/embed';
import * as fs from 'fs';
import * as path from 'path';

/**
 * @class TemplateManager
 * handles webview template loading and injection
 */
export class TemplateManager {
  /**
   * maps hex color values to display names
   * @type {Record<string, string>}
   */
  private static readonly COLOR_NAMES: Record<string, string> = {
    '5865f2': 'Blurple',
    '57f287': 'Green',
    'fee75c': 'Yellow',
    'ed4245': 'Red',
    'eb459e': 'Pink',
    '95a5a6': 'Gray',
    '34495e': 'Dark Blue',
    '1abc9c': 'Turquoise',
    'e67e22': 'Orange',
    '9b59b6': 'Purple',
    'e74c3c': 'Crimson',
    '2ecc71': 'Emerald'
  };

  /**
   * @param {DiscordEmbed} embed
   * @param {'json' | 'discord.js' | 'discord.py'} format
   * @param {string} extensionPath
   * @returns {string} webview html
   */
  static getWebviewHtml(
    embed: DiscordEmbed,
    format: 'json' | 'discord.js' | 'discord.py',
    extensionPath: string
  ): string {
    const htmlPath = path.join(extensionPath, 'src', 'webview', 'template.html');
    const cssPath = path.join(extensionPath, 'src', 'webview', 'template.css');
    const jsPath = path.join(extensionPath, 'src', 'webview', 'template.js');
    
    let html = fs.readFileSync(htmlPath, 'utf8');
    const css = fs.readFileSync(cssPath, 'utf8');
    const js = fs.readFileSync(jsPath, 'utf8');
    
    html = this.injectCss(html, css);
    html = this.injectJs(html, js);
    html = this.injectData(html, embed, format);
    
    return html;
  }

  /**
   * @param {string} html
   * @param {string} css
   * @returns {string} html with injected css
   */
  private static injectCss(html: string, css: string): string {
    const styleTag = `<style>${css}</style>`;
    
    if (html.includes('<style>')) {
      return html.replace(/<style>[\s\S]*?<\/style>/, styleTag);
    }
    
    return html.replace('</head>', `${styleTag}\n</head>`);
  }

  /**
   * @param {string} html
   * @param {string} js
   * @returns {string} html with injected script
   */
  private static injectJs(html: string, js: string): string {
    const scriptTag = `<script>${js}</script>`;
    
    if (html.includes('<script src="template.js">')) {
      return html.replace(/<script src="template.js"><\/script>/, scriptTag);
    }
    
    return html.replace('</body>', `${scriptTag}\n</body>`);
  }

  /**
   * @param {string} html
   * @param {DiscordEmbed} _
   * @param {'json' | 'discord.js' | 'discord.py'} format
   * @returns {string} html with selected format
   */
  private static injectData(
    html: string,
    _: DiscordEmbed,
    format: 'json' | 'discord.js' | 'discord.py'
  ): string {
    let updatedHtml = html;
    
    const options = [
      { value: 'json', selected: format === 'json' },
      { value: 'discord.js', selected: format === 'discord.js' },
      { value: 'discord.py', selected: format === 'discord.py' }
    ];
    
    options.forEach(option => {
      const pattern = new RegExp(`value="${option.value}"`, 'g');
      const replacement = option.selected
        ? `value="${option.value}" selected`
        : `value="${option.value}"`;
      updatedHtml = updatedHtml.replace(pattern, replacement);
    });
    
    updatedHtml = updatedHtml.replace(
      'id="codeFormat">JSON Code',
      `id="codeFormat">${format.toUpperCase()} Code`
    );
    
    return updatedHtml;
  }

  /**
   * @param {number} color
   * @returns {string} color name
   */
  static getColorName(color: number): string {
    const hex = color.toString(16).padStart(6, '0');
    return this.COLOR_NAMES[hex] || 'Custom';
  }
}
