import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useTranslation } from "react-i18next";

type Box = {
  id: string;
  name: string;
  description: string | null;
  validity_days: number;
  price_dzd: number;
  category: string;
  image_url: string | null;
  image_url_2: string | null;
  image_url_3: string | null;
};

type Experience = {
  id: string;
  title: string;
  description: string | null;
  city: string | null;
  price_dzd: number;
  partner: { name: string } | null;
};

export default function BoxDetails() {
  const { id } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [box, setBox] = useState<Box | null>(null);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerName, setBuyerName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [paymentReference, setPaymentReference] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      setLoading(true);

      const { data: boxData, error: boxErr } = await supabase
        .from("boxes")
        .select("id,name,description,validity_days,price_dzd,category,image_url,image_url_2,image_url_3")
        .eq("id", id)
        .single();

      if (boxErr) console.error(boxErr);
      setBox((boxData as Box) ?? null);
      setSelectedImage((boxData as Box)?.image_url ?? null);

      const { data: expData, error: expErr } = await supabase
        .from("box_experiences")
        .select(`
          experiences:experience_id (
            id, title, description, city, price_dzd,
            partner:partners ( name )
          ) 
        `)
        .eq("box_id", id);

      if (expErr) console.error(expErr);

      const mapped = (expData ?? [])
        .map((row: any) => row.experiences)
        .filter(Boolean) as Experience[];

      setExperiences(mapped);
      setLoading(false);
    };

    load();
  }, [id]);

  const handleConfirmOrder = async () => {
    if (!buyerEmail || !buyerName) {
      alert(t('fill_details'));
      return;
    }

    setBuying(true);

    // ✅ Chargily → redirect automatique vers la page de paiement
    if (paymentMethod === "EDAHABIA" || paymentMethod === "CIB") {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-chargily-checkout`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              box_id: id,
              buyer_name: buyerName,
              buyer_email: buyerEmail,
              recipient_name: recipientName,
              recipient_email: recipientEmail,
            }),
          }
        );
        const data = await res.json();
        if (data.checkout_url) {
          window.location.href = data.checkout_url;
        } else {
          alert(t('payment_error'));
          setBuying(false);
        }
      } catch (err) {
        console.error(err);
        alert(t('network_error'));
        setBuying(false);
      }
      return;
    }

    // ✅ Cash / BaridiMob → flow manuel existant
    const { error } = await supabase
      .from("orders")
      .insert([{
        box_id: id,
        buyer_name: buyerName,
        buyer_email: buyerEmail,
        recipient_name: recipientName,
        recipient_email: recipientEmail,
        total_dzd: box?.price_dzd,
        status: 'PENDING',
        payment_method: paymentMethod,
        payment_reference: paymentReference,
      }]);

    if (error) {
      console.error(error);
      alert(t('order_error'));
    } else {
      setCheckoutOpen(false);
      alert(t('order_success'));
      navigate("/account");
    }
    setBuying(false);
  };

  if (loading) return <main className="max-w-7xl mx-auto px-4 py-10"><p className="text-gray-600 italic">{t('loading')}</p></main>;
  if (!box) return <main className="max-w-7xl mx-auto px-4 py-10"><p>{t('box_not_found')}</p></main>;

  const mobileImages = [box.image_url, box.image_url_2, box.image_url_3].filter(Boolean) as string[];

  return (
    <main className="max-w-7xl mx-auto px-4 py-10">
      <Link to="/best-sellers" className="text-sm font-bold hover:text-red-600 transition-colors">
        {t('back')}
      </Link>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <section className="lg:col-span-7">
          <div className="rounded-[2.5rem] border border-gray-100 px-8 pb-8 bg-white shadow-sm">
            {/* Mobile swiper (below lg) */}
            <div className="block lg:hidden py-8">
              <div className="relative overflow-hidden rounded-3xl">
                {mobileImages.length > 0 ? (
                  <img
                    src={mobileImages[currentIndex]}
                    alt={box.name}
                    className="w-full max-h-[400px] object-contain"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex items-center justify-center py-8">
                    <span className="text-9xl">
                      {box.category === "Wellness" ? "💆" :
                      box.category === "Adventure" ? "🏔️" :
                      box.category === "Restaurant" || box.category === "Restaurants" ? "🍽️" :
                      box.category === "Weekend" ? "🏨" :
                      box.category === "Event" ? "🎉" :
                      box.category === "Enterprise" ? "🏢" : "🎁"}
                    </span>
                  </div>
                )}
                {mobileImages.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentIndex((currentIndex - 1 + mobileImages.length) % mobileImages.length)}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center"
                    >
                      ‹
                    </button>
                    <button
                      onClick={() => setCurrentIndex((currentIndex + 1) % mobileImages.length)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center"
                    >
                      ›
                    </button>
                  </>
                )}
              </div>
              {mobileImages.length > 1 && (
                <div className="flex justify-center gap-2 mt-3">
                  {mobileImages.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentIndex(i)}
                      className={`w-2 h-2 rounded-full ${currentIndex === i ? "bg-red-600" : "bg-gray-300"}`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Desktop gallery (lg and above) */}
            <div className="hidden lg:flex gap-4 py-12">
              <div className="flex flex-col gap-3">
                {[box.image_url, box.image_url_2, box.image_url_3].map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(img)}
                    className={`w-20 h-20 rounded-2xl overflow-hidden border-2 cursor-pointer flex items-center justify-center bg-gray-50 ${selectedImage === img ? "border-red-600" : "border-transparent"}`}
                  >
                    {img ? (
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl">
                        {box.category === "Wellness" ? "💆" :
                        box.category === "Adventure" ? "🏔️" :
                        box.category === "Restaurant" || box.category === "Restaurants" ? "🍽️" :
                        box.category === "Weekend" ? "🏨" :
                        box.category === "Event" ? "🎉" :
                        box.category === "Enterprise" ? "🏢" : "🎁"}
                      </span>
                    )}
                  </button>
                ))}
              </div>
              <div className="flex-1 flex items-center justify-center">
                {selectedImage ? (
                  <img
                    src={selectedImage}
                    alt={box.name}
                    className="rounded-3xl max-h-[400px] object-contain"
                    loading="lazy"
                  />
                ) : (
                  <span className="text-9xl">
                    {box.category === "Wellness" ? "💆" :
                    box.category === "Adventure" ? "🏔️" :
                    box.category === "Restaurant" || box.category === "Restaurants" ? "🍽️" :
                    box.category === "Weekend" ? "🏨" :
                    box.category === "Event" ? "🎉" :
                    box.category === "Enterprise" ? "🏢" : "🎁"}
                  </span>
                )}
              </div>
            </div>
            <h1 className="mt-8 text-4xl font-black">{box.name}</h1>
            <p className="mt-4 text-gray-500 leading-relaxed text-lg">{box.description}</p>
          </div>

          <div className="mt-12">
            <h2 className="text-2xl font-black uppercase tracking-tight">{t('included_experiences')}</h2>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              {experiences.map((e) => (
                <div key={e.id} className="rounded-3xl border border-gray-100 p-6 hover:shadow-md transition-all bg-white">
                  <div className="text-xs font-bold text-red-600 uppercase tracking-widest mb-2">
                    {e.partner?.name} • {e.city}
                  </div>
                  <div className="font-bold text-lg">{e.title}</div>
                  <p className="mt-2 text-sm text-gray-500 line-clamp-3">{e.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <aside className="lg:col-span-5">
          <div className="sticky top-24 rounded-[2.5rem] border-2 border-black p-8 bg-white shadow-2xl">
            <div className="text-sm font-bold text-gray-400 uppercase tracking-widest">
              {t('starting_from')}
            </div>
            <div className="mt-2 text-4xl font-black">{box.price_dzd.toLocaleString()} DZD</div>

            <button
              onClick={() => setCheckoutOpen(true)}
              className="mt-8 w-full py-5 rounded-2xl bg-black text-white font-black text-lg hover:bg-red-600 transition-all shadow-xl active:scale-95"
            >
              {t('btn_buy')}
            </button>
          </div>
        </aside>
      </div>

      {/* Checkout Modal */}
      {checkoutOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-xl rounded-[3rem] bg-white p-8 shadow-2xl border border-gray-100 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black uppercase italic">{t('checkout_title')}</h3>
              <button onClick={() => setCheckoutOpen(false)} className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center font-bold">✕</button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400">{t('label_buyer_email')}</label>
                  <input value={buyerEmail} onChange={(e) => setBuyerEmail(e.target.value)} className="mt-2 w-full rounded-2xl border border-gray-200 px-5 py-4 outline-none focus:ring-2 focus:ring-red-600/20" />
                </div>
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400">{t('label_buyer_name')}</label>
                  <input value={buyerName} onChange={(e) => setBuyerName(e.target.value)} className="mt-2 w-full rounded-2xl border border-gray-200 px-5 py-4 outline-none focus:ring-2 focus:ring-red-600/20" />
                </div>

                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400">{t('label_recipient_name')}</label>
                  <input value={recipientName} onChange={(e) => setRecipientName(e.target.value)} className="mt-2 w-full rounded-2xl border border-gray-200 px-5 py-4 outline-none focus:ring-2 focus:ring-red-600/20" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400">
                    {t('label_recipient_email')}
                  </label>
                  <input value={recipientEmail} onChange={(e) => setRecipientEmail(e.target.value)} className="mt-2 w-full rounded-2xl border border-gray-200 px-5 py-4 outline-none focus:ring-2 focus:ring-red-600/20"/>
                </div>
              </div>

              {/* Payment Select */}
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-gray-400">{t('label_payment_method')}</label>
                <select
                  className="mt-2 w-full rounded-2xl border border-gray-200 px-5 py-4 outline-none font-bold"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option value="CASH">{t('payment_cash')}</option>
                  <option value="BARIDPAY_QR">BaridiMob</option>
                  <option value="EDAHABIA">💳 EDAHABIA (بريد الجزائر)</option>
                  <option value="CIB">💳 CIB (carte bancaire)</option>
                </select>
              </div>

              {/* Référence manuelle uniquement pour BaridiMob */}
              {paymentMethod === "BARIDPAY_QR" && (
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400">{t('label_ref')}</label>
                  <input
                    value={paymentReference}
                    onChange={(e) => setPaymentReference(e.target.value)}
                    placeholder="Ex: 1234567890"
                    className="mt-2 w-full rounded-2xl border border-gray-200 px-5 py-4 outline-none focus:ring-2 focus:ring-red-600/20"
                  />
                </div>
              )}

              {/* Info Chargily */}
              {(paymentMethod === "EDAHABIA" || paymentMethod === "CIB") && (
                <div className="rounded-2xl bg-gray-50 px-5 py-4 text-sm text-gray-500">
                  {t('payment_chargily_info')}
                </div>
              )}

              {/* Confirm Button */}
              <button
                disabled={buying}
                className="w-full py-5 rounded-2xl bg-black text-white font-black text-lg hover:bg-red-600 disabled:opacity-50 transition-all"
                onClick={handleConfirmOrder}
              >
                {buying ? '...' : t('btn_confirm_order')}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}