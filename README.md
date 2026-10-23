# Absensi Karyawan

Aplikasi absensi dengan halaman karyawan dan HRD. Dibuat dengan React, Ant Design, 2 API NestJS, MySQL, dan RabbitMQ.

## Jalankan dengan Docker

Butuh Docker dengan Compose v2. Windows dan macOS bisa memakai Docker Desktop. Di Windows pilih Linux containers. Di Linux bisa memakai Docker Engine dengan plugin Compose.

Setelah clone, jalankan dari root:

```sh
docker compose up --build
```

Buka `http://localhost:5173` setelah frontend siap. Build pertama mengunduh image dan dependency. Tidak perlu membuat `.env` atau memasang Node di host. Perintahnya sama di macOS, Linux, dan Windows.

Migration dan seed berjalan otomatis sebelum API mulai. Employee API memakai port 3001, attendance API 3002. Keduanya punya `/api/health`. RabbitMQ ada di `http://localhost:15672` dengan akun default `dexa` / `dexa_local`.

Setup ini untuk demo lokal. Frontend memakai Vite preview dan worker audit memakai satu instance employee-api. Password dan JWT secret bawaan hanya untuk lokal.

```sh
docker compose logs -f
docker compose stop
docker compose up --build
```

`stop` dan `down` biasa mempertahankan data. `docker compose down -v` menghapus database, queue, dan foto yang tersimpan di volume.

Jika port bentrok, buat `.env` dari `.env.example` dan ubah port host. `EMPLOYEE_API_PORT`, `ATTENDANCE_API_PORT`, dan `FRONTEND_PORT` mengatur port aplikasi. Jalankan ulang dengan `--build` agar URL API frontend ikut berubah. Koneksi antar-container tetap memakai port internal.

## Akun demo

| Role | Email | Password |
| --- | --- | --- |
| ADMIN | admin@example.com | DemoAdmin123! |
| EMPLOYEE | employee1@example.com | DemoEmployee123! |
| EMPLOYEE | employee2@example.com | DemoEmployee123! |

Seed tidak menimpa data yang sudah ada. Absensi demo ada pada 1–2 Oktober 2026. Pilih tanggal itu di Riwayat atau Monitoring. Tanggal dan jam ditampilkan dalam WIB.

Untuk mencoba notifikasi, buka halaman ADMIN dulu. Login EMPLOYEE di incognito atau browser lain, lalu ubah HP, foto, atau password. Halaman ADMIN mengecek notifikasi sekitar tiap 3 detik saat tab terlihat. RabbitMQ meneruskan perubahan profil ke `audit_db`.

## Development tanpa container aplikasi

Butuh Node.js 22.22.3+ dalam seri 22 dan npm. Buat `.env` dari `.env.example` serta `frontend/.env` dari `frontend/.env.example`. Gunakan `JWT_SECRET` yang sama untuk kedua API dan URL frontend tanpa `/api`.

Dari root, jalankan infrastruktur dan setup:

```sh
docker compose up -d --wait mysql rabbitmq
npm --prefix employee-api ci
npm --prefix attendance-api ci
npm --prefix frontend ci
npm --prefix employee-api run migration:run
npm --prefix employee-api run migration:audit
npm --prefix attendance-api run migration:run
npm --prefix employee-api run seed
```

Jalankan tiap perintah berikut di terminal terpisah:

```sh
npm --prefix employee-api run start:dev
```

```sh
npm --prefix attendance-api run start:dev
```

```sh
npm --prefix frontend run dev -- --port 5173 --strictPort
```

Hentikan container aplikasi lebih dulu jika portnya masih dipakai. Catatan database ada di [infra/mysql](infra/mysql/README.md).

## Build dan cek

```sh
npm --prefix employee-api run build
npm --prefix attendance-api run build
npm --prefix frontend run build
npm --prefix frontend run lint
npm --prefix employee-api run smoke:rabbitmq
```

Perintah npm di atas memakai dependency dan env dari setup development. Lint backend: jalankan `npx --no-install oxlint --type-aware src/` dari masing-masing folder API.
