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

const ORBIT_ITEMS = [
  { image: "/images/orbit4.png", emoji: null, labelKey: "Weekend", color: "bg-blue-50" },
  { image: "/images/orbit4.png", emoji: null, labelKey: "Restaurants", color: "bg-red-50" },
  { image: "/images/orbit4.png", emoji: null, labelKey: "Wellness", color: "white" },
  { image: "/images/orbit4.png", emoji: null, labelKey: "Adventure", color: "bg-orange-50" },
  { image: "/images/orbit4.png", emoji: null, labelKey: "Travel", color: "bg-yellow-50" },
  { image: "/images/orbit4.png", emoji: null, labelKey: "Event", color: "bg-purple-50" }, 
];

const CATEGORIES = ["Wellness", "Restaurants", "Adventure", "Weekend", "Travel", "Event"];

const HERO_SLIDES = [
  { image: "/images/hero1.webp", titleEn: "Perfect Gift", titleAr: "هدية مثالية",},
  { image: "/images/hero2.webp", titleEn: "Memories", titleAr: "ذكريات" },
  { image: "/images/hero3.webp", titleEn: "For You", titleAr: "لك" },
  { image: "/images/hero4.webp", titleEn: "Algeria", titleAr: "الجزائر" }
];

const HOW_IT_WORKS = [
  {
    step: "01",
    emoji: "🎁",
    en: { title: "Choose a box", desc: "Browse our curated experience boxes by category and budget." },
    ar: { title: "اختر صندوقك", desc: "تصفح صناديق التجارب حسب الفئة والميزانية." },
  },
  {
    step: "02",
    emoji: "📩",
    en: { title: "Receive your voucher", desc: "Pay securely and instantly receive a digital voucher by email or phone number." },
    ar: { title: "استلم القسيمة", desc: "ادفع بأمان واستلم قسيمتك الرقمية فوراً عبر البريد الإلكتروني أو رقم الهاتف." },
  },
  {
    step: "03",
    emoji: "✨",
    en: { title: "Live the experience", desc: "Choose your spot, book your date, and enjoy your unique experience." },
    ar: { title: "عش التجربة", desc: "اختر مكانك، احجز يومك، واستمتع بتجربة لا تُنسى." },
  },
];

const PARTNERS = [
  { name: "Lynatel Palace", emoji: "🏨", city: "Ouargla" },
  { name: "Desert Safari Tours", emoji: "🏜️", city: "Ouargla" },
  { name: "Hotel El-Moudjahid", emoji: "🏩", city: "Ouargla" },
  { name: "Le Petit Oasis", emoji: "🌿", city: "Ouargla" },
  { name: "Hotel Zaid", emoji: "🏪", city: "Ouargla" },
  { name: "Spa & Hammam Nour", emoji: "💆", city: "Ouargla" },
  { name: "Ijdagh Tour Sahara", emoji: "🐪", city: "Ouargla" },
  { name: "Restaurant El Waha", emoji: "🍽️", city: "Ouargla" },
];

