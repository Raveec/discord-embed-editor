import { DiscordEmbed } from '../types/embed';

/**
 * @class EmbedFormatter
 * handles conversion between Discord embed formats
 */
export class EmbedFormatter {

  /**
   * converts an embed to discord.js EmbedBuilder syntax
   * @param {DiscordEmbed} embed
   * @returns {string}
   */
  static toDiscordJS(embed: DiscordEmbed): string {
    const lines = ['new EmbedBuilder()'];
    
    if (embed.title) lines.push(`  .setTitle(${JSON.stringify(embed.title)})`);
    if (embed.description) lines.push(`  .setDescription(${JSON.stringify(embed.description)})`);
    if (embed.color !== undefined) lines.push(`  .setColor(${embed.color})`);
    if (embed.url) lines.push(`  .setURL(${JSON.stringify(embed.url)})`);
    
    if (embed.author) {
      lines.push(`  .setAuthor({`);
      lines.push(`    name: ${JSON.stringify(embed.author.name)}`);
      if (embed.author.url) lines.push(`    url: ${JSON.stringify(embed.author.url)}`);
      if (embed.author.icon_url) lines.push(`    iconURL: ${JSON.stringify(embed.author.icon_url)}`);
      lines.push(`  })`);
    }
    
    if (embed.footer) {
      lines.push(`  .setFooter({`);
      lines.push(`    text: ${JSON.stringify(embed.footer.text)}`);
      if (embed.footer.icon_url) lines.push(`    iconURL: ${JSON.stringify(embed.footer.icon_url)}`);
      lines.push(`  })`);
    }
    
    if (embed.thumbnail?.url) {
      lines.push(`  .setThumbnail(${JSON.stringify(embed.thumbnail.url)})`);
    }
    
    if (embed.image?.url) {
      lines.push(`  .setImage(${JSON.stringify(embed.image.url)})`);
    }
    
    if (embed.timestamp) {
      lines.push(`  .setTimestamp(${embed.timestamp === 'now' ? 'new Date()' : JSON.stringify(embed.timestamp)})`);
    }
    
    if (embed.fields?.length) {
      lines.push(`  .addFields(`);
      embed.fields.forEach((field, i) => {
        const comma = i < embed.fields!.length - 1 ? ',' : '';
        lines.push(`    { name: ${JSON.stringify(field.name)}, value: ${JSON.stringify(field.value)}, inline: ${field.inline || false} }${comma}`);
      });
      lines.push(`  )`);
    }
    
    return lines.join('\n');
  }
  
  /**
   * converts an embed to discord.py syntax
   * @param {DiscordEmbed} embed
   * @returns {string}
   */
  static toDiscordPy(embed: DiscordEmbed): string {
    const lines = ['embed = discord.Embed('];
    
    if (embed.title) lines.push(`    title=${JSON.stringify(embed.title)},`);
    if (embed.description) lines.push(`    description=${JSON.stringify(embed.description)},`);
    if (embed.color !== undefined) lines.push(`    color=${embed.color},`);
    if (embed.url) lines.push(`    url=${JSON.stringify(embed.url)},`);
    
    if (embed.timestamp) {
      lines.push(`    timestamp=${embed.timestamp === 'now' ? 'datetime.datetime.utcnow()' : JSON.stringify(embed.timestamp)},`);
    }
    
    lines[lines.length - 1] = lines[lines.length - 1].replace(/,$/, '');
    lines.push(')');
    
    if (embed.author) {
      lines.push(`embed.set_author(`);
      lines.push(`    name=${JSON.stringify(embed.author.name)}`);
      if (embed.author.url) lines.push(`    url=${JSON.stringify(embed.author.url)}`);
      if (embed.author.icon_url) lines.push(`    icon_url=${JSON.stringify(embed.author.icon_url)}`);
      lines.push(`)`);
    }
    
    if (embed.footer) {
      lines.push(`embed.set_footer(`);
      lines.push(`    text=${JSON.stringify(embed.footer.text)}`);
      if (embed.footer.icon_url) lines.push(`    icon_url=${JSON.stringify(embed.footer.icon_url)}`);
      lines.push(`)`);
    }
    
    if (embed.thumbnail?.url) {
      lines.push(`embed.set_thumbnail(url=${JSON.stringify(embed.thumbnail.url)})`);
    }
    
    if (embed.image?.url) {
      lines.push(`embed.set_image(url=${JSON.stringify(embed.image.url)})`);
    }
    
    if (embed.fields?.length) {
      embed.fields.forEach(field => {
        lines.push(`embed.add_field(name=${JSON.stringify(field.name)}, value=${JSON.stringify(field.value)}, inline=${field.inline || false})`);
      });
    }
    
    return lines.join('\n');
  }
  
