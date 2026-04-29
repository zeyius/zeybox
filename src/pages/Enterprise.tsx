import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

type Box = {
  id: string;
  name: string;
  description: string | null;
  price_dzd: number;
  validity_days: number;
  capacity: number | null;
};

const MIN_DAYS_BEFORE = 7;

export default function Enterprise() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [boxes, setBoxes] = useState<Box[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBox, setSelectedBox] = useState<Box | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [buying, setBuying] = useState(false);

  // Form fields
  const [companyName, setCompanyName] = useState("");
  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [paymentReference, setPaymentReference] = useState("");

  // Min date = today + 7 days
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + MIN_DAYS_BEFORE);
  const minDateStr = minDate.toISOString().split("T")[0];

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("boxes")
        .select("id, name, description, price_dzd, validity_days, capacity")
        .eq("is_active", true)
        .eq("category", "Enterprise")
        .order("price_dzd", { ascending: true });

      if (error) console.error(error);
      setBoxes((data ?? []) as Box[]);
      setLoading(false);
    };
    load();
  }, []);

  const handleBuy = (box: Box) => {
    setSelectedBox(box);
    setCheckoutOpen(true);
  };

  const handleConfirmOrder = async () => {
    if (!buyerEmail || !buyerName || !companyName || !eventDate) {
      alert(t('fill_details'));
      return;
    }

    setBuying(true);

    // Chargily flow
    if (paymentMethod === "EDAHABIA" || paymentMethod === "CIB") {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-chargily-checkout`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              box_id: selectedBox!.id,
              buyer_name: buyerName,
              buyer_email: buyerEmail,
              recipient_name: companyName,
              recipient_email: buyerEmail,
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

    // Cash / BaridiMob flow
    const { error } = await supabase.from("orders").insert([{
      box_id: selectedBox!.id,
      buyer_name: buyerName,
      buyer_email: buyerEmail,
      recipient_name: companyName,
      recipient_email: buyerEmail,
      total_dzd: selectedBox!.price_dzd,
      status: "PENDING",
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

  return (
    <main className="bg-white overflow-x-hidden">

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 py-16 md:py-24">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 text-xs font-bold text-red-600 bg-red-50 px-4 py-2 rounded-full mb-6 uppercase tracking-widest">
            🏢 {t('enterprise_badge')}
          </span>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-tight">
            {t('enterprise_title_1')}<br />
            <span className="text-red-600 italic">{t('enterprise_title_2')}</span>
          </h1>
          <p className="mt-6 text-lg text-gray-500 leading-relaxed">
            {t('enterprise_desc')}
          </p>
        </div>

        {/* How it works */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6">
          {([
            { step: "01", titleKey: "enterprise_step1_title", descKey: "enterprise_step1_desc" },
            { step: "02", titleKey: "enterprise_step2_title", descKey: "enterprise_step2_desc" },
            { step: "03", titleKey: "enterprise_step3_title", descKey: "enterprise_step3_desc" },
          ] as const).map((item) => (
            <div key={item.step} className="rounded-3xl border border-gray-100 p-6 bg-white">
              <span className="text-4xl font-black text-gray-100">{item.step}</span>
              <h3 className="mt-2 text-lg font-black">{t(item.titleKey)}</h3>
              <p className="mt-2 text-sm text-gray-500">{t(item.descKey)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Boxes */}
      <section className="bg-gray-50 py-16 rounded-t-[3rem]">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-black uppercase tracking-tight italic mb-2">
            {t('enterprise_group_boxes')}
          </h2>
          <div className="h-1.5 w-12 bg-yellow-400 rounded-full mb-10" />

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" />
            </div>
          ) : boxes.length === 0 ? (
            // Empty state — boxes coming soon
            <div className="text-center py-20 rounded-[3rem] border-2 border-dashed border-gray-200 bg-white">
              <div className="text-6xl mb-4">🏢</div>
              <h3 className="text-2xl font-black mb-2">
                {t('enterprise_coming_soon')}
              </h3>
              <p className="text-gray-400 max-w-md mx-auto">
                {t('enterprise_coming_desc')}
              </p>
              <a
                href="mailto:hello@zeybox.com"
                className="mt-8 inline-flex px-8 py-4 rounded-2xl bg-black text-white font-black hover:bg-red-600 transition-all"
              >
                {t('enterprise_contact')}
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {boxes.map((box) => (
                <div
                  key={box.id}
                  className="group rounded-[2.5rem] border border-gray-100 bg-white p-8 hover:shadow-xl hover:border-yellow-300 transition-all flex flex-col"
                >
                  {/* Capacity badge */}
                  {box.capacity && (
                    <div className="inline-flex items-center gap-2 bg-black text-white text-xs font-black px-3 py-1.5 rounded-full mb-6 w-fit">
                      👥 {`${box.capacity} ${t('enterprise_people')}`}
                    </div>
                  )}

                  <div className="h-40 rounded-3xl bg-gray-50 flex items-center justify-center mb-6 group-hover:bg-yellow-50 transition-colors">
                    <img
                      src="/images/box.png"
                      className="w-28 drop-shadow-xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6"
                      alt={box.name}
                      loading="lazy"
                    />
                  </div>

                  <h3 className="text-xl font-black leading-tight">{box.name}</h3>
                  <p className="mt-2 text-sm text-gray-500 flex-grow line-clamp-3">{box.description}</p>

                  <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-black">{box.price_dzd.toLocaleString()} <span className="text-sm">DZD</span></p>
                      <p className="text-xs text-gray-400">
                        {`${t('loading').replace('...','').trim() || 'Valid'} ${box.validity_days}d`}
                      </p>
                    </div>
                    <button
                      onClick={() => handleBuy(box)}
                      className="px-6 py-3 rounded-2xl bg-black text-white text-sm font-black hover:bg-red-600 transition-all active:scale-95"
                    >
                      {t('btn_buy')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Checkout Modal */}
      {checkoutOpen && selectedBox && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-xl rounded-[3rem] bg-white p-8 shadow-2xl border border-gray-100 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-2xl font-black uppercase italic">
                  {t('checkout_title')}
                </h3>
                <p className="text-sm text-gray-400 mt-1">{selectedBox.name}</p>
              </div>
              <button
                onClick={() => setCheckoutOpen(false)}
                className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center font-bold hover:bg-gray-100"
              >✕</button>
            </div>

            <div className="space-y-5">
              {/* Company name */}
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-gray-400">
                  {t('enterprise_company')}
                </label>
                <input
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Algérie Corp"
                  className="mt-2 w-full rounded-2xl border border-gray-200 px-5 py-4 outline-none focus:ring-2 focus:ring-red-600/20"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Buyer name */}
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400">
                    {t('enterprise_your_name')}
                  </label>
                  <input
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-gray-200 px-5 py-4 outline-none focus:ring-2 focus:ring-red-600/20"
                  />
                </div>

                {/* Buyer email */}
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400">
                    {t('enterprise_your_email')}
                  </label>
                  <input
                    type="email"
                    value={buyerEmail}
                    onChange={(e) => setBuyerEmail(e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-gray-200 px-5 py-4 outline-none focus:ring-2 focus:ring-red-600/20"
                  />
                </div>
              </div>

              {/* Event date */}
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-gray-400">
                  {t('enterprise_event_date')}
                </label>
                <input
                  type="date"
                  min={minDateStr}
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-gray-200 px-5 py-4 outline-none focus:ring-2 focus:ring-red-600/20"
                />
              </div>

              {/* Payment method */}
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-gray-400">
                  {t('label_payment_method')}
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-gray-200 px-5 py-4 outline-none font-bold"
                >
                  <option value="CASH">{t('payment_cash')}</option>
                  <option value="BARIDPAY_QR">BaridiMob</option>
                  <option value="EDAHABIA">💳 EDAHABIA (بريد الجزائر)</option>
                  <option value="CIB">💳 CIB (carte bancaire)</option>
                </select>
              </div>

              {/* BaridiMob reference */}
              {paymentMethod === "BARIDPAY_QR" && (
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400">
                    {t('label_ref')}
                  </label>
                  <input
                    value={paymentReference}
                    onChange={(e) => setPaymentReference(e.target.value)}
                    placeholder="Ex: 1234567890"
                    className="mt-2 w-full rounded-2xl border border-gray-200 px-5 py-4 outline-none focus:ring-2 focus:ring-red-600/20"
                  />
                </div>
              )}

              {/* Chargily info */}
              {(paymentMethod === "EDAHABIA" || paymentMethod === "CIB") && (
                <div className="rounded-2xl bg-gray-50 px-5 py-4 text-sm text-gray-500">
                  {t('payment_chargily_info')}
                </div>
              )}

              {/* Price summary */}
              <div className="rounded-2xl bg-black text-white px-6 py-5 flex items-center justify-between">
                <span className="font-bold text-gray-400 text-sm">
                  {t('enterprise_total')}
                </span>
                <span className="text-2xl font-black">
                  {selectedBox.price_dzd.toLocaleString()} DZD
                </span>
              </div>

              {/* Confirm */}
              <button
                disabled={buying}
                onClick={handleConfirmOrder}
                className="w-full py-5 rounded-2xl bg-black text-white font-black text-lg hover:bg-red-600 disabled:opacity-50 transition-all"
              >
                {buying ? "..." : t('btn_confirm_order')}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}