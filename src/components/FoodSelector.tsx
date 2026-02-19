'use client'
import { useState, useEffect } from 'react';

export default function FoodSelector({ onSelect }: { onSelect: (food: any) => void }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (query.length > 1) {
      fetch(`/api/diet/search?q=${query}`)
        .then(res => res.json())
        .then(data => setResults(data));
    } else {
      setResults([]);
    }
  }, [query]);

  return (
    <div className="relative w-full">
      <input 
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Digite o alimento..."
        className="w-full p-4 rounded-2xl border-2 border-black font-bold focus:ring-2 focus:ring-blue-600 outline-none"
      />
      
      {results.length > 0 && (
        <div className="absolute z-10 w-full mt-2 bg-white border-4 border-black rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
          {results.map((food: any, i) => (
            <button
              key={i}
              onClick={() => {
                onSelect(food);
                setQuery('');
                setResults([]);
              }}
              className="w-full p-4 text-left font-black uppercase italic hover:bg-blue-600 hover:text-white border-b-2 border-slate-100 last:border-0 transition-colors"
            >
              {food.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}