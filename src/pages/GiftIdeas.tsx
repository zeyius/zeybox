import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "../lib/supabaseClient";
import { Link } from "react-router-dom";

type Box = {
  id: string;
  name: string;
  price_dzd: number;
  description: string | null;
  category: string;
  image_url: string | null;
  validity_days: number;
  occasion: string | null;
};

const OCCASIONS = [
  { key: "anniversaire", image: "/images/occasions/anniversaire.webp", en: "Gift ideas for Birthdays", fr: "Idées cadeaux pour les Anniversaires", ar: "أفكار هدايا لأعياد الميلاد" },
  { key: "mariage", image: "/images/occasions/mariage.webp", en: "Gift ideas for Weddings", fr: "Idées cadeaux pour les Mariages", ar: "أفكار هدايا للأعراس" },
  { key: "couple", image: "/images/occasions/couple.webp", en: "Gift ideas for Couples", fr: "Idées cadeaux pour les Couples", ar: "أفكار هدايا للأزواج" },
  { key: "bac", image: "/images/occasions/bac.webp", en: "Gift ideas for Bac Success", fr: "Idées cadeaux pour le Bac", ar: "أفكار هدايا لنجاح البكالوريا" },
  { key: "famille", image: "/images/occasions/famille.webp", en: "Gift ideas for Family", fr: "Idées cadeaux en Famille", ar: "أفكار هدايا للعائلة" },
]

