
import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { AiAssistantView } from './components/AiAssistantView';
import { MeetingSchedulerModal } from './components/MeetingSchedulerModal';
import { MeetingSummaryModal } from './components/MeetingSummaryModal';
import { LoginForm } from './components/LoginForm';
import { AdminPanel } from './components/AdminPanel';
import { Meeting, User, SuggestedTimeSlot, ParsedMeetingRequest } from './types';
import { generateUniqueId, parseAndFormatSuggestedTimes, parseMeetingRequestFromJson } from './utils/helpers';
import { fetchMeetingSuggestions, parseNaturalLanguageMeetingRequest } from './services/geminiService';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isSchedulerModalOpen, setIsSchedulerModalOpen] = useState<boolean>(false);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState<boolean>(false);
  const [selectedMeetingForSummary, setSelectedMeetingForSummary] = useState<Meeting | null>(null);
  const [initialSchedulerData, setInitialSchedulerData] = useState<Partial<Meeting & { durationMinutes?: number }> | null>(null);

  const location = useLocation();
  const navigate = useNavigate();

  // Mock initial meetings
  useEffect(() => {
    if (isAuthenticated) {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);

      setMeetings([
        { id: generateUniqueId(), title: 'Project Alpha Sync', date: today.toISOString().split('T')[0], startTime: '10:00', endTime: '10:30', participants: ['john.doe@example.com', 'jane.smith@example.com'], agenda: 'Discuss Q3 roadmap.' },
        { id: generateUniqueId(), title: 'Client Demo Prep', date: tomorrow.toISOString().split('T')[0], startTime: '14:00', endTime: '15:00', participants: ['bob.lee@example.com', 'alice.green@example.com'], location: 'https://meet.google.com/xyz-abc-def' },
        { id: generateUniqueId(), title: 'Team Brainstorming', date: nextWeek.toISOString().split('T')[0], startTime: '11:00', endTime: '12:30', participants: ['all_dev_team@example.com'], notes: 'Bring creative ideas!' },
      ]);
    }
  }, [isAuthenticated]);

  const handleLogin = (email: string) => {
    // Mock authentication:
    const isAdmin = email.toLowerCase() === 'admin@example.com';
    setCurrentUser({ id: generateUniqueId(), email, isAdmin });
    setIsAuthenticated(true);
    navigate('/dashboard');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setMeetings([]);
    navigate('/login');
  };

  const openSchedulerModal = (data?: ParsedMeetingRequest) => {
    if (data && !data.error) {
      const initialData: Partial<Meeting & { durationMinutes?: number }> = {
        title: data.title || '',
        participants: data.participants || [],
        agenda: `Scheduled via AI: ${data.rawQuery || ''}`,
      };
      if (data.durationMinutes) {
        initialData.durationMinutes = data.durationMinutes;
      }
      // Basic date/time parsing from dateTimeInfo - could be more robust
      if (data.dateTimeInfo) {
        try {
          const parsedDate = new Date(data.dateTimeInfo);
          if (!isNaN(parsedDate.getTime())) {
            initialData.date = parsedDate.toISOString().split('T')[0];
            initialData.startTime = `${String(parsedDate.getHours()).padStart(2, '0')}:${String(parsedDate.getMinutes()).padStart(2, '0')}`;
          }
        } catch (e) {
          // if not a valid date, maybe it's "next Tuesday", AI might provide more info
          // For now, we just pass the string to notes or agenda if needed
        }
      }
      setInitialSchedulerData(initialData);
    } else {
      setInitialSchedulerData(null);
    }
    setIsSchedulerModalOpen(true);
  };
  
  const closeSchedulerModal = () => {
    setIsSchedulerModalOpen(false);
    setInitialSchedulerData(null);
  };

  const handleScheduleMeeting = (newMeeting: Omit<Meeting, 'id'>) => {
    const meetingWithId: Meeting = { ...newMeeting, id: generateUniqueId(), isNewlyScheduled: true };
    setMeetings(prevMeetings => [meetingWithId, ...prevMeetings.map(m => ({...m, isNewlyScheduled: false}))]); // Add to top and highlight
    closeSchedulerModal();
    // After a few seconds, remove the highlight
    setTimeout(() => {
      setMeetings(prev => prev.map(m => m.id === meetingWithId.id ? {...m, isNewlyScheduled: false} : m));
    }, 5000);
  };

  const openSummaryModal = (meeting: Meeting) => {
    setSelectedMeetingForSummary(meeting);
    setIsSummaryModalOpen(true);
  };

  const closeSummaryModal = () => {
    setIsSummaryModalOpen(false);
    setSelectedMeetingForSummary(null);
  };

  // AI Functionality for Scheduler
  const getMeetingTimeSuggestions = useCallback(async (participants: string[], preferredDate: string, durationMinutes: number): Promise<SuggestedTimeSlot[]> => {
    // In a real app, you'd check actual calendars. Here, we ask AI to suggest based on typical availability.
    const prompt = `Suggest three 30-minute meeting slots for ${participants.join(', ')} on ${preferredDate} for a ${durationMinutes}-minute meeting. Assume standard business hours (9 AM - 5 PM). Return as a JSON array of objects, each with 'start' and 'end' in ISO 8601 format.`;
    try {
      const responseText = await fetchMeetingSuggestions(prompt, durationMinutes, participants, preferredDate);
      return parseAndFormatSuggestedTimes(responseText);
    } catch (error) {
      console.error("Error fetching meeting suggestions:", error);
      // Return some fallback or empty array
      const fallbackStart = new Date(`${preferredDate}T09:00:00`);
      if (isNaN(fallbackStart.getTime())) return [];
      
      return [
        { start: fallbackStart.toISOString(), end: new Date(fallbackStart.getTime() + durationMinutes * 60000).toISOString() },
        { start: new Date(fallbackStart.getTime() + 60 * 60000).toISOString(), end: new Date(fallbackStart.getTime() + (60 + durationMinutes) * 60000).toISOString() },
      ];
    }
  }, []);

  // AI Functionality for AI Assistant
  const processNaturalLanguageQuery = useCallback(async (query: string): Promise<ParsedMeetingRequest> => {
    try {
      const responseText = await parseNaturalLanguageMeetingRequest(query);
      return parseMeetingRequestFromJson(responseText, query);
    } catch (error) {
      console.error("Error processing natural language query:", error);
      return { error: "Failed to understand your request. Please try again.", rawQuery: query };
    }
  }, []);


  useEffect(() => {
    if (!isAuthenticated && location.pathname !== '/login') {
      navigate('/login');
    }
    if (isAuthenticated && location.pathname === '/login') {
      navigate('/dashboard');
    }
  }, [isAuthenticated, location.pathname, navigate]);

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<LoginForm onLogin={handleLogin} />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    );
  }

  return (
    <Layout currentUser={currentUser} onLogout={handleLogout}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard meetings={meetings} onScheduleNew={() => openSchedulerModal()} onSelectMeeting={openSummaryModal} />} />
        <Route path="/ai-assistant" element={<AiAssistantView onProcessQuery={processNaturalLanguageQuery} onScheduleFromNLP={openSchedulerModal} />} />
        {currentUser?.isAdmin && <Route path="/admin" element={<AdminPanel />} />}
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
      {isSchedulerModalOpen && (
        <MeetingSchedulerModal
          isOpen={isSchedulerModalOpen}
          onClose={closeSchedulerModal}
          onSchedule={handleScheduleMeeting}
          getSuggestions={getMeetingTimeSuggestions}
          initialData={initialSchedulerData}
        />
      )}
      {isSummaryModalOpen && selectedMeetingForSummary && (
        <MeetingSummaryModal
          isOpen={isSummaryModalOpen}
          onClose={closeSummaryModal}
          meeting={selectedMeetingForSummary}
        />
      )}
    </Layout>
  );
};

export default App;
