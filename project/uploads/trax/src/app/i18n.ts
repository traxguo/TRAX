import { useStore } from './store';
import type { Member, Lang } from './types';

export type { Lang };

const en = {
  // AppShell
  hello:            (name: string) => `Welcome, ${name}`,
  eyebrowMembers:   'Member management',
  membersTitle:     'Members',
  eyebrowCheckin:   'Quick entry',
  eyebrowWhatsapp:  'Bulk message',
  memberCount:      (n: number) => `${n} members`,

  // Home
  liveToday:    'LIVE · TODAY',
  entries:      'entries',
  inside:       'inside',
  activeMembers:'Active members',
  monthlyRev:   'Monthly revenue',
  occupancy:    'Occupancy',
  thisWeek:     'This week',
  renewal:      'Renewal',
  weekDays:     (d: string) => d,
  weeklyChart:  'Weekly entries',
  busiest:      (day: string) => `${day} busiest`,
  renewalDue:   'Renewals due',
  seeAll:       'All',
  recentAct:    'Recent activity',
  noRenewals:   'No renewals pending 🎉',
  noActivity:   'No check-ins yet',
  days7:        ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
  daysFull:     ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'],
  months12:     ['January','February','March','April','May','June','July','August','September','October','November','December'],
  months12s:    ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
  dateLong:     (dow: string, day: number, month: string) => `${dow}, ${month} ${day}`,
  scheduledToday: (n: number) => `${n} scheduled today`,
  todayLbl:     'Today',
  yesterdayLbl: 'Yesterday',
  memberCreated:'Member registered',
  scheduleDaysLbl: 'Class days',
  deletedToast: (name: string) => `${name} deleted`,
  undoBtn:      'Undo',
  shareBtn:     'Share',

  // Status
  statusActive:   'Active',
  statusExpiring: 'Expiring',
  statusExpired:  'Expired',
  statusFrozen:   'Frozen',

  // kalanText equivalents
  kalan: (m: Member): string => {
    if (m.status === 'frozen') return 'Frozen';
    if (m.kind === 'paket') {
      if ((m.adet ?? 0) <= 0) return 'Package ended';
      return `${m.adet} sessions left`;
    }
    if (m.daysLeft < 0)  return `${Math.abs(m.daysLeft)} days ago`;
    if (m.daysLeft === 0) return 'Expires today';
    return `${m.daysLeft} days left`;
  },

  // Members
  filterAll:      'All',
  filterExpired:  'Expired',
  filterExpiring: 'Expiring',
  filterActive:   'Active',
  filterFrozen:   'Frozen',
  noMembers:      'No members in this category.',

  // CheckIn
  calTab:         'Calendar',
  qrTab:          'Scan QR',
  allWeekLbl:     'ALL',
  weekLbl:        'week',
  entryCount:     (n: number) => `${n} entries`,
  attended:       'Attended',
  absent:         'Absent',
  noSchedule:     'No one scheduled for today',
  addToSchedule:  'Add to schedule',
  addBtn:         'Add',
  editSchedule:   'Edit schedule',

  // QR Scanner
  qrInstruction:  'Bring the QR code into the frame',
  checkedIn:      'Checked in',
  alreadyIn:      'Already checked in',
  camError:       'Camera access denied. Please enable in settings.',

  // Member QR
  memberQR:       'Member QR Code',
  qrHint:         'Take a screenshot and send via WhatsApp',
  closeBtn:       'Close',

  // MemberDetail
  memberProfile:  'Member profile',
  packageStatus:  'Package status',
  membershipPrd:  'Membership period',
  startPfx:       'Start · ',
  endPfx:         'End · ',
  completedSfx:   '% completed',
  totalVisits:    'Total visits',
  attendRate:     'Attendance rate',
  trainerLbl:     'Trainer',
  contactSec:     'Contact',
  phoneLbl:       'Phone',
  emailLbl:       'Email',
  sendMsg:        'Send message',
  activitySec:    'Activity history',
  renewBtn:       'Renew membership',
  addSessBtn:     'Add 10 sessions',
  sessionsAdded:  '10 sessions added',
  memberRenewed:  'Membership renewed',
  deleteMember:   'Delete member',
  sessions:       'sessions',

  // MemberFormSheet
  newMemberEyebrow: 'New member',
  editEyebrow:      'Edit',
  addMemberTitle:   'Add member',
  fullNameLbl:      'Full Name',
  planLbl:          'Membership Plan',
  monthlyPlan:      'Monthly',
  packagePlan:      'Package',
  expiryLbl:        'Membership expiry date',
  sessionsLbl:      'Sessions (package)',
  trainerOptLbl:    'Trainer',
  saveMemberBtn:    'Save member',
  saveChangesBtn:   'Save changes',
  optional:         'optional',

  // ProfileSheet
  bizAccount:     'Business account',
  editInfoTitle:  'Edit information',
  authorizedLbl:  'Authorized',
  totalMembersLbl:'Total members',
  editInfoBtn:    'Edit information',
  logoutBtn:          'Sign out',
  deleteAccountBtn:   'Delete account',
  deleteAccountTitle: 'Delete account?',
  deleteAccountConfirm: 'All your data will be permanently deleted. This cannot be undone.',
  deleteAccountFinal: 'Yes, delete',
  deleteAccountErr:   'An error occurred. Please try again.',
  deleteAccountRelogin: 'Please sign out and sign back in before deleting your account.',
  salonNameLbl:   'Studio name',
  bizNameLbl:     'Business name',
  authNameLbl:    'Authorized name',
  cityLbl:        'City',
  cancelBtn:      'Cancel',
  saveBtn:        'Save',
  languageLbl:    'Language',
  people:         'people',

  // Login
  loginTagline:   'Studio management panel',
  welcomeBack:    'Welcome back',
  loginSub:       'Sign in with your business account',
  emailInputLbl:  'Email',
  passwordLbl:    'Password',
  confirmPwLbl:   'Confirm password',
  forgotPw:       'Forgot password',
  signInBtn:      'Sign In',
  signUpBtn:      'Create Account',
  noAccount:      "Don't have an account?",
  haveAccount:    'Already have an account?',
  createAccount:  'Create business account',
  signInLink:     'Sign in',
  signUpTitle:    'Create Account',
  signUpSub:      'Set up your business account',
  loginError:     'Enter a valid email and password (min 6 characters).',
  pwMismatch:     'Passwords do not match.',
  errWrongPassword:   'Incorrect email or password.',
  errEmailInUse:      'This email is already registered.',
  errWeakPassword:    'Password must be at least 6 characters.',
  errTooManyAttempts: 'Too many attempts. Please try again later.',
  errNetworkFailed:   'Connection error. Check your internet.',
  resetSub:           'Enter your email to receive a reset link.',
  resetBtn:           'Send reset link',
  resetSent:          (email: string) => `A reset link has been sent to ${email}. Check your inbox.`,
  backToLogin:        '← Back to sign in',

  // Onboarding
  step1Title:     "Let's set up your studio",
  step1Sub:       'Business information that will appear in the panel.',
  step2Title:     'One last step',
  step2Sub:       'How should we greet you?',
  continueBtn:    'Continue',
  finishBtn:      'Complete setup',
  loginEmail:     'Login: ',

  // NotifSheet
  todayEyebrow:   'Today',
  notifTitle:     'Notifications',
  markAllRead:    'Mark all as read',
  noNotifs:       'No new notifications 🎉',
  notifExpired:   (name: string) => `${name}'s membership expired`,
  notifExpiring:  (name: string) => `${name} needs renewal`,
  daysAgo:        (n: number) => `${Math.abs(n)} days ago`,
  daysLeftN:      (n: number) => `${n} days left`,
  notifJoined:    (name: string) => `${name} signed up`,

  // SearchSheet
  searchEyebrow:  'Quick search',
  searchTitle:    'Search members',
  searchPH:       'Name, phone or email…',
  renewingSoon:   'Renewing soon',
  noResults:      (q: string) => `No results for "${q}".`,

  // ConfirmSheet
  confirmEyebrow: 'Confirm',
  confirmTitle:   'Delete member',
  confirmText:    (_name: string) => 'will be permanently deleted. This cannot be undone.',
  cancelBtn2:     'Cancel',
  deleteBtn:      'Delete',

  // WhatsApp
  templateSec:    'Template',
  recipientsSec:  'Recipients',
  noneBtn:        'None',
  allBtn:         'All',
  sendNBtn:       (n: number) => `Send to ${n}`,
  nextBtn:        (name: string, curr: number, total: number) => `Next: ${name} (${curr}/${total})`,
  sentMsg:        (n: number) => `${n} messages sent`,
  noRecipients:   'No members need messaging 🎉',
  tmplRenewName:  'Renewal reminder',
  tmplWinback:    'Win-back',
  tmplWelcome:    'Welcome',
  tmplRenewBody:  (name: string, kalan: string) =>
    `Hi ${name}! Your TRAX membership expires in ${kalan}. Come by the studio to renew. 💪`,
  tmplWinbackBody:(name: string) =>
    `We miss you ${name}! Return this week and get 20% off your first month. 🎁`,
  tmplWelcomeBody:(name: string) =>
    `Welcome to the TRAX family ${name}! Happy training! 🔥`,
};

