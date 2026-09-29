export interface MemoryItem {
  id: number;
  image: string;
  title: string;
  message: string;
  subtitle?: string;
}

export const memories: MemoryItem[] = [
  {
    id: 1,
    image: "/assets/photos/photo01.webp",
    title: "Un momento guardado",
    message: "[RECUERDO]",
    subtitle: "Recuerdo I"
  },
  {
    id: 2,
    image: "/assets/photos/photo02.webp",
    title: "En la ruta",
    message: "[RECUERDO]",
    subtitle: "Recuerdo II"
  },
  {
    id: 3,
    image: "/assets/photos/photo03.webp",
    title: "Entre risas y caminos",
    message: "[RECUERDO]",
    subtitle: "Recuerdo III"
  },
  {
    id: 4,
    image: "/assets/photos/photo04.webp",
    title: "Pausa en el mirador",
    message: "[RECUERDO]",
    subtitle: "Recuerdo IV"
  },
  {
    id: 5,
    image: "/assets/photos/photo05.webp",
    title: "Destino y amistad",
    message: "[RECUERDO]",
    subtitle: "Recuerdo V"
  }
];
