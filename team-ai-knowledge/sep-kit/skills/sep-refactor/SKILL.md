---
name: sep-refactor
description: Cập nhật spec gốc openspec/specs/<capability>/ — tìm đúng capability + requirement rồi merge delta. KHÔNG tạo OpenSpec change. Dùng khi user gõ /sep-refactor kèm mô tả cần sửa (VD "/sep-refactor bỏ Lead Time khỏi cấu hình giao hàng NCC").
disable-model-invocation: true
---

# /sep-refactor — Tìm đúng spec gốc và cập nhật

Dùng khi cần **sửa/bỏ/đổi requirement** trên capability đã có trong `openspec/specs/`.
**Không** tạo `openspec/changes/`. Chỉ `/sep-spec` mới được gọi `sep_tao_change`.

## Luật
- **Bắt buộc tìm đúng chỗ sửa** trước khi viết delta: capability + `### Requirement: …`.
- Chưa có bằng chứng khớp + user xác nhận → **cấm** `sep_cap_nhat_capability`.
- 0 match → dừng; gợi ý từ khóa khác hoặc `/sep-spec` nếu capability chưa tồn tại.
- Nhiều match → liệt kê ranked, **bắt user chọn 1** capability (và REQ nếu cần).
- Chỉ ghi `openspec/specs/` qua MCP `sep_*`. Không sửa tay.
- Gate Approve/Reject với user trước khi merge.
- Trả lời tiếng Việt; thuật ngữ kỹ thuật giữ tiếng Anh.

## Các bước (thứ tự bắt buộc)

1. Không có mô tả sau lệnh → hỏi "Bạn muốn sửa gì trên spec gốc?" rồi dừng.
2. Gọi `sep_tim_capability` với `query` = mô tả user (**không bỏ qua**).
3. Nếu 0 kết quả → dừng theo luật trên.
4. Nếu >1 ứng viên → trình bảng (capability, score, REQ khớp, snippet); chờ user chốt **một** capability.
5. Nếu đúng 1 ứng viên nổi bật → vẫn nêu path + REQ khớp và hỏi xác nhận.
6. Gọi `sep_tim_requirement({ capability, query })` để khoanh đúng block requirement (trừ khi user đã chỉ rõ REQ id/tên).
7. Hiện bằng chứng:
   - Path `openspec/specs/<capability>/spec.md`
   - Danh sách REQ sẽ MODIFIED/REMOVED/ADDED
   - Trích ngắn snippet
8. Hỏi: "Đúng capability X + REQ … chứ?" — **Reject chỗ sửa** → tìm lại / hỏi thêm; **Approve chỗ sửa** → sang bước soạn delta.
9. Soạn delta markdown:

```markdown
## MODIFIED Requirements
### Requirement: <tên đúng như trong spec gốc>
...

## REMOVED Requirements
### Requirement: <tên>

## ADDED Requirements
### Requirement: <tên mới>
...
```

10. Tóm tắt delta (3–5 dòng) → hỏi Approve / Reject nội dung.
11. User Approve → `sep_cap_nhat_capability({ capability, delta, tomTat, reqsDaChot })`.
12. Báo đã cập nhật path; code theo spec mới ở chat thường (không tự tạo change). Cần change full 6 bước → đề nghị `/sep-spec`.

## Không làm
- Không gọi `sep_tao_change`.
- Không đoán capability khi tool không khớp.
- Không merge khi user chưa Confirm chỗ sửa và Approve delta.
