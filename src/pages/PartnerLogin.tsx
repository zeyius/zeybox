import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

export default function PartnerLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError("Email ou mot de passe incorrect.");
      setLoading(false);
      return;
    }

    // Check role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, partner_id")
      .eq("user_id", data.user.id)
      .maybeSingle();

    if (profile?.role !== "PARTNER" || !profile?.partner_id) {
      await supabase.auth.signOut();
      setError("Accès non autorisé. Ce portail est réservé aux partenaires.");
      setLoading(false);
      return;
    }

    navigate("/partner/scan");
  };

  return (
    <main className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center gap-2 justify-center mb-10">
          <div className="h-9 w-9 rounded-xl bg-red-600" />
          <span className="text-xl font-black tracking-tighter text-white">ZEYBOX</span>
          <span className="text-gray-500 text-sm font-medium ms-1">Partner</span>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
          <h1 className="text-2xl font-black text-white mb-1">Connexion</h1>
          <p className="text-gray-400 text-sm mb-8">Portail partenaire ZEYBOX</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-black uppercase tracking-widest text-gray-400 block mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="vous@exemple.com"
                className="w-full rounded-2xl bg-white/5 border border-white/10 px-5 py-4 text-white outline-none focus:ring-2 focus:ring-yellow-400 placeholder:text-gray-600"
              />
            </div>

            <div>
              <label className="text-xs font-black uppercase tracking-widest text-gray-400 block mb-2">
                Mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full rounded-2xl bg-white/5 border border-white/10 px-5 py-4 text-white outline-none focus:ring-2 focus:ring-yellow-400 placeholder:text-gray-600"
              />
            </div>

            {error && (
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center font-bold">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-white text-black font-black uppercase tracking-widest hover:bg-yellow-400 transition-all disabled:opacity-30 mt-2"
            >
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}