# WorldPin

A simple web application that allows users to place pins on a world map and add their information to each pin.

## Features

- Interactive world map using OpenStreetMap
- Place red pins anywhere on the map
- Add your name, photo URL, and location description to each pin
- View pin information in popups
- Delete pins you no longer want to keep
- Multiple pins can be placed on the map

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

## How to Use

1. Click anywhere on the map to place a new pin
2. Fill in the form that appears with:
   - Your name
   - A photo URL (you can use any publicly accessible image URL)
   - A description of the location
3. Click "Add Pin" to save the pin
4. Click on any pin to view its information
5. Use the "Delete Pin" button in the popup to remove a pin

## Technologies Used

- React
- TypeScript
- Leaflet/React-Leaflet for map functionality
- Emotion for styled components
- Vite for build tooling
