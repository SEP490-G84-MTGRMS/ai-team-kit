# Tasks: user-table-database-attributes

## Database Design & Data Dictionary
- [ ] T1 — Cập nhật sơ đồ Mermaid ERD trong `Database_Design_Data_Dictionary.md` bổ sung các trường mới cho `Tenants`, `Users`, `TenantUsers` và thực thể `AuditLogs` (REQ-01, REQ-02, REQ-03, REQ-04).
- [ ] T2 — Cập nhật bảng Từ điển Dữ liệu chi tiết (Phân hệ 1) trong `Database_Design_Data_Dictionary.md` với đầy đủ 20 cột của `Users`, 6 cột của `TenantUsers`, 17 cột của `Tenants` và 13 cột của `AuditLogs` (REQ-01, REQ-02, REQ-03, REQ-04).
- [ ] T3 — Cập nhật mã nguồn C# EF Core (mục 5.3) và Fluent API (mục 5.4) trong `Database_Design_Data_Dictionary.md` cho các thực thể `User`, `Tenant`, `TenantUser`, `AuditLog` (REQ-01, REQ-02, REQ-03, REQ-04).

## Backend Domain & Persistence
- [ ] T4 — Cập nhật thực thể C# `User.cs` trong `MT_GRMS_BACKEND/src/MT_GRMS.Domain/Entities/Identity/` với đầy đủ các thuộc tính an ninh, kiểm toán và phiên đăng nhập (REQ-01).
- [ ] T5 — Cập nhật cấu hình Fluent API `UserConfiguration.cs` trong `MT_GRMS_BACKEND/src/MT_GRMS.Infrastructure/Persistence/Configurations/` với chỉ mục Unique cho Email, Phone và cấu hình độ dài chuỗi (REQ-01).
- [ ] T6 — Tự động tạo file worklog trong `MT_GRMS_BACKEND/docs/worklogs/` và cập nhật `CHANGELOG.md` theo quy tắc bắt buộc của Git pre-commit hook (REQ-01).

## Verification & Tests
- [ ] T7 — Chạy kiểm thử Unit Tests và Integration Tests cho User Entity trong `MT_GRMS_BACKEND` bảo đảm build và test PASS 100% (REQ-01).
