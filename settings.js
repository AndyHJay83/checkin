let currentEventId = null;

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    loadEvents();
});

// Function to create a new event
function createEvent() {
    const eventName = document.getElementById('newEventName').value.trim();
    if (!eventName) {
        alert('Please enter an event name');
        return;
    }

    const events = JSON.parse(localStorage.getItem('events') || '[]');
    const newEvent = {
        id: Date.now().toString(),
        name: eventName,
        guests: []
    };

    events.push(newEvent);
    localStorage.setItem('events', JSON.stringify(events));
    document.getElementById('newEventName').value = '';
    loadEvents();
}

// Function to load all events
function loadEvents() {
    const eventsList = document.getElementById('eventsList');
    const events = JSON.parse(localStorage.getItem('events') || '[]');

    if (events.length === 0) {
        eventsList.innerHTML = '<p class="text-gray-500">No events created yet</p>';
        return;
    }

    eventsList.innerHTML = events.map(event => `
        <div class="p-4 border rounded-md cursor-pointer ${currentEventId === event.id ? 'bg-blue-50' : ''}"
             onclick="selectEvent('${event.id}')">
            <h3 class="font-semibold">${event.name}</h3>
            <p class="text-sm text-gray-600">${event.guests.length} guest(s)</p>
        </div>
    `).join('');
}

// Function to select an event
function selectEvent(eventId) {
    currentEventId = eventId;
    document.getElementById('guestForm').classList.remove('hidden');
    loadGuests();
    loadEvents(); // Refresh to highlight selected event
}

// Function to add a new guest
function addGuest() {
    if (!currentEventId) {
        alert('Please select an event first');
        return;
    }

    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const ticketCount = parseInt(document.getElementById('ticketCount').value);

    if (!firstName || !lastName) {
        alert('Please enter both first and last name');
        return;
    }

    if (isNaN(ticketCount) || ticketCount < 1) {
        alert('Please enter a valid number of tickets (minimum 1)');
        return;
    }

    const events = JSON.parse(localStorage.getItem('events') || '[]');
    const newGuest = {
        id: Date.now().toString(),
        firstName,
        lastName,
        ticketCount,
        checkedIn: false,
        eventId: currentEventId
    };

    events.forEach(event => {
        if (event.id === currentEventId) {
            event.guests.push(newGuest);
        }
    });

    localStorage.setItem('events', JSON.stringify(events));
    
    // Clear form
    document.getElementById('firstName').value = '';
    document.getElementById('lastName').value = '';
    document.getElementById('ticketCount').value = '1';
    
    loadGuests();
}

// Function to load guests for the selected event
function loadGuests() {
    if (!currentEventId) return;

    const guestsList = document.getElementById('guestsList');
    const events = JSON.parse(localStorage.getItem('events') || '[]');
    const currentEvent = events.find(event => event.id === currentEventId);

    if (!currentEvent) return;

    if (currentEvent.guests.length === 0) {
        guestsList.innerHTML = '<p class="text-gray-500">No guests added yet</p>';
        return;
    }

    guestsList.innerHTML = currentEvent.guests.map(guest => `
        <div class="border rounded-md p-4 flex justify-between items-center ${guest.checkedIn ? 'bg-green-50' : ''}">
            <div>
                <h3 class="font-semibold">${guest.firstName} ${guest.lastName}</h3>
                <p class="text-sm text-gray-600">${guest.ticketCount} ticket(s)</p>
                <p class="text-sm ${guest.checkedIn ? 'text-green-600' : 'text-gray-600'}">
                    ${guest.checkedIn ? 'Checked In' : 'Not Checked In'}
                </p>
            </div>
            <div class="flex flex-col items-center">
                <div id="qrcode-${guest.id}" class="mb-2"></div>
                <button onclick="copyQRData('${guest.id}')" 
                        class="text-blue-500 hover:text-blue-700 text-sm">
                    Copy QR Data
                </button>
            </div>
        </div>
    `).join('');

    // Generate QR codes for each guest
    currentEvent.guests.forEach(guest => {
        const qrData = JSON.stringify({
            id: guest.id,
            firstName: guest.firstName,
            lastName: guest.lastName,
            ticketCount: guest.ticketCount,
            eventId: currentEventId
        });
        
        QRCode.toCanvas(document.getElementById(`qrcode-${guest.id}`), qrData, {
            width: 100,
            margin: 1,
            color: {
                dark: '#000000',
                light: '#ffffff'
            }
        });
    });
}

// Function to copy QR data to clipboard
function copyQRData(guestId) {
    const events = JSON.parse(localStorage.getItem('events') || '[]');
    const currentEvent = events.find(event => event.id === currentEventId);
    const guest = currentEvent.guests.find(g => g.id === guestId);

    if (guest) {
        const qrData = JSON.stringify({
            id: guest.id,
            firstName: guest.firstName,
            lastName: guest.lastName,
            ticketCount: guest.ticketCount,
            eventId: currentEventId
        });

        navigator.clipboard.writeText(qrData)
            .then(() => alert('QR data copied to clipboard'))
            .catch(err => console.error('Failed to copy QR data:', err));
    }
} 