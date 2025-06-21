import { githubService } from './github';
import pinsData from '../../data/pins.json';

interface HybridPin {
  id: string;
  position: [number, number];
  name: string;
  photo: string;
  location: string;
  imagePath: string;
}

class HybridDataService {
  private isGitHubAvailable: boolean;
  private localPins: HybridPin[];

  constructor() {
    // Check if GitHub environment variables are available
    this.isGitHubAvailable = !!(
      import.meta.env.VITE_GITHUB_TOKEN &&
      import.meta.env.VITE_GITHUB_REPO_OWNER &&
      import.meta.env.VITE_GITHUB_REPO_NAME
    );
    
    // Initialize local pins for fallback
    this.localPins = pinsData.map(pin => ({
      ...pin,
      position: pin.position as [number, number]
    }));
  }

  async getPins(): Promise<HybridPin[]> {
    if (this.isGitHubAvailable) {
      try {
        console.log('Fetching pins from GitHub...');
        return await githubService.getPins();
      } catch (error) {
        console.warn('GitHub fetch failed, using local data:', error);
        return this.localPins;
      }
    } else {
      console.log('Using local data (no GitHub config)');
      return this.localPins;
    }
  }

  async savePin(pin: HybridPin): Promise<void> {
    if (this.isGitHubAvailable) {
      try {
        await githubService.savePin(pin);
        return;
      } catch (error) {
        console.warn('GitHub save failed, saving locally:', error);
      }
    }
    
    // Fallback to local storage
    this.localPins.push(pin);
    console.log('Pin saved locally:', pin);
  }

  async deletePin(pinId: string): Promise<void> {
    if (this.isGitHubAvailable) {
      try {
        await githubService.deletePin(pinId);
        return;
      } catch (error) {
        console.warn('GitHub delete failed, deleting locally:', error);
      }
    }
    
    // Fallback to local storage
    this.localPins = this.localPins.filter(pin => pin.id !== pinId);
    console.log('Pin deleted locally:', pinId);
  }

  async updatePin(pinId: string, updatedData: Partial<HybridPin>): Promise<void> {
    if (this.isGitHubAvailable) {
      try {
        await githubService.updatePin(pinId, updatedData);
        return;
      } catch (error) {
        console.warn('GitHub update failed, updating locally:', error);
      }
    }
    
    // Fallback to local storage
    const pinIndex = this.localPins.findIndex(pin => pin.id === pinId);
    if (pinIndex === -1) {
      throw new Error('Pin not found');
    }
    this.localPins[pinIndex] = { ...this.localPins[pinIndex], ...updatedData };
    console.log('Pin updated locally:', this.localPins[pinIndex]);
  }

  async uploadImage(file: File, pinId: string): Promise<string> {
    if (this.isGitHubAvailable) {
      try {
        return await githubService.uploadImage(file, pinId);
      } catch (error) {
        console.warn('GitHub image upload failed, using data URL:', error);
      }
    }
    
    // Fallback to data URL for local development
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  getServiceInfo(): { type: 'github' | 'local'; available: boolean } {
    return {
      type: this.isGitHubAvailable ? 'github' : 'local',
      available: true
    };
  }
}

export const hybridDataService = new HybridDataService(); 