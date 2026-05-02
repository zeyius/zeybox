

import { useEffect, useState, useRef } from "react";
import { supabase } from "../lib/supabaseClient";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

// Swiper Imports
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, EffectFade, EffectCoverflow } from 'swiper/modules';

// Import All Necessary Swiper Styles
import 'swiper/css';
import 'swiper/css/bundle';

type Box = {
  id: string;
  name: string;
  price_dzd: number;
  description: string | null;
  validity_days: number;
  category: string;
  tier: string;
  image_url: string | null;
};


const CATEGORY_CARDS = [
  { key: "Wellness",    image: "/images/hero1.webp" },
  { key: "Restaurants", image: "/images/hero2.webp" },
  { key: "Adventure",   image: "/images/hero3.webp" },
  { key: "Weekend",     image: "/images/hero4.webp" },
  { key: "Event",       image: "/images/hero4.webp" },
  { key: "Travel",      image: "/images/hero4.webp" },
];

const HERO_SLIDES = [
  { image: "/images/hero1.webp", titleEn: "Perfect Gift", titleFr: "Cadeau Parfait", titleAr: "هدية مثالية" },
  { image: "/images/hero2.webp", titleEn: "Memories", titleFr: "Souvenirs", titleAr: "ذكريات" },
  { image: "/images/hero3.webp", titleEn: "For You", titleFr: "Pour Vous", titleAr: "لك" },
  { image: "/images/hero4.webp", titleEn: "Algeria", titleFr: "Algérie", titleAr: "الجزائر" },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    emoji: "🎁",
    en: { title: "Choose a box", desc: "Browse our curated experience boxes by category and budget." },
    fr: { title: "Choisissez un coffret", desc: "Parcourez nos coffrets d'expériences par catégorie et budget." },
    ar: { title: "اختر صندوقك", desc: "تصفح صناديق التجارب حسب الفئة والميزانية." },
  },
  {
    step: "02",
    emoji: "📩",
    en: { title: "Receive your voucher", desc: "Pay securely and instantly receive a digital voucher by email or phone number." },
    fr: { title: "Recevez votre bon", desc: "Payez en toute sécurité et recevez instantanément un bon numérique par e-mail ou numéro de téléphone." },
    ar: { title: "استلم القسيمة", desc: "ادفع بأمان واستلم قسيمتك الرقمية فوراً عبر البريد الإلكتروني أو رقم الهاتف." },
  },
  {
    step: "03",
    emoji: "✨",
    en: { title: "Live the experience", desc: "Choose your spot, book your date, and enjoy your unique experience." },
    fr: { title: "Vivez l'expérience", desc: "Choisissez votre lieu, réservez votre date et profitez de votre expérience unique." },
    ar: { title: "عش التجربة", desc: "اختر مكانك، احجز يومك، واستمتع بتجربة لا تُنسى." },
  },
];


