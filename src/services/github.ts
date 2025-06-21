const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN;
const REPO_OWNER = import.meta.env.VITE_GITHUB_REPO_OWNER;
const REPO_NAME = import.meta.env.VITE_GITHUB_REPO_NAME;
const PINS_FILE_PATH = 'data/pins.json';

interface GitHubPin {
  id: string;
  position: [number, number];
  name: string;
  photo: string;
  location: string;
  imagePath: string;
}

class GitHubService {
  private baseUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}`;
  private headers = {
    'Authorization': `token ${GITHUB_TOKEN}`,
    'Accept': 'application/vnd.github.v3+json',
  };

  async getPins(): Promise<GitHubPin[]> {
    try {
      const response = await fetch(`${this.baseUrl}/contents/${PINS_FILE_PATH}`, {
        headers: this.headers,
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          return [];
        }
        throw new Error('Failed to fetch pins');
      }

      const data = await response.json();
      const content = atob(data.content);
      return JSON.parse(content);
    } catch (error) {
      console.error('Error fetching pins:', error);
      return [];
    }
  }

  async savePin(pin: GitHubPin): Promise<void> {
    const pins = await this.getPins();
    const updatedPins = [...pins, pin];
    
    const content = btoa(JSON.stringify(updatedPins, null, 2));
    
    try {
      const response = await fetch(`${this.baseUrl}/contents/${PINS_FILE_PATH}`, {
        method: 'PUT',
        headers: this.headers,
        body: JSON.stringify({
          message: `Add pin for ${pin.name}`,
          content,
          sha: await this.getFileSha(PINS_FILE_PATH),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save pin');
      }
    } catch (error) {
      console.error('Error saving pin:', error);
      throw error;
    }
  }

  async deletePin(pinId: string): Promise<void> {
    const pins = await this.getPins();
    const updatedPins = pins.filter(pin => pin.id !== pinId);
    
    const content = btoa(JSON.stringify(updatedPins, null, 2));
    
    try {
      const response = await fetch(`${this.baseUrl}/contents/${PINS_FILE_PATH}`, {
        method: 'PUT',
        headers: this.headers,
        body: JSON.stringify({
          message: `Delete pin ${pinId}`,
          content,
          sha: await this.getFileSha(PINS_FILE_PATH),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete pin');
      }
    } catch (error) {
      console.error('Error deleting pin:', error);
      throw error;
    }
  }

  async updatePin(pinId: string, updatedData: Partial<GitHubPin>): Promise<void> {
    const pins = await this.getPins();
    const pinIndex = pins.findIndex(pin => pin.id === pinId);
    
    if (pinIndex === -1) {
      throw new Error('Pin not found');
    }

    // Update the pin with new data
    pins[pinIndex] = { ...pins[pinIndex], ...updatedData };
    
    const content = btoa(JSON.stringify(pins, null, 2));
    
    try {
      const response = await fetch(`${this.baseUrl}/contents/${PINS_FILE_PATH}`, {
        method: 'PUT',
        headers: this.headers,
        body: JSON.stringify({
          message: `Update pin ${pinId}`,
          content,
          sha: await this.getFileSha(PINS_FILE_PATH),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update pin');
      }
    } catch (error) {
      console.error('Error updating pin:', error);
      throw error;
    }
  }

  async uploadImage(file: File, pinId: string): Promise<string> {
    const imagePath = `images/${pinId}_${file.name}`;
    const content = await this.fileToBase64(file);
    const upload = async (sha?: string) => {
      const body: any = {
        message: `Upload image for pin ${pinId}`,
        content,
      };
      if (sha) body.sha = sha;
      return fetch(`${this.baseUrl}/contents/${imagePath}`, {
        method: 'PUT',
        headers: this.headers,
        body: JSON.stringify(body),
      });
    };
    try {
      let response = await upload();
      if (response.status === 409) {
        // File exists, get SHA and retry
        const sha = await this.getFileSha(imagePath);
        if (sha) {
          response = await upload(sha);
        }
      }
      if (!response.ok) {
        throw new Error('Failed to upload image');
      }
      return `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/main/${imagePath}`;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  }

  private async getFileSha(path: string): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/contents/${path}`, {
        headers: this.headers,
      });
      
      if (!response.ok) {
        return '';
      }

      const data = await response.json();
      return data.sha;
    } catch (error) {
      console.error('Error getting file SHA:', error);
      return '';
    }
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = reader.result as string;
        resolve(base64.split(',')[1]);
      };
      reader.onerror = error => reject(error);
    });
  }
}

export const githubService = new GitHubService(); 