import React from 'react';

interface Guest {
  firstName: string;
  lastName: string;
  guestCount: number;
  checkedIn: boolean;
}

interface GuestInfoModalProps {
  guest: Guest;
  onClose: () => void;
  onCheckIn: () => void;
}

const GuestInfoModal: React.FC<GuestInfoModalProps> = ({ guest, onClose, onCheckIn }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Guest Information</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-gray-600">Name</p>
            <p className="text-lg font-semibold">
              {guest.firstName} {guest.lastName}
            </p>
          </div>
          <div>
            <p className="text-gray-600">Number of Guests</p>
            <p className="text-lg font-semibold">{guest.guestCount}</p>
          </div>
          <div>
            <p className="text-gray-600">Status</p>
            <p className="text-lg font-semibold">
              {guest.checkedIn ? (
                <span className="text-green-500">Checked In</span>
              ) : (
                <span className="text-yellow-500">Not Checked In</span>
              )}
            </p>
          </div>
        </div>

        {!guest.checkedIn && (
          <button
            onClick={onCheckIn}
            className="mt-6 w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
          >
            Check In
          </button>
        )}
      </div>
    </div>
  );
};

export default GuestInfoModal; 