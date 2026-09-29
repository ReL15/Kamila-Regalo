import Phaser from "phaser";
import { Truck } from "../entities/Truck";
import { CollectibleRaccoon } from "../entities/CollectibleRaccoon";
import { GameHUD } from "../ui/GameHUD";
import { MobileControls } from "../ui/MobileControls";
import { AudioManager } from "../systems/AudioManager";
import { GameState } from "../systems/GameState";

export class MountainScene extends Phaser.Scene {
  private truck!: Truck;
  private hud!: GameHUD;
  private mobileControls!: MobileControls;
  private raccoonCollectible?: CollectibleRaccoon;
  private readonly worldWidth = 2600;
  private exitTriggered: boolean = false;

  constructor() {
    super({ key: "MountainScene" });
  }

  create(): void {
    this.exitTriggered = false;
    const height = this.cameras.main.height;
    AudioManager.getInstance().setSceneAtmosphere("mountain");

    this.physics.world.setBounds(0, 0, this.worldWidth, height);
    this.cameras.main.setBounds(0, 0, this.worldWidth, height);
    this.cameras.main.fadeIn(800, 7, 26, 51);

    this.setupParallaxLayers(height);
    this.setupRoadAndScenery(height);
    this.setupPlayer(height);
    this.setupRaccoon(height);
    this.setupExitMarker(height);

    // Setup HUD & Mobile controls
    this.hud = new GameHUD(this, "Góry Początku");
    this.mobileControls = new MobileControls(this, this.truck);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      if (this.hud) this.hud.destroyHUD();
      if (this.mobileControls) this.mobileControls.destroyControls();
    });

    // Narrative texts
    this.time.delayedCall(1200, () => {
      this.hud.showNarratorQuote("Każda podróż ma swój początek...", 4000);
      this.time.delayedCall(4800, () => {
        this.hud.showNarratorQuote("A ta zaczęła się z myślą o kimś wyjątkowym. 💙", 4500);
      });
    });
  }

  private setupParallaxLayers(height: number): void {
    // Sky gradient background
    const sky = this.add.graphics();
    sky.fillGradientStyle(0x071a33, 0x071a33, 0x0b3d66, 0x168bea, 1);
    sky.fillRect(0, 0, this.worldWidth, height);
    sky.setScrollFactor(0);

    // Clouds
    for (let i = 0; i < 8; i++) {
      const cx = i * 360 + Phaser.Math.Between(-40, 40);
      const cy = Phaser.Math.Between(40, 140);
      const cloud = this.add.circle(cx, cy, Phaser.Math.Between(25, 45), 0x8dd8ff, 0.25);
      cloud.setScrollFactor(0.1);
    }

    // Distant mountain peaks (scroll factor 0.15)
    for (let x = 0; x < this.worldWidth; x += 640) {
      const mFar = this.add.image(x + 320, height - 160, "scenery-mountain-far");
      mFar.setOrigin(0.5, 1);
      mFar.setScrollFactor(0.15);
      mFar.setTint(0x0b3d66);
    }

    // Near mountain ridges (scroll factor 0.35)
    for (let x = 0; x < this.worldWidth; x += 640) {
      const mNear = this.add.image(x + 320, height - 120, "scenery-mountain-near");
      mNear.setOrigin(0.5, 1);
      mNear.setScrollFactor(0.35);
      mNear.setTint(0x072b4d);
    }

    // Pine trees silhouettes (scroll factor 0.6)
    for (let x = 80; x < this.worldWidth; x += Phaser.Math.Between(90, 180)) {
      const tree = this.add.image(x, height - 90, "scenery-pine-tree");
      tree.setOrigin(0.5, 1);
      tree.setScale(Phaser.Math.FloatBetween(0.8, 1.25));
      tree.setScrollFactor(0.6);
      tree.setTint(0x112c2a);
    }
  }

  private setupRoadAndScenery(height: number): void {
    const roadY = height - 70;

    // Asphalt Road
    const road = this.add.graphics();
    // Shoulder / grass
    road.fillStyle(0x183c38, 1);
    road.fillRect(0, roadY - 10, this.worldWidth, 12);
    // Dark asphalt
    road.fillStyle(0x040d1a, 1);
    road.fillRect(0, roadY, this.worldWidth, 70);

    // Dashed white/yellow center lines
    road.lineStyle(2, 0xffb45c, 0.7);
    for (let x = 20; x < this.worldWidth; x += 60) {
      road.lineBetween(x, roadY + 35, x + 35, roadY + 35);
    }
    road.setDepth(5);

    // Road signs along mountain route
    const sign1 = this.add.image(380, roadY - 25, "scenery-road-sign");
    sign1.setDepth(6);
    sign1.setInteractive();
    sign1.on("pointerdown", () => {
      GameState.getInstance().discoverEasterEgg("señal secreta");
      this.hud.dialogueBox.show("Znak na trasie: 'Dla Kamili, z całego serca'", "TRASA", 3000);
    });

    const sign2 = this.add.image(1500, roadY - 25, "scenery-road-sign");
    sign2.setDepth(6);
  }

  private setupPlayer(height: number): void {
    const roadY = height - 75;
    this.truck = new Truck(this, 180, roadY);
    this.truck.setDepth(20);

    // Smooth camera follow
    this.cameras.main.startFollow(this.truck, true, 0.08, 0.08, -120, 20);
  }

  private setupRaccoon(height: number): void {
    const roadY = height - 95;
    // Raccoon #1 hidden around x = 1850 among pine trees
    this.raccoonCollectible = new CollectibleRaccoon(this, 1850, roadY, 1);
    this.raccoonCollectible.setDepth(25);
  }

  private setupExitMarker(height: number): void {
    const roadY = height - 70;
    const exitX = this.worldWidth - 160;

    // Road exit gate
    const gate = this.add.graphics();
    gate.fillStyle(0x168bea, 0.9);
    gate.fillRoundedRect(exitX - 80, roadY - 110, 160, 40, 8);
    gate.lineStyle(2, 0x8dd8ff, 0.8);
    gate.strokeRoundedRect(exitX - 80, roadY - 110, 160, 40, 8);
    gate.setDepth(15);

    const gateText = this.add.text(exitX, roadY - 90, "WIELKI LAS ▶", {
      fontFamily: "Plus Jakarta Sans, sans-serif",
      fontSize: "12px",
      fontStyle: "700",
      color: "#FFFFFF",
      letterSpacing: 1.5,
    });
    gateText.setOrigin(0.5, 0.5);
    gateText.setDepth(16);

    // Chevrons on road
    gate.lineStyle(3, 0xffb45c, 0.8);
    gate.lineBetween(exitX - 40, roadY + 20, exitX, roadY + 35);
    gate.lineBetween(exitX - 40, roadY + 50, exitX, roadY + 35);
  }

  override update(time: number, delta: number): void {
    if (this.truck) {
      this.truck.update(time, delta);

      // Check proximity with collectible raccoon
      if (this.raccoonCollectible) {
        this.raccoonCollectible.updateProximity(
          this.truck.x,
          this.truck.y,
          this.truck.isInteractionPressed()
        );
      }

      // Check exit trigger
      if (this.truck.x >= this.worldWidth - 140 && !this.exitTriggered) {
        this.exitTriggered = true;
        this.cameras.main.fadeOut(600, 7, 26, 51);
        this.cameras.main.once("camerafadeoutcomplete", () => {
          this.scene.start("ForestScene");
        });
      }
    }
  }
}
