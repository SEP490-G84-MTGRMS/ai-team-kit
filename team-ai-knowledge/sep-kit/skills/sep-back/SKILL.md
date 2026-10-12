---
name: sep-back
description: Quay lại bước trước (Rollback) trong quy trình SEP khi cần chỉnh sửa lại đặc tả, thiết kế hoặc task. Dùng khi user gõ /sep-back [tên-bước].
disable-model-invocation: true
---

# /sep-back — Quay Lại Bước Trước Trong Quy Trình SEP

Lệnh `/sep-back` cho phép bạn lùi lại một hoặc nhiều bước trong quy trình SEP mà **không làm mất bất kỳ file artifact hay code nào đã làm**.

---

## 🧭 Cách Sử Dụng

- **Lùi 1 bước liền kề**:
  ```bash
  /sep-back
  ```
  Ví dụ: Đang ở `verify-spec` ➔ Lùi về `brainstorm`; đang ở `apply` ➔ Lùi về `verify-spec`.

- **Lùi về bước cụ thể**:
  ```bash
  /sep-back <tên-bước>
  ```
  Các bước hợp lệ: `spec`, `brainstorm`, `verify-spec`, `apply`, `test`.
  Ví dụ: Đang ở `apply`, muốn sửa lại thiết kế gốc ➔ `/sep-back brainstorm`.

---

## ⚙️ Cơ Chế Xử Lý Của Hệ Thống

1. Gọi tool MCP `sep_lui_buoc({ tenChange, buocMoi, lyDo })`.
2. **Bảo toàn dữ liệu**: Toàn bộ file artifact cũ (`proposal.md`, `specs.md`, `tasks.md`...) **được giữ nguyên 100%**. Bạn chỉ cần mở ra chỉnh sửa phần cần đổi thay vì phải viết lại từ đầu.
3. **Mở lại cổng duyệt (Reset Gate)**: Trạng thái duyệt `Approve` của bước được lùi về sẽ được reset để bạn duyệt lại sau khi đã sửa xong.
4. Ghi nhận nhật ký lùi bước và lý do vào `.session.md`.
5. Tiếp tục luồng làm việc bằng lệnh `/sep-pilot` hoặc lệnh của bước tương ứng.
