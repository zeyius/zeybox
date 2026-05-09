import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useTranslation } from "react-i18next";

type Partner = {
  id: string;
  name: string;
  city: string | null;
  slug: string | null;
  description: string | null;
  category: string | null;
  cover_image_url: string | null;
};

type Box = {
  id: string;
  name: string;
  name_ar?: string;
  description: string | null;
  description_ar?: string;
  validity_days: number;
  price_dzd: number;
  category: string;
  image_url: string | null;
};

const CAT_EMOJI: Record<string, string> = {
  Wellness: "💆", Restaurants: "🍽️", Adventure: "🏔️",
  Weekend: "🏨", Event: "🎉", Travel: "✈️",
};

function BoxEmoji({ category }: { category: string }) {
  return <span className="text-4xl md:text-6xl">{CAT_EMOJI[category] ?? "🎁"}</span>;
}

export default function PartnerPage() {
  const { slug } = useParams<{ slug: string }>();
  const { t, i18n } = useTranslation();
  const [partner, setPartner] = useState<Partner | null>(null);
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    const load = async () => {
      // 1. Fetch partner
      console.log('[PartnerPage] slug:', slug);
      const { data: partnerData, error: partnerError } = await supabase
        .from("partners")
        .select("*")
        .eq("slug", slug)
        .single();
      console.log('[PartnerPage] partner fetch result:', partnerData, partnerError);

      if (!partnerData) {
        setLoading(false);
        return;
      }
      setPartner(partnerData as Partner);

      // 2. Fetch experience IDs for this partner
      const { data: expData } = await supabase
        .from("experiences")
        .select("id")
        .eq("partner_id", (partnerData as Partner).id);

      const expIds = (expData ?? []).map((e: { id: string }) => e.id);
      if (expIds.length === 0) { setLoading(false); return; }

      // 3. Fetch box IDs from the join table
      const { data: beData } = await supabase
        .from("box_experiences")
        .select("box_id")
        .in("experience_id", expIds);

      const boxIds = [...new Set((beData ?? []).map((r: { box_id: string }) => r.box_id))];
      if (boxIds.length === 0) { setLoading(false); return; }

      // 4. Fetch active boxes
      const { data: boxData } = await supabase
        .from("boxes")
        .select("id, name, name_ar, description, description_ar, validity_days, price_dzd, category, image_url")
        .in("id", boxIds)
        .eq("is_active", true);

      setBoxes((boxData ?? []) as Box[]);
      setLoading(false);
    };

    load();
  }, [slug]);

  const lang = i18n.language;

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  if (!partner) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-4 bg-white">
        <p className="text-gray-500 text-sm">
          {lang === 'ar' ? "المؤسسة غير موجودة." : lang === 'fr' ? "Établissement introuvable." : "Venue not found."}
        </p>
        <Link to="/" className="text-xs font-black underline underline-offset-2">
          {lang === 'ar' ? "العودة للرئيسية" : lang === 'fr' ? "← Accueil" : "← Home"}
        </Link>
      </main>
    );
  }

  return (
    <main className="bg-white min-h-screen">
      {/* Hero banner */}
      <div className="w-full h-64 md:h-80 relative overflow-hidden bg-gray-900">
        {partner.cover_image_url ? (
          <>
            <img
              src={partner.cover_image_url}
              alt={partner.name}
              className="w-full h-full object-cover opacity-70"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
            <span className="text-8xl opacity-20">{CAT_EMOJI[partner.category ?? ""] ?? "🏢"}</span>
          </div>
        )}

        <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-10">
          <div className="max-w-7xl mx-auto w-full">
            <Link
              to="/"
              className="inline-block text-white/60 text-xs font-black hover:text-white transition-colors mb-4"
            >
              {lang === 'ar' ? "→ عودة" : "← " + (lang === 'fr' ? "Retour" : "Back")}
            </Link>
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight drop-shadow-xl">
              {partner.name}
            </h1>
            {partner.city && (
              <p className="text-white/60 text-sm mt-1">{partner.city}</p>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10 md:py-14">
        {/* Description */}
        {partner.description && (
          <p className="text-gray-600 text-base leading-relaxed max-w-2xl mb-12">
            {partner.description}
          </p>
        )}

        {/* Boxes */}
        {boxes.length > 0 ? (
          <>
            <div className="mb-8">
              <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter italic">
                {lang === 'ar' ? "الصناديق المتاحة" : lang === 'fr' ? "Coffrets disponibles" : "Available Boxes"}
              </h2>
              <div className="h-1.5 w-12 bg-yellow-400 mt-2 rounded-full" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
              {boxes.map((b) => (
                <div
                  key={b.id}
                  className="group relative rounded-2xl md:rounded-3xl border border-gray-100 p-3 md:p-5 transition-all duration-300 hover:shadow-2xl hover:border-yellow-400 bg-white flex flex-col"
                >
                  <div className="absolute top-2 right-2 md:top-4 md:right-4 z-10 bg-red-600 text-white text-[8px] md:text-[10px] font-black px-2 md:px-3 py-1 rounded-full uppercase tracking-tighter md:tracking-widest shadow-lg shadow-red-200">
                    {t('label_new')}
                  </div>

                  <div className="aspect-square rounded-xl md:rounded-2xl bg-gray-50 flex items-center justify-center transition-colors group-hover:bg-yellow-50 overflow-hidden">
                    {b.image_url ? (
                      <img
                        src={b.image_url}
                        className="w-28 md:w-38 object-contain drop-shadow-2xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6"
                        alt={b.name}
                        loading="lazy"
                      />
                    ) : (
                      <BoxEmoji category={b.category} />
                    )}
                  </div>

                  <div className="mt-3 flex-grow">
                    <h3 className="font-bold text-sm md:text-lg leading-tight group-hover:text-red-600 transition-colors line-clamp-1">
                      {i18n.language === 'ar' ? (b.name_ar || b.name) : b.name}
                    </h3>
                    <p className="mt-1 text-[10px] md:text-sm text-gray-400 line-clamp-1 md:line-clamp-2">
                      {i18n.language === 'ar' ? (b.description_ar || b.description) : b.description}
                    </p>
                  </div>

                  <div className="mt-3 flex flex-col md:flex-row md:items-center justify-between gap-1">
                    <span className="text-[10px] md:text-xs text-gray-500 flex items-center gap-1 font-medium">
                      <span className="text-yellow-500">★</span>
                      {b.validity_days}d
                    </span>
                    <span className="font-black text-xs md:text-base text-black">
                      {b.price_dzd.toLocaleString()} <span className="text-[10px]">DA</span>
                    </span>
                  </div>

                  <Link
                    to={`/box/${b.id}`}
                    className="mt-3 block text-center w-full py-2 md:py-3 rounded-lg md:rounded-xl bg-black text-white text-[10px] md:text-sm font-bold transition-all hover:bg-red-600 active:scale-95 shadow-md"
                  >
                    {t('btn_view_box')}
                  </Link>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="text-gray-400 text-sm">
            {lang === 'ar' ? "لا توجد صناديق متاحة حالياً." : lang === 'fr' ? "Aucun coffret disponible pour le moment." : "No boxes available yet."}
          </p>
        )}
      </div>
    </main>
  );
}
