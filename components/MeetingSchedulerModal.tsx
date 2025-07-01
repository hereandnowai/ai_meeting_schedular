
import React, { useState, useEffect, useCallback } from 'react';
import { Meeting, SuggestedTimeSlot, ParsedMeetingRequest } from '../types';
import { Modal } from './Modal';
import { Button } from './Button';
import { Input, TextArea } from './Input';
import { ArrowPathIcon, CalendarDaysIcon, ClockIcon, LightBulbIcon, UsersIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface MeetingSchedulerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSchedule: (newMeeting: Omit<Meeting, 'id'>) => void;
  getSuggestions: (participants: string[], preferredDate: string, durationMinutes: number) => Promise<SuggestedTimeSlot[]>;
  initialData?: Partial<Meeting & { durationMinutes?: number }> | null;
}

export const MeetingSchedulerModal: React.FC<MeetingSchedulerModalProps> = ({ isOpen, onClose, onSchedule, getSuggestions, initialData }) => {
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [participants, setParticipants] = useState(''); // Comma-separated emails
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(30); // Default duration
  const [agenda, setAgenda] = useState('');
  const [location, setLocation] = useState('');
  const [suggestedSlots, setSuggestedSlots] = useState<SuggestedTimeSlot[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setParticipants(initialData.participants?.join(', ') || '');
      setDate(initialData.date || new Date().toISOString().split('T')[0]);
      setStartTime(initialData.startTime || '');
      setDurationMinutes(initialData.durationMinutes || 30);
      setAgenda(initialData.agenda || '');
      setLocation(initialData.location || '');
      setStep(1); // Reset to first step
      setSuggestedSlots([]);
      setError(null);
    } else {
      // Reset form when opened without initial data
      setTitle('');
      setParticipants('');
      setDate(new Date().toISOString().split('T')[0]);
      setStartTime('');
      setDurationMinutes(30);
      setAgenda('');
      setLocation('');
      setStep(1);
      setSuggestedSlots([]);
      setError(null);
    }
  }, [isOpen, initialData]);


  const handleGetSuggestions = useCallback(async () => {
    if (!participants || !date || !durationMinutes) {
      setError("Please fill in participants, date, and duration to get suggestions.");
      return;
    }
    setError(null);
    setIsLoadingSuggestions(true);
    setSuggestedSlots([]);
    try {
      const participantList = participants.split(',').map(p => p.trim()).filter(p => p);
      const suggestions = await getSuggestions(participantList, date, durationMinutes);
      setSuggestedSlots(suggestions);
    } catch (err) {
      console.error("Suggestion error:", err);
      setError("Failed to fetch suggestions. Please try again or enter time manually.");
      setSuggestedSlots([]);
    } finally {
      setIsLoadingSuggestions(false);
    }
  }, [participants, date, durationMinutes, getSuggestions]);

  const handleSelectSuggestion = (slot: SuggestedTimeSlot) => {
    const startDate = new Date(slot.start);
    setDate(startDate.toISOString().split('T')[0]);
    setStartTime(`${String(startDate.getHours()).padStart(2, '0')}:${String(startDate.getMinutes()).padStart(2, '0')}`);
  };

  const calculateEndTime = (sTime: string, dur: number): string => {
    if (!sTime) return '';
    const [hours, minutes] = sTime.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes)) return '';
    const totalMinutes = hours * 60 + minutes + dur;
    const endHours = Math.floor(totalMinutes / 60) % 24;
    const endMinutes = totalMinutes % 60;
    return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
  };

  const handleSubmit = () => {
    if (!title || !participants || !date || !startTime) {
      setError("Please fill in all required fields: Title, Participants, Date, and Start Time.");
      return;
    }
    setError(null);
    const endTime = calculateEndTime(startTime, durationMinutes);
    if (!endTime) {
        setError("Invalid start time format.");
        return;
    }

    onSchedule({
      title,
      participants: participants.split(',').map(p => p.trim()).filter(p => p),
      date,
      startTime,
      endTime,
      agenda,
      location
    });
    onClose(); // Close modal on successful schedule
  };

  const renderStepContent = () => {
    switch (step) {
      case 1: // Meeting Details
        return (
          <div className="space-y-4">
            <Input label="Meeting Title" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., Project Kickoff" required icon={CalendarDaysIcon} />
            <Input label="Participants (comma-separated emails)" value={participants} onChange={e => setParticipants(e.target.value)} placeholder="e.g., user1@example.com, user2@example.com" required icon={UsersIcon}/>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Preferred Date" type="date" value={date} onChange={e => setDate(e.target.value)} required />
                <Input label="Duration (minutes)" type="number" value={String(durationMinutes)} onChange={e => setDurationMinutes(parseInt(e.target.value, 10) || 30)} min="15" step="15" required icon={ClockIcon} />
            </div>
            <Button onClick={handleGetSuggestions} isLoading={isLoadingSuggestions} loadingText="Fetching..." icon={LightBulbIcon} variant="secondary" fullWidth>
              Get AI Time Suggestions
            </Button>
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>
        );
      case 2: // Time Selection & Finalization
        return (
          <div className="space-y-4">
            <h4 className="text-md font-medium text-gray-700">Select a Suggested Time or Enter Manually:</h4>
            {suggestedSlots.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-48 overflow-y-auto p-1">
                {suggestedSlots.map((slot, index) => {
                  const slotDate = new Date(slot.start);
                  const slotEndDate = new Date(slot.end);
                  const isSelected = date === slotDate.toISOString().split('T')[0] && startTime === `${String(slotDate.getHours()).padStart(2, '0')}:${String(slotDate.getMinutes()).padStart(2, '0')}`;
                  return (
                    <button
                      key={index}
                      onClick={() => handleSelectSuggestion(slot)}
                      className={`p-3 border rounded-lg text-sm transition-all duration-150 ${
                        isSelected ? 'bg-[#FFDF00] text-[#004040] ring-2 ring-[#004040]' : 'bg-gray-50 hover:bg-yellow-50 border-gray-300'
                      }`}
                    >
                      <p className="font-semibold">{slotDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                      <p>{`${String(slotDate.getHours()).padStart(2, '0')}:${String(slotDate.getMinutes()).padStart(2, '0')} - ${String(slotEndDate.getHours()).padStart(2, '0')}:${String(slotEndDate.getMinutes()).padStart(2, '0')}`}</p>
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-600 italic">No AI suggestions available, or suggestions not yet fetched. Please enter time manually.</p>
            )}
             <Input label="Selected Start Time" type="time" value={startTime} onChange={e => setStartTime(e.target.value)} required />
            <TextArea label="Agenda (Optional)" value={agenda} onChange={e => setAgenda(e.target.value)} placeholder="e.g., Discuss quarterly goals..." />
            <Input label="Location/Link (Optional)" value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g., Conference Room A or https://meet.example.com/link" />
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Schedule New Meeting" size="lg">
      <div className="p-1">
        {/* Progress Indicator could go here if more steps */}
        {renderStepContent()}
        <div className="mt-6 pt-4 border-t flex justify-between items-center">
          <div>
            {step === 2 && (
              <Button onClick={() => setStep(1)} variant="secondary">
                Back
              </Button>
            )}
          </div>
          <div className="flex items-center space-x-3">
             <Button onClick={onClose} variant="danger_ghost">
                Cancel
             </Button>
            {step === 1 && (
              <Button onClick={() => {if (title && participants && date && durationMinutes) setStep(2); else setError("Please fill required fields first.")}} variant="primary">
                Next
              </Button>
            )}
            {step === 2 && (
              <Button onClick={handleSubmit} variant="primary" icon={CheckCircleIcon}>
                Schedule Meeting
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};