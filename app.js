/**
 * HadirKu - Absensi Mudah, Kerja Lebih Bermakna
 * Full Implementation with PDF Official Report, Confirmation Modal, 7-Hour Target & Custom Splash
 */

(() => {
  'use strict';

  // --- Constants & Storage Keys ---
  const THEME_KEY = 'hadirku_theme';
  const CFG_URL_KEY = 'absensiku_supabase_url';
  const CFG_KEY_KEY = 'absensiku_supabase_key';
  const PDF_INFO_KEY = 'hadirku_pdf_officials';
  const USER_PROFILE_KEY = 'hadirku_user_profile';
  const NOTIF_SETTINGS_KEY = 'hadirku_notif_settings';
  const NOTIF_SENT_LOG_KEY = 'hadirku_notif_sent_log';
  const CIRCLE_CIRCUMFERENCE = 314.159; // 2 * PI * 50
  const TARGET_WORK_MINUTES = 420; // 7 jam kerja: 07.30 - 14.30 WITA

  // --- State ---
  let supabase = null;
  let currentUser = null;
  let records = [];       // Attendance records from Supabase
  let allTasks = [];      // Tasks from Supabase
  let timerInterval = null;
  let activeTab = 'home';
  let taskFilter = 'all';
  let currentHistoryPeriod = new Date(); // for history month view

  // --- DOM Elements ---
  const splashScreen = document.getElementById('splashScreen');
  const authSection = document.getElementById('authSection');
  const appSection = document.getElementById('appSection');
  const bottomNav = document.getElementById('bottomNav');

  // Auth Elements
  const tabLoginBtn = document.getElementById('tabLoginBtn');
  const tabRegisterBtn = document.getElementById('tabRegisterBtn');
  const authForm = document.getElementById('authForm');
  const authEmail = document.getElementById('authEmail');
  const authPassword = document.getElementById('authPassword');
  const togglePasswordBtn = document.getElementById('togglePasswordBtn');
  const authSubmitBtn = document.getElementById('authSubmitBtn');
  const authSubmitText = document.getElementById('authSubmitText');
  const openConfigBtnAuth = document.getElementById('openConfigBtnAuth');
  let isRegisterMode = false;

  // Header Elements (Home)
  const userAvatarContainer = document.getElementById('userAvatarContainer');
  const greetingNameDisplay = document.getElementById('greetingNameDisplay');
  const notificationBtn = document.getElementById('notificationBtn');
  const notifActiveDot = document.getElementById('notifActiveDot');
  const pwaHomeBanner = document.getElementById('pwaHomeBanner');
  const dismissPwaBannerBtn = document.getElementById('dismissPwaBannerBtn');
  const installPwaBannerBtn = document.getElementById('installPwaBannerBtn');

  // Today Circular Ring & Status Card
  const todayFullDateText = document.getElementById('todayFullDateText');
  const todayStatusBadge = document.getElementById('todayStatusBadge');
  const circularProgressArc = document.getElementById('circularProgressArc');
  const circularWorkedTime = document.getElementById('circularWorkedTime');
  const todayCheckInText = document.getElementById('todayCheckInText');
  const todayCheckOutText = document.getElementById('todayCheckOutText');
  const subPunchInText = document.getElementById('subPunchInText');
  const subTotalHoursText = document.getElementById('subTotalHoursText');
  const openAjukanIzinBtn = document.getElementById('openAjukanIzinBtn');

  // Floating Center FAB
  const centerFabAbsenBtn = document.getElementById('centerFabAbsenBtn');

  // Weekly Calendar
  const weekRangeLabel = document.getElementById('weekRangeLabel');
  const weeklyCalendarGrid = document.getElementById('weeklyCalendarGrid');

  // Home Task Preview
  const homeTaskProgressCount = document.getElementById('homeTaskProgressCount');
  const homeTaskProgressBar = document.getElementById('homeTaskProgressBar');
  const homeTaskListPreview = document.getElementById('homeTaskListPreview');
  const homeViewAllTasksLink = document.getElementById('homeViewAllTasksLink');

  // Home Monthly Summary
  const homeMonthLabel = document.getElementById('homeMonthLabel');
  const summaryHadirCount = document.getElementById('summaryHadirCount');
  const summaryTerlambatCount = document.getElementById('summaryTerlambatCount');
  const summaryIzinCount = document.getElementById('summaryIzinCount');
  const summaryTotalHoursCount = document.getElementById('summaryTotalHoursCount');

  // Timeline Aktivitas Hari Ini
  const timelineDotMasuk = document.getElementById('timelineDotMasuk');
  const timelineTimeMasuk = document.getElementById('timelineTimeMasuk');
  const timelineDotPulang = document.getElementById('timelineDotPulang');
  const timelineTimePulang = document.getElementById('timelineTimePulang');

  // Tab Contents
  const tabContentHome = document.getElementById('tabContentHome');
  const tabContentHistory = document.getElementById('tabContentHistory');
  const tabContentTasks = document.getElementById('tabContentTasks');
  const tabContentProfile = document.getElementById('tabContentProfile');

  // Tasks Tab Elements
  const tasksSubtitleProgress = document.getElementById('tasksSubtitleProgress');
  const tasksPercentBadge = document.getElementById('tasksPercentBadge');
  const tasksProgressBar = document.getElementById('tasksProgressBar');
  const fullTaskListContainer = document.getElementById('fullTaskListContainer');
  const emptyTasksFullState = document.getElementById('emptyTasksFullState');
  const openAddTaskModalBtn = document.getElementById('openAddTaskModalBtn');

  // Pomodoro & Water Tracker Elements
  const pomoModeBadge = document.getElementById('pomoModeBadge');
  const pomoTimerText = document.getElementById('pomoTimerText');
  const pomoStartPauseBtn = document.getElementById('pomoStartPauseBtn');
  const pomoPlayIcon = document.getElementById('pomoPlayIcon');
  const pomoPlayText = document.getElementById('pomoPlayText');
  const pomoResetBtn = document.getElementById('pomoResetBtn');

  const waterMlText = document.getElementById('waterMlText');
  const waterGlassesCount = document.getElementById('waterGlassesCount');
  const waterProgressBar = document.getElementById('waterProgressBar');
  const addWaterBtn = document.getElementById('addWaterBtn');
  const resetWaterBtn = document.getElementById('resetWaterBtn');

  // History Tab Elements
  const prevMonthBtn = document.getElementById('prevMonthBtn');
  const nextMonthBtn = document.getElementById('nextMonthBtn');
  const currentPeriodLabel = document.getElementById('currentPeriodLabel');
  const histHadirCount = document.getElementById('histHadirCount');
  const histTerlambatCount = document.getElementById('histTerlambatCount');
  const histIzinCount = document.getElementById('histIzinCount');
  const histAlpaCount = document.getElementById('histAlpaCount');
  const historyListContainer = document.getElementById('historyListContainer');
  const emptyHistoryState = document.getElementById('emptyHistoryState');
  const exportCsvBtn = document.getElementById('exportCsvBtn');

  // Profile Tab Elements
  const profileAvatarInitial = document.getElementById('profileAvatarInitial');
  const profileNameDisplay = document.getElementById('profileNameDisplay');
  const profileEmailDisplay = document.getElementById('profileEmailDisplay');
  const openEditProfileBtn = document.getElementById('openEditProfileBtn');
  const openConfigBtnProfile = document.getElementById('openConfigBtnProfile');
  const pwaInstallBtnProfile = document.getElementById('pwaInstallBtnProfile');
  const pwaStatusTextProfile = document.getElementById('pwaStatusTextProfile');
  const openNotificationSettingsBtn = document.getElementById('openNotificationSettingsBtn');
  const notificationStatusTextProfile = document.getElementById('notificationStatusTextProfile');
  const themeToggleBtnProfile = document.getElementById('themeToggleBtnProfile');
  const profileThemeIcon = document.getElementById('profileThemeIcon');
  const profileThemeText = document.getElementById('profileThemeText');
  const logoutBtnProfile = document.getElementById('logoutBtnProfile');

  // Confirm Pulang Modal
  const confirmPulangModal = document.getElementById('confirmPulangModal');
  const confirmPulangCurrentTime = document.getElementById('confirmPulangCurrentTime');
  const cancelConfirmPulangBtn = document.getElementById('cancelConfirmPulangBtn');
  const proceedConfirmPulangBtn = document.getElementById('proceedConfirmPulangBtn');

  // Absen Success Modal
  const absenSuccessModal = document.getElementById('absenSuccessModal');
  const modalSuccessBadge = document.getElementById('modalSuccessBadge');
  const modalSuccessTitle = document.getElementById('modalSuccessTitle');
  const modalSuccessTime = document.getElementById('modalSuccessTime');
  const modalSuccessDate = document.getElementById('modalSuccessDate');
  const modalSuccessSubtitle = document.getElementById('modalSuccessSubtitle');
  const closeSuccessModalBtn = document.getElementById('closeSuccessModalBtn');

  // Export PDF Modal & Form Elements
  const openExportPdfModalBtn = document.getElementById('openExportPdfModalBtn');
  const exportPdfModal = document.getElementById('exportPdfModal');
  const exportPdfForm = document.getElementById('exportPdfForm');
  const closeExportPdfModalBtn = document.getElementById('closeExportPdfModalBtn');
  const cancelExportPdfBtn = document.getElementById('cancelExportPdfBtn');
  const pdfNamaPegawai = document.getElementById('pdfNamaPegawai');
  const pdfNipPegawai = document.getElementById('pdfNipPegawai');
  const pdfJabatanPegawai = document.getElementById('pdfJabatanPegawai');
  const pdfNamaAtasan = document.getElementById('pdfNamaAtasan');
  const pdfNipAtasan = document.getElementById('pdfNipAtasan');
  const pdfJabatanAtasan = document.getElementById('pdfJabatanAtasan');
  const pdfKotaTtd = document.getElementById('pdfKotaTtd');
  const pdfPeriodeDisplay = document.getElementById('pdfPeriodeDisplay');

  // Printable Report Elements
  const printableReportContainer = document.getElementById('printableReportContainer');
  const printReportPeriodeTitle = document.getElementById('printReportPeriodeTitle');
  const printNamaPegawai = document.getElementById('printNamaPegawai');
  const printNipPegawai = document.getElementById('printNipPegawai');
  const printJabatanPegawai = document.getElementById('printJabatanPegawai');
  const printTotalHariHadir = document.getElementById('printTotalHariHadir');
  const printTotalJamKerja = document.getElementById('printTotalJamKerja');
  const printAttendanceTableBody = document.getElementById('printAttendanceTableBody');
  const printJabatanAtasan = document.getElementById('printJabatanAtasan');
  const printNamaAtasan = document.getElementById('printNamaAtasan');
  const printNipAtasan = document.getElementById('printNipAtasan');
  const printKotaTanggalCetak = document.getElementById('printKotaTanggalCetak');
  const printNamaPegawaiBawah = document.getElementById('printNamaPegawaiBawah');
  const printNipPegawaiBawah = document.getElementById('printNipPegawaiBawah');

  // Calendar Detail Modal
  const calendarDetailModal = document.getElementById('calendarDetailModal');
  const calDetailDateTitle = document.getElementById('calDetailDateTitle');
  const calDetailBody = document.getElementById('calDetailBody');
  const closeCalDetailModalBtn = document.getElementById('closeCalDetailModalBtn');

  // Add Task Modal
  const addTaskModal = document.getElementById('addTaskModal');
  const addTaskModalForm = document.getElementById('addTaskModalForm');
  const modalTaskTitle = document.getElementById('modalTaskTitle');
  const modalTaskDesc = document.getElementById('modalTaskDesc');
  const modalTaskDueDate = document.getElementById('modalTaskDueDate');
  const modalTaskPriority = document.getElementById('modalTaskPriority');
  const closeAddTaskModalBtn = document.getElementById('closeAddTaskModalBtn');
  const cancelAddTaskModalBtn = document.getElementById('cancelAddTaskModalBtn');

  // Config Modal
  const configModal = document.getElementById('configModal');
  const configForm = document.getElementById('configForm');
  const cfgSupabaseUrl = document.getElementById('cfgSupabaseUrl');
  const cfgSupabaseKey = document.getElementById('cfgSupabaseKey');
  const closeConfigModalBtn = document.getElementById('closeConfigModalBtn');
  const cancelConfigModalBtn = document.getElementById('cancelConfigModalBtn');

  // Toast Container
  const toastContainer = document.getElementById('toastContainer');

  // Modal: Ajukan Izin / Sakit
  const ajukanIzinModal = document.getElementById('ajukanIzinModal');
  const closeAjukanIzinModalBtn = document.getElementById('closeAjukanIzinModalBtn');
  const cancelAjukanIzinBtn = document.getElementById('cancelAjukanIzinBtn');
  const ajukanIzinForm = document.getElementById('ajukanIzinForm');
  const izinDateInput = document.getElementById('izinDateInput');
  const izinKeteranganInput = document.getElementById('izinKeteranganInput');

  // Modal: Edit Profil
  const editProfileModal = document.getElementById('editProfileModal');
  const closeEditProfileModalBtn = document.getElementById('closeEditProfileModalBtn');
  const cancelEditProfileBtn = document.getElementById('cancelEditProfileBtn');
  const editProfileForm = document.getElementById('editProfileForm');
  const inputProfileNama = document.getElementById('inputProfileNama');
  const inputProfileJabatan = document.getElementById('inputProfileJabatan');

  // Notification Modal Elements
  const notifModal = document.getElementById('notifModal');
  const closeNotifModalBtn = document.getElementById('closeNotifModalBtn');
  const notifPermissionBadge = document.getElementById('notifPermissionBadge');
  const toggleNotifMasuk = document.getElementById('toggleNotifMasuk');
  const toggleNotifPulang = document.getElementById('toggleNotifPulang');
  const testNotifBtn = document.getElementById('testNotifBtn');
  const saveNotifSettingsBtn = document.getElementById('saveNotifSettingsBtn');

  // PWA Deferred Prompt Holder
  let deferredPwaPrompt = null;

  // --- Utility Helpers ---
  const padZero = (n) => String(n).padStart(2, '0');

  const getTodayDateString = () => {
    const now = new Date();
    return `${now.getFullYear()}-${padZero(now.getMonth() + 1)}-${padZero(now.getDate())}`;
  };

  const getFormattedCurrentTime = () => {
    const now = new Date();
    return `${padZero(now.getHours())}:${padZero(now.getMinutes())}:${padZero(now.getSeconds())}`;
  };

  const formatTimeAmPm = (timeStr) => {
    if (!timeStr) return '--:--';
    const [hStr, mStr] = timeStr.split(':');
    let h = parseInt(hStr, 10);
    const m = mStr || '00';
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${padZero(h)}:${m} ${ampm}`;
  };

  const formatDisplayDateLong = (dateObj) => {
    return dateObj.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatDisplayDateShort = (dateStr) => {
    if (!dateStr) return '-';
    const [y, m, d] = dateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    return dateObj.toLocaleDateString('id-ID', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const calculateDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return null;
    const [startH, startM, startS = 0] = startTime.split(':').map(Number);
    const [endH, endM, endS = 0] = endTime.split(':').map(Number);

    const startTotalSec = startH * 3600 + startM * 60 + startS;
    const endTotalSec = endH * 3600 + endM * 60 + endS;

    let diffSec = endTotalSec - startTotalSec;
    if (diffSec < 0) diffSec = 0;

    const hours = Math.floor(diffSec / 3600);
    const minutes = Math.floor((diffSec % 3600) / 60);
    const seconds = diffSec % 60;

    return {
      totalMinutes: Math.floor(diffSec / 60),
      hours,
      minutes,
      seconds,
      formattedText: `${padZero(hours)}:${padZero(minutes)}`
    };
  };

  const escapeHtml = (text) => {
    const div = document.createElement('div');
    div.textContent = text || '';
    return div.innerHTML;
  };

  // --- Toast Notification ---
  const showToast = (message, type = 'info') => {
    const toast = document.createElement('div');
    toast.className = `toast-enter flex items-center gap-2.5 p-3.5 rounded-2xl border shadow-xl text-xs text-white pointer-events-auto transition ${
      type === 'success'
        ? 'bg-[#142D4E] border-[#16A34A] text-white'
        : type === 'error'
        ? 'bg-[#142D4E] border-[#DC2626] text-white'
        : 'bg-[#142D4E] border-[#168C85] text-white'
    }`;

    const iconName = type === 'success' ? 'check-circle' : type === 'error' ? 'alert-triangle' : 'info';
    toast.innerHTML = `
      <i data-lucide="${iconName}" class="w-4 h-4 text-[#14BBA6] flex-shrink-0"></i>
      <span class="flex-1 font-semibold leading-relaxed">${message}</span>
    `;

    toastContainer.appendChild(toast);
    if (window.lucide) window.lucide.createIcons();

    setTimeout(() => {
      toast.classList.remove('toast-enter');
      toast.classList.add('toast-leave');
      setTimeout(() => toast.remove(), 250);
    }, 3000);
  };

  // --- Supabase Credentials & Client Init ---
  const getSupabaseCredentials = () => {
    const storedUrl = localStorage.getItem(CFG_URL_KEY);
    const storedKey = localStorage.getItem(CFG_KEY_KEY);

    const configUrl = (window.SUPABASE_CONFIG && window.SUPABASE_CONFIG.url) ? window.SUPABASE_CONFIG.url.trim() : '';
    const configKey = (window.SUPABASE_CONFIG && window.SUPABASE_CONFIG.anonKey) ? window.SUPABASE_CONFIG.anonKey.trim() : '';

    return {
      url: storedUrl || configUrl,
      key: storedKey || configKey
    };
  };

  const initSupabaseClient = () => {
    const { url, key } = getSupabaseCredentials();

    if (!url || !key) {
      supabase = null;
      return false;
    }

    try {
      supabase = window.supabase.createClient(url, key);
      return true;
    } catch (err) {
      console.error('Error init Supabase:', err);
      return false;
    }
  };

  // --- Auth View & Navigation Management ---
  const showAuthView = () => {
    authSection.classList.remove('hidden');
    appSection.classList.add('hidden');
    bottomNav.classList.add('hidden');
  };

  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 4 && hour < 11) return 'Selamat Pagi';
    if (hour >= 11 && hour < 15) return 'Selamat Siang';
    if (hour >= 15 && hour < 18.5) return 'Selamat Sore';
    return 'Selamat Malam';
  };

  const getSavedUserProfile = () => {
    try {
      const saved = localStorage.getItem(USER_PROFILE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return null;
  };

  const saveUserProfile = (profile) => {
    localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));
  };

  const showAppView = () => {
    authSection.classList.add('hidden');
    appSection.classList.remove('hidden');
    bottomNav.classList.remove('hidden');

    if (currentUser) {
      const email = currentUser.email || '';
      const defaultName = email.split('@')[0];
      const fallbackDisplay = defaultName.charAt(0).toUpperCase() + defaultName.slice(1);

      const savedProfile = getSavedUserProfile() || {};
      const finalName = savedProfile.nama || fallbackDisplay;
      const finalJabatan = savedProfile.jabatan || 'Penata Layanan Operasional';

      const initial = finalName.charAt(0).toUpperCase() || 'U';
      const greetingWord = getTimeBasedGreeting();

      greetingNameDisplay.textContent = `${greetingWord}, ${finalName}!`;
      userAvatarContainer.textContent = initial;
      profileAvatarInitial.textContent = initial;
      profileNameDisplay.textContent = finalName;
      profileEmailDisplay.textContent = finalJabatan;

      // Pre-fill user name into PDF modal if empty
      if (!pdfNamaPegawai.value) {
        pdfNamaPegawai.value = finalName;
      }
      if (!pdfJabatanPegawai.value) {
        pdfJabatanPegawai.value = finalJabatan;
      }
    }
  };

  // Auth Tabs (Login vs Register)
  tabLoginBtn.addEventListener('click', () => {
    isRegisterMode = false;
    tabLoginBtn.className = 'flex-1 py-2.5 rounded-lg bg-white text-[#142D4E] shadow-sm font-bold transition';
    tabRegisterBtn.className = 'flex-1 py-2.5 rounded-lg text-[#64748B] hover:text-[#142D4E] transition';
    authSubmitText.textContent = 'Masuk';
  });

  tabRegisterBtn.addEventListener('click', () => {
    isRegisterMode = true;
    tabRegisterBtn.className = 'flex-1 py-2.5 rounded-lg bg-white text-[#142D4E] shadow-sm font-bold transition';
    tabLoginBtn.className = 'flex-1 py-2.5 rounded-lg text-[#64748B] hover:text-[#142D4E] transition';
    authSubmitText.textContent = 'Daftar Akun Baru';
  });

  togglePasswordBtn.addEventListener('click', () => {
    const isPassword = authPassword.type === 'password';
    authPassword.type = isPassword ? 'text' : 'password';
    togglePasswordBtn.innerHTML = isPassword
      ? '<i data-lucide="eye-off" class="w-4 h-4"></i>'
      : '<i data-lucide="eye" class="w-4 h-4"></i>';
    if (window.lucide) window.lucide.createIcons();
  });

  authForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!supabase) {
      showToast('Harap hubungkan project Supabase melalui tombol Database di atas!', 'error');
      openConfigModal();
      return;
    }

    const email = authEmail.value.trim();
    const password = authPassword.value;

    authSubmitBtn.disabled = true;
    authSubmitText.textContent = isRegisterMode ? 'Mendaftarkan...' : 'Memverifikasi...';

    try {
      if (isRegisterMode) {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;

        if (data.session) {
          currentUser = data.user;
          showToast('Pendaftaran akun berhasil!', 'success');
          await loadAllDataFromCloud();
        } else {
          showToast('Pendaftaran berhasil! Silakan langsung login dengan akun Anda.', 'success');
          tabLoginBtn.click();
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        currentUser = data.user;
        showToast('Berhasil masuk! Memuat data...', 'success');
        await loadAllDataFromCloud();
      }
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Gagal autentikasi!', 'error');
    } finally {
      authSubmitBtn.disabled = false;
      authSubmitText.textContent = isRegisterMode ? 'Daftar Akun Baru' : 'Masuk';
    }
  });

  // Logout
  const handleLogout = async () => {
    if (!confirm('Apakah Anda yakin ingin keluar dari akun HadirKu?')) return;
    if (supabase) await supabase.auth.signOut();

    currentUser = null;
    records = [];
    allTasks = [];
    showAuthView();
    showToast('Berhasil keluar dari akun.', 'info');
  };

  logoutBtnProfile.addEventListener('click', handleLogout);

  // --- 4 Tab Bottom Navigation Switching ---
  const switchTab = (tabName) => {
    activeTab = tabName;

    document.querySelectorAll('.bottom-nav-item').forEach((item) => {
      if (item.dataset.tab === tabName) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    tabContentHome.classList.add('hidden');
    tabContentHistory.classList.add('hidden');
    tabContentTasks.classList.add('hidden');
    tabContentProfile.classList.add('hidden');

    if (tabName === 'home') tabContentHome.classList.remove('hidden');
    if (tabName === 'history') tabContentHistory.classList.remove('hidden');
    if (tabName === 'tasks') tabContentTasks.classList.remove('hidden');
    if (tabName === 'profile') tabContentProfile.classList.remove('hidden');

    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (window.lucide) window.lucide.createIcons();
  };

  bottomNav.addEventListener('click', (e) => {
    const item = e.target.closest('.bottom-nav-item');
    if (!item) return;
    switchTab(item.dataset.tab);
  });

  homeViewAllTasksLink.addEventListener('click', () => {
    switchTab('tasks');
  });

  // --- Data Loading from Supabase Cloud ---
  const loadAllDataFromCloud = async () => {
    if (!supabase || !currentUser) return;

    showAppView();

    try {
      const { data: attData, error: attErr } = await supabase
        .from('attendance')
        .select('*')
        .order('date', { ascending: false });

      if (attErr) throw attErr;
      records = attData || [];

      const { data: taskData, error: taskErr } = await supabase
        .from('daily_tasks')
        .select('*')
        .order('created_at', { ascending: true });

      if (taskErr) throw taskErr;
      allTasks = taskData || [];

      renderAll();
    } catch (err) {
      console.error('Error load cloud data:', err);
      showToast('Gagal memuat data cloud: ' + err.message, 'error');
    }
  };

  const getTodayRecord = () => {
    const todayStr = getTodayDateString();
    return records.find((r) => r.date === todayStr);
  };

  // --- 02. TODAY'S STATUS & CIRCULAR PROGRESS RING (Target 7 Jam: 07.30 - 14.30 WITA) ---
  const updateCircularTimerAndState = () => {
    const today = getTodayRecord();
    todayFullDateText.textContent = formatDisplayDateLong(new Date());

    // Update greeting name dynamically
    if (currentUser) {
      const savedProfile = getSavedUserProfile() || {};
      const finalName = savedProfile.nama || currentUser.email.split('@')[0];
      greetingNameDisplay.textContent = `${getTimeBasedGreeting()}, ${finalName}!`;
    }

    if (today && (today.status === 'Izin' || today.status === 'Sakit')) {
      // Kasus status Izin atau Sakit
      const isSakit = today.status === 'Sakit';
      todayStatusBadge.textContent = isSakit ? 'Sakit (Izin)' : 'Izin Tidak Hadir';
      todayStatusBadge.className = isSakit
        ? 'text-xs px-3 py-1 rounded-full font-bold bg-rose-50 text-rose-700 border border-rose-200'
        : 'text-xs px-3 py-1 rounded-full font-bold bg-amber-50 text-amber-700 border border-amber-200';
      
      todayCheckInText.textContent = '-';
      todayCheckOutText.textContent = '-';
      subPunchInText.textContent = today.status;
      subTotalHoursText.textContent = '00:00';
      circularWorkedTime.textContent = today.status;

      circularProgressArc.style.strokeDashoffset = CIRCLE_CIRCUMFERENCE;
      timelineTimeMasuk.textContent = '-';
      timelineDotMasuk.className = 'timeline-dot -left-6 absolute top-1 bg-amber-400';
      timelineTimePulang.textContent = '-';
      timelineDotPulang.className = 'timeline-dot -left-6 absolute top-1 bg-amber-400';

    } else if (!today || !today.clock_in) {
      // 1. Belum Absen
      todayStatusBadge.textContent = 'Belum Absen';
      todayStatusBadge.className = 'text-xs px-3 py-1 rounded-full font-bold bg-amber-50 text-amber-700 border border-amber-200';
      todayCheckInText.textContent = '--:--';
      todayCheckOutText.textContent = '--:--';
      subPunchInText.textContent = '--:--';
      subTotalHoursText.textContent = '00:00';
      circularWorkedTime.textContent = '00:00';

      // Ring empty
      circularProgressArc.style.strokeDashoffset = CIRCLE_CIRCUMFERENCE;

      // Timeline
      timelineTimeMasuk.textContent = '--:--';
      timelineDotMasuk.className = 'timeline-dot -left-6 absolute top-1 bg-slate-300';
      timelineTimePulang.textContent = '--:--';
      timelineDotPulang.className = 'timeline-dot -left-6 absolute top-1 bg-slate-300';

    } else if (today.clock_in && !today.clock_out) {
      // 2. Sedang Bekerja (Live Timer berjalan terhadap target 7 jam)
      const isLate = today.status === 'Terlambat';
      todayStatusBadge.textContent = isLate ? 'Bekerja (Terlambat)' : 'Sedang Bekerja';
      todayStatusBadge.className = isLate
        ? 'text-xs px-3 py-1 rounded-full font-bold bg-amber-50 text-amber-700 border border-amber-300'
        : 'text-xs px-3 py-1 rounded-full font-bold bg-emerald-50 text-[#16A34A] border border-emerald-200';
      
      const checkInAmPm = formatTimeAmPm(today.clock_in);
      todayCheckInText.textContent = checkInAmPm;
      todayCheckOutText.textContent = '--:--';
      subPunchInText.textContent = checkInAmPm;

      // Timeline
      timelineTimeMasuk.textContent = checkInAmPm;
      timelineDotMasuk.className = isLate
        ? 'timeline-dot -left-6 absolute top-1 bg-amber-500 border-white shadow-[0_0_8px_rgba(245,158,11,0.5)]'
        : 'timeline-dot -left-6 absolute top-1 bg-[#16A34A] border-white shadow-[0_0_8px_rgba(22,163,74,0.5)]';
      timelineTimePulang.textContent = '--:--';
      timelineDotPulang.className = 'timeline-dot -left-6 absolute top-1 bg-slate-300';

      // Hitung live durasi kerja
      const dur = calculateDuration(today.clock_in, getFormattedCurrentTime());
      if (dur) {
        circularWorkedTime.textContent = dur.formattedText;
        subTotalHoursText.textContent = dur.formattedText;

        // Target: 7 jam (420 menit)
        const percent = Math.min(100, (dur.totalMinutes / TARGET_WORK_MINUTES) * 100);
        const offset = CIRCLE_CIRCUMFERENCE - (percent / 100) * CIRCLE_CIRCUMFERENCE;
        circularProgressArc.style.strokeDashoffset = offset;
      }

    } else if (today.clock_in && today.clock_out) {
      // 3. Selesai Bekerja
      const isLate = today.status === 'Terlambat';
      todayStatusBadge.textContent = isLate ? 'Selesai (Terlambat)' : 'Selesai';
      todayStatusBadge.className = isLate
        ? 'text-xs px-3 py-1 rounded-full font-bold bg-amber-50 text-amber-700 border border-amber-200'
        : 'text-xs px-3 py-1 rounded-full font-bold bg-slate-100 text-[#142D4E] border border-slate-200';

      const checkInAmPm = formatTimeAmPm(today.clock_in);
      const checkOutAmPm = formatTimeAmPm(today.clock_out);

      todayCheckInText.textContent = checkInAmPm;
      todayCheckOutText.textContent = checkOutAmPm;
      subPunchInText.textContent = checkInAmPm;

      // Timeline
      timelineTimeMasuk.textContent = checkInAmPm;
      timelineDotMasuk.className = 'timeline-dot -left-6 absolute top-1 bg-[#16A34A]';
      timelineTimePulang.textContent = checkOutAmPm;
      timelineDotPulang.className = 'timeline-dot -left-6 absolute top-1 bg-[#142D4E]';

      const dur = calculateDuration(today.clock_in, today.clock_out);
      if (dur) {
        circularWorkedTime.textContent = dur.formattedText;
        subTotalHoursText.textContent = dur.formattedText;

        const percent = Math.min(100, (dur.totalMinutes / TARGET_WORK_MINUTES) * 100);
        const offset = CIRCLE_CIRCUMFERENCE - (percent / 100) * CIRCLE_CIRCUMFERENCE;
        circularProgressArc.style.strokeDashoffset = offset;
      }
    }
  };

  // --- 04. KALENDER MINGGUAN (Senin s/d Minggu) ---
  const renderWeeklyCalendar = () => {
    weeklyCalendarGrid.innerHTML = '';
    const now = new Date();
    const currentDay = now.getDay();
    const distanceToMonday = (currentDay + 6) % 7;

    const mondayDate = new Date(now);
    mondayDate.setDate(now.getDate() - distanceToMonday);

    const sundayDate = new Date(mondayDate);
    sundayDate.setDate(mondayDate.getDate() + 6);

    weekRangeLabel.textContent = `${mondayDate.getDate()} - ${sundayDate.getDate()} ${now.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}`;

    const dayLabels = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
    const todayStr = getTodayDateString();

    for (let i = 0; i < 7; i++) {
      const d = new Date(mondayDate);
      d.setDate(mondayDate.getDate() + i);

      const dStr = `${d.getFullYear()}-${padZero(d.getMonth() + 1)}-${padZero(d.getDate())}`;
      const isToday = dStr === todayStr;

      const record = records.find((r) => r.date === dStr);
      const isHadir = record && record.clock_in;

      const item = document.createElement('div');
      item.className = `cal-day-item flex flex-col items-center py-2 px-1 cursor-pointer ${
        isToday ? 'today' : ''
      }`;
      item.dataset.date = dStr;

      item.innerHTML = `
        <span class="text-[10px] font-semibold text-[#64748B] block">${dayLabels[i]}</span>
        <span class="text-xs font-extrabold my-1 block ${isToday ? 'text-[#168C85]' : 'text-[#172B4D]'}">${d.getDate()}</span>
        <div class="w-1.5 h-1.5 rounded-full ${
          isHadir ? 'bg-[#16A34A]' : isToday ? 'bg-[#14BBA6]' : 'bg-transparent'
        }"></div>
      `;

      weeklyCalendarGrid.appendChild(item);
    }
  };

  // Click on Calendar Day -> Shows Detail Modal
  weeklyCalendarGrid.addEventListener('click', (e) => {
    const item = e.target.closest('.cal-day-item');
    if (!item) return;

    const dateStr = item.dataset.date;
    const record = records.find((r) => r.date === dateStr);

    const [y, m, d] = dateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    calDetailDateTitle.textContent = formatDisplayDateLong(dateObj);

    if (record && record.clock_in) {
      const dur = record.clock_out ? calculateDuration(record.clock_in, record.clock_out) : null;
      calDetailBody.innerHTML = `
        <div class="p-3 rounded-xl bg-slate-50 space-y-1.5">
          <div class="flex items-center justify-between">
            <span class="text-[#64748B]">Status:</span>
            <span class="font-bold text-[#16A34A]">${record.status || 'Hadir'}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-[#64748B]">Jam Masuk:</span>
            <span class="font-bold font-mono">${formatTimeAmPm(record.clock_in)}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-[#64748B]">Jam Pulang:</span>
            <span class="font-bold font-mono">${record.clock_out ? formatTimeAmPm(record.clock_out) : 'Belum absen pulang'}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-[#64748B]">Total Durasi:</span>
            <span class="font-bold text-[#168C85]">${dur ? dur.formattedText + ' jam' : '-'}</span>
          </div>
        </div>
      `;
    } else {
      calDetailBody.innerHTML = `
        <div class="p-3 rounded-xl bg-slate-50 text-center text-[#64748B] text-xs">
          Belum ada catatan absensi untuk tanggal ini.
        </div>
      `;
    }

    calendarDetailModal.classList.remove('hidden');
    if (window.lucide) window.lucide.createIcons();
  });

  closeCalDetailModalBtn.addEventListener('click', () => {
    calendarDetailModal.classList.add('hidden');
  });

  calendarDetailModal.addEventListener('click', (e) => {
    if (e.target === calendarDetailModal) calendarDetailModal.classList.add('hidden');
  });

  // --- 05. TARGET TASK LOGIC ---
  const getTodayTasks = () => {
    const todayStr = getTodayDateString();
    return allTasks.filter((t) => t.date === todayStr);
  };

  const renderTaskProgressAndHomePreview = () => {
    const todayTasks = getTodayTasks();
    const totalCount = todayTasks.length;
    const completedCount = todayTasks.filter((t) => t.completed).length;
    const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    // Home Card Progress
    homeTaskProgressCount.textContent = `${completedCount} dari ${totalCount} tugas selesai`;
    homeTaskProgressBar.style.width = `${percent}%`;

    // Tasks Tab Header Progress
    tasksSubtitleProgress.textContent = `${completedCount} dari ${totalCount} tugas selesai`;
    tasksPercentBadge.textContent = `${percent}%`;
    tasksProgressBar.style.width = `${percent}%`;

    // Render Home 3 Tasks Preview
    homeTaskListPreview.innerHTML = '';
    if (todayTasks.length === 0) {
      homeTaskListPreview.innerHTML = `
        <div class="text-center py-3 text-xs text-[#64748B]">
          Belum ada target tugas hari ini.
        </div>
      `;
    } else {
      const sorted = [...todayTasks].sort((a, b) => (a.completed === b.completed ? 0 : a.completed ? 1 : -1));
      const previewSlice = sorted.slice(0, 3);

      previewSlice.forEach((task) => {
        const item = document.createElement('div');
        item.className = `task-item flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 ${
          task.completed ? 'completed' : ''
        }`;

        item.innerHTML = `
          <label class="flex items-center gap-3 cursor-pointer flex-1 min-w-0 pr-2">
            <input 
              type="checkbox" 
              class="quick-task-cb w-4 h-4 rounded text-[#168C85] focus:ring-0 cursor-pointer"
              data-id="${task.id}"
              ${task.completed ? 'checked' : ''}
            />
            <span class="task-title text-xs font-semibold text-[#172B4D] truncate select-none">
              ${escapeHtml(task.title)}
            </span>
          </label>
          <span class="text-[10px] font-bold px-2 py-0.5 rounded-md ${
            task.priority === 'Tinggi' ? 'badge-priority-tinggi' : task.priority === 'Rendah' ? 'badge-priority-rendah' : 'badge-priority-sedang'
          }">
            ${task.priority || 'Sedang'}
          </span>
        `;
        homeTaskListPreview.appendChild(item);
      });
    }

    renderFullTaskList();
  };

  const renderFullTaskList = () => {
    fullTaskListContainer.innerHTML = '';
    const todayTasks = getTodayTasks();

    let filtered = todayTasks;
    if (taskFilter === 'completed') filtered = todayTasks.filter((t) => t.completed);
    if (taskFilter === 'uncompleted') filtered = todayTasks.filter((t) => !t.completed);

    if (filtered.length === 0) {
      emptyTasksFullState.classList.remove('hidden');
      return;
    }

    emptyTasksFullState.classList.add('hidden');

    filtered.forEach((task) => {
      const card = document.createElement('div');
      card.className = `task-item hadirku-card p-3.5 flex items-start justify-between gap-3 ${
        task.completed ? 'completed' : ''
      }`;

      card.innerHTML = `
        <div class="flex items-start gap-3 flex-1 min-w-0">
          <input 
            type="checkbox" 
            class="full-task-cb mt-1 w-4 h-4 rounded text-[#168C85] focus:ring-0 cursor-pointer"
            data-id="${task.id}"
            ${task.completed ? 'checked' : ''}
          />
          <div class="space-y-1 overflow-hidden">
            <h4 class="task-title text-xs font-bold text-[#142D4E] truncate select-none">
              ${escapeHtml(task.title)}
            </h4>
            ${
              task.description
                ? `<p class="text-[11px] text-[#64748B] line-clamp-2">${escapeHtml(task.description)}</p>`
                : ''
            }
            <div class="flex items-center gap-2 pt-0.5">
              <span class="text-[10px] font-bold px-2 py-0.5 rounded-md ${
                task.priority === 'Tinggi' ? 'badge-priority-tinggi' : task.priority === 'Rendah' ? 'badge-priority-rendah' : 'badge-priority-sedang'
              }">
                ${task.priority || 'Sedang'}
              </span>
              ${
                task.due_date
                  ? `<span class="text-[10px] text-[#64748B] flex items-center gap-1 font-medium">
                      <i data-lucide="calendar" class="w-3 h-3"></i>
                      ${formatDisplayDateShort(task.due_date)}
                    </span>`
                  : ''
              }
            </div>
          </div>
        </div>

        <button type="button" class="delete-task-btn p-1.5 rounded-lg text-slate-400 hover:text-[#DC4545] hover:bg-rose-50 transition" data-id="${task.id}" title="Hapus Tugas">
          <i data-lucide="trash-2" class="w-4 h-4"></i>
        </button>
      `;

      fullTaskListContainer.appendChild(card);
    });

    if (window.lucide) window.lucide.createIcons();
  };

  // Task Filter Tabs in Tugas Screen
  document.querySelectorAll('.task-filter-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      taskFilter = btn.dataset.filter;
      document.querySelectorAll('.task-filter-btn').forEach((b) => {
        b.className = 'task-filter-btn px-3.5 py-1.5 rounded-xl bg-white text-[#64748B] border border-[#E2E8F0] hover:text-[#142D4E] transition';
      });
      btn.className = 'task-filter-btn px-3.5 py-1.5 rounded-xl bg-[#142D4E] text-white shadow-sm transition font-bold';
      renderFullTaskList();
    });
  });

  const handleTaskToggle = async (taskId, isChecked) => {
    if (!currentUser) return;
    try {
      await supabase
        .from('daily_tasks')
        .update({ completed: isChecked })
        .eq('id', taskId);

      const target = allTasks.find((t) => t.id === taskId);
      if (target) target.completed = isChecked;

      renderTaskProgressAndHomePreview();
      if (isChecked) showToast('Tugas selesai dicentang!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Gagal update tugas di cloud', 'error');
    }
  };

  homeTaskListPreview.addEventListener('change', (e) => {
    const cb = e.target.closest('.quick-task-cb');
    if (cb) handleTaskToggle(cb.dataset.id, cb.checked);
  });

  fullTaskListContainer.addEventListener('change', (e) => {
    const cb = e.target.closest('.full-task-cb');
    if (cb) handleTaskToggle(cb.dataset.id, cb.checked);
  });

  fullTaskListContainer.addEventListener('click', async (e) => {
    const delBtn = e.target.closest('.delete-task-btn');
    if (delBtn && currentUser) {
      const taskId = delBtn.dataset.id;
      try {
        await supabase.from('daily_tasks').delete().eq('id', taskId);
        allTasks = allTasks.filter((t) => t.id !== taskId);
        renderTaskProgressAndHomePreview();
        showToast('Tugas telah dihapus.', 'info');
      } catch (err) {
        showToast('Gagal menghapus tugas dari cloud', 'error');
      }
    }
  });

  // Add Task Modal Handlers
  openAddTaskModalBtn.addEventListener('click', () => {
    modalTaskTitle.value = '';
    modalTaskDesc.value = '';
    modalTaskDueDate.value = getTodayDateString();
    modalTaskPriority.value = 'Sedang';
    addTaskModal.classList.remove('hidden');
    if (window.lucide) window.lucide.createIcons();
  });

  const closeAddTaskModal = () => {
    addTaskModal.classList.add('hidden');
    addTaskModalForm.reset();
  };

  closeAddTaskModalBtn.addEventListener('click', closeAddTaskModal);
  cancelAddTaskModalBtn.addEventListener('click', closeAddTaskModal);
  addTaskModal.addEventListener('click', (e) => {
    if (e.target === addTaskModal) closeAddTaskModal();
  });

  addTaskModalForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!currentUser) return;

    const title = modalTaskTitle.value.trim();
    if (!title) return;

    const desc = modalTaskDesc.value.trim();
    const dueDate = modalTaskDueDate.value || null;
    const priority = modalTaskPriority.value || 'Sedang';
    const todayStr = getTodayDateString();

    try {
      const { data, error } = await supabase
        .from('daily_tasks')
        .insert({
          user_id: currentUser.id,
          date: todayStr,
          title: title,
          description: desc,
          due_date: dueDate,
          priority: priority,
          completed: false
        })
        .select()
        .single();

      if (error) throw error;

      allTasks.push(data);
      closeAddTaskModal();
      renderTaskProgressAndHomePreview();
      showToast('Tugas berhasil disimpan!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Gagal menyimpan tugas ke cloud: ' + err.message, 'error');
    }
  });

  // --- WIDGET PRODUKTIVITAS: POMODORO & WATER TRACKER ---
  const POMO_WORK_SECONDS = 25 * 60; // 25 Menit
  const POMO_BREAK_SECONDS = 5 * 60; // 5 Menit
  let pomoTimeLeft = POMO_WORK_SECONDS;
  let pomoIsRunning = false;
  let pomoIsBreak = false;
  let pomoInterval = null;

  const updatePomoDisplay = () => {
    const mins = Math.floor(pomoTimeLeft / 60);
    const secs = pomoTimeLeft % 60;
    if (pomoTimerText) pomoTimerText.textContent = `${padZero(mins)}:${padZero(secs)}`;

    if (pomoModeBadge) {
      if (pomoIsBreak) {
        pomoModeBadge.textContent = 'Istirahat 5m';
        pomoModeBadge.className = 'text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200';
      } else {
        pomoModeBadge.textContent = 'Fokus 25m';
        pomoModeBadge.className = 'text-[9px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200';
      }
    }

    if (pomoPlayText) pomoPlayText.textContent = pomoIsRunning ? 'Jeda' : 'Mulai';
    if (pomoPlayIcon) {
      pomoPlayIcon.setAttribute('data-lucide', pomoIsRunning ? 'pause' : 'play');
      if (window.lucide) window.lucide.createIcons();
    }
  };

  const startPomoTimer = () => {
    pomoIsRunning = true;
    updatePomoDisplay();

    pomoInterval = setInterval(() => {
      if (pomoTimeLeft > 0) {
        pomoTimeLeft--;
        updatePomoDisplay();
      } else {
        // Waktu habis
        clearInterval(pomoInterval);
        pomoIsRunning = false;

        if (!pomoIsBreak) {
          // Selesai Sesi Fokus -> Ganti ke Istirahat
          pomoIsBreak = true;
          pomoTimeLeft = POMO_BREAK_SECONDS;
          sendSystemNotification('🍅 Pomodoro Selesai!', 'Kerja fokus 25 menit selesai! Saatnya istirahat santai 5 menit.');
          showToast('Sesi fokus selesai! Waktunya istirahat 5 menit.', 'success');
        } else {
          // Selesai Sesi Istirahat -> Ganti ke Fokus
          pomoIsBreak = false;
          pomoTimeLeft = POMO_WORK_SECONDS;
          sendSystemNotification('⏰ Waktu Istirahat Selesai!', 'Istirahat 5 menit selesai! Siap kembali fokus kerja?');
          showToast('Istirahat selesai! Mari kembali produktif.', 'info');
        }
        updatePomoDisplay();
      }
    }, 1000);
  };

  const pausePomoTimer = () => {
    pomoIsRunning = false;
    clearInterval(pomoInterval);
    updatePomoDisplay();
  };

  const resetPomoTimer = () => {
    pomoIsRunning = false;
    clearInterval(pomoInterval);
    pomoIsBreak = false;
    pomoTimeLeft = POMO_WORK_SECONDS;
    updatePomoDisplay();
  };

  if (pomoStartPauseBtn) {
    pomoStartPauseBtn.addEventListener('click', () => {
      if (pomoIsRunning) {
        pausePomoTimer();
      } else {
        startPomoTimer();
      }
    });
  }

  if (pomoResetBtn) {
    pomoResetBtn.addEventListener('click', resetPomoTimer);
  }

  // Water Tracker
  const WATER_KEY = 'hadirku_water_tracker';
  const TARGET_WATER_GLASSES = 8;
  const ML_PER_GLASS = 250;

  const getWaterData = () => {
    const todayStr = getTodayDateString();
    try {
      const saved = JSON.parse(localStorage.getItem(WATER_KEY) || '{}');
      if (saved.date === todayStr) return saved.glasses || 0;
    } catch (e) {}
    return 0;
  };

  const saveWaterData = (glasses) => {
    const todayStr = getTodayDateString();
    localStorage.setItem(WATER_KEY, JSON.stringify({ date: todayStr, glasses }));
  };

  const renderWaterTracker = () => {
    const glasses = getWaterData();
    const ml = glasses * ML_PER_GLASS;
    const targetMl = TARGET_WATER_GLASSES * ML_PER_GLASS;
    const percent = Math.min(100, Math.round((glasses / TARGET_WATER_GLASSES) * 100));

    if (waterGlassesCount) waterGlassesCount.textContent = glasses;
    if (waterMlText) waterMlText.textContent = `${ml}/${targetMl} ml`;
    if (waterProgressBar) waterProgressBar.style.width = `${percent}%`;
  };

  if (addWaterBtn) {
    addWaterBtn.addEventListener('click', () => {
      let glasses = getWaterData() + 1;
      saveWaterData(glasses);
      renderWaterTracker();

      if (glasses === TARGET_WATER_GLASSES) {
        showToast('Luar biasa! Target minum 8 gelas air hari ini tercapai! 💧🎉', 'success');
        sendSystemNotification('💧 Target Air Tercapai!', 'Selamat! Target 8 gelas (2.000 ml) air hari ini sudah terpenuhi.');
      } else {
        showToast(`Segelas air tercatat! (${glasses}/${TARGET_WATER_GLASSES} gelas)`, 'info');
      }
    });
  }

  if (resetWaterBtn) {
    resetWaterBtn.addEventListener('click', () => {
      if (confirm('Reset hitungan air minum hari ini kembali ke 0?')) {
        saveWaterData(0);
        renderWaterTracker();
        showToast('Hitungan air minum direset.', 'info');
      }
    });
  }

  // --- 06. RINGKASAN KEHADIRAN BULANAN (Dihitung Nyata dari Data) ---
  const renderMonthlyCalculations = () => {
    const year = currentHistoryPeriod.getFullYear();
    const month = currentHistoryPeriod.getMonth();
    const monthPrefix = `${year}-${padZero(month + 1)}`;

    homeMonthLabel.textContent = currentHistoryPeriod.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
    currentPeriodLabel.textContent = homeMonthLabel.textContent;
    pdfPeriodeDisplay.value = homeMonthLabel.textContent;

    const monthRecords = records.filter((r) => r.date.startsWith(monthPrefix));

    let hadir = 0;
    let terlambat = 0;
    let izin = 0;
    let alpa = 0;
    let totalMinutesWorked = 0;

    monthRecords.forEach((r) => {
      if (r.status === 'Hadir' || r.status === 'Hadir (WFO)' || r.status === 'WFH') {
        hadir++;
      } else if (r.status === 'Izin' || r.status === 'Cuti' || r.status === 'Sakit') {
        izin++;
      } else if (r.status === 'Terlambat') {
        terlambat++;
      } else if (r.status === 'Alpa') {
        alpa++;
      }

      if (r.duration_minutes) {
        totalMinutesWorked += r.duration_minutes;
      } else if (r.clock_in && r.clock_out) {
        const d = calculateDuration(r.clock_in, r.clock_out);
        if (d) totalMinutesWorked += d.totalMinutes;
      }
    });

    const totH = Math.floor(totalMinutesWorked / 60);
    const totM = totalMinutesWorked % 60;
    const totalHoursStr = `${padZero(totH)}:${padZero(totM)}`;

    // Update Home Summary
    summaryHadirCount.textContent = hadir;
    summaryTerlambatCount.textContent = terlambat;
    summaryIzinCount.textContent = izin;
    summaryTotalHoursCount.textContent = totalHoursStr;

    // Update History Badges
    histHadirCount.textContent = hadir;
    histTerlambatCount.textContent = terlambat;
    histIzinCount.textContent = izin;
    histAlpaCount.textContent = alpa;

    renderHistoryList(monthRecords);
  };

  const renderHistoryList = (monthRecords) => {
    historyListContainer.innerHTML = '';

    if (monthRecords.length === 0) {
      emptyHistoryState.classList.remove('hidden');
      return;
    }

    emptyHistoryState.classList.add('hidden');

    monthRecords.forEach((r) => {
      const card = document.createElement('div');
      card.className = 'hadirku-card p-4 space-y-2';

      let durText = '-';
      if (r.clock_in && r.clock_out) {
        const d = calculateDuration(r.clock_in, r.clock_out);
        durText = d ? `${d.hours}j ${d.minutes}m` : '-';
      }

      card.innerHTML = `
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-[#142D4E]">${formatDisplayDateShort(r.date)}</span>
          <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-[#16A34A] border border-emerald-200">
            ${r.status || 'Hadir'}
          </span>
        </div>
        <div class="grid grid-cols-3 gap-2 text-xs pt-1">
          <div class="p-2 rounded-xl bg-slate-50">
            <span class="text-[10px] text-[#64748B] block">Masuk</span>
            <span class="font-bold text-[#142D4E] font-mono">${formatTimeAmPm(r.clock_in)}</span>
          </div>
          <div class="p-2 rounded-xl bg-slate-50">
            <span class="text-[10px] text-[#64748B] block">Pulang</span>
            <span class="font-bold text-[#142D4E] font-mono">${r.clock_out ? formatTimeAmPm(r.clock_out) : '-'}</span>
          </div>
          <div class="p-2 rounded-xl bg-slate-50">
            <span class="text-[10px] text-[#64748B] block">Durasi</span>
            <span class="font-bold text-[#168C85]">${durText}</span>
          </div>
        </div>
      `;

      historyListContainer.appendChild(card);
    });

    if (window.lucide) window.lucide.createIcons();
  };

  prevMonthBtn.addEventListener('click', () => {
    currentHistoryPeriod.setMonth(currentHistoryPeriod.getMonth() - 1);
    renderMonthlyCalculations();
  });

  nextMonthBtn.addEventListener('click', () => {
    currentHistoryPeriod.setMonth(currentHistoryPeriod.getMonth() + 1);
    renderMonthlyCalculations();
  });

  // Export CSV
  exportCsvBtn.addEventListener('click', () => {
    if (records.length === 0) {
      showToast('Belum ada data untuk diekspor!', 'warning');
      return;
    }

    const headers = ['Tanggal', 'Status', 'Jam Masuk', 'Jam Pulang', 'Durasi (Menit)', 'Catatan'];
    const rows = records.map((r) => [
      r.date,
      r.status,
      r.clock_in || '-',
      r.clock_out || '-',
      r.duration_minutes || 0,
      `"${(r.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((row) => row.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `HadirKu_Riwayat_${getTodayDateString()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast('File CSV berhasil diunduh!', 'success');
  });

  // --- 03. ABSEN MASUK & PULANG (TERPUSAT DI TOMBOL FINGERPRINT) ---
  const triggerAbsenMasuk = async () => {
    if (!currentUser) return;
    const todayStr = getTodayDateString();
    let today = getTodayRecord();

    if (today && (today.status === 'Izin' || today.status === 'Sakit')) {
      showToast(`Hari ini Anda tercatat status ${today.status}.`, 'info');
      return;
    }

    if (today && today.clock_in) {
      showToast('Anda sudah melakukan Absen Masuk hari ini!', 'warning');
      return;
    }

    const currentTime = getFormattedCurrentTime();

    // Hitung status: Jam masuk standar 07:30 WITA
    // Jika lebih dari 07:30:00 -> Terlambat
    const [h, m] = currentTime.split(':').map(Number);
    const isLate = (h > 7) || (h === 7 && m > 30);
    const attendanceStatus = isLate ? 'Terlambat' : 'Hadir';

    try {
      const payload = {
        user_id: currentUser.id,
        date: todayStr,
        status: attendanceStatus,
        clock_in: currentTime,
        clock_out: null,
        duration_minutes: 0,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('attendance')
        .upsert(payload, { onConflict: 'user_id,date' })
        .select()
        .single();

      if (error) throw error;

      if (!today) {
        records.unshift(data);
      } else {
        Object.assign(today, data);
      }

      showAbsenSuccessModal('masuk', formatTimeAmPm(currentTime));
      if (isLate) {
        sendSystemNotification('⚠️ Absen Masuk (Terlambat)', `Kehadiran tercatat ${formatTimeAmPm(currentTime)} WITA (lewat jam 07:30).`);
      } else {
        sendSystemNotification('✅ Absen Masuk Tercatat', `Kehadiran masuk Anda tercatat tepat waktu pada ${formatTimeAmPm(currentTime)} WITA.`);
      }
    } catch (err) {
      console.error(err);
      showToast('Gagal Absen Masuk: ' + err.message, 'error');
    }
  };

  const triggerAbsenPulang = async () => {
    if (!currentUser) return;
    const today = getTodayRecord();

    if (!today || !today.clock_in) {
      showToast('Anda belum melakukan Absen Masuk!', 'warning');
      return;
    }

    if (today.clock_out) {
      showToast('Anda sudah melakukan Absen Pulang hari ini!', 'warning');
      return;
    }

    const currentTime = getFormattedCurrentTime();
    const dur = calculateDuration(today.clock_in, currentTime);
    const durationMinutes = dur ? dur.totalMinutes : 0;

    try {
      const payload = {
        user_id: currentUser.id,
        date: today.date,
        status: 'Hadir',
        clock_in: today.clock_in,
        clock_out: currentTime,
        duration_minutes: durationMinutes,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('attendance')
        .upsert(payload, { onConflict: 'user_id,date' })
        .select()
        .single();

      if (error) throw error;

      Object.assign(today, data);
      confirmPulangModal.classList.add('hidden');
      showAbsenSuccessModal('pulang', formatTimeAmPm(currentTime));
      sendSystemNotification('👋 Absen Pulang Tercatat', `Kehadiran pulang Anda tercatat pada ${formatTimeAmPm(currentTime)} WITA. Selamat beristirahat!`);
    } catch (err) {
      console.error(err);
      showToast('Gagal Absen Pulang: ' + err.message, 'error');
    }
  };

  // TOMBOL FLOATING FINGERPRINT ACTION
  centerFabAbsenBtn.addEventListener('click', () => {
    const today = getTodayRecord();

    if (!today || !today.clock_in) {
      // Belum absen masuk -> Langsung Absen Masuk
      triggerAbsenMasuk();
    } else if (today.clock_in && !today.clock_out) {
      // Sedang bekerja -> Tampilkan POP-UP KONFIRMASI ABSEN PULANG
      confirmPulangCurrentTime.textContent = `${formatTimeAmPm(getFormattedCurrentTime())} WITA`;
      confirmPulangModal.classList.remove('hidden');
      if (window.lucide) window.lucide.createIcons();
    } else {
      showToast('Absensi hari ini sudah selesai tercatat!', 'info');
      switchTab('home');
    }
  });

  cancelConfirmPulangBtn.addEventListener('click', () => {
    confirmPulangModal.classList.add('hidden');
  });

  proceedConfirmPulangBtn.addEventListener('click', () => {
    triggerAbsenPulang();
  });

  confirmPulangModal.addEventListener('click', (e) => {
    if (e.target === confirmPulangModal) confirmPulangModal.classList.add('hidden');
  });

  // Absen Success Modal
  const showAbsenSuccessModal = (type, timeDisplay) => {
    const isMasuk = type === 'masuk';
    modalSuccessTitle.textContent = isMasuk ? 'Absen Masuk Berhasil!' : 'Absen Pulang Berhasil!';
    modalSuccessTime.textContent = timeDisplay;
    modalSuccessDate.textContent = formatDisplayDateLong(new Date());

    if (isMasuk) {
      modalSuccessBadge.className = 'w-20 h-20 mx-auto rounded-full bg-[#16A34A] text-white flex items-center justify-center shadow-xl shadow-[#16A34A]/30';
      modalSuccessSubtitle.textContent = 'Semangat bekerja! Jangan lupa absen pulang sesuai jam kerja ya!';
    } else {
      modalSuccessBadge.className = 'w-20 h-20 mx-auto rounded-full bg-[#142D4E] text-white flex items-center justify-center shadow-xl shadow-[#142D4E]/30';
      modalSuccessSubtitle.textContent = 'Terima kasih! Hari ini sudah selesai. Sampai jumpa besok!';
    }

    absenSuccessModal.classList.remove('hidden');
    if (window.lucide) window.lucide.createIcons();
  };

  closeSuccessModalBtn.addEventListener('click', () => {
    absenSuccessModal.classList.add('hidden');
    renderAll();
  });

  // --- EXPORT PDF RESMI (LAPORAN KE ATASAN) ---
  const loadSavedPdfOfficials = () => {
    try {
      const saved = localStorage.getItem(PDF_INFO_KEY);
      if (saved) {
        const info = JSON.parse(saved);
        if (info.namaPegawai) pdfNamaPegawai.value = info.namaPegawai;
        if (info.nipPegawai) pdfNipPegawai.value = info.nipPegawai;
        if (info.jabatanPegawai) pdfJabatanPegawai.value = info.jabatanPegawai;
        if (info.namaAtasan) pdfNamaAtasan.value = info.namaAtasan;
        if (info.nipAtasan) pdfNipAtasan.value = info.nipAtasan;
        if (info.jabatanAtasan) pdfJabatanAtasan.value = info.jabatanAtasan;
        if (info.kota) pdfKotaTtd.value = info.kota;
      }
    } catch (e) {
      console.error(e);
    }
  };

  openExportPdfModalBtn.addEventListener('click', () => {
    loadSavedPdfOfficials();
    pdfPeriodeDisplay.value = currentPeriodLabel.textContent;
    exportPdfModal.classList.remove('hidden');
    if (window.lucide) window.lucide.createIcons();
  });

  const closeExportPdfModal = () => {
    exportPdfModal.classList.add('hidden');
  };

  closeExportPdfModalBtn.addEventListener('click', closeExportPdfModal);
  cancelExportPdfBtn.addEventListener('click', closeExportPdfModal);
  exportPdfModal.addEventListener('click', (e) => {
    if (e.target === exportPdfModal) closeExportPdfModal();
  });

  exportPdfForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // 1. Simpan info ke LocalStorage
    const pdfInfo = {
      namaPegawai: pdfNamaPegawai.value.trim(),
      nipPegawai: pdfNipPegawai.value.trim(),
      jabatanPegawai: pdfJabatanPegawai.value.trim() || 'Staf',
      namaAtasan: pdfNamaAtasan.value.trim(),
      nipAtasan: pdfNipAtasan.value.trim(),
      jabatanAtasan: pdfJabatanAtasan.value.trim() || 'Atasan Langsung',
      kota: pdfKotaTtd.value.trim() || 'Banjarmasin'
    };
    localStorage.setItem(PDF_INFO_KEY, JSON.stringify(pdfInfo));

    // 2. Siapkan data periode aktif
    const year = currentHistoryPeriod.getFullYear();
    const month = currentHistoryPeriod.getMonth();
    const monthPrefix = `${year}-${padZero(month + 1)}`;
    const monthRecords = records.filter((r) => r.date.startsWith(monthPrefix));

    if (monthRecords.length === 0) {
      showToast('Tidak ada data absensi untuk dicetak pada periode ini!', 'warning');
      return;
    }

    // Sort ascending per tanggal untuk laporan resmi
    const sortedRecords = [...monthRecords].sort((a, b) => (a.date > b.date ? 1 : -1));

    // 3. Masukkan data ke template laporan cetak
    printReportPeriodeTitle.textContent = `PERIODE: ${currentPeriodLabel.textContent.toUpperCase()}`;
    printNamaPegawai.textContent = pdfInfo.namaPegawai;
    printNipPegawai.textContent = pdfInfo.nipPegawai || '-';
    printJabatanPegawai.textContent = pdfInfo.jabatanPegawai;

    printNamaPegawaiBawah.textContent = pdfInfo.namaPegawai;
    printNipPegawaiBawah.textContent = pdfInfo.nipPegawai ? `NIP. ${pdfInfo.nipPegawai}` : '-';

    printNamaAtasan.textContent = pdfInfo.namaAtasan;
    printNipAtasan.textContent = pdfInfo.nipAtasan ? `NIP. ${pdfInfo.nipAtasan}` : '-';
    printJabatanAtasan.textContent = pdfInfo.jabatanAtasan;

    const todayDate = new Date();
    printKotaTanggalCetak.textContent = `${pdfInfo.kota}, ${formatDisplayDateLong(todayDate)}`;

    // Hitung total
    let totalHariHadir = 0;
    let totalMinutes = 0;
    printAttendanceTableBody.innerHTML = '';

    sortedRecords.forEach((r, idx) => {
      if (r.clock_in) totalHariHadir++;
      let durText = '-';
      if (r.duration_minutes) {
        totalMinutes += r.duration_minutes;
        const h = Math.floor(r.duration_minutes / 60);
        const m = r.duration_minutes % 60;
        durText = `${padZero(h)}:${padZero(m)}`;
      } else if (r.clock_in && r.clock_out) {
        const d = calculateDuration(r.clock_in, r.clock_out);
        if (d) {
          totalMinutes += d.totalMinutes;
          durText = d.formattedText;
        }
      }

      const [y, m, d] = r.date.split('-').map(Number);
      const dayDate = new Date(y, m - 1, d);
      const dayName = dayDate.toLocaleDateString('id-ID', { weekday: 'long' });

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="text-align: center;">${idx + 1}</td>
        <td style="text-align: center;">${r.date}</td>
        <td>${dayName}</td>
        <td style="text-align: center;">${r.clock_in ? formatTimeAmPm(r.clock_in) : '-'}</td>
        <td style="text-align: center;">${r.clock_out ? formatTimeAmPm(r.clock_out) : '-'}</td>
        <td style="text-align: center;">${durText}</td>
        <td style="text-align: center; font-weight: bold;">${r.status || 'Hadir'}</td>
        <td>${escapeHtml(r.notes || '-')}</td>
      `;
      printAttendanceTableBody.appendChild(tr);
    });

    const totH = Math.floor(totalMinutes / 60);
    const totM = totalMinutes % 60;
    printTotalHariHadir.textContent = `${totalHariHadir} Hari`;
    printTotalJamKerja.textContent = `${padZero(totH)}:${padZero(totM)} Jam`;

    closeExportPdfModal();
    showToast('Sedang memproses file PDF...', 'info');

    // 4. Unduh PDF via html2pdf
    if (window.html2pdf) {
      const element = document.getElementById('printableReportContainer');
      element.parentElement.classList.remove('hidden');

      const opt = {
        margin: [10, 10, 10, 10],
        filename: `Laporan_Absensi_${pdfInfo.namaPegawai.replace(/\s+/g, '_')}_${currentPeriodLabel.textContent.replace(/\s+/g, '_')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      window.html2pdf().set(opt).from(element).save().then(() => {
        element.parentElement.classList.add('hidden');
        showToast('Laporan PDF resmi berhasil diunduh!', 'success');
      }).catch((err) => {
        element.parentElement.classList.add('hidden');
        console.error(err);
        showToast('Gagal membuat PDF: ' + err.message, 'error');
      });
    } else {
      // Fallback ke window.print jika cdn tidak aktif
      window.print();
    }
  });

  // --- Theme Toggle ---
  const applyTheme = (theme) => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      profileThemeIcon.setAttribute('data-lucide', 'sun');
      profileThemeText.textContent = 'Mode Gelap (Dark)';
    } else {
      document.documentElement.classList.remove('dark');
      profileThemeIcon.setAttribute('data-lucide', 'moon');
      profileThemeText.textContent = 'Mode Terang (Light)';
    }
    localStorage.setItem(THEME_KEY, theme);
    if (window.lucide) window.lucide.createIcons();
  };

  themeToggleBtnProfile.addEventListener('click', () => {
    const isDark = document.documentElement.classList.contains('dark');
    applyTheme(isDark ? 'light' : 'dark');
  });

  // --- Supabase Config Modal ---
  const openConfigModal = () => {
    const creds = getSupabaseCredentials();
    cfgSupabaseUrl.value = creds.url;
    cfgSupabaseKey.value = creds.key;
    configModal.classList.remove('hidden');
    if (window.lucide) window.lucide.createIcons();
  };

  const closeConfigModal = () => {
    configModal.classList.add('hidden');
  };

  openConfigBtnAuth.addEventListener('click', openConfigModal);
  openConfigBtnProfile.addEventListener('click', openConfigModal);
  closeConfigModalBtn.addEventListener('click', closeConfigModal);
  cancelConfigModalBtn.addEventListener('click', closeConfigModal);
  configModal.addEventListener('click', (e) => {
    if (e.target === configModal) closeConfigModal();
  });

  configForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const url = cfgSupabaseUrl.value.trim();
    const key = cfgSupabaseKey.value.trim();

    localStorage.setItem(CFG_URL_KEY, url);
    localStorage.setItem(CFG_KEY_KEY, key);

    closeConfigModal();

    if (initSupabaseClient()) {
      showToast('Koneksi Supabase tersimpan!', 'success');
      checkInitialAuth();
    }
  });

  // --- Master Render Function ---
  const renderAll = () => {
    updateCircularTimerAndState();
    renderWeeklyCalendar();
    renderTaskProgressAndHomePreview();
    renderMonthlyCalculations();
    renderWaterTracker();
  };

  // --- Initial Auth Check ---
  const checkInitialAuth = async () => {
    if (!supabase) {
      showAuthView();
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session && session.user) {
        currentUser = session.user;
        await loadAllDataFromCloud();
      } else {
        showAuthView();
      }

      supabase.auth.onAuthStateChange(async (event, session) => {
        if (session && session.user) {
          currentUser = session.user;
          await loadAllDataFromCloud();
        } else {
          currentUser = null;
          showAuthView();
        }
      });
    } catch (err) {
      console.error('Auth error:', err);
      showAuthView();
    }
  };

  // --- PWA & NOTIFIKASI PENGINGAT (Senin - Sabtu, Kecuali Minggu) ---
  const getSavedNotifSettings = () => {
    try {
      const saved = localStorage.getItem(NOTIF_SETTINGS_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return { enabledMasuk: true, enabledPulang: true };
  };

  const saveNotifSettings = (settings) => {
    localStorage.setItem(NOTIF_SETTINGS_KEY, JSON.stringify(settings));
  };

  const updateNotifBadgeUI = () => {
    if (!('Notification' in window)) {
      notifPermissionBadge.textContent = 'Tidak Didukung';
      notifPermissionBadge.className = 'font-bold px-2 py-0.5 rounded-full text-[10px] bg-slate-200 text-slate-600';
      if (notificationStatusTextProfile) notificationStatusTextProfile.textContent = 'Browser tidak mendukung';
      return;
    }

    if (Notification.permission === 'granted') {
      notifPermissionBadge.textContent = 'Diizinkan';
      notifPermissionBadge.className = 'font-bold px-2 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-700';
      if (notificationStatusTextProfile) notificationStatusTextProfile.textContent = 'Aktif (07:15 & 14:30 WITA, Sen-Sab)';
      if (notifActiveDot) notifActiveDot.classList.remove('hidden');
    } else if (Notification.permission === 'denied') {
      notifPermissionBadge.textContent = 'Diblokir';
      notifPermissionBadge.className = 'font-bold px-2 py-0.5 rounded-full text-[10px] bg-rose-100 text-rose-700';
      if (notificationStatusTextProfile) notificationStatusTextProfile.textContent = 'Izin notifikasi diblokir di browser';
      if (notifActiveDot) notifActiveDot.classList.add('hidden');
    } else {
      notifPermissionBadge.textContent = 'Belum Diizinkan';
      notifPermissionBadge.className = 'font-bold px-2 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-700';
      if (notificationStatusTextProfile) notificationStatusTextProfile.textContent = 'Klik untuk aktifkan izin notifikasi';
      if (notifActiveDot) notifActiveDot.classList.remove('hidden');
    }
  };

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      showToast('Browser ini tidak mendukung notifikasi sistem', 'error');
      return false;
    }
    try {
      const perm = await Notification.requestPermission();
      updateNotifBadgeUI();
      return perm === 'granted';
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const sendSystemNotification = (title, body) => {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;

    const iconUrl = 'icon.svg';
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready.then((reg) => {
        reg.showNotification(title, {
          body,
          icon: iconUrl,
          badge: iconUrl,
          vibrate: [200, 100, 200]
        });
      });
    } else {
      try {
        new Notification(title, {
          body,
          icon: iconUrl
        });
      } catch (e) {
        console.warn('Native notification failed:', e);
      }
    }
  };

  // Cek jam absensi otomatis tiap menit (Khusus Senin - Sabtu, Minggu LIBUR)
  const checkDailyAttendanceReminders = () => {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Minggu, 1 = Senin, ..., 6 = Sabtu

    // ATURAN USER: Notifikasi untuk hari MINGGU TIDAK PERLU
    if (dayOfWeek === 0) return;

    const hours = now.getHours();
    const minutes = now.getMinutes();
    const todayStr = getTodayDateString();
    const todayRecord = getTodayRecord();

    const settings = getSavedNotifSettings();
    let sentLog = {};
    try {
      sentLog = JSON.parse(localStorage.getItem(NOTIF_SENT_LOG_KEY) || '{}');
    } catch (e) {}

    // 1. Pengingat Absen Masuk: 07:15 WITA (15 menit sebelum 07:30)
    if (settings.enabledMasuk && hours === 7 && minutes >= 15 && minutes <= 29) {
      const logKey = `${todayStr}_masuk`;
      if (!sentLog[logKey]) {
        // Cek apakah sudah absen masuk
        if (!todayRecord || !todayRecord.clock_in) {
          sendSystemNotification(
            '⏰ Pengingat HadirKu: Absen Masuk',
            'Selamat pagi! Waktu kerja dimulai pukul 07:30 WITA. Jangan lupa absen masuk hari ini.'
          );
          sentLog[logKey] = true;
          localStorage.setItem(NOTIF_SENT_LOG_KEY, JSON.stringify(sentLog));
        }
      }
    }

    // 2. Pengingat Absen Pulang: 14:30 WITA (Saat jam kerja selesai)
    if (settings.enabledPulang && hours === 14 && minutes >= 30 && minutes <= 45) {
      const logKey = `${todayStr}_pulang`;
      if (!sentLog[logKey]) {
        // Hanya ingatkan jika sudah absen masuk tapi belum absen pulang
        if (todayRecord && todayRecord.clock_in && !todayRecord.clock_out) {
          sendSystemNotification(
            '🔔 Pengingat HadirKu: Waktu Pulang',
            'Jam kerja 07:30 - 14:30 WITA telah selesai. Jangan lupa absen pulang dan tetap berhati-hati di jalan!'
          );
          sentLog[logKey] = true;
          localStorage.setItem(NOTIF_SENT_LOG_KEY, JSON.stringify(sentLog));
        }
      }
    }
  };

  const openNotifModal = () => {
    const settings = getSavedNotifSettings();
    toggleNotifMasuk.checked = settings.enabledMasuk !== false;
    toggleNotifPulang.checked = settings.enabledPulang !== false;
    updateNotifBadgeUI();
    notifModal.classList.remove('hidden');
    if (window.lucide) window.lucide.createIcons();
  };

  const closeNotifModal = () => {
    notifModal.classList.add('hidden');
  };

  // Event Listeners Notifikasi
  if (notificationBtn) notificationBtn.addEventListener('click', openNotifModal);
  if (openNotificationSettingsBtn) openNotificationSettingsBtn.addEventListener('click', openNotifModal);
  if (closeNotifModalBtn) closeNotifModalBtn.addEventListener('click', closeNotifModal);
  if (notifModal) {
    notifModal.addEventListener('click', (e) => {
      if (e.target === notifModal) closeNotifModal();
    });
  }

  // --- Handlers: Modal Ajukan Izin / Sakit ---
  const openAjukanIzinModal = () => {
    izinDateInput.value = getTodayDateString();
    izinKeteranganInput.value = '';
    ajukanIzinModal.classList.remove('hidden');
    if (window.lucide) window.lucide.createIcons();
  };

  const closeAjukanIzinModal = () => {
    ajukanIzinModal.classList.add('hidden');
  };

  if (openAjukanIzinBtn) openAjukanIzinBtn.addEventListener('click', openAjukanIzinModal);
  if (closeAjukanIzinModalBtn) closeAjukanIzinModalBtn.addEventListener('click', closeAjukanIzinModal);
  if (cancelAjukanIzinBtn) cancelAjukanIzinBtn.addEventListener('click', closeAjukanIzinModal);
  if (ajukanIzinModal) {
    ajukanIzinModal.addEventListener('click', (e) => {
      if (e.target === ajukanIzinModal) closeAjukanIzinModal();
    });
  }

  if (ajukanIzinForm) {
    ajukanIzinForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!currentUser) return;

      const selectedType = document.querySelector('input[name="izinType"]:checked')?.value || 'Izin';
      const targetDate = izinDateInput.value;
      const keterangan = izinKeteranganInput.value.trim();

      try {
        const payload = {
          user_id: currentUser.id,
          date: targetDate,
          status: selectedType,
          clock_in: null,
          clock_out: null,
          duration_minutes: 0,
          notes: keterangan,
          updated_at: new Date().toISOString()
        };

        const { data, error } = await supabase
          .from('attendance')
          .upsert(payload, { onConflict: 'user_id,date' })
          .select()
          .single();

        if (error) throw error;

        const existingIdx = records.findIndex((r) => r.date === targetDate);
        if (existingIdx >= 0) {
          records[existingIdx] = data;
        } else {
          records.unshift(data);
        }

        closeAjukanIzinModal();
        renderAll();
        showToast(`Status ${selectedType} berhasil dicatat!`, 'success');
        sendSystemNotification(`Status ${selectedType} Dicatat`, `Tanggal ${targetDate} tercatat sebagai ${selectedType}.`);
      } catch (err) {
        console.error(err);
        showToast('Gagal menyimpan izin: ' + err.message, 'error');
      }
    });
  }

  // --- Handlers: Modal Edit Profil ---
  const openEditProfileModal = () => {
    const saved = getSavedUserProfile() || {};
    const defaultName = currentUser?.email ? currentUser.email.split('@')[0] : '';
    inputProfileNama.value = saved.nama || defaultName;
    inputProfileJabatan.value = saved.jabatan || 'Penata Layanan Operasional';
    editProfileModal.classList.remove('hidden');
    if (window.lucide) window.lucide.createIcons();
  };

  const closeEditProfileModal = () => {
    editProfileModal.classList.add('hidden');
  };

  if (openEditProfileBtn) openEditProfileBtn.addEventListener('click', openEditProfileModal);
  if (closeEditProfileModalBtn) closeEditProfileModalBtn.addEventListener('click', closeEditProfileModal);
  if (cancelEditProfileBtn) cancelEditProfileBtn.addEventListener('click', closeEditProfileModal);
  if (editProfileModal) {
    editProfileModal.addEventListener('click', (e) => {
      if (e.target === editProfileModal) closeEditProfileModal();
    });
  }

  if (editProfileForm) {
    editProfileForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const nama = inputProfileNama.value.trim();
      const jabatan = inputProfileJabatan.value.trim();

      if (!nama) {
        showToast('Nama tidak boleh kosong!', 'warning');
        return;
      }

      saveUserProfile({ nama, jabatan });
      showAppView();
      closeEditProfileModal();
      showToast('Profil pengguna berhasil diperbarui!', 'success');
    });
  }

  if (saveNotifSettingsBtn) {
    saveNotifSettingsBtn.addEventListener('click', async () => {
      const permGranted = await requestNotificationPermission();
      const settings = {
        enabledMasuk: toggleNotifMasuk.checked,
        enabledPulang: toggleNotifPulang.checked
      };
      saveNotifSettings(settings);
      updateNotifBadgeUI();
      closeNotifModal();
      if (permGranted) {
        showToast('Pengaturan notifikasi berhasil disimpan!', 'success');
      } else {
        showToast('Pengaturan disimpan, mohon izinkan notifikasi di browser Anda', 'info');
      }
    });
  }

  if (testNotifBtn) {
    testNotifBtn.addEventListener('click', async () => {
      const permGranted = await requestNotificationPermission();
      if (permGranted) {
        sendSystemNotification(
          '🔔 Tes Notifikasi HadirKu',
          'Notifikasi berfungsi normal! Pengingat akan berbunyi jam 07:15 & 14:30 WITA (Senin - Sabtu).'
        );
        showToast('Notifikasi tes berhasil dikirim!', 'success');
      } else {
        showToast('Izin notifikasi belum diberikan atau diblokir browser', 'error');
      }
    });
  }

  // --- PWA Setup & Service Worker Registration ---
  const setupPWA = () => {
    // 1. Registrasi Service Worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
          .then((reg) => {
            console.log('HadirKu Service Worker terdaftar:', reg.scope);
          })
          .catch((err) => {
            console.error('Service Worker gagal terdaftar:', err);
          });
      });
    }

    // 2. Deteksi apakah sudah terpasang (Standalone mode)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    if (isStandalone) {
      if (pwaStatusTextProfile) pwaStatusTextProfile.textContent = 'Aplikasi sudah terpasang (PWA Aktif)';
      if (pwaHomeBanner) pwaHomeBanner.classList.add('hidden');
      return;
    }

    // 3. Tangkap event beforeinstallprompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPwaPrompt = e;

      // Munculkan banner di Beranda jika belum pernah ditolak di sesi ini
      const dismissed = sessionStorage.getItem('hadirku_pwa_dismissed');
      if (!dismissed && pwaHomeBanner) {
        pwaHomeBanner.classList.remove('hidden');
        if (window.lucide) window.lucide.createIcons();
      }

      if (pwaStatusTextProfile) pwaStatusTextProfile.textContent = 'Siap dipasang ke Layar Utama';
    });

    const triggerPwaInstall = async () => {
      if (deferredPwaPrompt) {
        deferredPwaPrompt.prompt();
        const { outcome } = await deferredPwaPrompt.userChoice;
        if (outcome === 'accepted') {
          showToast('Terima kasih telah memasang HadirKu!', 'success');
          if (pwaHomeBanner) pwaHomeBanner.classList.add('hidden');
          if (pwaStatusTextProfile) pwaStatusTextProfile.textContent = 'Aplikasi sudah terpasang';
        }
        deferredPwaPrompt = null;
      } else {
        // Panduan manual jika prompt belum dipicu browser
        showToast('Untuk install: buka menu browser (titik 3 di Chrome atau tombol Bagikan di Safari) -> pilih "Tambahkan ke Layar Utama"', 'info');
      }
    };

    if (installPwaBannerBtn) installPwaBannerBtn.addEventListener('click', triggerPwaInstall);
    if (pwaInstallBtnProfile) pwaInstallBtnProfile.addEventListener('click', triggerPwaInstall);

    if (dismissPwaBannerBtn) {
      dismissPwaBannerBtn.addEventListener('click', () => {
        if (pwaHomeBanner) pwaHomeBanner.classList.add('hidden');
        sessionStorage.setItem('hadirku_pwa_dismissed', 'true');
      });
    }

    window.addEventListener('appinstalled', () => {
      showToast('HadirKu siap digunakan dari layar utama Anda!', 'success');
      if (pwaHomeBanner) pwaHomeBanner.classList.add('hidden');
      if (pwaStatusTextProfile) pwaStatusTextProfile.textContent = 'Aplikasi sudah terpasang (PWA Aktif)';
      deferredPwaPrompt = null;
    });
  };

  // --- Application Initialization ---
  const init = () => {
    const savedTheme = localStorage.getItem(THEME_KEY) || 'light';
    applyTheme(savedTheme);

    // Live clock & circular progress updates
    setInterval(() => {
      updateCircularTimerAndState();
      checkDailyAttendanceReminders();
    }, 1000);

    initSupabaseClient();
    setupPWA();
    updateNotifBadgeUI();
    updatePomoDisplay();
    renderWaterTracker();

    // Fade out splash screen after 1.5s
    setTimeout(() => {
      splashScreen.classList.add('opacity-0', 'pointer-events-none');
      setTimeout(() => splashScreen.remove(), 500);
      checkInitialAuth();
    }, 1500);

    if (window.lucide) window.lucide.createIcons();
  };

  init();
})();
