let currentEventId = null;

// Check authentication on page load
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    if (!localStorage.getItem('isLoggedIn')) {
        window.location.href = 'login.html';
        return;
    }

    // Initialize localStorage with empty events array if it doesn't exist
    const username = localStorage.getItem('username');
    if (!localStorage.getItem(`events_${username}`)) {
        localStorage.setItem(`events_${username}`, JSON.stringify([]));
    }

    // Add event listeners
    const createEventBtn = document.getElementById('createEventBtn');
    const cancelCreateEvent = document.getElementById('cancelCreateEvent');
    const confirmCreateEvent = document.getElementById('confirmCreateEvent');
    const createEventModal = document.getElementById('createEventModal');

    // Show create event modal
    if (createEventBtn) {
        createEventBtn.onclick = function() {
            createEventModal.classList.remove('hidden');
        };
    }

    // Hide create event modal
    if (cancelCreateEvent) {
        cancelCreateEvent.onclick = function() {
            createEventModal.classList.add('hidden');
        };
    }

    // Handle event creation
    if (confirmCreateEvent) {
        confirmCreateEvent.onclick = function() {
            const eventName = document.getElementById('eventNameInput').value.trim();
            
            if (!eventName) {
                alert('Please enter an event name');
                return;
            }

            // Create new event
            const newEvent = {
                id: Date.now().toString(),
                name: eventName,
                guests: []
            };

            // Get existing events and add new event
            const events = JSON.parse(localStorage.getItem(`events_${username}`) || '[]');
            events.push(newEvent);
            localStorage.setItem(`events_${username}`, JSON.stringify(events));

            // Clear input and hide modal
            document.getElementById('eventNameInput').value = '';
            createEventModal.classList.add('hidden');

            // Refresh events list
            loadEvents();
        };
    }

    // Load existing events
    loadEvents();
});

// Function to handle logout
function logout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    window.location.href = 'login.html';
}

// Function to load all events
function loadEvents() {
    const eventsList = document.getElementById('eventsList');
    const username = localStorage.getItem('username');
    const events = JSON.parse(localStorage.getItem(`events_${username}`) || '[]');

    if (events.length === 0) {
        eventsList.innerHTML = '<p class="text-gray-500">No events created yet</p>';
        return;
    }

    eventsList.innerHTML = events.map(event => `
        <div class="bg-white p-4 rounded-lg shadow mb-4">
            <div class="flex justify-between items-center">
                <div>
                    <h3 class="text-lg font-semibold">${event.name}</h3>
                    <p class="text-sm text-gray-600">${event.guests.length} guest(s)</p>
                </div>
                <div class="flex space-x-2">
                    <button onclick="window.location.href='event.html?id=${event.id}'" 
                            class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm">
                        Manage Guests
                    </button>
                    <button onclick="deleteEvent('${event.id}')" 
                            class="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm">
                        Delete
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Function to delete an event
function deleteEvent(eventId) {
    if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
        return;
    }

    try {
        const username = localStorage.getItem('username');
        const events = JSON.parse(localStorage.getItem(`events_${username}`) || '[]');
        
        // Filter out the event to be deleted
        const updatedEvents = events.filter(event => event.id !== eventId);
        
        // Save back to localStorage
        localStorage.setItem(`events_${username}`, JSON.stringify(updatedEvents));
        
        // Refresh events list
        loadEvents();
        
        // If the deleted event was the current event, clear the current event ID
        if (currentEventId === eventId) {
            currentEventId = null;
            const guestForm = document.getElementById('guestForm');
            if (guestForm) {
                guestForm.classList.add('hidden');
            }
            loadGuests();
        }
    } catch (error) {
        console.error('Error deleting event:', error);
        alert('Error deleting event. Please try again.');
    }
}

// Handle add guest button click
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