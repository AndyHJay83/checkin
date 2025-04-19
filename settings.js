let currentEventId = null;

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    // Add event listeners
    document.getElementById('createEventBtn').addEventListener('click', createEvent);
    document.getElementById('addGuestBtn').addEventListener('click', addGuest);
    
    // Load existing events
    loadEvents();
});

// Function to create a new event
function createEvent() {
    const eventName = document.getElementById('newEventName').value.trim();
    
    if (!eventName) {
        alert('Please enter an event name');
        return;
    }

    // Get existing events or initialize empty array
    let events = JSON.parse(localStorage.getItem('events') || '[]');

    // Create new event
    const newEvent = {
        id: Date.now().toString(),
        name: eventName,
        guests: []
    };

    // Add new event to array
    events.push(newEvent);

    // Save to localStorage
    localStorage.setItem('events', JSON.stringify(events));

    // Clear input and refresh display
    document.getElementById('newEventName').value = '';
    loadEvents();
    
    // Select the newly created event
    selectEvent(newEvent.id);
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
        <div class="border rounded-md p-4 ${guest.checkedIn ? 'bg-green-50' : ''}">
            <h3 class="font-semibold">${guest.firstName} ${guest.lastName}</h3>
            <p class="text-sm text-gray-600">${guest.ticketCount} ticket(s)</p>
            <p class="text-sm ${guest.checkedIn ? 'text-green-600' : 'text-gray-600'}">
                ${guest.checkedIn ? 'Checked In' : 'Not Checked In'}
            </p>
        </div>
    `).join('');
} 