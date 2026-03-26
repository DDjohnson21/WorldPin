import { useState, useEffect, useMemo } from "react";
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
import EditPinForm from "./components/EditPinForm";
import { hybridDataService } from "./services/hybridData";
import LoginModal from "./components/LoginModal";

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
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
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
  imagePath: string;
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

const USERNAME = import.meta.env.VITE_USERNAME_LOGIN || "WorldTravelerGuide401";
const PASSWORD = import.meta.env.VITE_PASSWORD_LOGIN || "Flight@Rome88";

function App() {
  const [pins, setPins] = useState<Pin[]>([]);
  const [selectedPosition, setSelectedPosition] = useState<
    [number, number] | null
  >(null);
  const [editingPin, setEditingPin] = useState<Pin | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const pinDictionary = useMemo(() => {
    const dict: Record<
      string,
      {
        name: string;
        image: string;
        description: string;
        position: [number, number];
      }
    > = {};
    pins.forEach((p) => {
      dict[p.id] = {
        name: p.name,
        image: p.imagePath,
        description: p.location,
        position: p.position,
      };
    });
    return dict;
  }, [pins]);

  useEffect(() => {
    console.log('Pin dictionary', pinDictionary);
  }, [pinDictionary]);

  // Define world bounds
  const worldBounds: [[number, number], [number, number]] = [
    [-85, -180],
    [85, 180],
  ];

  useEffect(() => {
    loadPins();
  }, []);

  const loadPins = async () => {
    try {
      const loadedPins = await hybridDataService.getPins();
      setPins(loadedPins);

      // Log which service is being used
      const serviceInfo = hybridDataService.getServiceInfo();
      console.log(`Using ${serviceInfo.type} data service`);
    } catch (error) {
      console.error("Error loading pins:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMapClick = (lat: number, lng: number) => {
    setSelectedPosition([lat, lng]);
  };

  const handleAddPin = async (
    pinData: Omit<Pin, "id" | "position" | "imagePath">
  ) => {
    if (selectedPosition) {
      try {
        const pinId = Date.now().toString();
        const imagePath = await hybridDataService.uploadImage(
          await fetch(pinData.photo)
            .then((r) => r.blob())
            .then(
              (blob) => new File([blob], "image.jpg", { type: "image/jpeg" })
            ),
          pinId
        );

        const newPin: Pin = {
          id: pinId,
          position: selectedPosition,
          ...pinData,
          imagePath,
        };

        await hybridDataService.savePin(newPin);
        setPins([...pins, newPin]);
        setSelectedPosition(null);
      } catch (error) {
        console.error("Error adding pin:", error);
        alert("Failed to add pin. Please try again.");
      }
    }
  };

  const handleDeletePin = async (id: string) => {
    try {
      await hybridDataService.deletePin(id);
      setPins(pins.filter((pin) => pin.id !== id));
    } catch (error) {
      console.error("Error deleting pin:", error);
      alert("Failed to delete pin. Please try again.");
    }
  };

  const handleEditPin = async (pinData: {
    name: string;
    photo: string;
    location: string;
    removeImage: boolean;
  }) => {
    if (editingPin) {
      try {
        let imagePath = editingPin.imagePath;

        // Handle image changes
        if (pinData.removeImage) {
          imagePath = "";
        } else if (pinData.photo !== editingPin.imagePath) {
          // New image uploaded
          const file = await fetch(pinData.photo)
            .then((r) => r.blob())
            .then(
              (blob) => new File([blob], "image.jpg", { type: "image/jpeg" })
            );
          imagePath = await hybridDataService.uploadImage(file, editingPin.id);
        }

        const updatedPin: Pin = {
          ...editingPin,
          name: pinData.name,
          location: pinData.location,
          imagePath,
        };

        await hybridDataService.updatePin(editingPin.id, updatedPin);
        setPins(
          pins.map((pin) => (pin.id === editingPin.id ? updatedPin : pin))
        );
        setEditingPin(null);
      } catch (error) {
        console.error("Error updating pin:", error);
        alert("Failed to update pin. Please try again.");
      }
    }
  };

  if (!isAuthenticated) {
    return (
      <LoginModal
        onLogin={(u, p) => {
          if (u === USERNAME && p === PASSWORD) setIsAuthenticated(true);
          else alert("Invalid credentials");
        }}
      />
    );
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

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
                  {pin.imagePath && (
                    <img
                      src={pin.imagePath}
                      alt={pin.name}
                      style={{
                        width: "100%",
                        height: "auto",
                        maxHeight: "300px",
                        borderRadius: "8px",
                        display: "block",
                        margin: "10px 0",
                        objectFit: "cover",
                      }}
                    />
                  )}
                  <p>{pin.location}</p>
                  <div
                    style={{ display: "flex", gap: "8px", marginTop: "8px" }}
                  >
                    <button
                      onClick={() => setEditingPin(pin)}
                      style={{
                        padding: "4px 8px",
                        background: "#007bff",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "12px",
                      }}
                    >
                      Edit Pin
                    </button>
                    <button
                      onClick={() => handleDeletePin(pin.id)}
                      style={{
                        padding: "4px 8px",
                        background: "#dc3545",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "12px",
                      }}
                    >
                      Delete Pin
                    </button>
                  </div>
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
      {editingPin && (
        <EditPinForm
          pin={editingPin}
          onSubmit={handleEditPin}
          onCancel={() => setEditingPin(null)}
        />
      )}
    </AppContainer>
  );
}

export default App;
