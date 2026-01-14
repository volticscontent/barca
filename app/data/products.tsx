import React from 'react';

// Interfaces
export interface Badge {
  id: string;
  sku: string;
  code: string; // Internal code for Stripe privacy
  label: string;
  price: number;
  image: string;
  productImage?: string;
  svg: React.ReactNode;
}

export interface Player {
  id: string;
  name: string;
  number: string;
  code: string; // Internal code for Stripe privacy
}

export interface AccordionSection {
  title: string;
  content: React.ReactNode;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  images: string[];
  sizes: string[];
  description?: string;
  type: 'jersey' | 'short' | 'training' | 'accessory';
  
  // Customization & Details
  customizationPrice?: number;
  badgePrice?: number;
  badges?: Badge[];
  details?: AccordionSection[];
  players?: string[]; // Legacy: For dropdown display
  playersList?: Player[]; // New structured list
}

// Data
export const BADGES: Badge[] = [
  {
    id: 'laligawinners',
    sku: 'BDG-LALIGA',
    code: 'B01',
    label: 'LaLiga Winners',
    price: 15,
    image: '',
    productImage: '/images/badges/la_liga.png',
    svg: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M6.8 11.1996H12L7.6 20.7996H2L6.8 11.1996Z"></path>
        <path d="M16.8 20.7996H22L17.6 11.1996H12L16.8 20.7996Z"></path>
        <path d="M4.80078 3.99963L12.0008 11.1996L19.2008 3.99963H4.80078Z"></path>
      </svg>
    )
  },
  {
    id: 'ucl',
    sku: 'BDG-UCL',
    code: 'B02',
    label: 'UCL',
    price: 15,
    image: '',
    productImage: '/images/badges/ucl.png',
    svg: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><path fill="currentColor" fillRule="evenodd" d="M9.183 5.677c-1.102.225-2.275.719-2.275.719.58-.79 1.76-1.76 1.76-1.76-.325-.61-.612-1.512-.612-1.512s1.363.075 2.43.422c0 0 1.813-.994 3.69-1.025 0 0-1.368.791-1.95 1.527.154.081 1.25.409 2.102.911 0 0-1.541.044-2.956.238 0 0-.498.702-.92 2.302 0 0-.725-.8-1.269-1.822Z" clipRule="evenodd"></path><path fill="currentColor" fillRule="evenodd" d="M16.506 7c-.933-1.038-2.179-2.041-2.179-2.041 1.146.016 2.847.692 2.847.692.332-.628.565-1.493.565-1.493s.65 1.101.946 2.319c0 0 1.35.809 2.37 2.162 0 0-1.064-.222-1.847-.218-.002.175.287 1.611.224 2.599 0 0-.867-1.409-1.68-2.582 0 0-1.308.023-2.681.399 0 0 .77-.889 1.435-1.837Zm1.496 6.769c.689-1.161 1.43-2.749 1.43-2.749.228 1.062.248 2.417.248 2.417.683-.144 1.893-.724 1.893-.724s-.54 1.434-1.747 2.535c0 0 .123.86.137 1.993 0 0-.854-.38-1.562-.805-.151.087-1.007.67-2.453.969 0 0 .613-.957 1.119-1.89 0 0-1.008-.665-1.807-1.753 0 0 1.553.195 2.742.007ZM13.132 11.4c1.056 1.308 2.128 2.362 2.128 2.362-1.75-.26-3.172-.751-3.172-.751-.712 1.14-1.488 2.465-1.488 2.465s-.434-1.438-.507-3.07c0 0-.88-.308-2.5-.946 0 0 1.118-.694 2.47-1.073-.078-.155.13-2.096.389-2.889 0 0 .789 1.28 1.431 2.22 0 0 1.258-.427 3.188-.881 0 0-1.056 1.34-1.939 2.563ZM3.518 16.35a9.475 9.475 0 0 1-.297-.611c.019-.694.08-1.588.258-2.281 0 0-.508-.353-1.034-.812-.006-.08-.013-.16-.018-.241.302-.113.944-.34 1.504-.47.064-.162.413-1.286 1.087-2.061 0 0 .045.764.228 1.78 0 0 1.064-.24 2.346-.193 0 0-1.188.935-1.936 1.886.272 1.096.817 2.148.817 2.148a22.962 22.962 0 0 1-1.678-1.074c-.303.36-.912 1.333-1.277 1.929Zm6.787 4.976a8.033 8.033 0 0 1-.394-.082c-.445-.477-1.125-1.257-1.643-2.076 0 0-1.914-.154-3.262-.745 0 0 1.115-.21 2.34-.84-.08-.157-.546-1.018-.873-2.088 0 0 1.17.945 2.036 1.498 0 0 1.102-.634 2.091-1.516 0 0-.25 1.22-.39 2.612.64.365 1.284.721 1.934 1.068-.998.145-1.98.114-1.98.114-.04.774.064" clipRule="evenodd"></path></svg>
    )
  },
  {
    id: 'supercopa',
    sku: 'BDG-SUPER',
    code: 'B03',
    label: 'Supercopa',
    price: 30,
    image: '',
    productImage: '/images/badges/supercopa.png',
    svg: (
      <svg id="Capa_1" xmlns="http://www.w3.org/2000/svg" width="24" height="24" version="1.1" viewBox="0 0 24 24">
        <path fill="currentColor" d="M6.5,6c-4.1,3.3-4.4,9.2-.9,13s9.5,3.7,13,0,3.1-9.7-1-13l.2-.5c4.6,3.4,5.3,10,1.5,14.3s-10.5,4.3-14.3,0-3.3-10.9,1.4-14.3l.2.5Z"></path>
        <path fill="currentColor" d="M7.4,19.7c-.1,0-.4-.2-.4-.3,2.7-.4,3.8-2.7,3.7-5.3-2.2-.4-4-2-4.8-4.1,1-.5,1.6-1.5,1.5-2.6,0-1-.3-1.9-.8-2.8-.4-.8-.9-1.5-1.6-2l1.6-1.5c.7,1,1.2,2.2,1.5,3.3.7,2.3.4,4.6-1.8,5.8,1.2,1.5,3.3,2.7,5.2,2.8v1.5c0,2.1-.9,4.1-2.9,4.9s-.8.2-1.2.3Z"></path>
        <path fill="currentColor" d="M16.6,19.7c-1.7-.2-3-1-3.6-2.5s-.5-1.6-.5-2.5v-1.6c2-.1,4-1.3,5.2-2.9-2.2-1.2-2.5-3.4-1.9-5.6.4-1.3.9-2.5,1.6-3.6l1.6,1.5c-.7.6-1.1,1.3-1.6,2-.5.9-.8,1.9-.8,2.9,0,1.1.5,2.1,1.5,2.6-.8,2.1-2.6,3.7-4.8,4.1-.1,2.5.9,4.8,3.7,5.3,0,0-.3.2-.4.3Z"></path>
        <path fill="currentColor" d="M15.1,4.6c-2-.7-4.1-.7-6.2,0,0-.2-.1-.3-.2-.5,2.1-.8,4.4-.7,6.5,0l-.2.5Z"></path>
        <path fill="currentColor" d="M11.4,9.9h-1.1c0,0,0,.2,0,.3h1.3s0,.4,0,.4h-1.8s0-1.7,0-1.7h1.8s0,.4,0,.4h-1.3s0,.3,0,.3h1.2c0,0,0,.2,0,.3Z"></path>
        <path fill="currentColor" d="M11.1,8l-.3-.5h-.6s0,.5,0,.5h-.4s0-1.7,0-1.7h1.2c.3,0,.5.2.6.4s0,.6-.3.7l.4.6h-.5ZM10.9,7.1c0,0,.2-.2.2-.2s-.1-.2-.2-.2h-.7s0,.4,0,.4h.8Z"></path>
        <path fill="currentColor" d="M14.1,9.6c0,0,.1.3,0,.3h-1.1s0,.7,0,.7h-.4s0-1.7,0-1.7h1.7s0,.4,0,.4h-1.3s0,.3,0,.3h1.1Z"></path>
        <path fill="currentColor" d="M14.1,7v.4s-1.2,0-1.2,0v.6s-.5,0-.5,0v-1.7s1.7,0,1.7,0c0,0,0,.3,0,.3h-1.3s0,.3,0,.3h1.1Z"></path>
      </svg>
    )
  }
];

