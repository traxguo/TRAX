// Legal documents (draft — have a lawyer review before wide launch).
// Rendered by LegalSheet; sections keep formatting simple and readable.

export interface LegalSection { h: string; b: string }
export type LegalKind = 'terms' | 'privacy';

const LAST_UPDATED = '2026-07-08';

const en = {
  terms: <LegalSection[]>[
    { h: 'Terms of Service', b: `Last updated: ${LAST_UPDATED}\n\nThese terms govern your use of TRAX ("the Service"), a studio management application for gyms, studios and personal trainers. By creating an account you agree to these terms.` },
    { h: '1. The Service', b: 'TRAX lets business owners manage members, attendance, schedules and communication. The Service is provided "as is" and may change as we improve it.' },
    { h: '2. Your Account', b: 'You are responsible for the accuracy of the information you provide and for keeping your password safe. You must be at least 18 and use the Service for a legitimate business.' },
    { h: '3. Your Members\' Data', b: 'You enter your own members\' data (name, phone, e-mail, attendance) into the Service. You confirm you have the legal right to process this data and that you act as its data controller. TRAX processes it only to provide the Service to you, as your data processor.' },
    { h: '4. Subscription & Trial', b: 'New accounts start with a free trial. After the trial, continued use requires an active subscription. If the subscription ends or is not renewed, access is suspended until renewal; your data is retained for a reasonable period so you can return or export it.' },
    { h: '5. Acceptable Use', b: 'Do not use the Service for unlawful purposes, attempt to access other accounts\' data, or disrupt the Service. We may suspend accounts that violate these terms.' },
    { h: '6. Liability', b: 'To the maximum extent permitted by law, TRAX is not liable for indirect or consequential damages, or for loss caused by events outside our reasonable control. Our total liability is limited to the fees you paid in the last 3 months.' },
    { h: '7. Termination', b: 'You can delete your account at any time from Profile → Delete account; this permanently removes your data. We may terminate accounts that breach these terms.' },
    { h: '8. Changes', b: 'We may update these terms; material changes will be announced in the app. Continued use after changes means acceptance.' },
    { h: '9. Contact', b: 'Questions: traxguo@gmail.com' },
  ],
  privacy: <LegalSection[]>[
    { h: 'Privacy Policy', b: `Last updated: ${LAST_UPDATED}\n\nThis policy explains what data TRAX collects, why, and your rights. It is written to comply with the GDPR (EU), the Turkish KVKK, and applicable US state laws.` },
    { h: '1. Data We Collect', b: '• Account data: your e-mail address and password (stored by Google Firebase Authentication; we never see your password).\n• Business profile: studio name, business name, owner name, city.\n• Member data you enter: member names, phone numbers, e-mail addresses, plans, attendance records.\n• Preferences: app language, stored on your device.' },
    { h: '2. Why We Process It', b: 'Solely to provide the Service: authentication, storing and syncing your studio\'s data, subscription management, and support. We do not sell data, show ads, or use your data for profiling.' },
    { h: '3. Where It Is Stored', b: 'Data is stored in Google Firebase (Cloud Firestore), in the "eur3" multi-region (European Union). Google acts as our hosting sub-processor under its own GDPR commitments.' },
    { h: '4. Legal Basis', b: 'Performance of a contract (providing the Service you signed up for) and our legitimate interest in securing and improving the Service. For your members\' data, you are the data controller and TRAX is your processor.' },
    { h: '5. Retention', b: 'Data is kept while your account is active. When you delete your account, your data is permanently deleted. Suspended/expired accounts are retained for a reasonable period to allow renewal or export.' },
    { h: '6. Your Rights', b: 'You may access, correct, export or delete your data at any time: export from Profile → Export data; deletion from Profile → Delete account. For any other request, e-mail traxguo@gmail.com. EU/Turkish residents may also lodge a complaint with their supervisory authority.' },
    { h: '7. Local Storage', b: 'The app stores your language preference and an offline copy of your data on your device (browser storage/IndexedDB) so it works offline. No third-party tracking cookies are used.' },
    { h: '8. KVKK Notice (Türkiye)', b: 'Veri sorumlusu: TRAX (iletişim: traxguo@gmail.com). Kişisel veriler, hizmetin sunulması amacıyla ve sözleşmenin ifası hukuki sebebine dayanılarak işlenir; yukarıda sayılan saklama ve aktarım koşulları geçerlidir. KVKK m.11 kapsamındaki haklarınız (bilgi talep etme, düzeltme, silme, itiraz) için traxguo@gmail.com adresine başvurabilirsiniz.' },
    { h: '9. Contact', b: 'Privacy questions: traxguo@gmail.com' },
  ],
};

