let currentEventId = null;

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    loadEvents();
});

// Function to create a new event
function createEvent() {
    const eventName = document.getElementById('newEventName').value.trim();
    if (!eventName) return;

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

    eventsList.innerHTML = events.map(event => `
        <div class="p-4 border rounded-md cursor-pointer ${currentEventId === event.id ? 'bg-blue-50' : ''}"
             onclick="selectEvent('${event.id}')">
            <h3 class="font-semibold">${event.name}</h3>
            <p class="text-sm text-gray-600">${event.guests.length} guests</p>
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
    if (!currentEventId) return;

    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const ticketCount = parseInt(document.getElementById('ticketCount').value);

    if (!firstName || !lastName || ticketCount < 1) return;

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

    guestsList.innerHTML = currentEvent.guests.map(guest => `
        <div class="border rounded-md p-4 flex justify-between items-center ${guest.checkedIn ? 'bg-green-50' : ''}">
            <div>
                <h3 class="font-semibold">${guest.firstName} ${guest.lastName}</h3>
                <p class="text-sm text-gray-600">${guest.ticketCount} ticket(s)</p>
            </div>
            <div class="flex flex-col items-center">
                <div id="qr-${guest.id}" class="mb-2"></div>
                <button onclick="copyQRData('${guest.id}')" class="text-sm text-blue-500 hover:text-blue-700">
                    Copy QR Data
                </button>
            </div>
        </div>
    `).join('');

    // Generate QR codes
    currentEvent.guests.forEach(guest => {
        const qrData = JSON.stringify({
            id: guest.id,
            eventId: currentEventId,
            firstName: guest.firstName,
            lastName: guest.lastName,
            ticketCount: guest.ticketCount,
            checkedIn: guest.checkedIn
        });

        QRCode.toCanvas(document.getElementById(`qr-${guest.id}`), qrData, {
            width: 100,
            margin: 1
        });
    });
}

// Function to copy QR data to clipboard
function copyQRData(guestId) {
    const events = JSON.parse(localStorage.getItem('events') || '[]');
    const currentEvent = events.find(event => event.id === currentEventId);
    const guest = currentEvent.guests.find(g => g.id === guestId);

    const qrData = JSON.stringify({
        id: guest.id,
        eventId: currentEventId,
        firstName: guest.firstName,
        lastName: guest.lastName,
        ticketCount: guest.ticketCount,
        checkedIn: guest.checkedIn
    });

    navigator.clipboard.writeText(qrData);
} 