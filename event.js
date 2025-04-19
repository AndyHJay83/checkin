// Global variables
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
    console.log('Current username:', username);

    // Get event ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    currentEventId = urlParams.get('id');
    console.log('Current event ID:', currentEventId);

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

        try {
            // Get current event
            const username = localStorage.getItem('username');
            const events = JSON.parse(localStorage.getItem(`events_${username}`) || '[]');
            
            // Find current event
            const eventIndex = events.findIndex(e => e.id === currentEventId);
            if (eventIndex === -1) throw new Error('Event not found');
            
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
                const newGuest = {
                    id: Date.now().toString(),
                    name: guestName,
                    count: guestCount,
                    checkedIn: false
                };
                events[eventIndex].guests.push(newGuest);
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
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred. Please try again.');
        }
    });

    // Load event details and guests
    loadEventDetails();
    loadGuests();
});

// Function to load event details
function loadEventDetails() {
    try {
        const username = localStorage.getItem('username');
        const events = JSON.parse(localStorage.getItem(`events_${username}`) || '[]');
        const currentEvent = events.find(event => event.id === currentEventId);

        if (currentEvent) {
            document.getElementById('eventTitle').textContent = currentEvent.name;
        } else {
            window.location.href = 'settings.html';
        }
    } catch (error) {
        console.error('Error loading event details:', error);
        alert('Failed to load event details');
    }
}

// Function to load guests
function loadGuests() {
    try {
        const username = localStorage.getItem('username');
        const events = JSON.parse(localStorage.getItem(`events_${username}`) || '[]');
        const event = events.find(e => e.id === currentEventId);

        if (!event) {
            console.log('Event not found');
            document.getElementById('guestsList').innerHTML = '<p class="text-gray-500">Event not found.</p>';
            return;
        }

        if (!event.guests) {
            console.log('No guests array found in event, initializing empty array');
            event.guests = [];
            // Save the event with empty guests array
            localStorage.setItem(`events_${username}`, JSON.stringify(events));
        }

        if (event.guests.length === 0) {
            console.log('No guests in the array');
            document.getElementById('guestsList').innerHTML = '<p class="text-gray-500">No guests added yet.</p>';
            return;
        }

        console.log('Guests to display:', event.guests);
        document.getElementById('guestsList').innerHTML = event.guests.map(guest => `
            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg mb-4">
                <div>
                    <h3 class="font-semibold">${guest.name}</h3>
                    <p class="text-sm text-gray-500">${guest.count} guest${guest.count > 1 ? 's' : ''}</p>
                    <p class="text-sm ${guest.checkedIn ? 'text-green-500' : 'text-gray-500'}">
                        ${guest.checkedIn ? 'Checked in' : 'Not checked in'}
                    </p>
                </div>
                <div class="flex space-x-2">
                    <button onclick="showQRCode(${JSON.stringify(guest).replace(/"/g, '&quot;')})" 
                            class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                        Show QR
                    </button>
                    <button onclick="editGuest('${guest.id}')" 
                            class="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600">
                        Edit
                    </button>
                    <button onclick="removeGuest('${guest.id}')" 
                            class="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600">
                        Remove
                    </button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading guests:', error);
        alert('Failed to load guests');
    }
}

// Function to edit a guest
function editGuest(guestId) {
    try {
        const username = localStorage.getItem('username');
        const events = JSON.parse(localStorage.getItem(`events_${username}`) || '[]');
        const event = events.find(e => e.id === currentEventId);
        const guest = event.guests.find(g => g.id === guestId);

        if (guest) {
            editingGuestId = guestId;
            document.getElementById('guestNameInput').value = guest.name;
            document.getElementById('guestCountInput').value = guest.count;
            document.getElementById('confirmAddGuest').textContent = 'Update';
            document.getElementById('addGuestModal').classList.remove('hidden');
        }
    } catch (error) {
        console.error('Error editing guest:', error);
        alert('Failed to load guest details');
    }
}

// Function to remove a guest
function removeGuest(guestId) {
    if (!confirm('Are you sure you want to remove this guest?')) return;

    try {
        const username = localStorage.getItem('username');
        const events = JSON.parse(localStorage.getItem(`events_${username}`) || '[]');
        const event = events.find(e => e.id === currentEventId);

        if (event) {
            event.guests = event.guests.filter(g => g.id !== guestId);
            
            // Save back to localStorage
            localStorage.setItem(`events_${username}`, JSON.stringify(events));
            
            // Refresh guests list
            loadGuests();
        }
    } catch (error) {
        console.error('Error removing guest:', error);
        alert('Failed to remove guest');
    }
}

// Function to show QR code
function showQRCode(guestData) {
    const modal = document.getElementById('qrCodeModal');
    const qrCodeContainer = document.getElementById('qrCodeContainer');
    
    // Get event data
    const username = localStorage.getItem('username');
    const events = JSON.parse(localStorage.getItem(`events_${username}`) || '[]');
    const event = events.find(e => e.id === currentEventId);
    
    if (!event) {
        console.error('Event not found');
        return;
    }
    
    // Create QR data with the structure expected by script.js
    const qrData = {
        eventId: event.id,
        id: guestData.id,
        firstName: guestData.name.split(' ')[0],
        lastName: guestData.name.split(' ').slice(1).join(' '),
        ticketCount: guestData.count
    };
    
    // Clear previous QR code
    qrCodeContainer.innerHTML = '';
    
    // Create QR code with combined data
    new QRCode(qrCodeContainer, {
        text: JSON.stringify(qrData),
        width: 256,
        height: 256,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });
    
    // Show modal
    modal.classList.remove('hidden');
}

// Function to close QR code modal
function closeQRCodeModal() {
    const modal = document.getElementById('qrCodeModal');
    modal.classList.add('hidden');
}

// Function to save QR code
function saveQRCode() {
    const qrCodeContainer = document.getElementById('qrCodeContainer');
    const canvas = qrCodeContainer.querySelector('canvas');
    
    // Create a temporary link to download the QR code
    const link = document.createElement('a');
    link.download = 'guest-qr-code.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
} 