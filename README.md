# Absensi Karyawan

Aplikasi absensi dengan halaman karyawan dan HRD. Dibuat dengan React, Ant Design, 2 API NestJS, MySQL, dan RabbitMQ.

## Setup

Requirements:
- Node.js 22.22.3+ dalam seri 22
- npm
- Docker Compose v2

Jalankan dari root di terminal:

```sh
cp -i .env.example .env
cp -i frontend/.env.example frontend/.env
npm --prefix employee-api ci
npm --prefix attendance-api ci
npm --prefix frontend ci
```

Pilih `n` kalau file env sudah ada. Ganti `JWT_SECRET` di `.env`. Kedua API memakai nilai yang sama. Isi URL API di `frontend/.env` tanpa `/api`. Password contoh hanya untuk lokal.

```sh
docker compose up -d --wait mysql rabbitmq
npm --prefix employee-api run migration:run
npm --prefix employee-api run migration:audit
npm --prefix attendance-api run migration:run
npm --prefix employee-api run seed
```

Catatan MySQL ada di [infra/mysql](infra/mysql/README.md).

## Jalankan

Jalankan tiap perintah di terminal terpisah, dari root proyek:

```sh
npm --prefix employee-api run start:dev
```

```sh
npm --prefix attendance-api run start:dev
```

```sh
npm --prefix frontend run dev -- --port 5173 --strictPort
```

Buka `http://localhost:5173`.

Port default employee API adalah 3001 dan attendance API 3002. Cek `/api/health` pada masing-masing API. RabbitMQ bisa dibuka di `http://localhost:15672` dengan akun dari `.env`.

## Akun demo

| Role | Email | Password |
| --- | --- | --- |
| ADMIN | admin@example.com | DemoAdmin123! |
| EMPLOYEE | employee1@example.com | DemoEmployee123! |
| EMPLOYEE | employee2@example.com | DemoEmployee123! |

Seed tidak menimpa data yang sudah ada. Absensi demo ada pada 1–2 Oktober 2026. Pilih tanggal itu di Riwayat atau Monitoring. Semua tanggal dan jam ditampilkan dalam WIB.

Untuk mencoba notifikasi, buka halaman ADMIN dulu. Login EMPLOYEE di incognito atau browser lain, lalu ubah HP, foto, atau password. Halaman ADMIN mengecek notifikasi sekitar tiap 3 detik saat tab terlihat. Jika request gagal, jedanya bertambah sampai 30 detik.

RabbitMQ meneruskan perubahan profil ke `audit_db`. Worker audit berjalan di employee-api. Jalankan satu instance employee-api.

## Build dan cek

```sh
npm --prefix employee-api run build
npm --prefix attendance-api run build
npm --prefix frontend run build
npm --prefix frontend run lint
npm --prefix employee-api run smoke:rabbitmq
```

Lint backend: jalankan `npx --no-install oxlint --type-aware src/` dari masing-masing folder API.

Hentikan aplikasi dengan Ctrl+C. Untuk menghentikan MySQL dan RabbitMQ:

```sh
docker compose stop mysql rabbitmq
```
