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

Codeing project to build:

WorldPin Project Description:

WorldPic Web page should be a basic map of the world. A user should be able to place a red drop pin anywhere on the world map. When a user places a red drop pin on the map, the user should be able to add their name, photo, and location to that position on the map where the red drop pin was placed. Every red drop pin should remain there after it is placed. and if a red drop pin is selected, a pop-up should open up with the name of the person, photo, and location.

I want to build a very simple basic demo version. Here is what I want:

I want to have a basic world map. The world map is just a background with the outline of a flat map.
I want the ability to add red drop pins on the map and a pop-up to appear for me to fill in my name, photo, and location. Each red drop pin should be a "new event" in isolation from the other red drop pins around it. (I want the ability to upload a photo - Open to ways to store the photos, I am thinking github directly if possible)
I want the red drop pin to stay on the map after I place it, and also have the ability to delete that red drop pin in the UI .
I also need to be able to have multiple drop pins on the map.
