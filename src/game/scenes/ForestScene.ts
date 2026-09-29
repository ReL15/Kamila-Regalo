import Phaser from "phaser";
import { Truck } from "../entities/Truck";
import { CollectibleRaccoon } from "../entities/CollectibleRaccoon";
import { GameHUD } from "../ui/GameHUD";
import { MobileControls } from "../ui/MobileControls";
import { AudioManager } from "../systems/AudioManager";
import { GameState } from "../systems/GameState";

export class ForestScene extends Phaser.Scene {
  private truck!: Truck;
  private hud!: GameHUD;
  private mobileControls!: MobileControls;
  private raccoonCollectible?: CollectibleRaccoon;
  private readonly worldWidth = 2600;
  private exitTriggered: boolean = false;
  private leafEmitter?: Phaser.GameObjects.Particles.ParticleEmitter;

  constructor() {
    super({ key: "ForestScene" });
  }

  create(): void {
    this.exitTriggered = false;
    const height = this.cameras.main.height;
    AudioManager.getInstance().setSceneAtmosphere("forest");

    this.physics.world.setBounds(0, 0, this.worldWidth, height);
    this.cameras.main.setBounds(0, 0, this.worldWidth, height);
    this.cameras.main.fadeIn(800, 7, 26, 51);

    this.setupParallaxLayers(height);
    this.setupRoadAndScenery(height);
    this.setupPlayer(height);
    this.setupRaccoon(height);
    this.setupParticles(height);
    this.setupExitMarker(height);

    this.hud = new GameHUD(this, "Wielki Las");
    this.mobileControls = new MobileControls(this, this.truck);

    // Narrative quotes
    this.time.delayedCall(1200, () => {
      this.hud.showNarratorQuote("Może właśnie dlatego ta podróż miała sens...", 4200);
      this.time.delayedCall(5000, () => {
        this.hud.showNarratorQuote("Po trochu ze wszystkiego, co tak bardzo lubisz. 🌲🚛", 4500);
      });
    });

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      if (this.hud) this.hud.destroyHUD();
      if (this.mobileControls) this.mobileControls.destroyControls();
      if (this.leafEmitter) this.leafEmitter.destroy();
    });
  }

  private setupParallaxLayers(height: number): void {
    // Deep forest canopy sky gradient
    const sky = this.add.graphics();
    sky.fillGradientStyle(0x061e1b, 0x092b27, 0x183c38, 0x071a33, 1);
    sky.fillRect(0, 0, this.worldWidth, height);
    sky.setScrollFactor(0);

    // Light rays / god rays from forest canopy
    const rays = this.add.graphics();
    rays.fillStyle(0xffb45c, 0.05);
    for (let x = 100; x < this.worldWidth; x += 320) {
      rays.beginPath();
      rays.moveTo(x, 0);
      rays.lineTo(x + 120, 0);
      rays.lineTo(x + 280, height);
      rays.lineTo(x + 160, height);
      rays.closePath();
      rays.fill();
    }
    rays.setScrollFactor(0.2);

    // Background distant trees (scroll factor 0.25)
    for (let x = 0; x < this.worldWidth; x += 110) {
      const tree = this.add.image(x, height - 120, "scenery-pine-tree");
      tree.setOrigin(0.5, 1);
      tree.setScale(Phaser.Math.FloatBetween(1.2, 1.8));
      tree.setScrollFactor(0.25);
      tree.setTint(0x0c2420);
    }

    // Midground forest trees (scroll factor 0.55)
    for (let x = 40; x < this.worldWidth; x += 85) {
      const tree = this.add.image(x, height - 90, "scenery-pine-tree");
      tree.setOrigin(0.5, 1);
      tree.setScale(Phaser.Math.FloatBetween(0.85, 1.3));
      tree.setScrollFactor(0.55);
      tree.setTint(0x133832);
    }

    // Fog / mist layer
    const fog = this.add.graphics();
    fog.fillStyle(0x8dd8ff, 0.08);
    fog.fillRect(0, height - 200, this.worldWidth, 120);
    fog.setScrollFactor(0.4);
  }

  private setupRoadAndScenery(height: number): void {
    const roadY = height - 70;

    // Roadbed
    const road = this.add.graphics();
    road.fillStyle(0x183c38, 1);
    road.fillRect(0, roadY - 12, this.worldWidth, 14);

    road.fillStyle(0x040d1a, 1);
    road.fillRect(0, roadY, this.worldWidth, 70);

    // Dashed center line
    road.lineStyle(2, 0xffb45c, 0.6);
    for (let x = 20; x < this.worldWidth; x += 60) {
      road.lineBetween(x, roadY + 35, x + 35, roadY + 35);
    }
    road.setDepth(5);

    // Secret Easter Egg: Blue Heart in the trees at x = 750
    const heart = this.add.text(750, roadY - 140, "💙", { fontSize: "24px" });
    heart.setDepth(12);
    heart.setInteractive();
    heart.on("pointerdown", () => {
      GameState.getInstance().discoverEasterEgg("corazón azul escondido");
      this.hud.dialogueBox.show("Odnaleziono niebieskie serce ukryte wśród gałęzi! 💙", "SEKRET", 3500);
      this.tweens.add({
        targets: heart,
        scale: 1.5,
        duration: 200,
        yoyo: true,
      });
    });

    // Parked truck in layby at x = 900 (Mundo de Kamila truck presence)
    const parkedTruck = this.add.image(900, roadY - 10, "truck-body");
    parkedTruck.setDepth(8);
    parkedTruck.setScale(0.85);
    parkedTruck.setTint(0x4a78a6);

    const parkedSign = this.add.text(900, roadY - 45, "Miejsce Odpoczynku", {
      fontFamily: "Plus Jakarta Sans, sans-serif",
      fontSize: "10px",
      color: "#8DD8FF",
    });
    parkedSign.setOrigin(0.5, 0.5);
    parkedSign.setDepth(9);
  }

  private setupPlayer(height: number): void {
    const roadY = height - 75;
    this.truck = new Truck(this, 160, roadY);
    this.truck.setDepth(20);

    this.cameras.main.startFollow(this.truck, true, 0.08, 0.08, -120, 20);
  }

  private setupRaccoon(height: number): void {
    const roadY = height - 95;
    // Raccoon #2 hidden at x = 1400 under the golden leaves
    this.raccoonCollectible = new CollectibleRaccoon(this, 1400, roadY, 2);
    this.raccoonCollectible.setDepth(25);
  }

  private setupParticles(height: number): void {
    if (GameState.getInstance().settings.reducedMotion) return;

    if (this.textures.exists("particle-leaf")) {
      this.leafEmitter = this.add.particles(0, 0, "particle-leaf", {
        x: { min: 0, max: this.worldWidth },
        y: -20,
        lifespan: 5000,
        speedY: { min: 40, max: 90 },
        speedX: { min: -20, max: 40 },
        scale: { start: 0.8, end: 0.4 },
        rotate: { min: 0, max: 360 },
        frequency: 250,
      });
      this.leafEmitter.setDepth(15);
    }
  }

  private setupExitMarker(height: number): void {
    const roadY = height - 70;
    const exitX = this.worldWidth - 160;

    const gate = this.add.graphics();
    gate.fillStyle(0x168bea, 0.9);
    gate.fillRoundedRect(exitX - 90, roadY - 110, 180, 40, 8);
    gate.lineStyle(2, 0xffb45c, 0.8);
    gate.strokeRoundedRect(exitX - 90, roadY - 110, 180, 40, 8);
    gate.setDepth(15);

    const gateText = this.add.text(exitX, roadY - 90, "JEZIORO WSPOMNIEŃ ▶", {
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
          this.scene.start("MemoryScene");
        });
      }
    }
  }
}
