import pinsData from '../../data/pins.json';

interface LocalPin {
  id: string;
  position: [number, number];
  name: string;
  photo: string;
  location: string;
  imagePath: string;
}

class LocalDataService {
  private pins: LocalPin[] = pinsData.map(pin => ({
    ...pin,
    position: pin.position as [number, number]
  }));

  async getPins(): Promise<LocalPin[]> {
    return this.pins;
  }

  async savePin(pin: LocalPin): Promise<void> {
    this.pins.push(pin);
    // In a real app, you'd save to localStorage or a local database
    console.log('Pin saved locally:', pin);
  }

  async deletePin(pinId: string): Promise<void> {
    this.pins = this.pins.filter(pin => pin.id !== pinId);
    console.log('Pin deleted locally:', pinId);
  }

  async updatePin(pinId: string, updatedData: Partial<LocalPin>): Promise<void> {
    const pinIndex = this.pins.findIndex(pin => pin.id === pinId);
    
    if (pinIndex === -1) {
      throw new Error('Pin not found');
    }

    this.pins[pinIndex] = { ...this.pins[pinIndex], ...updatedData };
    console.log('Pin updated locally:', this.pins[pinIndex]);
  }

  async uploadImage(file: File): Promise<string> {
    // For local development, return a data URL
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}

export const localDataService = new LocalDataService(); 