  /**
   * serializes the embed to JSON
   * @param {DiscordEmbed} embed
   * @returns {string}
   */
  static toJson(embed: DiscordEmbed): string {
    return JSON.stringify(embed, null, 2);
  }
  
  /**
   * parses embed code based on the provided format
   * @param {string} code
   * @param {'json' | 'discord.js' | 'discord.py'} format
   * @returns {DiscordEmbed | undefined}
   */
  static parseCode(code: string, format: 'json' | 'discord.js' | 'discord.py'): DiscordEmbed | undefined {
    try {
      switch (format) {
        case 'json':
          return JSON.parse(code);
        case 'discord.js':
          return this.parseDiscordJS(code);
        case 'discord.py':
          return this.parseDiscordPy(code);
      }
    } catch {
      return undefined;
    }
  }
  
  /**
   * parses discord.js EmbedBuilder code
   * @param {string} code
   * @returns {DiscordEmbed}
   */
  private static parseDiscordJS(code: string): DiscordEmbed {
    const embed: DiscordEmbed = {};
    
    const titleMatch = code.match(/\.setTitle\(['"]([^'"]+)['"]\)/);
    if (titleMatch) embed.title = titleMatch[1];
    
    const descMatch = code.match(/\.setDescription\(['"]([^'"]+)['"]\)/);
    if (descMatch) embed.description = descMatch[1];
    
    const colorMatch = code.match(/\.setColor\((\d+)\)/);
    if (colorMatch) embed.color = parseInt(colorMatch[1]);
    
    const fieldsMatch = code.match(/\.addFields\(([\s\S]*?)\)/);
    if (fieldsMatch) {
      const fieldsText = fieldsMatch[1];
      const fieldRegex = /name:\s*['"]([^'"]+)['"][\s\S]*?value:\s*['"]([^'"]+)['"][\s\S]*?inline:\s*(true|false)/g;
      let match;
      embed.fields = [];
      
      while ((match = fieldRegex.exec(fieldsText)) !== null) {
        embed.fields.push({
          name: match[1],
          value: match[2],
          inline: match[3] === 'true'
        });
      }
    }
    
    return embed;
  }
  
  /**
   * parses discord.py embed code
   * @param {string} code
   * @returns {DiscordEmbed}
   */
  private static parseDiscordPy(code: string): DiscordEmbed {
    const embed: DiscordEmbed = {};
    
    const titleMatch = code.match(/title=([^,\n]+)/);
    if (titleMatch) embed.title = titleMatch[1].replace(/['"]/g, '');
    
    const descMatch = code.match(/description=([^,\n]+)/);
    if (descMatch) embed.description = descMatch[1].replace(/['"]/g, '');
    
    const colorMatch = code.match(/color=(\d+)/);
    if (colorMatch) embed.color = parseInt(colorMatch[1]);
    
    const fieldRegex = /\.add_field\([\s\S]*?name=([^,]+)[\s\S]*?value=([^,]+)[\s\S]*?inline=([^\)]+)/g;
    let match;
    embed.fields = [];
    
    while ((match = fieldRegex.exec(code)) !== null) {
      embed.fields.push({
        name: match[1].replace(/['"]/g, '').trim(),
        value: match[2].replace(/['"]/g, '').trim(),
        inline: match[3].trim() === 'True'
      });
    }
    
    return embed;
  }
}
