import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

type Box = {
  id: string;
  name: string;
  description: string | null;
  validity_days: number;
  price_dzd: number;
  category: string;
  image_url: string | null;
};

const OCCASIONS = [
  { en: "All", ar: "الكل" },
  { en: "For her", ar: "لها" },
  { en: "For him", ar: "له" },
  { en: "Couple", ar: "للمتزوجين" },
  { en: "Birthday", ar: "عيد ميلاد" },
  { en: "Parents", ar: "للوالدين" },
];

const BUDGETS = [
  { label: "< 5000 DZD", value: "u5000", min: 0, max: 4999 },
  { label: "5000–10000", value: "5k10k", min: 5000, max: 10000 },
  { label: "10000–20000", value: "10k20k", min: 10000, max: 20000 },
  { label: "20000+", value: "20k", min: 20000, max: Infinity },
];

export default function GiftIdeas() {
  const { t, i18n } = useTranslation();
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState("All");
  const [selectedBudget, setSelectedBudget] = useState("All");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("boxes")
        .select("id,name,description,validity_days,price_dzd,category,image_url")
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      if (error) console.error(error);
      setBoxes((data ?? []) as Box[]);
      setLoading(false);
    };
    load();
  }, []);

  const filteredBoxes = boxes.filter((b) => {
    if (selectedBudget === "All") return true;
    const budget = BUDGETS.find((bu) => bu.value === selectedBudget);
    return budget ? b.price_dzd >= budget.min && b.price_dzd <= budget.max : true;
  });

  return (
    <main className="max-w-7xl mx-auto px-4 py-6 md:py-10">
      <h1 className="text-2xl md:text-3xl font-black tracking-tight text-gray-900">
        {t('nav_gift_ideas')}
      </h1>

      <div className="mt-6 flex overflow-x-auto pb-2 gap-2 no-scrollbar -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap">
        {OCCASIONS.map((o) => (
          <button
            key={o.en}
            onClick={() => setSelected(o.en)}
            className={`flex-none px-5 py-2 rounded-full border text-sm font-medium transition-all whitespace-nowrap active:scale-95 ${
              selected === o.en
                ? "bg-black text-white border-black"
                : "border-gray-200 hover:bg-red-50 hover:border-red-200 hover:text-red-600"
            }`}
          >
            {i18n.language === 'en' ? o.en : o.ar}
          </button>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <aside className="hidden lg:block lg:col-span-3">
          <div className="sticky top-24 space-y-4">
            <div className="rounded-3xl border border-gray-100 p-6 bg-gray-50/50">
              <div className="font-bold text-gray-900">{t('filter_title')}</div>
              <div className="mt-4 space-y-3 text-sm text-gray-600">
                <div className="font-semibold text-gray-400 uppercase text-[10px] tracking-widest">{t('filter_budget')}</div>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="radio" name="gift-budget" value="All" checked={selectedBudget === "All"} onChange={() => setSelectedBudget("All")} className="w-4 h-4 text-red-600 focus:ring-red-500" />
                  <span className="group-hover:text-black transition-colors">{t('filter_all_prices')}</span>
                </label>
                {BUDGETS.map((b) => (
                  <label key={b.value} className="flex items-center gap-3 cursor-pointer group">
                    <input type="radio" name="gift-budget" value={b.value} checked={selectedBudget === b.value} onChange={() => setSelectedBudget(b.value)} className="w-4 h-4 text-red-600 focus:ring-red-500" />
                    <span className="group-hover:text-black transition-colors">{b.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </aside>

        <section className="lg:col-span-9">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filteredBoxes.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-400 font-bold text-lg">
                {t('no_boxes_filter')}
              </p>
              <button onClick={() => setSelectedBudget("All")} className="mt-4 px-6 py-2 rounded-full bg-black text-white text-sm font-bold hover:bg-red-600 transition-all">
                {t('reset_filters')}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-6">
              {filteredBoxes.map((b) => (
                <div key={b.id} className="group rounded-2xl md:rounded-3xl border border-gray-100 p-3 md:p-5 transition-all duration-300 hover:shadow-2xl hover:border-yellow-400 bg-white flex flex-col">
                  <div className="aspect-square rounded-xl md:rounded-2xl bg-gray-50 flex items-center justify-center transition-colors group-hover:bg-yellow-50 overflow-hidden">
                    {b.image_url ? (
                      <img src={b.image_url} className="w-28 md:w-38 object-contain drop-shadow-2xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6" alt={b.name} loading="lazy" />
                    ) : (
                      <span className="text-4xl md:text-6xl">
                        {b.category === "Wellness" ? "💆" :
                         b.category === "Adventure" ? "🏔️" :
                         b.category === "Restaurant" || b.category === "Restaurants" ? "🍽️" :
                         b.category === "Weekend" ? "🏨" :
                         b.category === "Event" ? "🎉" : "🎁"}
                      </span>
                    )}
                  </div>
                  <div className="mt-3 flex-grow">
                    <h3 className="font-bold text-sm md:text-lg leading-tight group-hover:text-red-600 transition-colors line-clamp-1">{b.name}</h3>
                    <p className="mt-1 text-[10px] md:text-sm text-gray-400 line-clamp-1 md:line-clamp-2">{b.description}</p>
                  </div>
                  <div className="mt-3 flex flex-col md:flex-row md:items-center justify-between gap-1">
                    <span className="text-[10px] md:text-xs text-gray-500 flex items-center gap-1 font-medium">
                      <span className="text-yellow-500">★</span>{b.validity_days}d
                    </span>
                    <span className="font-black text-xs md:text-base text-black">{b.price_dzd.toLocaleString()} <span className="text-[10px]">DA</span></span>
                  </div>
                  <Link to={`/box/${b.id}`} className="mt-3 block text-center w-full py-2 md:py-3 rounded-lg md:rounded-xl bg-black text-white text-[10px] md:text-sm font-bold transition-all hover:bg-red-600 active:scale-95 shadow-md">
                    {t('btn_view_box')}
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}