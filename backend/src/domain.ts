export interface Intent {
    name: string;
    confidence: number;
    slots?: Record<string, string>;
  }
