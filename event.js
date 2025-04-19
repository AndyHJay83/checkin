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

        // Get events from localStorage
        const events = JSON.parse(localStorage.getItem(`events_${username}`) || '[]');
        console.log('Current events:', events);
        
        // Find current event and add/edit guest
        const eventIndex = events.findIndex(e => e.id === currentEventId);
        console.log('Event index:', eventIndex);
        
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
                    console.log('Initializing guests array for event');
                    events[eventIndex].guests = [];
                }
                const newGuest = {
                    id: Date.now().toString(),
                    name: guestName,
                    count: guestCount,
                    checkedIn: false
                };
                console.log('Adding new guest:', newGuest);
                events[eventIndex].guests.push(newGuest);
            }
        }

        // Save back to localStorage
        console.log('Saving updated events:', events);
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

// Function to load guests
function loadGuests() {
    const guestList = document.getElementById('guestList');
    const template = document.getElementById('guestItemTemplate');
    guestList.innerHTML = '';

    const event = getEvent();
    if (!event || !event.guests) return;

    event.guests.forEach(guest => {
        const clone = template.content.cloneNode(true);
        const guestElement = clone.querySelector('div');
        
        // Set guest information
        const nameElement = guestElement.querySelector('h3');
        const emailElement = guestElement.querySelector('p:nth-child(2)');
        const ticketsElement = guestElement.querySelector('p:nth-child(3)');
        
        nameElement.textContent = guest.name;
        emailElement.textContent = `Email: ${guest.email || 'N/A'}`;
        ticketsElement.textContent = `Tickets: ${guest.tickets || 1}`;
        
        // Update button onclick handlers
        const buttons = guestElement.querySelectorAll('button');
        buttons[0].setAttribute('onclick', `generateTicketQRCode('${guest.id}')`);
        buttons[1].setAttribute('onclick', `editGuest('${guest.id}')`);
        buttons[2].setAttribute('onclick', `removeGuest('${guest.id}')`);
        
        guestList.appendChild(guestElement);
    });

    // If no guests, show a message
    if (event.guests.length === 0) {
        guestList.innerHTML = '<p class="text-gray-500 text-center">No guests added yet.</p>';
    }
}

// Function to edit a guest
function editGuest(guestId) {
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
}

// Function to remove a guest
function removeGuest(guestId) {
    if (confirm('Are you sure you want to remove this guest?')) {
        const username = localStorage.getItem('username');
        const events = JSON.parse(localStorage.getItem(`events_${username}`) || '[]');
        const eventIndex = events.findIndex(e => e.id === currentEventId);
        
        if (eventIndex !== -1) {
            events[eventIndex].guests = events[eventIndex].guests.filter(g => g.id !== guestId);
            localStorage.setItem(`events_${username}`, JSON.stringify(events));
            loadGuests();
        }
    }
}

// Function to generate and download ticket QR code
function generateTicketQRCode(guestId) {
    const username = localStorage.getItem('username');
    const events = JSON.parse(localStorage.getItem(`events_${username}`) || '[]');
    const event = events.find(e => e.id === currentEventId);
    const guest = event.guests.find(g => g.id === guestId);

    if (guest) {
        // Create ticket data
        const ticketData = {
            eventId: currentEventId,
            eventName: event.name,
            guestId: guest.id,
            guestName: guest.name,
            ticketCount: guest.count
        };

        // Create QR code container
        const qrCodeContainer = document.createElement('div');
        qrCodeContainer.id = 'ticketQRCode';
        
        // Generate QR code
        new QRCode(qrCodeContainer, {
            text: JSON.stringify(ticketData),
            width: 256,
            height: 256,
            colorDark: '#000000',
            colorLight: '#ffffff',
            correctLevel: QRCode.CorrectLevel.H
        });

        // Create ticket HTML
        const ticketHTML = `
            <div class="bg-white p-8 rounded-lg shadow-lg max-w-md mx-auto">
                <h2 class="text-2xl font-bold mb-4">${event.name}</h2>
                <div class="mb-4">
                    <p class="text-lg"><strong>Guest:</strong> ${guest.name}</p>
                    <p class="text-lg"><strong>Number of Tickets:</strong> ${guest.count}</p>
                </div>
                <div class="flex justify-center mb-4">
                    ${qrCodeContainer.innerHTML}
                </div>
                <p class="text-sm text-gray-500 text-center">Scan this QR code at the event entrance</p>
            </div>
        `;

        // Create a new window with the ticket
        const ticketWindow = window.open('', '_blank');
        ticketWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Event Ticket - ${guest.name}</title>
                <script src="https://cdn.tailwindcss.com"></script>
                <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
            </head>
            <body class="bg-gray-100 p-8">
                ${ticketHTML}
                <div class="text-center mt-4">
                    <button onclick="window.print()" class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                        Print Ticket
                    </button>
                </div>
            </body>
            </html>
        `);
    }
}

// Function to show QR code modal
function showQRCode(eventId, guestId) {
    const username = localStorage.getItem('username');
    const events = JSON.parse(localStorage.getItem(`events_${username}`) || '[]');
    const event = events.find(e => e.id === eventId);
    const guest = event.guests.find(g => g.id === guestId);

    if (guest) {
        // Create ticket data
        const ticketData = {
            eventId: eventId,
            eventName: event.name,
            guestId: guest.id,
            guestName: guest.name,
            ticketCount: guest.count
        };

        const qrCodeContainer = document.getElementById('qrCodeContainer');
        qrCodeContainer.innerHTML = '';
        
        // Generate QR code
        new QRCode(qrCodeContainer, {
            text: JSON.stringify(ticketData),
            width: 200,
            height: 200,
            colorDark: '#000000',
            colorLight: '#ffffff',
            correctLevel: QRCode.CorrectLevel.H
        });

        document.getElementById('qrCodeModal').classList.remove('hidden');
    }
}

// Function to close QR code modal
function closeQRCodeModal() {
    document.getElementById('qrCodeModal').classList.add('hidden');
}

// Function to save QR code
function saveQRCode() {
    const canvas = document.querySelector('#qrCodeContainer canvas');
    const link = document.createElement('a');
    link.download = 'guest-ticket.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
} 