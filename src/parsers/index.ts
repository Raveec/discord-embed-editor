import { DiscordEmbed } from '../types/embed';
import { DiscordJSParser } from './discordjs-parser';
import { DiscordPyParser } from './discordpy-parser';

/**
 * @class CodeParser
 * dispatches parsing based on the provided source format
 */
export class CodeParser {

  /**
   * @param {string} code
   * @param {'json' | 'discord.js' | 'discord.py'} format
   * @returns {DiscordEmbed | undefined}
   */
  static parse(
    code: string,
    format: 'json' | 'discord.js' | 'discord.py'
  ): DiscordEmbed | undefined {
    try {
      switch (format) {
        case 'json':
          return JSON.parse(code);
        case 'discord.js':
          return DiscordJSParser.parse(code);
        case 'discord.py':
          return DiscordPyParser.parse(code);
        default:
          return undefined;
      }
    } catch {
      return undefined;
    }
  }
}
