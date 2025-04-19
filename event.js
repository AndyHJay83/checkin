let currentEventId = null;
let editingGuestId = null;

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    if (!localStorage.getItem('isLoggedIn')) {
        window.location.href = 'login.html';
        return;
    }

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
        editingGuestId = null;
        document.getElementById('guestNameInput').value = '';
        document.getElementById('guestCountInput').value = '1';
        document.getElementById('confirmAddGuest').textContent = 'Add';
        addGuestModal.classList.remove('hidden');
    });

    // Hide add guest modal
    cancelAddGuest.addEventListener('click', () => {
        addGuestModal.classList.add('hidden');
    });

    // Handle guest addition/editing
    confirmAddGuest.addEventListener('click', () => {
        const guestName = document.getElementById('guestNameInput').value.trim();
        const guestCount = parseInt(document.getElementById('guestCountInput').value) || 1;
        
        if (!guestName) {
            alert('Please enter a guest name');
            return;
        }

        if (guestCount < 1) {
            alert('Please enter a valid number of guests (minimum 1)');
            return;
        }

        // Get events from localStorage
        const username = localStorage.getItem('username');
        const events = JSON.parse(localStorage.getItem(`events_${username}`) || '[]');
        
        // Find current event and add/edit guest
        events.forEach(event => {
            if (event.id === currentEventId) {
                if (editingGuestId) {
                    // Update existing guest
                    const guestIndex = event.guests.findIndex(g => g.id === editingGuestId);
                    if (guestIndex !== -1) {
                        event.guests[guestIndex] = {
                            id: editingGuestId,
                            name: guestName,
                            count: guestCount
                        };
                    }
                } else {
                    // Add new guest
                    event.guests.push({
                        id: Date.now().toString(),
                        name: guestName,
                        count: guestCount
                    });
                }
            }
        });

        // Save back to localStorage
        localStorage.setItem(`events_${username}`, JSON.stringify(events));

        // Clear input and hide modal
        document.getElementById('guestNameInput').value = '';
        document.getElementById('guestCountInput').value = '1';
        addGuestModal.classList.add('hidden');
        editingGuestId = null;

        // Refresh guests list
        loadGuests();
    });

    // Load event details and guests
    loadEventDetails();
    loadGuests();
});

// Function to load event details
function loadEventDetails() {
    const username = localStorage.getItem('username');
    const events = JSON.parse(localStorage.getItem(`events_${username}`) || '[]');
    const currentEvent = events.find(event => event.id === currentEventId);

    if (currentEvent) {
        document.getElementById('eventTitle').textContent = currentEvent.name;
    } else {
        window.location.href = 'settings.html';
    }
}

// Function to edit a guest
function editGuest(guestId) {
    const username = localStorage.getItem('username');
    const events = JSON.parse(localStorage.getItem(`events_${username}`) || '[]');
    const currentEvent = events.find(event => event.id === currentEventId);
    const guest = currentEvent.guests.find(g => g.id === guestId);

    if (guest) {
        editingGuestId = guestId;
        document.getElementById('guestNameInput').value = guest.name;
        document.getElementById('guestCountInput').value = guest.count;
        document.getElementById('confirmAddGuest').textContent = 'Update';
        document.getElementById('addGuestModal').classList.remove('hidden');
    }
}

// Function to load guests
function loadGuests() {
    const guestsList = document.getElementById('guestsList');
    const username = localStorage.getItem('username');
    const events = JSON.parse(localStorage.getItem(`events_${username}`) || '[]');
    const currentEvent = events.find(event => event.id === currentEventId);

    if (!currentEvent || currentEvent.guests.length === 0) {
        guestsList.innerHTML = '<p class="text-gray-500">No guests added yet</p>';
        return;
    }

    guestsList.innerHTML = currentEvent.guests.map(guest => `
        <div class="bg-white p-4 rounded-md shadow flex justify-between items-center">
            <div>
                <span class="font-medium">${guest.name}</span>
                <span class="text-sm text-gray-600 ml-2">(${guest.count} guest${guest.count > 1 ? 's' : ''})</span>
            </div>
            <div class="flex space-x-2">
                <button onclick="editGuest('${guest.id}')" 
                        class="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                    Edit
                </button>
                <button onclick="removeGuest('${guest.id}')" 
                        class="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600">
                    Remove
                </button>
            </div>
        </div>
    `).join('');
}

// Function to remove a guest
function removeGuest(guestId) {
    const username = localStorage.getItem('username');
    const events = JSON.parse(localStorage.getItem(`events_${username}`) || '[]');
    
    events.forEach(event => {
        if (event.id === currentEventId) {
            event.guests = event.guests.filter(guest => guest.id !== guestId);
        }
    });

    localStorage.setItem(`events_${username}`, JSON.stringify(events));
    loadGuests();
} 