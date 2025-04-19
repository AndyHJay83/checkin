let currentEventId = null;
let editingGuestId = null;

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    if (!localStorage.getItem('isLoggedIn')) {
        window.location.href = 'login.html';
        return;
    }

    const username = localStorage.getItem('username');

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
        const events = JSON.parse(localStorage.getItem(`events_${username}`) || '[]');
        
        // Find current event and add/edit guest
        const eventIndex = events.findIndex(e => e.id === currentEventId);
        if (eventIndex !== -1) {
            if (editingGuestId) {
                // Update existing guest
                const guestIndex = events[eventIndex].guests.findIndex(g => g.id === editingGuestId);
                if (guestIndex !== -1) {
                    events[eventIndex].guests[guestIndex] = {
                        id: editingGuestId,
                        name: guestName,
                        count: guestCount,
                        checkedIn: false
                    };
                }
            } else {
                // Add new guest
                if (!events[eventIndex].guests) {
                    events[eventIndex].guests = [];
                }
                events[eventIndex].guests.push({
                    id: Date.now().toString(),
                    name: guestName,
                    count: guestCount,
                    checkedIn: false
                });
            }
        }

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
    const username = localStorage.getItem('username');
    const guestsList = document.getElementById('guestsList');
    const events = JSON.parse(localStorage.getItem(`events_${username}`) || '[]');
    const event = events.find(e => e.id === currentEventId);

    if (!event || !event.guests || event.guests.length === 0) {
        guestsList.innerHTML = '<p class="text-gray-500">No guests added yet.</p>';
        return;
    }

    guestsList.innerHTML = event.guests.map(guest => `
        <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg mb-4">
            <div>
                <h3 class="font-semibold">${guest.name}</h3>
                <p class="text-sm text-gray-500">${guest.count} guest${guest.count > 1 ? 's' : ''}</p>
                <p class="text-sm ${guest.checkedIn ? 'text-green-500' : 'text-gray-500'}">
                    ${guest.checkedIn ? 'Checked in' : 'Not checked in'}
                </p>
            </div>
            <div class="flex space-x-2">
                <button onclick="showQRCode('${currentEventId}', '${guest.id}')" 
                        class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                    Show QR
                </button>
            </div>
        </div>
    `).join('');
}

function showQRCode(eventId, guestId) {
    const username = localStorage.getItem('username');
    console.log('Showing QR code for event:', eventId, 'guest:', guestId);
    const events = JSON.parse(localStorage.getItem(`events_${username}`) || '[]');
    const event = events.find(e => e.id === eventId);
    const guest = event.guests.find(g => g.id === guestId);

    if (!guest) {
        console.error('Guest not found');
        return;
    }

    const qrData = JSON.stringify({
        eventId: eventId,
        guestId: guestId,
        guestName: guest.name,
        guestCount: guest.count
    });

    const qrCodeContainer = document.getElementById('qrCodeContainer');
    qrCodeContainer.innerHTML = '';

    QRCode.toCanvas(qrCodeContainer, qrData, {
        width: 200,
        margin: 2,
        color: {
            dark: '#000000',
            light: '#ffffff'
        }
    }, function (error) {
        if (error) {
            console.error('QR code generation error:', error);
            return;
        }
        document.getElementById('qrCodeModal').classList.remove('hidden');
    });
}

function closeQRCodeModal() {
    document.getElementById('qrCodeModal').classList.add('hidden');
    const qrCodeContainer = document.getElementById('qrCodeContainer');
    qrCodeContainer.innerHTML = '';
}

function saveQRCode() {
    const canvas = document.querySelector('#qrCodeContainer canvas');
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = 'guest-qr-code.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
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