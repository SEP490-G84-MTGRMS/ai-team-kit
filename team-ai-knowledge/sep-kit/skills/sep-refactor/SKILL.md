---
name: sep-refactor
description: Tìm đúng OpenSpec change trong openspec/changes/ rồi merge delta vào specs.md của change đó. KHÔNG ghi openspec/specs/, KHÔNG tạo change mới. Dùng khi user gõ /sep-refactor kèm mô tả (VD "/sep-refactor bỏ Lead Time trên change delivery").
disable-model-invocation: true
---

# /sep-refactor — Tìm change và cập nhật specs.md của change

Dùng khi cần **sửa/bỏ/đổi requirement** trên một **change đang mở** (chưa archive) trong `openspec/changes/`.
**Không** tạo change mới (`sep_tao_change` chỉ qua `/sep-spec`).
**Không** ghi `openspec/specs/`.

## Luật
- **Bắt buộc tìm đúng change** trước khi viết delta: `sep_tim_capability` (tool này tìm **change**, không tìm spec gốc).
- Chưa có bằng chứng khớp + user xác nhận → **cấm** `sep_cap_nhat_capability`.
- 0 match → dừng; gợi ý từ khóa khác hoặc `/sep-spec` nếu cần change mới.
- Nhiều match → liệt kê ranked, **bắt user chọn 1** change (và REQ nếu cần).
- Change đã `archived` → không sửa được; đề nghị `/sep-spec` change mới nếu cần.
- Chỉ ghi qua MCP `sep_*`. Không sửa tay.
- Gate Approve/Reject với user trước khi merge.
- Trả lời tiếng Việt; thuật ngữ kỹ thuật giữ tiếng Anh.

## Các bước (thứ tự bắt buộc)

1. Không có mô tả sau lệnh → hỏi "Bạn muốn sửa change / requirement nào?" rồi dừng.
2. Gọi `sep_tim_capability` với `query` = mô tả user (**không bỏ qua**) — kết quả là danh sách **change**.
3. Nếu 0 kết quả → dừng theo luật trên.
4. Nếu >1 ứng viên → trình bảng (tên change, status, capability, score, REQ khớp); chờ user chốt **một** change.
5. Nếu đúng 1 ứng viên nổi bật → vẫn nêu path `openspec/changes/<name>/specs.md` và hỏi xác nhận.
6. Gọi `sep_tim_requirement({ tenChange, query })` để khoanh đúng block requirement (trừ khi user đã chỉ rõ REQ).
7. Hiện bằng chứng:
   - Path `openspec/changes/<change>/specs.md`
   - Danh sách REQ sẽ MODIFIED/REMOVED/ADDED
   - Trích ngắn snippet
8. Hỏi: "Đúng change X + REQ … chứ?" — Reject chỗ sửa → tìm lại; Approve chỗ sửa → soạn delta.
9. Soạn delta markdown:

```markdown
## MODIFIED Requirements
### Requirement: <tên đúng như trong specs.md của change>
...

## REMOVED Requirements
### Requirement: <tên>

## ADDED Requirements
### Requirement: <tên mới>
...
```

10. Tóm tắt delta (3–5 dòng) → hỏi Approve / Reject nội dung.
11. User Approve → `sep_cap_nhat_capability({ tenChange, delta, tomTat, reqsDaChot })`.
12. Báo đã cập nhật path change; code theo specs change ở chat thường. Cần pipeline 6 bước mới → `/sep-spec`.

## Không làm
- Không gọi `sep_tao_change`.
- Không merge vào `openspec/specs/`.
- Không đoán change khi tool không khớp.
- Không merge khi user chưa Confirm chỗ sửa và Approve delta.
