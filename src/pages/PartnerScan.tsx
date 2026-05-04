import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

type ExperienceOption = {
  id: string;
  title: string;
  description?: string;
};

type RedemptionInfo = {
  id: string;
  redeem_code: string;
  status: string;
  customer_name: string;
  experience_title: string;
  partner_name: string;
  city: string;
  amount_dzd: number;
  voucher_id: string;
  max_uses: number | null;
  uses_count: number;
  qr_token: string;
  experiences: ExperienceOption[];
  selected_experience_id: string | null;
  flow: "redeem_code" | "qr_token";
};

type HistoryItem = {
  redeem_code: string;
  status: string;
  redeemed_at: string | null;
  customer_name: string;
  experience_title: string;
  amount_dzd: number;
};

const genToken = () => Math.random().toString(36).slice(2, 10).toUpperCase();

export default function PartnerScan() {
  const navigate = useNavigate();
  const [partnerName, setPartnerName] = useState("");
  const [partnerId, setPartnerId] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [info, setInfo] = useState<RedemptionInfo | null>(null);
  const [error, setError] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // QR Scanner
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef<any>(null);
  const scannerDivRef = useRef<HTMLDivElement>(null);

  // Auth check
  useEffect(() => {
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/partner/login"); return; }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role, partner_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (profile?.role !== "PARTNER" || !profile?.partner_id) {
        await supabase.auth.signOut();
        navigate("/partner/login");
        return;
      }

      setPartnerId(profile.partner_id);

      const { data: partner } = await supabase
        .from("partners")
        .select("name")
        .eq("id", profile.partner_id)
        .maybeSingle();

      setPartnerName(partner?.name ?? "Partenaire");
      setAuthChecked(true);
    };
    check();
  }, [navigate]);

  const loadHistory = async () => {
    if (!partnerId) return;
    setHistoryLoading(true);
    const { data } = await supabase
      .from("voucher_redemptions")
      .select(`
        redeem_code, status, redeemed_at,
        experiences:experience_id ( title ),
        vouchers:voucher_id ( orders ( recipient_name, buyer_name, total_dzd ) )
      `)
      .order("redeemed_at", { ascending: false })
      .limit(50);

    const mapped = (data ?? []).map((r: any) => {
      const order = Array.isArray(r.vouchers?.orders) ? r.vouchers.orders[0] : r.vouchers?.orders;
      return {
        redeem_code: r.redeem_code,
        status: r.status,
        redeemed_at: r.redeemed_at,
        customer_name: order?.recipient_name || order?.buyer_name || "Guest",
        experience_title: r.experiences?.title ?? "",
        amount_dzd: order?.total_dzd ?? 0,
      };
    });
    setHistory(mapped);
    setHistoryLoading(false);
  };

  const startQRScanner = async () => {
    try {
      const { Html5Qrcode } = await import("https://esm.sh/html5-qrcode@2.3.8" as any);
      setScanning(true);

      await new Promise(resolve => setTimeout(resolve, 300));

      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText: string) => {
          scanner.stop();
          setScanning(false);
          handleScan(decodedText);
        },
        () => {}
      );
    } catch (err) {
      console.error(err);
      setScanning(false);
      setError("Impossible d'accéder à la caméra. Entrez le code manuellement.");
    }
  };

  const stopQRScanner = async () => {
    if (scannerRef.current) {
      try { await scannerRef.current.stop(); } catch (_) {}
      scannerRef.current = null;
    }
    setScanning(false);
  };

  const handleScan = async (scannedCode?: string) => {
    const raw = (scannedCode || code).trim();
    if (!raw) return;

    setLoading(true);
    setError("");
    setInfo(null);

    try {
      // Try to parse as JSON (new QR code format)
      let parsedQR: any = null;
      try { parsedQR = JSON.parse(raw); } catch {}

      if (parsedQR?.token) {
        // QR token flow — fetch voucher directly by qr_token
        const { data, error: fetchError } = await supabase
          .from("vouchers")
          .select(`
            id, voucher_code, status, uses_count, qr_token,
            boxes:box_id (
              name, max_uses,
              box_experiences ( experiences:experience_id ( id, title, description ) )
            ),
            orders ( recipient_name, buyer_name, total_dzd )
          `)
          .eq("qr_token", parsedQR.token)
          .single();

        if (fetchError || !data) {
          setError("Code introuvable. Vérifiez et réessayez.");
          return;
        }

        const voucher = data as any;
        const box = Array.isArray(voucher.boxes) ? voucher.boxes[0] : voucher.boxes;
        const order = Array.isArray(voucher.orders) ? voucher.orders[0] : voucher.orders;

        const experiences: ExperienceOption[] = (box?.box_experiences ?? [])
          .map((be: any) => be.experiences)
          .filter((exp: any) => exp?.id && exp?.title);

        const max_uses: number | null = box?.max_uses ?? null;
        const uses_count: number = voucher.uses_count ?? 0;

        if (voucher.status === "consumed" || (max_uses !== null && uses_count >= max_uses)) {
          setError("Ce voucher a été utilisé le nombre maximum de fois.");
          return;
        }

        setInfo({
          id: "",
          redeem_code: voucher.voucher_code ?? "",
          status: voucher.status,
          customer_name: order?.recipient_name || order?.buyer_name || "Guest",
          experience_title: "",
          partner_name: "",
          city: "",
          amount_dzd: order?.total_dzd ?? 0,
          voucher_id: voucher.id,
          max_uses,
          uses_count,
          qr_token: voucher.qr_token ?? "",
          experiences,
          selected_experience_id: null,
          flow: "qr_token",
        });
      } else {
        // Redeem code flow (existing behavior)
        const cleanCode = raw.toUpperCase().replace(/[–—]/g, '-');
        setCode(cleanCode);

        const { data, error: fetchError } = await supabase
          .from("voucher_redemptions")
          .select(`
            id, redeem_code, qr_token, status,
            experiences:experience_id ( id, title, city, partners ( name ) ),
            vouchers:voucher_id ( id, uses_count, orders ( recipient_name, buyer_name, total_dzd ), boxes:box_id ( max_uses ) )
          `)
          .eq("redeem_code", cleanCode)
          .maybeSingle();

        if (fetchError) throw fetchError;
        if (!data) { setError("Code introuvable. Vérifiez et réessayez."); return; }

        const experience = data.experiences as any;
        const partner = Array.isArray(experience?.partners) ? experience.partners[0] : experience?.partners;
        const voucher = data.vouchers as any;
        const order = Array.isArray(voucher?.orders) ? voucher.orders[0] : voucher?.orders;
        const boxes = Array.isArray(voucher?.boxes) ? voucher.boxes[0] : voucher?.boxes;
        const max_uses: number | null = boxes?.max_uses ?? null;
        const uses_count: number = voucher?.uses_count ?? 0;

        if (max_uses === null) {
          if (data.status === "REDEEMED") { setError("Ce code a déjà été utilisé."); return; }
        } else {
          if (uses_count >= max_uses) { setError("Ce voucher a été utilisé le nombre maximum de fois."); return; }
        }

        setInfo({
          id: data.id,
          redeem_code: data.redeem_code,
          status: data.status,
          customer_name: order?.recipient_name || order?.buyer_name || "Guest",
          experience_title: experience?.title ?? "",
          partner_name: partner?.name ?? "",
          city: experience?.city ?? "",
          amount_dzd: order?.total_dzd ?? 0,
          voucher_id: voucher?.id ?? "",
          max_uses,
          uses_count,
          qr_token: data.qr_token ?? "",
          experiences: [],
          selected_experience_id: experience?.id ?? null,
          flow: "redeem_code",
        });
      }
    } catch (err: any) {
      setError("Erreur de connexion. Réessayez.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!info) return;
    if (info.flow === "qr_token" && !info.selected_experience_id) return;

    setConfirming(true);

    // Resolve confirmed experience title before async ops
    let confirmedTitle = info.experience_title;
    if (info.flow === "qr_token" && info.selected_experience_id) {
      const exp = info.experiences.find(e => e.id === info.selected_experience_id);
      if (exp) confirmedTitle = exp.title;
    }

    try {
      if (info.flow === "qr_token") {
        const newRedeemCode = "RDM-" + genToken();
        const newUsesCount = info.uses_count + 1;

        const { error: insertError } = await supabase
          .from("voucher_redemptions")
          .insert({
            voucher_id: info.voucher_id,
            experience_id: info.selected_experience_id,
            redeem_code: newRedeemCode,
            qr_token: info.qr_token,
            status: "REDEEMED",
            redeemed_at: new Date().toISOString(),
          });
        if (insertError) throw insertError;

        const voucherUpdate: { uses_count: number; status?: string } = { uses_count: newUsesCount };
        if (info.max_uses === null || newUsesCount >= (info.max_uses ?? 1)) {
          voucherUpdate.status = "consumed";
        }
        const { error: updateError } = await supabase
          .from("vouchers")
          .update(voucherUpdate)
          .eq("id", info.voucher_id);
        if (updateError) throw updateError;

      } else {
        // Existing redeem_code flow
        if (info.max_uses === null) {
          const { error } = await supabase
            .from("voucher_redemptions")
            .update({ status: "REDEEMED", redeemed_at: new Date().toISOString() })
            .eq("id", info.id);
          if (error) throw error;
        } else {
          const newUsesCount = info.uses_count + 1;
          const { error: insertError } = await supabase
            .from("voucher_redemptions")
            .insert({ voucher_id: info.voucher_id, scan_number: newUsesCount, redeemed_at: new Date().toISOString(), status: "REDEEMED" });
          if (insertError) throw insertError;

          const voucherUpdate: { uses_count: number; status?: string } = { uses_count: newUsesCount };
          if (newUsesCount >= info.max_uses) voucherUpdate.status = "consumed";
          const { error: updateError } = await supabase
            .from("vouchers")
            .update(voucherUpdate)
            .eq("id", info.voucher_id);
          if (updateError) throw updateError;
        }
      }

      setInfo(prev => prev ? { ...prev, experience_title: confirmedTitle } : prev);
      setConfirmed(true);
    } catch {
      setError("Échec de la confirmation. Réessayez.");
    } finally {
      setConfirming(false);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    navigate("/partner/login");
  };

  const reset = () => {
    setConfirmed(false);
    setInfo(null);
    setCode("");
    setError("");
  };

  if (!authChecked) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  if (confirmed) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-4xl font-black text-white uppercase italic mb-2">Confirmé !</h1>
          <p className="text-gray-400 text-lg mb-1">{info?.customer_name}</p>
          <p className="text-yellow-400 font-bold text-xl mb-2">{info?.amount_dzd.toLocaleString()} DZD</p>
          <p className="text-gray-500 text-sm">{info?.experience_title}</p>
          <button onClick={reset} className="mt-10 px-8 py-4 rounded-2xl bg-white text-black font-black uppercase tracking-widest hover:bg-yellow-400 transition-all">
            Scanner un autre
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/images/Logo.png" alt="ZEYBOX" className="h-12 w-auto" />
          <p className="text-gray-500 text-xs">{partnerName}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setShowHistory(!showHistory); if (!showHistory) loadHistory(); }}
            className="text-xs text-gray-400 hover:text-white font-bold uppercase tracking-widest border border-white/10 px-3 py-2 rounded-xl transition-all"
          >
            {showHistory ? "Scanner" : "Historique"}
          </button>
          <button onClick={logout} className="text-xs text-gray-500 hover:text-red-400 transition-colors font-bold">
            Déconnexion
          </button>
        </div>
      </div>

      {showHistory ? (
        /* History view */
        <div className="max-w-2xl mx-auto px-4 py-8">
          <h2 className="text-2xl font-black uppercase italic mb-6">Historique</h2>
          {historyLoading ? (
            <div className="flex justify-center py-10">
              <div className="w-6 h-6 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : history.length === 0 ? (
            <p className="text-gray-500 text-center py-10">Aucune redemption pour l'instant.</p>
          ) : (
            <div className="space-y-3">
              {history.map((h) => (
                <div key={h.redeem_code} className="rounded-2xl border border-white/10 bg-white/5 p-4 flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate">{h.customer_name}</p>
                    <p className="text-gray-400 text-xs truncate">{h.experience_title}</p>
                    <p className="font-mono text-xs text-gray-600 mt-1">{h.redeem_code}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-black text-yellow-400 text-sm">{h.amount_dzd.toLocaleString()} DZD</p>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${h.status === "REDEEMED" ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"}`}>
                      {h.status === "REDEEMED" ? "Confirmé" : "En attente"}
                    </span>
                    {h.redeemed_at && (
                      <p className="text-gray-600 text-xs mt-1">{new Date(h.redeemed_at).toLocaleDateString("fr-DZ")}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Scan view */
        <div className="max-w-md mx-auto px-4 py-8">
          <h1 className="text-3xl font-black uppercase italic mb-1">Scanner Voucher</h1>
          <p className="text-gray-400 mb-8 text-sm">Scannez le QR code du client ou entrez le code manuellement.</p>

          {/* QR Scanner */}
          {scanning ? (
            <div className="mb-6">
              <div id="qr-reader" ref={scannerDivRef} className="w-full rounded-3xl overflow-hidden border border-white/10" />
              <button onClick={stopQRScanner} className="mt-3 w-full py-3 rounded-2xl border border-white/20 text-gray-400 font-bold text-sm hover:bg-white/5 transition-all">
                Annuler
              </button>
            </div>
          ) : (
            <button
              onClick={startQRScanner}
              className="w-full py-5 rounded-2xl bg-yellow-400 text-black font-black uppercase tracking-widest hover:bg-yellow-300 transition-all mb-4 flex items-center justify-center gap-3 text-lg"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Scanner QR Code
            </button>
          )}

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-gray-600 text-xs uppercase tracking-widest">ou</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Manual input */}
          <div className="space-y-3">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleScan()}
              placeholder="RDM-XXXXXXXX"
              className="w-full rounded-2xl bg-white/5 border border-white/10 px-5 py-4 font-mono text-xl text-white outline-none focus:ring-2 focus:ring-yellow-400 placeholder:text-gray-600"
            />
            <button
              onClick={() => handleScan()}
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-white text-black font-black uppercase tracking-widest hover:bg-yellow-400 transition-all disabled:opacity-30"
            >
              {loading ? "Vérification..." : "Vérifier le code"}
            </button>
          </div>

          {error && (
            <div className="mt-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 font-bold text-sm text-center">
              {error}
            </div>
          )}

          {/* Redemption info */}
          {info && (
            <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 overflow-hidden">
              <div className="bg-green-500/10 border-b border-white/10 px-6 py-3 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-green-400 text-sm font-bold uppercase tracking-widest">Voucher Valide</span>
              </div>
              <div className="p-6 space-y-5">
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-widest mb-1">Client</p>
                  <p className="text-2xl font-black">{info.customer_name}</p>
                </div>

                {/* Experience display — pre-selected for redeem_code flow */}
                {info.flow === "redeem_code" && info.experience_title && (
                  <div>
                    <p className="text-gray-500 text-xs uppercase tracking-widest mb-1">Expérience</p>
                    <p className="text-lg font-bold">{info.experience_title}</p>
                    {info.city && <p className="text-gray-400 text-sm">{info.city}</p>}
                  </div>
                )}

                {/* Experience selection — QR flow */}
                {info.flow === "qr_token" && info.experiences.length > 0 && (
                  <div>
                    <p className="text-gray-500 text-xs uppercase tracking-widest mb-3">Expériences disponibles</p>
                    <div className="space-y-2">
                      {info.experiences.map((exp) => (
                        <button
                          key={exp.id}
                          onClick={() => setInfo(prev => prev ? { ...prev, selected_experience_id: exp.id } : prev)}
                          className={`w-full text-left border rounded-2xl p-4 cursor-pointer transition-all ${
                            info.selected_experience_id === exp.id
                              ? "border-yellow-400 bg-yellow-400/10 text-yellow-400"
                              : "border-white/20 bg-white/5 text-white"
                          }`}
                        >
                          <p className="font-bold text-sm">{exp.title}</p>
                          {exp.description && (
                            <p className="text-xs opacity-60 mt-0.5">{exp.description}</p>
                          )}
                        </button>
                      ))}
                    </div>
                    {!info.selected_experience_id && (
                      <p className="text-gray-500 text-xs text-center mt-3 italic">
                        Demandez au client de choisir une expérience
                      </p>
                    )}
                  </div>
                )}

                <div className="rounded-2xl bg-yellow-400/10 border border-yellow-400/20 px-5 py-4">
                  <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">Montant à encaisser</p>
                  <p className="text-3xl font-black text-yellow-400">{info.amount_dzd.toLocaleString()} <span className="text-lg">DZD</span></p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-widest mb-1">Code</p>
                  <p className="font-mono text-sm text-gray-300">{info.redeem_code}</p>
                </div>
                {info.max_uses !== null && (
                  <div className="rounded-2xl bg-white/5 border border-white/10 px-5 py-4">
                    <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">Utilisations</p>
                    <p className="text-xl font-black text-white">Utilisation {info.uses_count + 1} / {info.max_uses}</p>
                    <p className="text-gray-400 text-sm mt-1">{info.max_uses - info.uses_count - 1} restante(s) après cette visite</p>
                  </div>
                )}
                <button
                  onClick={handleConfirm}
                  disabled={confirming || (info.flow === "qr_token" && !info.selected_experience_id)}
                  className="w-full py-5 rounded-2xl bg-green-500 text-white font-black text-lg uppercase tracking-widest hover:bg-green-400 transition-all disabled:opacity-30"
                >
                  {confirming ? "Confirmation..." : "✓ Confirmer le service"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