export default function GiftIdeas() {
  const { t, i18n } = useTranslation()
  const [selectedOccasion, setSelectedOccasion] = useState<string | null>(null)
  const [boxes, setBoxes] = useState<Box[]>([])
  const [loading, setLoading] = useState(false)
  const isFr = i18n.language === 'fr'
  const isAr = i18n.language === 'ar'

  useEffect(() => {
    if (!selectedOccasion) { setBoxes([]); return; }
    const load = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("boxes")
        .select("id, name, price_dzd, description, category, image_url, validity_days, occasion")
        .eq("is_active", true)
        .eq("occasion", selectedOccasion);
      setBoxes((data ?? []) as Box[]);
      setLoading(false);
    };
    load();
  }, [selectedOccasion]);

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-black uppercase italic tracking-tight mb-2">
        {t('nav_gift_ideas')}
      </h1>
      <p className="text-gray-400 text-sm mb-3">
        {isAr ? "الهدية المثالية لكل مناسبة" : isFr ? "Le cadeau parfait pour chaque occasion" : "The perfect gift for every occasion"}
      </p>
      <div className="h-1.5 w-16 bg-yellow-400 rounded-full mb-8" />

      {/* Mobile tabs — horizontal scroll */}
      <div className="lg:hidden overflow-x-auto no-scrollbar flex gap-3 mb-6 -mx-4 px-4">
        {OCCASIONS.map(o => (
          <button key={o.key}
            onClick={() => setSelectedOccasion(selectedOccasion === o.key ? null : o.key)}
            className={`relative flex-none w-32 h-20 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 ${selectedOccasion === o.key ? 'ring-2 ring-yellow-400' : 'opacity-75 hover:opacity-100'}`}>
            <img src={o.image} alt={o.en} className="absolute inset-0 w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display='none' }} />
            <div className={`absolute inset-0 ${selectedOccasion === o.key ? 'bg-black/40' : 'bg-black/60'}`} />
            <div className="absolute inset-0 flex items-end p-2">
              <p className="text-white font-black text-[10px] leading-tight">{isAr ? o.ar : isFr ? o.fr : o.en}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Mobile selected occasion banner */}
      {selectedOccasion && (
        <div className="lg:hidden mb-4 flex items-center justify-between bg-yellow-400 rounded-2xl px-4 py-3">
          <p className="font-black text-sm text-black">
            {OCCASIONS.find(o => o.key === selectedOccasion)?.[isAr ? 'ar' : isFr ? 'fr' : 'en']}
          </p>
          <button onClick={() => setSelectedOccasion(null)} className="text-black font-black text-sm">✕</button>
        </div>
      )}

      {/* Desktop split layout */}
      <div className="flex gap-8">

        {/* LEFT SIDEBAR — desktop only */}
        <aside className="hidden lg:flex flex-col gap-3 w-72 shrink-0 sticky top-24 self-start max-h-screen overflow-y-auto">
          {OCCASIONS.map(o => {
            const isSelected = selectedOccasion === o.key;
            return (
              <button key={o.key}
                onClick={() => setSelectedOccasion(isSelected ? null : o.key)}
                className={`group relative h-20 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 ease-in-out text-left ${isSelected ? 'ring-2 ring-yellow-400' : 'opacity-70 hover:opacity-100'}`}>
                <img src={o.image} alt={o.en} loading="lazy" className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" onError={(e) => { (e.target as HTMLImageElement).style.display='none' }} />
                <div className="absolute inset-0 bg-black/60" />
                <div className="absolute inset-0 flex items-center px-4">
                  <p className={`text-white font-black leading-tight ${isSelected ? 'text-base' : 'text-sm'}`}>{isAr ? o.ar : isFr ? o.fr : o.en}</p>
                </div>
                {isSelected && boxes.length > 0 && (
                  <span className="absolute top-2 right-2 bg-yellow-400 text-black text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">
                    {boxes.length}
                  </span>
                )}
              </button>
            );
          })}
        </aside>

        {/* No occasion selected */}
        {!selectedOccasion && (
          <div className="flex-1 flex flex-col items-center justify-center h-64 text-center">
            <p className="text-5xl mb-4">🎁</p>
            <p className="font-black text-xl">{isAr ? "اختر مناسبة" : isFr ? "Choisissez une occasion" : "Choose an occasion"}</p>
            <p className="text-gray-400 text-sm mt-2">{isAr ? "سنجد لك الهدية المثالية" : isFr ? "Nous trouverons le cadeau parfait" : "We'll find the perfect gift"}</p>
          </div>
        )}

        {/* Loading */}
        {selectedOccasion && loading && (
          <div className="flex-1 flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* No boxes found */}
        {selectedOccasion && !loading && boxes.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center h-64 text-center">
            <p className="text-5xl mb-4">😔</p>
            <p className="font-black text-xl">{isAr ? "لا توجد صناديق لهذه المناسبة" : isFr ? "Aucun coffret pour cette occasion" : "No boxes for this occasion yet"}</p>
            <p className="text-gray-400 text-sm mt-2">{isAr ? "قريباً!" : isFr ? "Bientôt disponible !" : "Check back soon!"}</p>
          </div>
        )}

        {/* Boxes grid */}
        {selectedOccasion && !loading && boxes.length > 0 && (
          <div className="flex-1 grid grid-cols-2 lg:grid-cols-3 gap-3 animate-in fade-in duration-300">
            {boxes.map(b => (
              <Link to={`/box/${b.id}`} key={b.id} className="group rounded-3xl border border-gray-100 bg-white p-3 hover:shadow-xl hover:border-yellow-400 transition-all flex flex-col">
                <div className="h-32 md:h-40 rounded-2xl bg-gray-50 flex items-center justify-center mb-3 overflow-hidden group-hover:bg-yellow-50 transition-colors">
                  {b.image_url ? (
                    <img src={b.image_url} className="w-20 md:w-24 object-contain transition-transform duration-500 group-hover:scale-110" alt={b.name} loading="lazy" />
                  ) : (
                    <span className="text-4xl">
                      {b.category === "Wellness" ? "💆" :
                       b.category === "Restaurants" ? "🍽️" :
                       b.category === "Adventure" ? "🏔️" :
                       b.category === "Weekend" ? "🏨" :
                       b.category === "Event" ? "🎉" : "🎁"}
                    </span>
                  )}
                </div>
                <h3 className="font-black text-sm leading-tight group-hover:text-red-600 transition-colors">{b.name}</h3>
                <p className="text-gray-400 text-xs mt-1 line-clamp-2">{b.description}</p>
                <div className="mt-auto pt-4 flex items-center justify-between border-t border-gray-50">
                  <span className="font-black text-base">{b.price_dzd.toLocaleString()} <span className="text-xs">DA</span></span>
                  <span className="bg-yellow-400 text-black text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest group-hover:bg-red-600 group-hover:text-white transition-colors">
                    {t('btn_view_box')}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

      </div>
    </main>
  )
}
