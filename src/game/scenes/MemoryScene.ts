import Phaser from "phaser";
import { Truck } from "../entities/Truck";
import { CollectibleRaccoon } from "../entities/CollectibleRaccoon";
import { MemoryObject } from "../entities/MemoryObject";
import { GameHUD } from "../ui/GameHUD";
import { MobileControls } from "../ui/MobileControls";
import { AudioManager } from "../systems/AudioManager";
import { memories } from "../../config/memories";

export class MemoryScene extends Phaser.Scene {
  private truck!: Truck;
  private hud!: GameHUD;
  private mobileControls!: MobileControls;
  private raccoonCollectible?: CollectibleRaccoon;
  private memoryObjects: MemoryObject[] = [];
  private readonly worldWidth = 2800;
  private exitTriggered: boolean = false;

  constructor() {
    super({ key: "MemoryScene" });
  }

  create(): void {
    this.exitTriggered = false;
    this.memoryObjects = [];
    const height = this.cameras.main.height;
    AudioManager.getInstance().setSceneAtmosphere("lake");

    this.physics.world.setBounds(0, 0, this.worldWidth, height);
    this.cameras.main.setBounds(0, 0, this.worldWidth, height);
    this.cameras.main.fadeIn(800, 7, 26, 51);

    this.setupSunsetAndLake(height);
    this.setupRoadAndShore(height);
    this.setupPlayer(height);
    this.setupMemoryObjects(height);
    this.setupRaccoon(height);
    this.setupExitMarker(height);

    this.hud = new GameHUD(this, "Jezioro Wspomnień");
    this.mobileControls = new MobileControls(this, this.truck);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      if (this.hud) this.hud.destroyHUD();
      if (this.mobileControls) this.mobileControls.destroyControls();
    });

    // Narrative quote
    this.time.delayedCall(1200, () => {
      this.hud.showNarratorQuote("Niektóre chwile zasługują na to, by pozostać na zawsze... 🌅", 4800);
    });
  }

  private setupSunsetAndLake(height: number): void {
    // Sunset gradient: deep purple/blue at top to warm amber/gold at horizon
    const sky = this.add.graphics();
    sky.fillGradientStyle(0x071a33, 0x071a33, 0x0b3d66, 0xffb45c, 1);
    sky.fillRect(0, 0, this.worldWidth, height * 0.7);
    sky.setScrollFactor(0);

    // Sunset sun dipping into mountain lake
    const sun = this.add.circle(1200, height * 0.45, 48, 0xffb45c, 0.75);
    sun.setScrollFactor(0.08);

    // Distant mountain ridge reflection
    for (let x = 0; x < this.worldWidth; x += 640) {
      const m = this.add.image(x + 320, height * 0.58, "scenery-mountain-far");
      m.setOrigin(0.5, 1);
      m.setScrollFactor(0.15);
      m.setTint(0x071d38);
    }

    // Lake water band with animated shimmer
    for (let x = 0; x < this.worldWidth; x += 400) {
      const lake = this.add.image(x + 200, height - 90, "scenery-lake-water");
      lake.setOrigin(0.5, 1);
      lake.setScrollFactor(0.4);
      lake.setDepth(2);
    }
  }

  private setupRoadAndShore(height: number): void {
    const roadY = height - 70;

    // Wooden shoreline dock fence & posts
    const fence = this.add.graphics();
    fence.fillStyle(0x3e2723, 1);
    for (let x = 40; x < this.worldWidth; x += 80) {
      fence.fillRect(x, roadY - 24, 6, 26);
    }
    fence.fillRect(0, roadY - 18, this.worldWidth, 4);
    fence.setDepth(3);

    // Road asphalt
    const road = this.add.graphics();
    road.fillStyle(0x040d1a, 1);
    road.fillRect(0, roadY, this.worldWidth, 70);

    road.lineStyle(2, 0xffb45c, 0.6);
    for (let x = 20; x < this.worldWidth; x += 60) {
      road.lineBetween(x, roadY + 35, x + 35, roadY + 35);
    }
    road.setDepth(5);
  }

  private setupPlayer(height: number): void {
    const roadY = height - 75;
    this.truck = new Truck(this, 160, roadY);
    this.truck.setDepth(20);

    this.cameras.main.startFollow(this.truck, true, 0.08, 0.08, -120, 20);
  }

  private setupMemoryObjects(height: number): void {
    const roadY = height - 85;
    // 3 interactive memory items along the lake
    const xPositions = [650, 1350, 2050];

    memories.forEach((mem, index) => {
      const x = xPositions[index] || 600 + index * 600;
      const memObj = new MemoryObject(this, x, roadY, mem, "icon-memory-camera");
      memObj.setDepth(18);
      this.memoryObjects.push(memObj);
    });
  }

  private setupRaccoon(height: number): void {
    const roadY = height - 95;
    // Raccoon #3 hidden near lake overlook dock at x = 1680
    this.raccoonCollectible = new CollectibleRaccoon(this, 1680, roadY, 3);
    this.raccoonCollectible.setDepth(25);
  }

  private setupExitMarker(height: number): void {
    const roadY = height - 70;
    const exitX = this.worldWidth - 160;

    const gate = this.add.graphics();
    gate.fillStyle(0x168bea, 0.9);
    gate.fillRoundedRect(exitX - 85, roadY - 110, 170, 40, 8);
    gate.lineStyle(2, 0x8dd8ff, 0.8);
    gate.strokeRoundedRect(exitX - 85, roadY - 110, 170, 40, 8);
    gate.setDepth(15);

    const gateText = this.add.text(exitX, roadY - 90, "W STRONĘ MIASTA ▶", {
      fontFamily: "Plus Jakarta Sans, sans-serif",
      fontSize: "12px",
      fontStyle: "700",
      color: "#FFFFFF",
      letterSpacing: 1.5,
    });
    gateText.setOrigin(0.5, 0.5);
    gateText.setDepth(16);
  }

  override update(time: number, delta: number): void {
    if (this.truck) {
      this.truck.update(time, delta);
      const wantsInteract = this.truck.isInteractionPressed();

      // Check proximity with memory objects
      this.memoryObjects.forEach((obj) => {
        obj.updateProximity(this.truck.x, this.truck.y, wantsInteract);
      });

      // Check proximity with collectible raccoon
      if (this.raccoonCollectible) {
        this.raccoonCollectible.updateProximity(
          this.truck.x,
          this.truck.y,
          wantsInteract
        );
      }

      // Exit trigger
      if (this.truck.x >= this.worldWidth - 140 && !this.exitTriggered) {
        this.exitTriggered = true;
        this.cameras.main.fadeOut(600, 7, 26, 51);
        this.cameras.main.once("camerafadeoutcomplete", () => {
          this.scene.start("CityScene");
        });
      }
    }
  }
}
