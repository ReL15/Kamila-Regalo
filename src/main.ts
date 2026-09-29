import "./styles/globals.css";
import Phaser from "phaser";
import { BootScene } from "./game/scenes/BootScene";
import { PreloadScene } from "./game/scenes/PreloadScene";
import { MenuScene } from "./game/scenes/MenuScene";
import { IntroScene } from "./game/scenes/IntroScene";
import { MountainScene } from "./game/scenes/MountainScene";
import { ForestScene } from "./game/scenes/ForestScene";
import { MemoryScene } from "./game/scenes/MemoryScene";
import { CityScene } from "./game/scenes/CityScene";
import { NightScene } from "./game/scenes/NightScene";
import { DestinationScene } from "./game/scenes/DestinationScene";
import { SurpriseScene } from "./game/scenes/SurpriseScene";
import { EndingScene } from "./game/scenes/EndingScene";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: "game-container",
  backgroundColor: "#071A33",
  scale: {
    mode: Phaser.Scale.RESIZE,
    width: "100%",
    height: "100%",
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: "arcade",
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
  input: {
    activePointers: 4,
    keyboard: true,
    mouse: true,
    touch: true,
  },
  scene: [
    BootScene,
    PreloadScene,
    MenuScene,
    IntroScene,
    MountainScene,
    ForestScene,
    MemoryScene,
    CityScene,
    NightScene,
    DestinationScene,
    SurpriseScene,
    EndingScene,
  ],
};

function initGame() {
  if (!(window as unknown as { __phaserGame?: Phaser.Game }).__phaserGame) {
    (window as unknown as { __phaserGame?: Phaser.Game }).__phaserGame = new Phaser.Game(config);
  }
}

if (document.readyState === "loading") {
  window.addEventListener("DOMContentLoaded", initGame);
} else {
  initGame();
}
