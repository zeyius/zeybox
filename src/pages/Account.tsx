import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom"; // Added Link
import { supabase } from "../lib/supabaseClient";
import { useTranslation } from "react-i18next"; // Added i18n

type Profile = {
  user_id: string;
  role: "CUSTOMER" | "PARTNER" | "ADMIN";
  full_name: string | null;
  phone: string | null;
};

export default function Account() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data: authData } = await supabase.auth.getUser();
      const user = authData.user;

      if (!user) {
        navigate("/login");
        return;
      }

      setEmail(user.email ?? null);

      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, role, full_name, phone")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) console.error(error);
      setProfile((data as Profile) ?? null);
      setLoading(false);
    };

    load();
  }, [navigate]);

  const logout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold">{t('account_title')}</h1>

      {loading ? (
        <p className="mt-6 text-gray-600">{i18n.language === 'en' ? 'Loading...' : 'جارِ التحميل...'}</p>
      ) : (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-3xl border border-gray-200 p-6">
            <div className="text-sm text-gray-500">{t('signed_in_as')}</div>
            <div className="mt-1 font-semibold">{email ?? "—"}</div>

            <div className="mt-6 text-sm text-gray-500">{i18n.language === 'en' ? 'Profile' : 'الملف الشخصي'}</div>
            <div className="mt-1">
              <div>
                <span className="text-gray-500">{t('label_full_name')}: </span>
                <span className="font-medium">{profile?.full_name || "—"}</span>
              </div>
              <div className="mt-1">
                <span className="text-gray-500">{t('profile_role')}: </span>
                <span className="font-medium">{profile?.role || "—"}</span>
              </div>
            </div>

            <button
              onClick={logout}
              className="mt-6 w-full px-4 py-3 rounded-xl bg-black text-white font-semibold hover:bg-red-600 transition-colors"
            >
              {t('btn_logout')}
            </button>
          </div>

          <div className="rounded-3xl border border-gray-200 p-6">
            <div className="font-semibold">{i18n.language === 'en' ? 'My vouchers' : 'قسائمي'}</div>
            <p className="mt-2 text-sm text-gray-600">
                {i18n.language === 'en' 
                  ? "Vouchers linked to your account will appear here." 
                  : "ستظهر القسائم المرتبطة بحسابك هنا."}
            </p>

            <div className="mt-4 rounded-2xl bg-gray-50 border border-gray-200 p-4 text-sm text-gray-700">
                <Link to="/best-sellers" className="text-red-600 font-bold hover:underline">
                  {i18n.language === 'en' ? "Browse collections →" : "تصفح المجموعات ←"}
                </Link>
            </div>
            </div>
        </div>
      )}
    </main>
  );
}