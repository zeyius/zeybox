import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { Link, useNavigate } from "react-router-dom";

type Redemption = {
  redeem_code: string;
  status: string;
  redeemed_at: string | null;
  experience_title: string;
  partner_name: string;
  partner_id: string;
  customer_name: string;
  amount_dzd: number;
};

type PartnerSummary = {
  partner_id: string;
  partner_name: string;
  total: number;
  redeemed: number;
  pending: number;
  revenue_dzd: number;
  redemptions: Redemption[];
};

export default function AdminPartners() {
  const navigate = useNavigate();
  const [authorized, setAuthorized] = useState(false);
  const [partners, setPartners] = useState<PartnerSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

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
    const load = async () => {
      setLoading(true);

      const { data, error } = await supabase.rpc("get_partner_activity");

      if (error) { console.error(error); setLoading(false); return; }

      const map: Record<string, PartnerSummary> = {};

      for (const row of data ?? []) {
        const pid = row.partner_id ?? "unknown";
        const pname = row.partner_name ?? "Unknown Partner";

        if (!map[pid]) {
          map[pid] = { partner_id: pid, partner_name: pname, total: 0, redeemed: 0, pending: 0, revenue_dzd: 0, redemptions: [] };
        }

        map[pid].total++;
        if (row.status === "REDEEMED") { map[pid].redeemed++; map[pid].revenue_dzd += row.amount_dzd ?? 0; }
        if (row.status === "ISSUED") map[pid].pending++;

        map[pid].redemptions.push({
          redeem_code: row.redeem_code,
          status: row.status,
          redeemed_at: row.redeemed_at,
          experience_title: row.experience_title,
          partner_name: pname,
          partner_id: pid,
          customer_name: row.customer_name,
          amount_dzd: row.amount_dzd ?? 0,
        });
      }

      setPartners(Object.values(map).sort((a, b) => b.redeemed - a.redeemed));
      setLoading(false);
    };

    load();
  }, [authorized]);

  if (!authorized) return null;

  const statusBadge = (status: string) => {
    if (status === "REDEEMED") return <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-bold">Redeemed</span>;
    if (status === "ISSUED") return <span className="px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 text-xs font-bold">Pending</span>;
    return <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 text-xs font-bold">{status}</span>;
  };

  return (
    <main className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight">Partner Activity</h1>
          <div className="h-1.5 w-12 bg-yellow-400 mt-1 rounded-full" />
        </div>
        <Link to="/admin/orders" className="text-sm font-bold text-gray-400 hover:text-black transition-colors">
          ← Orders
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" />
        </div>
      ) : partners.length === 0 ? (
        <p className="text-gray-400 text-center py-20">No redemptions yet.</p>
      ) : (
        <div className="space-y-4">
          {partners.map((p) => (
            <div key={p.partner_id} className="rounded-3xl border border-gray-100 bg-white overflow-hidden">
              {/* Partner header */}
              <button
                onClick={() => setExpanded(expanded === p.partner_id ? null : p.partner_id)}
                className="w-full px-6 py-5 flex items-center gap-6 hover:bg-gray-50 transition-all text-left"
              >
                {/* Avatar */}
                <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center font-black text-lg shrink-0">
                  {p.partner_name[0]}
                </div>

                <div className="flex-1">
                  <h2 className="font-black text-lg">{p.partner_name}</h2>
                  <p className="text-gray-400 text-sm">{p.total} voucher{p.total !== 1 ? "s" : ""} total</p>
                </div>

                {/* Stats */}
                <div className="hidden md:flex items-center gap-6 text-center">
                  <div>
                    <p className="text-2xl font-black text-green-600">{p.redeemed}</p>
                    <p className="text-xs text-gray-400 uppercase tracking-widest">Redeemed</p>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-yellow-500">{p.pending}</p>
                    <p className="text-xs text-gray-400 uppercase tracking-widest">Pending</p>
                  </div>
                  <div>
                    <p className="text-2xl font-black">{p.revenue_dzd.toLocaleString()}</p>
                    <p className="text-xs text-gray-400 uppercase tracking-widest">DZD served</p>
                  </div>
                </div>

                <span className="text-gray-300 text-lg">{expanded === p.partner_id ? "▲" : "▼"}</span>
              </button>

              {/* Expanded redemptions table */}
              {expanded === p.partner_id && (
                <div className="border-t border-gray-100 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-400 text-xs uppercase tracking-widest">
                      <tr>
                        <th className="px-6 py-3 text-left">Code</th>
                        <th className="px-6 py-3 text-left">Customer</th>
                        <th className="px-6 py-3 text-left">Experience</th>
                        <th className="px-6 py-3 text-left">Amount</th>
                        <th className="px-6 py-3 text-left">Status</th>
                        <th className="px-6 py-3 text-left">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {p.redemptions.map((r) => (
                        <tr key={r.redeem_code} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 font-mono text-xs text-gray-500">{r.redeem_code}</td>
                          <td className="px-6 py-4 font-bold">{r.customer_name}</td>
                          <td className="px-6 py-4 text-gray-600">{r.experience_title}</td>
                          <td className="px-6 py-4 font-black">{r.amount_dzd.toLocaleString()} DZD</td>
                          <td className="px-6 py-4">{statusBadge(r.status)}</td>
                          <td className="px-6 py-4 text-gray-400 text-xs">
                            {r.redeemed_at ? new Date(r.redeemed_at).toLocaleDateString("fr-DZ") : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}