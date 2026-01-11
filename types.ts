
export interface Message {
  role: 'user' | 'model';
  content: string;
  timestamp: number;
}

export interface Level {
  id: number;
  name: string;
  description: string;
  systemPrompt: string;
  secret: string;
  difficulty: 'Low' | 'Medium' | 'High' | 'Extreme' | 'Impossible';
}

export interface GameState {
  currentLevel: number;
  messages: Message[];
  isThinking: boolean;
  isCorrect: boolean | null;
  hasWon: boolean;
}

export interface AskResponse {
  text: string;
  error?: string;
}

export interface SubmitResponse {
  success: boolean;
  message: string;
  nextLevel?: number;
}
