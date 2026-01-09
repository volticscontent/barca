"use client";

import { useState } from 'react';
import { X, ChevronDown, Check } from 'lucide-react';

const PLAYERS_MENS = [
  { name: 'HAKIMI', number: 2 },
  { name: 'BERALDO', number: 4 },
  { name: 'MARQUINHOS', number: 5 },
  { name: 'ZABARNYI', number: 6 },
  { name: 'KVARATSKHELIA', number: 7 },
  { name: 'FABIAN', number: 8 },
  { name: 'G.RAMOS', number: 9 },
  { name: 'O.DEMBÉLÉ', number: 10 },
  { name: 'D.DOUÉ', number: 14 },
  { name: 'VITINHA', number: 17 },
  { name: 'KANG IN', number: 19 },
  { name: 'L.HERNANDEZ', number: 21 },
  { name: 'MAYULU', number: 24 },
  { name: 'N.MENDES', number: 25 },
  { name: 'B.BARCOLA', number: 29 },
  { name: 'ZAÏRE-EMERY', number: 33 },
  { name: 'KAMARA', number: 43 },
  { name: 'MBAYE', number: 49 },
  { name: 'PACHO', number: 51 },
  { name: 'JOÃO NEVES', number: 87 },
];

const PLAYERS_WOMENS = [
  { name: 'KIEDRZYNEK', number: 1 },
  { name: 'SAMOURA', number: 3 },
  { name: 'DUDEK', number: 4 },
  { name: 'DE ALMEIDA', number: 5 },
  { name: 'KARCHAOUI', number: 7 },
  { name: 'GEYORO', number: 8 },
  { name: 'KATOTO', number: 9 },
  { name: 'BACHMANN', number: 10 },
  { name: 'GROENEN', number: 14 },
  { name: 'FALCONER', number: 16 },
  { name: 'LE GUILLY', number: 19 },
  { name: 'VANGSGAARD', number: 20 },
  { name: 'MBOCK', number: 23 },
  { name: 'BALTIMORE', number: 27 },
];

const BADGES_BY_TAB = {
  league: [
    { id: 'none', label: 'Aucun Badge', price: 0 },
    { id: 'champions', label: 'Champions Intercontinentaux 2025', price: 7 },
  ],
  cup: [
    { id: 'none', label: 'Aucun Badge', price: 0 },
    { id: 'ucl_star', label: 'Titre UCL & Fondation & Étoile', price: 10 },
    { id: 'inter_ucl', label: 'Champions Intercontinentaux 2025 & Titre UCL & Fondation & Étoile', price: 16 },
    { id: 'inter', label: 'Champions Intercontinentaux 2025', price: 8 },
  ],
  women: [
    { id: 'none', label: 'Aucun Badge', price: 0 },
    { id: 'arkema', label: 'Arkema Première Ligue', price: 10 },
  ]
};

import { CartItem } from '../context/CartContext';

interface CustomiseModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  selectedSize: string | null;
  basePrice: number;
  onAddToCart: (customization: NonNullable<CartItem['customization']> & { price: number }) => void;
}