const tr = {
  terms: <LegalSection[]>[
    { h: 'Kullanım Şartları', b: `Son güncelleme: ${LAST_UPDATED}\n\nBu şartlar, spor salonları, stüdyolar ve kişisel antrenörler için bir işletme yönetim uygulaması olan TRAX'in ("Hizmet") kullanımını düzenler. Hesap oluşturarak bu şartları kabul etmiş olursunuz.` },
    { h: '1. Hizmet', b: 'TRAX; işletme sahiplerinin üye, yoklama, program ve iletişim yönetimini sağlar. Hizmet "olduğu gibi" sunulur ve geliştirme sürecinde değişebilir.' },
    { h: '2. Hesabınız', b: 'Verdiğiniz bilgilerin doğruluğundan ve şifrenizin güvenliğinden siz sorumlusunuz. Hizmeti kullanmak için 18 yaşından büyük olmanız ve meşru bir işletme için kullanmanız gerekir.' },
    { h: '3. Üyelerinizin Verileri', b: 'Kendi üyelerinizin verilerini (ad, telefon, e-posta, yoklama) Hizmete siz girersiniz. Bu verileri işleme hukuki yetkinizin bulunduğunu ve veri sorumlusunun siz olduğunuzu kabul edersiniz. TRAX bu verileri yalnızca size Hizmeti sunmak amacıyla, veri işleyen sıfatıyla işler.' },
    { h: '4. Abonelik ve Deneme', b: 'Yeni hesaplar ücretsiz deneme ile başlar. Deneme sonrasında kullanım için aktif abonelik gerekir. Abonelik sona erer veya yenilenmezse erişim, yenilemeye kadar askıya alınır; verileriniz geri dönebilmeniz veya dışa aktarabilmeniz için makul bir süre saklanır.' },
    { h: '5. Kabul Edilebilir Kullanım', b: 'Hizmeti hukuka aykırı amaçlarla kullanmayın, başka hesapların verilerine erişmeye çalışmayın, Hizmeti aksatmayın. Bu şartları ihlal eden hesaplar askıya alınabilir.' },
    { h: '6. Sorumluluk', b: 'Yasaların izin verdiği azami ölçüde TRAX; dolaylı zararlardan veya makul kontrolümüz dışındaki olaylardan kaynaklanan kayıplardan sorumlu değildir. Toplam sorumluluğumuz, son 3 ayda ödediğiniz ücretle sınırlıdır.' },
    { h: '7. Fesih', b: 'Hesabınızı dilediğiniz zaman Profil → Hesabı sil üzerinden silebilirsiniz; bu işlem verilerinizi kalıcı olarak siler. Şartları ihlal eden hesapları sonlandırabiliriz.' },
    { h: '8. Değişiklikler', b: 'Bu şartlar güncellenebilir; önemli değişiklikler uygulama içinde duyurulur. Değişiklik sonrası kullanım, kabul anlamına gelir.' },
    { h: '9. İletişim', b: 'Sorularınız için: traxguo@gmail.com' },
  ],
  privacy: <LegalSection[]>[
    { h: 'Gizlilik Politikası ve KVKK Aydınlatma Metni', b: `Son güncelleme: ${LAST_UPDATED}\n\nBu metin; TRAX'in hangi verileri, neden topladığını ve haklarınızı açıklar. GDPR (AB), 6698 sayılı KVKK ve ilgili ABD eyalet yasalarına uyum gözetilerek hazırlanmıştır.` },
    { h: '1. Toplanan Veriler', b: '• Hesap verileri: e-posta adresiniz ve şifreniz (Google Firebase Authentication tarafından saklanır; şifrenizi asla göremeyiz).\n• İşletme profili: salon adı, işletme ünvanı, yetkili adı, şehir.\n• Girdiğiniz üye verileri: üye adları, telefon numaraları, e-postalar, planlar, yoklama kayıtları.\n• Tercihler: uygulama dili (cihazınızda saklanır).' },
    { h: '2. İşleme Amacı', b: 'Yalnızca Hizmeti sunmak için: kimlik doğrulama, işletme verilerinizin saklanması ve senkronizasyonu, abonelik yönetimi ve destek. Veri satmayız, reklam göstermeyiz, profilleme yapmayız.' },
    { h: '3. Saklama Yeri', b: 'Veriler Google Firebase (Cloud Firestore) üzerinde, "eur3" çoklu bölgesinde (Avrupa Birliği) saklanır. Google, kendi GDPR taahhütleri kapsamında barındırma alt-işleyenimizdir.' },
    { h: '4. Hukuki Sebep', b: 'Sözleşmenin ifası (kaydolduğunuz Hizmetin sunulması) ve Hizmetin güvenliği/geliştirilmesine ilişkin meşru menfaat. Üyelerinizin verileri bakımından veri sorumlusu sizsiniz; TRAX veri işleyendir.' },
    { h: '5. Saklama Süresi', b: 'Veriler hesabınız aktif olduğu sürece tutulur. Hesabınızı sildiğinizde kalıcı olarak silinir. Askıdaki/süresi dolan hesaplar, yenileme veya dışa aktarma imkânı için makul bir süre saklanır.' },
    { h: '6. Haklarınız (KVKK m.11 dâhil)', b: 'Verilerinize erişme, düzeltme, dışa aktarma ve silme haklarına sahipsiniz: dışa aktarma Profil → Verileri dışa aktar; silme Profil → Hesabı sil. Diğer talepler için traxguo@gmail.com adresine başvurabilirsiniz. Ayrıca Kişisel Verileri Koruma Kurulu\'na / yetkili denetim makamına şikâyet hakkınız saklıdır.' },
    { h: '7. Cihaz Depolaması', b: 'Uygulama; dil tercihinizi ve çevrimdışı çalışabilmek için verilerinizin bir kopyasını cihazınızda (tarayıcı depolaması/IndexedDB) tutar. Üçüncü taraf takip çerezi kullanılmaz.' },
    { h: '8. Veri Sorumlusu', b: 'TRAX — iletişim: traxguo@gmail.com' },
  ],
};

export const LEGAL = { en, tr };
