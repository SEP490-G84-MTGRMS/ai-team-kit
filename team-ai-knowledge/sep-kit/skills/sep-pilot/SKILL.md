---
name: sep-pilot
description: Điều phối thông minh quy trình SEP (Auto-Pilot) — tự động nhận diện tiến độ, dắt AI thực hiện bước kế tiếp và phỏng vấn tương tác (chế độ grill-me) trước khi chuyển bước. Dùng khi user gõ /sep-pilot [mô tả hoặc yêu cầu].
disable-model-invocation: true
---

# /sep-pilot — Điều Phối Thông Minh Quy Trình SEP (Auto-Pilot & Grill-Me Mode)

Quy trình SEP chuẩn 6 bước: `spec` → `brainstorm` → `verify-spec` → `apply` → `test` → `archive`.
Lệnh `/sep-pilot` giúp bạn thực hiện đúng 100% quy trình mà **không cần phải nhớ từng lệnh lẻ**.

---

## 🧭 Nguyên Tắc Vận Hành Của /sep-pilot

1. **Tự động nhận diện (Context-Aware)**:
   - Gọi `sep_xem_change` để kiểm tra change đang làm.
   - Nếu **chưa có change**: Hỏi user mục tiêu, đề xuất schema (`feature` | `bug-fix` | `refactor`), rồi gọi `sep_tao_change`.
   - Nếu **đã có change**: Tự động xác định bước hiện tại và tiến hành công việc của bước tiếp theo.

2. **Chế độ Phỏng Vấn Tương Tác (Grill-Me Style)**:
   - **Tại Brainstorm**: KHÔNG tự tiện chốt giải pháp; chủ động phỏng vấn user (2 phương án A vs B, cấu trúc API, quan hệ DB).
   - **Tại Verify-Spec**: Đóng vai persona phản biện (Skeptic) để hỏi user về rủi ro, phân quyền và edge cases trước khi chốt tasks.
   - **Tại Cổng Duyệt (Gate)**: Cuối mỗi bước, tóm tắt kết quả và đưa ra câu hỏi duyệt rõ ràng (`Approve` / `Cần sửa` / `Quay lại`). CHỈ gọi `sep_duyet_buoc` khi user đã xác nhận.

3. **Tự động Đồng Bộ & Đẩy Code (Checkpoints)**:
   - Khi duyệt `verify-spec` (Chốt 1): Tự động push spec lên GitHub.
   - Khi duyệt `apply`: Tự động kích hoạt `db-sync` quét C# Entity Backend và cập nhật Database Schema.
   - Khi nghiệm thu `archived` (Chốt 2): Tự động push archive và merge spec gốc.

4. **Lùi bước linh hoạt**:
   - Nếu ở bất kỳ bước nào user muốn đổi ý hoặc sửa lại phương án: Đề xuất gọi `/sep-back` để lùi lại bước trước an toàn.

---

## 📋 Vòng Lặp Điều Phối Từng Bước

### Bước 1: Khởi Tạo Spec (`/sep-spec`)
- Nếu chưa có change hoặc `proposal.md` chưa hoàn thiện:
  - Phỏng vấn user 3 câu hỏi cốt lõi: Vấn đề cần giải quyết, Phạm vi (In/Out-of-scope), Tiêu chí thành công.
  - Lưu `proposal.md` bằng `sep_luu_artifact`.
  - Hỏi user duyệt: *"Bạn có đồng ý chốt proposal này để chuyển sang Brainstorm không?"*
  - User Approve ➔ Gọi `sep_duyet_buoc({ buoc: 'spec', quyetDinh: 'approve', tomTat: '...' })`.

### Bước 2: Khảo Sát & Thiết Kế (`/sep-brainstorm`)
- Đọc `xem_thiet_ke` để nắm Database & Kiến trúc hiện tại.
- Phỏng vấn user (Grill-me):
  - Phương án kỹ thuật (Ví dụ: Server-side paging vs Client-side; EF Core query vs DTO mapping).
  - Cần thêm/sửa bảng hay cột nào trong C# Entity?
- Soạn thảo và lưu qua `sep_luu_artifact`:
  - `exploration.md`: Hiện trạng, giả định, ≥2 phương án, rủi ro.
  - `design-brief.md`: Luồng UI/API, endpoint, phân quyền.
  - `specs.md` (định dạng delta ADDED/MODIFIED/REMOVED).
- Hỏi user duyệt Approve Brainstorm ➔ Gọi `sep_duyet_buoc`.

### Bước 3: Phản Biện & Lập Kế Hoạch (`/sep-verify-spec`)
- Đọc persona qua `sep_xem_persona({ ten: 'skeptic' })`.
- Đặt câu hỏi phản biện: Trường hợp mất mạng, dữ liệu trùng lặp, multi-tenant partition key (`TenantId`).
- Lưu `review/skeptic.md` và `tasks.md` (checklist `- [ ] T1...`).
- Hỏi user duyệt Approve Verify-Spec ➔ Gọi `sep_duyet_buoc` (Tự động kích hoạt Chốt 1 Push Git).

### Bước 4: Thực Thi Code (`/sep-apply`)
- Chuyển trạng thái: `sep_chuyen_trang_thai({ trangThai: 'apply' })`.
- Hướng dẫn dev code theo từng task trong `tasks.md`.
- Mỗi task xong: Cập nhật `tasks.md` tick `[x]` bằng `sep_luu_artifact`.
- Khi tick hết task: Hỏi user duyệt hoàn thành code.
  - Khi duyệt `approve`: Hệ thống tự động kích hoạt `db-sync` quét C# Entity Backend cập nhật tài liệu thiết kế!

### Bước 5: Kiểm Thử (`/sep-test`)
- Hướng dẫn chạy test (`dotnet test` ở Backend, `npm test` / `npm run build` ở Frontend).
- Lưu `test-report.md` với `verdict: PASS`.
- Hỏi user duyệt Approve Test ➔ Gọi `sep_duyet_buoc`.

### Bước 6: Nghiệm Thu & Đóng Change (`/sep-archive`)
- Gọi `sep_chuyen_trang_thai({ trangThai: 'archived' })`.
- Hệ thống tự động merge delta specs vào `openspec/specs/` và kích hoạt Chốt 2 Push Git.
- Đề xuất user lưu bài học (Lesson) nếu có bug mới được khắc phục.