export default function CustomiseModal({ isOpen, onClose, productName, selectedSize, basePrice, onAddToCart }: CustomiseModalProps) {
  const [activeTab, setActiveTab] = useState<'league' | 'cup' | 'women'>('league');
  const [personalizationType, setPersonalizationType] = useState<'player' | 'custom'>('player');
  const [selectedPlayer, setSelectedPlayer] = useState<string>('');
  const [customName, setCustomName] = useState('');
  const [customNumber, setCustomNumber] = useState('');
  const [badgeId, setBadgeId] = useState<string>('none');
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const currentPlayers = activeTab === 'women' ? PLAYERS_WOMENS : PLAYERS_MENS;
  const currentBadges = BADGES_BY_TAB[activeTab];
  
  const selectedBadge = currentBadges.find(b => b.id === badgeId) || currentBadges[0];
  const badgePrice = selectedBadge.price;

  const totalPrice = basePrice + badgePrice + (personalizationType === 'custom' || selectedPlayer ? 22 : 0);

  const handleAddToCart = () => {
    if (isSuccess) return;
    setError('');

    let details: { name: string; number: string | number } | undefined;

    if (personalizationType === 'player') {
      const player = currentPlayers.find(p => p.name === selectedPlayer);
      if (player) {
        details = player;
      } else {
        setError('Veuillez sélectionner un joueur');
        return; 
      }
    } else {
        if (!customName && !customNumber) {
            setError('Veuillez entrer un nom ou un numéro');
            return;
        }
      details = { name: customName, number: customNumber };
    }

    // Trigger Success State
    setIsSuccess(true);

    // Delay closing to show animation
    setTimeout(() => {
        onAddToCart({
          type: personalizationType,
          printingType: activeTab, // Track which league printing
          details,
          badge: selectedBadge,
          price: totalPrice
        });
        onClose();
        setIsSuccess(false);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-sm shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh] z-[210]">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-[#1b1b1b] mb-1">Personnaliser</h2>
            <h3 className="text-sm text-gray-600 font-medium">{productName}</h3>
            {selectedSize && (
              <div className="mt-2 flex items-center gap-2">
                 <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Taille</span>
                 <span className="text-sm font-bold text-[#1b1b1b] bg-gray-100 px-2 py-0.5 rounded-sm">{selectedSize}</span>
              </div>
            )}
          </div>
          <button onClick={onClose} className="p-2 -mr-2 -mt-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-6 h-6 text-gray-400 hover:text-[#1b1b1b]" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6">
          
          {/* Badge Type Selector (League/Cup) */}
          <div className="flex gap-2 mb-8 p-1 bg-gray-100 rounded-sm">
            {(['league', 'cup', 'women'] as const).map((tabId) => {
              const tabLabel = {
                league: 'Ligue 1',
                cup: 'Coupe',
                women: 'Féminine'
              }[tabId];
              
              return (
              <button
                key={tabId}
                onClick={() => { setActiveTab(tabId); setBadgeId('none'); setSelectedPlayer(''); setError(''); }}
                className={`flex-1 py-2 text-xs font-bold rounded-sm transition-all ${
                  activeTab === tabId 
                    ? 'bg-white text-[#1b1b1b] shadow-sm' 
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {tabLabel}
              </button>
            )})}
          </div>

          {/* Personalization Options */}
          <div className="mb-8">
            <h3 className="text-sm font-bold text-[#1b1b1b] mb-4 uppercase tracking-wide">Nom & Numéro</h3>
            
            <div className="space-y-4">
              {/* Player Selection Radio */}
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${personalizationType === 'player' ? 'border-primary' : 'border-gray-300 group-hover:border-gray-400'}`}>
                  {personalizationType === 'player' && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                </div>
                <input 
                  type="radio" 
                  name="type" 
                  className="hidden" 
                  checked={personalizationType === 'player'} 
                  onChange={() => { setPersonalizationType('player'); setError(''); }}
                />
                <span className={`font-bold ${personalizationType === 'player' ? 'text-[#1b1b1b]' : 'text-gray-600'}`}>Choisir un Joueur</span>
              </label>

              {personalizationType === 'player' && (
                <div className="ml-8 relative">
                  <div className="relative">
                    <select 
                      className="w-full h-12 pl-4 pr-10 bg-white border border-gray-300 rounded-sm appearance-none focus:border-primary focus:ring-1 focus:ring-primary outline-none font-medium text-[#1b1b1b] cursor-pointer"
                      value={selectedPlayer}
                      onChange={(e) => { setSelectedPlayer(e.target.value); setError(''); }}
                    >
                      <option value="">Sélectionner un joueur...</option>
                      {currentPlayers.map(p => (
                        <option key={p.name} value={p.name}>{p.name} - {p.number}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                  </div>
                </div>
              )}

              {/* Custom Selection Radio */}
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${personalizationType === 'custom' ? 'border-primary' : 'border-gray-300 group-hover:border-gray-400'}`}>
                  {personalizationType === 'custom' && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                </div>
                <input 
                  type="radio" 
                  name="type" 
                  className="hidden" 
                  checked={personalizationType === 'custom'} 
                  onChange={() => { setPersonalizationType('custom'); setError(''); }}
                />
                <span className={`font-bold ${personalizationType === 'custom' ? 'text-[#1b1b1b]' : 'text-gray-600'}`}>Nom & Numéro Personnalisés</span>
              </label>

              {personalizationType === 'custom' && (
                <div className="ml-8 grid grid-cols-3 gap-4 animate-in fade-in slide-in-from-top-1 duration-200">
                  <div className="col-span-2 space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">Nom (Max 10)</label>
                    <input 
                      type="text" 
                      maxLength={10}
                      value={customName}
                      onChange={(e) => { setCustomName(e.target.value.toUpperCase()); setError(''); }}
                      className="w-full h-12 px-4 border border-gray-300 rounded-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none font-bold text-[#1b1b1b]"
                      placeholder="VOTRE NOM"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">Numéro (Max 2)</label>
                    <input 
                      type="text" 
                      maxLength={2}
                      value={customNumber}
                      onChange={(e) => { setCustomNumber(e.target.value.replace(/\D/g, '')); setError(''); }}
                      className="w-full h-12 px-4 border border-gray-300 rounded-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none font-bold text-[#1b1b1b]"
                      placeholder="10"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Badges */}
          <div className="mb-4">
             <h3 className="text-sm font-bold text-[#1b1b1b] mb-4 uppercase tracking-wide">Ajouter un Badge</h3>
             <div className="space-y-3">
               {currentBadges.map((badgeOption) => (
                 <label key={badgeOption.id} className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${badgeId === badgeOption.id ? 'border-primary' : 'border-gray-300 group-hover:border-gray-400'}`}>
                      {badgeId === badgeOption.id && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                    </div>
                    <input 
                      type="radio" 
                      name="badge" 
                      className="hidden" 
                      checked={badgeId === badgeOption.id} 
                      onChange={() => setBadgeId(badgeOption.id)} 
                    />
                    <span className="font-medium text-[#1b1b1b]">
                      {badgeOption.label}
                      {badgeOption.price > 0 && ` (+€${badgeOption.price.toFixed(2)})`}
                    </span>
                 </label>
               ))}
             </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-gray-50">
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-600 font-medium">Prix Total</span>
            <span className="text-2xl font-bold text-[#1b1b1b]">€{totalPrice.toFixed(2)}</span>
          </div>
          {error && <p className="text-red-600 text-sm font-bold mb-3 text-center animate-pulse">{error}</p>}
          <button 
            onClick={handleAddToCart}
            disabled={isSuccess}
            className={`w-full h-14 rounded-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 tracking-wider text-sm shadow-sm overflow-hidden relative ${
                isSuccess 
                ? 'bg-green-600 text-white scale-100' 
                : 'bg-primary text-white hover:bg-[#003055]'
            }`}
          >
             <div className={`flex items-center gap-2 transition-transform duration-300 ${isSuccess ? '-translate-y-12 absolute' : 'translate-y-0'}`}>
                <span>Ajouter au Panier</span>
             </div>
             
             <div className={`absolute flex items-center gap-2 transition-transform duration-300 ${isSuccess ? 'translate-y-0' : 'translate-y-12'}`}>
                <Check className="w-5 h-5" />
                <span>Ajouté avec succès !</span>
             </div>
          </button>
        </div>

      </div>
    </div>
  );
}
