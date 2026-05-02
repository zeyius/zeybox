import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import QRCode from "react-qr-code";
import { useTranslation } from "react-i18next";
import { supabase } from "../lib/supabaseClient";

interface VoucherData {
  id: string;
  voucher_code: string;
  status: string;
  uses_count: number;
  qr_token: string;
  boxes: {
    name: string;
    category: string;
    max_uses: number;
    box_experiences: { experiences: { title: string } | null }[];
  } | null;
  orders: { recipient_name: string | null; buyer_name: string | null; total_dzd: number } | null;
}

export default function QRPage() {
  const { token } = useParams<{ token: string }>();
  const { t } = useTranslation();
  const [voucher, setVoucher] = useState<VoucherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!token) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    (async () => {
      const { data, error } = await supabase
        .from("vouchers")
        .select(`
          id, voucher_code, status, uses_count, qr_token,
          boxes:box_id (
            name, category, max_uses,
            box_experiences ( experiences:experience_id ( title ) )
          ),
          orders ( recipient_name, buyer_name, total_dzd )
        `)
        .eq("qr_token", token)
        .single();

      if (error || !data) {
        setNotFound(true);
      } else {
        setVoucher(data as unknown as VoucherData);
      }
      setLoading(false);
    })();
  }, [token]);

  if (loading) {
    return (
      <div className="bg-black min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound || !voucher) {
    return (
      <div className="bg-black min-h-screen flex flex-col items-center justify-center gap-6 px-4">
        <p className="text-white text-xl font-semibold">{t("qr_invalid")}</p>
        <Link to="/" className="text-yellow-400 underline text-sm">
          {t("back_home")}
        </Link>
      </div>
    );
  }

  const order = Array.isArray(voucher.orders) ? voucher.orders[0] : voucher.orders;
  const box = Array.isArray(voucher.boxes) ? voucher.boxes[0] : voucher.boxes;
  const experiences =
    box?.box_experiences?.map((be: any) => be.experiences?.title).filter(Boolean) ?? [];

  const customerName = order?.recipient_name || order?.buyer_name || "Guest";

  const qrData = JSON.stringify({
    token: voucher.qr_token,
    voucher_code: voucher.voucher_code,
    customer_name: customerName,
    box_name: box?.name,
    experiences,
  });

  const usesLeft = (box?.max_uses ?? 1) - (voucher.uses_count ?? 0);

  return (
    <div className="bg-black text-white min-h-screen flex flex-col items-center px-4 py-8 gap-6">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-red-600 rounded-sm" />
        <span className="text-white text-2xl font-black tracking-widest">ZEYBOX</span>
      </div>

      {/* Yellow divider */}
      <div className="w-full max-w-xs h-0.5 bg-yellow-400" />

      {/* Greeting */}
      <h1 className="text-3xl font-bold text-center">
        {t("qr_hello")}, {customerName} 🎁
      </h1>

      {/* Box name */}
      <p className="text-yellow-400 text-xl font-black text-center">{box?.name}</p>

      {/* QR Code */}
      <div className="bg-white p-4 rounded-2xl inline-block">
        <QRCode
          value={qrData}
          size={256}
          style={{ height: "auto", maxWidth: "100%", width: "100%" }}
        />
      </div>

      {/* Instructions */}
      <p className="text-gray-400 text-sm text-center max-w-xs">{t("qr_instruction")}</p>

      {/* Voucher code */}
      <p className="font-mono text-gray-500 text-sm tracking-widest">{voucher.voucher_code}</p>

      {/* Multi-use remaining */}
      {(box?.max_uses ?? 1) > 1 && (
        <p className="text-yellow-300 text-sm font-medium">
          {usesLeft} {t("qr_uses_left")}
        </p>
      )}

      {/* Consumed badge */}
      {voucher.status === "consumed" && (
        <span className="bg-red-600 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wide">
          {t("qr_consumed")}
        </span>
      )}

      {/* Footer */}
      <p className="text-gray-600 text-xs mt-auto pt-8">zeybox.online</p>
    </div>
  );
}
