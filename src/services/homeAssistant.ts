const BASE_URL = 'https://home-assistant.kropp.cloud';

interface HAServiceConfig {
  token: string;
  baseUrl?: string;
}

export class HomeAssistantService {
  private token: string;
  private baseUrl: string;

  constructor(config: HAServiceConfig) {
    this.token = config.token;
    this.baseUrl = config.baseUrl || BASE_URL;
    
    // Remove trailing slashes from base URL
    this.baseUrl = this.baseUrl.replace(/\/+$/, '');
    
    // Validate URL
    try {
      new URL(this.baseUrl);
    } catch (error) {
      throw new Error('Invalid Home Assistant URL provided');
    }
  }

  private async makeRequest(endpoint: string, method: string, data?: any) {
    // Ensure endpoint starts with a slash
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${this.baseUrl}${normalizedEndpoint}`;
    
    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
        body: data ? JSON.stringify(data) : undefined,
      });

      if (!response.ok) {
        throw new Error(`Home Assistant request failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Home Assistant request failed:', error);
      throw error;
    }
  }

  async callService(domain: string, service: string, data?: any) {
    return this.makeRequest(
      `/api/services/${domain}/${service}`,
      'POST',
      data
    );
  }

  async flashLights(entityId: string = 'light.game_room') {
    return this.callService('light', 'toggle', {
      entity_id: entityId
    });
  }

  async playSound(soundFile: string, entityId: string = 'media_player.house_speakers') {
    return this.callService('media_player', 'play_media', {
      entity_id: entityId,
      media_content_id: soundFile,
      media_content_type: 'music'
    });
  }
}