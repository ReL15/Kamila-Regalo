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
    image: "/assets/photos/photo01.jpg",
    title: "Na rampie autostrady",
    message: "Biały zestaw wspinający się w stronę słońca na greckich drogach.",
    subtitle: "Wspomnienie I"
  },
  {
    id: 2,
    image: "/assets/photos/photo02.jpg",
    title: "Scania i Volvo",
    message: "Ramię w ramię na trasie — czarno-czerwona bestia i różowy gigant FH16.",
    subtitle: "Wspomnienie II"
  },
  {
    id: 3,
    image: "/assets/photos/photo03.jpg",
    title: "Baza logistyczna Stokes",
    message: "Dopracowany różowo-biały ciągnik pod rampą magazynu gotowy do drogi.",
    subtitle: "Wspomnienie III"
  }
];
