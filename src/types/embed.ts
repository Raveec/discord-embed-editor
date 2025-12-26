export interface DiscordEmbedField {
  name: string;
  value: string;
  inline?: boolean;
}

export interface DiscordEmbedAuthor {
  name: string;
  url?: string;
  icon_url?: string;
}

export interface DiscordEmbedFooter {
  text: string;
  icon_url?: string;
}

export interface DiscordEmbedImage {
  url: string;
}

export interface DiscordEmbedThumbnail {
  url: string;
}

export interface DiscordEmbed {
  title?: string;
  description?: string;
  color?: number;
  url?: string;
  timestamp?: string | Date;
  footer?: DiscordEmbedFooter;
  image?: DiscordEmbedImage;
  thumbnail?: DiscordEmbedThumbnail;
  author?: DiscordEmbedAuthor;
  fields?: DiscordEmbedField[];
}

export interface EditorState {
  embed: DiscordEmbed;
  format: 'json' | 'discord.js' | 'discord.py';
  sourceFile?: string;
  selection?: {
    start: number;
    end: number;
  };
}

export interface WebviewToExtensionMessage {
  type: 'updateEmbed' | 'changeFormat' | 'requestCode' | 'copyToClipboard' | 'applyToFile' | 'closeEditor';
  data?: any;
}

export interface ExtensionToWebviewMessage {
  type: 'codeGenerated' | 'showNotification' | 'updateState';
  data?: any;
}