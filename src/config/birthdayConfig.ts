export type SurpriseType =
  | "image"
  | "gallery"
  | "audio"
  | "video"
  | "custom";

export interface SurpriseConfig {
  type: SurpriseType;
  title?: string;
  message?: string;
  subtext?: string;
  image?: string;
}

export const birthdayConfig = {
  name: "Kamila",

  mainPhrase:
    "Są podróże, których nie mierzy się w kilometrach, lecz we wspomnieniach.",

  introMessage:
    "Mam dla Ciebie przygotowaną małą podróż.",

  surprise: {
    type: "custom" as SurpriseType,
    title: "TWOJA NIESPODZIANKA JEST TUTAJ",
    message: "Każdy wspólny kilometr jest na wagę złota. Niech ten nowy rok życia będzie pełen wspaniałych tras, uśmiechu i niezapomnianych chwil.",
    subtext: "Wszystkiego Najlepszego z Okazji Urodzin, Kamila! 🎂✨"
  }
};
