import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Voucher() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [redeeming, setRedeeming] = useState(false);
  const [voucherData, setVoucherData] = useState<any>(null);
  const [experiences, setExperiences] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleVerify = async () => {
    if (!code) return;
    setLoading(true);
    setError("");
    setVoucherData(null);
    setExperiences([]);

    const cleanCode = code.trim().toUpperCase().replace(/[–—]/g, '-');

   const { data, error } = await supabase
    .from("vouchers")
    .select("id, voucher_code, status, orders ( recipient_name )")
    .eq("voucher_code", cleanCode)
    .maybeSingle();

    console.log("data:", data);
    console.log("error:", error);


    try {
      // ✅ NEW: voucher -> box (tier + category)
      const { data: voucher, error: vError } = await supabase
        .from("vouchers")
        .select(
          `
          id,
          voucher_code,
          status,
          orders ( recipient_name ),
          boxes:box_id ( tier, category )
        `
        )
        .eq("voucher_code", cleanCode)
        .maybeSingle();

      if (vError) throw vError;
      if (!voucher) {
        setError("Invalid code. Please check your voucher.");
        return;
      }
      if (voucher.status === "consumed") {
        setError("This voucher has already been redeemed.");
        return;
      }

      // safety: ensure voucher has a box (your DB enforces NOT NULL now)
      if (!voucher.boxes?.tier || !voucher.boxes?.category) {
        setError("Voucher is missing box data. Please contact support.");
        return;
      }

      setVoucherData(voucher);

      // ✅ NEW: fetch experiences by tier+category (NO prices selected)
      const { data: expData, error: eError } = await supabase
        .from("experiences")
        .select(`id, title, description, city, partners ( name )`)
        .eq("tier", voucher.boxes.tier)
        .eq("category", voucher.boxes.category)
        .eq("is_active", true);

      if (eError) throw eError;
      setExperiences(expData || []);
    } catch (err: any) {
      console.error(err);
      setError("Connection error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // simple generator for partner-scan codes
  const genToken = () => {
    // not cryptographically perfect, but fine for demo/prototype
    return Math.random().toString(36).slice(2, 10).toUpperCase() + "-" + Date.now().toString(36).toUpperCase();
  };

  const handleRedeem = async (experience: any) => {
    const confirmChoice = window.confirm(
      `Confirm your choice: ${experience.title}? This cannot be undone.`
    );
    if (!confirmChoice) return;

    setRedeeming(true);
    try {
      // 1) Create redemption row (this is what you will use to email QR+code)
      const redeem_code = "RDM-" + genToken();
      const qr_token = "QR-" + genToken();

      const { error: redErr } = await supabase
        .from("voucher_redemptions")
        .insert([
          {
            voucher_id: voucherData.id,
            experience_id: experience.id,
            redeem_code,
            qr_token,
            status: "ISSUED",
          },
        ]);

      if (redErr) throw redErr;

      // 2) Mark voucher as consumed (prevents choosing again)
      const { error: updateError } = await supabase
        .from("vouchers")
        .update({ status: "consumed" })
        .eq("id", voucherData.id);

      if (updateError) throw updateError;

      setSuccess(true);
    } catch (err) {
      console.error(err);
      alert("Error redeeming voucher. Please contact support.");
    } finally {
      setRedeeming(false);
    }
  };

  if (success) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl animate-bounce">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-10 w-10"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={4}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h1 className="text-4xl font-black uppercase italic">CONGRATS!</h1>
        <p className="text-gray-500 mt-4 text-lg">
          Your experience is booked. We've sent the confirmation details to your email.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-10 px-8 py-4 bg-black text-white rounded-2xl font-black uppercase tracking-widest"
        >
          Finish
        </button>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-14">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-black italic uppercase tracking-tighter">
          ZEYBOX
        </h1>
        <p className="mt-2 text-gray-500 font-medium tracking-wide">
          REDEMPTION PORTAL
        </p>
      </div>

      <div className="bg-white rounded-[40px] border border-gray-100 p-8 shadow-sm">
        {!voucherData ? (
          <div className="max-w-md mx-auto py-10">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
              Enter Voucher Code
            </label>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4 outline-none focus:ring-2 focus:ring-black font-mono text-xl transition-all"
              placeholder="ZBX-XXXXXXXX"
            />
            <button
              onClick={handleVerify}
              disabled={loading}
              className="mt-6 w-full rounded-2xl bg-black text-white py-5 font-black uppercase tracking-widest hover:scale-[1.02] transition-all disabled:opacity-30"
            >
              {loading ? "VERIFYING..." : "ACCESS EXPERIENCES"}
            </button>
            {error && (
              <div className="mt-6 p-4 rounded-xl bg-red-50 text-red-600 text-center font-bold text-sm">
                {error}
              </div>
            )}
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row justify-between items-center border-b border-gray-50 pb-8 mb-8 gap-4">
              <div className="text-center md:text-left">
                <h2 className="text-3xl font-black uppercase italic">
                  Welcome, {voucherData.orders?.recipient_name || "Guest"} 🎁
                </h2>

                {/* ✅ NEW: show tier/category from box, not voucher */}
                <div className="flex gap-2 mt-2">
                  <span className="bg-black text-white text-[10px] font-black px-3 py-1 rounded-md uppercase tracking-widest">
                    {voucherData.boxes?.tier}
                  </span>
                  <span className="bg-yellow-400 text-black text-[10px] font-black px-3 py-1 rounded-md uppercase tracking-widest">
                    {voucherData.boxes?.category}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {experiences.length > 0 ? (
                experiences.map((exp) => (
                  <div
                    key={exp.id}
                    className="group flex flex-col justify-between border-2 border-gray-50 rounded-[32px] p-6 hover:border-black transition-all bg-white hover:shadow-xl"
                  >
                    <div>
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                        {exp.partners?.name} • {exp.city}
                      </span>
                      <h4 className="text-2xl font-black mt-1 uppercase leading-tight group-hover:italic transition-all">
                        {exp.title}
                      </h4>
                      <p className="text-gray-500 text-sm mt-3 leading-relaxed">
                        {exp.description}
                      </p>
                    </div>

                    <button
                      onClick={() => handleRedeem(exp)}
                      disabled={redeeming}
                      className="mt-8 w-full py-4 rounded-2xl bg-gray-900 text-white text-xs font-black uppercase tracking-widest hover:bg-black transition-all disabled:bg-gray-200"
                    >
                      {redeeming ? "REDEEMING..." : "SELECT THIS GIFT"}
                    </button>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-20 bg-gray-50 rounded-[40px] border-2 border-dashed border-gray-200">
                  <p className="text-gray-400 font-black uppercase tracking-widest">
                    No matching experiences found for your voucher.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
} 
