import Phaser from "phaser";
import { Truck } from "../entities/Truck";

export class MobileControls extends Phaser.GameObjects.Container {
  private truck: Truck;
  private btnLeft!: Phaser.GameObjects.Container;
  private btnRight!: Phaser.GameObjects.Container;
  private btnBrake!: Phaser.GameObjects.Container;
  private btnInteract!: Phaser.GameObjects.Container;
  private btnHonk!: Phaser.GameObjects.Container;
  private onResizeHandler = () => this.reposition();
  private isDestroyedControls: boolean = false;

  constructor(scene: Phaser.Scene, truck: Truck) {
    super(scene, 0, 0);
    this.truck = truck;
    this.setScrollFactor(0);
    this.setDepth(90);
    this.scene.add.existing(this);

    this.setupButtons();
    this.reposition();

    // Show on-screen controls by default for touch and mobile, and provide on-screen buttons
    this.setVisible(true);

    this.scene.scale.on("resize", this.onResizeHandler);
    this.scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.destroyControls());
    this.scene.events.once(Phaser.Scenes.Events.DESTROY, () => this.destroyControls());
  }

  private createButton(
    label: string,
    width: number,
    height: number,
    bgColor: number,
    onDown: () => void,
    onUp?: () => void,
    iconKey?: string
  ): Phaser.GameObjects.Container {
    const btn = this.scene.add.container(0, 0);

    const bg = this.scene.add.graphics();
    bg.fillStyle(bgColor, 0.88);
    bg.fillRoundedRect(-width / 2, -height / 2, width, height, 14);
    bg.lineStyle(2, 0x8dd8ff, 0.7);
    bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 14);
    btn.add(bg);

    if (iconKey && this.scene.textures.exists(iconKey)) {
      const icon = this.scene.add.image(0, 0, iconKey);
      btn.add(icon);
    } else {
      const text = this.scene.add.text(0, 0, label, {
        fontFamily: "Plus Jakarta Sans, sans-serif",
        fontSize: label.length > 5 ? "11px" : "18px",
        fontStyle: "800",
        color: "#ffffff",
      });
      text.setOrigin(0.5, 0.5);
      btn.add(text);
    }

    // Set container hitArea directly with centered coordinates
    btn.setSize(width, height);
    const hitRect = new Phaser.Geom.Rectangle(-width / 2, -height / 2, width, height);
    btn.setInteractive(hitRect, Phaser.Geom.Rectangle.Contains);
    if (btn.input) {
      btn.input.cursor = "pointer";
    }

    btn.on("pointerdown", () => {
      this.scene.tweens.add({
        targets: btn,
        scale: 0.90,
        duration: 50,
      });
      onDown();
    });

    const release = () => {
      this.scene.tweens.add({
        targets: btn,
        scale: 1,
        duration: 70,
      });
      if (onUp) onUp();
    };

    btn.on("pointerup", release);
    btn.on("pointerout", release);
    btn.on("pointercancel", release);

    return btn;
  }

  private setupButtons(): void {
    // Left
    this.btnLeft = this.createButton(
      "◀",
      54,
      54,
      0x0b3d66,
      () => this.truck.setMobileInput("left", true),
      () => this.truck.setMobileInput("left", false)
    );
    this.add(this.btnLeft);

    // Right
    this.btnRight = this.createButton(
      "▶",
      54,
      54,
      0x0b3d66,
      () => this.truck.setMobileInput("right", true),
      () => this.truck.setMobileInput("right", false)
    );
    this.add(this.btnRight);

    // Brake
    this.btnBrake = this.createButton(
      "FRENAR",
      70,
      48,
      0x331010,
      () => this.truck.setMobileInput("brake", true),
      () => this.truck.setMobileInput("brake", false)
    );
    this.add(this.btnBrake);

    // Interact [E]
    this.btnInteract = this.createButton(
      "ACCION [E]",
      100,
      54,
      0x168bea,
      () => this.truck.setMobileInput("interact", true)
    );
    this.add(this.btnInteract);

    // Honk
    this.btnHonk = this.createButton(
      "📯",
      48,
      48,
      0x183c38,
      () => this.truck.honk()
    );
    this.add(this.btnHonk);
  }

  public reposition(): void {
    if (this.isDestroyedControls || !this.scene || !this.scene.sys || !this.scene.sys.isActive() || !this.scene.cameras || !this.scene.cameras.main) {
      return;
    }
    const width = this.scene.cameras.main.width;
    const height = this.scene.cameras.main.height;

    // Left controls
    if (this.btnLeft) this.btnLeft.setPosition(50, height - 55);
    if (this.btnRight) this.btnRight.setPosition(115, height - 55);
    if (this.btnBrake) this.btnBrake.setPosition(82, height - 115);

    // Right controls
    if (this.btnInteract) this.btnInteract.setPosition(width - 70, height - 55);
    if (this.btnHonk) this.btnHonk.setPosition(width - 140, height - 55);
  }

  public destroyControls(): void {
    if (this.isDestroyedControls) return;
    this.isDestroyedControls = true;
    if (this.scene && this.scene.scale) {
      this.scene.scale.off("resize", this.onResizeHandler);
    }
    try {
      this.destroy();
    } catch {
      // ignore
    }
  }

  public override destroy(fromScene?: boolean): void {
    this.isDestroyedControls = true;
    if (this.scene && this.scene.scale) {
      this.scene.scale.off("resize", this.onResizeHandler);
    }
    super.destroy(fromScene);
  }
}
