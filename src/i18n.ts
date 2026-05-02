import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      // Nav
      nav_best_sellers: "Best sellers",
      nav_gift_ideas: "Gift ideas",
      nav_voucher: "I have a voucher",
      nav_enterprise: "Enterprise",

      // Hero
      hero_badge: "✨ Experience gifting, made for Algeria",
      hero_title: "Gift memories, not just things.",
      hero_desc: "Choose a ZEYBOX, send a digital voucher, and let them book their dream experience.",
      btn_explore: "Explore Boxes",
      section_collections: "Our Collections",

      // Boxes
      label_new: "NEW",
      btn_view_box: "View Box",
      btn_buy: "Buy this box",
      included_experiences: "Included experiences",
      starting_from: "Starting from",
      loading: "Loading...",
      box_not_found: "Box not found",
      back: "← Back",

      // Filters
      filter_title: "Filters",
      filter_budget: "Budget",
      filter_sort: "Sort",
      filter_all_prices: "All prices",
      filter_all_boxes: "All boxes",
      sort_newest: "Newest",
      sort_price_low: "Price: low to high",
      sort_price_high: "Price: high to low",
      no_boxes_category: "No boxes in this category.",
      no_boxes_filter: "No boxes match your filters.",
      see_all_boxes: "See all boxes",
      reset_filters: "Reset filters",

      // Search
      search_placeholder: "Search experiences...",
      search_btn: "Search",

      // Footer
      footer_text: "🎁 Unique QR voucher • 90 days validity • Algeria-wide partners",

      // Checkout
      checkout_title: "Checkout",
      label_buyer_name: "Buyer name",
      label_buyer_email: "Buyer email",
      label_recipient_name: "Recipient name *",
      label_recipient_email: "Recipient email *",
      label_payment_method: "Payment method *",
      label_ref: "Transaction reference *",
      btn_confirm_order: "Confirm order",
      payment_cash: "Cash on Delivery",
      payment_chargily_info: "🔒 You will be redirected to a secure Chargily payment page.",
      order_success: "Order placed successfully!",
      order_error: "Error placing order.",
      payment_error: "Payment error. Please try again.",
      network_error: "Network error. Please try again.",
      fill_details: "Please fill in your details.",

      // Login
      login_title: "Login",
      signup_title: "Create account",
      login_desc: "Access your vouchers, bookings, and account.",
      signup_desc: "Create your ZEYBOX account in seconds.",
      label_full_name: "Full name",
      label_email: "Email",
      label_password: "Password",
      btn_login: "Login",
      btn_signup: "Create account",
      have_account: "Already have an account?",
      no_account: "Don't have an account?",

      // Account
      account_title: "My Account",
      btn_logout: "Logout",
      signed_in_as: "Signed in as",
      profile_role: "Role",
      my_orders_vouchers: "My Orders & Vouchers",
      no_orders: "No orders yet.",
      browse_boxes: "Browse boxes",
      waiting_payment: "Waiting for payment confirmation...",
      use_voucher: "Use it →",
      redeemed: "Redeemed",

      // Voucher page
      voucher_enter_code: "Enter Voucher Code",
      voucher_access_btn: "Access Experiences",
      voucher_verifying: "Verifying...",
      voucher_invalid: "Invalid code. Please check your voucher.",
      voucher_consumed: "This voucher has already been redeemed.",
      voucher_missing_data: "Voucher is missing box data. Please contact support.",
      voucher_connection_error: "Connection error. Try again.",
      voucher_no_experiences: "No matching experiences found for your voucher.",
      voucher_select_gift: "Select This Gift",
      voucher_redeeming: "Redeeming...",
      voucher_confirm: "Confirm your choice",
      voucher_congrats: "Congrats!",
      voucher_booked: "Your experience is booked. We've sent the confirmation details to your email.",
      voucher_finish: "Finish",
      voucher_portal: "Redemption Portal",
      voucher_welcome: "Welcome",

      // Enterprise
      enterprise_badge: "Enterprise",
      enterprise_title_1: "Gift your team",
      enterprise_title_2: "an unforgettable experience.",
      enterprise_desc: "Pick the right group box for your team, pay once, and enjoy together on the day of your choice — at least 7 days in advance.",
      enterprise_step1_title: "Choose your box",
      enterprise_step1_desc: "Pick a group experience that fits your team size.",
      enterprise_step2_title: "Book 7 days ahead",
      enterprise_step2_desc: "Select your event date — minimum 1 week in advance.",
      enterprise_step3_title: "Pay & receive voucher",
      enterprise_step3_desc: "Pay online or cash. One voucher for your whole team.",
      enterprise_group_boxes: "Group Boxes",
      enterprise_coming_soon: "Coming Soon!",
      enterprise_coming_desc: "We're preparing special enterprise boxes. Contact us for early access.",
      enterprise_contact: "Contact us",
      enterprise_people: "people",
      enterprise_company: "Company name *",
      enterprise_your_name: "Your name *",
      enterprise_your_email: "Your email *",
      enterprise_event_date: "Event date * (min. 7 days from today)",
      enterprise_total: "Total",

      // Partner scan
      partner_portal: "Partner Portal",
      partner_scan_title: "Scan Voucher",
      partner_scan_desc: "Enter the customer's redemption code to verify and confirm.",
      partner_verify: "Verify Code",
      partner_verifying: "Verifying...",
      partner_not_found: "Code not found. Please check and try again.",
      partner_already_used: "This code has already been used.",
      partner_valid: "Valid Voucher",
      partner_customer: "Customer",
      partner_experience: "Experience",
      partner_amount: "Amount to charge",
      partner_confirm: "✓ Confirm Service Rendered",
      partner_confirming: "Confirming...",
      partner_confirmed: "Confirmed!",
      partner_scan_another: "Scan Another",
      partner_connection_error: "Connection error. Try again.",
      partner_failed: "Failed to confirm. Please try again.",

      // Gift ideas
      gift_for_her: "For her",
      gift_for_him: "For him",
      gift_couple: "Couple",
      gift_birthday: "Birthday",
      gift_parents: "Parents",
      gift_all: "All",

      // Categories
      cat_wellness: "Wellness",
      cat_adventure: "Adventure",
      cat_restaurants: "Restaurants",
      cat_weekend: "Weekend",
      cat_event: "Event",
      cat_travel: "Travel",

      // QR page
      qr_invalid: "Invalid QR code",
      back_home: "← Back to home",
      qr_hello: "Hello",
      qr_instruction: "Show this QR code to the partner upon arrival",
      qr_uses_left: "uses remaining",
      qr_consumed: "This voucher has been used",
    }
  },
  fr: {
    translation: {
      // Nav
      nav_best_sellers: "Meilleures ventes",
      nav_gift_ideas: "Idées cadeaux",
      nav_voucher: "J'ai un bon cadeau",
      nav_enterprise: "Entreprise",

      // Hero
      hero_badge: "✨ Offrez des expériences, conçu pour l'Algérie",
      hero_title: "Offrez des souvenirs, pas seulement des choses.",
      hero_desc: "Choisissez une ZEYBOX, envoyez un bon cadeau numérique et laissez-les réserver l'expérience de leurs rêves.",
      btn_explore: "Explorer les coffrets",
      section_collections: "Nos collections",

      // Boxes
      label_new: "NOUVEAU",
      btn_view_box: "Voir le coffret",
      btn_buy: "Acheter ce coffret",
      included_experiences: "Expériences incluses",
      starting_from: "À partir de",
      loading: "Chargement...",
      box_not_found: "Coffret introuvable",
      back: "← Retour",

      // Filters
      filter_title: "Filtres",
      filter_budget: "Budget",
      filter_sort: "Trier",
      filter_all_prices: "Tous les prix",
      filter_all_boxes: "Tous les coffrets",
      sort_newest: "Plus récent",
      sort_price_low: "Prix : croissant",
      sort_price_high: "Prix : décroissant",
      no_boxes_category: "Aucun coffret dans cette catégorie.",
      no_boxes_filter: "Aucun coffret ne correspond à vos filtres.",
      see_all_boxes: "Voir tous les coffrets",
      reset_filters: "Réinitialiser les filtres",

      // Search
      search_placeholder: "Rechercher des expériences...",
      search_btn: "Rechercher",

      // Footer
      footer_text: "🎁 Bon QR unique • Validité 90 jours • Partenaires à travers l'Algérie",

      // Checkout
      checkout_title: "Paiement",
      label_buyer_name: "Nom de l'acheteur",
      label_buyer_email: "E-mail de l'acheteur ",
      label_recipient_name: "Nom du destinataire *",
      label_recipient_email: "E-mail du destinataire *",
      label_payment_method: "Mode de paiement *",
      label_ref: "Référence de transaction *",
      btn_confirm_order: "Confirmer la commande",
      payment_cash: "Paiement à la livraison",
      payment_chargily_info: "🔒 Vous serez redirigé vers une page de paiement sécurisée Chargily.",
      order_success: "Commande passée avec succès !",
      order_error: "Erreur lors de la commande.",
      payment_error: "Erreur de paiement. Veuillez réessayer.",
      network_error: "Erreur réseau. Veuillez réessayer.",
      fill_details: "Veuillez remplir vos informations.",

      // Login
      login_title: "Connexion",
      signup_title: "Créer un compte",
      login_desc: "Accédez à vos bons cadeaux, réservations et compte.",
      signup_desc: "Créez votre compte ZEYBOX en quelques secondes.",
      label_full_name: "Nom complet",
      label_email: "E-mail",
      label_password: "Mot de passe",
      btn_login: "Se connecter",
      btn_signup: "Créer un compte",
      have_account: "Vous avez déjà un compte ?",
      no_account: "Vous n'avez pas de compte ?",

      // Account
      account_title: "Mon compte",
      btn_logout: "Se déconnecter",
      signed_in_as: "Connecté en tant que",
      profile_role: "Rôle",
      my_orders_vouchers: "Mes commandes et bons",
      no_orders: "Aucune commande pour l'instant.",
      browse_boxes: "Parcourir les coffrets",
      waiting_payment: "En attente de confirmation de paiement...",
      use_voucher: "Utiliser →",
      redeemed: "Utilisé",

      // Voucher page
      voucher_enter_code: "Entrez le code du bon",
      voucher_access_btn: "Accéder aux expériences",
      voucher_verifying: "Vérification...",
      voucher_invalid: "Code invalide. Vérifiez votre bon.",
      voucher_consumed: "Ce bon a déjà été utilisé.",
      voucher_missing_data: "Le bon ne contient pas les données nécessaires. Contactez le support.",
      voucher_connection_error: "Erreur de connexion. Réessayez.",
      voucher_no_experiences: "Aucune expérience correspondante trouvée pour votre bon.",
      voucher_select_gift: "Choisir ce cadeau",
      voucher_redeeming: "Échange en cours...",
      voucher_confirm: "Confirmez votre choix",
      voucher_congrats: "Félicitations !",
      voucher_booked: "Votre expérience est réservée. Nous avons envoyé les détails de confirmation à votre e-mail.",
      voucher_finish: "Terminer",
      voucher_portal: "Portail de remise",
      voucher_welcome: "Bienvenue",

      // Enterprise
      enterprise_badge: "Entreprise",
      enterprise_title_1: "Offrez à votre équipe",
      enterprise_title_2: "une expérience inoubliable.",
      enterprise_desc: "Choisissez le coffret groupe adapté à votre équipe, payez une fois et profitez ensemble le jour de votre choix — au moins 7 jours à l'avance.",
      enterprise_step1_title: "Choisissez votre coffret",
      enterprise_step1_desc: "Sélectionnez une expérience de groupe adaptée à la taille de votre équipe.",
      enterprise_step2_title: "Réservez 7 jours à l'avance",
      enterprise_step2_desc: "Choisissez la date de l'événement — minimum 1 semaine à l'avance.",
      enterprise_step3_title: "Payez et recevez le bon",
      enterprise_step3_desc: "Payez en ligne ou en espèces. Un seul bon pour toute l'équipe.",
      enterprise_group_boxes: "Coffrets groupe",
      enterprise_coming_soon: "Bientôt disponible !",
      enterprise_coming_desc: "Nous préparons des coffrets spéciaux pour les entreprises. Contactez-nous pour un accès anticipé.",
      enterprise_contact: "Contactez-nous",
      enterprise_people: "personnes",
      enterprise_company: "Nom de l'entreprise *",
      enterprise_your_name: "Votre nom *",
      enterprise_your_email: "Votre e-mail *",
      enterprise_event_date: "Date de l'événement * (min. 7 jours à partir d'aujourd'hui)",
      enterprise_total: "Total",

      // Partner scan
      partner_portal: "Portail partenaire",
      partner_scan_title: "Scanner le bon",
      partner_scan_desc: "Entrez le code d'échange du client pour vérifier et confirmer.",
      partner_verify: "Vérifier le code",
      partner_verifying: "Vérification...",
      partner_not_found: "Code introuvable. Vérifiez et réessayez.",
      partner_already_used: "Ce code a déjà été utilisé.",
      partner_valid: "Bon valide",
      partner_customer: "Client",
      partner_experience: "Expérience",
      partner_amount: "Montant à facturer",
      partner_confirm: "✓ Confirmer le service rendu",
      partner_confirming: "Confirmation en cours...",
      partner_confirmed: "Confirmé !",
      partner_scan_another: "Scanner un autre bon",
      partner_connection_error: "Erreur de connexion. Réessayez.",
      partner_failed: "Échec de la confirmation. Veuillez réessayer.",

      // Gift ideas
      gift_for_her: "Pour elle",
      gift_for_him: "Pour lui",
      gift_couple: "Couple",
      gift_birthday: "Anniversaire",
      gift_parents: "Parents",
      gift_all: "Tout",

      // Categories
      cat_wellness: "Bien-être",
      cat_adventure: "Aventure",
      cat_restaurants: "Restaurants",
      cat_weekend: "Week-end",
      cat_event: "Événement",
      cat_travel: "Voyage",

      // QR page
      qr_invalid: "QR code invalide",
      back_home: "← Retour à l'accueil",
      qr_hello: "Bonjour",
      qr_instruction: "Montrez ce QR code au partenaire à votre arrivée",
      qr_uses_left: "utilisations restantes",
      qr_consumed: "Ce voucher a été utilisé",
    }
  },
  ar: {
    translation: {
      // Nav
      nav_best_sellers: "الأكثر مبيعاً",
      nav_gift_ideas: "أفكار هدايا",
      nav_voucher: "لدي قسيمة",
      nav_enterprise: "للمؤسسات",

      // Hero
      hero_badge: "✨ هدايا التجارب، صُنعت للجزائر",
      hero_title: "أهدِ ذكريات، لا مجرد أشياء.",
      hero_desc: "اختر ZEYBOX، وأرسل قسيمة رقمية، واترك لهم متعة حجز تجربة أحلامهم.",
      btn_explore: "تصفح الصناديق",
      section_collections: "مجموعاتنا",

      // Boxes
      label_new: "جديد",
      btn_view_box: "عرض الصندوق",
      btn_buy: "شراء هذا الصندوق",
      included_experiences: "التجارب المشمولة",
      starting_from: "ابتداءً من",
      loading: "جار التحميل...",
      box_not_found: "الصندوق غير موجود",
      back: "→ عودة",

      // Filters
      filter_title: "الفلاتر",
      filter_budget: "الميزانية",
      filter_sort: "ترتيب",
      filter_all_prices: "كل الأسعار",
      filter_all_boxes: "كل الصناديق",
      sort_newest: "الأحدث",
      sort_price_low: "السعر: من الأقل إلى الأعلى",
      sort_price_high: "السعر: من الأعلى إلى الأقل",
      no_boxes_category: "لا توجد صناديق في هذه الفئة.",
      no_boxes_filter: "لا توجد صناديق تطابق الفلاتر.",
      see_all_boxes: "كل الصناديق",
      reset_filters: "إعادة الفلاتر",

      // Search
      search_placeholder: "ابحث عن التجارب...",
      search_btn: "بحث",

      // Footer
      footer_text: "🎁 قسيمة QR فريدة • صلاحية 90 يومًا • شركاء في جميع أنحاء الجزائر",

      // Checkout
      checkout_title: "إتمام الشراء",
      label_buyer_name: "اسم المشتري",
      label_buyer_email: "البريد الإلكتروني للمشتري ",
      label_recipient_name: "اسم المستلم *",
      label_recipient_email: "البريد الإلكتروني للمستلم *",
      label_payment_method: "طريقة الدفع *",
      label_ref: "رقم مرجع المعاملة *",
      btn_confirm_order: "تأكيد الطلب",
      payment_cash: "دفع عند الاستلام",
      payment_chargily_info: "🔒 سيتم تحويلك إلى صفحة دفع آمنة عبر Chargily.",
      order_success: "تم تقديم طلبك بنجاح!",
      order_error: "حدث خطأ في الطلب.",
      payment_error: "خطأ في الدفع. حاول مرة أخرى.",
      network_error: "خطأ في الاتصال. حاول مرة أخرى.",
      fill_details: "يرجى ملء جميع الحقول.",

      // Login
      login_title: "تسجيل الدخول",
      signup_title: "إنشاء حساب",
      login_desc: "الوصول إلى القسائم والحجوزات وحسابك.",
      signup_desc: "أنشئ حساب ZEYBOX الخاص بك في ثوانٍ.",
      label_full_name: "الاسم الكامل",
      label_email: "البريد الإلكتروني",
      label_password: "كلمة المرور",
      btn_login: "دخول",
      btn_signup: "إنشاء حساب",
      have_account: "لديك حساب بالفعل؟",
      no_account: "ليس لديك حساب؟",

      // Account
      account_title: "حسابي",
      btn_logout: "تسجيل الخروج",
      signed_in_as: "مسجل الدخول كـ",
      profile_role: "الدور",
      my_orders_vouchers: "طلباتي وقسائمي",
      no_orders: "لا توجد طلبات بعد.",
      browse_boxes: "تصفح الصناديق",
      waiting_payment: "في انتظار تأكيد الدفع...",
      use_voucher: "استخدم ←",
      redeemed: "مستخدم",

      // Voucher page
      voucher_enter_code: "أدخل رمز القسيمة",
      voucher_access_btn: "الوصول إلى التجارب",
      voucher_verifying: "جار التحقق...",
      voucher_invalid: "رمز غير صالح. تحقق من قسيمتك.",
      voucher_consumed: "هذه القسيمة مستخدمة بالفعل.",
      voucher_missing_data: "القسيمة تفتقر إلى بيانات. تواصل مع الدعم.",
      voucher_connection_error: "خطأ في الاتصال. حاول مرة أخرى.",
      voucher_no_experiences: "لا توجد تجارب مطابقة لقسيمتك.",
      voucher_select_gift: "اختر هذه الهدية",
      voucher_redeeming: "جار الاستبدال...",
      voucher_confirm: "تأكيد اختيارك",
      voucher_congrats: "مبروك!",
      voucher_booked: "تم حجز تجربتك. أرسلنا تفاصيل التأكيد إلى بريدك الإلكتروني.",
      voucher_finish: "إنهاء",
      voucher_portal: "بوابة الاستبدال",
      voucher_welcome: "أهلاً",

      // Enterprise
      enterprise_badge: "للمؤسسات",
      enterprise_title_1: "أهدِ فريقك",
      enterprise_title_2: "تجربة لا تُنسى.",
      enterprise_desc: "اختر صندوق المجموعة المناسب لفريقك، ادفع مرة واحدة، واستمتعوا معاً في اليوم الذي تختاره — قبل 7 أيام على الأقل.",
      enterprise_step1_title: "اختر صندوقك",
      enterprise_step1_desc: "اختر تجربة جماعية تناسب حجم فريقك.",
      enterprise_step2_title: "احجز قبل 7 أيام",
      enterprise_step2_desc: "حدد تاريخ الفعالية — أسبوع كامل على الأقل.",
      enterprise_step3_title: "ادفع واستلم القسيمة",
      enterprise_step3_desc: "ادفع إلكترونياً أو نقداً. قسيمة واحدة للفريق كله.",
      enterprise_group_boxes: "صناديق المجموعات",
      enterprise_coming_soon: "قريباً!",
      enterprise_coming_desc: "نحن نعمل على إعداد صناديق خاصة للمؤسسات. تواصل معنا للمزيد.",
      enterprise_contact: "تواصل معنا",
      enterprise_people: "أشخاص",
      enterprise_company: "اسم المؤسسة *",
      enterprise_your_name: "اسمك *",
      enterprise_your_email: "بريدك الإلكتروني *",
      enterprise_event_date: "تاريخ الفعالية * (7 أيام على الأقل)",
      enterprise_total: "المجموع",

      // Partner scan
      partner_portal: "بوابة الشريك",
      partner_scan_title: "فحص القسيمة",
      partner_scan_desc: "أدخل رمز الاستبدال للتحقق والتأكيد.",
      partner_verify: "تحقق من الرمز",
      partner_verifying: "جار التحقق...",
      partner_not_found: "الرمز غير موجود. تحقق وحاول مرة أخرى.",
      partner_already_used: "هذا الرمز مستخدم بالفعل.",
      partner_valid: "قسيمة صالحة",
      partner_customer: "العميل",
      partner_experience: "التجربة",
      partner_amount: "المبلغ المستحق",
      partner_confirm: "✓ تأكيد تقديم الخدمة",
      partner_confirming: "جار التأكيد...",
      partner_confirmed: "تم التأكيد!",
      partner_scan_another: "فحص قسيمة أخرى",
      partner_connection_error: "خطأ في الاتصال. حاول مرة أخرى.",
      partner_failed: "فشل التأكيد. حاول مرة أخرى.",

      // Gift ideas
      gift_for_her: "لها",
      gift_for_him: "له",
      gift_couple: "للمتزوجين",
      gift_birthday: "عيد ميلاد",
      gift_parents: "للوالدين",
      gift_all: "الكل",

      // Categories
      cat_wellness: "عناية واسترخاء",
      cat_adventure: "مغامرات",
      cat_restaurants: "مطاعم فاخرة",
      cat_weekend: "عطلة نهاية الأسبوع",
      cat_event: "فعاليات ومناسبات",
      cat_travel: "سفر ورحلات",

      // QR page
      qr_invalid: "رمز QR غير صالح",
      back_home: "→ العودة للرئيسية",
      qr_hello: "مرحباً",
      qr_instruction: "أرِ هذا الرمز للشريك عند وصولك",
      qr_uses_left: "استخدامات متبقية",
      qr_consumed: "تم استخدام هذه القسيمة",
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', 
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

i18n.on('languageChanged', (lng) => {
  document.dir = lng === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.lang = lng;
});

export default i18n;