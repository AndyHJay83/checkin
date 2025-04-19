# Event Check-In App

A web-based application for managing event check-ins using QR codes.

## Features

- Create and manage event groups
- Add guests with their details
- Generate QR codes for each guest
- Scan QR codes for check-in
- Real-time check-in status updates
- Mobile-friendly interface

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd checkin
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Start the development server:
```bash
npm start
# or
yarn start
```

The app will be available at `http://localhost:3000`

## Usage

### Settings Page
1. Click the settings icon (cog) in the top right corner
2. Create a new group by entering a name and clicking "Create Group"
3. Select a group to add guests
4. Add guests by filling in their details:
   - First Name
   - Last Name
   - Number of guests
5. Generate and copy QR codes for each guest

### Check-In Page
1. Use the camera to scan a guest's QR code
2. View guest details and check-in status
3. Click "Check In" to mark a guest as checked in

## Technologies Used

- React
- TypeScript
- Tailwind CSS
- react-qr-reader
- react-qr-code

## License

MIT 