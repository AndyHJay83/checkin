// Global variables
let currentEventId = null;
let editingGuestId = null;

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    currentEventId = urlParams.get('id');
    
    if (!currentEventId) {
        window.location.href = 'settings.html';
        return;
    }

    loadEventDetails();
    loadGuests();

    // Event listeners
    document.getElementById('addGuestBtn').addEventListener('click', showAddGuestModal);
    document.getElementById('cancelAddGuest').addEventListener('click', closeAddGuestModal);
    document.getElementById('confirmAddGuest').addEventListener('click', addGuest);
});

// Event functions
function loadEventDetails() {
    const events = getEvents();
    const event = events.find(e => e.id === currentEventId);
    if (event) {
        document.getElementById('eventTitle').textContent = event.name;
    }
}

// Guest functions
function loadGuests() {
    const guests = getGuests();
    const guestsList = document.getElementById('guestsList');
    guestsList.innerHTML = '';

    if (guests.length === 0) {
        displayNoGuestsMessage();
        return;
    }

    guests.forEach(guest => displayGuest(guest));
}

function addGuest() {
    const nameInput = document.getElementById('guestNameInput');
    const countInput = document.getElementById('guestCountInput');
    
    if (!nameInput.value.trim()) {
        alert('Please enter a guest name');
        return;
    }

    const guests = getGuests();
    const newGuest = {
        id: Date.now().toString(),
        name: nameInput.value.trim(),
        count: parseInt(countInput.value) || 1,
        checkedIn: false
    };

    guests.push(newGuest);
    saveGuests(guests);
    loadGuests();
    closeAddGuestModal();
    nameInput.value = '';
    countInput.value = '1';
}

function editGuest(guestId) {
    const guests = getGuests();
    const guest = guests.find(g => g.id === guestId);
    if (!guest) return;

    const newName = prompt('Enter new guest name:', guest.name);
    if (!newName || !newName.trim()) return;

    const newCount = prompt('Enter new guest count:', guest.count);
    if (!newCount || isNaN(newCount)) return;

    guest.name = newName.trim();
    guest.count = parseInt(newCount);
    saveGuests(guests);
    loadGuests();
}

function removeGuest(guestId) {
    if (!confirm('Are you sure you want to remove this guest?')) return;
    
    const guests = getGuests();
    const updatedGuests = guests.filter(g => g.id !== guestId);
    saveGuests(updatedGuests);
    loadGuests();
}

// Modal functions
function showAddGuestModal() {
    document.getElementById('addGuestModal').classList.remove('hidden');
}

function closeAddGuestModal() {
    document.getElementById('addGuestModal').classList.add('hidden');
}

function showQRCodeModal() {
    document.getElementById('qrCodeModal').classList.remove('hidden');
}

function closeQRCodeModal() {
    document.getElementById('qrCodeModal').classList.add('hidden');
    document.getElementById('qrCodeContainer').innerHTML = '';
}

// QR Code functions
function showQRCode(guestId) {
    const guests = getGuests();
    const guest = guests.find(g => g.id === guestId);
    if (!guest) return;

    const qrCodeContainer = document.getElementById('qrCodeContainer');
    qrCodeContainer.innerHTML = '';
    
    new QRCode(qrCodeContainer, {
        text: JSON.stringify({
            eventId: currentEventId,
            guestId: guest.id,
            name: guest.name,
            count: guest.count
        }),
        width: 256,
        height: 256,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });

    showQRCodeModal();
}

function saveQRCode() {
    const canvas = document.querySelector('#qrCodeContainer canvas');
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = 'guest-qr-code.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
}

// UI functions
function displayGuests(guests) {
    const guestsList = document.getElementById('guestsList');
    guestsList.innerHTML = '';
    guests.forEach(guest => displayGuest(guest));
}

function displayNoGuestsMessage() {
    const guestsList = document.getElementById('guestsList');
    guestsList.innerHTML = '<p class="text-center text-gray-500">No guests added yet</p>';
}

function displayGuest(guest) {
    const guestsList = document.getElementById('guestsList');
    const guestElement = document.createElement('div');
    guestElement.className = 'bg-white p-4 rounded-lg shadow';
    guestElement.innerHTML = `
        <div class="flex justify-between items-center">
            <div>
                <h3 class="text-lg font-semibold text-gray-800">${guest.name}</h3>
                <p class="text-gray-600">Number of guests: ${guest.count}</p>
            </div>
            <div class="flex space-x-2">
                <button onclick="editGuest('${guest.id}')" class="px-3 py-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600">Edit</button>
                <button onclick="removeGuest('${guest.id}')" class="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600">Remove</button>
                <button onclick="showQRCode('${guest.id}')" class="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600">Show QR</button>
            </div>
        </div>
    `;
    guestsList.appendChild(guestElement);
}

// Storage functions
function saveGuests(guests) {
    const events = getEvents();
    const eventIndex = events.findIndex(e => e.id === currentEventId);
    if (eventIndex === -1) return;
    
    events[eventIndex].guests = guests;
    localStorage.setItem('events', JSON.stringify(events));
}

function getGuests() {
    const events = getEvents();
    const event = events.find(e => e.id === currentEventId);
    return event ? event.guests || [] : [];
}

function getEvents() {
    const events = localStorage.getItem('events');
    return events ? JSON.parse(events) : [];
} 