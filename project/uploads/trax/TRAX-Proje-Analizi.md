# TRAX
## Fitness Stüdyosu Yönetim Platformu — Proje Analizi

---

> **Bir bakışta:** TRAX, küçük ve orta ölçekli spor salonu / fitness stüdyosu sahiplerinin üye yönetimini, ders takibini ve üye iletişimini tek bir mobil uygulamadan yönetmesini sağlayan, telefona kurulabilen bir web uygulamasıdır (PWA).

---

## 1. Yönetici Özeti

TRAX, salon sahibinin elindeki **defter–kalem, Excel tablosu ve dağınık WhatsApp mesajlarının** yerini alan modern bir yönetim panelidir. Tek bir telefondan:

- Üyeleri kaydeder ve durumlarını anlık takip eder,
- Derslere kimin geldiğini QR kod veya takvimle işaretler,
- Üyeliği bitmek üzere olanlara toplu WhatsApp hatırlatması gönderir,
- Günlük doluluk ve gelir göstergelerini canlı izler.

Uygulama **bulut tabanlıdır** — verinin tamamı güvenli şekilde Firebase'de saklanır, her salon sahibi yalnızca kendi verisini görür, telefonu değişse bile verisi kaybolmaz.

---

## 2. Çözülen Problem

| Salon sahibinin yaşadığı sorun | TRAX'in çözümü |
|---|---|
| "Kimin üyeliği ne zaman bitiyor?" karmaşası | Renk kodlu otomatik durum takibi (yeşil/sarı/kırmızı) |
| Üyelik yenileme hatırlatmalarını tek tek yazmak | Tek dokunuşla toplu, kişiselleştirilmiş WhatsApp mesajı |
| Derse kim geldi takibinin kağıtta tutulması | QR kod okutma + dijital takvim |
| Paket (seans) sayısının elle sayılması | Otomatik seans düşürme + paket bitti uyarısı |
| Verinin tek bir telefonda/kağıtta hapsolması | Bulutta saklama, her cihazdan erişim |
| Gelir ve doluluğun bilinmemesi | Canlı ana ekran göstergeleri |

---

## 3. Hedef Kitle

### Birincil Kitle
- **Bağımsız spor salonu sahipleri** (1–3 şubeli)
- **Kişisel antrenörler / PT stüdyoları**
- **Pilates, yoga, crossfit, dövüş sanatları stüdyoları**
- **Butik fitness işletmeleri**

