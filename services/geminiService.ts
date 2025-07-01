
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { GEMINI_TEXT_MODEL } from '../constants';

// Per coding guidelines, API key must be obtained exclusively from process.env.API_KEY
// and used directly. Assume this variable is pre-configured, valid, and accessible.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Fetches meeting time suggestions from Gemini API.
 */
export const fetchMeetingSuggestions = async (
  promptText: string,
  durationMinutes: number, // Parameter kept as per existing App.tsx call, though promptText incorporates it
  participants: string[],  // Parameter kept as per existing App.tsx call
  preferredDate: string    // Parameter kept as per existing App.tsx call
): Promise<string> => {
  try {
    // For time suggestions, high quality is preferred.
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_TEXT_MODEL,
      contents: promptText, // The prompt is constructed in App.tsx to include participants, date, duration
      config: {
        responseMimeType: "application/json",
        // Default thinkingConfig (enabled) for better quality suggestions
      },
    });
    return response.text;
  } catch (error) {
    console.error("Error fetching meeting suggestions from Gemini:", error);
    throw new Error("Failed to get suggestions from AI. Please try manually or check your connection/API key.");
  }
};

/**
 * Parses a natural language query to extract meeting details using Gemini API.
 */
export const parseNaturalLanguageMeetingRequest = async (query: string): Promise<string> => {
  const prompt = `Parse the following user request to schedule a meeting: "${query}". 
Extract the meeting title (if any, otherwise use 'Meeting with [First Participant Name if available else "Team"]'), participants (as an array of strings, try to extract emails if provided in parentheses or clearly stated as email, otherwise use names), duration (in minutes, default to 30 if not specified), and specific date/time preferences or information (e.g., 'next Tuesday afternoon', 'tomorrow at 2 PM', '2024-08-15T14:00:00Z'). 
Output the result as a JSON object with keys: "title" (string), "participants" (array of strings), "durationMinutes" (number), "dateTimeInfo" (string describing date/time preference or a specific ISO date if parsable).
Example for "Book a 1 hour meeting with Jane (jane@example.com) and Tom for project sync next Monday morning":
{
  "title": "Project Sync",
  "participants": ["Jane (jane@example.com)", "Tom"],
  "durationMinutes": 60,
  "dateTimeInfo": "next Monday morning"
}
If an email is explicitly provided like (email@example.com), include it with the participant's name.
`;

  try {
    // For NLP parsing, faster response might be preferred.
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_TEXT_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 0 } // Disable thinking for faster parsing
      },
    });
    return response.text;
  } catch (error) {
    console.error("Error parsing natural language request with Gemini:", error);
    throw new Error("Failed to understand your request via AI. Please try rephrasing or check your connection/API key.");
  }
};
