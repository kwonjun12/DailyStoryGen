export interface ThumbnailConfig {
  date: Date;
  primaryText: string; // Usually the date
  backgroundColor: string;
  accentColor: string;
  fontScale: number;
}

export interface GeminiResponse {
  topic: string;
  colorSuggestion?: string;
}