export const PLAYERS: Player[] = [
  { id: 'lamine', name: 'LAMINE YAMAL', number: '10', code: 'P10' },
  { id: 'pedri', name: 'PEDRI', number: '8', code: 'P08' },
  { id: 'raphinha', name: 'RAPHINHA', number: '11', code: 'P11' },
  { id: 'lewandowski', name: 'LEWANDOWSKI', number: '9', code: 'P09' },
  { id: 'rashford', name: 'RASHFORD', number: '14', code: 'P14' },
  { id: 'fermin', name: 'FERMÍN', number: '16', code: 'P16' },
  { id: 'dejong', name: 'F. DE JONG', number: '21', code: 'P21' },
  { id: 'cubarsi', name: 'CUBARSÍ', number: '5', code: 'P05' },
  { id: 'gavi', name: 'GAVI', number: '6', code: 'P06' },
  { id: 'roony', name: 'ROONY', number: '19', code: 'P19' },
  { id: 'kounde', name: 'KOUNDE', number: '23', code: 'P23' },
  { id: 'ferran', name: 'FERRAN', number: '7', code: 'P07' },
  { id: 'balde', name: 'BALDE', number: '3', code: 'P03' },
  { id: 'bernal', name: 'BERNAL', number: '22', code: 'P22' },
  { id: 'eric', name: 'ERIC', number: '24', code: 'P24' },
  { id: 'casado', name: 'M. CASADÓ', number: '17', code: 'P17' },
  { id: 'olmo', name: 'OLMO', number: '20', code: 'P20' },
  { id: 'christensen', name: 'CHRISTENSEN', number: '15', code: 'P15' },
  { id: 'gerard', name: 'GERARD MARTÍN', number: '18', code: 'P18' },
  { id: 'araujo', name: 'R. ARAUJO', number: '4', code: 'P04' }
];

