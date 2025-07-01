
import React from 'react';
import { Meeting } from '../types';
import { Modal } from './Modal';
import { Button } from './Button';
import { CalendarDaysIcon, ClockIcon, UsersIcon, DocumentTextIcon, MapPinIcon, ShareIcon, PrinterIcon } from '@heroicons/react/24/outline';

interface MeetingSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  meeting: Meeting;
}

const DetailItem: React.FC<{ icon: React.ElementType; label: string; value?: string | string[]}> = ({ icon: Icon, label, value }) => (
    <div className="flex items-start py-2">
        <Icon className="h-5 w-5 text-[#004040] mr-3 mt-1 flex-shrink-0" />
        <div>
            <p className="text-sm font-medium text-gray-600">{label}</p>
            {Array.isArray(value) ? (
                 <ul className="list-disc list-inside text-gray-700 text-sm">
                    {value.map((item, idx) => <li key={idx}>{item}</li>)}
                 </ul>
            ) : value ? (
                <p className="text-gray-700 text-sm">{value}</p>
            ) : (
                 <p className="text-gray-500 text-sm italic">Not specified</p>
            )}
        </div>
    </div>
);


export const MeetingSummaryModal: React.FC<MeetingSummaryModalProps> = ({ isOpen, onClose, meeting }) => {
  const handleExportPDF = () => {
    alert("Mock: Exporting to PDF...");
    // In a real app, use a library like jsPDF
  };

  const handleSendEmail = () => {
    alert("Mock: Sending summary via email...");
    // In a real app, trigger an email service
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };


  return (
    <Modal isOpen={isOpen} onClose={onClose} title={meeting.title} size="md">
      <div className="p-1 space-y-4">
        <DetailItem icon={CalendarDaysIcon} label="Date" value={formatDate(meeting.date)} />
        <DetailItem icon={ClockIcon} label="Time" value={`${meeting.startTime} - ${meeting.endTime}`} />
        <DetailItem icon={UsersIcon} label="Participants" value={meeting.participants} />
        {meeting.location && <DetailItem icon={MapPinIcon} label="Location/Link" value={meeting.location} />}
        <DetailItem icon={DocumentTextIcon} label="Agenda" value={meeting.agenda} />
        <DetailItem icon={DocumentTextIcon} label="Notes" value={meeting.notes} />

        <div className="mt-6 pt-4 border-t flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
          <Button onClick={handleExportPDF} variant="secondary" icon={PrinterIcon}>
            Export to PDF
          </Button>
          <Button onClick={handleSendEmail} variant="secondary" icon={ShareIcon}>
            Send to Email
          </Button>
          <Button onClick={onClose} variant="primary">
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};