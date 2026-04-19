import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useTranslation } from "react-i18next";

type Order = {
  id: string;
  status: string;
  total_dzd: number;
  created_at: string;
  payment_method: string;
  boxes: { name: string } | null;
  vouchers: { voucher_code: string; status: string }[];
};

export default function Account() {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const isAr = i18n.language === "ar";

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
          id, status, total_dzd, created_at, payment_method,
          boxes:box_id ( name ),
          vouchers ( voucher_code, status )
        `)
        .eq("buyer_email", user.email)
        .order("created_at", { ascending: false });

      setOrders((ordersData ?? []) as Order[]);
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

  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-black tracking-tight">
        {isAr ? "حسابي" : "My Account"}
      </h1>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="mt-8 space-y-6">

          {/* Profile card */}
          <div className="rounded-3xl border border-gray-100 p-6 bg-white flex flex-col md:flex-row md:items-center gap-6">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-2xl bg-black text-white flex items-center justify-center text-2xl font-black shrink-0">
              {(fullName || email || "?")[0].toUpperCase()}
            </div>

            <div className="flex-1">
              <p className="text-xl font-black">{fullName || (isAr ? "مستخدم" : "User")}</p>
              <p className="text-sm text-gray-400 mt-0.5">{email}</p>
            </div>

            <button
              onClick={logout}
              className="px-6 py-3 rounded-2xl border border-gray-200 text-sm font-bold hover:bg-red-600 hover:text-white hover:border-red-600 transition-all"
            >
              {isAr ? "تسجيل الخروج" : "Logout"}
            </button>
          </div>

          {/* Orders & Vouchers */}
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight mb-4">
              {isAr ? "طلباتي وقسائمي" : "My Orders & Vouchers"}
            </h2>

            {orders.length === 0 ? (
              <div className="rounded-3xl border-2 border-dashed border-gray-200 p-12 text-center">
                <p className="text-gray-400 font-bold mb-4">
                  {isAr ? "لا توجد طلبات بعد." : "No orders yet."}
                </p>
                <Link
                  to="/best-sellers"
                  className="inline-flex px-6 py-3 rounded-2xl bg-black text-white text-sm font-bold hover:bg-red-600 transition-all"
                >
                  {isAr ? "تصفح الصناديق" : "Browse boxes"}
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="rounded-3xl border border-gray-100 bg-white overflow-hidden">
                    {/* Order header */}
                    <div className="px-6 py-4 flex flex-wrap items-center gap-4 border-b border-gray-50">
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-base truncate">
                          {(order.boxes as any)?.name || (isAr ? "صندوق" : "Box")}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {new Date(order.created_at).toLocaleDateString(isAr ? "ar-DZ" : "fr-DZ")}
                          {" · "}
                          {order.payment_method}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-black text-base">
                          {order.total_dzd.toLocaleString()} DZD
                        </span>
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${statusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                    </div>

                    {/* Vouchers */}
                    {order.vouchers?.length > 0 ? (
                      <div className="px-6 py-4 space-y-2">
                        {order.vouchers.map((v) => (
                          <div key={v.voucher_code} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="text-lg">🎟️</span>
                              <span className={`font-mono text-sm ${voucherStatusColor(v.status)}`}>
                                {v.voucher_code}
                              </span>
                            </div>
                            {(v.status === "ACTIVE" || v.status === "active") && (
                              <Link
                                to="/voucher"
                                className="text-xs font-bold text-black border border-gray-200 px-3 py-1.5 rounded-xl hover:bg-black hover:text-white transition-all"
                              >
                                {isAr ? "استخدم" : "Use it →"}
                              </Link>
                            )}
                            {v.status === "consumed" && (
                              <span className="text-xs text-gray-400 font-bold">
                                {isAr ? "مستخدم" : "Redeemed"}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      order.status === "PENDING" && (
                        <div className="px-6 py-3">
                          <p className="text-xs text-gray-400">
                            {isAr ? "في انتظار تأكيد الدفع..." : "Waiting for payment confirmation..."}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}