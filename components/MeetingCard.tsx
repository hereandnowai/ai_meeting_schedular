
import React from 'react';
import { Meeting } from '../types';
import { CalendarIcon, ClockIcon, UsersIcon, MapPinIcon } from '@heroicons/react/24/outline';

interface MeetingCardProps {
  meeting: Meeting;
  onSelectMeeting: (meeting: Meeting) => void;
}

export const MeetingCard: React.FC<MeetingCardProps> = ({ meeting, onSelectMeeting }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div 
      className={`bg-white shadow-lg rounded-xl p-6 hover:shadow-xl transition-shadow duration-300 cursor-pointer flex flex-col justify-between space-y-4 relative ${meeting.isNewlyScheduled ? 'ring-2 ring-[#FFDF00]' : ''}`}
      onClick={() => onSelectMeeting(meeting)}
    >
      <div>
        <h3 className="text-lg font-semibold text-[#004040] mb-2 truncate">{meeting.title}</h3>
        
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center">
            <CalendarIcon className="h-5 w-5 mr-2 text-[#004040]" />
            <span>{formatDate(meeting.date)}</span>
          </div>
          <div className="flex items-center">
            <ClockIcon className="h-5 w-5 mr-2 text-[#004040]" />
            <span>{meeting.startTime} - {meeting.endTime}</span>
          </div>
          <div className="flex items-center">
            <UsersIcon className="h-5 w-5 mr-2 text-[#004040]" />
            <span className="truncate" title={meeting.participants.join(', ')}>
              {meeting.participants.length} participant{meeting.participants.length !== 1 ? 's' : ''}
            </span>
          </div>
          {meeting.location && (
            <div className="flex items-center">
              <MapPinIcon className="h-5 w-5 mr-2 text-[#004040]" />
              <span className="truncate" title={meeting.location}>
                {meeting.location.startsWith('http') ? 'Online Meeting' : meeting.location}
              </span>
            </div>
          )}
        </div>
      </div>
      <button 
        onClick={(e) => { e.stopPropagation(); onSelectMeeting(meeting); }}
        className="mt-4 w-full text-sm bg-yellow-50 text-[#004040] hover:bg-yellow-100 px-4 py-2 rounded-md font-medium transition-colors"
      >
        View Details
      </button>
       {meeting.isNewlyScheduled && (
        <div className="absolute top-2 right-2 bg-[#FFDF00] text-[#004040] text-xs font-semibold px-2 py-1 rounded-full">
          New
        </div>
      )}
    </div>
  );
};