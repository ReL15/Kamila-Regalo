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
    message: "“El viaje apenas comienza.”",
    hint: "Entre los pinos de la ladera rocosa"
  },
  {
    id: 2,
    sceneKey: "ForestScene",
    x: 1400,
    y: 530,
    message: "“Vas encontrando el camino.”",
    hint: "Bajo la niebla y las hojas doradas"
  },
  {
    id: 3,
    sceneKey: "MemoryScene",
    x: 1750,
    y: 520,
    message: "“Este pequeño compañero tiene algo que decirte.”",
    hint: "Junto al muelle del lago"
  },
  {
    id: 4,
    sceneKey: "CityScene",
    x: 2100,
    y: 525,
    message: "“Todavía quedan sorpresas.”",
    hint: "Bajo una farola de la vieja ciudad"
  },
  {
    id: 5,
    sceneKey: "NightScene",
    x: 1600,
    y: 520,
    message: "“Ya casi llegamos.”",
    hint: "Bajo el cielo estrellado y la luna"
  },
  {
    id: 6,
    sceneKey: "DestinationScene",
    x: 1450,
    y: 520,
    message: "“Mira bien...”",
    hint: "En el mirador de la cumbre"
  },
  {
    id: 7,
    sceneKey: "SurpriseScene",
    x: 820,
    y: 500,
    message: "“Sabía que los encontrarías todos.”",
    hint: "Cerca de la caja de regalo"
  }
];
