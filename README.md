# Arduino Temperature Monitor

Website monitoring suhu dari Arduino menggunakan React dan Supabase.

## Cara Setup

### 1. Buat Project Supabase

1. Daftar/login di [supabase.com](https://supabase.com)
2. Buat project baru
3. Catat **Project URL** dan **Anon Key** dari Settings > API

### 2. Buat Tabel di Supabase

Jalankan SQL berikut di **SQL Editor** Supabase:

```sql
CREATE TABLE temperature_readings (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  sensor_id TEXT NOT NULL DEFAULT 'arduino-1',
  temperature FLOAT NOT NULL,
  humidity FLOAT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE temperature_readings;

-- Allow public insert (untuk Arduino)
CREATE POLICY "Allow public insert" ON temperature_readings
  FOR INSERT WITH CHECK (true);

-- Allow public read
CREATE POLICY "Allow public read" ON temperature_readings
  FOR SELECT USING (true);

ALTER TABLE temperature_readings ENABLE ROW LEVEL SECURITY;
```

### 3. Setup Project React

```bash
npm create vite@latest arduino-monitor -- --template react
cd arduino-monitor
npm install @supabase/supabase-js recharts lucide-react
```

### 4. Konfigurasi Environment

Buat file `.env` di root project:

```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxxxxxx
```

### 5. Copy File

Copy semua file dari folder ini ke dalam project React Anda.

### 6. Jalankan

```bash
npm run dev
```

---

## Cara Kirim Data dari Arduino

### Menggunakan ESP8266/ESP32 (WiFi)

Gunakan kode di file `arduino/esp_sender.ino`

Library yang dibutuhkan:

- ESP8266WiFi atau WiFi (untuk ESP32)
- ESP8266HTTPClient atau HTTPClient
- ArduinoJson

### Menggunakan Arduino + Ethernet Shield

Gunakan kode di file `arduino/ethernet_sender.ino`

---

## Struktur Project

```
src/
├── lib/
│   └── supabase.js          # Konfigurasi Supabase
├── components/
│   ├── TemperatureGauge.jsx  # Gauge suhu
│   ├── TemperatureChart.jsx  # Grafik riwayat
│   ├── StatsCard.jsx         # Kartu statistik
│   └── RecentReadings.jsx    # Tabel data terbaru
├── App.jsx                   # Komponen utama
└── main.jsx
```
