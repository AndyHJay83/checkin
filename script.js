// Initialize QR code scanner
const html5QrcodeScanner = new Html5QrcodeScanner(
    "reader", { fps: 10, qrbox: 250 });

// Function to handle successful scan
function onScanSuccess(decodedText, decodedResult) {
    try {
        const guestData = JSON.parse(decodedText);
        showGuestInfo(guestData);
        updateGuestStatus(guestData);
    } catch (error) {
        console.error('Invalid QR code data');
    }
}

// Function to show guest information modal
function showGuestInfo(guestData) {
    const modal = document.getElementById('guestModal');
    const guestInfo = document.getElementById('guestInfo');
    
    guestInfo.innerHTML = `
        <div>
            <p class="text-gray-600">Name</p>
            <p class="text-lg font-semibold">${guestData.firstName} ${guestData.lastName}</p>
        </div>
        <div>
            <p class="text-gray-600">Number of Guests</p>
            <p class="text-lg font-semibold">${guestData.ticketCount}</p>
        </div>
    `;
    
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

// Function to close the modal
function closeModal() {
    const modal = document.getElementById('guestModal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

// Function to update guest status in localStorage
function updateGuestStatus(guestData) {
    let events = JSON.parse(localStorage.getItem('events') || '[]');
    events = events.map(event => {
        if (event.id === guestData.eventId) {
            event.guests = event.guests.map(guest => {
                if (guest.id === guestData.id) {
                    return { ...guest, checkedIn: true };
                }
                return guest;
            });
        }
        return event;
    });
    localStorage.setItem('events', JSON.stringify(events));
}

// Start the scanner
html5QrcodeScanner.render(onScanSuccess); 