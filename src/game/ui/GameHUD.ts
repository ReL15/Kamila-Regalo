import Phaser from "phaser";
import { GameState } from "../systems/GameState";
import { memories, MemoryItem } from "../../config/memories";
import { DialogueBox } from "./DialogueBox";

export class GameHUD extends Phaser.GameObjects.Container {
  private raccoonCounterContainer!: Phaser.GameObjects.Container;
  private raccoonCounterText!: Phaser.GameObjects.Text;
  private raccoonCounterIcon!: Phaser.GameObjects.Image;

  private sceneBadgeContainer!: Phaser.GameObjects.Container;
  private sceneBadgeText!: Phaser.GameObjects.Text;

  private soundBtn!: Phaser.GameObjects.Container;
  private soundIconText!: Phaser.GameObjects.Text;

  private motionBtn!: Phaser.GameObjects.Container;
  private motionIconText!: Phaser.GameObjects.Text;

  public dialogueBox!: DialogueBox;

  // Memory modal
  private memoryModalContainer!: Phaser.GameObjects.Container;
  private memoryBackdrop!: Phaser.GameObjects.Graphics;
  private memoryImageSprite!: Phaser.GameObjects.Image;
  private memoryPlaceholderText!: Phaser.GameObjects.Text;
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

  constructor(scene: Phaser.Scene, sceneTitle: string = "") {
    super(scene, 0, 0);
    this.setScrollFactor(0);
    this.setDepth(200);
    this.scene.add.existing(this);

    this.setupHUD(sceneTitle);
    this.setupMemoryModal();
    this.setupNarratorBanner();
    this.dialogueBox = new DialogueBox(scene);

    this.bindEvents();
    this.reposition();
    this.scene.scale.on("resize", this.onResizeHandler);

    this.scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.destroyHUD());
    this.scene.events.once(Phaser.Scenes.Events.DESTROY, () => this.destroyHUD());
  }

  private setupHUD(sceneTitle: string): void {
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

    this.raccoonCounterText = this.scene.add.text(48, 12, "MAPACHES 0/7", {
      fontFamily: "Plus Jakarta Sans, sans-serif",
      fontSize: "13px",
      fontStyle: "700",
      color: "#FFB45C",
    });
    this.raccoonCounterContainer.add(this.raccoonCounterText);

    this.add(this.raccoonCounterContainer);
    this.updateRaccoonCount(gameState.getFoundRaccoonCount());

    // 2. Scene badge
    if (sceneTitle) {
      this.sceneBadgeContainer = this.scene.add.container(0, 24);
      const badgeBg = this.scene.add.graphics();
      badgeBg.fillStyle(0x071a33, 0.75);
      badgeBg.fillRoundedRect(-110, 0, 220, 36, 18);
      badgeBg.lineStyle(1, 0x8dd8ff, 0.4);
      badgeBg.strokeRoundedRect(-110, 0, 220, 36, 18);
      this.sceneBadgeContainer.add(badgeBg);

      this.sceneBadgeText = this.scene.add.text(0, 18, sceneTitle.toUpperCase(), {
        fontFamily: "Plus Jakarta Sans, sans-serif",
        fontSize: "11px",
        fontStyle: "700",
        color: "#8DD8FF",
        letterSpacing: 1.5,
      });
      this.sceneBadgeText.setOrigin(0.5, 0.5);
      this.sceneBadgeContainer.add(this.sceneBadgeText);

      this.add(this.sceneBadgeContainer);
    }

    // 3. Audio Mute button
    this.soundBtn = this.scene.add.container(0, 24);
    const soundBg = this.scene.add.graphics();
    soundBg.fillStyle(0x071a33, 0.88);
    soundBg.fillRoundedRect(-20, 0, 40, 40, 12);
    soundBg.lineStyle(1.5, 0x168bea, 0.8);
    soundBg.strokeRoundedRect(-20, 0, 40, 40, 12);
    this.soundBtn.add(soundBg);

    this.soundIconText = this.scene.add.text(0, 20, gameState.settings.muted ? "🔇" : "🔊", {
      fontSize: "18px",
    });
    this.soundIconText.setOrigin(0.5, 0.5);
    this.soundBtn.add(this.soundIconText);

    this.soundBtn.setSize(40, 40);
    this.soundBtn.setInteractive(new Phaser.Geom.Rectangle(-20, 0, 40, 40), Phaser.Geom.Rectangle.Contains);
    if (this.soundBtn.input) {
      this.soundBtn.input.cursor = "pointer";
    }
    this.soundBtn.on("pointerdown", () => {
      const isMuted = gameState.toggleMute();
      this.soundIconText.setText(isMuted ? "🔇" : "🔊");
    });
    this.add(this.soundBtn);

    // 4. Motion toggle button
    this.motionBtn = this.scene.add.container(0, 24);
    const motionBg = this.scene.add.graphics();
    motionBg.fillStyle(0x071a33, 0.88);
    motionBg.fillRoundedRect(-20, 0, 40, 40, 12);
    motionBg.lineStyle(1.5, 0x168bea, 0.8);
    motionBg.strokeRoundedRect(-20, 0, 40, 40, 12);
    this.motionBtn.add(motionBg);

    this.motionIconText = this.scene.add.text(
      0,
      20,
      gameState.settings.reducedMotion ? "⚡" : "✨",
      { fontSize: "18px" }
    );
    this.motionIconText.setOrigin(0.5, 0.5);
    this.motionBtn.add(this.motionIconText);

    this.motionBtn.setSize(40, 40);
    this.motionBtn.setInteractive(new Phaser.Geom.Rectangle(-20, 0, 40, 40), Phaser.Geom.Rectangle.Contains);
    if (this.motionBtn.input) {
      this.motionBtn.input.cursor = "pointer";
    }
    this.motionBtn.on("pointerdown", () => {
      const isReduced = gameState.toggleReducedMotion();
      this.motionIconText.setText(isReduced ? "⚡" : "✨");
      this.dialogueBox.show(
        isReduced ? "Movimiento reducido activado" : "Efectos visuales completos activados",
        "AJUSTES",
        2000
      );
    });
    this.add(this.motionBtn);
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
    this.memoryImageSprite.setDisplaySize(cardWidth - 60, 210);
    this.memoryImageSprite.setAlpha(0.9);
    this.memoryModalContainer.add(this.memoryImageSprite);

    // Placeholder text "[RECUERDO]"
    this.memoryPlaceholderText = this.scene.add.text(0, -cardHeight / 2 + 160, "[RECUERDO]", {
      fontFamily: "Plus Jakarta Sans, sans-serif",
      fontSize: "24px",
      fontStyle: "700",
      color: "#FFB45C",
      letterSpacing: 3,
    });
    this.memoryPlaceholderText.setOrigin(0.5, 0.5);
    this.memoryModalContainer.add(this.memoryPlaceholderText);

    // Title
    this.memoryTitleText = this.scene.add.text(0, -cardHeight / 2 + 25, "UN MOMENTO GUARDADO", {
      fontFamily: "Plus Jakarta Sans, sans-serif",
      fontSize: "16px",
      fontStyle: "700",
      color: "#FFB45C",
    });
    this.memoryTitleText.setOrigin(0.5, 0.5);
    this.memoryModalContainer.add(this.memoryTitleText);

    // Message
    this.memoryMessageText = this.scene.add.text(0, -cardHeight / 2 + 300, "[RECUERDO]", {
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
    this.memoryIndexText = this.scene.add.text(0, cardHeight / 2 - 55, "1 / 5", {
      fontFamily: "Plus Jakarta Sans, sans-serif",
      fontSize: "12px",
      color: "#8DD8FF",
    });
    this.memoryIndexText.setOrigin(0.5, 0.5);
    this.memoryModalContainer.add(this.memoryIndexText);

    // Prev Button (Anterior)
    const btnPrev = this.createModalButton("◀ ANTERIOR", -110, cardHeight / 2 - 25, 110, 36, () => {
      this.navigateMemory(-1);
    });
    this.memoryModalContainer.add(btnPrev);

    // Next Button (Siguiente)
    const btnNext = this.createModalButton("SIGUIENTE ▶", 110, cardHeight / 2 - 25, 110, 36, () => {
      this.navigateMemory(1);
    });
    this.memoryModalContainer.add(btnNext);

    // Close Button (✕ Cerrar)
    const btnClose = this.createModalButton("CERRAR ✕", 0, cardHeight / 2 - 25, 80, 36, () => {
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
    if (this.memoryMessageText) this.memoryMessageText.setText(mem.message || "[RECUERDO]");
    if (this.memoryIndexText) this.memoryIndexText.setText(`${this.currentMemoryIndex + 1} / ${memories.length}`);

    // If specific photo texture is loaded, show it; else show the stylized memory card
    const photoKey = `photo-${mem.id}`;
    if (this.memoryImageSprite && this.scene.textures) {
      if (this.scene.textures.exists(photoKey)) {
        this.memoryImageSprite.setTexture(photoKey);
        this.memoryImageSprite.setVisible(true);
        if (this.memoryPlaceholderText) this.memoryPlaceholderText.setVisible(false);
      } else {
        this.memoryImageSprite.setTexture("memory-photo-art");
        this.memoryImageSprite.setVisible(true);
        if (this.memoryPlaceholderText) {
          this.memoryPlaceholderText.setVisible(true);
          this.memoryPlaceholderText.setText(mem.message || "[RECUERDO]");
        }
      }
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
          this.dialogueBox.show(payload.message, "MAPACHE ENCONTRADO", 4500);
        }

        if (payload.isAllFound) {
          this.triggerCelebration();
        }
      }
    });

    this.scene.events.on("show-raccoon-dialogue", (data: { message: string }) => {
      if (this.isHUDDestroyed || !this.scene || !this.scene.sys || !this.scene.sys.isActive()) return;
      if (this.dialogueBox && typeof this.dialogueBox.show === "function") {
        this.dialogueBox.show(data.message, "COMPAÑERO DE RUTA", 4500);
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

    if (count > 0) {
      this.raccoonCounterContainer.setVisible(true);
      this.raccoonCounterText.setText(`MAPACHES ${count}/7`);

      // Gentle pulse on update
      if (this.scene.tweens) {
        this.scene.tweens.add({
          targets: this.raccoonCounterContainer,
          scale: { from: 1.15, to: 1 },
          duration: 300,
          ease: "Back.easeOut",
        });
      }
    } else {
      this.raccoonCounterContainer.setVisible(false);
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
      this.dialogueBox.show("¡Has encontrado a todos los 7 mapaches del camino! 🦝💙", "¡CELEBRACIÓN!", 5000);
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

    // Scene badge top-center
    if (this.sceneBadgeContainer) {
      this.sceneBadgeContainer.setPosition(width / 2, 20);
    }

    // Top-right buttons
    if (this.soundBtn) {
      this.soundBtn.setPosition(width - 40, 20);
    }
    if (this.motionBtn) {
      this.motionBtn.setPosition(width - 90, 20);
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