export default function Home() {
  const { t, i18n } = useTranslation();
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [partners, setPartners] = useState<{id: string, name: string, slug: string, cover_image_url: string | null, logo_url: string | null, category: string, city: string | null}[]>([]);
  const explorerRef = useRef<HTMLDivElement>(null);
  const isAr = i18n.language === "ar";

  useEffect(() => {
    const loadData = async () => {
      const [{ data: boxData }, { data: partnerData }] = await Promise.all([
        supabase
          .from("boxes")
          .select("id, name, price_dzd, description, validity_days, category, tier, image_url")
          .eq("is_active", true)
          .limit(20),
        supabase
          .from("partners")
          .select("id, name, slug, description, category, city, cover_image_url, logo_url")
          .eq("is_active", true),
      ]);
      setBoxes((boxData as Box[]) || []);
      setPartners(partnerData ?? []);
    };
    loadData();
  }, []);

  const scrollToExplorer = () => {
    explorerRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main className="bg-white overflow-x-hidden">
      {/* 1. TOP IMAGE CAROUSEL */}
      <section className="w-full h-[350px] md:h-[550px] overflow-hidden">
        <Swiper
          modules={[Autoplay, Pagination, EffectFade]}
          effect="fade"
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          loop={true}
          className="h-full w-full"
        >
          {HERO_SLIDES.map((slide, index) => (
            <SwiperSlide key={index}>
              <div className="relative w-full h-full">
                <div className="absolute inset-0 bg-black/30 z-10" />
                <img src={slide.image} alt="Zeybox" className="w-full h-full object-cover" loading="lazy" />
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-6">
                  <h2 className="text-white text-3xl md:text-6xl font-black uppercase italic tracking-tighter drop-shadow-2xl">
                    {i18n.language === 'ar' ? slide.titleAr : i18n.language === 'fr' ? slide.titleFr : slide.titleEn}
                  </h2>
                  <div className="mt-4 h-1 w-16 md:w-24 bg-yellow-400 rounded-full shadow-lg animate-pulse" />
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* 2. HERO SECTION */}
      <section className="max-w-7xl mx-auto px-4 pt-12 pb-16 md:pb-24">
        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-10 md:gap-16 items-center">
          <div className="z-10 text-center lg:text-start">
            <p className="inline-flex items-center gap-2 text-[10px] md:text-sm font-bold text-red-600 bg-red-50 px-4 py-2 rounded-full mb-6 italic animate-bounce">
              {t('hero_badge')}
            </p>
            <h1 className="text-4xl md:text-7xl font-black leading-tight tracking-tight text-black">
              {i18n.language === 'ar' ? (
                <>أهدِ ذكريات، <br /><span className="text-red-600 italic">ليس مجرد أشياء.</span></>
              ) : i18n.language === 'fr' ? (
                <>Offrez des souvenirs, <br /><span className="text-red-600 italic">pas juste des choses.</span></>
              ) : (
                <>Gift memories, <br /><span className="text-red-600 italic">not just things.</span></>
              )}
            </h1>
            <p className="mt-6 text-base md:text-xl text-gray-600 max-w-lg mx-auto lg:mx-0 leading-relaxed font-medium">
              {t('hero_desc')}
            </p>
            <div className="mt-8 flex justify-center lg:justify-start">
              <button
                onClick={scrollToExplorer}
                className="w-full sm:w-auto px-10 py-4 bg-black text-white rounded-2xl font-bold hover:bg-red-600 transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2"
              >
                {t('btn_explore')} <span className={`text-xl ${isAr ? 'rotate-180' : ''}`}>↓</span>
              </button>
            </div>
          </div>

          {/* 3D SLIDER */}
          <div className="relative h-[420px] md:h-[450px] w-full flex items-center justify-center [perspective:1000px]">
            <div className="absolute w-[250px] md:w-[500px] h-[250px] md:h-[500px] bg-red-500/5 rounded-full blur-[80px] md:blur-[140px]" />
            <Swiper
              key={i18n.language}
              dir={isAr ? 'rtl' : 'ltr'}
              effect={'coverflow'}
              grabCursor={true}
              centeredSlides={true}
              slidesPerView={'auto'}
              loop={true}
              autoplay={{ delay: 3000, disableOnInteraction: false }}
              coverflowEffect={{ rotate: 35, stretch: -20, depth: 300, modifier: 1, slideShadows: false }}
              modules={[EffectCoverflow, Autoplay]}
              className="w-full py-12 !overflow-visible"
            >
              {boxes.slice(0, 6).map((box) => (
                <SwiperSlide key={box.id} style={{ width: '220px' }}>
                  <Link to={`/box/${box.id}`} className="w-full h-80 md:h-72 flex flex-col items-center justify-center cursor-pointer">
                    <span className="text-[9px] font-black uppercase tracking-widest bg-red-600 text-white px-3 py-1 rounded-full mb-3">
                      {i18n.language === 'ar' ? "الأكثر مبيعاً" : i18n.language === 'fr' ? "MEILLEURE VENTE" : "BEST SELLER"}
                    </span>
                    {box.image_url ? (
                      <img
                        src={box.image_url}
                        alt={box.name}
                        className="w-36 md:w-40 object-contain mb-4 md:mb-6 animate-float drop-shadow-lg"
                        loading="lazy"
                      />
                    ) : (
                      <span className="text-7xl md:text-8xl mb-4 md:mb-6 animate-float drop-shadow-lg">
                        {box.category === "Restaurants" ? "🍽️" :
                         box.category === "Wellness" ? "💆" :
                         box.category === "Adventure" ? "🏔️" :
                         box.category === "Weekend" ? "🏨" :
                         box.category === "Event" ? "🎉" : "🎁"}
                      </span>
                    )}
                    <span className="text-sm md:text-base font-black uppercase text-gray-700 tracking-[0.2em] text-center px-4 line-clamp-1 w-full">
                      {box.name}
                    </span>
                  </Link>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="max-w-7xl mx-auto px-4 pb-20">
        <div className="mb-10">
          <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter italic">
            {i18n.language === 'ar' ? "كيف يعمل" : i18n.language === 'fr' ? "Comment ça marche" : "How it works"}
          </h2>
          <div className="h-1.5 w-16 bg-yellow-400 mt-2 rounded-full" />
        </div>
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {HOW_IT_WORKS.map((item) => (
          <div key={item.step} className="rounded-2xl border border-gray-100 p-4 bg-white hover:shadow-md transition-all group flex items-center gap-4">
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-2xl font-black text-gray-100">{item.step}</span>
              <span className="text-2xl">{item.emoji}</span>
            </div>
            <div>
              <h3 className="text-sm font-black">{i18n.language === 'ar' ? item.ar.title : i18n.language === 'fr' ? item.fr.title : item.en.title}</h3>
              <p className="text-gray-500 text-xs leading-relaxed mt-0.5">{i18n.language === 'ar' ? item.ar.desc : i18n.language === 'fr' ? item.fr.desc : item.en.desc}</p>
            </div>
          </div>
        ))}
      </div>
      </section>

      {/* 4. CATEGORIES */}
      <section ref={explorerRef} className="bg-gray-50 py-16 md:py-24 rounded-t-[3rem] md:rounded-t-[4rem] shadow-inner">
        <div className="max-w-7xl mx-auto px-4">
          <div className="mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-black uppercase tracking-tighter italic">
              {t('section_collections')}
            </h2>
            <div className="h-1.5 w-16 bg-yellow-400 mt-2 rounded-full" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {CATEGORY_CARDS.map((cat) => {
              const count = boxes.filter(b => b.category === cat.key).length;
              const label =
                i18n.language === 'ar' ? (
                  cat.key === "Wellness" ? "عناية واسترخاء" :
                  cat.key === "Restaurants" ? "مطاعم فاخرة" :
                  cat.key === "Adventure" ? "مغامرات" :
                  cat.key === "Weekend" ? "عطلة نهاية الأسبوع" :
                  cat.key === "Travel" ? "سفر ورحلات" : "فعاليات ومناسبات"
                ) : i18n.language === 'fr' ? (
                  cat.key === "Wellness" ? "Bien-être" :
                  cat.key === "Restaurants" ? "Restaurants" :
                  cat.key === "Adventure" ? "Aventure" :
                  cat.key === "Weekend" ? "Week-end" :
                  cat.key === "Travel" ? "Voyage" : "Événements"
                ) : cat.key;

              return (
                <Link
                  key={cat.key}
                  to={`/best-sellers?category=${cat.key}`}
                  className="relative group overflow-hidden rounded-3xl aspect-[4/3] cursor-pointer"
                >
                  {cat.image ? (
                    <img
                      src={cat.image}
                      alt={cat.key}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      loading="lazy"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black" />
                  )}
                  <div className="absolute inset-0 bg-black/50 group-hover:bg-black/40 transition-colors duration-300" />
                  <div className="relative z-10 h-full flex flex-col justify-end p-5 md:p-8">
                    <h3 className="text-white text-xl md:text-3xl font-black uppercase tracking-tight leading-tight drop-shadow-lg">
                      {label}
                    </h3>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-white/70 text-xs md:text-sm font-semibold">
                        {count} {i18n.language === 'ar' ? 'صندوق' : i18n.language === 'fr' ? 'coffrets' : 'boxes'}
                      </span>
                      <span className={`text-white text-xl font-bold transition-transform duration-300 group-hover:translate-x-1 ${isAr ? '-scale-x-100 inline-block' : ''}`}>
                        →
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. PARTNER CARDS */}
      {partners.length > 0 && (
        <section className="py-16 md:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="mb-10">
              <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter italic">
                {i18n.language === 'ar' ? "أين تحدث التجربة" : i18n.language === 'fr' ? "Là où ça se passe" : "Where it happens"}
              </h2>
              <div className="h-1.5 w-16 bg-yellow-400 mt-2 rounded-full" />
            </div>
            <div className="flex gap-6 overflow-x-auto pb-6 no-scrollbar snap-x -mx-4 px-4">
              {partners.map((p) => (
                <Link
                  key={p.id}
                  to={`/partners/${p.slug}`}
                  className="min-w-[200px] snap-center rounded-3xl border border-gray-100 bg-white p-6 flex flex-col items-center hover:shadow-lg hover:border-yellow-200 transition-all duration-300"
                >
                  <div className="w-24 h-24 rounded-full border-4 border-red-600 overflow-hidden flex items-center justify-center bg-gray-50">
                    {p.logo_url ? (
                      <img src={p.logo_url} alt={p.name} className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <span className="text-3xl">
                        {p.category === "Restaurants" ? "🍽️" :
                         p.category === "Wellness" ? "💆" :
                         p.category === "Adventure" ? "🏔️" :
                         p.category === "Weekend" ? "🏨" : "🏢"}
                      </span>
                    )}
                  </div>
                  <p className="font-black text-lg mt-4 text-center line-clamp-1">{p.name}</p>
                  {p.city && <p className="text-xs text-gray-400 text-center mt-1">{p.city}</p>}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* PARTNERS SECTION */}
<section className="py-16 md:py-24 bg-white">
  <div className="max-w-7xl mx-auto px-4">
    <div className="mb-10">
      <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter italic">
        {i18n.language === 'ar' ? "شركاؤنا" : i18n.language === 'fr' ? "Nos Partenaires" : "Our Partners"}
      </h2>
      <div className="h-1.5 w-16 bg-yellow-400 mt-2 rounded-full" />
      <p className="mt-4 text-gray-400 text-sm">
        {i18n.language === 'ar' ? "أماكن مختارة بعناية في ولاية ورقلة" : i18n.language === 'fr' ? "Lieux soigneusement sélectionnés à Ouargla" : "Carefully selected venues across Ouargla"}
      </p>
    </div>

      <div className="overflow-hidden" dir="ltr">
        {partners.length > 0 && (
          <div key={partners.length} className="flex gap-4 animate-scroll-left">
            {[...partners, ...partners].map((p, i) => (
              <div key={i} className="flex-none flex items-center bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3">
                <p className="font-black text-sm whitespace-nowrap">{p.name}</p>
              </div>
            ))}
          </div>
        )}
      </div>

          {/* Stats bar */}
          <div className="mt-12 rounded-[2.5rem] bg-black text-white p-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-3xl md:text-4xl font-black text-yellow-400">X+</p>
              <p className="text-xs text-gray-400 uppercase tracking-widest mt-1">{i18n.language === 'ar' ? "شريك" : i18n.language === 'fr' ? "Partenaires" : "Partners"}</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-black text-yellow-400">X+</p>
              <p className="text-xs text-gray-400 uppercase tracking-widest mt-1">{i18n.language === 'ar' ? "تجربة" : i18n.language === 'fr' ? "Expériences" : "Experiences"}</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-black text-yellow-400">90</p>
              <p className="text-xs text-gray-400 uppercase tracking-widest mt-1">{i18n.language === 'ar' ? "يوم صلاحية" : i18n.language === 'fr' ? "Jours validité" : "Days validity"}</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-black text-yellow-400">100%</p>
              <p className="text-xs text-gray-400 uppercase tracking-widest mt-1">{i18n.language === 'ar' ? "جزائري" : i18n.language === 'fr' ? "Algérien" : "Algerian"}</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}