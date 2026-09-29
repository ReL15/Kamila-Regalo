import Phaser from "phaser";

export class Raccoon extends Phaser.GameObjects.Container {
  private sprite!: Phaser.GameObjects.Image;
  private tail!: Phaser.GameObjects.Image;
  private heldItem?: Phaser.GameObjects.Image;
  private isWaving: boolean = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    this.scene.add.existing(this);

    this.setupVisuals();
  }

  private setupVisuals(): void {
    // Striped tail behind body
    this.tail = this.scene.add.image(-16, 12, "raccoon-tail");
    this.tail.setOrigin(0.8, 0.8);
    this.add(this.tail);

    // Main raccoon body + head
    this.sprite = this.scene.add.image(0, 0, "raccoon-body");
    this.sprite.setOrigin(0.5, 0.5);
    this.add(this.sprite);

    // Idle tail waggle animation
    this.scene.tweens.add({
      targets: this.tail,
      angle: { from: -15, to: 15 },
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    // Idle breathing animation
    this.scene.tweens.add({
      targets: this.sprite,
      scaleY: { from: 1, to: 1.04 },
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }

  public holdItem(textureKey: string): void {
    if (this.heldItem) {
      this.heldItem.destroy();
    }
    this.heldItem = this.scene.add.image(12, 10, textureKey);
    this.heldItem.setOrigin(0.5, 0.5);
    this.add(this.heldItem);
  }

  public wave(): void {
    if (this.isWaving) return;
    this.isWaving = true;
    this.scene.tweens.add({
      targets: this,
      y: this.y - 8,
      duration: 180,
      yoyo: true,
      repeat: 3,
      onComplete: () => {
        this.isWaving = false;
      },
    });
  }

  public walkTo(targetX: number, duration: number = 2000, onComplete?: () => void): void {
    // Flip facing direction
    if (targetX < this.x) {
      this.setScale(-1, 1);
    } else {
      this.setScale(1, 1);
    }

    // Little hop while walking
    const hopTween = this.scene.tweens.add({
      targets: this,
      y: this.y - 6,
      duration: 150,
      yoyo: true,
      repeat: Math.floor(duration / 300),
      ease: "Quad.easeOut",
    });

    this.scene.tweens.add({
      targets: this,
      x: targetX,
      duration: duration,
      ease: "Linear",
      onComplete: () => {
        hopTween.stop();
        if (onComplete) onComplete();
      },
    });
  }
}
