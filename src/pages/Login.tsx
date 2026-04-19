import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate} from "react-router-dom"; // Added Link
import { useTranslation } from "react-i18next"; // Added i18n

export default function Login() {
  const { t, i18n } = useTranslation();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const navigate = useNavigate();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    setLoading(true);

    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName } },
        });
        if (error) throw error;
        navigate("/");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate("/");
      }
    } catch (err: any) {
      setMsg(err?.message ?? (i18n.language === 'en' ? "Something went wrong" : "حدث خطأ ما"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-3xl border border-gray-200 p-8 shadow-sm">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">
            {mode === "login" ? t('login_title') : t('signup_title')}
          </h1>
          <button
            type="button"
            className="text-sm font-semibold hover:underline text-red-600"
            onClick={() => {
              setMsg(null);
              setMode(mode === "login" ? "signup" : "login");
            }}
          >
            {mode === "login" ? t('signup_title') : t('login_title')}
          </button>
        </div>

        <p className="mt-2 text-gray-600 text-sm">
          {mode === "login" ? t('login_desc') : t('signup_desc')}
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          {mode === "signup" && (
            <div>
              <label className="text-sm font-medium">{t('label_full_name')}</label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-black"
                placeholder={t("label_full_name")}
                required
              />
            </div>
          )}

          <div>
            <label className="text-sm font-medium">{t('label_email')}</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-black text-start"
              placeholder="you@email.com"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">{t('label_password')}</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-black text-start"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          <button
            disabled={loading}
            type="submit"
            className="w-full rounded-xl bg-black text-white py-3 font-semibold hover:bg-red-600 transition disabled:opacity-60"
          >
            {loading
              ? (t('loading'))
              : mode === "login" ? t('login_title') : t('signup_title')}
          </button>
        </form>

        {msg && (
          <div className="mt-4 text-sm rounded-xl border border-red-200 bg-red-50 p-3 text-red-600">
            {msg}
          </div>
        )}

        <div className="mt-6 text-xs text-gray-500">
          {i18n.language === 'en' 
            ? t('have_account') ? t('have_account') : 'By continuing you agree to ZEYBOX terms.' 
            : "بالاستمرار ، فإنك توافق على شروط ZEYBOX."}
        </div>
      </div>
    </div>
  );
}