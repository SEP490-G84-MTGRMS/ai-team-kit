---
name: sep-archive
description: "Bước 6/6 quy trình SEP — đóng (archive) một OpenSpec change đã test PASS và được duyệt: tự động merge delta specs.md vào Spec gốc openspec/specs/<capability>/spec.md, đổi .status = archived và chuyển folder sang openspec/archive/<ten>-archived-YYYY-MM-DD/. Dùng khi user gõ /sep-archive."
disable-model-invocation: true
---

# /sep-archive — Bước 6/6: Đóng change & Merge Spec gốc

Quy trình SEP: spec → brainstorm → verify-spec → apply → test → **archive**.
Tên change = phần chữ user gõ sau `/sep-archive`; bỏ trống = change đang làm (📌).

## Luật chung SEP
- Chỉ ghi file trong `openspec/` bằng tool MCP `sep_*` — không tạo/sửa tay.
- Không bỏ qua bước. Tool trả lỗi ⛔ → dừng, báo user lệnh cần chạy trước.
- Không thấy tool `sep_*` → bảo user chạy `npm run sep -- install` rồi khởi động lại IDE.
- Trả lời tiếng Việt; thuật ngữ kỹ thuật giữ tiếng Anh.

## Các bước
1. Gọi `sep_xem_change`. Test chưa PASS hoặc chưa duyệt → dừng, bảo user hoàn tất `/sep-test`.
2. Tóm tắt change cho user: chức năng, file code chính đã đổi, kết quả test.
   Báo rõ: archive sẽ:
   - Tự động merge phần Delta (`ADDED`/`MODIFIED`/`REMOVED`) trong `specs.md` vào **Spec gốc** `openspec/specs/<capability>/spec.md` (làm nền cho các đợt nâng cấp/bug-fix sau này).
   - Đổi trạng thái `.status = archived` và dời thư mục sang `openspec/archive/<ten>-archived-YYYY-MM-DD/` để giữ `openspec/changes/` luôn gọn sạch.
   Hỏi xác nhận đóng change.
3. Gọi `sep_chuyen_trang_thai` với `trangThai: "archived"`.
4. Đề xuất lưu tri thức cho team (hỏi user trước khi lưu):
   - Đọc `improvements.md` của change (đề xuất cải tiến ghi qua các lần duyệt).
   - Bug/khó khăn đáng nhớ → `luu_bai_hoc`. Quyết định kiến trúc → đề xuất ADR.
   - Phiên làm việc → `luu_phien_lam_viec`.
5. Tool báo "chưa push" → nhắc `git push` trong thư mục `team-ai-knowledge` để TeamSpec cập nhật.

## Kết thúc
"🎉 Change đã hoàn tất 6/6 bước, đã merge vào `openspec/specs/<capability>/spec.md` và chuyển vào `openspec/archive/`."
