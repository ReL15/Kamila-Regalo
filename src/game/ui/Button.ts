import Phaser from "phaser";

export interface ButtonOptions {
  width: number;
  height: number;
  fillColor?: number;
  strokeColor?: number;
  strokeWidth?: number;
  radius?: number;
  hoverScale?: number;
  activeScale?: number;
}

/**
 * Creates an ultra-reliable interactive button in Phaser that works with:
 * - Direct zone hit area (0, 0, width, height with origin 0.5)
 * - pointerdown, pointerup, click events
 * - Both Mouse and Touch pointers
 * - Visual click feedback
 */
export function createInteractiveButton(
  scene: Phaser.Scene,
  x: number,
  y: number,
  text: string,
  onClick: () => void,
  options?: Partial<ButtonOptions>
): Phaser.GameObjects.Container {
  const width = options?.width ?? 220;
  const height = options?.height ?? 50;
  const fillColor = options?.fillColor ?? 0x168bea;
  const strokeColor = options?.strokeColor ?? 0x8dd8ff;
  const strokeWidth = options?.strokeWidth ?? 2;
  const radius = options?.radius ?? Math.floor(height / 2);
  const hoverScale = options?.hoverScale ?? 1.04;
  const activeScale = options?.activeScale ?? 0.94;

  const container = scene.add.container(x, y);

  // Background visual
  const bg = scene.add.graphics();
  bg.fillStyle(fillColor, 1);
  bg.fillRoundedRect(-width / 2, -height / 2, width, height, radius);
  if (strokeColor !== undefined) {
    bg.lineStyle(strokeWidth, strokeColor, 0.9);
    bg.strokeRoundedRect(-width / 2, -height / 2, width, height, radius);
  }
  container.add(bg);

  // Label text
  const label = scene.add.text(0, 0, text, {
    fontFamily: "Plus Jakarta Sans, sans-serif",
    fontSize: width > 160 ? "15px" : "12px",
    fontStyle: "800",
    color: "#FFFFFF",
    letterSpacing: 1.5,
  });
  label.setOrigin(0.5, 0.5);
  container.add(label);

  // Set physical size and centered interactive hitArea on the container itself
  container.setSize(width, height);
  const hitRect = new Phaser.Geom.Rectangle(-width / 2, -height / 2, width, height);
  container.setInteractive(hitRect, Phaser.Geom.Rectangle.Contains);
  if (container.input) {
    container.input.cursor = "pointer";
  }

  let isTriggered = false;

  const trigger = () => {
    if (isTriggered) return;
    isTriggered = true;

    scene.tweens.add({
      targets: container,
      scale: activeScale,
      duration: 70,
      yoyo: true,
      onComplete: () => {
        try {
          onClick();
        } finally {
          scene.time.delayedCall(300, () => {
            isTriggered = false;
          });
        }
      },
    });
  };

  container.on("pointerdown", trigger);

  container.on("pointerover", () => {
    scene.tweens.add({
      targets: container,
      scale: hoverScale,
      duration: 100,
      ease: "Quad.easeOut",
    });
  });

  container.on("pointerout", () => {
    scene.tweens.add({
      targets: container,
      scale: 1,
      duration: 100,
      ease: "Quad.easeOut",
    });
  });

  return container;
}
