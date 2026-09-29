import Phaser from "phaser";
import { GameState } from "../systems/GameState";
import { raccoonsConfig } from "../../config/raccoons";

export class CollectibleRaccoon extends Phaser.GameObjects.Container {
  public raccoonId: number;
  private sprite!: Phaser.GameObjects.Image;
  private glow!: Phaser.GameObjects.Image;
  private promptText!: Phaser.GameObjects.Text;
  private isCollected: boolean = false;
  private isInteracting: boolean = false;
  private interactionRadius: number = 140;

  constructor(scene: Phaser.Scene, x: number, y: number, id: number) {
    super(scene, x, y);
    this.raccoonId = id;
    this.scene.add.existing(this);

    this.isCollected = GameState.getInstance().hasFoundRaccoon(id);
    this.setupVisuals();
  }

  private setupVisuals(): void {
    // Aura glow
    this.glow = this.scene.add.image(0, 0, "particle-sparkle");
    this.glow.setScale(2);
    this.glow.setAlpha(this.isCollected ? 0.2 : 0.6);
    this.glow.setTint(0x8dd8ff);
    this.add(this.glow);

    // Sparkle tween
    this.scene.tweens.add({
      targets: this.glow,
      scale: { from: 1.8, to: 2.3 },
      alpha: { from: 0.3, to: 0.7 },
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    // Raccoon graphic
    this.sprite = this.scene.add.image(0, 0, "raccoon-body");
    this.sprite.setScale(0.85);
    this.add(this.sprite);

    // Subtle breathing/peeking animation
    this.scene.tweens.add({
      targets: this.sprite,
      y: { from: 0, to: -6 },
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    // Prompt indicator
    this.promptText = this.scene.add.text(0, -42, "[E] Przywitaj się", {
      fontFamily: "Plus Jakarta Sans, sans-serif",
      fontSize: "12px",
      color: "#FFB45C",
      backgroundColor: "#071A33cc",
      padding: { x: 6, y: 3 },
    });
    this.promptText.setOrigin(0.5, 0.5);
    this.promptText.setVisible(false);
    this.add(this.promptText);

    // Direct click/touch interaction on the raccoon
    this.setSize(80, 80);
    this.setInteractive(new Phaser.Geom.Rectangle(-40, -40, 80, 80), Phaser.Geom.Rectangle.Contains);
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
      if (wantsInteract && !this.isInteracting) {
        this.interact();
      }
    } else {
      this.promptText.setVisible(false);
    }
  }

  public interact(): void {
    if (this.isInteracting) return;
    if (!this.scene || !this.scene.sys || !this.scene.sys.isActive() || !this.scene.tweens) return;
    this.isInteracting = true;

    const gameState = GameState.getInstance();
    const config = raccoonsConfig.find((r) => r.id === this.raccoonId);
    const message = config ? config.message : "Mały przyjaciel na trasie!";

    const result = gameState.collectRaccoon(this.raccoonId);
    this.isCollected = true;
    if (this.glow) {
      this.glow.setAlpha(0.25);
    }

    // Little celebration jump
    if (this.scene.tweens && this.sprite) {
      this.scene.tweens.add({
        targets: this.sprite,
        y: -24,
        duration: 180,
        yoyo: true,
        repeat: 2,
        ease: "Quad.easeOut",
      });
    }

    // Zoom camera slightly unless reduced motion
    const reducedMotion = gameState.settings.reducedMotion;
    const camera = this.scene.cameras?.main;

    if (!reducedMotion && camera && this.scene.tweens) {
      this.scene.tweens.add({
        targets: camera,
        zoom: 1.15,
        duration: 350,
        yoyo: true,
        hold: 800,
        ease: "Quad.easeInOut",
      });
    }

    // Emit event for DialogueBox / HUD to show dialogue
    if (this.scene.events) {
      this.scene.events.emit("show-raccoon-dialogue", {
        id: this.raccoonId,
        count: result.count,
        isAllFound: result.isAllFound,
        newlyFound: result.newlyFound,
        message: message,
      });
    }

    if (this.scene.time) {
      this.scene.time.delayedCall(1600, () => {
        this.isInteracting = false;
      });
    } else {
      this.isInteracting = false;
    }
  }
}
