import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

type RedemptionInfo = {
  id: string;
  redeem_code: string;
  qr_token: string;
  status: string;
  customer_name: string;
  experience_title: string;
  partner_name: string;
  city: string;
  amount_dzd: number;
};

export default function PartnerScan() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [info, setInfo] = useState<RedemptionInfo | null>(null);
  const [error, setError] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  const handleScan = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setError("");
    setInfo(null);

    const cleanCode = code.trim().toUpperCase();

    try {
      const { data, error: fetchError } = await supabase
        .from("voucher_redemptions")
        .select(`
          id,
          redeem_code,
          qr_token,
          status,
          experiences:experience_id (
            title,
            city,
            partners ( name )
          ),
          vouchers:voucher_id (
            orders ( recipient_name, buyer_name, total_dzd )
          )
        `)
        .eq("redeem_code", cleanCode)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (!data) {
        setError("Code not found. Please check and try again.");
        return;
      }

      if (data.status === "REDEEMED") {
        setError("This code has already been used.");
        return;
      }

      const experience = data.experiences as any;
      const partner = Array.isArray(experience?.partners)
        ? experience.partners[0]
        : experience?.partners;
      const voucher = data.vouchers as any;
      const order = Array.isArray(voucher?.orders)
        ? voucher.orders[0]
        : voucher?.orders;

      setInfo({
        id: data.id,
        redeem_code: data.redeem_code,
        qr_token: data.qr_token,
        status: data.status,
        customer_name: order?.recipient_name || order?.buyer_name || "Guest",
        experience_title: experience?.title ?? "",
        partner_name: partner?.name ?? "",
        city: experience?.city ?? "",
        amount_dzd: Math.round((order?.total_dzd ?? 0) * 0.8),
      });
    } catch (err: any) {
      console.error(err);
      setError("Connection error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!info) return;
    setConfirming(true);

    try {
      const { error: updateError } = await supabase
        .from("voucher_redemptions")
        .update({ status: "REDEEMED", redeemed_at: new Date().toISOString() })
        .eq("id", info.id);

      if (updateError) throw updateError;
      setConfirmed(true);
    } catch (err: any) {
      console.error(err);
      setError("Failed to confirm. Please try again.");
    } finally {
      setConfirming(false);
    }
  };

  if (confirmed) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-4xl font-black text-white uppercase italic mb-2">Confirmed!</h1>
          <p className="text-gray-400 text-lg mb-2">{info?.customer_name}</p>
          <p className="text-yellow-400 font-bold text-xl">{info?.amount_dzd.toLocaleString()} DZD</p>
          <button
            onClick={() => { setConfirmed(false); setInfo(null); setCode(""); }}
            className="mt-10 px-8 py-4 rounded-2xl bg-white text-black font-black uppercase tracking-widest hover:bg-yellow-400 transition-all"
          >
            Scan Another
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-white/10 px-6 py-5 flex items-center gap-3">
        <div className="h-8 w-8 rounded-lg bg-red-600" />
        <span className="text-lg font-black tracking-tighter">ZEYBOX</span>
        <span className="text-gray-500 text-sm font-medium ms-2">Partner Portal</span>
      </div>

      <div className="max-w-md mx-auto px-4 py-12">
        <h1 className="text-3xl font-black uppercase italic mb-2">Scan Voucher</h1>
        <p className="text-gray-400 mb-8">Enter the customer's redemption code to verify and confirm.</p>

        {/* Input */}
        <div className="space-y-3">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleScan()}
            placeholder="RDM-XXXXXXXX"
            className="w-full rounded-2xl bg-white/5 border border-white/10 px-5 py-4 font-mono text-xl text-white outline-none focus:ring-2 focus:ring-yellow-400 placeholder:text-gray-600 transition-all"
          />
          <button
            onClick={handleScan}
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-white text-black font-black uppercase tracking-widest hover:bg-yellow-400 transition-all disabled:opacity-30"
          >
            {loading ? "Verifying..." : "Verify Code"}
          </button>
        </div>

        {error && (
          <div className="mt-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 font-bold text-sm text-center">
            {error}
          </div>
        )}

        {/* Redemption info card */}
        {info && (
          <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 overflow-hidden">
            {/* Status badge */}
            <div className="bg-green-500/10 border-b border-white/10 px-6 py-3 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-green-400 text-sm font-bold uppercase tracking-widest">Valid Voucher</span>
            </div>

            <div className="p-6 space-y-5">
              {/* Customer */}
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-widest mb-1">Customer</p>
                <p className="text-2xl font-black">{info.customer_name}</p>
              </div>

              {/* Experience */}
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-widest mb-1">Experience</p>
                <p className="text-lg font-bold">{info.experience_title}</p>
                <p className="text-gray-400 text-sm">{info.city}</p>
              </div>

              {/* Amount */}
              <div className="rounded-2xl bg-yellow-400/10 border border-yellow-400/20 px-5 py-4">
                <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">Amount to charge</p>
                <p className="text-3xl font-black text-yellow-400">{info.amount_dzd.toLocaleString()} <span className="text-lg">DZD</span></p>
              </div>

              {/* Code */}
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-widest mb-1">Code</p>
                <p className="font-mono text-sm text-gray-300">{info.redeem_code}</p>
              </div>

              {/* Confirm button */}
              <button
                onClick={handleConfirm}
                disabled={confirming}
                className="w-full py-5 rounded-2xl bg-green-500 text-white font-black text-lg uppercase tracking-widest hover:bg-green-400 transition-all disabled:opacity-30 mt-2"
              >
                {confirming ? "Confirming..." : "✓ Confirm Service Rendered"}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}