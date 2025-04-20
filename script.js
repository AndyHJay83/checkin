let html5QrcodeScanner = null;

// Function to start scanning
async function startScanning() {
    try {
        // Initialize the scanner with back camera
        html5QrcodeScanner = new Html5Qrcode("reader");
        
        // Get available cameras
        const cameras = await Html5Qrcode.getCameras();
        if (cameras && cameras.length > 0) {
            // Find the back camera
            const backCamera = cameras.find(camera => 
                camera.label.toLowerCase().includes('back') || 
                camera.label.toLowerCase().includes('rear')
            ) || cameras[0]; // Fallback to first camera if no back camera found
            
            // Start scanning with the selected camera
            await html5QrcodeScanner.start(
                { deviceId: { exact: backCamera.id } },
                { fps: 10, qrbox: 250 },
                onScanSuccess,
                onScanFailure
            );
        } else {
            console.error('No cameras found');
        }
    } catch (error) {
        console.error('Error starting scanner:', error);
    }
}

// Function to handle successful scan
function onScanSuccess(decodedText, decodedResult) {
    try {
        const guestData = JSON.parse(decodedText);
        showGuestInfo(guestData);
        updateGuestStatus(guestData);
        
        // Stop scanning after successful scan
        if (html5QrcodeScanner) {
            html5QrcodeScanner.stop();
            html5QrcodeScanner = null;
        }
        
        // Restart scanning after a short delay
        setTimeout(startScanning, 2000);
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

// Start scanning when the page loads
document.addEventListener('DOMContentLoaded', startScanning); 