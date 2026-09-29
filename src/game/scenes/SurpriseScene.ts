import Phaser from "phaser";
import { Truck } from "../entities/Truck";
import { Raccoon } from "../entities/Raccoon";
import { CollectibleRaccoon } from "../entities/CollectibleRaccoon";
import { GameHUD } from "../ui/GameHUD";
import { MobileControls } from "../ui/MobileControls";
import { AudioManager } from "../systems/AudioManager";
import { birthdayConfig } from "../../config/birthdayConfig";
import { createInteractiveButton } from "../ui/Button";

export class SurpriseScene extends Phaser.Scene {
  private truck!: Truck;
  private raccoonWithBox!: Raccoon;
  private raccoonCollectible?: CollectibleRaccoon;
  private hud!: GameHUD;
  private mobileControls!: MobileControls;
  private giftBoxSprite!: Phaser.GameObjects.Image;
  private giftLidSprite!: Phaser.GameObjects.Image;
  private giftAura!: Phaser.GameObjects.Image;
  private openPrompt!: Phaser.GameObjects.Text;
  private isBoxOpened: boolean = false;
  private isNearBox: boolean = false;
  private readonly boxX: number = 720;
  private readonly worldWidth: number = 1600;

  constructor() {
    super({ key: "SurpriseScene" });
  }

