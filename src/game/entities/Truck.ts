import Phaser from "phaser";
import { AudioManager } from "../systems/AudioManager";
import { GameState } from "../systems/GameState";

export class Truck extends Phaser.GameObjects.Container {
  public body!: Phaser.Physics.Arcade.Body;
  private truckBodySprite!: Phaser.GameObjects.Image;
  private frontWheel!: Phaser.GameObjects.Image;
  private rearWheel!: Phaser.GameObjects.Image;
  private headlightGlow!: Phaser.GameObjects.Image;
  private exhaustEmitter?: Phaser.GameObjects.Particles.ParticleEmitter;

  private speed: number = 0;
  private readonly maxSpeed: number = 260;
  private readonly acceleration: number = 220;
  private readonly deceleration: number = 180;
  private readonly brakingDecel: number = 380;
  private readonly reverseSpeed: number = -100;

  public headlightsOn: boolean = true;
  public isNearInteraction: boolean = false;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasdKeys?: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
    E: Phaser.Input.Keyboard.Key;
    H: Phaser.Input.Keyboard.Key;
    SPACE: Phaser.Input.Keyboard.Key;
  };

  private mobileInput = {
    left: false,
    right: false,
    brake: false,
    interact: false,
  };

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);

    this.scene.add.existing(this);
    this.scene.physics.add.existing(this);

    this.body.setCollideWorldBounds(true);
    this.body.setSize(180, 80);
    this.body.setOffset(-90, -40);

    this.setupVisuals();
    this.setupInputs();
    this.setupParticles();
  }

  private setupVisuals(): void {
    // Headlight cone / glow
    this.headlightGlow = this.scene.add.image(95, 0, "headlight-beam");
    this.headlightGlow.setOrigin(0, 0.5);
    this.headlightGlow.setAlpha(0.65);
    this.headlightGlow.setBlendMode(Phaser.BlendModes.ADD);
    this.add(this.headlightGlow);

    // Truck body
    this.truckBodySprite = this.scene.add.image(0, -15, "truck-body");
    this.truckBodySprite.setOrigin(0.5, 0.5);
    this.add(this.truckBodySprite);

    // Front and rear wheels
    this.rearWheel = this.scene.add.image(-48, 22, "truck-wheel");
    this.frontWheel = this.scene.add.image(54, 22, "truck-wheel");
    this.add(this.rearWheel);
    this.add(this.frontWheel);

    // Passenger raccoon face peering through window
    const passengerRaccoon = this.scene.add.image(28, -20, "raccoon-head");
    passengerRaccoon.setScale(0.7);
    this.add(passengerRaccoon);

    // License plate "KAMILA" tooltip click trigger
    this.setSize(180, 80);
    this.setInteractive(
      new Phaser.Geom.Rectangle(-90, -40, 180, 80),
      Phaser.Geom.Rectangle.Contains
    );
    this.on("pointerdown", () => {
      this.honk();
      GameState.getInstance().discoverEasterEgg("matrícula KAMILA");
    });
  }

  private setupInputs(): void {
    if (this.scene.input.keyboard) {
      this.cursors = this.scene.input.keyboard.createCursorKeys();
      this.wasdKeys = {
        W: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
        A: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
        S: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
        D: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
        E: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E),
        H: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.H),
        SPACE: this.scene.input.keyboard.addKey(
          Phaser.Input.Keyboard.KeyCodes.SPACE
        ),
      };

      // Horn on H
      this.wasdKeys.H.on("down", () => this.honk());
    }
  }

  private setupParticles(): void {
    const isReducedMotion = GameState.getInstance().settings.reducedMotion;
    if (isReducedMotion) return;

    // Exhaust smoke emitter
    if (this.scene.textures.exists("particle-smoke")) {
      this.exhaustEmitter = this.scene.add.particles(
        this.x - 70,
        this.y + 10,
        "particle-smoke",
        {
          speed: { min: 10, max: 30 },
          angle: { min: 160, max: 200 },
          scale: { start: 0.3, end: 0.7 },
          alpha: { start: 0.5, end: 0 },
          lifespan: 600,
          frequency: 120,
        }
      );
      this.exhaustEmitter.setDepth(this.depth - 1);
    }
  }

  public setMobileInput(key: "left" | "right" | "brake" | "interact", value: boolean): void {
    this.mobileInput[key] = value;
  }

  public honk(): void {
    AudioManager.getInstance().playHorn();
    // subtle bounce animation
    if (!this.scene || !this.scene.sys || !this.scene.sys.isActive() || !this.scene.tweens) return;
    this.scene.tweens.add({
      targets: this,
      y: this.y - 4,
      duration: 80,
      yoyo: true,
      ease: "Quad.easeInOut",
    });
  }

  public toggleHeadlights(on?: boolean): void {
    this.headlightsOn = on !== undefined ? on : !this.headlightsOn;
    this.headlightGlow.setVisible(this.headlightsOn);
  }

  public isInteractionPressed(): boolean {
    if (this.mobileInput.interact) {
      this.mobileInput.interact = false;
      return true;
    }
    if (this.cursors && Phaser.Input.Keyboard.JustDown(this.cursors.space)) {
      return true;
    }
    if (this.wasdKeys && (Phaser.Input.Keyboard.JustDown(this.wasdKeys.E) || Phaser.Input.Keyboard.JustDown(this.wasdKeys.SPACE))) {
      return true;
    }
    return false;
  }

  public getSpeedRatio(): number {
    return this.speed / this.maxSpeed;
  }

  public update(time: number, delta: number): void {
    const dt = delta / 1000;

    let accelerateRight = false;
    let accelerateLeft = false;
    let brake = false;

    // Keyboard checks
    if (this.cursors) {
      if (this.cursors.right.isDown || this.wasdKeys?.D.isDown) {
        accelerateRight = true;
      }
      if (this.cursors.left.isDown || this.wasdKeys?.A.isDown) {
        accelerateLeft = true;
      }
      if (this.cursors.down.isDown || this.wasdKeys?.S.isDown) {
        brake = true;
      }
    }

    // Mobile inputs
    if (this.mobileInput.right) accelerateRight = true;
    if (this.mobileInput.left) accelerateLeft = true;
    if (this.mobileInput.brake) brake = true;

    // Physics update
    if (brake) {
      if (this.speed > 0) {
        this.speed = Math.max(0, this.speed - this.brakingDecel * dt);
      } else if (this.speed < 0) {
        this.speed = Math.min(0, this.speed + this.brakingDecel * dt);
      }
    } else if (accelerateRight) {
      this.speed = Math.min(this.maxSpeed, this.speed + this.acceleration * dt);
    } else if (accelerateLeft) {
      this.speed = Math.max(this.reverseSpeed, this.speed - this.acceleration * dt);
    } else {
      // Natural deceleration / rolling resistance
      if (this.speed > 0) {
        this.speed = Math.max(0, this.speed - this.deceleration * dt);
      } else if (this.speed < 0) {
        this.speed = Math.min(0, this.speed + this.deceleration * dt);
      }
    }

    this.body.setVelocityX(this.speed);

    // Wheel rotation
    const rotationSpeed = (this.speed / 28) * dt;
    this.frontWheel.rotation += rotationSpeed;
    this.rearWheel.rotation += rotationSpeed;

    // Suspension subtle bounce
    if (Math.abs(this.speed) > 10) {
      const wobble = Math.sin(time * 0.015) * (Math.abs(this.speed) / this.maxSpeed) * 0.6;
      this.truckBodySprite.y = -15 + wobble;
    } else {
      this.truckBodySprite.y = -15;
    }

    // Update exhaust particles
    if (this.exhaustEmitter) {
      this.exhaustEmitter.setPosition(this.x - 70, this.y + 10);
      if (accelerateRight && Math.abs(this.speed) > 20) {
        this.exhaustEmitter.frequency = 60;
      } else {
        this.exhaustEmitter.frequency = 180;
      }
    }

    // Inform AudioManager
    AudioManager.getInstance().updateEnginePitch(this.getSpeedRatio());
  }

  public override destroy(fromScene?: boolean): void {
    if (this.exhaustEmitter) {
      this.exhaustEmitter.destroy();
    }
    super.destroy(fromScene);
  }
}
