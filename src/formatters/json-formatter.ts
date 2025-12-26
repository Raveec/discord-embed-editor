import { DiscordEmbed } from '../types/embed';

export class JsonFormatter {
  static format(embed: DiscordEmbed): string {
    return JSON.stringify(embed, null, 2);
  }
}