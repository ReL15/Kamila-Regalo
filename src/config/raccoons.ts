export interface RaccoonConfig {
  id: number;
  sceneKey: string;
  x: number;
  y: number;
  message: string;
  hint: string;
}

export const raccoonsConfig: RaccoonConfig[] = [
  {
    id: 1,
    sceneKey: "MountainScene",
    x: 1850,
    y: 520,
    message: "„Podróż dopiero się zaczyna.”",
    hint: "Wśród sosen na kamienistym zboczu"
  },
  {
    id: 2,
    sceneKey: "ForestScene",
    x: 1400,
    y: 530,
    message: "„Krok po kroku odnajdujesz swoją drogę.”",
    hint: "Pod mgłą i złotymi liśćmi"
  },
  {
    id: 3,
    sceneKey: "MemoryScene",
    x: 1750,
    y: 520,
    message: "„Ten mały przyjaciel ma dla Ciebie coś do powiedzenia.”",
    hint: "Przy pomoście nad jeziorem"
  },
  {
    id: 4,
    sceneKey: "CityScene",
    x: 2100,
    y: 525,
    message: "„Przed nami jeszcze wspaniałe niespodzianki.”",
    hint: "Pod latarnią starego miasta"
  },
  {
    id: 5,
    sceneKey: "NightScene",
    x: 1600,
    y: 520,
    message: "„Już prawie jesteśmy na miejscu.”",
    hint: "Pod rozgwieżdżonym niebem i księżycem"
  },
  {
    id: 6,
    sceneKey: "DestinationScene",
    x: 1450,
    y: 520,
    message: "„Spójrz uważnie...”",
    hint: "Na punkcie widokowym na szczycie"
  },
  {
    id: 7,
    sceneKey: "SurpriseScene",
    x: 820,
    y: 500,
    message: "„Wiedziałem, że odnajdziesz nas wszystkich!”",
    hint: "Obok pudełka z prezentem"
  }
];
