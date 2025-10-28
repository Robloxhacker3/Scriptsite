import React, { useEffect, useState, useMemo } from 'react';
import { Copy, Edit3, Link as LinkIcon, X, Trash2, Plus } from 'lucide-react';

const makePlaceholder = (id: number, name = 'No image') => {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='600' height='360'><rect width='100%' height='100%' fill='%23e5e7eb'/><text x='50%' y='45%' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-size='22'>${name}</text><text x='50%' y='60%' dominant-baseline='middle' text-anchor='middle' fill='%23cbd5e1' font-size='16'>Placeholder #${id}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

const DEFAULT_SCRIPTS = [
  {
    id: 1,
    name: "Admin Commands",
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&h=360&fit=crop",
    link: "https://example.com/admin-commands",
    code: "-- Admin Commands Script\nloadstring(game:HttpGet('https://raw.githubusercontent.com/example/admin.lua'))();"
  },
  {
    id: 2,
    name: "ESP & Aimbot",
    image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&h=360&fit=crop",
    link: "https://example.com/esp-aimbot",
    code: "-- ESP & Aimbot Script\nloadstring(game:HttpGet('https://raw.githubusercontent.com/example/esp.lua'))();"
  },
  {
    id: 3,
    name: "Infinite Jump",
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&h=360&fit=crop",
    link: "https://example.com/infinite-jump",
    code: "-- Infinite Jump Script\nlocal Player = game.Players.LocalPlayer\nlocal Mouse = Player:GetMouse()\nMouse.KeyDown:connect(function(key)\nif key == ' ' then\ngame.Players.LocalPlayer.Character.Humanoid:ChangeState(3)\nend\nend)"
  },
  {
    id: 4,
    name: "Speed Hack",
    image: "https://images.unsplash.com/photo-1614732414444-096e5f1122d5?w=600&h=360&fit=crop",
    link: "https://example.com/speed-hack",
    code: "-- Speed Hack Script\nlocal player = game.Players.LocalPlayer\nlocal character = player.Character or player.CharacterAdded:Wait()\nlocal humanoid = character:WaitForChild('Humanoid')\nhumanoid.WalkSpeed = 100"
  },
  {
    id: 5,
    name: "Fly Script",
    image: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=600&h=360&fit=crop",
    link: "https://example.com/fly-script",
    code: "-- Fly Script\nloadstring(game:HttpGet('https://raw.githubusercontent.com/example/fly.lua'))();"
  },
  {
    id: 6,
    name: "Auto Farm",
    image: "https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=600&h=360&fit=crop",
    link: "https://example.com/auto-farm",
    code: "-- Auto Farm Script\nwhile wait(0.1) do\n-- Auto farming logic here\nprint('Auto farming...')\nend"
  },
  {
    id: 7,
    name: "Teleport GUI",
    image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&h=360&fit=crop",
    link: "https://example.com/teleport-gui",
    code: "-- Teleport GUI Script\nloadstring(game:HttpGet('https://raw.githubusercontent.com/example/teleport.lua'))();"
  }
];

export default function ScriptApp() {
  const [cards, setCards] = useState(DEFAULT_SCRIPTS);
  const [active, setActive] = useState<any>(null);
  const [currentAd, setCurrentAd] = useState(0);
  const [editing, setEditing] = useState<number | null>(null);
  const [form, setForm] = useState({ name: '', image: '', link: '', code: '' });
  const [query, setQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('scriptCards_v1');
      if (raw) setCards(JSON.parse(raw));
    } catch (e) {}
  }, []);

  useEffect(() => {
    localStorage.setItem('scriptCards_v1', JSON.stringify(cards));
  }, [cards]);

  function startShow(card: any) {
    setActive({ ...card });
    setCurrentAd(1);
  }

  function nextAd() {
    if (currentAd < 2) {
      setCurrentAd(currentAd + 1);
    }
  }

  function closeModal() {
    setActive(null);
    setCurrentAd(0);
  }

  function handleCopy(text: string) {
    if (!navigator.clipboard) return alert('Clipboard API not supported');
    navigator.clipboard.writeText(text).then(() => {
      alert('Script copied to clipboard!');
      closeModal();
    });
  }

  function openEdit(card: any) {
    setEditing(card.id);
    setForm({ name: card.name, image: card.image, link: card.link, code: card.code });
    setShowAddForm(false);
  }

  function saveEdit(id: number) {
    setCards(prev => prev.map(c => (c.id === id ? { ...c, ...form } : c)));
    if (active && active.id === id) setActive(prev => ({ ...prev, ...form }));
    setEditing(null);
    setForm({ name: '', image: '', link: '', code: '' });
  }

  function removeScript(id: number) {
    setCards(prev => prev.filter(c => c.id !== id));
    if (active && active.id === id) setActive(null);
    if (editing === id) setEditing(null);
  }

  function addNewScript() {
    const newId = Math.max(...cards.map(c => c.id), 0) + 1;
    const newScript = {
      id: newId,
      name: form.name || `Script ${newId}`,
      image: form.image || '',
      link: form.link || '',
      code: form.code || `-- Script ${newId}\nprint("Hello from Script ${newId}")`
    };
    setCards(prev => [...prev, newScript]);
    setForm({ name: '', image: '', link: '', code: '' });
    setShowAddForm(false);
  }

  function addImageFallback(e: any, id: number) {
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
            <button 
              onClick={() => {
                setShowAddForm(true);
                setEditing(null);
                setForm({ name: '', image: '', link: '', code: '' });
              }}
              className="p-2 rounded bg-green-600 text-white hover:opacity-95 flex items-center gap-2"
              title="Add New Script"
            >
              <Plus size={20} /> Add Script
            </button>
          </div>
        </header>

        {(editing !== null || showAddForm) && (
          <div className="bg-white shadow-lg rounded-lg p-6 mb-6 border-2 border-indigo-500">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">{showAddForm ? 'Add New Script' : 'Edit Script'}</h2>
              <button 
                onClick={() => {
                  setEditing(null);
                  setShowAddForm(false);
                  setForm({ name: '', image: '', link: '', code: '' });
                }}
                className="p-2 rounded hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  className="w-full p-2 border rounded"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="Script name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Image URL</label>
                <input
                  className="w-full p-2 border rounded"
                  value={form.image}
                  onChange={e => setForm({ ...form, image: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Link</label>
                <input
                  className="w-full p-2 border rounded"
                  value={form.link}
                  onChange={e => setForm({ ...form, link: e.target.value })}
                  placeholder="https://example.com/script"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Script Code</label>
                <textarea
                  className="w-full p-2 border rounded font-mono text-sm"
                  rows={8}
                  value={form.code}
                  onChange={e => setForm({ ...form, code: e.target.value })}
                  placeholder="-- Your script code here"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              {showAddForm ? (
                <button
                  onClick={addNewScript}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:opacity-95"
                >
                  Create Script
                </button>
              ) : (
                <button
                  onClick={() => editing !== null && saveEdit(editing)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded hover:opacity-95"
                >
                  Save Changes
                </button>
              )}
              <button
                onClick={() => {
                  setEditing(null);
                  setShowAddForm(false);
                  setForm({ name: '', image: '', link: '', code: '' });
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:opacity-95"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <main className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(card => (
            <div key={card.id} className="bg-white shadow rounded-lg overflow-hidden">
              <div className="h-40 w-full bg-gray-100 flex items-center justify-center">
                {card.image ? <img src={card.image} alt={card.name} className="object-cover h-full w-full" onError={(e) => addImageFallback(e, card.id)} /> : <img src={makePlaceholder(card.id, card.name)} alt={`Placeholder ${card.id}`} className="object-cover h-full w-full" />}
              </div>
              <div className="p-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-semibold">{card.name}</div>
                    {card.link && (
                      <a href={card.link} target="_blank" rel="noreferrer" className="text-xs flex items-center gap-1 text-blue-600 mt-1">
                        <LinkIcon size={14} /> View Link
                      </a>
                    )}
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

      {/* Ad Modal */}
      {active && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">{active.name}</h2>
                <button onClick={closeModal} className="p-2 rounded hover:bg-gray-100">
                  <X size={24} />
                </button>
              </div>

              {currentAd === 1 && (
                <div className="space-y-4">
                  <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <div className="text-gray-500 mb-4">Google AdSense Ad #1</div>
                    <div className="text-sm text-gray-400 mb-4">Advertisement placeholder - Insert your AdSense code here</div>
                    <div className="bg-white p-4 rounded">
                      {/* Insert your Google AdSense code here */}
                      <div className="text-gray-600">Your AdSense Ad will appear here</div>
                    </div>
                  </div>
                  <button 
                    onClick={nextAd}
                    className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:opacity-95 font-semibold"
                  >
                    Continue (1 of 2 ads)
                  </button>
                </div>
              )}

              {currentAd === 2 && (
                <div className="space-y-4">
                  <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <div className="text-gray-500 mb-4">Google AdSense Ad #2</div>
                    <div className="text-sm text-gray-400 mb-4">Advertisement placeholder - Insert your AdSense code here</div>
                    <div className="bg-white p-4 rounded">
                      {/* Insert your Google AdSense code here */}
                      <div className="text-gray-600">Your AdSense Ad will appear here</div>
                    </div>
                  </div>
                  <button 
                    onClick={() => setCurrentAd(3)}
                    className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:opacity-95 font-semibold"
                  >
                    Continue (2 of 2 ads)
                  </button>
                </div>
              )}

              {currentAd === 3 && (
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold mb-2">Script Code:</h3>
                    <pre className="bg-gray-900 text-green-400 p-4 rounded text-sm overflow-x-auto font-mono">
                      {active.code}
                    </pre>
                  </div>
                  <button 
                    onClick={() => handleCopy(active.code)}
                    className="w-full py-3 bg-green-600 text-white rounded-lg hover:opacity-95 font-semibold flex items-center justify-center gap-2"
                  >
                    <Copy size={20} /> Copy Script to Clipboard
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
