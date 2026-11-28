---
name: sep-refactor
description: Tìm đúng OpenSpec change ĐANG MỞ trong openspec/changes/ rồi cập nhật Delta trực tiếp vào specs.md (+ nối task mới vào tasks.md nếu cần) mà vẫn giữ nguyên định dạng Delta & API/Checklist. Dùng khi user gõ /sep-refactor kèm mô tả.
disable-model-invocation: true
---

# /sep-refactor — Cập nhật Delta `specs.md` & `tasks.md` trên Change đang mở

Dùng khi cần **thêm/sửa/bỏ requirement hoặc bổ sung task con** trên một **change đang mở** (`status != archived`) trong `openspec/changes/` mà không làm đổi kiến trúc lớn (nếu đổi kiến trúc lớn, hãy dùng `/sep-back brainstorm`).
**Không** tạo change mới (`sep_tao_change` chỉ qua `/sep-spec`).
Spec gốc `openspec/specs/<capability>/spec.md` sẽ tự động được cập nhật khi change này chạy `/sep-archive`.

## Luật
- **Bắt buộc tìm đúng change đang mở** trước khi viết delta: `sep_tim_capability` (tool này tìm **change** trong `openspec/changes/`).
- Chưa có bằng chứng khớp + user xác nhận → **cấm** `sep_cap_nhat_capability`.
- 0 match → dừng; gợi ý từ khóa khác hoặc `/sep-spec` nếu thật sự cần mở change mới.
- Nhiều match → liệt kê ranked, **bắt user chọn 1** change (và REQ nếu cần).
- Change đã `archived` → không sửa được; đề nghị `/sep-spec` tạo change mới (VD `schema: "bug-fix"`, `mode: "fast"`) kế thừa từ `openspec/specs/<capability>/spec.md`.
- Chỉ ghi qua MCP `sep_*`. Không sửa tay, **cấm code chui ngoài pipeline**.
- Gate Approve/Reject với user trước khi cập nhật.
- Trả lời tiếng Việt; thuật ngữ kỹ thuật giữ tiếng Anh.

## Các bước (thứ tự bắt buộc)

1. Không có mô tả sau lệnh → hỏi "Bạn muốn cập nhật change / requirement nào?" rồi dừng.
2. Gọi `sep_tim_capability` với `query` = mô tả user (**không bỏ qua**) — kết quả là danh sách **change**.
3. Nếu 0 kết quả → dừng theo luật trên.
4. Nếu >1 ứng viên → trình bảng (tên change, status, capability, score, REQ khớp); chờ user chốt **một** change đang mở.
5. Nếu đúng 1 ứng viên nổi bật → vẫn nêu path `openspec/changes/<name>/specs.md` và hỏi xác nhận.
6. Gọi `sep_tim_requirement({ tenChange, query })` để khoanh đúng block requirement (trừ khi thêm mới hoàn toàn `ADDED` hoặc user đã chỉ rõ REQ).
7. Hiện bằng chứng:
   - Path `openspec/changes/<change>/specs.md` (status hiện tại của change)
   - Danh sách REQ sẽ `MODIFIED` / `REMOVED` / `ADDED`
   - Danh sách task cần nối thêm vào `tasks.md` (nếu change đã có `tasks.md` và thay đổi này cần viết/sửa code hoặc test)
8. Hỏi: "Đúng change X + REQ … chứ?" — Reject chỗ sửa → tìm lại; Approve chỗ sửa → soạn delta.
9. Soạn delta markdown chuẩn (tool sẽ tự bảo toàn `## API / Contract`, `## Acceptance checklist` và định dạng Delta của `specs.md`):

```markdown
## MODIFIED Requirements
### Requirement: <tên đúng như trong specs.md của change>
...

## REMOVED Requirements
### Requirement: <tên>

## ADDED Requirements
### Requirement: REQ-xx <tên mới>
...
```

10. Tóm tắt delta + `tasksBoSung` (3–5 dòng) → hỏi Approve / Reject nội dung.
11. User Approve → gọi `sep_cap_nhat_capability({ tenChange, delta, tomTat, reqsDaChot, tasksBoSung })`.
12. **Đi tiếp đúng pipeline của change đó** (không code tự do ngoài pipeline):
    - Nếu change đang ở `brainstorm` → chạy tiếp `/sep-verify-spec`.
    - Nếu change đang ở `verify-spec` / `apply` / `test` → chạy `/sep-apply` (hoàn tất và tick các task mới) rồi `/sep-test` để nghiệm thu lại trước khi `/sep-archive`.

## Không làm
- Không gọi `sep_tao_change`.
- Không tự code bỏ qua `tasks.md` và `/sep-test`.
- Không đoán change khi tool không khớp.
- Không cập nhật khi user chưa Confirm chỗ sửa và Approve delta.