const tr: typeof en = {
  // AppShell
  hello:            (name: string) => `Hoş geldin, ${name}`,
  eyebrowMembers:   'Üye yönetimi',
  membersTitle:     'Üyeler',
  eyebrowCheckin:   'Hızlı giriş',
  eyebrowWhatsapp:  'Toplu mesaj',
  memberCount:      (n: number) => `${n} üye`,

  // Home
  liveToday:    'CANLI · BUGÜN',
  entries:      'giriş',
  inside:       'içeride',
  activeMembers:'Aktif üye',
  monthlyRev:   'Aylık gelir',
  occupancy:    'Doluluk',
  thisWeek:     'Bu hafta',
  renewal:      'Yenileme',
  weekDays:     (d: string) => d,
  weeklyChart:  'Haftalık giriş',
  busiest:      (day: string) => `${day} en yoğun`,
  renewalDue:   'Yenileme bekleyen',
  seeAll:       'Tümü',
  recentAct:    'Son hareketler',
  noRenewals:   'Yenileme bekleyen üye yok 🎉',
  noActivity:   'Henüz giriş yok',
  days7:        ['Pzt','Sal','Çar','Per','Cum','Cmt','Paz'],
  daysFull:     ['Pazartesi','Salı','Çarşamba','Perşembe','Cuma','Cumartesi','Pazar'],
  months12:     ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'],
  months12s:    ['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'],
  dateLong:     (dow: string, day: number, month: string) => `${dow}, ${day} ${month}`,
  scheduledToday: (n: number) => `bugün programda ${n} üye`,
  todayLbl:     'Bugün',
  yesterdayLbl: 'Dün',
  memberCreated:'Üye kaydı oluşturuldu',
  scheduleDaysLbl: 'Ders günleri',
  deletedToast: (name: string) => `${name} silindi`,
  undoBtn:      'Geri al',
  shareBtn:     'Paylaş',

  // Status
  statusActive:   'Aktif',
  statusExpiring: 'Bitmek üzere',
  statusExpired:  'Süresi doldu',
  statusFrozen:   'Donduruldu',

  // kalanText equivalents
  kalan: (m: Member): string => {
    if (m.status === 'frozen') return 'Donduruldu';
    if (m.kind === 'paket') {
      if ((m.adet ?? 0) <= 0) return 'Paket bitti';
      return `${m.adet} seans kaldı`;
    }
    if (m.daysLeft < 0)  return `${Math.abs(m.daysLeft)} gün geçti`;
    if (m.daysLeft === 0) return 'Bugün bitiyor';
    return `${m.daysLeft} gün kaldı`;
  },

  // Members
  filterAll:      'Tümü',
  filterExpired:  'Doldu',
  filterExpiring: 'Bitmek üzere',
  filterActive:   'Aktif',
  filterFrozen:   'Donduruldu',
  noMembers:      'Bu kategoride üye yok.',

  // CheckIn
  calTab:         'Takvim',
  qrTab:          'QR Tara',
  allWeekLbl:     'TÜM',
  weekLbl:        'hafta',
  entryCount:     (n: number) => `${n} giriş`,
  attended:       'Geldi',
  absent:         'Gelmedi',
  noSchedule:     'Bu gün için kimse programda değil',
  addToSchedule:  'Programa üye ekle',
  addBtn:         'Ekle',
  editSchedule:   'Program düzenle',

  // QR Scanner
  qrInstruction:  'QR kodu kareye getirin',
  checkedIn:      'Derse girdi',
  alreadyIn:      'Zaten giriş yapmış',
  camError:       'Kamera erişimi reddedildi. Ayarlardan izin verin.',

  // Member QR
  memberQR:       'Üye QR Kodu',
  qrHint:         'Ekran görüntüsü alıp WhatsApp ile gönderin',
  closeBtn:       'Kapat',

  // MemberDetail
  memberProfile:  'Üye profili',
  packageStatus:  'Paket durumu',
  membershipPrd:  'Üyelik süresi',
  startPfx:       'Başlangıç · ',
  endPfx:         'Bitiş · ',
  completedSfx:   '% tamamlandı',
  totalVisits:    'Toplam ziyaret',
  attendRate:     'Devam oranı',
  trainerLbl:     'Antrenör',
  contactSec:     'İletişim',
  phoneLbl:       'Telefon',
  emailLbl:       'E-posta',
  sendMsg:        'Mesaj gönder',
  activitySec:    'Hareket geçmişi',
  renewBtn:       'Üyeliği yenile',
  addSessBtn:     'Pakete 10 seans ekle',
  sessionsAdded:  '10 seans eklendi',
  memberRenewed:  'Üyelik yenilendi',
  deleteMember:   'Üyeyi sil',
  sessions:       'seans',

  // MemberFormSheet
  newMemberEyebrow: 'Yeni üye',
  editEyebrow:      'Düzenle',
  addMemberTitle:   'Üye ekle',
  fullNameLbl:      'Ad Soyad',
  planLbl:          'Üyelik Planı',
  monthlyPlan:      'Aylık',
  packagePlan:      'Paket',
  expiryLbl:        'Üyelik bitiş tarihi',
  sessionsLbl:      'Paket adedi (seans)',
  trainerOptLbl:    'Antrenör',
  saveMemberBtn:    'Üyeyi kaydet',
  saveChangesBtn:   'Değişiklikleri kaydet',
  optional:         'opsiyonel',

  // ProfileSheet
  bizAccount:     'İşletme hesabı',
  editInfoTitle:  'Bilgileri düzenle',
  authorizedLbl:  'Yetkili',
  totalMembersLbl:'Toplam üye',
  editInfoBtn:    'Bilgileri düzenle',
  logoutBtn:          'Çıkış yap',
  deleteAccountBtn:   'Hesabı sil',
  deleteAccountTitle: 'Hesabı sil?',
  deleteAccountConfirm: 'Tüm veriler kalıcı olarak silinecek. Bu işlem geri alınamaz.',
  deleteAccountFinal: 'Evet, sil',
  deleteAccountErr:   'Bir hata oluştu. Tekrar deneyin.',
  deleteAccountRelogin: 'Hesabı silmek için çıkış yapıp tekrar giriş yapmanız gerekiyor.',
  salonNameLbl:   'Salon adı',
  bizNameLbl:     'İşletme ünvanı',
  authNameLbl:    'Yetkili adı',
  cityLbl:        'Şehir',
  cancelBtn:      'Vazgeç',
  saveBtn:        'Kaydet',
  languageLbl:    'Dil',
  people:         'kişi',

  // Login
  loginTagline:   'Stüdyo yönetim paneli',
  welcomeBack:    'Tekrar hoş geldin',
  loginSub:       'İşletme hesabınla giriş yap',
  emailInputLbl:  'E-posta',
  passwordLbl:    'Şifre',
  confirmPwLbl:   'Şifre tekrar',
  forgotPw:       'Şifremi unuttum',
  signInBtn:      'Giriş yap',
  signUpBtn:      'Hesap oluştur',
  noAccount:      'Hesabın yok mu?',
  haveAccount:    'Zaten hesabın var mı?',
  createAccount:  'İşletme kaydı oluştur',
  signInLink:     'Giriş yap',
  signUpTitle:    'Hesap Oluştur',
  signUpSub:      'İşletme hesabını oluştur',
  loginError:     'Geçerli e-posta ve en az 6 karakterli şifre girin.',
  pwMismatch:     'Şifreler eşleşmiyor.',
  errWrongPassword:   'Hatalı e-posta veya şifre.',
  errEmailInUse:      'Bu e-posta zaten kayıtlı.',
  errWeakPassword:    'Şifre en az 6 karakter olmalı.',
  errTooManyAttempts: 'Çok fazla deneme. Lütfen sonra tekrar deneyin.',
  errNetworkFailed:   'Bağlantı hatası. İnternetinizi kontrol edin.',
  resetSub:           'Şifre sıfırlama bağlantısı göndermek için e-postanı gir.',
  resetBtn:           'Bağlantı gönder',
  resetSent:          (email: string) => `${email} adresine sıfırlama bağlantısı gönderildi. Gelen kutunu kontrol et.`,
  backToLogin:        '← Girişe dön',

  // Onboarding
  step1Title:     'Stüdyonu tanıyalım',
  step1Sub:       'Panelde görünecek işletme bilgileri.',
  step2Title:     'Son bir adım',
  step2Sub:       'Seni nasıl selamlayalım?',
  continueBtn:    'Devam',
  finishBtn:      'Kurulumu tamamla',
  loginEmail:     'Giriş: ',

  // NotifSheet
  todayEyebrow:   'Bugün',
  notifTitle:     'Bildirimler',
  markAllRead:    'Tümünü okundu işaretle',
  noNotifs:       'Yeni bildirim yok 🎉',
  notifExpired:   (name: string) => `${name} üyeliği doldu`,
  notifExpiring:  (name: string) => `${name} yenilemeli`,
  daysAgo:        (n: number) => `${Math.abs(n)} gün geçti`,
  daysLeftN:      (n: number) => `${n} gün kaldı`,
  notifJoined:    (name: string) => `${name} kaydoldu`,

  // SearchSheet
  searchEyebrow:  'Hızlı arama',
  searchTitle:    'Üye ara',
  searchPH:       'İsim, telefon veya e-posta…',
  renewingSoon:   'Yenilemesi yakın',
  noResults:      (q: string) => `"${q}" için sonuç yok.`,

  // ConfirmSheet
  confirmEyebrow: 'Onay',
  confirmTitle:   'Üyeyi sil',
  confirmText:    (_name: string) => 'kalıcı olarak silinecek. Bu işlem geri alınamaz.',
  cancelBtn2:     'Vazgeç',
  deleteBtn:      'Sil',

  // WhatsApp
  templateSec:    'Şablon',
  recipientsSec:  'Alıcılar',
  noneBtn:        'Hiçbiri',
  allBtn:         'Tümü',
  sendNBtn:       (n: number) => `${n} kişiye gönder`,
  nextBtn:        (name: string, curr: number, total: number) => `Sonraki: ${name} (${curr}/${total})`,
  sentMsg:        (n: number) => `${n} mesaj gönderildi`,
  noRecipients:   'Mesaj bekleyen üye yok 🎉',
  tmplRenewName:  'Yenileme hatırlatması',
  tmplWinback:    'Geri kazanım',
  tmplWelcome:    'Hoş geldin',
  tmplRenewBody:  (name: string, kalan: string) =>
    `Merhaba ${name}! TRAX üyeliğinin bitmesine ${kalan} kaldı. Yenilemek için stüdyoya uğrayabilirsin. 💪`,
  tmplWinbackBody:(name: string) =>
    `Seni özledik ${name}! Bu hafta dönersen ilk aya %20 indirim hediye. 🎁`,
  tmplWelcomeBody:(name: string) =>
    `TRAX ailesine hoş geldin ${name}! İyi antrenmanlar! 🔥`,
};

export const LANG = { en, tr };
export type T = typeof en;

export function useT(): T {
  const { lang } = useStore();
  return LANG[lang];
}
