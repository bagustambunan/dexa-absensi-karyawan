# MySQL lokal

Satu server MySQL 8.4 untuk `employee_db`, `attendance_db`, dan `audit_db`.

Dari root:

```sh
docker compose up -d --wait mysql
docker compose ps mysql
```

Koneksi default dari host:

```text
Host: 127.0.0.1
Port: 3307
User: absensi_karyawan
Password: absensi_karyawan_local
```

Konfig ada di `.env`. Kalau port 3307 sudah dipakai, ubah `MYSQL_PORT`.

`init.sql` dijalankan saat volume masih kosong. Nama database dan user juga tertulis di `init.sql` dan `compose.yaml`. Kalau menggantinya di `.env`, sesuaikan kedua file itu sebelum setup pertama.

Mengganti password di `.env` tidak mengubah password database yang sudah dibuat.

Data disimpan di volume Docker. Untuk menghentikan MySQL tanpa menghapus data:

```sh
docker compose stop mysql
```

`docker compose down -v` menghapus volume dan datanya.

Migrasi, seed, dan cara menjalankan aplikasi ada di [README utama](../../README.md).
