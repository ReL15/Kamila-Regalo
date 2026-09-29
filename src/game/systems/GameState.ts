import { SaveManager, GameSettings } from "./SaveManager";
import { raccoonsConfig } from "../../config/raccoons";
import { AudioManager } from "./AudioManager";

export type GameEventListener = (event: string, data?: unknown) => void;

export class GameState {
  private static instance: GameState;

  public foundRaccoons: Set<number>;
  public discoveredMemories: Set<number>;
  public settings: GameSettings;
  public easterEggsFound: Set<string>;
  public isFirstRun: boolean = true;
  private listeners: GameEventListener[] = [];

  private constructor() {
    this.foundRaccoons = new Set(SaveManager.getFoundRaccoons());
    this.discoveredMemories = new Set(SaveManager.getDiscoveredMemories());
    this.settings = SaveManager.getSettings();
    this.easterEggsFound = new Set();
  }

  public static getInstance(): GameState {
    if (!GameState.instance) {
      GameState.instance = new GameState();
    }
    return GameState.instance;
  }

  public addListener(listener: GameEventListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.removeListener(listener);
    };
  }

  public removeListener(listener: GameEventListener): void {
    this.listeners = this.listeners.filter((l) => l !== listener);
  }

  public removeAllListeners(): void {
    this.listeners = [];
  }

  public emit(event: string, data?: unknown): void {
    const currentListeners = [...this.listeners];
    for (const listener of currentListeners) {
      try {
        listener(event, data);
      } catch (err) {
        console.error("Error in GameState event listener:", err);
      }
    }
  }

  public collectRaccoon(id: number): {
    newlyFound: boolean;
    count: number;
    message: string;
    isAllFound: boolean;
  } {
    const newlyFound = !this.foundRaccoons.has(id);
    if (newlyFound) {
      this.foundRaccoons.add(id);
      SaveManager.saveFoundRaccoons(Array.from(this.foundRaccoons));
    }

    const raccoonConfig = raccoonsConfig.find((r) => r.id === id);
    const message = raccoonConfig ? raccoonConfig.message : "¡Mapache encontrado!";
    const count = this.foundRaccoons.size;
    const isAllFound = count >= 7;

    const audio = AudioManager.getInstance();
    if (isAllFound && newlyFound) {
      audio.playCelebration();
    } else {
      audio.playRaccoonFound();
    }

    this.emit("raccoon-collected", { id, count, newlyFound, isAllFound, message });

    return { newlyFound, count, message, isAllFound };
  }

  public hasFoundRaccoon(id: number): boolean {
    return this.foundRaccoons.has(id);
  }

  public getFoundRaccoonCount(): number {
    return this.foundRaccoons.size;
  }

  public discoverMemory(id: number): boolean {
    const isNew = !this.discoveredMemories.has(id);
    if (isNew) {
      this.discoveredMemories.add(id);
      SaveManager.saveDiscoveredMemories(Array.from(this.discoveredMemories));
      this.emit("memory-discovered", { id, total: this.discoveredMemories.size });
    }
    return isNew;
  }

  public discoverEasterEgg(name: string): boolean {
    if (!this.easterEggsFound.has(name)) {
      this.easterEggsFound.add(name);
      this.emit("easter-egg-found", { name });
      return true;
    }
    return false;
  }

  public toggleMute(): boolean {
    this.settings.muted = AudioManager.getInstance().toggleMute();
    SaveManager.saveSettings(this.settings);
    this.emit("settings-changed", this.settings);
    return this.settings.muted;
  }

  public toggleReducedMotion(): boolean {
    this.settings.reducedMotion = !this.settings.reducedMotion;
    SaveManager.saveSettings(this.settings);
    this.emit("settings-changed", this.settings);
    return this.settings.reducedMotion;
  }

  public resetProgress(): void {
    this.foundRaccoons.clear();
    this.discoveredMemories.clear();
    this.easterEggsFound.clear();
    SaveManager.resetAll();
    this.emit("progress-reset");
  }
}
