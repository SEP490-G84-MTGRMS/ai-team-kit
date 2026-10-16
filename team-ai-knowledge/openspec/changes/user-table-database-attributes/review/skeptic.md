# Skeptic Review: user-table-database-attributes

| Chiều | Điểm (1–5) | Nhận xét |
|---|---|---|
| **D1 Completeness** | 5/5 | Đầy đủ 4 REQ bao phủ toàn bộ các màn hình Ortus đã làm (Auth, Master Admin, Tenant Detail, Lock Control, Audit Trail). Có đủ Scenario chính và Edge cases. |
| **D2 Correctness** | 5/5 | Bảng mã màu, kiểu dữ liệu (UUID, DATETIME2 UTC, BIT, NVARCHAR), ràng buộc Unique Index cho Email/Phone/Subdomain chính xác. |
| **D3 Coherence** | 5/5 | Nhất quán hoàn toàn giữa Proposal, Exploration, Design Brief và Specs. Không có mâu thuẫn thuật ngữ. |
| **D4 Constraints** | 5/5 | Tôn trọng các quy tắc cốt lõi: GB-07 (Audit bất biến), GB-08 (1 MST/Tenant), GB-09 (Subdomain RFC-1123 & Email duy nhất), GB-13 (Ân hạn & Soft-Lock tự động), POST-2 (Thu hồi JWT Token tức thì). |
| **D5 Blast Radius** | 5/5 | Các thay đổi trên `Users`, `Tenants`, `TenantUsers` đều là dạng bổ sung cột (Additive Changes) có giá trị Default hoặc Nullable, không gây breaking change cho các bảng nghiệp vụ kho, bán hàng hay nhân sự đã ổn định. |

## Vấn đề đã soi & Cách xử lý
- **[MEDIUM] REQ-01**: Cần đảm bảo Middleware Backend chặn mọi request nghiệp vụ nếu `MustChangePassword == true`, chỉ cho phép gọi duy nhất endpoint `POST /api/v1/auth/change-password`.
  $\rightarrow$ *Đã xử lý*: Quy định rõ trong Scenario của REQ-01.
- **[MEDIUM] REQ-03**: Khi Super Admin Hard-Lock một Tenant, việc cập nhật `SecurityStamp` cần được kiểm tra tức thì tại JWT Authentication Handler để vô hiệu hóa token mà không cần chờ AccessToken hết hạn 30 phút.
  $\rightarrow$ *Đã xử lý*: Sử dụng `SecurityStampValidator` hoặc so khớp claim `SecurityStamp` trong TokenValidationParameters.
- **[LOW] REQ-04**: Bảng `AuditLogs` cần đánh Index trên `(TenantID, CreatedAt)` và `(ActorID, CreatedAt)` để tối ưu tốc độ phân trang trên màn hình `audit_logs.html`.
  $\rightarrow$ *Đã xử lý*: Sẽ đưa vào cấu hình Fluent API trong `tasks.md`.

## Kết luận: Chấp nhận
Specs đã sẵn sàng để lập `tasks.md` và tiến hành cập nhật tài liệu CSDL cũng như mã nguồn Backend.
