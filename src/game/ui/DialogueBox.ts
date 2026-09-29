import Phaser from "phaser";

export class DialogueBox extends Phaser.GameObjects.Container {
  private background!: Phaser.GameObjects.Graphics;
  private speakerText!: Phaser.GameObjects.Text;
  private messageText!: Phaser.GameObjects.Text;
  private hintText!: Phaser.GameObjects.Text;
  private avatarImage!: Phaser.GameObjects.Image;
  private dismissTimer?: Phaser.Time.TimerEvent;
  private isShown: boolean = false;
  private isDestroyedBox: boolean = false;

  constructor(scene: Phaser.Scene) {
    const screenWidth = scene.cameras.main.width;
    const screenHeight = scene.cameras.main.height;
    super(scene, screenWidth / 2, screenHeight - 110);

    this.setScrollFactor(0);
    this.setDepth(100);
    this.scene.add.existing(this);

    this.setupVisuals();
    this.setVisible(false);

    this.scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.destroyBox());
    this.scene.events.once(Phaser.Scenes.Events.DESTROY, () => this.destroyBox());
  }

  private setupVisuals(): void {
    const width = Math.min(680, this.scene.cameras.main.width - 40);
    const height = 110;

    // Dark glassmorphism background
    this.background = this.scene.add.graphics();
    this.background.fillStyle(0x071a33, 0.92);
    this.background.fillRoundedRect(-width / 2, -height / 2, width, height, 16);
    this.background.lineStyle(2, 0x168bea, 0.8);
    this.background.strokeRoundedRect(-width / 2, -height / 2, width, height, 16);
    this.add(this.background);

    // Speaker avatar (small raccoon head)
    this.avatarImage = this.scene.add.image(-width / 2 + 55, 0, "raccoon-head");
    this.avatarImage.setScale(1.1);
    this.add(this.avatarImage);

    // Speaker name
    this.speakerText = this.scene.add.text(-width / 2 + 110, -36, "TOWARZYSZ PODRÓŻY", {
      fontFamily: "Plus Jakarta Sans, sans-serif",
      fontSize: "12px",
      fontStyle: "700",
      color: "#FFB45C",
    });
    this.add(this.speakerText);

    // Message
    this.messageText = this.scene.add.text(-width / 2 + 110, -14, "", {
      fontFamily: "Plus Jakarta Sans, sans-serif",
      fontSize: "15px",
      color: "#F4F8FC",
      wordWrap: { width: width - 150 },
      lineSpacing: 4,
    });
    this.add(this.messageText);

    // Dismiss hint
    this.hintText = this.scene.add.text(width / 2 - 20, height / 2 - 20, "Dotknij, aby zamknąć", {
      fontFamily: "Plus Jakarta Sans, sans-serif",
      fontSize: "11px",
      color: "#8DD8FF",
    });
    this.hintText.setOrigin(1, 1);
    this.add(this.hintText);

    // Click to dismiss
    this.setSize(width, height);
    this.setInteractive(
      new Phaser.Geom.Rectangle(-width / 2, -height / 2, width, height),
      Phaser.Geom.Rectangle.Contains
    );
    this.on("pointerdown", () => this.hide());
  }

  public show(message: string, speaker: string = "TOWARZYSZ PODRÓŻY", durationMs: number = 4500): void {
    if (this.isDestroyedBox || !this.scene || !this.scene.sys || !this.scene.sys.isActive() || !this.scene.tweens || !this.scene.cameras || !this.scene.cameras.main) {
      return;
    }

    if (this.dismissTimer) {
      this.dismissTimer.remove();
      this.dismissTimer = undefined;
    }

    if (this.speakerText) this.speakerText.setText(speaker.toUpperCase());
    if (this.messageText) this.messageText.setText(message);
    this.setVisible(true);
    this.isShown = true;

    this.setAlpha(0);
    this.y = this.scene.cameras.main.height - 90;

    this.scene.tweens.add({
      targets: this,
      alpha: 1,
      y: this.scene.cameras.main.height - 110,
      duration: 250,
      ease: "Power2",
    });

    if (this.scene.time) {
      this.dismissTimer = this.scene.time.delayedCall(durationMs, () => {
        this.hide();
      });
    }
  }

  public hide(): void {
    if (!this.isShown) return;
    this.isShown = false;
    if (this.dismissTimer) {
      this.dismissTimer.remove();
      this.dismissTimer = undefined;
    }
    if (this.isDestroyedBox || !this.scene || !this.scene.sys || !this.scene.sys.isActive() || !this.scene.tweens) {
      this.setVisible(false);
      return;
    }
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      y: this.scene.cameras.main.height - 90,
      duration: 200,
      ease: "Power2",
      onComplete: () => {
        this.setVisible(false);
      },
    });
  }

  public reposition(): void {
    if (this.isDestroyedBox || !this.scene || !this.scene.sys || !this.scene.sys.isActive() || !this.scene.cameras || !this.scene.cameras.main) {
      return;
    }
    const screenWidth = this.scene.cameras.main.width;
    const screenHeight = this.scene.cameras.main.height;
    this.setPosition(screenWidth / 2, screenHeight - 110);
  }

  public destroyBox(): void {
    if (this.isDestroyedBox) return;
    this.isDestroyedBox = true;
    if (this.dismissTimer) {
      this.dismissTimer.remove();
      this.dismissTimer = undefined;
    }
    try {
      this.destroy();
    } catch {
      // ignore
    }
  }

  public override destroy(fromScene?: boolean): void {
    this.isDestroyedBox = true;
    if (this.dismissTimer) {
      this.dismissTimer.remove();
      this.dismissTimer = undefined;
    }
    super.destroy(fromScene);
  }
}
