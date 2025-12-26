import {
  DiscordEmbed,
  DiscordEmbedAuthor,
  DiscordEmbedField,
  DiscordEmbedFooter
} from '../types/embed';

/**
 * @class DiscordPyFormatter
 * converts a DiscordEmbed model into discord.py embed code
 */
export class DiscordPyFormatter {

  /**
   * @param {DiscordEmbed} embed
   * @returns {string} Formatted discord.py embed code
   */
  static format(embed: DiscordEmbed): string {
    const lines = ['embed = discord.Embed('];

    const embedParams: string[] = [];
    if (embed.title) embedParams.push(`title=${JSON.stringify(embed.title)}`);
    if (embed.description) embedParams.push(`description=${JSON.stringify(embed.description)}`);
    if (embed.color !== undefined) embedParams.push(`color=${embed.color}`);
    if (embed.url) embedParams.push(`url=${JSON.stringify(embed.url)}`);

    if (embed.timestamp) {
      embedParams.push(
        `timestamp=${
          embed.timestamp === 'now'
            ? 'datetime.datetime.utcnow()'
            : JSON.stringify(embed.timestamp)
        }`
      );
    }

    embedParams.forEach((param, index) => {
      const suffix = index < embedParams.length - 1 ? ',' : '';
      lines.push(`    ${param}${suffix}`);
    });

    // remove trailing comma for valid python syntax
    lines[lines.length - 1] = lines[lines.length - 1].replace(/,$/, '');
    lines.push(')');

    if (embed.author) lines.push(...this.formatAuthor(embed.author));
    if (embed.footer) lines.push(...this.formatFooter(embed.footer));

    if (embed.thumbnail?.url) {
      lines.push(`embed.set_thumbnail(url=${JSON.stringify(embed.thumbnail.url)})`);
    }

    if (embed.image?.url) {
      lines.push(`embed.set_image(url=${JSON.stringify(embed.image.url)})`);
    }

    if (embed.fields?.length) {
      lines.push(...this.formatFields(embed.fields));
    }

    return lines.join('\n');
  }

  /**
   * @param {DiscordEmbedAuthor} author
   * @returns {string[]} set_author block
   */
  private static formatAuthor(author: DiscordEmbedAuthor): string[] {
    const lines = ['embed.set_author('];

    lines.push(`    name=${JSON.stringify(author.name)}`);
    if (author.url) lines.push(`    url=${JSON.stringify(author.url)}`);
    if (author.icon_url) lines.push(`    icon_url=${JSON.stringify(author.icon_url)}`);

    lines.push(')');
    return lines;
  }

  /**
   * @param {DiscordEmbedFooter} footer
   * @returns {string[]} set_footer block
   */
  private static formatFooter(footer: DiscordEmbedFooter): string[] {
    const lines = ['embed.set_footer('];

    lines.push(`    text=${JSON.stringify(footer.text)}`);
    if (footer.icon_url) lines.push(`    icon_url=${JSON.stringify(footer.icon_url)}`);

    lines.push(')');
    return lines;
  }

  /**
   * @param {DiscordEmbedField[]} fields
   * @returns {string[]} add_field calls
   */
  private static formatFields(fields: DiscordEmbedField[]): string[] {
    const lines: string[] = [];

    fields.forEach(field => {
      lines.push(
        `embed.add_field(name=${JSON.stringify(field.name)}, value=${JSON.stringify(field.value)}, inline=${field.inline || false})`
      );
    });

    return lines;
  }
}
