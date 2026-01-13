
export interface Question {
  id: number
  question: string
  options: string[]
  correct: number
  explanation: string
}

export const questions: Question[] = [
  {
    id: 1,
    question: "¿Cuál es el apodo más común del FC Barcelona?",
    options: ["Los Blancos", "Los Colchoneros", "Los Culés", "Los Leones"],
    correct: 2,
    explanation: "'Culés' es el apodo histórico de los aficionados del Barça, originado en el antiguo campo de Les Corts.",
  },
  {
    id: 2,
    question: "¿Dónde juega como local el Barcelona?",
    options: ["Mestalla", "Camp Nou", "San Mamés", "Benito Villamarín"],
    correct: 1,
    explanation: "El Camp Nou es el estadio icónico donde el Barça juega sus partidos como local.",
  },
  {
    id: 3,
    question: "¿Cuáles son los colores tradicionales del Barça?",
    options: ["Blanco y dorado", "Azul y grana", "Rojo y blanco", "Verde y blanco"],
    correct: 1,
    explanation: "El azul y el grana son los colores que definen la identidad del club.",
  },
  {
    id: 4,
    question: "¿Qué lema está históricamente asociado al club?",
    options: ["You’ll Never Walk Alone", "Més que un club", "Hala Madrid", "Forza Barça Siempre"],
    correct: 1,
    explanation: "'Més que un club' (Más que un club) refleja el compromiso del Barça con la sociedad y la cultura catalana.",
  },
  {
    id: 5,
    question: "¿Quién es el máximo goleador histórico del Barcelona?",
    options: ["Ronaldinho", "Samuel Eto’o", "Lionel Messi", "Luis Suárez"],
    correct: 2,
    explanation: "Lionel Messi es el máximo goleador de todos los tiempos del club, marcando una era dorada.",
  },
  {
    id: 6,
    question: "El Barça es uno de los clubes que logró el “triplete” (liga + copa + Champions) en una misma temporada. ¿Cuántas veces lo consiguió?",
    options: ["1", "2", "3", "4"],
    correct: 1,
    explanation: "El Barça ha logrado el histórico triplete en dos ocasiones: en la temporada 2008-09 y en la 2014-15.",
  },
]

export interface Kit {
  id: string
  name: string
  category: string
  price: number
  originalPrice: number
  savings: number
  description: string
  items: string[]
  images: string[]
}

export const kits: Kit[] = [
  {
    id: "barca-home-kit",
    name: "Camiseta Oficial FC Barcelona 2026 – Home (Manga Corta)",
    category: "Premium",
    price: 49.99,
    originalPrice: 149.99,
    savings: 100,
    description: "Edición Especial: Barça Campeón de la Supercopa. Completa el quiz y desbloquea este precio exclusivo para verdaderos culés.",
    items: [
      "Precio Exclusivo Quiz: -66% de descuento",
      "Badge Supercopa Disponible",
      "Personalización (Nombre + Número) opcional",
      "Tejido Nike Dri-FIT ADV",
      "Diseño Home 2026",
      "Oferta reservada para ganadores del quiz"
    ],
    images: [
      "/images/contentProduct/main.webp",
      "/images/contentProduct/back.webp",
      "/images/contentProduct/front_r.webp",
      "/images/contentProduct/symbol.webp"
    ]
  }
]
