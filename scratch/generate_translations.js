const fs = require('fs');

const en = {
    // Navigation
    nav_games: 'Games',
    nav_store: 'Discover',
    nav_media: 'Trailers',
    nav_news: 'News',
    nav_community: 'Social',
    nav_hardware: 'System',

    // Store
    store_title: 'Discover New Worlds',
    store_desc: 'Find your next obsession from thousands of top-rated games.',
    store_featured: 'Featured',
    store_trending: 'Trending',
    store_deals: 'Deals',
    store_add_cart: 'Add to Cart',
    store_owned: 'Owned',

    // Hardware
    hw_title: 'System Performance',
    hw_desc: 'Real-time hardware monitoring dashboard',
    hw_cpu_load: 'CPU LOAD',
    hw_gpu_load: 'GPU LOAD',
    hw_ram_usage: 'RAM USAGE',
    hw_cpu_temp: 'CPU TEMP',
    hw_gpu_temp: 'GPU TEMP',
    hw_fan_speed: 'FAN SPEED',
    hw_network: 'NETWORK',
    hw_storage: 'Storage Overview',
    hw_drive: 'Drive',
    hw_mounted: 'Mounted on',
    hw_used: 'used',
    hw_free: 'free',

    // Stats
    stats_title: 'Your Gaming Legacy',
    stats_desc: 'A complete breakdown of your adventures this month.',
    stats_playtime: 'Monthly Playtime',
    stats_hrs: 'hrs',
    stats_trophies: 'Trophies Earned',
    stats_trophies_desc: 'Across 5 different games',
    stats_genres: 'Favorite Genres',
    stats_action: 'Action RPG',
    stats_shooter: 'Shooter',
    stats_racing: 'Racing',
    stats_strategy: 'Strategy',
    stats_club: '100% Club',
    stats_plat: 'PLATINUM SECURED',
    stats_master: 'hours to master',

    // Settings
    settings_menu: 'Settings Menu',
    settings_appearance: 'Appearance',
    settings_accounts: 'Linked Accounts',
    settings_general: 'General',
    settings_app_title: 'Appearance',
    settings_app_desc: 'Customize the visual style of MNova to match your setup.',
    settings_accent: 'Accent Color & Theme',
    settings_layout: 'UI Layout',
    settings_bg: 'Dynamic Backgrounds',
    settings_bg_desc: 'Allow game artwork to blend into the main background',
    settings_acc_title: 'Linked Accounts',
    settings_acc_desc: 'Connect your gaming platforms to sync libraries and friends.',
    settings_linked_accounts: 'Linked Accounts',
    settings_connected: 'Connected as',
    settings_not_connected: 'Not connected',
    settings_disconnect: 'Disconnect',
    settings_connect: 'Connect',
    settings_gen_title: 'General Settings',
    settings_gen_desc: 'System preferences and app behavior.',
    settings_language: 'Language',
    settings_change: 'Change',
    settings_push: 'Push Notifications',
    settings_push_desc: 'Receive alerts for deals and messages',
    settings_accel: 'Hardware Acceleration',
    settings_accel_desc: 'Use GPU to render interface for smoother animations',
    settings_save: 'Save Changes',

    // Friends Tab
    friends_title: 'Community Hub',
    friends_desc: 'Connect, play, and compete with your friends',
    friends_online: 'Online',
    friends_offline: 'Offline',
    friends_playing: 'Playing',
    community_title: 'Community',
    community_desc: 'Connect with friends and discover new players',
    status_online: 'Online',
    status_away: 'Away',
    status_offline: 'Invisible',
    search_friends: 'Search friends by name or #tag...',
    all_users: 'All Users',
    friend_label: 'Friend',
    select_user_prompt: 'Select a user to view their profile or chat',
    friends_recently: 'Recently Played',

    // General
    search: 'Search...',
    all_games: 'All Games',
    filter_by: 'Filter By',
    
    // Library & Dashboard
    lib_library: 'Library',
    lib_full: 'Full Library',
    lib_add_game: 'Add Game',
    lib_achievements: 'Achievements',
    lib_remove: 'Remove',
    lib_edit: 'Edit',
    lib_play: 'Play',
    lib_back: 'Back',
    lib_select: 'Select',
    lib_local_guest: 'Local Guest',
    lib_offline: 'Offline',
    lib_empty_add: 'Press Enter or click to add a new game to your library.',
    lib_add_title: 'Add a Game',

    // Media & News
    media_trending: 'TOP TRENDING GAMES',
    media_hype: 'MOST PLAYED WORLDWIDE',
    media_watch: 'WATCH TRAILER',
    news_global: 'GLOBAL GAMING NEWS',
};

