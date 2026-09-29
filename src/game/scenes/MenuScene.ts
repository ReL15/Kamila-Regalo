import Phaser from "phaser";
import { birthdayConfig } from "../../config/birthdayConfig";
import { AudioManager } from "../systems/AudioManager";
import { GameState } from "../systems/GameState";
import { createInteractiveButton } from "../ui/Button";

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: "MenuScene" });
  }

  create(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    this.cameras.main.setBackgroundColor("#071A33");

    // Starfield in background
    for (let i = 0; i < 45; i++) {
      const sx = Phaser.Math.Between(0, width);
      const sy = Phaser.Math.Between(0, height * 0.7);
      const star = this.add.circle(sx, sy, Phaser.Math.FloatBetween(1, 2.2), 0xffffff, Phaser.Math.FloatBetween(0.3, 0.9));
      this.tweens.add({
        targets: star,
        alpha: { from: 0.2, to: 0.9 },
        duration: Phaser.Math.Between(1500, 3000),
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    }

    // Mountain silhouettes in background
    if (this.textures.exists("scenery-mountain-far")) {
      const mFar = this.add.tileSprite(width / 2, height - 120, width, 300, "scenery-mountain-far");
      mFar.setTint(0x06182e);
    }

    // Road strip at bottom
    const road = this.add.graphics();
    road.fillStyle(0x040d1a, 1);
    road.fillRect(0, height - 60, width, 60);
    road.lineStyle(2, 0xffb45c, 0.4);
    for (let x = 20; x < width; x += 50) {
      road.lineBetween(x, height - 30, x + 25, height - 30);
    }

    // Main Title
    const title = this.add.text(width / 2, height * 0.3, "KAMILA", {
      fontFamily: "Cinzel, serif",
      fontSize: Math.min(68, width * 0.12) + "px",
      fontStyle: "700",
      color: "#8DD8FF",
      letterSpacing: 8,
    });
    title.setOrigin(0.5, 0.5);

    const subTitle = this.add.text(width / 2, height * 0.4, "— EL VIAJE —", {
      fontFamily: "Plus Jakarta Sans, sans-serif",
      fontSize: "20px",
      fontStyle: "700",
      color: "#FFB45C",
      letterSpacing: 6,
    });
    subTitle.setOrigin(0.5, 0.5);

    // Main phrase quote
    const phrase = this.add.text(width / 2, height * 0.52, `“${birthdayConfig.mainPhrase}”`, {
      fontFamily: "Plus Jakarta Sans, sans-serif",
      fontSize: "15px",
      fontStyle: "italic",
      color: "#F4F8FC",
      align: "center",
      wordWrap: { width: Math.min(540, width - 40) },
      lineSpacing: 6,
    });
    phrase.setOrigin(0.5, 0.5);

    let hasStarted = false;
    const startJourney = () => {
      if (hasStarted) return;
      hasStarted = true;
      AudioManager.getInstance().unlock();
      this.cameras.main.fadeOut(500, 7, 26, 51);
      this.cameras.main.once("camerafadeoutcomplete", () => {
        this.scene.start("IntroScene");
      });
    };

    // INICIAR VIAJE Button
    const btnContainer = createInteractiveButton(
      this,
      width / 2,
      height * 0.70,
      "INICIAR VIAJE",
      startJourney,
      {
        width: 240,
        height: 52,
        fillColor: 0x168bea,
        strokeColor: 0x8dd8ff,
        strokeWidth: 2,
        radius: 26,
      }
    );

    // Pulse animation for start button
    this.tweens.add({
      targets: btnContainer,
      scale: 1.05,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    // Helper hint
    const hint = this.add.text(width / 2, height * 0.77, "Toca o presiona ESPACIO para comenzar", {
      fontFamily: "Plus Jakarta Sans, sans-serif",
      fontSize: "12px",
      color: "#8DD8FF",
    });
    hint.setOrigin(0.5, 0.5);

    // Raccoon badge if saved progress
    const foundRaccoons = GameState.getInstance().getFoundRaccoonCount();
    if (foundRaccoons > 0) {
      const savedInfo = this.add.text(width / 2, height * 0.85, `Progreso guardado: ${foundRaccoons}/7 mapaches encontrados`, {
        fontFamily: "Plus Jakarta Sans, sans-serif",
        fontSize: "12px",
        color: "#FFB45C",
      });
      savedInfo.setOrigin(0.5, 0.5);
    }

    // Direct screen tap or click anywhere also starts
    this.input.once("pointerdown", startJourney);

    // Keyboard support: SPACE / ENTER / E to start
    this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE).once("down", startJourney);
    this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER).once("down", startJourney);
    this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.E).once("down", startJourney);
  }
}
