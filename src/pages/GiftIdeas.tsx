import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const OCCASIONS = [
  { key: "anniversaire", emoji: "🎂", en: "Birthday", fr: "Anniversaire", ar: "عيد ميلاد" },
  { key: "mariage", emoji: "💍", en: "Wedding", fr: "Mariage", ar: "زفاف" },
  { key: "couple", emoji: "❤️", en: "Couple", fr: "En amoureux", ar: "للمتزوجين" },
  { key: "bac", emoji: "🎓", en: "Bac réussi", fr: "Bac réussi", ar: "نجاح البكالوريا" },
  { key: "amies", emoji: "👯", en: "Girls Trip", fr: "Entre amies", ar: "بين صديقات" },
  { key: "famille", emoji: "👨‍👩‍👧", en: "Family", fr: "En famille", ar: "عائلي" },
  { key: "promotion", emoji: "🏆", en: "Promotion", fr: "Promotion", ar: "ترقية" },
  { key: "naissance", emoji: "👶", en: "New Baby", fr: "Naissance", ar: "مولود جديد" },
];

export default function GiftIdeas() {
  const { i18n } = useTranslation();
  const lang = i18n.language as "en" | "fr" | "ar";

  const [selectedOccasion, setSelectedOccasion] = useState<string | null>(null);
  const [boxes, setBoxes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const heroTitle = { en: "Gift Ideas", fr: "Idées Cadeaux", ar: "أفكار هدايا" }[lang] ?? "Gift Ideas";
  const heroSub = {
    en: "Find the perfect gift for every occasion",
    fr: "Trouvez le cadeau parfait pour chaque occasion",
    ar: "اعثر على الهدية المثالية لكل مناسبة",
  }[lang] ?? "Find the perfect gift for every occasion";

  const occasionName = (o: typeof OCCASIONS[0]) => o[lang] ?? o.en;

  useEffect(() => {
    if (!selectedOccasion) { setBoxes([]); return; }
    const fetch = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("boxes")
        .select("id, name, price_dzd, description, category, image_url, validity_days, occasion")
        .eq("is_active", true)
        .eq("occasion", selectedOccasion);
      setBoxes(data ?? []);
      setLoading(false);
    };
    fetch();
  }, [selectedOccasion]);

  const categoryEmoji = (cat: string) =>
    cat === "Wellness" ? "💆" :
    cat === "Adventure" ? "🏔️" :
    cat === "Restaurant" || cat === "Restaurants" ? "🍽️" :
    cat === "Weekend" ? "🏨" :
    cat === "Event" ? "🎉" : "🎁";

  const emptyPrompt = {
    en: { title: "Choose an occasion above", sub: "We'll find the perfect gift for you" },
    fr: { title: "Choisissez une occasion ci-dessus", sub: "On trouvera le cadeau parfait pour vous" },
    ar: { title: "اختر مناسبة من الأعلى", sub: "سنجد لك الهدية المثالية" },
  }[lang] ?? { title: "Choose an occasion above", sub: "We'll find the perfect gift for you" };

  const emptyResults = {
    en: { title: "No boxes for this occasion yet", sub: "Check back soon!" },
    fr: { title: "Aucun coffret pour cette occasion", sub: "Revenez bientôt !" },
    ar: { title: "لا توجد صناديق لهذه المناسبة بعد", sub: "تحقق مرة أخرى قريباً!" },
  }[lang] ?? { title: "No boxes for this occasion yet", sub: "Check back soon!" };

  const viewBoxLabel = { en: "View Box", fr: "Voir le coffret", ar: "عرض الصندوق" }[lang] ?? "View Box";

  return (
    <main className="max-w-7xl mx-auto px-4 py-8 md:py-14">
      {/* Hero */}
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tight text-gray-900 inline-block relative">
          {heroTitle}
          <span className="absolute left-0 -bottom-1 w-full h-1 bg-yellow-400 rounded-full" />
        </h1>
        <p className="mt-5 text-gray-400 text-base md:text-lg">{heroSub}</p>
      </div>

      {/* Occasions grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {OCCASIONS.map((o) => {
          const selected = selectedOccasion === o.key;
          return (
            <button
              key={o.key}
              onClick={() => setSelectedOccasion(selected ? null : o.key)}
              className={`flex flex-col items-center gap-2 rounded-3xl border p-5 cursor-pointer transition-all duration-200 ${
                selected
                  ? "bg-black text-white border-black"
                  : "bg-white border-gray-100 hover:border-yellow-400 hover:shadow-md text-gray-900"
              }`}
            >
              <span className="text-4xl">{o.emoji}</span>
              <span className="font-black text-sm">{occasionName(o)}</span>
            </button>
          );
        })}
      </div>

      {/* Results */}
      {!selectedOccasion ? (
        <div className="mt-16 text-center">
          <p className="text-5xl mb-4">🎁</p>
          <p className="font-black text-xl">{emptyPrompt.title}</p>
          <p className="text-gray-400 text-sm mt-2">{emptyPrompt.sub}</p>
        </div>
      ) : loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : boxes.length === 0 ? (
        <div className="mt-16 text-center">
          <p className="text-5xl mb-4">😔</p>
          <p className="font-black text-xl">{emptyResults.title}</p>
          <p className="text-gray-400 text-sm mt-2">{emptyResults.sub}</p>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
          {boxes.map((b) => (
            <div key={b.id} className="group rounded-2xl md:rounded-3xl border border-gray-100 p-3 md:p-5 transition-all duration-300 hover:shadow-2xl hover:border-yellow-400 bg-white flex flex-col">
              <div className="aspect-square rounded-xl md:rounded-2xl bg-gray-50 flex items-center justify-center transition-colors group-hover:bg-yellow-50 overflow-hidden">
                {b.image_url ? (
                  <img src={b.image_url} className="w-28 md:w-38 object-contain drop-shadow-2xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6" alt={b.name} loading="lazy" />
                ) : (
                  <span className="text-4xl md:text-6xl">{categoryEmoji(b.category)}</span>
                )}
              </div>
              <div className="mt-3 flex-grow">
                <h3 className="font-bold text-sm md:text-lg leading-tight line-clamp-1">{b.name}</h3>
                <p className="mt-1 text-[10px] md:text-sm text-gray-400 line-clamp-2">{b.description}</p>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="font-black text-xs md:text-base">{b.price_dzd.toLocaleString()} <span className="text-[10px] font-normal">DA</span></span>
              </div>
              <Link to={`/box/${b.id}`} className="mt-3 block text-center w-full py-2 md:py-3 rounded-lg md:rounded-xl bg-black text-white text-[10px] md:text-sm font-bold transition-all hover:bg-yellow-400 hover:text-black active:scale-95 shadow-md">
                {viewBoxLabel}
              </Link>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
