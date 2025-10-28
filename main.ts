import React, { useEffect, useState, useMemo } from 'react';
import { Copy, Edit3, Link as LinkIcon, X, Trash2 } from 'lucide-react';

const makePlaceholder = (id, name = 'No image') => {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='600' height='360'><rect width='100%' height='100%' fill='%23e5e7eb'/><text x='50%' y='45%' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-size='22'>${name}</text><text x='50%' y='60%' dominant-baseline='middle' text-anchor='middle' fill='%23cbd5e1' font-size='16'>Placeholder #${id}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

const DEFAULT_SCRIPTS = Array.from({ length: 7 }).map((_, i) => ({
  id: i + 1,
  name: `Script ${i + 1}`,
  image: '',
  link: '',
  code: `-- Script ${i + 1}\nprint("Hello from Script ${i + 1}")`,
}));

export default function ScriptApp() {
  const [cards, setCards] = useState(() => {
    try {
      const raw = localStorage.getItem('scriptCards_v1');
      return raw ? JSON.parse(raw) : DEFAULT_SCRIPTS;
    } catch (e) {
      return DEFAULT_SCRIPTS;
    }
  });

  const [active, setActive] = useState(null);
  const [showAd, setShowAd] = useState(false);
  const [adCount, setAdCount] = useState(0);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', image: '', link: '', code: '' });
  const [query, setQuery] = useState('');

  useEffect(() => {
    localStorage.setItem('scriptCards_v1', JSON.stringify(cards));
  }, [cards]);

  function startShow(card) {
    setActive({ ...card });
    setShowAd(true);
    setAdCount(0);
    setTimeout(() => {
      setAdCount(2);
      setTimeout(() => {
        setShowAd(false);
        setAdCount(0);
      }, 1600);
    }, 1600);
  }

  function handleCopy(text) {
    if (!navigator.clipboard) return alert('Clipboard API not supported');
    navigator.clipboard.writeText(text).then(() => alert('Script copied to clipboard'));
  }

  function openEdit(card) {
    setEditing(card.id);
    setForm({ name: card.name, image: card.image, link: card.link, code: card.code });
  }

  function saveEdit(id) {
    setCards(prev => prev.map(c => (c.id === id ? { ...c, ...form } : c)));
    if (active && active.id === id) setActive(prev => ({ ...prev, ...form }));
    setEditing(null);
  }

  function removeScript(id) {
    setCards(prev => prev.filter(c => c.id !== id));
    if (active && active.id === id) setActive(null);
    if (editing === id) setEditing(null);
  }

  function addImageFallback(e, id) {
    e.target.onerror = null;
    e.target.src = makePlaceholder(id, 'No image');
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return cards;
    return cards.filter(c => String(c.id).includes(q) || (c.name || '').toLowerCase().includes(q) || (c.link || '').toLowerCase().includes(q) || (c.code || '').toLowerCase().includes(q));
  }, [cards, query]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 p-6">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center justify-between mb-6 gap-4">
          <h1 className="text-2xl font-extrabold">Script App</h1>
          <div className="flex-1 flex items-center gap-3">
            <input
              className="flex-1 p-2 border rounded"
              placeholder="Search by id, name, link or script contents..."
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            <div className="text-sm text-gray-600">{filtered.length} of {cards.length} shown</div>
          </div>
        </header>

        <main className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(card => (
            <div key={card.id} className="bg-white shadow rounded-lg overflow-hidden">
              <div className="h-40 w-full bg-gray-100 flex items-center justify-center">
                {card.image ? <img src={card.image} alt={card.name} className="object-cover h-full w-full" onError={(e) => addImageFallback(e, card.id)} /> : <img src={makePlaceholder(card.id, card.name)} alt={`Placeholder ${card.id}`} className="object-cover h-full w-full" />}
              </div>

              <div className="p-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-semibold">{card.name}</div>
                    <a href={card.link || '#'} target="_blank" rel="noreferrer" className="text-xs flex items-center gap-1 text-blue-600 mt-1">
                      <LinkIcon size={14} /> {card.link || 'No link set'}
                    </a>
                    <div className="text-xs text-gray-400 mt-2">ID: {card.id}</div>
                  </div>

                  <div className="flex gap-2">
                    <button onClick={() => openEdit(card)} className="p-2 rounded hover:bg-gray-100" title="Edit"><Edit3 size={16} /></button>
                    <button onClick={() => startShow(card)} className="p-2 rounded bg-indigo-600 text-white hover:opacity-95" title="Get script">Get</button>
                    <button onClick={() => removeScript(card.id)} className="p-2 rounded hover:bg-gray-100" title="Remove"><Trash2 size={16} /></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </main>
      </div>
    </div>
  );
}
