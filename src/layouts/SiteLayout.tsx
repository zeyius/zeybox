import { Link, Outlet } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useTranslation } from "react-i18next";

export default function SiteLayout() {
  const { t, i18n } = useTranslation();
  const [session, setSession] = useState<any>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const isAr = i18n.language === "ar";

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const LANGUAGES = [
    { code: "en", flag: "🇬🇧", label: "English" },
    { code: "fr", flag: "🇫🇷", label: "Français" },
    { code: "ar", flag: "🇩🇿", label: "العربية" },
  ];

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col">
      <div className="w-full bg-black text-white text-sm">
        <div className="max-w-7xl mx-auto px-4 py-2 text-center font-medium">
          {t('footer_text')}
        </div>
      </div>

      <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">

          <button
            className="lg:hidden flex flex-col justify-center gap-[5px] w-8 h-8 shrink-0"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            <span className={`block w-6 h-0.5 bg-black transition-all duration-300 origin-center ${menuOpen ? 'rotate-45 translate-y-[7px]' : ''}`} />
            <span className={`block w-6 h-0.5 bg-black transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-6 h-0.5 bg-black transition-all duration-300 origin-center ${menuOpen ? '-rotate-45 -translate-y-[7px]' : ''}`} />
          </button>

          <Link to="/" className="flex items-center gap-2" onClick={closeMenu}>
            <img src="/images/Logo.png" alt="ZEYBOX" className="h-14 w-auto" />
          </Link>

          <nav className="hidden lg:flex items-center gap-6 text-sm font-bold uppercase tracking-widest ms-6">
            <Link className="text-gray-500 hover:text-red-600 transition-colors" to="/best-sellers">
              {t('nav_best_sellers')}
            </Link>
            <Link className="text-gray-500 hover:text-red-600 transition-colors" to="/gift-ideas">
              {t('nav_gift_ideas')}
            </Link>
            <Link to="/enterprise" className="text-gray-500 hover:text-red-600 transition-colors">
              {isAr ? "للمؤسسات" : "Enterprise"}
            </Link>
          </nav>

          <div className="flex items-center gap-3 ms-auto">
            <div className="relative" ref={langRef}>
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-100 hover:bg-gray-50 transition-all text-sm font-bold"
              >
                <span className="text-base">🌐</span>
                <span className="hidden sm:inline">
                  {LANGUAGES.find(l => l.code === i18n.language)?.label ?? "English"}
                </span>
                <span className="text-[10px] text-gray-400">▾</span>
              </button>
              {langOpen && (
                <div className="absolute top-full mt-2 right-0 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden z-50 min-w-[140px]">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => { i18n.changeLanguage(lang.code); setLangOpen(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold hover:bg-gray-50 transition-colors ${
                        i18n.language === lang.code ? "text-red-600 bg-red-50" : "text-gray-700"
                      }`}
                    >
                      <span>{lang.flag}</span>
                      <span>{lang.label}</span>
                      {i18n.language === lang.code && <span className="ms-auto">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Link to="/voucher" className="hidden md:inline-flex px-4 py-2 rounded-xl border border-gray-200 text-sm font-bold hover:bg-gray-50 transition-all">
              {t('nav_voucher')}
            </Link>

            {session ? (
              <Link to="/account" className="px-5 py-2 rounded-xl bg-black text-white text-sm font-bold hover:bg-red-600 transition-all">
                {isAr ? 'حسابي' : 'Account'}
              </Link>
            ) : (
              <Link to="/login" className="px-5 py-2 rounded-xl bg-black text-white text-sm font-bold hover:bg-red-600 transition-all">
                {isAr ? 'دخول' : 'Login'}
              </Link>
            )}
          </div>
        </div>
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-[60] bg-black/50" onClick={closeMenu}>
          <div className="absolute top-0 left-0 h-full w-72 bg-white shadow-2xl flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <span className="text-xs font-black uppercase tracking-widest text-gray-400">Menu</span>
              <button onClick={closeMenu} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-black">✕</button>
            </div>

            <nav className="flex flex-col px-4 py-6 gap-1">
              <Link to="/best-sellers" onClick={closeMenu} className="flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-gray-50 transition-all">
                🏆 {t('nav_best_sellers')}
              </Link>
              <Link to="/gift-ideas" onClick={closeMenu} className="flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-gray-50 transition-all">
                🎁 {t('nav_gift_ideas')}
              </Link>
              <Link to="/voucher" onClick={closeMenu} className="flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-gray-50 transition-all">
                🎟️ {t('nav_voucher')}
              </Link>
              <Link to="/enterprise" onClick={closeMenu} className="flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm uppercase tracking-widest bg-red-50 text-red-600 hover:bg-red-100 transition-all">
                🏢 {isAr ? "للمؤسسات" : "Enterprise"}
              </Link>
            </nav>

            <div className="mx-6 border-t border-gray-100" />

            <div className="flex flex-col px-4 py-6 gap-3 mt-auto">
              <div className="flex gap-2">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => i18n.changeLanguage(lang.code)}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-2xl border text-sm font-bold transition-all ${
                      i18n.language === lang.code
                        ? "bg-black text-white border-black"
                        : "border-gray-100 hover:bg-gray-50"
                    }`}
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.label}</span>
                  </button>
                ))}
              </div>
              {session ? (
                <Link to="/account" onClick={closeMenu} className="px-5 py-3 rounded-2xl bg-black text-white text-sm font-bold text-center hover:bg-red-600 transition-all">
                  {isAr ? 'حسابي' : 'My Account'}
                </Link>
              ) : (
                <Link to="/login" onClick={closeMenu} className="px-5 py-3 rounded-2xl bg-black text-white text-sm font-bold text-center hover:bg-red-600 transition-all">
                  {isAr ? 'دخول' : 'Login'}
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex-1">
        <Outlet />
      </div>

      <footer className="bg-black text-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">

            {/* Logo + desc */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <img src="/images/Logo.png" alt="ZEYBOX" className="h-12 w-auto" />
              </div>
              <p className="text-gray-400 text-xs max-w-xs leading-relaxed">
                {isAr
                  ? "أول منصة هدايا تجارب في الجزائر. اشترِ، أرسل، استمتع."
                  : "Algeria's first experience gift platform. Buy, send, enjoy."}
              </p>
              <a href="https://www.instagram.com/zeybox.dz" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors">
                📸 @zeybox.dz 
              </a>
              <a href="https://www.tiktok.com/@zeybox.dz" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors">
                🎵 @zeybox.dz
              </a>
            </div>
            

            {/* Links */}
            <div className="flex flex-col gap-2 text-sm">
              <p className="text-gray-500 text-xs font-black uppercase tracking-widest mb-1">
                {isAr ? "روابط" : "Links"}
              </p>
              <Link to="/best-sellers" className="text-gray-300 hover:text-white transition-colors">{t('nav_best_sellers')}</Link>
              <Link to="/gift-ideas" className="text-gray-300 hover:text-white transition-colors">{t('nav_gift_ideas')}</Link>
              <Link to="/enterprise" className="text-gray-300 hover:text-white transition-colors">{isAr ? "للمؤسسات" : "Enterprise"}</Link>
              <Link to="/voucher" className="text-gray-300 hover:text-white transition-colors">{t('nav_voucher')}</Link>
            </div>

            {/* Contact */}
            <div className="flex flex-col gap-2 text-sm">
              <p className="text-gray-500 text-xs font-black uppercase tracking-widest mb-1">
                {isAr ? "تواصل معنا" : "Contact"}
              </p>
              <a href="tel:0780259880" className="text-gray-300 hover:text-white transition-colors">
                📞 0780 25 98 80
              </a>
              <a href="mailto:contact@zeybox.online" className="text-gray-300 hover:text-white transition-colors">
                ✉️ contact@zeybox.online
              </a>
              <p className="text-gray-400 text-xs">
                {isAr ? "أوقات العمل: 9ص — 6م" : "Available: 9AM — 6PM"}
              </p>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-white/10 mt-8 pt-6 flex flex-col md:flex-row items-center justify-between gap-2">
            <p className="text-gray-500 text-xs">
              © {new Date().getFullYear()} ZEYBOX. All rights reserved.
            </p>
            <p className="text-gray-500 text-xs">
              {isAr ? "صُنع في الجزائر 🇩🇿" : "Made in Algeria 🇩🇿"}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}