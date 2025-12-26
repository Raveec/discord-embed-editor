import { DiscordEmbed } from '../types/embed';
import { DiscordJSFormatter } from './discordjs-formatter';
import { DiscordPyFormatter } from './discordpy-formatter';
import { JsonFormatter } from './json-formatter';

export class EmbedFormatter {
  static format(embed: DiscordEmbed, format: 'json' | 'discord.js' | 'discord.py'): string {
    switch (format) {
      case 'discord.js':
        return DiscordJSFormatter.format(embed);
      case 'discord.py':
        return DiscordPyFormatter.format(embed);
      case 'json':
        return JsonFormatter.format(embed);
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }
}