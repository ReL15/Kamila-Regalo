export type SurpriseType =
  | "image"
  | "gallery"
  | "audio"
  | "video"
  | "letter"
  | "playlist"
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
    "Hay viajes que no se miden en kilómetros, sino en recuerdos.",

  introMessage:
    "Tengo un viaje preparado para ti.",

  letter: {
    title: "Feliz cumpleaños, Kamila",
    body: `Quería regalarte algo que no pudieras simplemente abrir y guardar en un cajón.

Así que hice este pequeño viaje para ti.

Entre camiones, paisajes, mapaches y kilómetros encontré una forma de decirte algo mucho más sencillo:

Gracias por ser mi amiga.

Espero que este nuevo año de tu vida esté lleno de lugares bonitos, buenos momentos, muchas risas y muchos kilómetros por recorrer.

Feliz cumpleaños, Kamila. 💙`
  },

  surprise: {
    type: "letter" as SurpriseType,
    title: "TU SORPRESA VA AQUÍ",
    message: "Cada kilómetro compartido vale oro. Que este nuevo año esté lleno de rutas increíbles, risas y momentos inolvidables.",
    subtext: "¡Feliz Cumpleaños, Kamila! 🎂✨"
  }
};
