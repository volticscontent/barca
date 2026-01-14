"use client";

import { useState } from 'react';

interface KitCustomizationProps {
  onCustomizationChange: (customization: { type: 'player' | 'custom' | null, name: string, number: string }) => void;
  players: string[];
  price?: number;
}

export default function KitCustomization({ onCustomizationChange, players, price = 20 }: KitCustomizationProps) {
  const [activeTab, setActiveTab] = useState<'player' | 'custom'>('player');
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [customName, setCustomName] = useState('');
  const [customNumber, setCustomNumber] = useState('');

  const handleTabChange = (tab: 'player' | 'custom') => {
    setActiveTab(tab);
    // Reset values when switching tabs
    if (tab === 'player') {
      setCustomName('');
      setCustomNumber('');
      onCustomizationChange({ type: 'player', name: selectedPlayer.split(' ')[0] || '', number: selectedPlayer.split(' ')[1] || '' });
    } else {
      setSelectedPlayer('');
      onCustomizationChange({ type: 'custom', name: customName, number: customNumber });
    }
  };

  const handlePlayerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedPlayer(value);
    
    // Extract name and number from value (e.g., "PEDRI 8")
    // Note: The value format in the options provided is "NAME NUMBER"
    const parts = value.split(' ');
    const number = parts.pop() || '';
    const name = parts.join(' ');

    onCustomizationChange({ type: 'player', name, number });
  };

  const handleCustomNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    if (/^[A-ZÜÁÉÍÓÚÀÈÌÒÙÖÑÂÊÎÔÛĈĜĞĤĴŜČÄËÏĆÃÕÇ´^¨,.\s-]*$/.test(value)) {
      setCustomName(value);
      onCustomizationChange({ type: 'custom', name: value, number: customNumber });
    }
  };

  const handleCustomNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 2);
    setCustomNumber(value);
    onCustomizationChange({ type: 'custom', name: customName, number: value });
  };

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-[10px] text-black font-medium uppercase">Customise this item</h3>
        <span className="text-sm font-bold text-[#181733]">+€{price.toFixed(2)}</span>
      </div>

      <div className="overflow-hidden mb-6 bg-gray-100 rounded-full">
        <div className="flex">
          <button
            className={`flex-1 py-3 text-xs md:text-sm rounded-full font-medium tracking-wider transition-all duration-200 ${
              activeTab === 'player'
                ? 'bg-[#2578f5] text-white shadow-sm'
                : 'text-gray-500 hover:text-[#181733]'
            }`}
            onClick={() => handleTabChange('player')}
          >
            Choose player
          </button>
          <button
            className={`flex-1 py-2 text-xs md:text-sm rounded-full font-bold tracking-wider transition-all duration-200 ${
              activeTab === 'custom'
                ? 'bg-[#2578f5] text-white shadow-sm'
                : 'text-gray-500 hover:text-[#181733]'
            }`}
            onClick={() => handleTabChange('custom')}
          >
            Add your name
          </button>
        </div>
      </div>

      <div className="px-4">
        {activeTab === 'player' ? (
          <div className="relative">
            <label htmlFor="player-select" className="sr-only">Choose player</label>
            <select
              id="player-select"
              name="player-select"
              value={selectedPlayer}
              onChange={handlePlayerChange}
              className="w-full h-12 px-4 bg-white border border-black rounded-sm appearance-none cursor-pointer focus:outline-none focus:border-black text-gray-900 font-medium"
            >
              <option value="">Choose player</option>
              {players.map((player) => (
                <option key={player} value={player}>{player}</option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1.5L6 6.5L11 1.5" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        ) : (
          <div className="flex gap-4">
            <div className="flex-1">
              <label htmlFor="kit-name" className="block text-xs font-bold text-black uppercase mb-1">
                Name
              </label>
              <input
                type="text"
                id="kit-name"
                name="kit-name"
                autoComplete="off"
                value={customName}
                onChange={handleCustomNameChange}
                placeholder="Name"
                className="w-full h-12 px-4 bg-white border border-black rounded-sm focus:outline-none focus:border-[#154284] focus:ring-1 focus:ring-[#154284] text-gray-900 font-medium uppercase placeholder-gray-400"
              />
            </div>
            <div className="w-24">
              <label htmlFor="kit-number" className="block text-xs font-bold text-black uppercase mb-1">
                Number
              </label>
              <input
                type="text"
                id="kit-number"
                name="kit-number"
                autoComplete="off"
                value={customNumber}
                onChange={handleCustomNumberChange}
                placeholder="00"
                maxLength={2}
                inputMode="numeric"
                className="w-full h-12 px-4 bg-white border border-black rounded-sm focus:outline-none focus:border-[#154284] focus:ring-1 focus:ring-[#154284] text-gray-900 font-medium text-center placeholder-gray-400"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export type { KitCustomizationProps };
