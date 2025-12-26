import { DiscordEmbed } from '../types/embed';

/**
 * @class DiscordJSParser
 * parses discord.js EmbedBuilder code into a DiscordEmbed model
 */
export class DiscordJSParser {

  /**
   * @param {string} code
   * @returns {DiscordEmbed} parsed embed model
   */
  static parse(code: string): DiscordEmbed {
    const embed: DiscordEmbed = {};

    this.parseTitle(embed, code);
    this.parseDescription(embed, code);
    this.parseColor(embed, code);
    this.parseFields(embed, code);

    return embed;
  }

  /**
   * @param {DiscordEmbed} embed
   * @param {string} code
   */
  private static parseTitle(embed: DiscordEmbed, code: string): void {
    const titleMatch = code.match(/\.setTitle\(['"]([^'"]+)['"]\)/);
    if (titleMatch) embed.title = titleMatch[1];
  }

  /**
   * @param {DiscordEmbed} embed
   * @param {string} code
   */
  private static parseDescription(embed: DiscordEmbed, code: string): void {
    const descMatch = code.match(/\.setDescription\(['"]([^'"]+)['"]\)/);
    if (descMatch) embed.description = descMatch[1];
  }

  /**
   * @param {DiscordEmbed} embed
   * @param {string} code
   */
  private static parseColor(embed: DiscordEmbed, code: string): void {
    const colorMatch = code.match(/\.setColor\((\d+)\)/);
    if (colorMatch) embed.color = parseInt(colorMatch[1], 10);
  }

  /**
   * @param {DiscordEmbed} embed
   * @param {string} code
   */
  private static parseFields(embed: DiscordEmbed, code: string): void {
    const fieldsMatch = code.match(/\.addFields\(([\s\S]*?)\)/);
    if (!fieldsMatch) return;

    const fieldsText = fieldsMatch[1];
    const fieldRegex =
      /name:\s*['"]([^'"]+)['"][\s\S]*?value:\s*['"]([^'"]+)['"][\s\S]*?inline:\s*(true|false)/g;

    embed.fields = [];
    let match: RegExpExecArray | null;

    while ((match = fieldRegex.exec(fieldsText)) !== null) {
      embed.fields.push({
        name: match[1],
        value: match[2],
        inline: match[3] === 'true'
      });
    }
  }
}
