let html5QrcodeScanner = null;
const API_URL = 'http://localhost:3000/api';

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
async function onScanSuccess(decodedText, decodedResult) {
    try {
        const guestData = JSON.parse(decodedText);
        showGuestInfo(guestData);
        await updateGuestStatus(guestData);
        
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

// Function to update guest status in the API
async function updateGuestStatus(guestData) {
    try {
        const username = localStorage.getItem('username');
        if (!username) {
            throw new Error('User not logged in');
        }

        // Get current events
        const response = await fetch(`${API_URL}/events/${username}`);
        if (!response.ok) throw new Error('Failed to load events');
        const events = await response.json();
        
        // Find the event and update the guest's check-in status
        const event = events.find(e => e.id === guestData.eventId);
        if (!event) throw new Error('Event not found');
        
        const guest = event.guests.find(g => g.id === guestData.id);
        if (!guest) throw new Error('Guest not found');
        
        // Update guest status
        guest.checkedIn = true;
        
        // Save updated event
        const saveResponse = await fetch(`${API_URL}/event`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username,
                event
            }),
        });
        
        if (!saveResponse.ok) throw new Error('Failed to save event');
        
        // Show success message
        alert('Guest checked in successfully!');
    } catch (error) {
        console.error('Error updating guest status:', error);
        alert('Failed to update guest status');
    }
}

// Start scanning when the page loads
document.addEventListener('DOMContentLoaded', startScanning); 