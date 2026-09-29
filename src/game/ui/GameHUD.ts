import Phaser from "phaser";
import { GameState } from "../systems/GameState";
import { memories, MemoryItem } from "../../config/memories";
import { DialogueBox } from "./DialogueBox";

export class GameHUD extends Phaser.GameObjects.Container {
  private raccoonCounterContainer!: Phaser.GameObjects.Container;
  private raccoonCounterText!: Phaser.GameObjects.Text;
  private raccoonCounterIcon!: Phaser.GameObjects.Image;

  public dialogueBox!: DialogueBox;

  // Memory modal
  private memoryModalContainer!: Phaser.GameObjects.Container;
  private memoryBackdrop!: Phaser.GameObjects.Graphics;
  private memoryImageSprite!: Phaser.GameObjects.Image;
  private memoryTitleText!: Phaser.GameObjects.Text;
  private memoryMessageText!: Phaser.GameObjects.Text;
  private memoryIndexText!: Phaser.GameObjects.Text;
  private currentMemoryIndex: number = 0;

  // Narrative banner (cinematic quotes)
  private narratorBanner!: Phaser.GameObjects.Container;
  private narratorText!: Phaser.GameObjects.Text;

  private confettiEmitter?: Phaser.GameObjects.Particles.ParticleEmitter;
  private unsubscribeGameState?: () => void;
  private onResizeHandler = () => this.reposition();
  private isHUDDestroyed: boolean = false;

