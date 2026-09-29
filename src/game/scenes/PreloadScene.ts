import Phaser from "phaser";

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: "PreloadScene" });
  }

  preload(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Loading bar container
    const progressBox = this.add.graphics();
    const progressBar = this.add.graphics();
    progressBox.fillStyle(0x0b3d66, 0.8);
    progressBox.fillRoundedRect(width / 2 - 160, height / 2 - 14, 320, 28, 14);

    const loadingText = this.add.text(width / 2, height / 2 - 40, "PRZYGOTOWYWANIE TRASY...", {
      fontFamily: "Plus Jakarta Sans, sans-serif",
      fontSize: "14px",
      fontStyle: "700",
      color: "#8DD8FF",
      letterSpacing: 2,
    });
    loadingText.setOrigin(0.5, 0.5);

    this.load.on("progress", (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(0x168bea, 1);
      progressBar.fillRoundedRect(width / 2 - 156, height / 2 - 10, 312 * value, 20, 10);
    });

    // Load actual memory photo screenshots
    this.load.image("photo-1", "/assets/photos/photo01.jpg");
    this.load.image("photo-2", "/assets/photos/photo02.jpg");
    this.load.image("photo-3", "/assets/photos/photo03.jpg");

    // Generate all procedural canvas textures
    this.generateAllProceduralTextures();
  }

  create(): void {
    this.scene.start("MenuScene");
  }

  private generateAllProceduralTextures(): void {
    this.createTruckTextures();
    this.createRaccoonTextures();
    this.createParticleTextures();
    this.createSceneryTextures();
    this.createMemoryIcons();
    this.createGiftBoxTextures();
  }

  private createTruckTextures(): void {
    // 1. Truck Body (European Cab-Over Semi / Rigid Truck in Deep Blue & Cyan)
    const canvas = document.createElement("canvas");
    canvas.width = 180;
    canvas.height = 80;
    const ctx = canvas.getContext("2d")!;

    // Trailer / Cargo Box
    ctx.fillStyle = "#0B3D66";
    ctx.beginPath();
    ctx.roundRect(10, 12, 95, 50, 4);
    ctx.fill();
    ctx.strokeStyle = "#168BEA";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Side stripes on trailer
    ctx.fillStyle = "#168BEA";
    ctx.fillRect(15, 34, 85, 6);
    ctx.fillStyle = "#8DD8FF";
    ctx.fillRect(15, 42, 85, 2);

    // Cab (European Cab-Over style)
    ctx.fillStyle = "#092947";
    ctx.beginPath();
    ctx.roundRect(105, 8, 62, 54, [6, 12, 0, 0]);
    ctx.fill();
    ctx.strokeStyle = "#168BEA";
    ctx.stroke();

    // Windshield & Side Window
    ctx.fillStyle = "#8DD8FF";
    ctx.globalAlpha = 0.85;
    ctx.beginPath();
    ctx.roundRect(120, 14, 30, 22, [4, 8, 2, 2]);
    ctx.fill();
    ctx.globalAlpha = 1.0;

    // Window frame divider
    ctx.strokeStyle = "#071A33";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(136, 14);
    ctx.lineTo(136, 36);
    ctx.stroke();

    // Front Grill (chrome accents)
    ctx.fillStyle = "#2A4B6B";
    ctx.fillRect(152, 38, 12, 22);
    ctx.fillStyle = "#F4F8FC";
    for (let y = 41; y < 58; y += 4) {
      ctx.fillRect(153, y, 10, 1.5);
    }

    // Headlight housing
    ctx.fillStyle = "#FFB45C";
    ctx.shadowColor = "#FFB45C";
    ctx.shadowBlur = 8;
    ctx.fillRect(158, 48, 6, 8);
    ctx.shadowBlur = 0;

    // Roof wind deflector
    ctx.fillStyle = "#168BEA";
    ctx.beginPath();
    ctx.moveTo(105, 8);
    ctx.lineTo(150, 8);
    ctx.lineTo(142, 2);
    ctx.lineTo(105, 2);
    ctx.closePath();
    ctx.fill();

    // Side mirror
    ctx.fillStyle = "#168BEA";
    ctx.fillRect(144, 20, 3, 10);
    ctx.fillStyle = "#F4F8FC";
    ctx.fillRect(146, 21, 2, 8);

    // License Plate "KAMILA"
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(14, 52, 28, 9);
    ctx.fillStyle = "#071A33";
    ctx.font = "bold 6px sans-serif";
    ctx.fillText("KAMILA", 15, 59);

    // Front License Plate
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(152, 54, 13, 6);
    ctx.fillStyle = "#071A33";
    ctx.font = "bold 4px sans-serif";
    ctx.fillText("K-24", 153, 58);

    this.textures.addCanvas("truck-body", canvas);

    // 2. Truck Wheel
    const wheelCanvas = document.createElement("canvas");
    wheelCanvas.width = 36;
    wheelCanvas.height = 36;
    const wctx = wheelCanvas.getContext("2d")!;

    // Black tire
    wctx.fillStyle = "#111827";
    wctx.beginPath();
    wctx.arc(18, 18, 16, 0, Math.PI * 2);
    wctx.fill();

    // Tire tread rim
    wctx.strokeStyle = "#374151";
    wctx.lineWidth = 2.5;
    wctx.stroke();

    // Chrome rim
    wctx.fillStyle = "#9CA3AF";
    wctx.beginPath();
    wctx.arc(18, 18, 9, 0, Math.PI * 2);
    wctx.fill();

    // Center hub & lug nuts
    wctx.fillStyle = "#1F2937";
    wctx.beginPath();
    wctx.arc(18, 18, 4, 0, Math.PI * 2);
    wctx.fill();

    // Lug nuts
    wctx.fillStyle = "#E5E7EB";
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const lx = 18 + Math.cos(angle) * 6.5;
      const ly = 18 + Math.sin(angle) * 6.5;
      wctx.beginPath();
      wctx.arc(lx, ly, 1, 0, Math.PI * 2);
      wctx.fill();
    }

    this.textures.addCanvas("truck-wheel", wheelCanvas);

    // 3. Headlight Light Beam
    const beamCanvas = document.createElement("canvas");
    beamCanvas.width = 240;
    beamCanvas.height = 100;
    const bctx = beamCanvas.getContext("2d")!;

    const grad = bctx.createRadialGradient(0, 50, 5, 120, 50, 180);
    grad.addColorStop(0, "rgba(255, 240, 180, 0.75)");
    grad.addColorStop(0.3, "rgba(255, 210, 120, 0.35)");
    grad.addColorStop(0.8, "rgba(141, 216, 255, 0.08)");
    grad.addColorStop(1, "rgba(141, 216, 255, 0)");

    bctx.fillStyle = grad;
    bctx.beginPath();
    bctx.moveTo(0, 42);
    bctx.lineTo(240, 5);
    bctx.lineTo(240, 95);
    bctx.lineTo(0, 58);
    bctx.closePath();
    bctx.fill();

    this.textures.addCanvas("headlight-beam", beamCanvas);
  }

  private createRaccoonTextures(): void {
    // 1. Raccoon Body
    const canvas = document.createElement("canvas");
    canvas.width = 48;
    canvas.height = 48;
    const ctx = canvas.getContext("2d")!;

    // Gray body
    ctx.fillStyle = "#4B5563";
    ctx.beginPath();
    ctx.ellipse(24, 30, 14, 15, 0, 0, Math.PI * 2);
    ctx.fill();

    // Belly (lighter gray)
    ctx.fillStyle = "#9CA3AF";
    ctx.beginPath();
    ctx.ellipse(24, 32, 8, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // Head
    ctx.fillStyle = "#4B5563";
    ctx.beginPath();
    ctx.arc(24, 16, 12, 0, Math.PI * 2);
    ctx.fill();

    // Ears
    ctx.fillStyle = "#374151";
    ctx.beginPath();
    ctx.moveTo(14, 10);
    ctx.lineTo(12, 3);
    ctx.lineTo(19, 7);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(34, 10);
    ctx.lineTo(36, 3);
    ctx.lineTo(29, 7);
    ctx.fill();

    // White ear tips
    ctx.fillStyle = "#F3F4F6";
    ctx.fillRect(12, 3, 3, 3);
    ctx.fillRect(34, 3, 3, 3);

    // Black bandit mask
    ctx.fillStyle = "#111827";
    ctx.beginPath();
    ctx.roundRect(13, 13, 22, 7, 3);
    ctx.fill();

    // Shiny eyes
    ctx.fillStyle = "#F9FAFB";
    ctx.beginPath();
    ctx.arc(18, 16, 2, 0, Math.PI * 2);
    ctx.arc(30, 16, 2, 0, Math.PI * 2);
    ctx.fill();

    // Pupils
    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.arc(18, 16, 1.2, 0, Math.PI * 2);
    ctx.arc(30, 16, 1.2, 0, Math.PI * 2);
    ctx.fill();

    // Cute white snout & black nose
    ctx.fillStyle = "#F3F4F6";
    ctx.beginPath();
    ctx.ellipse(24, 20, 4, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#111827";
    ctx.beginPath();
    ctx.arc(24, 19, 1.2, 0, Math.PI * 2);
    ctx.fill();

    // Paws
    ctx.fillStyle = "#1F2937";
    ctx.beginPath();
    ctx.arc(17, 43, 3, 0, Math.PI * 2);
    ctx.arc(31, 43, 3, 0, Math.PI * 2);
    ctx.fill();

    this.textures.addCanvas("raccoon-body", canvas);

    // 2. Raccoon Tail (striped)
    const tailCanvas = document.createElement("canvas");
    tailCanvas.width = 32;
    tailCanvas.height = 32;
    const tctx = tailCanvas.getContext("2d")!;

    tctx.save();
    tctx.translate(24, 24);
    tctx.rotate(-Math.PI / 4);

    // Alternating dark & light stripes
    const stripes = ["#1F2937", "#9CA3AF", "#1F2937", "#9CA3AF", "#1F2937"];
    stripes.forEach((color, i) => {
      tctx.fillStyle = color;
      tctx.beginPath();
      tctx.ellipse(-16 + i * 7, 0, 4, 6, 0, 0, Math.PI * 2);
      tctx.fill();
    });
    tctx.restore();

    this.textures.addCanvas("raccoon-tail", tailCanvas);

    // 3. Raccoon Head (for HUD and dialogs)
    const headCanvas = document.createElement("canvas");
    headCanvas.width = 36;
    headCanvas.height = 36;
    const hctx = headCanvas.getContext("2d")!;

    // Ears
    hctx.fillStyle = "#374151";
    hctx.beginPath();
    hctx.moveTo(9, 14);
    hctx.lineTo(6, 4);
    hctx.lineTo(15, 9);
    hctx.fill();

    hctx.beginPath();
    hctx.moveTo(27, 14);
    hctx.lineTo(30, 4);
    hctx.lineTo(21, 9);
    hctx.fill();

    // Head base
    hctx.fillStyle = "#4B5563";
    hctx.beginPath();
    hctx.arc(18, 20, 13, 0, Math.PI * 2);
    hctx.fill();

    // Bandit mask
    hctx.fillStyle = "#111827";
    hctx.beginPath();
    hctx.roundRect(7, 16, 22, 8, 4);
    hctx.fill();

    // Eyes
    hctx.fillStyle = "#FFFFFF";
    hctx.beginPath();
    hctx.arc(12, 19, 2.2, 0, Math.PI * 2);
    hctx.arc(24, 19, 2.2, 0, Math.PI * 2);
    hctx.fill();

    hctx.fillStyle = "#000000";
    hctx.beginPath();
    hctx.arc(12, 19, 1.2, 0, Math.PI * 2);
    hctx.arc(24, 19, 1.2, 0, Math.PI * 2);
    hctx.fill();

    // Snout & nose
    hctx.fillStyle = "#F3F4F6";
    hctx.beginPath();
    hctx.ellipse(18, 24, 4.5, 3.5, 0, 0, Math.PI * 2);
    hctx.fill();

    hctx.fillStyle = "#111827";
    hctx.beginPath();
    hctx.arc(18, 23, 1.3, 0, Math.PI * 2);
    hctx.fill();

    this.textures.addCanvas("raccoon-head", headCanvas);
  }

  private createParticleTextures(): void {
    // 1. Smoke
    const smokeCanvas = document.createElement("canvas");
    smokeCanvas.width = 16;
    smokeCanvas.height = 16;
    const sctx = smokeCanvas.getContext("2d")!;
    const grad = sctx.createRadialGradient(8, 8, 1, 8, 8, 8);
    grad.addColorStop(0, "rgba(220, 230, 242, 0.8)");
    grad.addColorStop(1, "rgba(220, 230, 242, 0)");
    sctx.fillStyle = grad;
    sctx.beginPath();
    sctx.arc(8, 8, 8, 0, Math.PI * 2);
    sctx.fill();
    this.textures.addCanvas("particle-smoke", smokeCanvas);

    // 2. Sparkle
    const spCanvas = document.createElement("canvas");
    spCanvas.width = 24;
    spCanvas.height = 24;
    const spCtx = spCanvas.getContext("2d")!;
    spCtx.fillStyle = "#FFB45C";
    spCtx.beginPath();
    spCtx.moveTo(12, 0);
    spCtx.quadraticCurveTo(12, 12, 24, 12);
    spCtx.quadraticCurveTo(12, 12, 12, 24);
    spCtx.quadraticCurveTo(12, 12, 0, 12);
    spCtx.quadraticCurveTo(12, 12, 12, 0);
    spCtx.fill();
    this.textures.addCanvas("particle-sparkle", spCanvas);

    // 3. Falling leaf
    const leafCanvas = document.createElement("canvas");
    leafCanvas.width = 14;
    leafCanvas.height = 14;
    const lfCtx = leafCanvas.getContext("2d")!;
    lfCtx.fillStyle = "#FFB45C";
    lfCtx.beginPath();
    lfCtx.ellipse(7, 7, 6, 3, Math.PI / 4, 0, Math.PI * 2);
    lfCtx.fill();
    this.textures.addCanvas("particle-leaf", leafCanvas);

    // 4. Rain drop streak
    const rainCanvas = document.createElement("canvas");
    rainCanvas.width = 8;
    rainCanvas.height = 24;
    const rnCtx = rainCanvas.getContext("2d")!;
    rnCtx.strokeStyle = "rgba(141, 216, 255, 0.75)";
    rnCtx.lineWidth = 1.5;
    rnCtx.beginPath();
    rnCtx.moveTo(2, 0);
    rnCtx.lineTo(6, 24);
    rnCtx.stroke();
    this.textures.addCanvas("particle-raindrop", rainCanvas);

    // 5. Confetti
    const cCanvas = document.createElement("canvas");
    cCanvas.width = 12;
    cCanvas.height = 8;
    const cCtx = cCanvas.getContext("2d")!;
    cCtx.fillStyle = "#FFB45C";
    cCtx.fillRect(0, 0, 12, 8);
    this.textures.addCanvas("particle-confetti", cCanvas);
  }

  private createSceneryTextures(): void {
    // 1. Distant Mountain Peak (repeating / panoramic tile)
    const mFarCanvas = document.createElement("canvas");
    mFarCanvas.width = 640;
    mFarCanvas.height = 300;
    const mfCtx = mFarCanvas.getContext("2d")!;

    mfCtx.fillStyle = "#0B3D66";
    mfCtx.beginPath();
    mfCtx.moveTo(0, 300);
    mfCtx.lineTo(0, 180);
    mfCtx.lineTo(90, 80);
    mfCtx.lineTo(190, 190);
    mfCtx.lineTo(290, 60);
    mfCtx.lineTo(410, 210);
    mfCtx.lineTo(520, 95);
    mfCtx.lineTo(640, 170);
    mfCtx.lineTo(640, 300);
    mfCtx.closePath();
    mfCtx.fill();

    // Snow caps on distant peaks
    mfCtx.fillStyle = "#8DD8FF";
    mfCtx.globalAlpha = 0.55;
    // Peak 1
    mfCtx.beginPath();
    mfCtx.moveTo(90, 80);
    mfCtx.lineTo(70, 110);
    mfCtx.lineTo(110, 110);
    mfCtx.closePath();
    mfCtx.fill();
    // Peak 2
    mfCtx.beginPath();
    mfCtx.moveTo(290, 60);
    mfCtx.lineTo(265, 100);
    mfCtx.lineTo(315, 100);
    mfCtx.closePath();
    mfCtx.fill();
    // Peak 3
    mfCtx.beginPath();
    mfCtx.moveTo(520, 95);
    mfCtx.lineTo(495, 130);
    mfCtx.lineTo(545, 130);
    mfCtx.closePath();
    mfCtx.fill();
    mfCtx.globalAlpha = 1.0;

    this.textures.addCanvas("scenery-mountain-far", mFarCanvas);

    // 2. Near Mountain Ridge
    const mNearCanvas = document.createElement("canvas");
    mNearCanvas.width = 640;
    mNearCanvas.height = 260;
    const mnCtx = mNearCanvas.getContext("2d")!;

    mnCtx.fillStyle = "#072445";
    mnCtx.beginPath();
    mnCtx.moveTo(0, 260);
    mnCtx.lineTo(0, 120);
    mnCtx.bezierCurveTo(120, 40, 240, 170, 360, 90);
    mnCtx.bezierCurveTo(460, 20, 560, 140, 640, 100);
    mnCtx.lineTo(640, 260);
    mnCtx.closePath();
    mnCtx.fill();

    this.textures.addCanvas("scenery-mountain-near", mNearCanvas);

    // 3. Pine Tree
    const treeCanvas = document.createElement("canvas");
    treeCanvas.width = 80;
    treeCanvas.height = 140;
    const trCtx = treeCanvas.getContext("2d")!;

    // Trunk
    trCtx.fillStyle = "#1e140d";
    trCtx.fillRect(36, 95, 8, 45);

    // Pine branches layers
    const pineTiers = [
      { y: 15, w: 22, h: 32 },
      { y: 35, w: 34, h: 36 },
      { y: 60, w: 46, h: 42 },
      { y: 85, w: 58, h: 40 },
    ];

    trCtx.fillStyle = "#183C38";
    pineTiers.forEach((tier) => {
      trCtx.beginPath();
      trCtx.moveTo(40, tier.y);
      trCtx.lineTo(40 - tier.w / 2, tier.y + tier.h);
      trCtx.lineTo(40 + tier.w / 2, tier.y + tier.h);
      trCtx.closePath();
      trCtx.fill();
    });

    this.textures.addCanvas("scenery-pine-tree", treeCanvas);

    // 4. City Buildings row
    const cityCanvas = document.createElement("canvas");
    cityCanvas.width = 600;
    cityCanvas.height = 360;
    const cCtx = cityCanvas.getContext("2d")!;

    cCtx.fillStyle = "#06152b";
    cCtx.fillRect(0, 60, 140, 300);
    cCtx.fillStyle = "#092244";
    cCtx.fillRect(150, 40, 130, 320);
    cCtx.fillStyle = "#051329";
    cCtx.fillRect(290, 80, 150, 280);
    cCtx.fillStyle = "#081d3d";
    cCtx.fillRect(450, 50, 150, 310);

    // Windows with warm amber lights
    cCtx.fillStyle = "#FFB45C";
    for (let r = 80; r < 300; r += 32) {
      cCtx.fillRect(25, r, 16, 20);
      cCtx.fillRect(60, r, 16, 20);
      cCtx.fillRect(95, r, 16, 20);

      cCtx.fillRect(175, r - 20, 18, 22);
      cCtx.fillRect(215, r - 20, 18, 22);

      cCtx.fillRect(320, r, 20, 22);
      cCtx.fillRect(370, r, 20, 22);

      cCtx.fillRect(480, r - 15, 18, 22);
      cCtx.fillRect(530, r - 15, 18, 22);
    }

    this.textures.addCanvas("scenery-city-row", cityCanvas);

    // 5. Lamppost
    const lampCanvas = document.createElement("canvas");
    lampCanvas.width = 40;
    lampCanvas.height = 140;
    const lCtx = lampCanvas.getContext("2d")!;

    lCtx.fillStyle = "#111827";
    lCtx.fillRect(18, 25, 4, 115);
    lCtx.fillRect(12, 135, 16, 5);

    // Lantern bracket
    lCtx.beginPath();
    lCtx.arc(20, 25, 8, Math.PI, 0);
    lCtx.fill();

    // Glowing lantern
    lCtx.fillStyle = "#FFB45C";
    lCtx.shadowColor = "#FFB45C";
    lCtx.shadowBlur = 12;
    lCtx.fillRect(15, 25, 10, 14);
    lCtx.shadowBlur = 0;

    this.textures.addCanvas("scenery-lamppost", lampCanvas);

    // 6. Lake Water reflection strip
    const lakeCanvas = document.createElement("canvas");
    lakeCanvas.width = 400;
    lakeCanvas.height = 120;
    const lkCtx = lakeCanvas.getContext("2d")!;

    const waterGrad = lkCtx.createLinearGradient(0, 0, 0, 120);
    waterGrad.addColorStop(0, "#0B3D66");
    waterGrad.addColorStop(0.5, "#071A33");
    waterGrad.addColorStop(1, "#040D1A");
    lkCtx.fillStyle = waterGrad;
    lkCtx.fillRect(0, 0, 400, 120);

    // Shimmer lines
    lkCtx.strokeStyle = "rgba(141, 216, 255, 0.4)";
    lkCtx.lineWidth = 1.5;
    for (let i = 0; i < 20; i++) {
      const lx = Math.random() * 320;
      const ly = Math.random() * 100 + 10;
      const lw = 25 + Math.random() * 50;
      lkCtx.beginPath();
      lkCtx.moveTo(lx, ly);
      lkCtx.lineTo(lx + lw, ly);
      lkCtx.stroke();
    }

    this.textures.addCanvas("scenery-lake-water", lakeCanvas);

    // 7. Road sign / milestone
    const signCanvas = document.createElement("canvas");
    signCanvas.width = 60;
    signCanvas.height = 80;
    const sgnCtx = signCanvas.getContext("2d")!;

    sgnCtx.fillStyle = "#4B5563";
    sgnCtx.fillRect(27, 35, 6, 45);

    // Blue European highway sign
    sgnCtx.fillStyle = "#168BEA";
    sgnCtx.beginPath();
    sgnCtx.roundRect(5, 5, 50, 32, 6);
    sgnCtx.fill();
    sgnCtx.strokeStyle = "#FFFFFF";
    sgnCtx.lineWidth = 2;
    sgnCtx.stroke();

    sgnCtx.fillStyle = "#FFFFFF";
    sgnCtx.font = "bold 8px sans-serif";
    sgnCtx.textAlign = "center";
    sgnCtx.fillText("KAMILA", 30, 20);
    sgnCtx.font = "bold 6px sans-serif";
    sgnCtx.fillText("RUTA 1", 30, 30);

    this.textures.addCanvas("scenery-road-sign", signCanvas);
  }

  private createMemoryIcons(): void {
    // Vintage Camera Icon
    const camCanvas = document.createElement("canvas");
    camCanvas.width = 44;
    camCanvas.height = 54;
    const cctx = camCanvas.getContext("2d")!;

    // Tripod legs
    cctx.strokeStyle = "#4B5563";
    cctx.lineWidth = 2;
    cctx.beginPath();
    cctx.moveTo(22, 26);
    cctx.lineTo(8, 52);
    cctx.moveTo(22, 26);
    cctx.lineTo(22, 52);
    cctx.moveTo(22, 26);
    cctx.lineTo(36, 52);
    cctx.stroke();

    // Camera body
    cctx.fillStyle = "#FFB45C";
    cctx.beginPath();
    cctx.roundRect(10, 10, 24, 18, 3);
    cctx.fill();

    // Lens
    cctx.fillStyle = "#071A33";
    cctx.beginPath();
    cctx.arc(22, 19, 5, 0, Math.PI * 2);
    cctx.fill();
    cctx.strokeStyle = "#F4F8FC";
    cctx.lineWidth = 1;
    cctx.stroke();

    this.textures.addCanvas("icon-memory-camera", camCanvas);

    // Artistic Memory Postcard texture (stylish Polaroid aesthetic)
    const cardCanvas = document.createElement("canvas");
    cardCanvas.width = 440;
    cardCanvas.height = 240;
    const cdCtx = cardCanvas.getContext("2d")!;

    // Polaroid white/cream background
    cdCtx.fillStyle = "#0e294b";
    cdCtx.fillRect(0, 0, 440, 240);

    // Scenic gradient illustration inside
    const bgGrad = cdCtx.createLinearGradient(0, 0, 0, 240);
    bgGrad.addColorStop(0, "#071A33");
    bgGrad.addColorStop(0.5, "#0B3D66");
    bgGrad.addColorStop(1, "#FFB45C");
    cdCtx.fillStyle = bgGrad;
    cdCtx.fillRect(10, 10, 420, 220);

    // Silhouettes of mountains & truck inside memory card
    cdCtx.fillStyle = "#051326";
    cdCtx.beginPath();
    cdCtx.moveTo(10, 230);
    cdCtx.lineTo(100, 140);
    cdCtx.lineTo(180, 180);
    cdCtx.lineTo(260, 120);
    cdCtx.lineTo(360, 200);
    cdCtx.lineTo(430, 150);
    cdCtx.lineTo(430, 230);
    cdCtx.closePath();
    cdCtx.fill();

    // Gentle heart watermark
    cdCtx.fillStyle = "rgba(141, 216, 255, 0.25)";
    cdCtx.beginPath();
    cdCtx.arc(210, 90, 18, Math.PI, 0);
    cdCtx.arc(230, 90, 18, Math.PI, 0);
    cdCtx.lineTo(220, 125);
    cdCtx.closePath();
    cdCtx.fill();

    this.textures.addCanvas("memory-photo-art", cardCanvas);
  }

  private createGiftBoxTextures(): void {
    // 1. Gift Box Base
    const boxCanvas = document.createElement("canvas");
    boxCanvas.width = 54;
    boxCanvas.height = 54;
    const bctx = boxCanvas.getContext("2d")!;

    // Blue Box
    bctx.fillStyle = "#168BEA";
    bctx.beginPath();
    bctx.roundRect(6, 12, 42, 38, 4);
    bctx.fill();
    bctx.strokeStyle = "#8DD8FF";
    bctx.lineWidth = 1.5;
    bctx.stroke();

    // Gold ribbon cross
    bctx.fillStyle = "#FFB45C";
    bctx.fillRect(23, 12, 8, 38);

    this.textures.addCanvas("gift-box", boxCanvas);

    // 2. Gift Box Lid + Bow
    const lidCanvas = document.createElement("canvas");
    lidCanvas.width = 58;
    lidCanvas.height = 24;
    const lctx = lidCanvas.getContext("2d")!;

    // Lid
    lctx.fillStyle = "#0B3D66";
    lctx.beginPath();
    lctx.roundRect(4, 10, 50, 12, 3);
    lctx.fill();
    lctx.strokeStyle = "#8DD8FF";
    lctx.lineWidth = 1.5;
    lctx.stroke();

    // Ribbon on lid
    lctx.fillStyle = "#FFB45C";
    lctx.fillRect(25, 10, 8, 12);

    // Golden Bow
    lctx.fillStyle = "#FFB45C";
    lctx.beginPath();
    lctx.ellipse(23, 6, 6, 4, -Math.PI / 6, 0, Math.PI * 2);
    lctx.ellipse(35, 6, 6, 4, Math.PI / 6, 0, Math.PI * 2);
    lctx.fill();

    this.textures.addCanvas("gift-lid", lidCanvas);
  }
}
