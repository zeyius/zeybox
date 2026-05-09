import { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";
import { Link, useNavigate } from "react-router-dom";

type Order = {
  id: string;
  status: string;
  buyer_name: string | null;
  buyer_email: string | null;
  recipient_name: string | null;
  recipient_email: string | null;
  total_dzd: number;
  created_at: string;
  payment_method: string;
  boxes: { name: string } | null;
};

export default function AdminOrders() {
  const navigate = useNavigate();
  const [authorized, setAuthorized] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("orders")
      .select(`
        id, status, buyer_name, buyer_email, recipient_name, recipient_email, total_dzd, created_at, payment_method,
        boxes:box_id ( name )
      `)
      .eq("status", "PENDING")
      .order("created_at", { ascending: false });
    setOrders((data ?? []) as unknown as Order[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/login"); return; }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();

      if (profile?.role !== "ADMIN") { navigate("/"); return; }
      setAuthorized(true);
    };
    checkAuth();
  }, [navigate]);

  useEffect(() => {
    if (!authorized) return;
    loadOrders();
  }, [authorized, loadOrders]);

  const confirmPayment = async (orderId: string) => {
    await supabase
      .from("orders")
      .update({ status: "PAID" })
      .eq("id", orderId);
    loadOrders();
  };

  const cancelOrder = async (orderId: string) => {
    await supabase
      .from("orders")
      .update({ status: "CANCELLED" })
      .eq("id", orderId);
    loadOrders();
  };

  if (!authorized) return null;

  const paymentBadge = (method: string) => {
    const styles: Record<string, string> = {
      CASH: "bg-gray-100 text-gray-600",
      BaridiMob: "bg-blue-100 text-blue-600",
      EDAHABIA: "bg-yellow-100 text-yellow-700",
      CIB: "bg-purple-100 text-purple-600",
    };
    return (
      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${styles[method] ?? "bg-gray-100 text-gray-500"}`}>
        {method}
      </span>
    );
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tight">
              Admin — Pending Orders
              <span className="ml-3 bg-yellow-400 text-black text-sm px-3 py-1 rounded-full font-black">
                {orders.length}
              </span>
            </h1>
            <div className="h-1.5 w-12 bg-yellow-400 mt-1 rounded-full" />
          </div>
          <Link to="/admin/partners" className="text-sm font-bold text-gray-400 hover:text-black transition-colors">
            Partners →
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-2xl font-black text-gray-400">Aucune commande en attente 🎉</p>
          </div>
        ) : (
          <div>
            {orders.map((order) => {
              const box = Array.isArray(order.boxes) ? order.boxes[0] : order.boxes;
              return (
                <div key={order.id} className="rounded-2xl border border-gray-100 bg-white p-5 mb-3">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-base">{(box as any)?.name ?? "—"}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(order.created_at).toLocaleDateString("fr-DZ", { day: "2-digit", month: "short", year: "numeric" })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-black text-base">{Number(order.total_dzd).toLocaleString()} DA</span>
                      {paymentBadge(order.payment_method)}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4 text-sm">
                    <div className="bg-gray-50 rounded-xl px-3 py-2">
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-0.5">Acheteur</p>
                      <p className="font-bold truncate">{order.buyer_name || "—"}</p>
                      <p className="text-xs text-gray-400 truncate">{order.buyer_email || "—"}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl px-3 py-2">
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-0.5">Destinataire</p>
                      <p className="font-bold truncate">{order.recipient_name || "—"}</p>
                      <p className="text-xs text-gray-400 truncate">{order.recipient_email || "—"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => confirmPayment(order.id)}
                      className="flex items-center gap-1.5 bg-green-500 text-white px-4 py-2 rounded-xl text-sm font-black hover:bg-green-600 transition-all active:scale-95"
                    >
                      ✅ Confirmer paiement
                    </button>
                    <button
                      onClick={() => cancelOrder(order.id)}
                      className="flex items-center gap-1.5 bg-red-100 text-red-600 px-4 py-2 rounded-xl text-sm font-black hover:bg-red-200 transition-all active:scale-95"
                    >
                      ❌ Annuler
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
