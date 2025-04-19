import React, { useState } from 'react';
import QRCode from 'react-qr-code';

interface Guest {
  id: string;
  firstName: string;
  lastName: string;
  guestCount: number;
  checkedIn: boolean;
}

interface Group {
  id: string;
  name: string;
  guests: Guest[];
}

const SettingsPage: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [newGuest, setNewGuest] = useState({
    firstName: '',
    lastName: '',
    guestCount: 1,
  });

  const handleCreateGroup = () => {
    if (newGroupName.trim()) {
      const newGroup: Group = {
        id: Date.now().toString(),
        name: newGroupName.trim(),
        guests: [],
      };
      setGroups([...groups, newGroup]);
      setNewGroupName('');
    }
  };

  const handleAddGuest = () => {
    if (selectedGroup && newGuest.firstName.trim() && newGuest.lastName.trim()) {
      const guest: Guest = {
        id: Date.now().toString(),
        ...newGuest,
        checkedIn: false,
      };

      const updatedGroups = groups.map((group) =>
        group.id === selectedGroup.id
          ? { ...group, guests: [...group.guests, guest] }
          : group
      );

      setGroups(updatedGroups);
      setSelectedGroup(updatedGroups.find((g) => g.id === selectedGroup.id) || null);
      setNewGuest({ firstName: '', lastName: '', guestCount: 1 });
    }
  };

  const getGuestQRData = (guest: Guest) => {
    return JSON.stringify({
      firstName: guest.firstName,
      lastName: guest.lastName,
      guestCount: guest.guestCount,
      checkedIn: guest.checkedIn,
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Groups Section */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Groups</h2>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="New group name"
              className="flex-1 p-2 border rounded-md"
            />
            <button
              onClick={handleCreateGroup}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
            >
              Create Group
            </button>
          </div>

          <div className="space-y-2">
            {groups.map((group) => (
              <div
                key={group.id}
                className={`p-4 border rounded-md cursor-pointer ${
                  selectedGroup?.id === group.id ? 'bg-blue-50' : ''
                }`}
                onClick={() => setSelectedGroup(group)}
              >
                <h3 className="font-semibold">{group.name}</h3>
                <p className="text-sm text-gray-600">
                  {group.guests.length} guests
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Guests Section */}
        {selectedGroup && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Guests in {selectedGroup.name}</h2>
            <div className="space-y-4 mb-4">
              <input
                type="text"
                value={newGuest.firstName}
                onChange={(e) =>
                  setNewGuest({ ...newGuest, firstName: e.target.value })
                }
                placeholder="First Name"
                className="w-full p-2 border rounded-md"
              />
              <input
                type="text"
                value={newGuest.lastName}
                onChange={(e) =>
                  setNewGuest({ ...newGuest, lastName: e.target.value })
                }
                placeholder="Last Name"
                className="w-full p-2 border rounded-md"
              />
              <input
                type="number"
                value={newGuest.guestCount}
                onChange={(e) =>
                  setNewGuest({ ...newGuest, guestCount: parseInt(e.target.value) })
                }
                min="1"
                className="w-full p-2 border rounded-md"
              />
              <button
                onClick={handleAddGuest}
                className="w-full bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
              >
                Add Guest
              </button>
            </div>

            <div className="space-y-4">
              {selectedGroup.guests.map((guest) => (
                <div
                  key={guest.id}
                  className="border rounded-md p-4 flex justify-between items-center"
                >
                  <div>
                    <h3 className="font-semibold">
                      {guest.firstName} {guest.lastName}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {guest.guestCount} guest(s)
                    </p>
                    <p className="text-sm">
                      Status:{' '}
                      <span
                        className={
                          guest.checkedIn ? 'text-green-500' : 'text-yellow-500'
                        }
                      >
                        {guest.checkedIn ? 'Checked In' : 'Not Checked In'}
                      </span>
                    </p>
                  </div>
                  <div className="flex flex-col items-center">
                    <QRCode
                      value={getGuestQRData(guest)}
                      size={100}
                      className="mb-2"
                    />
                    <button
                      onClick={() => {
                        const qrData = getGuestQRData(guest);
                        navigator.clipboard.writeText(qrData);
                      }}
                      className="text-sm text-blue-500 hover:text-blue-700"
                    >
                      Copy QR Data
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPage; 