// Global variables
let currentEventId = null;
let editingGuestId = null;

// Check if user is logged in
const token = localStorage.getItem('token');
if (!token) {
    window.location.href = 'index.html';
}

// API configuration
const API_URL = 'http://localhost:3000/api';

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    // Get event ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    currentEventId = urlParams.get('eventId');

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
async function loadEventDetails() {
    try {
        const response = await fetch(`${API_URL}/events`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to load events');
        }
        
        const events = await response.json();
        const event = events.find(e => e.id === currentEventId);
        
        if (!event) {
            throw new Error('Event not found');
        }
        
        document.getElementById('eventTitle').textContent = event.name;
        loadGuests(event.guests || []);
    } catch (error) {
        console.error('Error loading event details:', error);
        alert('Error loading event details. Please try again.');
    }
}

// Function to load guests
function loadGuests(guests) {
    const guestsList = document.getElementById('guestsList');
    guestsList.innerHTML = '';
    
    if (guests.length === 0) {
        guestsList.innerHTML = '<p class="text-gray-500">No guests added yet</p>';
        return;
    }
    
    guests.forEach(guest => {
        const guestCard = document.createElement('div');
        guestCard.className = 'bg-white p-4 rounded-lg shadow mb-4';
        guestCard.innerHTML = `
            <div class="flex justify-between items-center">
                <div>
                    <h3 class="text-lg font-semibold">${guest.firstName} ${guest.lastName}</h3>
                    <p class="text-gray-600">${guest.ticketCount} ticket(s)</p>
                    <p class="text-sm ${guest.checkedIn ? 'text-green-500' : 'text-red-500'}">
                        ${guest.checkedIn ? 'Checked In' : 'Not Checked In'}
                    </p>
                </div>
                <div class="flex space-x-2">
                    <button onclick="showQRCode('${guest.id}')" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                        Show QR
                    </button>
                    <button onclick="editGuest('${guest.id}')" class="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600">
                        Edit
                    </button>
                    <button onclick="deleteGuest('${guest.id}')" class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
                        Delete
                    </button>
                </div>
            </div>
        `;
        guestsList.appendChild(guestCard);
    });
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
function showQRCode(guestId) {
    const guest = currentEvent.guests.find(g => g.id === guestId);
    if (!guest) return;
    
    const qrData = JSON.stringify({
        eventId,
        guestId,
        firstName: guest.firstName,
        lastName: guest.lastName,
        ticketCount: guest.ticketCount
    });
    
    const qrCodeContainer = document.getElementById('qrCodeContainer');
    qrCodeContainer.innerHTML = '';
    
    new QRCode(qrCodeContainer, {
        text: qrData,
        width: 256,
        height: 256
    });
    
    document.getElementById('qrCodeModal').classList.remove('hidden');
}

// Function to close QR code modal
function closeQRCodeModal() {
    document.getElementById('qrCodeModal').classList.add('hidden');
}

// Function to save QR code
function saveQRCode() {
    const qrCodeContainer = document.getElementById('qrCodeContainer');
    const canvas = qrCodeContainer.querySelector('canvas');
    
    const link = document.createElement('a');
    link.download = 'guest-qr-code.png';
    link.href = canvas.toDataURL();
    link.click();
}

// Function to logout
function logout() {
    localStorage.removeItem('token');
    window.location.href = 'index.html';
} 