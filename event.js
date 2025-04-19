let currentEventId = null;

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    // Get event ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    currentEventId = urlParams.get('id');

    if (!currentEventId) {
        window.location.href = 'settings.html';
        return;
    }

    // Add event listeners
    const addGuestBtn = document.getElementById('addGuestBtn');
    const cancelAddGuest = document.getElementById('cancelAddGuest');
    const confirmAddGuest = document.getElementById('confirmAddGuest');
    const addGuestModal = document.getElementById('addGuestModal');

    // Show add guest modal
    addGuestBtn.addEventListener('click', () => {
        addGuestModal.classList.remove('hidden');
    });

    // Hide add guest modal
    cancelAddGuest.addEventListener('click', () => {
        addGuestModal.classList.add('hidden');
    });

    // Handle guest addition
    confirmAddGuest.addEventListener('click', () => {
        const guestName = document.getElementById('guestNameInput').value.trim();
        
        if (!guestName) {
            alert('Please enter a guest name');
            return;
        }

        // Get events from localStorage
        const events = JSON.parse(localStorage.getItem('events') || '[]');
        
        // Find current event and add guest
        events.forEach(event => {
            if (event.id === currentEventId) {
                event.guests.push({
                    id: Date.now().toString(),
                    name: guestName
                });
            }
        });

        // Save back to localStorage
        localStorage.setItem('events', JSON.stringify(events));

        // Clear input and hide modal
        document.getElementById('guestNameInput').value = '';
        addGuestModal.classList.add('hidden');

        // Refresh guests list
        loadGuests();
    });

    // Load event details and guests
    loadEventDetails();
    loadGuests();
});

// Function to load event details
function loadEventDetails() {
    const events = JSON.parse(localStorage.getItem('events') || '[]');
    const currentEvent = events.find(event => event.id === currentEventId);

    if (currentEvent) {
        document.getElementById('eventTitle').textContent = currentEvent.name;
    } else {
        window.location.href = 'settings.html';
    }
}

// Function to load guests
function loadGuests() {
    const guestsList = document.getElementById('guestsList');
    const events = JSON.parse(localStorage.getItem('events') || '[]');
    const currentEvent = events.find(event => event.id === currentEventId);

    if (!currentEvent || currentEvent.guests.length === 0) {
        guestsList.innerHTML = '<p class="text-gray-500">No guests added yet</p>';
        return;
    }

    guestsList.innerHTML = currentEvent.guests.map(guest => `
        <div class="bg-white p-4 rounded-md shadow flex justify-between items-center">
            <span>${guest.name}</span>
            <button onclick="removeGuest('${guest.id}')" 
                    class="text-red-500 hover:text-red-700">
                Remove
            </button>
        </div>
    `).join('');
}

// Function to remove a guest
function removeGuest(guestId) {
    const events = JSON.parse(localStorage.getItem('events') || '[]');
    
    events.forEach(event => {
        if (event.id === currentEventId) {
            event.guests = event.guests.filter(guest => guest.id !== guestId);
        }
    });

    localStorage.setItem('events', JSON.stringify(events));
    loadGuests();
} 