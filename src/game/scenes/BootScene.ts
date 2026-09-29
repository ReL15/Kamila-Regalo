import Phaser from "phaser";

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: "BootScene" });
  }

  preload(): void {
    // Show a minimal initial dark background
    this.cameras.main.setBackgroundColor("#071A33");
  }

  create(): void {
    this.scene.start("PreloadScene");
  }
}