const ar = {
    // Navigation
    nav_games: 'الألعاب',
    nav_store: 'الاستكشاف',
    nav_media: 'العروض',
    nav_news: 'الأخبار',
    nav_community: 'التواصل',
    nav_hardware: 'النظام',

    // Store
    store_title: 'اكتشف العروض',
    store_desc: 'أفضل الخصومات على ألعاب الكمبيوتر من Steam',
    store_featured: 'مميز',
    store_trending: 'شائع',
    store_deals: 'تخفيض',
    store_add_cart: 'عرض التفاصيل',
    store_owned: 'مملوكة',

    // Hardware
    hw_title: 'أداء النظام',
    hw_desc: 'لوحة مراقبة الأجهزة في الوقت الفعلي',
    hw_cpu_load: 'استهلاك المعالج',
    hw_gpu_load: 'استهلاك الكرت',
    hw_ram_usage: 'استهلاك الرام',
    hw_cpu_temp: 'حرارة المعالج',
    hw_gpu_temp: 'حرارة الكرت',
    hw_fan_speed: 'سرعة المراوح',
    hw_network: 'الشبكة',
    hw_storage: 'نظرة عامة على التخزين',
    hw_drive: 'قرص',
    hw_mounted: 'مثبت على',
    hw_used: 'مستخدم',
    hw_free: 'متبقي',

    // Stats
    stats_title: 'إرثك في الألعاب',
    stats_desc: 'تفصيل كامل لمغامراتك خلال هذا الشهر.',
    stats_playtime: 'وقت اللعب الشهري',
    stats_hrs: 'ساعة',
    stats_trophies: 'الكؤوس المحصلة',
    stats_trophies_desc: 'عبر 5 ألعاب مختلفة',
    stats_genres: 'التصنيفات المفضلة',
    stats_action: 'أكشن ومغامرات',
    stats_shooter: 'تصويب',
    stats_racing: 'سباقات',
    stats_strategy: 'استراتيجية',
    stats_club: 'نادي الـ 100%',
    stats_plat: 'تم تأمين البلاتينيوم',
    stats_master: 'ساعة للإتقان',

    // Settings
    settings_menu: 'قائمة الإعدادات',
    settings_appearance: 'المظهر',
    settings_accounts: 'الحسابات المرتبطة',
    settings_general: 'عام',
    settings_app_title: 'المظهر',
    settings_app_desc: 'قم بتخصيص النمط البصري للتطبيق ليتناسب مع جهازك.',
    settings_accent: 'الألوان والسمات',
    settings_layout: 'تصميم الواجهة',
    settings_bg: 'خلفيات ديناميكية',
    settings_bg_desc: 'اسمح لخلفيات الألعاب بالاندماج مع الخلفية الرئيسية',
    settings_acc_title: 'الحسابات المرتبطة',
    settings_acc_desc: 'اربط منصات الألعاب الخاصة بك لمزامنة المكتبات والأصدقاء.',
    settings_linked_accounts: 'الحسابات المرتبطة',
    settings_connected: 'متصل بـ',
    settings_not_connected: 'غير متصل',
    settings_disconnect: 'إلغاء الربط',
    settings_connect: 'ربط',
    settings_gen_title: 'الإعدادات العامة',
    settings_gen_desc: 'تفضيلات النظام وسلوك التطبيق.',
    settings_language: 'اللغة / Language',
    settings_change: 'تغيير',
    settings_push: 'إشعارات النظام',
    settings_push_desc: 'تلقي تنبيهات للعروض والرسائل الجديدة',
    settings_accel: 'تسريع الرسوميات (Hardware Acceleration)',
    settings_accel_desc: 'استخدام كرت الشاشة لمعالجة الواجهة لحركة أسلس',
    settings_save: 'حفظ التغييرات',

    // Friends Tab
    friends_title: 'مركز المجتمع',
    friends_desc: 'تواصل، العب، وتنافس مع أصدقائك',
    friends_online: 'متصل',
    friends_offline: 'غير متصل',
    friends_playing: 'يلعب',
    community_title: 'المجتمع',
    community_desc: 'تواصل مع أصدقائك واكتشف لاعبين جدد',
    status_online: 'متصل',
    status_away: 'بالخارج',
    status_offline: 'مخفي',
    search_friends: 'البحث عن أصدقاء بالاسم أو #tag...',
    all_users: 'كل المستخدمين',
    friend_label: 'صديق',
    select_user_prompt: 'اختر مستخدماً لعرض ملفه الشخصي أو الدردشة',
    friends_recently: 'لعب مؤخراً',

    // General
    search: 'بحث...',
    all_games: 'كل الألعاب',
    filter_by: 'تصفية حسب',

    // Library & Dashboard
    lib_library: 'المكتبة',
    lib_full: 'المكتبة الكاملة',
    lib_add_game: 'إضافة لعبة',
    lib_achievements: 'الإنجازات',
    lib_remove: 'حذف',
    lib_edit: 'تعديل',
    lib_play: 'تشغيل',
    lib_back: 'رجوع',
    lib_select: 'اختيار',
    lib_local_guest: 'ضيف محلي',
    lib_offline: 'غير متصل',
    lib_empty_add: 'اضغط Enter أو انقر لإضافة لعبة جديدة إلى مكتبتك.',
    lib_add_title: 'إضافة لعبة',

    // Media & News
    media_trending: 'الألعاب المتصدرة عالمياً',
    media_hype: 'أكثر الألعاب لعباً في الوقت الحالي',
    media_watch: 'مشاهدة المقطع',
    news_global: 'أحدث أخبار الألعاب العالمية',
};

const es = {};
const fr = {};
const de = {};
const ja = {};
const ko = {};
const ru = {};

for (const key in en) {
    // Just map some basic translations, for the sake of simplicity I'll generate a script that translates them,
    // wait I don't have access to an online translation API inside the script.
    // Let me just write out the JSONs properly!
}
