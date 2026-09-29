import Phaser from "phaser";
import { birthdayConfig } from "../../config/birthdayConfig";
import { AudioManager } from "../systems/AudioManager";
import { createInteractiveButton } from "../ui/Button";

export class IntroScene extends Phaser.Scene {
  private truckPreview?: Phaser.GameObjects.Image;
  private headlightGlow?: Phaser.GameObjects.Image;
  private raccoonPreview?: Phaser.GameObjects.Image;

  constructor() {
    super({ key: "IntroScene" });
  }

  private isIgnited: boolean = false;
  private btnContainer?: Phaser.GameObjects.Container;

  create(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    this.isIgnited = false;

    this.cameras.main.setBackgroundColor("#071A33");

    // 1. Show KAMILA
    const nameText = this.add.text(width / 2, height * 0.35, birthdayConfig.name.toUpperCase(), {
      fontFamily: "Cinzel, serif",
      fontSize: Math.min(54, width * 0.1) + "px",
      fontStyle: "700",
      color: "#8DD8FF",
      letterSpacing: 6,
    });
    nameText.setOrigin(0.5, 0.5);
    nameText.setAlpha(0);

    // 2. Subtitle: "Tengo un viaje preparado para ti."
    const introMsg = this.add.text(width / 2, height * 0.46, birthdayConfig.introMessage, {
      fontFamily: "Plus Jakarta Sans, sans-serif",
      fontSize: "17px",
      fontStyle: "500",
      color: "#F4F8FC",
      align: "center",
      wordWrap: { width: Math.min(480, width - 40) },
    });
    introMsg.setOrigin(0.5, 0.5);
    introMsg.setAlpha(0);

    let hasShownButton = false;
    const revealButton = () => {
      if (hasShownButton) return;
      hasShownButton = true;
      nameText.setAlpha(1);
      introMsg.setAlpha(1);
      this.showStartAction(width, height);
    };

    // Fade in text sequence
    this.tweens.add({
      targets: nameText,
      alpha: 1,
      duration: 600,
      ease: "Power2",
      onComplete: () => {
        this.tweens.add({
          targets: introMsg,
          alpha: 1,
          duration: 600,
          ease: "Power2",
          onComplete: () => {
            revealButton();
          },
        });
      },
    });

    // If user clicks before button appears, immediately show button
    this.input.once("pointerdown", () => {
      revealButton();
    });
  }

  private showStartAction(width: number, height: number): void {
    if (this.btnContainer) return;

    const ignite = () => {
      if (this.isIgnited) return;
      this.isIgnited = true;
      if (this.btnContainer) {
        this.tweens.add({
          targets: this.btnContainer,
          alpha: 0,
          duration: 200,
          onComplete: () => this.btnContainer?.destroy(),
        });
      }
      this.triggerIgnitionSequence(width, height);
    };

    this.btnContainer = createInteractiveButton(
      this,
      width / 2,
      height * 0.62,
      "ODPAL SILNIK 🚛",
      ignite,
      {
        width: 240,
        height: 52,
        fillColor: 0x168bea,
        strokeColor: 0xffb45c,
        strokeWidth: 2,
        radius: 26,
      }
    );

    this.btnContainer.setAlpha(0);
    this.tweens.add({
      targets: this.btnContainer,
      alpha: 1,
      duration: 350,
      ease: "Quad.easeOut",
    });

    // Pulse animation
    this.tweens.add({
      targets: this.btnContainer,
      scale: 1.05,
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    // Tap anywhere or press keys to ignite
    this.time.delayedCall(150, () => {
      this.input.once("pointerdown", ignite);
    });

    this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE).once("down", ignite);
    this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER).once("down", ignite);
    this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.E).once("down", ignite);
  }

  private triggerIgnitionSequence(width: number, height: number): void {
    const audio = AudioManager.getInstance();
    audio.unlock();
    audio.updateEnginePitch(0.4);

    // Ground road
    const ground = this.add.graphics();
    ground.fillStyle(0x040d1a, 1);
    ground.fillRect(0, height - 70, width, 70);

    // Truck rolls in from left
    const truckContainer = this.add.container(-120, height - 80);
    this.truckPreview = this.add.image(0, 0, "truck-body");
    truckContainer.add(this.truckPreview);

    // Wheels
    const w1 = this.add.image(-48, 22, "truck-wheel");
    const w2 = this.add.image(54, 22, "truck-wheel");
    truckContainer.add(w1);
    truckContainer.add(w2);

    // Headlight cone
    this.headlightGlow = this.add.image(95, 0, "headlight-beam");
    this.headlightGlow.setOrigin(0, 0.5);
    this.headlightGlow.setAlpha(0);
    truckContainer.add(this.headlightGlow);

    // Raccoon buddy appears
    this.raccoonPreview = this.add.image(28, -20, "raccoon-head");
    this.raccoonPreview.setScale(0.7);
    this.raccoonPreview.setAlpha(0);
    truckContainer.add(this.raccoonPreview);

    // Drive truck to center
    this.tweens.add({
      targets: truckContainer,
      x: width / 2,
      duration: 1800,
      ease: "Quad.easeOut",
      onComplete: () => {
        // Turn on headlights!
        this.tweens.add({
          targets: this.headlightGlow,
          alpha: 0.85,
          duration: 300,
          yoyo: true,
          repeat: 1,
          onComplete: () => {
            if (this.headlightGlow) this.headlightGlow.setAlpha(0.8);
          },
        });

        // Raccoon appears waving
        this.tweens.add({
          targets: this.raccoonPreview,
          alpha: 1,
          scale: 0.8,
          duration: 400,
        });

        audio.playHorn();

        this.time.delayedCall(1600, () => {
          this.cameras.main.fadeOut(800, 7, 26, 51);
          this.cameras.main.once("camerafadeoutcomplete", () => {
            this.scene.start("MountainScene");
          });
        });
      },
    });
  }
}
