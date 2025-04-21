import React, { useState } from 'react';
import QRScanner from './QRScanner';
import GuestInfoModal from './GuestInfoModal';

interface Guest {
  id: string;
  name: string;
  email: string;
  phone: string;
  checkedIn: boolean;
}

const CheckIn = () => {
  const [showModal, setShowModal] = useState(false);
  const [currentGuest, setCurrentGuest] = useState<Guest | null>(null);

  const handleScan = (decodedText: string) => {
    try {
      const guestData = JSON.parse(decodedText);
      setCurrentGuest(guestData);
      setShowModal(true);
    } catch (error) {
      console.error('Error parsing QR code:', error);
    }
  };

  const handleCheckIn = () => {
    if (currentGuest) {
      // Update guest check-in status
      const updatedGuest = { ...currentGuest, checkedIn: true };
      setCurrentGuest(updatedGuest);
      setShowModal(false);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Guest Check-in</h1>
      <QRScanner onScan={handleScan} />
      {showModal && currentGuest && (
        <GuestInfoModal
          guest={currentGuest}
          onClose={() => setShowModal(false)}
          onCheckIn={handleCheckIn}
        />
      )}
    </div>
  );
};

export default CheckIn; 