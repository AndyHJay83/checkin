let currentEventId = null;
let eventToDelete = null;

// Function to fetch events from localStorage
async function fetchEvents() {
    try {
        const events = JSON.parse(localStorage.getItem('events') || '[]');
        return events;
    } catch (error) {
        console.error('Error fetching events:', error);
        return [];
    }
}

// Function to save events to localStorage
async function saveEvents(events) {
    try {
        localStorage.setItem('events', JSON.stringify(events));
    } catch (error) {
        console.error('Error saving events:', error);
        throw error;
    }
}

// Function to load all events
function loadEvents(events) {
    const eventsList = document.getElementById('eventsList');
    
    if (!eventsList) {
        console.error('Events list element not found');
        return;
    }

    if (events.length === 0) {
        eventsList.innerHTML = '<p class="text-gray-500">No events created yet</p>';
        return;
    }

    eventsList.innerHTML = events.map(event => `
        <div class="bg-white p-4 rounded-md shadow">
            <div class="flex justify-between items-start">
                <div>
                    <h3 class="font-semibold text-dark-green">${event.name}</h3>
                    <p class="text-sm text-dark-green">${event.guests ? event.guests.length : 0} guest(s)</p>
                </div>
                <div class="flex space-x-2">
                    <a href="event.html?id=${event.id}" 
                       class="text-blue-500 hover:text-blue-700">
                        Manage Guests
                    </a>
                    <button onclick="showDeleteConfirmation('${event.id}', '${event.name}', ${event.guests ? event.guests.length : 0})" 
                            class="text-red-500 hover:text-red-700">
                        Delete
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Initialize page
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Load existing events
        const events = await fetchEvents();
        loadEvents(events);

        // Add event listeners
        const createEventBtn = document.getElementById('createEventBtn');
        const cancelCreateEvent = document.getElementById('cancelCreateEvent');
        const confirmCreateEvent = document.getElementById('confirmCreateEvent');
        const createEventModal = document.getElementById('createEventModal');
        const eventNameInput = document.getElementById('eventNameInput');
        const deleteEventModal = document.getElementById('deleteEventModal');
        const cancelDeleteEvent = document.getElementById('cancelDeleteEvent');
        const confirmDeleteEvent = document.getElementById('confirmDeleteEvent');

        // Show create event modal
        if (createEventBtn) {
            createEventBtn.addEventListener('click', () => {
                createEventModal.classList.remove('hidden');
                eventNameInput.focus();
            });
        }

        // Hide create event modal
        if (cancelCreateEvent) {
            cancelCreateEvent.addEventListener('click', () => {
                createEventModal.classList.add('hidden');
                eventNameInput.value = '';
            });
        }

        // Handle event creation
        if (confirmCreateEvent) {
            confirmCreateEvent.addEventListener('click', async () => {
                const eventName = eventNameInput.value.trim();
                
                if (!eventName) {
                    alert('Please enter an event name');
                    return;
                }

                try {
                    // Create new event
                    const newEvent = {
                        id: Date.now().toString(),
                        name: eventName,
                        guests: []
                    };

                    // Get existing events and add new event
                    const events = await fetchEvents();
                    events.push(newEvent);
                    await saveEvents(events);

                    // Clear input and hide modal
                    eventNameInput.value = '';
                    createEventModal.classList.add('hidden');

                    // Refresh events list
                    loadEvents(events);
                } catch (error) {
                    console.error('Error creating event:', error);
                    alert('Error creating event. Please try again.');
                }
            });
        }

        // Hide delete event modal
        if (cancelDeleteEvent) {
            cancelDeleteEvent.onclick = function() {
                deleteEventModal.classList.add('hidden');
                eventToDelete = null;
            };
        }

        // Handle event deletion
        if (confirmDeleteEvent) {
            confirmDeleteEvent.onclick = async function() {
                if (eventToDelete) {
                    try {
                        const events = await fetchEvents();
                        const updatedEvents = events.filter(event => event.id !== eventToDelete);
                        await saveEvents(updatedEvents);
                        deleteEventModal.classList.add('hidden');
                        eventToDelete = null;
                        loadEvents(updatedEvents);
                    } catch (error) {
                        alert('Error deleting event. Please try again.');
                    }
                }
            };
        }
    } catch (error) {
        console.error('Error initializing page:', error);
        alert('Error loading events. Please refresh the page.');
    }
});

// Function to show delete confirmation
function showDeleteConfirmation(eventId, eventName, guestCount) {
    eventToDelete = eventId;
    const deleteEventModal = document.getElementById('deleteEventModal');
    const deleteEventWarning = document.getElementById('deleteEventWarning');
    
    deleteEventWarning.textContent = `Are you sure you want to delete "${eventName}"? This will also delete ${guestCount} guest(s) associated with this event. This action cannot be undone.`;
    deleteEventModal.classList.remove('hidden');
}

// Function to handle event deletion
async function handleDeleteEvent() {
    if (!eventToDelete) return;

    try {
        const events = await fetchEvents();
        const updatedEvents = events.filter(event => event.id !== eventToDelete);
        await saveEvents(updatedEvents);
        
        // Hide modal and reset state
        document.getElementById('deleteEventModal').classList.add('hidden');
        eventToDelete = null;
        
        // Refresh events list
        loadEvents(updatedEvents);
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