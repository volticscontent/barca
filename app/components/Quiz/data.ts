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
    question: "En quelle année le Paris Saint-Germain (PSG) a-t-il été fondé ?",
    options: ["1960", "1970", "1980", "1990"],
    correct: 1,
    explanation: "Le PSG a été officiellement fondé le 12 août 1970.",
  },
  {
    id: 2,
    question: "Quel est le stade du PSG ?",
    options: ["Stade de France", "Orange Vélodrome", "Groupama Stadium", "Parc des Princes"],
    correct: 3,
    explanation: "Le Parc des Princes est la maison historique du PSG.",
  },
  {
    id: 3,
    question: "Que signifie “PSG” ?",
    options: ["Paris Sports Group", "Paris Soccer Giants", "Paris Saint-Germain", "Paris Super Goal"],
    correct: 2,
    explanation: "PSG signifie Paris Saint-Germain Football Club.",
  },
  {
    id: 4,
    question: "“Le Classique” oppose le PSG à quel club ?",
    options: ["AS Monaco", "Olympique Lyonnais", "LOSC Lille", "Olympique de Marseille"],
    correct: 3,
    explanation: "Le Classique est la rivalité entre le PSG et l'OM.",
  },
  {
    id: 5,
    question: "Quelles sont les couleurs les plus associées au PSG ?",
    options: ["Vert et jaune", "Noir et blanc", "Bleu et rouge", "Orange et noir"],
    correct: 2,
    explanation: "Le bleu et le rouge sont les couleurs traditionnelles du club.",
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
    id: "psg-home-kit",
    name: "Maillot Officiel PSG 2026 – Domicile (Manches Courtes)",
    category: "Premium",
    price: 49.99,
    originalPrice: 149.99,
    savings: 100,
    description: "Édition Spéciale : Le PSG Champion du Trophée des Champions 2026. Réussissez le quiz et débloquez ce prix exclusif réservé aux vrais supporters.",
    items: [
      "Prix Exclusif Quiz : -66% de réduction",
      "Badge Champions 2026 Disponible",
      "Flocage Officiel (Ligue/Coupe) en option",
      "Tissu Nike Dri-FIT ADV",
      "Design Domicile 2026",
      "Offre réservée aux vainqueurs du quiz"
    ],
    images: [
      "/images/contentProduct/psg-nike-dri-fit-adv-home-match-shirt-2025-26.jpg",
      "/images/contentProduct/psg-nike-dri-fit-adv-home-matc-1.jpg",
      "/images/contentProduct/psg-nike-dri-fit-adv-home-matc-2.jpg",
      "/images/contentProduct/psg-nike-dri-fit-adv-home-matc-3.jpg"
    ]
  }
]
