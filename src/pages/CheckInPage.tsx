import React, { useState } from 'react';
import { QrReader } from 'react-qr-reader';
import GuestInfoModal from '../components/GuestInfoModal';

interface Guest {
  firstName: string;
  lastName: string;
  guestCount: number;
  checkedIn: boolean;
}

const CheckInPage: React.FC = () => {
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [currentGuest, setCurrentGuest] = useState<Guest | null>(null);

  const handleScan = (result: any) => {
    if (result) {
      try {
        const guestData = JSON.parse(result.text) as Guest;
        setScannedData(result.text);
        setCurrentGuest(guestData);
        setShowModal(true);
      } catch (error) {
        console.error('Invalid QR code data');
      }
    }
  };

  const handleError = (error: any) => {
    console.error(error);
  };

  const handleCheckIn = () => {
    if (currentGuest) {
      // Here you would typically update the guest's check-in status in your backend
      setCurrentGuest({ ...currentGuest, checkedIn: true });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Check-In Scanner</h1>
      
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-4">
        <QrReader
          onResult={handleScan}
          onError={handleError}
          constraints={{ facingMode: 'environment' }}
          className="w-full"
        />
      </div>

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

export default CheckInPage; 