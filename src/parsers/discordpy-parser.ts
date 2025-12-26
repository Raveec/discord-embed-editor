import { DiscordEmbed } from '../types/embed';

/**
 * @class DiscordPyParser
 * parses discord.py embed code into a DiscordEmbed model
 */
export class DiscordPyParser {

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
    const titleMatch = code.match(/title=([^,\n]+)/);
    if (titleMatch) embed.title = titleMatch[1].replace(/['"]/g, '');
  }

  /**
   * @param {DiscordEmbed} embed
   * @param {string} code
   */
  private static parseDescription(embed: DiscordEmbed, code: string): void {
    const descMatch = code.match(/description=([^,\n]+)/);
    if (descMatch) embed.description = descMatch[1].replace(/['"]/g, '');
  }

  /**
   * @param {DiscordEmbed} embed
   * @param {string} code
   */
  private static parseColor(embed: DiscordEmbed, code: string): void {
    const colorMatch = code.match(/color=(\d+)/);
    if (colorMatch) embed.color = parseInt(colorMatch[1], 10);
  }

  /**
   * @param {DiscordEmbed} embed
   * @param {string} code
   */
  private static parseFields(embed: DiscordEmbed, code: string): void {
    const fieldRegex =
      /\.add_field\([\s\S]*?name=([^,]+)[\s\S]*?value=([^,]+)[\s\S]*?inline=([^\)]+)/g;

    embed.fields = [];
    let match: RegExpExecArray | null;

    while ((match = fieldRegex.exec(code)) !== null) {
      embed.fields.push({
        name: match[1].replace(/['"]/g, '').trim(),
        value: match[2].replace(/['"]/g, '').trim(),
        inline: match[3].trim() === 'True'
      });
    }
  }
}
