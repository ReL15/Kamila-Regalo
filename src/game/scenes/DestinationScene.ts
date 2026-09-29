import Phaser from "phaser";
import { Truck } from "../entities/Truck";
import { Raccoon } from "../entities/Raccoon";
import { CollectibleRaccoon } from "../entities/CollectibleRaccoon";
import { GameHUD } from "../ui/GameHUD";
import { MobileControls } from "../ui/MobileControls";
import { AudioManager } from "../systems/AudioManager";
import { birthdayConfig } from "../../config/birthdayConfig";
import { createInteractiveButton } from "../ui/Button";

export class DestinationScene extends Phaser.Scene {
  private truck!: Truck;
  private raccoonCompanion!: Raccoon;
  private raccoonCollectible?: CollectibleRaccoon;
  private hud!: GameHUD;
  private mobileControls!: MobileControls;
  private readonly worldWidth = 2200;
  private isAtOverlook: boolean = false;
  private letterContainer?: Phaser.GameObjects.Container;
  private falseEndingContainer?: Phaser.GameObjects.Container;

  constructor() {
    super({ key: "DestinationScene" });
  }

  create(): void {
    this.isAtOverlook = false;
    const height = this.cameras.main.height;
    AudioManager.getInstance().setSceneAtmosphere("peaceful");

    this.physics.world.setBounds(0, 0, this.worldWidth, height);
    this.cameras.main.setBounds(0, 0, this.worldWidth, height);
    this.cameras.main.fadeIn(1000, 7, 26, 51);

    this.setupScenicDestination(height);
    this.setupRoadAndMirador(height);
    this.setupPlayer(height);
    this.setupRaccoonCollectible(height);

    this.hud = new GameHUD(this, "El Mirador del Amanecer");
    this.mobileControls = new MobileControls(this, this.truck);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      if (this.hud) this.hud.destroyHUD();
      if (this.mobileControls) this.mobileControls.destroyControls();
    });

    // Initial narrative
    this.time.delayedCall(1200, () => {
      this.hud.showNarratorQuote("Después de tantos kilómetros...", 4500);
      this.time.delayedCall(5000, () => {
        this.hud.showNarratorQuote("...creo que llegamos. 🌅💙", 5000);
      });
    });
  }

  private setupScenicDestination(height: number): void {
    // Dawn sky: deep dark blue at top -> vibrant sky blue -> golden morning amber
    const sky = this.add.graphics();
    sky.fillGradientStyle(0x071a33, 0x0b3d66, 0x168bea, 0xffb45c, 1);
    sky.fillRect(0, 0, this.worldWidth, height);
    sky.setScrollFactor(0);

    // Golden morning sun rising above the lake
    const sunGlow = this.add.circle(1700, height * 0.42, 60, 0xffb45c, 0.75);
    sunGlow.setScrollFactor(0.06);

    // Fluffy morning clouds bathed in gold
    for (let i = 0; i < 6; i++) {
      const cloud = this.add.circle(i * 380 + 100, 100, 36, 0xf4f8fc, 0.35);
      cloud.setScrollFactor(0.1);
    }

    // Majestic alpine mountain range
    for (let x = 0; x < this.worldWidth; x += 640) {
      const mFar = this.add.image(x + 320, height * 0.62, "scenery-mountain-far");
      mFar.setOrigin(0.5, 1);
      mFar.setScrollFactor(0.14);
      mFar.setTint(0x0c2f52);
    }

    // Pristine alpine lake reflection
    for (let x = 0; x < this.worldWidth; x += 400) {
      const lake = this.add.image(x + 200, height - 90, "scenery-lake-water");
      lake.setOrigin(0.5, 1);
      lake.setScrollFactor(0.4);
      lake.setTint(0x1a4f80);
      lake.setDepth(2);
    }

    // Gentle morning mist over water
    const mist = this.add.graphics();
    mist.fillStyle(0xffb45c, 0.12);
    mist.fillRect(0, height - 160, this.worldWidth, 80);
    mist.setScrollFactor(0.3);
  }

  private setupRoadAndMirador(height: number): void {
    const roadY = height - 70;

    // Road asphalt until the overlook platform
    const road = this.add.graphics();
    road.fillStyle(0x040d1a, 1);
    road.fillRect(0, roadY, 1300, 70);

    road.lineStyle(2, 0xffb45c, 0.7);
    for (let x = 20; x < 1250; x += 60) {
      road.lineBetween(x, roadY + 35, x + 35, roadY + 35);
    }
    road.setDepth(5);

    // Mirador wooden decking from x = 1250 to 2200
    const deck = this.add.graphics();
    deck.fillStyle(0x3e2723, 1);
    deck.fillRect(1250, roadY - 8, this.worldWidth - 1250, 78);

    // Deck planks
    deck.lineStyle(1.5, 0x1f140e, 0.5);
    for (let x = 1250; x < this.worldWidth; x += 30) {
      deck.lineBetween(x, roadY - 8, x, roadY + 70);
    }

    // Scenic wooden railing
    deck.fillStyle(0x5d4037, 1);
    for (let x = 1260; x < this.worldWidth; x += 60) {
      deck.fillRect(x, roadY - 36, 8, 30);
    }
    deck.fillRect(1250, roadY - 32, this.worldWidth - 1250, 6);
    deck.setDepth(6);

    // Mirador Sign
    const sign = this.add.container(1280, roadY - 45);
    sign.setDepth(8);
    const signBg = this.add.graphics();
    signBg.fillStyle(0x168bea, 1);
    signBg.fillRoundedRect(-50, -16, 100, 32, 6);
    sign.add(signBg);
    const signText = this.add.text(0, 0, "MIRADOR", {
      fontFamily: "Plus Jakarta Sans, sans-serif",
      fontSize: "11px",
      fontStyle: "700",
      color: "#FFFFFF",
    });
    signText.setOrigin(0.5, 0.5);
    sign.add(signText);
  }

  private setupPlayer(height: number): void {
    const roadY = height - 75;
    this.truck = new Truck(this, 160, roadY);
    this.truck.setDepth(20);

    this.cameras.main.startFollow(this.truck, true, 0.08, 0.08, -120, 20);
  }

  private setupRaccoonCollectible(height: number): void {
    const roadY = height - 95;
    // Raccoon #6 collectible placed on mirador trail at x = 1450
    this.raccoonCollectible = new CollectibleRaccoon(this, 1450, roadY, 6);
    this.raccoonCollectible.setDepth(25);
  }

  private triggerArrivalSequence(): void {
    if (this.isAtOverlook) return;
    this.isAtOverlook = true;

    // Raccoon companion gets down and walks to the railing
    const roadY = this.cameras.main.height - 85;
    this.raccoonCompanion = new Raccoon(this, this.truck.x + 30, roadY);
    this.raccoonCompanion.setDepth(22);

    this.raccoonCompanion.walkTo(1800, 2500, () => {
      this.raccoonCompanion.wave();
      this.showDestinationCelebration();
    });
  }

  private showDestinationCelebration(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Cinematic center banner
    const bannerContainer = this.add.container(width / 2, height * 0.28);
    bannerContainer.setScrollFactor(0);
    bannerContainer.setDepth(150);
    bannerContainer.setAlpha(0);

    const bannerBg = this.add.graphics();
    bannerBg.fillStyle(0x071a33, 0.9);
    bannerBg.fillRoundedRect(-320, -55, 640, 110, 16);
    bannerBg.lineStyle(2, 0xffb45c, 0.85);
    bannerBg.strokeRoundedRect(-320, -55, 640, 110, 16);
    bannerContainer.add(bannerBg);

    const h1 = this.add.text(0, -18, `FELIZ CUMPLEAÑOS, ${birthdayConfig.name.toUpperCase()} 💙`, {
      fontFamily: "Plus Jakarta Sans, sans-serif",
      fontSize: "22px",
      fontStyle: "800",
      color: "#8DD8FF",
      letterSpacing: 2,
    });
    h1.setOrigin(0.5, 0.5);
    bannerContainer.add(h1);

    const sub = this.add.text(0, 18, `“${birthdayConfig.mainPhrase}”`, {
      fontFamily: "Plus Jakarta Sans, sans-serif",
      fontSize: "13px",
      fontStyle: "italic",
      color: "#FFB45C",
      align: "center",
      wordWrap: { width: 580 },
    });
    sub.setOrigin(0.5, 0.5);
    bannerContainer.add(sub);

    this.tweens.add({
      targets: bannerContainer,
      alpha: 1,
      y: height * 0.26,
      duration: 800,
      ease: "Quad.easeOut",
    });

    // "LEER CARTA" button
    const letterBtn = createInteractiveButton(
      this,
      width / 2,
      height * 0.44,
      "LEER CARTA ✉️",
      () => {
        this.openLetterModal();
      },
      {
        width: 190,
        height: 44,
        fillColor: 0x168bea,
        strokeColor: 0xffffff,
        strokeWidth: 2,
        radius: 22,
      }
    );
    letterBtn.setScrollFactor(0);
    letterBtn.setDepth(160);
    letterBtn.setAlpha(0);

    this.tweens.add({
      targets: letterBtn,
      alpha: 1,
      duration: 600,
      delay: 500,
    });
  }

  private openLetterModal(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    this.letterContainer = this.add.container(width / 2, height / 2);
    this.letterContainer.setScrollFactor(0);
    this.letterContainer.setDepth(260);

    // Backdrop
    const backdrop = this.add.graphics();
    backdrop.fillStyle(0x040d1a, 0.92);
    backdrop.fillRect(-width, -height, width * 2, height * 2);
    this.letterContainer.add(backdrop);

    const cardWidth = Math.min(580, width - 36);
    const cardHeight = Math.min(480, height - 40);

    // Letter parchment card
    const card = this.add.graphics();
    card.fillStyle(0x071a33, 0.98);
    card.fillRoundedRect(-cardWidth / 2, -cardHeight / 2, cardWidth, cardHeight, 18);
    card.lineStyle(2, 0xffb45c, 0.85);
    card.strokeRoundedRect(-cardWidth / 2, -cardHeight / 2, cardWidth, cardHeight, 18);
    this.letterContainer.add(card);

    // Title
    const title = this.add.text(0, -cardHeight / 2 + 35, birthdayConfig.letter.title, {
      fontFamily: "Cinzel, serif",
      fontSize: "20px",
      fontStyle: "700",
      color: "#FFB45C",
      letterSpacing: 2,
    });
    title.setOrigin(0.5, 0.5);
    this.letterContainer.add(title);

    // Body text
    const body = this.add.text(0, -cardHeight / 2 + 75, birthdayConfig.letter.body, {
      fontFamily: "Plus Jakarta Sans, sans-serif",
      fontSize: "14px",
      color: "#F4F8FC",
      wordWrap: { width: cardWidth - 55 },
      lineSpacing: 7,
    });
    body.setOrigin(0.5, 0);
    this.letterContainer.add(body);

    // Continue button
    const closeBtn = createInteractiveButton(
      this,
      0,
      cardHeight / 2 - 35,
      "CONTINUAR ▶",
      () => {
        this.letterContainer?.destroy();
        this.triggerFalseEnding();
      },
      {
        width: 170,
        height: 38,
        fillColor: 0x168bea,
        strokeColor: 0x8dd8ff,
        strokeWidth: 2,
        radius: 19,
      }
    );
    this.letterContainer.add(closeBtn);

    this.letterContainer.setAlpha(0);
    this.tweens.add({
      targets: this.letterContainer,
      alpha: 1,
      duration: 300,
    });
  }

  private triggerFalseEnding(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    this.falseEndingContainer = this.add.container(width / 2, height / 2);
    this.falseEndingContainer.setScrollFactor(0);
    this.falseEndingContainer.setDepth(300);

    // Fade to black
    const bg = this.add.graphics();
    bg.fillStyle(0x040d1a, 1);
    bg.fillRect(-width, -height, width * 2, height * 2);
    this.falseEndingContainer.add(bg);

    // "FIN DEL VIAJE"
    const finText = this.add.text(0, -20, "FIN DEL VIAJE", {
      fontFamily: "Cinzel, serif",
      fontSize: "32px",
      fontStyle: "700",
      color: "#8DD8FF",
      letterSpacing: 6,
    });
    finText.setOrigin(0.5, 0.5);
    finText.setAlpha(0);
    this.falseEndingContainer.add(finText);

    // Sequence: Fade in "FIN DEL VIAJE"...
    this.tweens.add({
      targets: finText,
      alpha: 1,
      duration: 1000,
      onComplete: () => {
        // Wait...
        this.time.delayedCall(2200, () => {
          // Fade out "FIN DEL VIAJE"
          this.tweens.add({
            targets: finText,
            alpha: 0,
            duration: 600,
            onComplete: () => {
              // Raccoon peeks in with surprised reaction
              const raccoonPeek = this.add.image(0, -40, "raccoon-head");
              raccoonPeek.setScale(1.6);
              raccoonPeek.setAlpha(0);
              this.falseEndingContainer?.add(raccoonPeek);

              const waitText = this.add.text(0, 35, "Espera...", {
                fontFamily: "Plus Jakarta Sans, sans-serif",
                fontSize: "18px",
                fontStyle: "italic",
                color: "#FFB45C",
              });
              waitText.setOrigin(0.5, 0.5);
              waitText.setAlpha(0);
              this.falseEndingContainer?.add(waitText);

              this.tweens.add({
                targets: [raccoonPeek, waitText],
                alpha: 1,
                duration: 600,
                onComplete: () => {
                  this.time.delayedCall(1600, () => {
                    waitText.setText("¿CREÍAS QUE ESTE ERA EL DESTINO? 👀");

                    // Show CONTINUAR button
                    const contBtn = createInteractiveButton(
                      this,
                      0,
                      95,
                      "CONTINUAR ▶",
                      () => {
                        this.cameras.main.fadeOut(500, 7, 26, 51);
                        this.cameras.main.once("camerafadeoutcomplete", () => {
                          this.scene.start("SurpriseScene");
                        });
                      },
                      {
                        width: 200,
                        height: 44,
                        fillColor: 0x168bea,
                        strokeColor: 0xffb45c,
                        strokeWidth: 2,
                        radius: 22,
                      }
                    );
                    this.falseEndingContainer?.add(contBtn);
                  });
                },
              });
            },
          });
        });
      },
    });
  }

  override update(time: number, delta: number): void {
    if (this.truck) {
      this.truck.update(time, delta);

      if (this.raccoonCollectible) {
        this.raccoonCollectible.updateProximity(
          this.truck.x,
          this.truck.y,
          this.truck.isInteractionPressed()
        );
      }

      // If truck enters mirador area (x > 1400) and hasn't triggered arrival sequence
      if (this.truck.x >= 1400 && !this.isAtOverlook) {
        this.triggerArrivalSequence();
      }
    }
  }
}