export const PLAYERS_LIST = PLAYERS.map(p => `${p.name} ${p.number}`);

export const PRODUCT_DETAILS: AccordionSection[] = [
  {
    title: "Product description",
    content: (
      <div className="space-y-4">
        <p className="font-bold">
          Men’s FCB Fourth Match Jersey 25/26. With this Match version jersey, you&apos;re wearing the same one our players use.
        </p>
        <p>
          &quot;This shirt is a living reminder of one of FCB’s most brilliant nights. Its prints recall November 19th, 2005, when Barça delivered an unforgettable 0–3 on matchday 12 of the league. Every detail of the design pays tribute to that moment that still makes Barça fans’ hearts beat faster. Inside the collar, the jersey includes the minutes of the goals 14&quot;, 58&quot; and 77&quot; as a timeless tribute to Eto&apos;o and Ronaldinho.&quot;
        </p>
        <p>
          The design features a striking zigzag pattern that fuses deep blue and garnet tones, symbolizing the club’s unstoppable energy and passion. The FCB crest is placed on the chest, on the left side, while the Nike logo appears on the right side.
        </p>
        <p>
          We combine authentic design details with lightweight, quick-drying technology to keep you cool and comfortable on the pitch.
        </p>
        <p>
          Advanced breathability: Nike Dri-FIT ADV enhances our sweat-wicking technology with advanced cooling and breathable zones to help you stay dry and comfortable.
        </p>
        <ul className="list-disc list-outside ml-4 space-y-1 marker:text-gray-500">
          <li>Color: Blue and Garnet</li>
          <li>Hidden detail marks the timing of each goal</li>
          <li>Lines on the front represent the path of each scoring run</li>
          <li>Authentic design</li>
          <li>100% polyester</li>
          <li>Machine washable</li>
        </ul>
        <p className="font-bold text-sm">
          *Delivery time for personalized products is 7 to 14 days. Personalized products cannot be returned or exchanged.
        </p>
        <p className="font-bold text-sm">
          *Player names and numbers will not be final until the transfer window closes. BLM is not responsible for any changes made to the jersey numbers for the upcoming 25/26 season.
        </p>
      </div>
    )
  },
  {
    title: "Composition and care",
    content: (
      <div className="space-y-2">
        <p>100% polyester</p>
      </div>
    )
  },
  {
    title: "Size and adjustment",
    content: (
      <div className="space-y-2">
        <p>Slim Fit</p>
        <p>If you&apos;re unsure or between two sizes, go for the larger one. Otherwise, choose your usual size</p>
      </div>
    )
  }
];

