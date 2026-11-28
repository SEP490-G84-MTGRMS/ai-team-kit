# Skeptic Review: hr-rbac-rls

| Chiều | Điểm (1–5) | Nhận xét |
|---|:---:|---|
| **D1 Completeness** | 5/5 | Đã bao phủ 5 REQ với đầy đủ kịch bản Gherkin cho cả happy path và edge cases (IDOR, truy cập chéo, sai quyền). |
| **D2 Correctness** | 5/5 | Quy định phân quyền bám sát tài liệu `Matrix_PhanQuyen_NhanVien.md`, phân định rõ ràng giữa `STORE_OWNER` và `EMPLOYEE`/`STAFF`. |
| **D3 Coherence** | 5/5 | Nhất quán hoàn toàn giữa `proposal.md`, `exploration.md`, `design-brief.md` và `specs.md`. |
| **D4 Constraints** | 5/5 | Bảo mật đa tầng (RBAC ở tầng API + RLS ở tầng truy vấn dữ liệu), tôn trọng kiến trúc Clean Architecture. |
| **D5 Blast Radius** | 4/5 | Các test case cũ trong `MT_GRMS.UnitTests` gọi trực tiếp Controller cần đảm bảo mock `ClaimsPrincipal` có Role tương ứng để không bị chặn giả lập. |

## Vấn đề
- [MEDIUM] D5 Blast Radius: Khi gắn `[Authorize(Roles = "...")]` lên Controller, các Unit Test cũ nếu new Controller trực tiếp không qua pipeline ASP.NET Core sẽ không bị ảnh hưởng, nhưng các Integration Test có thể gặp lỗi 401/403 nếu chưa set bearer token.
  $\rightarrow$ **Đề xuất:** Viết thêm Helper để cấp mock claims trong Unit/Integration Test cho cả 2 kịch bản Store Owner và Employee.
- [LOW] D2 Correctness: Nhắc nhở kiểm tra cả 2 giá trị role `EMPLOYEE` và `STAFF` vì database hiện tại lưu trữ `STAFF` cho nhân viên cửa hàng.
  $\rightarrow$ **Đề xuất:** Cấu hình thuộc tính Authorize luôn dùng chuỗi `Roles = "STORE_OWNER,ADMIN,EMPLOYEE,STAFF"`.

## Kết luận: Chấp nhận
Đặc tả kỹ thuật đã đầy đủ, rõ ràng và an toàn để chuyển sang lập kế hoạch Tasks và thực thi.
