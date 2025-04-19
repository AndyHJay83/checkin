let html5QrcodeScanner = null;

// Function to start scanning
function startScanning() {
    const reader = document.getElementById('reader');
    const startButton = document.getElementById('startScanning');
    const stopButton = document.getElementById('stopScanning');
    
    // Hide the start button and show the scanner and stop button
    startButton.classList.add('hidden');
    stopButton.classList.remove('hidden');
    reader.classList.remove('hidden');
    
    // Initialize the scanner with back camera
    html5QrcodeScanner = new Html5QrcodeScanner(
        "reader",
        {
            fps: 10,
            qrbox: 250,
            aspectRatio: 1.0,
            videoConstraints: {
                facingMode: "environment"
            }
        },
        false
    );
    
    // Start scanning
    html5QrcodeScanner.render(onScanSuccess, onScanFailure);
}

// Function to stop scanning
function stopScanning() {
    const reader = document.getElementById('reader');
    const startButton = document.getElementById('startScanning');
    const stopButton = document.getElementById('stopScanning');
    
    // Stop the scanner
    if (html5QrcodeScanner) {
        html5QrcodeScanner.clear();
        html5QrcodeScanner = null;
    }
    
    // Show the start button and hide the scanner and stop button
    startButton.classList.remove('hidden');
    stopButton.classList.add('hidden');
    reader.classList.add('hidden');
}

// Function to handle successful scan
function onScanSuccess(decodedText, decodedResult) {
    try {
        const guestData = JSON.parse(decodedText);
        showGuestInfo(guestData);
        updateGuestStatus(guestData);
        
        // Stop scanning after successful scan
        stopScanning();
    } catch (error) {
        console.error('Invalid QR code data');
    }
}

// Function to handle scan failure
function onScanFailure(error) {
    console.warn(`QR scan failed: ${error}`);
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