### Profil Özellikleri
- 50–500 arası üyeye sahip,
- Pahalı kurumsal yazılımlara (ör. büyük zincir CRM'leri) bütçesi/ihtiyacı olmayan,
- Günlük işini telefondan yürüten,
- Teknik bilgisi sınırlı, **basit ve hızlı** arayüz isteyen işletmeciler.

### Coğrafi Hedef
- **Türkiye** ve **ABD** — uygulama çift dilli (Türkçe/İngilizce) olarak tasarlandı, varsayılan dil İngilizce.

---

## 4. Temel Özellikler

### 🏠 Ana Ekran (Dashboard)
Salonun nabzını tutan canlı kontrol paneli:
- **Bugünkü giriş sayısı** ve düne göre artış/azalış göstergesi
- **Haftalık giriş grafiği** (en yoğun gün vurgulu)
- **Aktif üye / haftalık giriş / yenileme bekleyen** özet kutuları
- **Yenileme bekleyen üyeler** listesi (öncelik sırasıyla)
- **Son hareketler** akışı (kim ne zaman giriş yaptı)

### 👥 Üye Yönetimi
- Üye ekleme/düzenleme/silme
- **Renk kodlu durum sistemi:**
  - 🟢 Aktif — 🟡 Bitmek üzere — 🔴 Süresi dolmuş — ⚪ Donduruldu
- **Anlık arama** (isim, telefon, e-posta)
- Duruma göre filtreleme
- **Yanlışlıkla silmeyi geri alma** (5 saniyelik geri al butonu)

### 📋 Üye Detay Sayfası
- Üyelik ilerleme çubuğu (ne kadarı tamamlandı)
- Toplam ziyaret, devam oranı, antrenör bilgisi
- **Tek dokunuşla arama / e-posta / WhatsApp**
- Gerçek ders giriş geçmişi (zaman çizelgesi)
- **Üyeye özel QR kod** üretme ve paylaşma
- Üyeliği yenileme / pakete seans ekleme

### 📅 Yoklama / Check-In
- **Haftalık takvim görünümü** — gün gün ders programı
- Her üye için "geldi / gelmedi" işaretleme
- **Ders programı düzenleme** (üyenin hangi günler geldiğini belirleme)
- **İki yoklama yöntemi:**
  1. **QR kod okutma** — üye QR'ını gösterir, kamera okur, anında giriş
  2. **Manuel takvim** — listeden tek tek işaretleme

### 📦 Paket (Seans) Takibi
- Seans bazlı üyelikler için otomatik sayaç
- Her giriş **1 seans düşürür**
- **Paket bittiğinde** (-1'e düşse bile) giriş yapılır ve **uyarı gösterilir**

### 💬 Toplu WhatsApp İletişimi
- 3 hazır şablon: **Yenileme hatırlatması / Geri kazanım / Hoş geldin**
- Mesajlar üyenin adıyla **otomatik kişiselleştirilir**
- Hedef kitle otomatik seçilir (süresi dolan/dolmak üzere olanlar)
- Sıralı gönderim — birer birer WhatsApp'ı açar

### 🔐 Hesap & Güvenlik
- E-posta/şifre ile **gerçek kullanıcı girişi**
- Yeni hesap oluşturma
- **Şifremi unuttum** (e-posta ile sıfırlama)
- **Beni hatırla** seçeneği
- **Hesap silme** (tüm veriyle birlikte, KVKK/GDPR uyumlu)
- Her kullanıcının verisi **tamamen izole** (kimse başkasının verisini göremez)

### 🌍 Çok Dillilik
- Tam **Türkçe / İngilizce** desteği
- Profil ekranından anında dil değiştirme
- Tüm metinler, tarihler, gün isimleri yerelleştirilmiş

### 📲 Telefona Kurulabilirlik (PWA)
- App Store / Play Store gerektirmeden **ana ekrana eklenebilir**
- Android'de native kurulum penceresi
- iOS'ta kurulum yönlendirmesi
- **Çevrimdışı çalışma** desteği (internet kesilse de veri kaybolmaz)

---

## 5. Kullanıcı Yolculuğu

```
1. Kayıt Ol / Giriş Yap
        ↓
2. Stüdyo Kurulumu (salon adı, yetkili, şehir)
        ↓
3. Ana Ekran — günün özeti
        ↓
   ┌────────────┬─────────────┬──────────────┐
   ↓            ↓             ↓              ↓
Üye Ekle    Yoklama Al   WhatsApp Gönder   Üye Detay
   │            │             │              │
QR üret    QR okut /     Şablon seç /    Yenile /
           takvimle      toplu gönder    ara/mesajla
```

---

## 6. Teknik Mimari

### Kullanılan Teknolojiler
| Katman | Teknoloji | Neden |
|---|---|---|
| Arayüz | **React + TypeScript** | Hızlı, güvenilir, modern |
| Derleme | **Vite** | Çok hızlı geliştirme/build |
| Veritabanı | **Firebase Firestore** | Bulut, gerçek zamanlı, ölçeklenebilir |
| Kimlik doğrulama | **Firebase Authentication** | Güvenli e-posta/şifre |
| Kurulabilirlik | **PWA (vite-plugin-pwa)** | Mağazasız kurulum + çevrimdışı |
| QR | **qrcode + jsQR** | QR üretme ve kamera ile okuma |

### Veri Modeli
- Her kullanıcının tüm verisi `users/{kullanıcı-id}` altında saklanır
- **Güvenlik kuralı:** Kullanıcı yalnızca kendi `id`'siyle eşleşen veriye erişebilir
- **Çevrimdışı önbellek:** Veriler önce cihaza yazılır, internet gelince senkronize olur

### Maliyet Avantajı
- Firebase **ücretsiz katmanı** (Spark / $0) ile başlangıç maliyeti yok
- Yüzlerce salon ve binlerce üye ücretsiz limitlerde rahatlıkla yönetilebilir

---

## 7. Tasarım Dili

- **Koyu tema** — gece de göz yormayan premium görünüm
- **Kırmızı accent rengi** (#ff3b43) — enerji ve fitness çağrışımı
- Yumuşak geçişler, dokunma geri bildirimleri, akıcı animasyonlar
- **Mobil öncelikli** — tek elle kullanım için optimize
- **Klavye-duyarlı** form ekranları (klavye açılınca içerik kaymaz)

---

## 8. Rekabet Avantajları

| Özellik | TRAX | Tipik rakipler |
|---|---|---|
| Kurulum kolaylığı | Mağazasız, anında | Genelde app store gerekir |
| Fiyat | Ücretsiz altyapı | Aylık abonelik |
| Dil | TR + EN | Çoğu tek dil |
| WhatsApp entegrasyonu | Yerleşik, toplu | Nadiren / ek modül |
| QR yoklama | Dahil | Çoğunlukla premium |
| Öğrenme eğrisi | Çok düşük | Karmaşık panolar |

---

## 9. Mevcut Durum

✅ **Tamamlanan:**
- Tüm temel özellikler çalışır durumda
- Firebase entegrasyonu (giriş + veri saklama)
- Güvenlik kuralları aktif
- Çift dil, PWA kurulumu, çevrimdışı destek
- Şifre sıfırlama, beni hatırla, hesap silme
- Canlı ortama (Netlify) deploy

### Olası Gelecek Adımlar
- 💳 **Ödeme/aidat takibi** (kim ne zaman ne kadar ödedi)
- 📊 Gelişmiş gelir raporları
- 🔔 Otomatik bildirimler (push)
- 👨‍🏫 Çoklu antrenör / personel hesapları
- 🏢 Çoklu şube yönetimi

---

## 10. Tek Cümlelik Özet

> **TRAX**, spor salonu sahiplerinin üye, yoklama ve iletişim yönetimini telefonlarından — kağıt, Excel ve dağınık mesajlar olmadan — kolayca yürütmelerini sağlayan, çift dilli, bulut tabanlı ve ücretsiz altyapıyla çalışan modern bir fitness stüdyosu yönetim platformudur.

---

*Doküman tarihi: 17 Haziran 2026 · TRAX v0.0.1*
