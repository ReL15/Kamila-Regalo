import Phaser from "phaser";
import { birthdayConfig } from "../../config/birthdayConfig";
import { GameState } from "../systems/GameState";
import { Raccoon } from "../entities/Raccoon";
import { createInteractiveButton } from "../ui/Button";

export class EndingScene extends Phaser.Scene {
  constructor() {
    super({ key: "EndingScene" });
  }

  create(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    this.cameras.main.fadeIn(1200, 7, 26, 51);

    // Deep midnight blue gradient
    const sky = this.add.graphics();
    sky.fillGradientStyle(0x020712, 0x040e24, 0x071a33, 0x09264c, 1);
    sky.fillRect(0, 0, width, height);

    // Stars
    for (let i = 0; i < 70; i++) {
      const sx = Phaser.Math.Between(0, width);
      const sy = Phaser.Math.Between(10, height * 0.7);
      const star = this.add.circle(sx, sy, Phaser.Math.FloatBetween(1, 2.5), 0xffffff, Phaser.Math.FloatBetween(0.3, 1));
      this.tweens.add({
        targets: star,
        alpha: { from: 0.2, to: 1 },
        duration: Phaser.Math.Between(1200, 3200),
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    }

    // Occasional shooting star
    this.time.addEvent({
      delay: 4000,
      loop: true,
      callback: () => {
        const sx = Phaser.Math.Between(50, width * 0.7);
        const sy = Phaser.Math.Between(20, height * 0.4);
        const shoot = this.add.graphics();
        shoot.lineStyle(2, 0x8dd8ff, 0.9);
        shoot.lineBetween(sx, sy, sx + 50, sy + 25);
        this.tweens.add({
          targets: shoot,
          alpha: 0,
          x: 40,
          y: 20,
          duration: 600,
          ease: "Quad.easeOut",
          onComplete: () => shoot.destroy(),
        });
      },
    });

    // Distant mountain silhouette
    if (this.textures.exists("scenery-mountain-far")) {
      const mFar = this.add.tileSprite(width / 2, height - 120, width, 300, "scenery-mountain-far");
      mFar.setTint(0x040e1f);
    }

    // Meadow ground
    const ground = this.add.graphics();
    ground.fillStyle(0x081d1a, 1);
    ground.fillRect(0, height - 80, width, 80);

    // Distant parked truck
    const parkedTruck = this.add.image(width * 0.28, height - 100, "truck-body");
    parkedTruck.setScale(0.7);
    parkedTruck.setTint(0x3a6088);

    // Raccoon sitting peacefully on the meadow
    const raccoon = new Raccoon(this, width * 0.65, height - 100);
    raccoon.setScale(1.2);

    // Narrative text sequence
    this.runEndingTextSequence(width, height);
  }

  private runEndingTextSequence(width: number, height: number): void {
    // 1. "I tak kończy się ta podróż..."
    const line1 = this.add.text(width / 2, height * 0.26, "I tak kończy się ta podróż...", {
      fontFamily: "Plus Jakarta Sans, sans-serif",
      fontSize: "18px",
      fontStyle: "500",
      color: "#8DD8FF",
    });
    line1.setOrigin(0.5, 0.5);
    line1.setAlpha(0);

    // 2. "...na razie."
    const line2 = this.add.text(width / 2, height * 0.32, "...na razie.", {
      fontFamily: "Plus Jakarta Sans, sans-serif",
      fontSize: "18px",
      fontStyle: "italic",
      color: "#FFB45C",
    });
    line2.setOrigin(0.5, 0.5);
    line2.setAlpha(0);

    // 3. "WSZYSTKIEGO NAJLEPSZEGO, KAMILA"
    const line3 = this.add.text(width / 2, height * 0.42, `WSZYSTKIEGO NAJLEPSZEGO, ${birthdayConfig.name.toUpperCase()}`, {
      fontFamily: "Cinzel, serif",
      fontSize: Math.min(36, width * 0.08) + "px",
      fontStyle: "700",
      color: "#FFFFFF",
      letterSpacing: 4,
    });
    line3.setOrigin(0.5, 0.5);
    line3.setAlpha(0);

    // 4. "Do zobaczenia na kolejnej trasie. 🚛🦝"
    const line4 = this.add.text(width / 2, height * 0.50, "Do zobaczenia na kolejnej trasie. 🚛🦝", {
      fontFamily: "Plus Jakarta Sans, sans-serif",
      fontSize: "16px",
      fontStyle: "600",
      color: "#8DD8FF",
    });
    line4.setOrigin(0.5, 0.5);
    line4.setAlpha(0);

    // Animation orchestration
    this.tweens.add({
      targets: line1,
      alpha: 1,
      duration: 1000,
      onComplete: () => {
        this.time.delayedCall(1600, () => {
          this.tweens.add({
            targets: line2,
            alpha: 1,
            duration: 1000,
            onComplete: () => {
              this.time.delayedCall(1800, () => {
                this.tweens.add({
                  targets: line3,
                  alpha: 1,
                  duration: 1200,
                });
                this.tweens.add({
                  targets: line4,
                  alpha: 1,
                  duration: 1200,
                  delay: 600,
                  onComplete: () => {
                    this.showReplayButton(width, height);
                  },
                });
              });
            },
          });
        });
      },
    });
  }

  private showReplayButton(width: number, height: number): void {
    const replayContainer = createInteractiveButton(
      this,
      width / 2,
      height * 0.62,
      "ZAGRAJ PONOWNIE 🔄",
      () => {
        this.cameras.main.fadeOut(800, 7, 26, 51);
        this.cameras.main.once("camerafadeoutcomplete", () => {
          this.scene.start("MenuScene");
        });
      },
      {
        width: 220,
        height: 46,
        fillColor: 0x168bea,
        strokeColor: 0xffb45c,
        strokeWidth: 2,
        radius: 23,
      }
    );
    replayContainer.setAlpha(0);

    // Reset progress option
    const resetText = this.add.text(width / 2, height * 0.70, "Zresetuj szopy i wspomnienia", {
      fontFamily: "Plus Jakarta Sans, sans-serif",
      fontSize: "12px",
      color: "#8DD8FF",
    });
    resetText.setOrigin(0.5, 0.5);
    resetText.setInteractive({ useHandCursor: true });
    resetText.on("pointerdown", () => {
      GameState.getInstance().resetProgress();
      resetText.setText("Postęp zresetowany! ✓");
      resetText.setColor("#FFB45C");
    });

    this.tweens.add({
      targets: [replayContainer, resetText],
      alpha: 1,
      duration: 800,
    });
  }
}