export default function Home() {
  const { t, i18n } = useTranslation();
  const [boxes, setBoxes] = useState<Box[]>([]);
  const explorerRef = useRef<HTMLDivElement>(null);
  const isAr = i18n.language === "ar";

  useEffect(() => {
    const loadBoxes = async () => {
      const { data } = await supabase
        .from("boxes")
        .select("id, name, price_dzd, description, validity_days, category, tier, image_url")
        .eq("is_active", true)
        .limit(20);
      setBoxes((data as Box[]) || []);
    };
    loadBoxes();
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
                    {isAr ? slide.titleAr : slide.titleEn}
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
              {isAr ? (
                <>أهدِ ذكريات، <br /><span className="text-red-600 italic">ليس مجرد أشياء.</span></>
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
          <div className="relative h-[350px] md:h-[500px] w-full flex items-center justify-center [perspective:1000px]">
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
              {ORBIT_ITEMS.map((item) => (
                <SwiperSlide key={item.labelKey} style={{ width: '220px' }}>
                  <Link to={`/best-sellers?category=${item.labelKey}`} className="w-full h-64 md:h-80 flex flex-col items-center justify-center cursor-pointer">
                   <img
                    src={item.image ?? undefined}
                    alt={item.labelKey}
                    className="w-36 md:w-44 object-contain mb-4 md:mb-6 animate-float drop-shadow-lg"
                  />
                    <span className="text-[10px] md:text-sm font-black uppercase text-gray-700 tracking-[0.2em] text-center px-4">
                      {isAr ? (
                        item.labelKey === "Weekend" ? "عطلة" :
                        item.labelKey === "Restaurants" ? "مطاعم" :
                        item.labelKey === "Wellness" ? "استرخاء" :
                        item.labelKey === "Travel" ? "سفر" :
                        item.labelKey === "Event" ? "فعاليات" : "مغامرة"
                      ) : item.labelKey}
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
            {isAr ? "كيف يعمل" : "How it works"}
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
              <h3 className="text-sm font-black">{isAr ? item.ar.title : item.en.title}</h3>
              <p className="text-gray-500 text-xs leading-relaxed mt-0.5">{isAr ? item.ar.desc : item.en.desc}</p>
            </div>
          </div>
        ))}
      </div>
      </section>

      {/* 4. COLLECTIONS */}
      <section ref={explorerRef} className="bg-gray-50 py-16 md:py-24 rounded-t-[3rem] md:rounded-t-[4rem] shadow-inner">
        <div className="max-w-7xl mx-auto px-4">
          <div className="mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-black uppercase tracking-tighter italic">
              {t('section_collections')}
            </h2>
            <div className="h-1.5 w-16 bg-yellow-400 mt-2 rounded-full" />
          </div>

          {CATEGORIES.map((cat) => {
            const categoryBoxes = boxes.filter(b => b.category === cat);
            if (categoryBoxes.length === 0) return null;

            return (
              <div key={cat} className="mb-16 last:mb-0">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl md:text-2xl font-black text-gray-900 uppercase">
                    {isAr ? (
                      cat === "Wellness" ? "عناية واسترخاء" :
                      cat === "Restaurants" ? "مطاعم فاخرة" :
                      cat === "Adventure" ? "مغامرات" :
                      cat === "Weekend" ? "عطلة نهاية الأسبوع" :
                      cat === "Travel" ? "سفر ورحلات" : "فعاليات ومناسبات"
                    ) : cat}
                  </h3>
                  <Link
                    to={`/best-sellers?category=${cat}`}
                    className="text-xs font-black uppercase tracking-widest text-gray-400 hover:text-red-600 transition-colors"
                  >
                    {isAr ? "عرض الكل ←" : "See all →"}
                  </Link>
                </div>

                <div className="flex gap-4 md:gap-8 overflow-x-auto pb-6 no-scrollbar snap-x -mx-4 px-4">
                  {categoryBoxes.map((b) => (
                    <Link to={`/box/${b.id}`} key={b.id} className="min-w-[260px] md:min-w-[350px] snap-center group">
                      <div className="bg-white rounded-[2.5rem] border border-gray-100 p-6 md:p-8 transition-all duration-500 hover:shadow-xl hover:border-yellow-200 relative">
                        <div className="h-40 md:h-52 rounded-[2rem] bg-gray-50 flex items-center justify-center mb-6">
                          {b.image_url ? (
                            <img src={b.image_url} className="w-24 md:w-36 object-contain transition-transform duration-700 group-hover:scale-110 group-hover:rotate-6 drop-shadow-lg" alt={b.name} loading="lazy" />
                          ) : (
                            <span className="text-5xl md:text-6xl">
                              {b.category === "Wellness" ? "💆" :
                               b.category === "Adventure" ? "🏔️" :
                               b.category === "Restaurants" ? "🍽️" :
                               b.category === "Weekend" ? "🏨" :
                               b.category === "Event" ? "🎉" : "🎁"}
                            </span>
                          )}
                        </div>
                        <h4 className="font-bold text-lg md:text-xl text-black truncate">{b.name}</h4>
                        <div className="mt-6 flex items-center justify-between border-t border-gray-50 pt-4">
                          <span className="text-xl font-black text-black">
                            {b.price_dzd.toLocaleString()} <span className="text-xs">DA</span>
                          </span>
                          <span className="bg-yellow-400 text-black text-[9px] font-black px-4 py-2 rounded-full uppercase tracking-widest group-hover:bg-red-600 group-hover:text-white transition-colors">
                            {t('btn_view_box')}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* PARTNERS SECTION */}
<section className="py-16 md:py-24 bg-white">
  <div className="max-w-7xl mx-auto px-4">
    <div className="mb-10">
      <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter italic">
        {isAr ? "شركاؤنا" : "Our Partners"}
      </h2>
      <div className="h-1.5 w-16 bg-yellow-400 mt-2 rounded-full" />
      <p className="mt-4 text-gray-400 text-sm">
        {isAr ? "أماكن مختارة بعناية في ولاية ورقلة" : "Carefully selected venues across Ouargla"}
      </p>
    </div>

      <div className="overflow-hidden">
      <div className="flex gap-4 animate-scroll-left">
        {[...PARTNERS, ...PARTNERS].map((p, i) => (
          <div key={i} className="flex-none flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3">
            <span className="text-2xl">{p.emoji}</span>
            <p className="font-black text-sm whitespace-nowrap">{p.name}</p>
          </div>
        ))}
      </div>
    </div>

          {/* Stats bar */}
          <div className="mt-12 rounded-[2.5rem] bg-black text-white p-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-3xl md:text-4xl font-black text-yellow-400">X+</p>
              <p className="text-xs text-gray-400 uppercase tracking-widest mt-1">{isAr ? "شريك" : "Partners"}</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-black text-yellow-400">X+</p>
              <p className="text-xs text-gray-400 uppercase tracking-widest mt-1">{isAr ? "تجربة" : "Experiences"}</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-black text-yellow-400">90</p>
              <p className="text-xs text-gray-400 uppercase tracking-widest mt-1">{isAr ? "يوم صلاحية" : "Days validity"}</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-black text-yellow-400">100%</p>
              <p className="text-xs text-gray-400 uppercase tracking-widest mt-1">{isAr ? "جزائري" : "Algerian"}</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}