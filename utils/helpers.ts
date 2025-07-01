
import { SuggestedTimeSlot, ParsedMeetingRequest } from '../types';

export const generateUniqueId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

export const parseAndFormatSuggestedTimes = (jsonString: string): SuggestedTimeSlot[] => {
  try {
    let parsableJsonString = jsonString.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = parsableJsonString.match(fenceRegex);
    if (match && match[2]) {
      parsableJsonString = match[2].trim();
    }

    const parsed = JSON.parse(parsableJsonString);
    if (Array.isArray(parsed)) {
      return parsed.filter(item => item && typeof item.start === 'string' && typeof item.end === 'string')
                   .map(item => ({ start: item.start, end: item.end }));
    }
    console.warn("Parsed AI suggestion is not an array:", parsed);
    return [];
  } catch (error) {
    console.error("Error parsing suggested times JSON:", error, "Raw string:", jsonString);
    return [];
  }
};


export const parseMeetingRequestFromJson = (jsonString: string, rawQuery: string): ParsedMeetingRequest => {
  try {
    let parsableJsonString = jsonString.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = parsableJsonString.match(fenceRegex);
    if (match && match[2]) {
      parsableJsonString = match[2].trim();
    }
    
    const parsed = JSON.parse(parsableJsonString);
    const result: ParsedMeetingRequest = { rawQuery };

    if (parsed.title && typeof parsed.title === 'string') {
      result.title = parsed.title;
    }
    if (parsed.participants && Array.isArray(parsed.participants)) {
      result.participants = parsed.participants.filter(p => typeof p === 'string');
    }
    if (parsed.durationMinutes && typeof parsed.durationMinutes === 'number') {
      result.durationMinutes = parsed.durationMinutes;
    }
    if (parsed.dateTimeInfo && typeof parsed.dateTimeInfo === 'string') {
      result.dateTimeInfo = parsed.dateTimeInfo;
    }
    
    // Basic validation: ensure at least some useful info was parsed
    if (!result.title && !result.participants && !result.dateTimeInfo) {
        return { error: "AI couldn't extract enough information. Please be more specific.", rawQuery };
    }

    return result;
  } catch (error) {
    console.error("Error parsing meeting request JSON:", error, "Raw string:", jsonString);
    return { error: "AI response was not in the expected format. Please try again.", rawQuery };
  }
};
