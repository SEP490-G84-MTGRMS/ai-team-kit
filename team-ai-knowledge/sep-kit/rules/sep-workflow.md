---
description: Quy trình SEP 6 bước (/sep-spec → /sep-archive) + Ma trận phân loại Tạo Change mới vs Cập nhật Change cũ (/sep-refactor, /sep-back).
apply: always
---

# Quy trình SEP — bắt buộc

## Pipeline 6 bước (chức năng / bug-fix / refactor code cần change)

| # | Lệnh | Kết quả bắt buộc |
|---|---|---|
| 1 | `/sep-spec <mô tả>` | chọn schema (`feature` / `bug-fix` / `refactor`), kiểm tra trùng capability đang mở, **tạo change**, `proposal.md` |
| 2 | `/sep-brainstorm` | `exploration.md`, `design-brief.md` (chỉ `feature`), `specs.md` dạng delta (kế thừa từ `openspec/specs/<capability>/spec.md`) |
| 3 | `/sep-verify-spec` | review đa persona (`review/skeptic.md` bắt buộc), `tasks.md` |
| 4 | `/sep-apply` | code + tick hết `tasks.md` |
| 5 | `/sep-test` | `test-report.md` với `verdict: PASS` |
| 6 | `/sep-archive` | merge delta `specs.md` vào Spec gốc `openspec/specs/<capability>/spec.md` + chuyển folder sang `openspec/archive/<ten>-archived-YYYY-MM-DD/` |

`/sep-status` xem tiến độ các change đang mở và chọn change đang làm (📌).
`/sep-back` quay lại bước trước (rollback) an toàn khi cần sửa lại thiết kế/spec/task lớn mà không mất file.
`/sep-refactor <mô tả>` cập nhật Delta `specs.md` (+ `tasks.md` nếu cần) ngay trên một **change đang mở**.

## Ma trận phân loại cứng: Khi nào Tạo Change mới vs Cập nhật Change cũ?

| Tình huống thực tế | Hành động chuẩn duy nhất |
|---|---|
| **1. Làm tính năng mới** (capability đó **chưa** có change nào đang mở) | Đề nghị `/sep-spec <mô tả>` (`schema: feature`). |
| **2. Thêm task con / sửa lỗi / đổi requirement thuộc một Change ĐANG MỞ (`status != archived`)** | **CẤM tạo change mới**. Chọn change đó (`sep_chon_change`):<br>• Sửa nhỏ / thêm REQ / thêm task: dùng `/sep-refactor` (tự bảo toàn Delta + mở lại cổng `apply`/`test`), rồi chạy tiếp `/sep-apply` → `/sep-test`.<br>• Đổi kiến trúc / thiết kế cốt lõi: dùng `/sep-back brainstorm` (hoặc `/sep-back verify-spec`). |
| **3. Phân hệ có Change cũ ĐÃ `archived`, nay cần Bug-fix hoặc Nâng cấp đợt mới** | Đề nghị `/sep-spec <mô tả>` tạo change mới (`schema: bug-fix` hoặc `feature`; việc nhỏ có thể chọn `mode: "fast"` rút còn 2 cổng duyệt chính ở `verify-spec` và `test`), đọc `openspec/specs/<capability>/spec.md` làm nền. |
| **4. Chỉnh sửa cực nhỏ (typo UI, đổi chữ/nhãn tĩnh, format)** | Sửa trực tiếp ở chat thường, **không** cần mở change SEP. |

## Luật tạo & bảo vệ change (cứng)

- **Chỉ** khi user gõ `/sep-spec` mới được gọi MCP `sep_tao_change`. Chat thường, `/sep-brainstorm`, `/sep-apply`, `/sep-refactor` **cấm** gọi `sep_tao_change`.
- Nếu `sep_tao_change` báo capability đang có change mở → **dừng lại**, hỏi user gộp vào change đang mở hay xác nhận tách riêng (`taoChangeMoiKhiTrung: true`).
- Sau `/sep-refactor` trên change đang mở: **cấm code chui ngoài pipeline** — phải cập nhật `tasks.md` và đi qua `/sep-apply` → `/sep-test`.
- Chỉ ghi file trong `openspec/` bằng tool MCP `sep_*` của server `"sep"`. Không tạo/sửa tay, không sửa `.status`.
- Không bỏ qua bước pipeline. Tool trả lỗi ⛔ → dừng, báo user bước còn thiếu và lệnh cần chạy.
- **Gate duyệt**: kết thúc mỗi bước cần duyệt và trước khi cập nhật `/sep-refactor`, tóm tắt và hỏi user **Approve / Reject**. Chỉ gọi `sep_duyet_buoc` / `sep_cap_nhat_capability` sau khi user trả lời rõ — không bao giờ tự duyệt.
- Không thấy tool `sep_*` → bảo user chạy `npm run sep -- install` trong `team-ai-knowledge` rồi khởi động lại IDE.
- Tool báo "chưa push" → nhắc `git push` trong `team-ai-knowledge` để TeamSpec thấy tiến độ.
