import Phaser from "phaser";
import { MemoryItem } from "../../config/memories";
import { GameState } from "../systems/GameState";
import { AudioManager } from "../systems/AudioManager";

export class MemoryObject extends Phaser.GameObjects.Container {
  public memory: MemoryItem;
  private iconSprite!: Phaser.GameObjects.Image;
  private glowRing!: Phaser.GameObjects.Image;
  private promptText!: Phaser.GameObjects.Text;
  private titleLabel!: Phaser.GameObjects.Text;
  private interactionRadius: number = 130;

  constructor(scene: Phaser.Scene, x: number, y: number, memory: MemoryItem, iconKey: string = "icon-memory-camera") {
    super(scene, x, y);
    this.memory = memory;
    this.scene.add.existing(this);

    this.setupVisuals(iconKey);
  }

  private setupVisuals(iconKey: string): void {
    // Golden pulse glow
    this.glowRing = this.scene.add.image(0, 0, "particle-sparkle");
    this.glowRing.setScale(2.2);
    this.glowRing.setTint(0xffb45c);
    this.glowRing.setAlpha(0.6);
    this.add(this.glowRing);

    this.scene.tweens.add({
      targets: this.glowRing,
      scale: { from: 1.8, to: 2.5 },
      alpha: { from: 0.3, to: 0.8 },
      duration: 1400,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    // Object icon
    this.iconSprite = this.scene.add.image(0, 0, iconKey);
    this.iconSprite.setScale(1);
    this.add(this.iconSprite);

    // Floating animation
    this.scene.tweens.add({
      targets: this.iconSprite,
      y: { from: 0, to: -8 },
      duration: 1100,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    // Title label
    this.titleLabel = this.scene.add.text(0, -38, this.memory.subtitle || `Wspomnienie #${this.memory.id}`, {
      fontFamily: "Plus Jakarta Sans, sans-serif",
      fontSize: "11px",
      fontStyle: "600",
      color: "#FFB45C",
    });
    this.titleLabel.setOrigin(0.5, 0.5);
    this.add(this.titleLabel);

    // Prompt
    this.promptText = this.scene.add.text(0, -56, "[E] Zobacz wspomnienie", {
      fontFamily: "Plus Jakarta Sans, sans-serif",
      fontSize: "12px",
      color: "#FFFFFF",
      backgroundColor: "#0B3D66ee",
      padding: { x: 8, y: 3 },
    });
    this.promptText.setOrigin(0.5, 0.5);
    this.promptText.setVisible(false);
    this.add(this.promptText);

    // Direct click/touch interaction on memory object
    this.setSize(90, 90);
    this.setInteractive(new Phaser.Geom.Rectangle(-45, -45, 90, 90), Phaser.Geom.Rectangle.Contains);
    if (this.input) {
      this.input.cursor = "pointer";
    }
    this.on("pointerdown", () => {
      this.interact();
    });
  }

  public updateProximity(playerX: number, playerY: number, wantsInteract: boolean): void {
    const dist = Phaser.Math.Distance.Between(this.x, this.y, playerX, playerY);

    if (dist <= this.interactionRadius) {
      this.promptText.setVisible(true);
      if (wantsInteract) {
        this.interact();
      }
    } else {
      this.promptText.setVisible(false);
    }
  }

  public interact(): void {
    AudioManager.getInstance().playMemoryOpen();
    GameState.getInstance().discoverMemory(this.memory.id);

    // Trigger modal event
    this.scene.events.emit("open-memory-viewer", {
      memoryId: this.memory.id,
    });
  }
}
