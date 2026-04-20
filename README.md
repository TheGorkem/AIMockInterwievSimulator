# 🤖 InterviewPro — AI Mock Interview Simulator

> Gerçekçi, uyarlanabilir ve esnek bir AI mülakat simülatörü. Şirket tarzı simülasyonlar, dinamik zorluk ayarlaması ve kapsamlı mülakat sonu raporuyla hayalindeki işe hazırlan.

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi)](https://fastapi.tiangolo.com)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?logo=python)](https://python.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://typescriptlang.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-purple)](LICENSE)

---

## ✨ Özellikler

| Özellik | Açıklama |
|---|---|
| 🧠 **Uyarlanabilir AI Soruları** | Rol, kıdem seviyesi ve tech stack'e göre özelleştirilmiş sorular |
| 🏢 **Şirket Simülasyonları** | Google, Amazon, Meta, Microsoft, Startup, Kurumsal tarzlar |
| 🎯 **Dinamik Zorluk** | Performansınıza göre otomatik zorluk ayarı (Easy → Expert) |
| 💡 **Akıllı İpucu Sistemi** | Zorlandığında cevabı vermeden yönlendirici ipuçları |
| 📋 **Yapılandırılmış Akış** | Arka plan → Teknik → Davranışsal → Senaryo aşamaları |
| 📊 **Kapsamlı Final Raporu** | Güçlü yönler, zayıflıklar, teknik seviye, iletişim skoru |
| 🌐 **Çoklu Dil** | 🇬🇧 İngilizce · 🇹🇷 Türkçe · 🇩🇪 Almanca |
| 🌙 **Tema Desteği** | Dark / Light mod |

---

## 🚀 Hızlı Başlangıç

### Gereksinimler

- **Node.js** 18+
- **Python** 3.10+
- **OpenRouter API Key** → [openrouter.ai](https://openrouter.ai)

---

### 1. Repoyu klonla

```bash
git clone https://github.com/TheGorkem/AIMockInterwievSimulator.git
cd AIMockInterwievSimulator
```

---

### 2. Backend Kurulumu

```bash
cd backend

# Sanal ortam oluştur (önerilir)
python -m venv venv
source venv/bin/activate        # macOS/Linux
# venv\Scripts\activate         # Windows

# Bağımlılıkları yükle
pip install -r requirements.txt

# .env dosyasını oluştur
cp .env.example .env
# .env dosyasını aç ve API key'ini gir:
#   OPENROUTER_API_KEY=sk-or-...
#   OPENROUTER_MODEL=openai/gpt-4o-mini

# Sunucuyu başlat
uvicorn main:app --reload
```

Backend `http://localhost:8000` adresinde çalışacak.  
API dokümantasyonu: `http://localhost:8000/docs`

---

### 3. Frontend Kurulumu

```bash
cd frontend

# Bağımlılıkları yükle
npm install

# Geliştirme sunucusunu başlat
npm run dev
```

Uygulama `http://localhost:3000` adresinde açılacak.

---

## 🗂️ Proje Yapısı

```
AIMockInterwievSimulator/
│
├── backend/                        # Python FastAPI
│   ├── main.py                     # Uygulama giriş noktası
│   ├── requirements.txt            # Python bağımlılıkları
│   ├── .env.example                # Örnek ortam değişkenleri
│   ├── routers/
│   │   └── interview.py            # API endpoint'leri
│   └── services/
│       ├── ai_service.py           # OpenRouter AI entegrasyonu
│       └── session_service.py      # Oturum yönetimi
│
└── frontend/                       # Next.js 15 + TypeScript
    ├── app/
    │   ├── page.tsx                # Ana sayfa (setup formu)
    │   ├── globals.css             # Global stiller
    │   └── interview/
    │       └── page.tsx            # Mülakat oturumu sayfası
    ├── components/
    │   ├── theme-toggle.tsx        # Dark/Light geçişi
    │   └── language-toggle.tsx     # Dil seçici
    └── lib/
        ├── api.ts                  # Backend API çağrıları
        ├── translations.ts         # EN / TR / DE çevirileri
        ├── language-context.tsx    # Dil bağlamı
        └── theme-context.tsx       # Tema bağlamı
```

---

## ⚙️ Ortam Değişkenleri

### Backend (`backend/.env`)

```env
OPENROUTER_API_KEY=your_openrouter_api_key_here
OPENROUTER_MODEL=openai/gpt-4o-mini
```

> 💡 `.env.example` dosyası repoda mevcuttur. Kopyalayıp kendi anahtarınızı girin.

---

## 🤖 Desteklenen Şirket Tarzları

| Şirket | Tarz |
|---|---|
| 🔍 **Google** | Analitik, algoritmik, sistem tasarımı |
| 📦 **Amazon** | Liderlik prensipleri, STAR yöntemi |
| Ⓜ️ **Meta** | Kodlama ağırlıklı, ürün duygusu |
| 🪟 **Microsoft** | Problem çözme, işbirlikçi |
| 🚀 **Startup** | Pratik, hızlı, gerçek dünya |
| 🏢 **Kurumsal** | Yapılandırılmış, geleneksel |

---

## 📡 API Endpoint'leri

| Method | Endpoint | Açıklama |
|---|---|---|
| `GET` | `/api/interview/config` | Şirket ve zorluk listesi |
| `POST` | `/api/interview/start` | Yeni mülakat oturumu başlat |
| `POST` | `/api/interview/answer` | Cevap gönder ve değerlendir |
| `POST` | `/api/interview/next` | Sonraki soruyu al |
| `POST` | `/api/interview/end` | Mülakatı bitir ve rapor al |

---

## 🛠️ Geliştirme Komutları

### Frontend
```bash
npm run dev      # Geliştirme sunucusu
npm run build    # Production build
npm run lint     # ESLint kontrolü
```

### Backend
```bash
uvicorn main:app --reload          # Geliştirme
uvicorn main:app --host 0.0.0.0    # Production
```

---

## 📄 Lisans

Bu proje [MIT Lisansı](LICENSE) ile lisanslanmıştır.

---

<div align="center">

**InterviewPro** — Hayalindeki işe hazırlan 🚀

</div>
