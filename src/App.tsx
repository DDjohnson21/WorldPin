import { useState } from "react";
import styled from "@emotion/styled";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Icon } from "leaflet";
import PinForm from "./components/PinForm";

const AppContainer = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
`;

const MapWrapper = styled.div`
  flex: 1;
  width: 100%;
  height: 100%;
`;

const customIcon = new Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface Pin {
  id: string;
  position: [number, number];
  name: string;
  photo: string;
  location: string;
}

function MapEvents({
  onMapClick,
}: {
  onMapClick: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function App() {
  const [pins, setPins] = useState<Pin[]>([]);
  const [selectedPosition, setSelectedPosition] = useState<
    [number, number] | null
  >(null);

  // Define world bounds
  const worldBounds: [[number, number], [number, number]] = [
    [-85, -180],
    [85, 180],
  ];

  const handleMapClick = (lat: number, lng: number) => {
    setSelectedPosition([lat, lng]);
  };

  const handleAddPin = (pinData: Omit<Pin, "id" | "position">) => {
    if (selectedPosition) {
      const newPin: Pin = {
        id: Date.now().toString(),
        position: selectedPosition,
        ...pinData,
      };
      setPins([...pins, newPin]);
      setSelectedPosition(null);
    }
  };

  const handleDeletePin = (id: string) => {
    setPins(pins.filter((pin) => pin.id !== id));
  };

  return (
    <AppContainer>
      <MapWrapper>
        <MapContainer
          center={[20, 0]}
          zoom={2}
          minZoom={2}
          maxBounds={worldBounds}
          maxBoundsViscosity={1.0}
          worldCopyJump={false}
          style={{ height: "100%", width: "100%" }}
        >
          <MapEvents onMapClick={handleMapClick} />
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {pins.map((pin) => (
            <Marker key={pin.id} position={pin.position} icon={customIcon}>
              <Popup>
                <div>
                  <h3>{pin.name}</h3>
                  <img
                    src={pin.photo}
                    alt={pin.name}
                    style={{
                      width: "100%",
                      maxWidth: "200px",
                      borderRadius: "4px",
                    }}
                  />
                  <p>{pin.location}</p>
                  <button onClick={() => handleDeletePin(pin.id)}>
                    Delete Pin
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </MapWrapper>
      {selectedPosition && (
        <PinForm
          onSubmit={handleAddPin}
          onCancel={() => setSelectedPosition(null)}
        />
      )}
    </AppContainer>
  );
}

export default App;
