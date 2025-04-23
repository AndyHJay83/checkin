// GitHub API Configuration
const REPO_OWNER = 'andyjay83';
const REPO_NAME = 'checkin';
const DATA_FILE = 'events.json';

let currentEventId = null;
let editingGuestId = null;

// Function to get the GitHub token
function getGitHubToken() {
    const token = localStorage.getItem('github_token');
    if (!token) {
        alert('Please set your GitHub token in the settings');
        return null;
    }
    return token;
}

// Function to fetch events from the backend server
async function fetchEvents() {
    try {
        const response = await fetch('http://localhost:3001/api/events');
        if (!response.ok) {
            throw new Error('Failed to fetch events');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching events:', error);
        return [];
    }
}

// Function to save events using the backend server
async function saveEvents(events) {
    try {
        const response = await fetch('http://localhost:3001/api/events', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(events)
        });

        if (!response.ok) {
            throw new Error('Failed to save events');
        }
    } catch (error) {
        console.error('Error saving events:', error);
        throw error;
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Get event ID from URL
        const urlParams = new URLSearchParams(window.location.search);
        currentEventId = urlParams.get('id');

        if (!currentEventId) {
            alert('No event ID provided');
            window.location.href = 'settings.html';
            return;
        }

        // Load event details and guests
        await loadEventDetails();
        await loadGuests();

        // Add event listeners
        document.getElementById('addGuestBtn').addEventListener('click', () => {
            document.getElementById('guestForm').classList.remove('hidden');
        });

        document.getElementById('cancelAddGuest').addEventListener('click', () => {
            document.getElementById('guestForm').classList.add('hidden');
            resetGuestForm();
        });
    } catch (error) {
        console.error('Error initializing page:', error);
        alert('Error loading event details. Please try again.');
    }
});

// Function to load event details
async function loadEventDetails() {
    try {
        const events = await fetchEvents();
        const event = events.find(e => e.id === currentEventId);

        if (!event) {
            alert('Event not found');
            window.location.href = 'settings.html';
            return;
        }

        // Initialize guests array if it doesn't exist
        if (!event.guests) {
            event.guests = [];
            await saveEvents(events);
        }

        document.getElementById('eventName').textContent = event.name;
        document.getElementById('eventGuests').textContent = `${event.guests.length} guest(s)`;
    } catch (error) {
        console.error('Error loading event details:', error);
        throw error;
    }
}

// Function to load guests
async function loadGuests() {
    try {
        const events = await fetchEvents();
        const event = events.find(e => e.id === currentEventId);
        const guestsList = document.getElementById('guestsList');

        if (!event || !event.guests || !event.guests.length) {
            guestsList.innerHTML = '<p class="text-gray-500">No guests added yet</p>';
            return;
        }

        guestsList.innerHTML = event.guests.map(guest => `
            <div class="bg-white p-4 rounded-md shadow">
                <div class="flex justify-between items-start">
                    <div>
                        <h3 class="font-semibold text-dark-green">${guest.firstName} ${guest.lastName}</h3>
                        <p class="text-sm text-dark-green">${guest.ticketCount} ticket(s)</p>
                    </div>
                    <div class="flex space-x-2">
                        <button onclick="editGuest('${guest.id}')" 
                                class="text-blue-500 hover:text-blue-700">
                            Edit
                        </button>
                        <button onclick="removeGuest('${guest.id}')" 
                                class="text-red-500 hover:text-red-700">
                            Remove
                        </button>
                        <button onclick="showQRCode('${guest.id}')" 
                                class="text-green-500 hover:text-green-700">
                            Show QR
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading guests:', error);
        throw error;
    }
}

// Function to handle adding/editing guest
async function handleAddGuest() {
    try {
        const firstName = document.getElementById('firstName').value.trim();
        const lastName = document.getElementById('lastName').value.trim();
        const ticketCount = parseInt(document.getElementById('ticketCount').value);

        if (!firstName || !lastName || isNaN(ticketCount) || ticketCount < 1) {
            alert('Please fill in all fields correctly');
            return;
        }

        const events = await fetchEvents();
        const event = events.find(e => e.id === currentEventId);

        if (editingGuestId) {
            // Update existing guest
            const guestIndex = event.guests.findIndex(g => g.id === editingGuestId);
            if (guestIndex !== -1) {
                event.guests[guestIndex] = {
                    ...event.guests[guestIndex],
                    firstName,
                    lastName,
                    ticketCount
                };
            }
        } else {
            // Add new guest
            const newGuest = {
                id: Date.now().toString(),
                firstName,
                lastName,
                ticketCount,
                qrCode: generateQRCode(`${firstName} ${lastName} - ${ticketCount} tickets`)
            };
            event.guests.push(newGuest);
        }

        await saveEvents(events);
        await loadGuests();
        document.getElementById('guestForm').classList.add('hidden');
        resetGuestForm();
    } catch (error) {
        console.error('Error adding/editing guest:', error);
        alert('Error saving guest. Please try again.');
    }
}

// Function to edit guest
function editGuest(guestId) {
    editingGuestId = guestId;
    const events = JSON.parse(localStorage.getItem('events') || '[]');
    const event = events.find(e => e.id === currentEventId);
    const guest = event.guests.find(g => g.id === guestId);

    document.getElementById('firstName').value = guest.firstName;
    document.getElementById('lastName').value = guest.lastName;
    document.getElementById('ticketCount').value = guest.ticketCount;
    document.getElementById('guestForm').classList.remove('hidden');
}

// Function to remove guest
async function removeGuest(guestId) {
    if (confirm('Are you sure you want to remove this guest?')) {
        try {
            const events = await fetchEvents();
            const event = events.find(e => e.id === currentEventId);
            event.guests = event.guests.filter(g => g.id !== guestId);
            await saveEvents(events);
            await loadGuests();
        } catch (error) {
            console.error('Error removing guest:', error);
            alert('Error removing guest. Please try again.');
        }
    }
}

// Function to reset guest form
function resetGuestForm() {
    document.getElementById('firstName').value = '';
    document.getElementById('lastName').value = '';
    document.getElementById('ticketCount').value = '1';
    editingGuestId = null;
}

// Function to generate QR code
function generateQRCode(text) {
    const qr = new QRCode(document.createElement('div'), {
        text: text,
        width: 128,
        height: 128,
        colorDark: '#000000',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.H
    });
    return qr._el.firstChild.toDataURL();
}

// Function to show QR code
function showQRCode(guestId) {
    const events = JSON.parse(localStorage.getItem('events') || '[]');
    const event = events.find(e => e.id === currentEventId);
    const guest = event.guests.find(g => g.id === guestId);

    const qrCodeContainer = document.getElementById('qrCodeContainer');
    qrCodeContainer.innerHTML = '';
    
    const qr = new QRCode(qrCodeContainer, {
        text: `${guest.firstName} ${guest.lastName} - ${guest.ticketCount} tickets`,
        width: 256,
        height: 256,
        colorDark: '#000000',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.H
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
    const qrCodeImage = qrCodeContainer.querySelector('img');
    
    if (qrCodeImage) {
        const link = document.createElement('a');
        link.href = qrCodeImage.src;
        link.download = 'guest-qr-code.png';
        link.click();
    }
} 