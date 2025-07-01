
import React, { useState, useMemo } from 'react';
import { Meeting } from '../types';
import { MeetingCard } from './MeetingCard';
import { Button } from './Button';
import { MeetingFilter } from '../constants';
import { PlusCircleIcon, FunnelIcon, CalendarDaysIcon } from '@heroicons/react/24/outline'; 

interface DashboardProps {
  meetings: Meeting[];
  onScheduleNew: () => void;
  onSelectMeeting: (meeting: Meeting) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ meetings, onScheduleNew, onSelectMeeting }) => {
  const [activeFilter, setActiveFilter] = useState<MeetingFilter>(MeetingFilter.All);

  const filteredMeetings = useMemo(() => {
    const now = new Date();
    // Reset 'now' for each filter application to avoid date mutation issues across re-renders
    const todayStr = new Date().toISOString().split('T')[0];
    
    return meetings.filter(meeting => {
      if (activeFilter === MeetingFilter.Today) {
        return meeting.date === todayStr;
      }
      if (activeFilter === MeetingFilter.ThisWeek) {
        const meetingDate = new Date(meeting.date);
        const currentDay = new Date(); // Use a fresh Date object for week calculation
        const dayOfWeek = currentDay.getDay(); // 0 (Sun) - 6 (Sat)
        const diffToSunday = dayOfWeek;
        const diffToSaturday = 6 - dayOfWeek;

        const startOfWeek = new Date(currentDay);
        startOfWeek.setDate(currentDay.getDate() - diffToSunday);
        startOfWeek.setHours(0,0,0,0);

        const endOfWeek = new Date(currentDay);
        endOfWeek.setDate(currentDay.getDate() + diffToSaturday);
        endOfWeek.setHours(23,59,59,999);
        
        return meetingDate >= startOfWeek && meetingDate <= endOfWeek;
      }
      // CustomRange not implemented, so it defaults to All
      return true; // MeetingFilter.All or MeetingFilter.CustomRange
    }).sort((a, b) => new Date(a.date + 'T' + a.startTime).getTime() - new Date(b.date + 'T' + b.startTime).getTime());
  }, [meetings, activeFilter]);

  const FilterButton: React.FC<{ filter: MeetingFilter; label: string }> = ({ filter, label }) => (
    <button
      onClick={() => setActiveFilter(filter)}
      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
        activeFilter === filter
          ? 'bg-[#FFDF00] text-[#004040]'
          : 'bg-white text-gray-700 hover:bg-yellow-50'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl font-semibold text-gray-800">Upcoming Meetings</h2>
        <Button onClick={onScheduleNew} variant="primary" icon={PlusCircleIcon}>
          Schedule New Meeting
        </Button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex items-center space-x-2 mb-4 flex-wrap gap-2">
          <FunnelIcon className="h-5 w-5 text-gray-500" />
          <h3 className="text-sm font-medium text-gray-600">Filter by:</h3>
          <FilterButton filter={MeetingFilter.All} label="All" />
          <FilterButton filter={MeetingFilter.Today} label="Today" />
          <FilterButton filter={MeetingFilter.ThisWeek} label="This Week" />
          {/* <FilterButton filter={MeetingFilter.CustomRange} label="Custom Range" /> */}
        </div>
      </div>

      {filteredMeetings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMeetings.map(meeting => (
            <MeetingCard key={meeting.id} meeting={meeting} onSelectMeeting={onSelectMeeting} />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 bg-white rounded-lg shadow">
          <CalendarDaysIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No meetings scheduled for this period.</p>
          <p className="text-sm text-gray-500 mt-1">Try changing the filter or scheduling a new meeting.</p>
        </div>
      )}
    </div>
  );
};