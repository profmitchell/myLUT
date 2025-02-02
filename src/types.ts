export interface LUTSettings {
  resolution: '17x17x17' | '33x33x33' | '64x64x64';
  strength: number;
}

export interface ProcessingStatus {
  isProcessing: boolean;
  progress: number;
  message: string;
}