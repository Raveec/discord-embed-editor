/**
 * discord embed size and count limits
 */
export const DISCORD_LIMITS = {
  TITLE: 256,
  DESCRIPTION: 4096,
  FIELDS: 25,
  FIELD_NAME: 256,
  FIELD_VALUE: 1024,
  FOOTER_TEXT: 2048,
  AUTHOR_NAME: 256,
  TOTAL_CHARS: 6000
};

/**
 * supported input and output formats
 */
export const SUPPORTED_FORMATS = ['json', 'discord.js', 'discord.py'] as const;