  create(): void {
    this.isBoxOpened = false;
    this.isNearBox = false;
    const height = this.cameras.main.height;
    AudioManager.getInstance().setSceneAtmosphere("peaceful");

    this.physics.world.setBounds(0, 0, this.worldWidth, height);
    this.cameras.main.setBounds(0, 0, this.worldWidth, height);
    this.cameras.main.fadeIn(800, 7, 26, 51);

    this.setupCosyNightClearing(height);
    this.setupPlayer(height);
    this.setupGiftBox(height);
    this.setupRaccoonCollectible(height);

    this.hud = new GameHUD(this, "Sekretny Zakątek");
    this.mobileControls = new MobileControls(this, this.truck);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      if (this.hud) this.hud.destroyHUD();
      if (this.mobileControls) this.mobileControls.destroyControls();
    });

    this.time.delayedCall(1000, () => {
      this.hud.showNarratorQuote("Mały zakątek zachowany specjalnie na koniec... 🎁🦝", 4500);
    });
  }

  private setupCosyNightClearing(height: number): void {
    // Soft twilight gradient
    const sky = this.add.graphics();
    sky.fillGradientStyle(0x071a33, 0x09254a, 0x0b3d66, 0x168bea, 1);
    sky.fillRect(0, 0, this.worldWidth, height);
    sky.setScrollFactor(0);

    // Warm fireflies / star specks
    for (let i = 0; i < 40; i++) {
      const fx = Phaser.Math.Between(0, this.worldWidth);
      const fy = Phaser.Math.Between(50, height * 0.7);
      const dot = this.add.circle(fx, fy, Phaser.Math.FloatBetween(1.2, 2.5), 0xffb45c, 0.7);
      this.tweens.add({
        targets: dot,
        y: fy - 15,
        alpha: { from: 0.3, to: 0.9 },
        duration: Phaser.Math.Between(1500, 2800),
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    }

    // Pine trees framing the clearing
    for (let x = 60; x < this.worldWidth; x += 110) {
      const tree = this.add.image(x, height - 90, "scenery-pine-tree");
      tree.setOrigin(0.5, 1);
      tree.setScale(Phaser.Math.FloatBetween(1.1, 1.4));
      tree.setTint(0x0e2b27);
    }

    // Ground grass meadow
    const roadY = height - 70;
    const ground = this.add.graphics();
    ground.fillStyle(0x183c38, 1);
    ground.fillRect(0, roadY - 14, this.worldWidth, 14);

    ground.fillStyle(0x071a33, 1);
    ground.fillRect(0, roadY, this.worldWidth, 70);
    ground.setDepth(4);
  }

  private setupPlayer(height: number): void {
    const roadY = height - 75;
    this.truck = new Truck(this, 180, roadY);
    this.truck.setDepth(20);

    this.cameras.main.startFollow(this.truck, true, 0.08, 0.08, -120, 20);
  }

  private setupGiftBox(height: number): void {
    const roadY = height - 85;

    // Raccoon holding the box
    this.raccoonWithBox = new Raccoon(this, this.boxX - 35, roadY);
    this.raccoonWithBox.setDepth(18);

    // Glowing aura
    this.giftAura = this.add.image(this.boxX, roadY, "particle-sparkle");
    this.giftAura.setScale(3);
    this.giftAura.setTint(0xffb45c);
    this.giftAura.setAlpha(0.7);
    this.giftAura.setDepth(17);

    this.tweens.add({
      targets: this.giftAura,
      scale: { from: 2.6, to: 3.4 },
      alpha: { from: 0.4, to: 0.85 },
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    // Gift box base
    this.giftBoxSprite = this.add.image(this.boxX, roadY, "gift-box");
    this.giftBoxSprite.setDepth(19);

    // Gift box lid
    this.giftLidSprite = this.add.image(this.boxX, roadY - 14, "gift-lid");
    this.giftLidSprite.setDepth(20);

    // Interaction prompt
    this.openPrompt = this.add.text(this.boxX, roadY - 48, "[E] OTWÓRZ", {
      fontFamily: "Plus Jakarta Sans, sans-serif",
      fontSize: "13px",
      fontStyle: "700",
      color: "#FFB45C",
      backgroundColor: "#071A33ee",
      padding: { x: 8, y: 4 },
    });
    this.openPrompt.setOrigin(0.5, 0.5);
    this.openPrompt.setDepth(22);
    this.openPrompt.setVisible(false);

    // Click or tap directly on gift box to open
    this.giftBoxSprite.setInteractive({ useHandCursor: true });
    this.giftBoxSprite.on("pointerdown", () => {
      this.openSurpriseBox();
    });
  }

  private setupRaccoonCollectible(height: number): void {
    const roadY = height - 95;
    // Raccoon #7 (the final 7th raccoon!) placed at x = 940
    this.raccoonCollectible = new CollectibleRaccoon(this, 940, roadY, 7);
    this.raccoonCollectible.setDepth(25);
  }

  private openSurpriseBox(): void {
    if (this.isBoxOpened) return;
    this.isBoxOpened = true;
    this.openPrompt.setVisible(false);

    const audio = AudioManager.getInstance();
    audio.playBoxOpen();

    // Lid pops off with bounce
    this.tweens.add({
      targets: this.giftLidSprite,
      y: this.giftLidSprite.y - 50,
      angle: -25,
      alpha: 0.8,
      duration: 500,
      ease: "Back.easeOut",
    });

    // Light beam expands
    this.tweens.add({
      targets: this.giftAura,
      scale: 6,
      alpha: 1,
      duration: 600,
      ease: "Quad.easeOut",
    });

    // Raccoon waves happily
    this.raccoonWithBox.wave();

    // Show surprise modal card after brief pause
    this.time.delayedCall(700, () => {
      this.showSurpriseModal();
    });
  }

  private showSurpriseModal(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const modal = this.add.container(width / 2, height / 2);
    modal.setScrollFactor(0);
    modal.setDepth(300);

    // Dim background
    const bg = this.add.graphics();
    bg.fillStyle(0x040d1a, 0.92);
    bg.fillRect(-width, -height, width * 2, height * 2);
    modal.add(bg);

    const cardW = Math.min(520, width - 40);
    const cardH = Math.min(420, height - 60);

    // Card frame
    const card = this.add.graphics();
    card.fillStyle(0x071a33, 0.98);
    card.fillRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 18);
    card.lineStyle(2, 0xffb45c, 0.9);
    card.strokeRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 18);
    modal.add(card);

    // Sparkle icon
    const sparkle = this.add.image(0, -cardH / 2 + 50, "particle-sparkle");
    sparkle.setScale(2.5);
    sparkle.setTint(0xffb45c);
    modal.add(sparkle);

    // Surprise title
    const surpriseTitle = birthdayConfig.surprise?.title || "TU SORPRESA VA AQUÍ";
    const titleText = this.add.text(0, -cardH / 2 + 95, surpriseTitle, {
      fontFamily: "Cinzel, serif",
      fontSize: "20px",
      fontStyle: "700",
      color: "#8DD8FF",
      letterSpacing: 2,
    });
    titleText.setOrigin(0.5, 0.5);
    modal.add(titleText);

    // Surprise message / body
    const surpriseMsg = birthdayConfig.surprise?.message || "Cada kilómetro compartido vale oro. ¡Que este nuevo año esté lleno de nuevas rutas, risas y momentos inolvidables!";
    const bodyText = this.add.text(0, -cardH / 2 + 140, surpriseMsg, {
      fontFamily: "Plus Jakarta Sans, sans-serif",
      fontSize: "15px",
      color: "#F4F8FC",
      align: "center",
      wordWrap: { width: cardW - 60 },
      lineSpacing: 6,
    });
    bodyText.setOrigin(0.5, 0);
    modal.add(bodyText);

    // Subtext
    const subtext = birthdayConfig.surprise?.subtext || "Wszystkiego Najlepszego, Kamila! 🎂✨";
    const subLabel = this.add.text(0, cardH / 2 - 100, subtext, {
      fontFamily: "Plus Jakarta Sans, sans-serif",
      fontSize: "14px",
      fontStyle: "700",
      color: "#FFB45C",
    });
    subLabel.setOrigin(0.5, 0.5);
    modal.add(subLabel);

    // Button to proceed to final ending
    const endBtn = createInteractiveButton(
      this,
      0,
      cardH / 2 - 40,
      "PRZEJDŹ DO FINAŁU ▶",
      () => {
        this.cameras.main.fadeOut(800, 7, 26, 51);
        this.cameras.main.once("camerafadeoutcomplete", () => {
          this.scene.start("EndingScene");
        });
      },
      {
        width: 220,
        height: 44,
        fillColor: 0x168bea,
        strokeColor: 0xffffff,
        strokeWidth: 2,
        radius: 22,
      }
    );
    modal.add(endBtn);

    modal.setAlpha(0);
    this.tweens.add({
      targets: modal,
      alpha: 1,
      duration: 350,
    });
  }

  override update(time: number, delta: number): void {
    if (this.truck) {
      this.truck.update(time, delta);
      const wantsInteract = this.truck.isInteractionPressed();

      // Check proximity with box
      const dist = Phaser.Math.Distance.Between(this.truck.x, this.truck.y, this.boxX, this.truck.y);
      if (dist < 150 && !this.isBoxOpened) {
        this.openPrompt.setVisible(true);
        if (wantsInteract) {
          this.openSurpriseBox();
        }
      } else if (!this.isBoxOpened) {
        this.openPrompt.setVisible(false);
      }

      // Check proximity with final raccoon
      if (this.raccoonCollectible) {
        this.raccoonCollectible.updateProximity(
          this.truck.x,
          this.truck.y,
          wantsInteract
        );
      }
    }
  }
}
