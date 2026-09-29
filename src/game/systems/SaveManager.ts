const SAVE_KEY_RACCOONS = "kamila_viaje_raccoons_v1";
const SAVE_KEY_MEMORIES = "kamila_viaje_memories_v1";
const SAVE_KEY_SETTINGS = "kamila_viaje_settings_v1";

export interface GameSettings {
  muted: boolean;
  reducedMotion: boolean;
}

export class SaveManager {
  static getFoundRaccoons(): number[] {
    try {
      const data = localStorage.getItem(SAVE_KEY_RACCOONS);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    return [];
  }

  static saveFoundRaccoons(raccoons: number[]): void {
    try {
      localStorage.setItem(SAVE_KEY_RACCOONS, JSON.stringify(raccoons));
    } catch {
      // ignore
    }
  }

  static getDiscoveredMemories(): number[] {
    try {
      const data = localStorage.getItem(SAVE_KEY_MEMORIES);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    return [];
  }

  static saveDiscoveredMemories(memories: number[]): void {
    try {
      localStorage.setItem(SAVE_KEY_MEMORIES, JSON.stringify(memories));
    } catch {
      // ignore
    }
  }

  static getSettings(): GameSettings {
    try {
      const data = localStorage.getItem(SAVE_KEY_SETTINGS);
      if (data) {
        return JSON.parse(data);
      }
    } catch {
      // ignore
    }
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    return {
      muted: false,
      reducedMotion: prefersReducedMotion,
    };
  }

  static saveSettings(settings: GameSettings): void {
    try {
      localStorage.setItem(SAVE_KEY_SETTINGS, JSON.stringify(settings));
    } catch {
      // ignore
    }
  }

  static resetAll(): void {
    try {
      localStorage.removeItem(SAVE_KEY_RACCOONS);
      localStorage.removeItem(SAVE_KEY_MEMORIES);
    } catch {
      // ignore
    }
  }
}
