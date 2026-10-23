# MySQL lokal

MySQL 8.4 dipakai untuk `employee_db`, `attendance_db`, dan `audit_db`. Setup Docker lengkap menjalankan migration dan seed otomatis. Lihat [README utama](../../README.md).

Untuk menjalankan MySQL saja, dari root proyek:

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

Container aplikasi memakai `mysql:3306`. Port 3307 hanya untuk akses dari host. Ubah `MYSQL_PORT` di `.env` jika port host sudah dipakai.

`init.sql` dijalankan saat volume masih kosong. Nama database dan user juga tertulis di `compose.yaml`. Jika menggantinya, sesuaikan konfigurasi aplikasi dan SQL sebelum setup pertama.

Mengganti password di `.env` tidak mengubah password database yang sudah dibuat.

```sh
docker compose stop mysql
```

Data tetap ada di volume. `docker compose down -v` menghapus semua volume proyek, termasuk data MySQL.
