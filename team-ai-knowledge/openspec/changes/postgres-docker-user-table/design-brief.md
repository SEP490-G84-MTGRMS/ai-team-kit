# Design Brief: postgres-docker-user-table

## 1. Mục Tiêu Thiết Kế
Thiết kế hạ tầng cơ sở dữ liệu vật lý PostgreSQL 16 trên Docker và cấu trúc bảng `users` tối giản theo chỉ đạo:
- Khóa chính `Id` là chuỗi `string Uid`.
- Chỉ lưu đúng 3 thông tin cốt lõi: `Id`, `Username`, `Password`.
- Sẵn sàng nạp Seed User để thử nghiệm ngay Endpoint đăng nhập `/api/auth/login`.

## 2. Thiết Kế Hạ Tầng Docker Compose
Tệp `docker-compose.yml` đặt tại thư mục gốc backend `MT_GRMS_BACKEND`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: mtgrms-postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: mtgrms_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: mtgrms_secret_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d mtgrms_db"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
    driver: local
```

## 3. Thiết Kế Bảng Cơ Sở Dữ Liệu (`users`)

### 3.1. Lược đồ bảng (Table Schema)
| Cột | Kiểu PostgreSQL | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| **`id`** | `VARCHAR(64)` | PRIMARY KEY | Chuỗi Uid (ví dụ: `usr_admin_01` hoặc NanoId/Guid string) |
| **`username`** | `VARCHAR(100)` | NOT NULL, UNIQUE | Tên đăng nhập của người dùng |
| **`password`** | `VARCHAR(255)` | NOT NULL | Mật khẩu tài khoản (lưu dạng Hash / Secret) |

### 3.2. Chỉ mục (Indexes)
- `pk_users`: Primary Key trên cột `id`.
- `ix_users_username`: Unique Index trên cột `username` nhằm tối ưu tốc độ tìm kiếm `O(1)` khi đăng nhập.

## 4. Dữ Liệu Khởi Tạo Mẫu (Seed Data)
Ngay sau khi Migration được áp dụng (Apply), hệ thống khởi tạo sẵn 1 tài khoản quản trị mẫu:
- **`id`**: `usr_super_admin_01`
- **`username`**: `admin`
- **`password`**: `Admin@123` (hoặc chuỗi hash tương đương)

## 5. Tương Thích Luồng Đăng Nhập (Auth Flow)
- Client gửi `POST /api/auth/login`: `{ "usernameOrEmail": "admin", "password": "Admin@123" }`
- Service truy vấn `SELECT id, username, password FROM users WHERE username = @username LIMIT 1`
- So khớp mật khẩu -> Sinh JWT Access Token -> Trả về `UserInfo(Id: user.Id, Username: user.Username)`.
