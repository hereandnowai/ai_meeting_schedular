
export interface Meeting {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  participants: string[]; // emails or names
  agenda?: string;
  notes?: string;
  location?: string; // or meeting link
  isNewlyScheduled?: boolean; // For highlighting new meetings
}

export interface User {
  id: string;
  email: string;
  name?: string;
  isAdmin?: boolean; 
}

export interface AiChatMessage {
  id: string;
  sender: 'user' | 'ai' | 'system';
  text: string;
  timestamp: Date;
  isLoading?: boolean;
}

export interface ParsedMeetingRequest {
  title?: string;
  participants?: string[];
  durationMinutes?: number;
  dateTimeInfo?: string; // "next Tuesday afternoon", "2024-08-15T14:00:00Z"
  rawQuery?: string;
  error?: string;
}

export interface SuggestedTimeSlot {
  start: string; // ISO DateTime string
  end: string;   // ISO DateTime string
}