  constructor(scene: Phaser.Scene, _sceneTitle: string = "") {
    super(scene, 0, 0);
    this.setScrollFactor(0);
    this.setDepth(200);
    this.scene.add.existing(this);

    this.setupHUD();
    this.setupMemoryModal();
    this.setupNarratorBanner();
    this.dialogueBox = new DialogueBox(scene);

    this.bindEvents();
    this.reposition();
    this.scene.scale.on("resize", this.onResizeHandler);

    this.scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.destroyHUD());
    this.scene.events.once(Phaser.Scenes.Events.DESTROY, () => this.destroyHUD());
  }

  private setupHUD(): void {
    const gameState = GameState.getInstance();

    // 1. Raccoon counter (hidden if 0 found)
    this.raccoonCounterContainer = this.scene.add.container(24, 24);
    const counterBg = this.scene.add.graphics();
    counterBg.fillStyle(0x071a33, 0.85);
    counterBg.fillRoundedRect(0, 0, 160, 42, 12);
    counterBg.lineStyle(1.5, 0x168bea, 0.7);
    counterBg.strokeRoundedRect(0, 0, 160, 42, 12);
    this.raccoonCounterContainer.add(counterBg);

    this.raccoonCounterIcon = this.scene.add.image(24, 21, "raccoon-head");
    this.raccoonCounterIcon.setScale(0.8);
    this.raccoonCounterContainer.add(this.raccoonCounterIcon);

    this.raccoonCounterText = this.scene.add.text(48, 12, "SZOPY 0/7", {
      fontFamily: "Plus Jakarta Sans, sans-serif",
      fontSize: "13px",
      fontStyle: "700",
      color: "#FFB45C",
    });
    this.raccoonCounterContainer.add(this.raccoonCounterText);

    this.add(this.raccoonCounterContainer);
    this.updateRaccoonCount(gameState.getFoundRaccoonCount());

  }

  private setupNarratorBanner(): void {
    const width = this.scene.cameras.main.width;
    this.narratorBanner = this.scene.add.container(width / 2, 85);
    this.narratorBanner.setAlpha(0);

    const bg = this.scene.add.graphics();
    bg.fillStyle(0x071a33, 0.85);
    bg.fillRoundedRect(-280, -22, 560, 44, 22);
    bg.lineStyle(1, 0xffb45c, 0.5);
    bg.strokeRoundedRect(-280, -22, 560, 44, 22);
    this.narratorBanner.add(bg);

    this.narratorText = this.scene.add.text(0, 0, "", {
      fontFamily: "Plus Jakarta Sans, sans-serif",
      fontSize: "14px",
      fontStyle: "600",
      color: "#F4F8FC",
      align: "center",
    });
    this.narratorText.setOrigin(0.5, 0.5);
    this.narratorBanner.add(this.narratorText);

    this.add(this.narratorBanner);
  }

  public showNarratorQuote(text: string, durationMs: number = 4000): void {
    if (this.isHUDDestroyed || !this.scene || !this.scene.sys || !this.scene.sys.isActive() || !this.scene.tweens) {
      return;
    }
    if (!this.narratorText || !this.narratorBanner) return;

    this.narratorText.setText(text);
    this.scene.tweens.add({
      targets: this.narratorBanner,
      alpha: 1,
      y: 85,
      duration: 500,
      ease: "Quad.easeOut",
      onComplete: () => {
        if (this.isHUDDestroyed || !this.scene || !this.scene.sys || !this.scene.sys.isActive() || !this.scene.time) {
          return;
        }
        this.scene.time.delayedCall(durationMs, () => {
          if (this.isHUDDestroyed || !this.scene || !this.scene.sys || !this.scene.sys.isActive() || !this.scene.tweens) {
            return;
          }
          if (!this.narratorBanner) return;
          this.scene.tweens.add({
            targets: this.narratorBanner,
            alpha: 0,
            y: 75,
            duration: 500,
            ease: "Quad.easeIn",
          });
        });
      },
    });
  }

  private setupMemoryModal(): void {
    const width = this.scene.cameras.main.width;
    const height = this.scene.cameras.main.height;

    this.memoryModalContainer = this.scene.add.container(width / 2, height / 2);
    this.memoryModalContainer.setVisible(false);
    this.memoryModalContainer.setDepth(300);

    // Dim backdrop - disabled by default so it never blocks gameplay
    this.memoryBackdrop = this.scene.add.graphics();
    this.memoryBackdrop.fillStyle(0x040d1a, 0.90);
    this.memoryBackdrop.fillRect(-width, -height, width * 2, height * 2);
    this.memoryModalContainer.add(this.memoryBackdrop);

    // Card frame
    const cardWidth = Math.min(520, width - 40);
    const cardHeight = Math.min(460, height - 60);

    const card = this.scene.add.graphics();
    card.fillStyle(0x071a33, 0.98);
    card.fillRoundedRect(-cardWidth / 2, -cardHeight / 2, cardWidth, cardHeight, 18);
    card.lineStyle(2, 0x168bea, 0.9);
    card.strokeRoundedRect(-cardWidth / 2, -cardHeight / 2, cardWidth, cardHeight, 18);
    this.memoryModalContainer.add(card);

    // Photo frame area (object-fit: contain simulation)
    const photoFrame = this.scene.add.graphics();
    photoFrame.fillStyle(0x0b3d66, 0.5);
    photoFrame.fillRoundedRect(-cardWidth / 2 + 24, -cardHeight / 2 + 50, cardWidth - 48, 220, 12);
    photoFrame.lineStyle(1.5, 0x8dd8ff, 0.4);
    photoFrame.strokeRoundedRect(-cardWidth / 2 + 24, -cardHeight / 2 + 50, cardWidth - 48, 220, 12);
    this.memoryModalContainer.add(photoFrame);

    // Memory Image (if available or stylish artistic representation)
    this.memoryImageSprite = this.scene.add.image(0, -cardHeight / 2 + 160, "memory-photo-art");
    this.memoryImageSprite.setScale(Math.min((cardWidth - 60) / this.memoryImageSprite.width, 210 / this.memoryImageSprite.height));
    this.memoryModalContainer.add(this.memoryImageSprite);

    // Title
    this.memoryTitleText = this.scene.add.text(0, -cardHeight / 2 + 25, "ZACHOWANA CHWILA", {
      fontFamily: "Plus Jakarta Sans, sans-serif",
      fontSize: "16px",
      fontStyle: "700",
      color: "#FFB45C",
    });
    this.memoryTitleText.setOrigin(0.5, 0.5);
    this.memoryModalContainer.add(this.memoryTitleText);

    // Message
    this.memoryMessageText = this.scene.add.text(0, -cardHeight / 2 + 300, "[WSPOMNIENIE]", {
      fontFamily: "Plus Jakarta Sans, sans-serif",
      fontSize: "14px",
      color: "#F4F8FC",
      align: "center",
      wordWrap: { width: cardWidth - 60 },
      lineSpacing: 4,
    });
    this.memoryMessageText.setOrigin(0.5, 0);
    this.memoryModalContainer.add(this.memoryMessageText);

    // Pagination index text
    this.memoryIndexText = this.scene.add.text(0, cardHeight / 2 - 55, "1 / 3", {
      fontFamily: "Plus Jakarta Sans, sans-serif",
      fontSize: "12px",
      color: "#8DD8FF",
    });
    this.memoryIndexText.setOrigin(0.5, 0.5);
    this.memoryModalContainer.add(this.memoryIndexText);

    // Prev Button (Poprzednie)
    const btnPrev = this.createModalButton("◀ POPRZEDNIE", -110, cardHeight / 2 - 25, 110, 36, () => {
      this.navigateMemory(-1);
    });
    this.memoryModalContainer.add(btnPrev);

    // Next Button (Następne)
    const btnNext = this.createModalButton("NASTĘPNE ▶", 110, cardHeight / 2 - 25, 110, 36, () => {
      this.navigateMemory(1);
    });
    this.memoryModalContainer.add(btnNext);

    // Close Button (✕ Zamknij)
    const btnClose = this.createModalButton("ZAMKNIJ ✕", 0, cardHeight / 2 - 25, 80, 36, () => {
      this.closeMemoryModal();
    });
    this.memoryModalContainer.add(btnClose);

    this.add(this.memoryModalContainer);
  }

  private createModalButton(
    text: string,
    x: number,
    y: number,
    w: number,
    h: number,
    onClick: () => void
  ): Phaser.GameObjects.Container {
    const btn = this.scene.add.container(x, y);
    const bg = this.scene.add.graphics();
    bg.fillStyle(0x0b3d66, 0.95);
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, 8);
    bg.lineStyle(1.5, 0x168bea, 0.9);
    bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 8);
    btn.add(bg);

    const label = this.scene.add.text(0, 0, text, {
      fontFamily: "Plus Jakarta Sans, sans-serif",
      fontSize: "11px",
      fontStyle: "700",
      color: "#FFFFFF",
    });
    label.setOrigin(0.5, 0.5);
    btn.add(label);

    btn.setSize(w, h);
    btn.setInteractive(new Phaser.Geom.Rectangle(-w / 2, -h / 2, w, h), Phaser.Geom.Rectangle.Contains);
    if (btn.input) {
      btn.input.cursor = "pointer";
    }

    btn.on("pointerdown", () => {
      this.scene.tweens.add({
        targets: btn,
        scale: 0.94,
        duration: 50,
        yoyo: true,
      });
      onClick();
    });

    return btn;
  }

  public openMemoryModal(memoryId: number): void {
    if (this.isHUDDestroyed || !this.scene || !this.scene.sys || !this.scene.sys.isActive() || !this.scene.tweens) {
      return;
    }
    if (!this.memoryModalContainer || !this.memoryBackdrop) return;

    const idx = memories.findIndex((m) => m.id === memoryId);
    this.currentMemoryIndex = idx >= 0 ? idx : 0;
    this.renderCurrentMemory();

    const width = this.scene.cameras.main.width;
    const height = this.scene.cameras.main.height;
    this.memoryBackdrop.setInteractive(
      new Phaser.Geom.Rectangle(-width, -height, width * 2, height * 2),
      Phaser.Geom.Rectangle.Contains
    );
    this.memoryBackdrop.on("pointerdown", () => this.closeMemoryModal());

    this.memoryModalContainer.setVisible(true);
    this.memoryModalContainer.setAlpha(0);
    this.scene.tweens.add({
      targets: this.memoryModalContainer,
      alpha: 1,
      duration: 200,
    });
  }

  private navigateMemory(direction: number): void {
    this.currentMemoryIndex = (this.currentMemoryIndex + direction + memories.length) % memories.length;
    this.renderCurrentMemory();
  }

  private renderCurrentMemory(): void {
    if (this.isHUDDestroyed || !this.scene || !this.scene.sys || !this.scene.sys.isActive()) {
      return;
    }
    const mem: MemoryItem = memories[this.currentMemoryIndex];
    if (!mem) return;
    if (this.memoryTitleText) this.memoryTitleText.setText(mem.title.toUpperCase());
    if (this.memoryMessageText) this.memoryMessageText.setText(mem.message || "[WSPOMNIENIE]");
    if (this.memoryIndexText) this.memoryIndexText.setText(`${this.currentMemoryIndex + 1} / ${memories.length}`);

    const photoKey = `photo-${mem.id}`;
    if (this.memoryImageSprite && this.scene.textures) {
      this.memoryImageSprite.setTexture(this.scene.textures.exists(photoKey) ? photoKey : "memory-photo-art");
      const cardWidth = Math.min(520, this.scene.cameras.main.width - 40);
      this.memoryImageSprite.setScale(Math.min((cardWidth - 60) / this.memoryImageSprite.width, 210 / this.memoryImageSprite.height));
      this.memoryImageSprite.setAlpha(1);
      this.memoryImageSprite.setVisible(true);
    }
  }

  public closeMemoryModal(): void {
    if (this.memoryBackdrop) {
      this.memoryBackdrop.disableInteractive();
    }
    if (this.isHUDDestroyed || !this.scene || !this.scene.sys || !this.scene.sys.isActive() || !this.scene.tweens) {
      if (this.memoryModalContainer) this.memoryModalContainer.setVisible(false);
      return;
    }
    this.scene.tweens.add({
      targets: this.memoryModalContainer,
      alpha: 0,
      duration: 150,
      onComplete: () => {
        if (this.memoryModalContainer) {
          this.memoryModalContainer.setVisible(false);
        }
      },
    });
  }

  private bindEvents(): void {
    const gameState = GameState.getInstance();

    this.unsubscribeGameState = gameState.addListener((event: string, data?: unknown) => {
      if (this.isHUDDestroyed || !this.scene || !this.scene.sys || !this.scene.sys.isActive() || !this.scene.tweens) {
        return;
      }
      if (event === "raccoon-collected") {
        const payload = data as {
          count: number;
          isAllFound: boolean;
          message: string;
        };
        this.updateRaccoonCount(payload.count);
        if (this.dialogueBox && typeof this.dialogueBox.show === "function") {
          this.dialogueBox.show(payload.message, "ZNALEZIONO SZOPA", 4500);
        }

        if (payload.isAllFound) {
          this.triggerCelebration();
        }
      }
    });

    this.scene.events.on("show-raccoon-dialogue", (data: { message: string }) => {
      if (this.isHUDDestroyed || !this.scene || !this.scene.sys || !this.scene.sys.isActive()) return;
      if (this.dialogueBox && typeof this.dialogueBox.show === "function") {
        this.dialogueBox.show(data.message, "TOWARZYSZ PODRÓŻY", 4500);
      }
    });

    this.scene.events.on("open-memory-viewer", (data: { memoryId: number }) => {
      if (this.isHUDDestroyed || !this.scene || !this.scene.sys || !this.scene.sys.isActive()) return;
      this.openMemoryModal(data.memoryId);
    });
  }

  public updateRaccoonCount(count: number): void {
    if (this.isHUDDestroyed || !this.scene || !this.scene.sys || !this.scene.sys.isActive() || !this.scene.tweens) {
      return;
    }
    if (!this.raccoonCounterContainer || !this.raccoonCounterText) return;

    this.raccoonCounterContainer.setVisible(true);
    this.raccoonCounterText.setText(`SZOPY ${count}/7`);

    if (count > 0) {
      // Gentle pulse on update
      if (this.scene.tweens) {
        this.scene.tweens.add({
          targets: this.raccoonCounterContainer,
          scale: { from: 1.15, to: 1 },
          duration: 300,
          ease: "Back.easeOut",
        });
      }
    }
  }

  private triggerCelebration(): void {
    if (this.isHUDDestroyed || !this.scene || !this.scene.sys || !this.scene.sys.isActive() || !this.scene.tweens) {
      return;
    }
    if (GameState.getInstance().settings.reducedMotion) return;

    if (this.scene.textures && this.scene.textures.exists("particle-confetti") && this.scene.cameras && this.scene.cameras.main) {
      this.confettiEmitter = this.scene.add.particles(
        this.scene.cameras.main.width / 2,
        60,
        "particle-confetti",
        {
          speed: { min: 80, max: 200 },
          angle: { min: 60, max: 120 },
          gravityY: 150,
          scale: { start: 0.8, end: 0.3 },
          lifespan: 2500,
          quantity: 40,
        }
      );
      this.confettiEmitter.setScrollFactor(0);
      this.confettiEmitter.setDepth(250);

      this.scene.time.delayedCall(3000, () => {
        if (this.confettiEmitter) {
          try {
            this.confettiEmitter.destroy();
          } catch {
            // ignore
          }
          this.confettiEmitter = undefined;
        }
      });
    }

    if (this.dialogueBox && typeof this.dialogueBox.show === "function") {
      this.dialogueBox.show("Odnaleziono wszystkie 7 szopów na trasie! 🦝💙", "ŚWIĘTOWANIE!", 5000);
    }
  }

  public reposition(): void {
    if (this.isHUDDestroyed || !this.scene || !this.scene.sys || !this.scene.sys.isActive() || !this.scene.cameras || !this.scene.cameras.main) {
      return;
    }
    const width = this.scene.cameras.main.width;
    const height = this.scene.cameras.main.height;

    // Raccoon counter top-left
    if (this.raccoonCounterContainer) {
      this.raccoonCounterContainer.setPosition(20, 20);
    }

    // Narrator banner
    if (this.narratorBanner) {
      this.narratorBanner.setPosition(width / 2, 85);
    }

    // Memory modal
    if (this.memoryModalContainer) {
      this.memoryModalContainer.setPosition(width / 2, height / 2);
    }

    // Dialogue box
    if (this.dialogueBox) {
      this.dialogueBox.reposition();
    }
  }

  public destroyHUD(): void {
    if (this.isHUDDestroyed) return;
    this.isHUDDestroyed = true;

    if (this.unsubscribeGameState) {
      this.unsubscribeGameState();
      this.unsubscribeGameState = undefined;
    }

    if (this.scene && this.scene.scale) {
      this.scene.scale.off("resize", this.onResizeHandler);
    }

    if (this.scene && this.scene.events) {
      this.scene.events.off("show-raccoon-dialogue");
      this.scene.events.off("open-memory-viewer");
    }

    if (this.confettiEmitter) {
      try {
        this.confettiEmitter.destroy();
      } catch {
        // ignore
      }
      this.confettiEmitter = undefined;
    }

    if (this.dialogueBox) {
      try {
        this.dialogueBox.destroyBox();
      } catch {
        // ignore
      }
    }

    try {
      this.destroy();
    } catch {
      // ignore
    }
  }

  public override destroy(fromScene?: boolean): void {
    this.isHUDDestroyed = true;
    if (this.unsubscribeGameState) {
      this.unsubscribeGameState();
      this.unsubscribeGameState = undefined;
    }
    if (this.scene && this.scene.scale) {
      this.scene.scale.off("resize", this.onResizeHandler);
    }
    super.destroy(fromScene);
  }
}
