CREATE DATABASE IF NOT EXISTS employee_db
  CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
CREATE DATABASE IF NOT EXISTS attendance_db
  CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
CREATE DATABASE IF NOT EXISTS audit_db
  CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

GRANT ALL PRIVILEGES ON employee_db.* TO 'absensi_karyawan'@'%';
GRANT ALL PRIVILEGES ON attendance_db.* TO 'absensi_karyawan'@'%';
GRANT ALL PRIVILEGES ON audit_db.* TO 'absensi_karyawan'@'%';
