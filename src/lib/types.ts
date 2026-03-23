export type Role = "user" | "ai" | "system";

export interface Message {
  id: string;
  role: Role;
  content: string;
  image?: string;
  timestamp: string;
}

export type EventType = "food" | "exercise";

export interface CalorieEvent {
  id: string;
  type: EventType;
  description: string;
  calories: number;
  steps?: number;
}

export interface DayRecord {
  date: string; // YYYY-MM-DD format
  totalEaten: number;
  totalBurned: number;
  totalSteps: number;
  events: CalorieEvent[];
}

export interface StorageData {
  days: Record<string, DayRecord>;
  messages: Message[];
}
