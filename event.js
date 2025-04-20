// Global variables
let currentEventId = null;
let editingGuestId = null;

// API configuration
const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000/api'
    : 'https://andyjay.github.io/checkin/api';

// Get event ID from URL
const urlParams = new URLSearchParams(window.location.search);
const eventId = urlParams.get('eventId');

// Load event details when page loads
document.addEventListener('DOMContentLoaded', loadEventDetails);

// Function to load event details
async function loadEventDetails() {
    try {
        const response = await fetch(`${API_URL}/events`);
        if (!response.ok) {
            throw new Error('Failed to load events');
        }
        
        const events = await response.json();
        const event = events.find(e => e.id === eventId);
        
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

// Function to add a new guest
async function addGuest() {
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const ticketCount = parseInt(document.getElementById('ticketCount').value);
    
    if (!firstName || !lastName || isNaN(ticketCount) || ticketCount < 1) {
        alert('Please fill in all fields correctly');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/events/${eventId}/guests`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: Date.now().toString(),
                firstName,
                lastName,
                ticketCount,
                checkedIn: false
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to add guest');
        }
        
        // Clear form and hide modal
        document.getElementById('firstName').value = '';
        document.getElementById('lastName').value = '';
        document.getElementById('ticketCount').value = '1';
        document.getElementById('addGuestModal').classList.add('hidden');
        
        // Refresh guests list
        loadEventDetails();
    } catch (error) {
        console.error('Error adding guest:', error);
        alert('Error adding guest. Please try again.');
    }
}

// Function to delete a guest
async function deleteGuest(guestId) {
    if (!confirm('Are you sure you want to delete this guest?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/events/${eventId}/guests/${guestId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error('Failed to delete guest');
        }
        
        loadEventDetails();
    } catch (error) {
        console.error('Error deleting guest:', error);
        alert('Error deleting guest. Please try again.');
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