export const MAIN_PRODUCT: Product = {
  id: '202333090',
  sku: 'FCB-26-HOME',
  name: "SUPERCOPA Men's fourth jersey 25/26 FCB - Player's Edition",
  price: 49.99,
  originalPrice: 149.99,
  customizationPrice: 20.00,
  image: '/images/contentProduct/main.webp',
  images: [
    '/images/contentProduct/main.webp',
    '/images/contentProduct/back.webp',
    '/images/contentProduct/symbol.webp',
    '/images/contentProduct/model.webp',
    '/images/contentProduct/model2.webp',
    '/images/contentProduct/model2_2.webp',
    '/images/contentProduct/model2_3.webp',
    '/images/contentProduct/front_r.webp',
  ],
  sizes: ['S', 'M', 'L', 'XL', 'XXL'],
  type: 'jersey',
  badgePrice: 30.00,
  badges: BADGES,
  details: PRODUCT_DETAILS,
  players: PLAYERS_LIST
};

export const RELATED_PRODUCTS: Product[] = [
  {
    id: '15202689679745',
    name: "Fourth Short FCB 25/26 - Player's Edition",
    sku: 'FCB-26-SHORT',
    price: 39.99,
    image: '/images/otherProducts/Short_fc_2526.webp',
    images: ['/images/otherProducts/Short_fc_2526.webp'],
    sizes: ['S', 'M', 'L', 'XL', '2XL'],
    type: 'short'
  },
  {
    id: 'socks-2526',
    sku: 'FCB-26-SOCKS',
    name: "Fourth Kit Socks FCB 25/26",
    price: 19.99,
    image: '/images/otherProducts/fourth_kit_socks_2526.webp',
    images: ['/images/otherProducts/fourth_kit_socks_2526.webp'],
    sizes: ['38-42', '42-46'],
    type: 'accessory'
  },
  {
    id: '54860590219649',
    sku: 'FCB-26-SWEAT',
    name: "Pre-Match sweatshirt FCB fourth 25/26",
    price: 64.99,
    image: '/images/otherProducts/pre_Match_sweatshirt.webp',
    images: ['/images/otherProducts/pre_Match_sweatshirt.webp'],
    sizes: ['S', 'M', 'L', 'XL', '2XL'],
    type: 'training'
  }
];

export const YOU_MAY_ALSO_LIKE = [
  {
    id: '15202689679745',
    name: "Fourth Short FCB 25/26 - Player's Edition",
    price: '€39.99',
    image: '/images/otherProducts/Short_fc_2526.webp'
  },
  {
    id: 'socks-2526',
    name: "Fourth Kit Socks FCB 25/26",
    price: '€19.99',
    image: '/images/otherProducts/fourth_kit_socks_2526.webp'
  },
  {
    id: '54860590219649',
    name: "Pre-Match sweatshirt FCB fourth 25/26",
    price: '€64.99',
    image: '/images/otherProducts/pre_Match_sweatshirt.webp'
  },
  {
    id: 'pre-match-jersey',
    name: "Pre-Match Jersey FCB Fourth 25/26",
    price: '€49.99',
    image: '/images/otherProducts/pre_Match_fourth_2526.webp'
  }
];
