---
description: Quy trình SEP 6 bước (/sep-spec → /sep-archive) + /sep-refactor cập nhật specs.md của change. Chỉ /sep-spec được tạo change.
apply: always
---

# Quy trình SEP — bắt buộc

## Pipeline 6 bước (chức năng / bug-fix / refactor code cần change)

| # | Lệnh | Kết quả bắt buộc |
|---|---|---|
| 1 | `/sep-spec <mô tả>` | chọn schema (feature / bug-fix / refactor), **tạo change**, `proposal.md` |
| 2 | `/sep-brainstorm` | `exploration.md`, `design-brief.md` (chỉ feature), `specs.md` dạng delta |
| 3 | `/sep-verify-spec` | review persona (`review/skeptic.md` bắt buộc), `tasks.md` |
| 4 | `/sep-apply` | code + tick hết `tasks.md` |
| 5 | `/sep-test` | `test-report.md` với `verdict: PASS` |
| 6 | `/sep-archive` | archive (đổi `.status` = archived, đổi tên folder `-archived-YYYY-MM-DD` và chuyển vào `openspec/archive/`) |

`/sep-status` xem tiến độ và chọn change đang làm.
`/sep-back` quay lại bước trước (rollback) an toàn khi cần sửa lại spec/task mà không mất file.

## Cập nhật specs của change (không tạo change mới)

| Lệnh | Việc |
|---|---|
| `/sep-refactor <mô tả>` | Tìm **đúng change** trong `openspec/changes/`, confirm user, merge delta vào `specs.md` của change. **Không** gọi `sep_tao_change`, **không** ghi `openspec/specs/`. |

## Luật tạo change (cứng)

- **Chỉ** khi user gõ `/sep-spec` mới được gọi MCP `sep_tao_change`.
- Chat thường, `/sep-brainstorm`, `/sep-apply`, `/sep-refactor`, … **cấm** tạo change.
- User yêu cầu chức năng mới mà chưa có change → **đề nghị** `/sep-spec`, dừng chờ (không tự tạo).
- User muốn sửa requirement trên một **change đang mở** → đề nghị `/sep-refactor` (không `/sep-spec` trừ khi cần change mới).
- Chỉnh sửa rất nhỏ (typo UI, đổi text) → không cần SEP.

## Luật khác

- Chỉ ghi file trong `openspec/` bằng tool MCP `sep_*` của server "sep". Không tạo/sửa tay, không sửa `.status`.
- Không bỏ qua bước pipeline. Tool trả lỗi ⛔ → dừng, báo user bước còn thiếu và lệnh cần chạy.
- **Gate duyệt**: kết thúc mỗi bước (1–5) và trước merge `/sep-refactor`, tóm tắt và hỏi user Approve / Reject. Chỉ gọi `sep_duyet_buoc` / `sep_cap_nhat_capability` sau khi user trả lời rõ — không bao giờ tự duyệt.
- Bỏ trống tên change = change đang làm (📌). Đổi change: `sep_chon_change`.
- `sep_tao_change` bắt buộc `capability` (đã có trong `openspec/specs/` trừ khi `taoCapabilityMoi: true`).
- Không thấy tool `sep_*` → bảo user chạy `npm run sep -- install` trong `team-ai-knowledge` rồi khởi động lại IDE.
- Tool báo "chưa push" → nhắc `git push` trong `team-ai-knowledge` để TeamSpec thấy tiến độ.
