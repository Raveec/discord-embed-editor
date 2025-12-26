import {
  DiscordEmbed,
  DiscordEmbedAuthor,
  DiscordEmbedField,
  DiscordEmbedFooter
} from '../types/embed';

/**
 * @class DiscordJSFormatter
 * utility responsible for converting a DiscordEmbed model
 * into discord.js EmbedBuilder code
 */
export class DiscordJSFormatter {

  /**
   * @param {DiscordEmbed} embed
   * @returns {string} formatted EmbedBuilder code
   */
  static format(embed: DiscordEmbed): string {
    const lines = ['new EmbedBuilder()'];

    if (embed.title) lines.push(`  .setTitle(${JSON.stringify(embed.title)})`);
    if (embed.description) lines.push(`  .setDescription(${JSON.stringify(embed.description)})`);
    if (embed.color !== undefined) lines.push(`  .setColor(${embed.color})`);
    if (embed.url) lines.push(`  .setURL(${JSON.stringify(embed.url)})`);

    if (embed.author) lines.push(...this.formatAuthor(embed.author));
    if (embed.footer) lines.push(...this.formatFooter(embed.footer));

    if (embed.thumbnail?.url) {
      lines.push(`  .setThumbnail(${JSON.stringify(embed.thumbnail.url)})`);
    }

    if (embed.image?.url) {
      lines.push(`  .setImage(${JSON.stringify(embed.image.url)})`);
    }

    if (embed.timestamp) {
      lines.push(
        `  .setTimestamp(${
          embed.timestamp === 'now'
            ? 'new Date()'
            : JSON.stringify(embed.timestamp)
        })`
      );
    }

    if (embed.fields?.length) {
      lines.push(...this.formatFields(embed.fields));
    }

    return lines.join('\n');
  }

  /**
   * @param {DiscordEmbedAuthor} author
   * @returns {string[]} setAuthor block
   */
  private static formatAuthor(author: DiscordEmbedAuthor): string[] {
    const lines = ['  .setAuthor({'];

    lines.push(`    name: ${JSON.stringify(author.name)}`);
    if (author.url) lines.push(`    url: ${JSON.stringify(author.url)}`);
    if (author.icon_url) lines.push(`    iconURL: ${JSON.stringify(author.icon_url)}`);

    lines.push('  })');
    return lines;
  }

  /**
   * @param {DiscordEmbedFooter} footer
   * @returns {string[]} setFooter block
   */
  private static formatFooter(footer: DiscordEmbedFooter): string[] {
    const lines = ['  .setFooter({'];

    lines.push(`    text: ${JSON.stringify(footer.text)}`);
    if (footer.icon_url) lines.push(`    iconURL: ${JSON.stringify(footer.icon_url)}`);

    lines.push('  })');
    return lines;
  }

  /**
   * @param {DiscordEmbedField[]} fields
   * @returns {string[]} addFields block
   */
  private static formatFields(fields: DiscordEmbedField[]): string[] {
    const lines = ['  .addFields('];

    fields.forEach((field, index) => {
      const comma = index < fields.length - 1 ? ',' : '';
      lines.push(
        `    { name: ${JSON.stringify(field.name)}, value: ${JSON.stringify(field.value)}, inline: ${field.inline || false} }${comma}`
      );
    });

    lines.push('  )');
    return lines;
  }
}
