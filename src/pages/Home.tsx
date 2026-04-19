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

// 1. Update the ORBIT_ITEMS to include the new visual icon
const ORBIT_ITEMS = [
  { image: "/images/orbit4.png", emoji: null, labelKey: "Weekend", color: "bg-blue-50" },
  { image: "/images/orbit4.png", emoji: null, labelKey: "Restaurants", color: "bg-red-50" },
  { image: "/images/orbit4.png", emoji: null, labelKey: "Wellness", color: "white" },
  { image: "/images/orbit4.png", emoji: null, labelKey: "Adventure", color: "bg-orange-50" },
  { image: "/images/orbit4.png", emoji: null, labelKey: "Travel", color: "bg-yellow-50" },
  { image: "/images/orbit4.png", emoji: null, labelKey: "Event", color: "bg-purple-50" }, // Added Event
];
// 2. Add 'Event' to your filtering array
const CATEGORIES = ["Wellness", "Restaurants", "Adventure", "Weekend", "Travel", "Event"];


const HERO_SLIDES = [
  { image: "/images/hero1.png", titleEn: "Perfect Gift", titleAr: "هدية مثالية" },
  { image: "/images/hero2.png", titleEn: "Memories", titleAr: "ذكريات" },
  { image: "/images/hero3.png", titleEn: "For You", titleAr: "لك" },
  { image: "/images/hero4.png", titleEn: "Algeria", titleAr: "الجزائر" }
];

export default function Home() {
  const { t, i18n } = useTranslation();
  const [boxes, setBoxes] = useState<Box[]>([]);
  const explorerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadBoxes = async () => {
      const { data } = await supabase
        .from("boxes")
        // FIXED: Added 'tier' to the selection
        .select("id, name, price_dzd, description, validity_days, category, tier, image_url") 
        .eq("is_active", true);
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
                    {i18n.language === 'en' ? slide.titleEn : slide.titleAr}
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
              {i18n.language === 'en' ? (
                <>Gift memories, <br /><span className="text-red-600 italic">not just things.</span></>
              ) : (
                <>أهدِ ذكريات، <br /><span className="text-red-600 italic">ليس مجرد أشياء.</span></>
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
                {t('btn_explore')} <span className={`text-xl ${i18n.language === 'ar' ? 'rotate-180' : ''}`}>↓</span>
              </button>
            </div>
          </div>

          {/* 3. 3D SLIDER */}
          <div className="relative h-[350px] md:h-[500px] w-full flex items-center justify-center [perspective:1000px]">
            <div className="absolute w-[250px] md:w-[500px] h-[250px] md:h-[500px] bg-red-500/5 rounded-full blur-[80px] md:blur-[140px]" />
            <Swiper
              key={i18n.language}
              dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}
              effect={'coverflow'}
              grabCursor={true}
              centeredSlides={true}
              slidesPerView={'auto'}
              loop={true}
              autoplay={{ delay: 3000, disableOnInteraction: false }}
              coverflowEffect={{
                rotate: 35,
                stretch: -20,
                depth: 300,
                modifier: 1,
                slideShadows: false,
              }}
              modules={[EffectCoverflow, Autoplay]}
              className="w-full py-12 !overflow-visible"
            >
              {ORBIT_ITEMS.map((item) => (
                <SwiperSlide key={item.labelKey} style={{ width: '220px' }}>
                <div className="w-full h-64 md:h-80 flex flex-col items-center justify-center">
                     <img 
                      src={item.image ?? undefined} 
                      alt={item.labelKey} 
                      className="w-36 md:w-44 object-contain mb-4 md:mb-6 animate-float drop-shadow-lg" 
                    />
                    <span className="text-[10px] md:text-sm font-black uppercase text-gray-700 tracking-[0.2em] text-center px-4">
                      {i18n.language === 'en' ? item.labelKey : (
                        item.labelKey === "Weekend" ? "عطلة" :
                        item.labelKey === "Restaurants" ? "مطاعم" :
                        item.labelKey === "Wellness" ? "استرخاء" : 
                        item.labelKey === "Travel" ? "سفر" : "مغامرة"
                      )}
                    </span>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </section>

      {/* 4. COLLECTIONS - CATEGORIZED GROUPING */}
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
                <div className="flex items-center gap-3 mb-6">
                  <span className="bg-red-600 text-white font-black text-[10px] px-3 py-1 rounded-md italic">
                    {categoryBoxes[0].tier} {/* Shows SILVER/GOLD/DIAMOND badge */}
                  </span>
                  <h3 className="text-xl md:text-2xl font-black text-gray-900 uppercase">
                    {i18n.language === 'en' ? cat : (
                        cat === "Wellness" ? "عناية واسترخاء" : 
                        cat === "Restaurants" ? "مطاعم فاخرة" : 
                        cat === "Adventure" ? "مغامرات" : 
                        cat === "Weekend" ? "عطلة نهاية الأسبوع" : 
                        cat === "Travel" ? "سفر ورحلات" :
                        "فعاليات ومناسبات" // Arabic for Event
                    )}
                  </h3>
                </div>
                
                <div className="flex gap-4 md:gap-8 overflow-x-auto pb-6 no-scrollbar snap-x -mx-4 px-4">
                  {categoryBoxes.map((b) => (
                    <Link to={`/box/${b.id}`} key={b.id} className="min-w-[260px] md:min-w-[350px] snap-center group">
                      <div className="bg-white rounded-[2.5rem] border border-gray-100 p-6 md:p-8 transition-all duration-500 hover:shadow-xl hover:border-yellow-200 relative">
                        <div className="h-40 md:h-52 rounded-[2rem] bg-gray-50 flex items-center justify-center mb-6">
                          {b.image_url ? (
                            <img src={b.image_url} className="w-24 md:w-32 object-contain transition-transform duration-700 group-hover:scale-110 group-hover:rotate-6 drop-shadow-lg" alt={b.name} loading="lazy" />
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
    </main>
  );
}