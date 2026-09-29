import Phaser from "phaser";
import { Truck } from "../entities/Truck";
import { CollectibleRaccoon } from "../entities/CollectibleRaccoon";
import { GameHUD } from "../ui/GameHUD";
import { MobileControls } from "../ui/MobileControls";
import { AudioManager } from "../systems/AudioManager";
import { GameState } from "../systems/GameState";

export class CityScene extends Phaser.Scene {
  private truck!: Truck;
  private hud!: GameHUD;
  private mobileControls!: MobileControls;
  private raccoonCollectible?: CollectibleRaccoon;
  private rainEmitter?: Phaser.GameObjects.Particles.ParticleEmitter;
  private readonly worldWidth = 2700;
  private exitTriggered: boolean = false;

  constructor() {
    super({ key: "CityScene" });
  }

  create(): void {
    this.exitTriggered = false;
    const height = this.cameras.main.height;
    AudioManager.getInstance().setSceneAtmosphere("city");

    this.physics.world.setBounds(0, 0, this.worldWidth, height);
    this.cameras.main.setBounds(0, 0, this.worldWidth, height);
    this.cameras.main.fadeIn(800, 7, 26, 51);

    this.setupCitySkyline(height);
    this.setupStreetAndReflections(height);
    this.setupPlayer(height);
    this.setupRaccoon(height);
    this.setupRain(height);
    this.setupExitMarker(height);

    this.hud = new GameHUD(this, "Europejskie Miasto o Zmierzchu");
    this.mobileControls = new MobileControls(this, this.truck);

    this.time.delayedCall(1200, () => {
      this.hud.showNarratorQuote("Ciepłe światła miasta odbijające się w mokrym asfalcie...", 4500);
      this.time.delayedCall(5000, () => {
        this.hud.dialogueBox.show("Szop z zaciekawieniem wygląda przez okno na stare kamienice i latarnie. 🦝🌧️", "TOWARZYSZ", 4000);
      });
    });

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      if (this.hud) this.hud.destroyHUD();
      if (this.mobileControls) this.mobileControls.destroyControls();
      if (this.rainEmitter) this.rainEmitter.destroy();
    });
  }

  private setupCitySkyline(height: number): void {
    // Rainy evening sky
    const sky = this.add.graphics();
    sky.fillGradientStyle(0x050f1d, 0x071a33, 0x0b2647, 0x113159, 1);
    sky.fillRect(0, 0, this.worldWidth, height);
    sky.setScrollFactor(0);

    // Distant city buildings (scroll factor 0.2)
    for (let x = 0; x < this.worldWidth; x += 600) {
      const bFar = this.add.image(x + 300, height - 90, "scenery-city-row");
      bFar.setOrigin(0.5, 1);
      bFar.setScrollFactor(0.2);
      bFar.setScale(0.85);
      bFar.setTint(0x06152a);
    }

    // Midground city row houses (scroll factor 0.45)
    for (let x = 40; x < this.worldWidth; x += 520) {
      const bMid = this.add.image(x + 260, height - 70, "scenery-city-row");
      bMid.setOrigin(0.5, 1);
      bMid.setScrollFactor(0.45);
      bMid.setScale(1);
    }
  }

  private setupStreetAndReflections(height: number): void {
    const roadY = height - 70;

    // Sidewalk with curb
    const sidewalk = this.add.graphics();
    sidewalk.fillStyle(0x1f2937, 1);
    sidewalk.fillRect(0, roadY - 14, this.worldWidth, 16);
    sidewalk.lineStyle(1.5, 0x9ca3af, 0.4);
    sidewalk.lineBetween(0, roadY, this.worldWidth, roadY);
    sidewalk.setDepth(3);

    // Street lampposts along sidewalk
    for (let x = 120; x < this.worldWidth; x += 260) {
      const lamp = this.add.image(x, roadY - 2, "scenery-lamppost");
      lamp.setOrigin(0.5, 1);
      lamp.setDepth(4);

      // Warm ground reflection pool under lamppost
      const reflection = this.add.ellipse(x, roadY + 20, 70, 18, 0xffb45c, 0.22);
      reflection.setDepth(6);
    }

    // Wet asphalt street
    const street = this.add.graphics();
    street.fillStyle(0x050c17, 1);
    street.fillRect(0, roadY, this.worldWidth, 70);

    // Wet street puddle reflections
    street.fillStyle(0x8dd8ff, 0.08);
    for (let x = 80; x < this.worldWidth; x += 180) {
      street.fillEllipse(x + 50, roadY + 45, 60, 12);
    }

    // Dashed center line
    street.lineStyle(2, 0xffb45c, 0.7);
    for (let x = 20; x < this.worldWidth; x += 60) {
      street.lineBetween(x, roadY + 35, x + 35, roadY + 35);
    }
    street.setDepth(5);
  }

  private setupPlayer(height: number): void {
    const roadY = height - 75;
    this.truck = new Truck(this, 160, roadY);
    this.truck.setDepth(20);

    this.cameras.main.startFollow(this.truck, true, 0.08, 0.08, -120, 20);
  }

  private setupRaccoon(height: number): void {
    const roadY = height - 95;
    // Raccoon #4 hidden under a warm lamppost near x = 2100
    this.raccoonCollectible = new CollectibleRaccoon(this, 2100, roadY, 4);
    this.raccoonCollectible.setDepth(25);
  }

  private setupRain(height: number): void {
    if (GameState.getInstance().settings.reducedMotion) return;

    if (this.textures.exists("particle-raindrop")) {
      this.rainEmitter = this.add.particles(0, 0, "particle-raindrop", {
        x: { min: 0, max: this.worldWidth },
        y: -10,
        lifespan: 1200,
        speedY: { min: 380, max: 480 },
        speedX: { min: -70, max: -40 },
        scale: { start: 1, end: 0.8 },
        alpha: { start: 0.7, end: 0.2 },
        frequency: 60,
      });
      this.rainEmitter.setDepth(30);
    }
  }

  private setupExitMarker(height: number): void {
    const roadY = height - 70;
    const exitX = this.worldWidth - 160;

    const gate = this.add.graphics();
    gate.fillStyle(0x168bea, 0.9);
    gate.fillRoundedRect(exitX - 95, roadY - 110, 190, 40, 8);
    gate.lineStyle(2, 0xffb45c, 0.8);
    gate.strokeRoundedRect(exitX - 95, roadY - 110, 190, 40, 8);
    gate.setDepth(15);

    const gateText = this.add.text(exitX, roadY - 90, "NOCNA TRASA ▶", {
      fontFamily: "Plus Jakarta Sans, sans-serif",
      fontSize: "11px",
      fontStyle: "700",
      color: "#FFFFFF",
      letterSpacing: 1,
    });
    gateText.setOrigin(0.5, 0.5);
    gateText.setDepth(16);
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

      if (this.truck.x >= this.worldWidth - 140 && !this.exitTriggered) {
        this.exitTriggered = true;
        this.cameras.main.fadeOut(600, 7, 26, 51);
        this.cameras.main.once("camerafadeoutcomplete", () => {
          this.scene.start("NightScene");
        });
      }
    }
  }
}
