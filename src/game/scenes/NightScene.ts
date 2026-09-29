import Phaser from "phaser";
import { Truck } from "../entities/Truck";
import { CollectibleRaccoon } from "../entities/CollectibleRaccoon";
import { GameHUD } from "../ui/GameHUD";
import { MobileControls } from "../ui/MobileControls";
import { AudioManager } from "../systems/AudioManager";
import { GameState } from "../systems/GameState";

export class NightScene extends Phaser.Scene {
  private truck!: Truck;
  private hud!: GameHUD;
  private mobileControls!: MobileControls;
  private raccoonCollectible?: CollectibleRaccoon;
  private readonly worldWidth = 2700;
  private exitTriggered: boolean = false;

  constructor() {
    super({ key: "NightScene" });
  }

  create(): void {
    this.exitTriggered = false;
    const height = this.cameras.main.height;
    AudioManager.getInstance().setSceneAtmosphere("night");

    this.physics.world.setBounds(0, 0, this.worldWidth, height);
    this.cameras.main.setBounds(0, 0, this.worldWidth, height);
    this.cameras.main.fadeIn(800, 7, 26, 51);

    this.setupNightSkyAndMoon(height);
    this.setupMountainsAndRoad(height);
    this.setupPlayer(height);
    this.setupRaccoon(height);
    this.setupExitMarker(height);

    this.hud = new GameHUD(this, "Noc i Gwiazdy");
    this.mobileControls = new MobileControls(this, this.truck);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      if (this.hud) this.hud.destroyHUD();
      if (this.mobileControls) this.mobileControls.destroyControls();
    });

    // Deep narrative quote held for several seconds
    this.time.delayedCall(1400, () => {
      this.hud.showNarratorQuote("Czasami nie cel jest najważniejszy...", 5500);
      this.time.delayedCall(6500, () => {
        this.hud.showNarratorQuote("Piękne jest to, że masz z kim przemierzać drogę. ✨", 7000);
      });
    });
  }

  private setupNightSkyAndMoon(height: number): void {
    // Midnight deep blue sky gradient
    const sky = this.add.graphics();
    sky.fillGradientStyle(0x020713, 0x040d21, 0x071a33, 0x09254a, 1);
    sky.fillRect(0, 0, this.worldWidth, height);
    sky.setScrollFactor(0);

    // Glowing Crescent Moon
    const moon = this.add.container(700, 100);
    moon.setScrollFactor(0.05);

    const moonGlow = this.add.circle(0, 0, 36, 0x8dd8ff, 0.25);
    const moonDisc = this.add.circle(0, 0, 24, 0xf4f8fc, 0.95);
    const moonCut = this.add.circle(9, -4, 21, 0x040d21, 1);
    moon.add([moonGlow, moonDisc, moonCut]);

    // Starfield
    for (let i = 0; i < 90; i++) {
      const sx = Phaser.Math.Between(0, this.worldWidth);
      const sy = Phaser.Math.Between(10, height * 0.65);
      const star = this.add.circle(
        sx,
        sy,
        Phaser.Math.FloatBetween(1, 2.5),
        0xffffff,
        Phaser.Math.FloatBetween(0.3, 0.95)
      );
      star.setScrollFactor(0.08);

      this.tweens.add({
        targets: star,
        alpha: { from: 0.2, to: 1 },
        duration: Phaser.Math.Between(1000, 3000),
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    }

    // Special Easter Egg Star at x = 1200
    const specialStar = this.add.text(1200, 80, "⭐", { fontSize: "22px" });
    specialStar.setScrollFactor(0.08);
    specialStar.setInteractive();
    specialStar.on("pointerdown", () => {
      GameState.getInstance().discoverEasterEgg("estrella especial");
      this.hud.dialogueBox.show("Odkryto najjaśniejszą gwiazdę tej nocy! ⭐✨", "NOCNE NIEBO", 4000);
      this.tweens.add({
        targets: specialStar,
        scale: 1.8,
        duration: 300,
        yoyo: true,
      });
    });

    // Night fog ribbons
    const fog = this.add.graphics();
    fog.fillStyle(0x0b3d66, 0.18);
    fog.fillRect(0, height - 170, this.worldWidth, 100);
    fog.setScrollFactor(0.35);
  }

  private setupMountainsAndRoad(height: number): void {
    // Night mountain silhouettes (scroll factor 0.18)
    for (let x = 0; x < this.worldWidth; x += 640) {
      const mFar = this.add.image(x + 320, height - 130, "scenery-mountain-far");
      mFar.setOrigin(0.5, 1);
      mFar.setScrollFactor(0.18);
      mFar.setTint(0x040e1f);
    }

    // Near dark hills
    for (let x = 0; x < this.worldWidth; x += 640) {
      const mNear = this.add.image(x + 320, height - 90, "scenery-mountain-near");
      mNear.setOrigin(0.5, 1);
      mNear.setScrollFactor(0.35);
      mNear.setTint(0x030a17);
    }

    const roadY = height - 70;

    // Road asphalt
    const road = this.add.graphics();
    road.fillStyle(0x02060d, 1);
    road.fillRect(0, roadY, this.worldWidth, 70);

    // Reflective cat-eyes / dashed line glowing in headlights
    road.lineStyle(2, 0xffb45c, 0.8);
    for (let x = 20; x < this.worldWidth; x += 60) {
      road.lineBetween(x, roadY + 35, x + 35, roadY + 35);
    }
    road.setDepth(5);
  }

  private setupPlayer(height: number): void {
    const roadY = height - 75;
    this.truck = new Truck(this, 160, roadY);
    this.truck.setDepth(20);
    this.truck.toggleHeadlights(true);

    this.cameras.main.startFollow(this.truck, true, 0.08, 0.08, -120, 20);
  }

  private setupRaccoon(height: number): void {
    const roadY = height - 95;
    // Raccoon #5 hidden under starry hill at x = 1600
    this.raccoonCollectible = new CollectibleRaccoon(this, 1600, roadY, 5);
    this.raccoonCollectible.setDepth(25);
  }

  private setupExitMarker(height: number): void {
    const roadY = height - 70;
    const exitX = this.worldWidth - 160;

    const gate = this.add.graphics();
    gate.fillStyle(0x168bea, 0.9);
    gate.fillRoundedRect(exitX - 85, roadY - 110, 170, 40, 8);
    gate.lineStyle(2, 0xffb45c, 0.8);
    gate.strokeRoundedRect(exitX - 85, roadY - 110, 170, 40, 8);
    gate.setDepth(15);

    const gateText = this.add.text(exitX, roadY - 90, "OSTATNI ODCINEK ▶", {
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
          this.scene.start("DestinationScene");
        });
      }
    }
  }
}
