import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useTranslation } from "react-i18next";
import QRCode from "react-qr-code";

type Order = {
  id: string;
  status: string;
  buyer_name: string | null;
  recipient_name: string | null;
  total_dzd: number;
  created_at: string;
  payment_method: string;
  boxes: { name: string; category: string; max_uses: number; image_url: string } | null;
  vouchers: { id: string; voucher_code: string; status: string; expires_at: string | null; qr_token: string | null; uses_count: number }[];
};

export default function Account() {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const isFr = i18n.language === 'fr';
  const isAr = i18n.language === 'ar';

  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [fullName, setFullName] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data: authData } = await supabase.auth.getUser();
      const user = authData.user;
      if (!user) { navigate("/login"); return; }

      setUser(user);
      setEmail(user.email ?? null);

      // Fetch profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("user_id", user.id)
        .maybeSingle();
      setFullName(profile?.full_name ?? null);

      // Fetch orders by buyer_email with box name + vouchers
      const { data: ordersData } = await supabase
        .from("orders")
        .select(`
          id, status, buyer_name, recipient_name, total_dzd, created_at, payment_method,
          boxes:box_id ( name, category, max_uses, image_url ),
          vouchers ( id, voucher_code, status, expires_at, qr_token, uses_count )
        `)
        .eq("buyer_email", user.email)
        .order("created_at", { ascending: false });

      setOrders((ordersData ?? []) as unknown as Order[]);
      setLoading(false);
    };
    load();
  }, [navigate]);

  const logout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const statusColor = (s: string) => {
    if (s === "PAID") return "bg-green-100 text-green-700";
    if (s === "PENDING") return "bg-yellow-100 text-yellow-700";
    return "bg-gray-100 text-gray-500";
  };

  const voucherStatusColor = (s: string) => {
    if (s === "consumed") return "text-gray-400 line-through";
    if (s === "ACTIVE" || s === "active") return "text-green-600 font-bold";
    return "text-gray-500";
  };

  const getVoucherStatus = (voucher: any, maxUses: number | null) => {
    if (!voucher) return null;
    const now = new Date();
    const expiresAt = voucher.expires_at ? new Date(voucher.expires_at) : null;

    if (voucher.status === 'consumed') return { label: isAr ? "مُستخدم" : isFr ? "Utilisé" : "Used", color: "text-red-500", dot: "bg-red-500", progress: 0 };
    if (expiresAt && expiresAt < now) return { label: isAr ? "منتهي" : isFr ? "Expiré" : "Expired", color: "text-gray-400", dot: "bg-gray-400", progress: 0 };

    if (expiresAt) {
      const totalDays = maxUses ? 30 : 90;
      const daysLeft = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      const progress = Math.max(0, Math.min(100, (daysLeft / totalDays) * 100));
      return {
        label: isAr ? `صالح — ${daysLeft} يوم متبقي` : isFr ? `Valide — ${daysLeft} jours restants` : `Valid — ${daysLeft} days left`,
        color: "text-green-500",
        dot: "bg-green-500",
        progress,
        daysLeft
      };
    }

    return { label: isAr ? "نشط" : isFr ? "Actif" : "Active", color: "text-green-500", dot: "bg-green-500", progress: 100 };
  };

  const paidOrders = orders.filter(o => o.status === 'PAID');
  const pendingOrders = orders.filter(o => o.status === 'PENDING');
  const giftCount = paidOrders.length;

  const loyaltyBadge =
    giftCount === 0 ? { label: isAr ? "عضو جديد" : isFr ? "Nouveau membre" : "New member", color: "bg-gray-100 text-gray-500" } :
    giftCount <= 2 ? { label: "🌟 Gifter", color: "bg-yellow-100 text-yellow-700" } :
    giftCount <= 5 ? { label: "🔥 Super Gifter", color: "bg-orange-100 text-orange-700" } :
    { label: "💎 ZEYBOX VIP", color: "bg-red-100 text-red-700" };

  return (
    <main>
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8 max-w-4xl mx-auto px-4 py-8">

          {/* LEFT — Profile */}
          <aside className="lg:w-64 shrink-0">
            <div className="relative rounded-3xl border border-gray-100 p-6 flex flex-col items-center text-center sticky top-24">
              <button
                onClick={logout}
                className="absolute top-4 right-4 text-xs text-gray-400 hover:text-red-600 font-bold transition-all"
              >
                {isAr ? "خروج" : isFr ? "Quitter" : "Logout"}
              </button>

              <div className="w-20 h-20 rounded-full bg-black text-white flex items-center justify-center text-3xl font-black mb-4">
                {user?.email?.charAt(0).toUpperCase()}
              </div>
              <p className="text-xl font-black">{orders[0]?.buyer_name || user?.email}</p>
              <p className="text-gray-400 text-sm mt-1">{user?.email}</p>
              <span className={`mt-3 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${loyaltyBadge.color}`}>
                {loyaltyBadge.label}
              </span>
              <p className="text-gray-400 text-xs mt-2">
                {giftCount === 0
                  ? (isAr ? "لم تقدم أي هدية بعد" : isFr ? "Vous n'avez pas encore offert de cadeau" : "You haven't gifted yet")
                  : (isAr ? `قدمت ${giftCount} تجربة` : isFr ? `${giftCount} expérience${giftCount > 1 ? 's' : ''} offerte${giftCount > 1 ? 's' : ''}` : `${giftCount} experience${giftCount > 1 ? 's' : ''} gifted`)}
              </p>
            </div>
          </aside>

          {/* RIGHT — Orders */}
          <div className="flex-1">
            <h2 className="text-xl font-black uppercase tracking-tight mb-6">
              {isAr ? "طلباتي" : isFr ? "Mes commandes" : "My orders"}
              <span className="ml-2 bg-gray-100 text-gray-500 text-xs px-2 py-1 rounded-full font-bold">
                {orders.filter(o => o.status === 'PAID').length}
              </span>
            </h2>

            {orders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <p className="text-5xl mb-4">🛍️</p>
                <p className="font-black text-xl mb-2">
                  {isAr ? "لا توجد طلبات بعد" : isFr ? "Aucune commande pour l'instant" : "No orders yet"}
                </p>
                <p className="text-gray-400 text-sm mb-6">
                  {isAr ? "اكتشف صناديقنا وأهدِ تجربة لا تُنسى" : isFr ? "Découvrez nos coffrets et offrez une expérience inoubliable" : "Discover our boxes and gift an unforgettable experience"}
                </p>
                <Link to="/" className="bg-black text-white px-6 py-3 rounded-2xl font-black hover:bg-red-600 transition-all">
                  {isAr ? "اكتشف الصناديق" : isFr ? "Découvrir les coffrets" : "Explore boxes"} →
                </Link>
              </div>
            ) : (
              <div>
                {paidOrders.map((order) => {
                  const voucher = Array.isArray(order.vouchers) ? order.vouchers[0] : order.vouchers;
                  const box = Array.isArray(order.boxes) ? order.boxes[0] : order.boxes;
                  return (
                    <div key={order.id} className="rounded-2xl border border-gray-100 p-4 mb-3 bg-white">

                      {/* Top row */}
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-bold text-sm truncate flex-1">{box?.name}</p>
                        <div className="flex items-center gap-2 shrink-0 ml-2">
                          <span className="font-black text-sm">{Number(order.total_dzd).toLocaleString()} DA</span>
                          <span className="bg-green-100 text-green-600 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">PAID</span>
                        </div>
                      </div>

                      {/* Date */}
                      <p className="text-xs text-gray-400 mb-3">
                        {new Date(order.created_at).toLocaleDateString(
                          i18n.language === 'ar' ? 'ar-DZ' : i18n.language === 'fr' ? 'fr-FR' : 'en-GB'
                        )}
                      </p>

                      {/* QR Code button */}
                      {voucher?.qr_token && (
                        <Link
                          to={`/qr/${voucher.qr_token}`}
                          className="flex items-center gap-1.5 bg-black text-white px-3 py-1.5 rounded-xl text-xs font-black hover:bg-red-600 transition-all active:scale-95 w-fit"
                        >
                          📱 QR Code
                        </Link>
                      )}

                    </div>
                  );
                })}

                {pendingOrders.length > 0 && (
                  <>
                    <p className="text-xs font-black uppercase tracking-widest text-gray-400 mt-8 mb-4">
                      {isAr ? "في انتظار الدفع" : isFr ? "En attente de paiement" : "Pending payment"}
                    </p>
                    {pendingOrders.map((order) => {
                      const box = Array.isArray(order.boxes) ? order.boxes[0] : order.boxes;
                      return (
                        <div key={order.id} className="rounded-2xl border border-gray-100 p-4 mb-3 bg-white opacity-50">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-bold text-sm truncate flex-1">{box?.name}</p>
                            <div className="flex items-center gap-2 shrink-0 ml-2">
                              <span className="font-black text-sm">{Number(order.total_dzd).toLocaleString()} DA</span>
                              <span className="bg-yellow-100 text-yellow-600 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">PENDING</span>
                            </div>
                          </div>
                          <p className="text-xs text-gray-400">
                            {new Date(order.created_at).toLocaleDateString(
                              i18n.language === 'ar' ? 'ar-DZ' : i18n.language === 'fr' ? 'fr-FR' : 'en-GB'
                            )}
                          </p>
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            )}
          </div>

        </div>
      )}
    </main>
  );
}