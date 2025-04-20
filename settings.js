let currentEventId = null;

// API configuration
const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000/api'
    : 'https://andyjay.github.io/checkin/api';

// Load events when page loads
document.addEventListener('DOMContentLoaded', loadEvents);

// Function to load events
async function loadEvents() {
    try {
        const response = await fetch(`${API_URL}/events`);
        if (!response.ok) {
            throw new Error('Failed to load events');
        }
        const events = await response.json();
        displayEvents(events);
    } catch (error) {
        console.error('Error loading events:', error);
        document.getElementById('eventsList').innerHTML = '<p class="text-red-500">Failed to load events</p>';
    }
}

// Function to display events
function displayEvents(events) {
    const eventsList = document.getElementById('eventsList');
    if (events.length === 0) {
        eventsList.innerHTML = '<p class="text-gray-500">No events created yet</p>';
        return;
    }

    eventsList.innerHTML = events.map(event => `
        <div class="bg-white p-4 rounded-lg shadow mb-4">
            <div class="flex justify-between items-center">
                <div>
                    <h3 class="text-lg font-semibold">${event.name}</h3>
                    <p class="text-gray-600">${event.guests?.length || 0} guest(s)</p>
                </div>
                <div class="flex space-x-2">
                    <button onclick="manageGuests('${event.id}')" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                        Manage Guests
                    </button>
                    <button onclick="deleteEvent('${event.id}')" class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
                        Delete
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Function to create a new event
async function createEvent() {
    const eventName = document.getElementById('eventName').value.trim();
    if (!eventName) {
        alert('Please enter an event name');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/events`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: Date.now().toString(),
                name: eventName,
                guests: []
            })
        });

        if (!response.ok) {
            throw new Error('Failed to create event');
        }

        // Clear input and refresh events list
        document.getElementById('eventName').value = '';
        loadEvents();
    } catch (error) {
        console.error('Error creating event:', error);
        alert('Error creating event. Please try again.');
    }
}

// Function to delete an event
async function deleteEvent(eventId) {
    if (!confirm('Are you sure you want to delete this event?')) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/events/${eventId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Failed to delete event');
        }

        loadEvents();
    } catch (error) {
        console.error('Error deleting event:', error);
        alert('Error deleting event. Please try again.');
    }
}

// Function to manage guests
function manageGuests(eventId) {
    window.location.href = `event.html?eventId=${eventId}`;
}

// Function to logout
function logout() {
    localStorage.removeItem('token');
    window.location.href = 'index.html';
}

// Function to handle add guest button click
function handleAddGuest() {
    if (!currentEventId) {
        alert('Please select an event first');
        return;
    }
    
    const firstName = document.getElementById('firstName')?.value.trim();
    const lastName = document.getElementById('lastName')?.value.trim();
    const ticketCount = parseInt(document.getElementById('ticketCount')?.value || '0');
    
    if (!firstName || !lastName) {
        alert('Please enter both first and last name');
        return;
    }
    
    if (isNaN(ticketCount) || ticketCount < 1) {
        alert('Please enter a valid number of tickets (minimum 1)');
        return;
    }
    
    try {
        const username = localStorage.getItem('username');
        const events = JSON.parse(localStorage.getItem(`events_${username}`) || '[]');
        const newGuest = {
            id: Date.now().toString(),
            firstName,
            lastName,
            ticketCount,
            checkedIn: false,
            eventId: currentEventId
        };
        
        // Add guest to the selected event
        events.forEach(event => {
            if (event.id === currentEventId) {
                event.guests.push(newGuest);
            }
        });
        
        // Save back to localStorage
        localStorage.setItem(`events_${username}`, JSON.stringify(events));
        
        // Clear form
        document.getElementById('firstName').value = '';
        document.getElementById('lastName').value = '';
        document.getElementById('ticketCount').value = '1';
        
        // Refresh display
        loadGuests();
    } catch (error) {
        console.error('Error adding guest:', error);
        alert('Error adding guest. Please try again.');
    }
}

// Function to select an event
function selectEvent(eventId) {
    currentEventId = eventId;
    const guestForm = document.getElementById('guestForm');
    if (guestForm) {
        guestForm.classList.remove('hidden');
    }
    loadGuests();
    loadEvents();
}

// Function to load guests for the selected event
function loadGuests() {
    if (!currentEventId) return;
    
    const guestsList = document.getElementById('guestsList');
    if (!guestsList) {
        console.error('Guests list element not found');
        return;
    }
    
    try {
        const username = localStorage.getItem('username');
        const events = JSON.parse(localStorage.getItem(`events_${username}`) || '[]');
        const currentEvent = events.find(event => event.id === currentEventId);
        
        if (!currentEvent) {
            guestsList.innerHTML = '<p class="text-red-500">Event not found</p>';
            return;
        }
        
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
    } catch (error) {
        console.error('Error loading guests:', error);
        guestsList.innerHTML = '<p class="text-red-500">Error loading guests</p>';
    }
} 