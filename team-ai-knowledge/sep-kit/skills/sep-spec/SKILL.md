---
name: sep-spec
description: Bước 1/6 quy trình SEP — chọn schema (feature/bug-fix/refactor), tạo OpenSpec change mới và viết proposal.md qua MCP server "sep". Dùng khi user gõ /sep-spec kèm mô tả chức năng (VD "/sep-spec tôi muốn thực hiện chức năng quản lý nhà cung cấp").
disable-model-invocation: true
---

# /sep-spec — Bước 1/6: Route + Khởi tạo change + Proposal

Quy trình SEP: **spec** → brainstorm → verify-spec → apply → test → archive.
Mô tả chức năng = phần chữ user gõ sau `/sep-spec`.

## Luật chung SEP
- Chỉ ghi file trong `openspec/changes/` bằng tool MCP `sep_*` — không tạo/sửa tay.
- Không bỏ qua bước. Tool trả lỗi ⛔ → dừng, báo user lệnh cần chạy trước.
- **Gate duyệt**: cuối bước, tóm tắt và hỏi user **Approve / Reject**. Chỉ gọi `sep_duyet_buoc` sau khi user trả lời — không tự duyệt thay user.
- Không thấy tool `sep_*` → dừng, bảo user chạy `npm run sep -- install` rồi khởi động lại IDE (kiểm tra: `npm run sep -- doctor`).
- Bước này **không viết code**. Trả lời tiếng Việt; thuật ngữ kỹ thuật giữ tiếng Anh.

## Các bước
1. Không có mô tả sau lệnh → hỏi "Bạn muốn thực hiện chức năng gì?" rồi dừng chờ.
2. **Triage — Kiểm tra trùng Change đang mở trước khi tạo mới (BẮT BUỘC)**:
   - Gọi `sep_liet_ke_capability` **và** `sep_tim_capability({ query: <mô tả user> })`.
   - Nếu phát hiện đã có **change đang mở (`status != archived`)** cùng `capability` hoặc cùng phạm vi công việc:
     - **Dừng lại, không tự tạo change mới.** Trình bày tên change đang mở + bước hiện tại cho user và hỏi:
       1. *(Khuyên dùng)* Cập nhật vào change đang mở đó (`sep_chon_change` → dùng `/sep-refactor` nếu thêm/sửa REQ & task nhỏ, hoặc `/sep-back` nếu đổi thiết kế lớn).
       2. Tách thành một change độc lập chạy song song (chỉ khi user xác nhận rõ mới truyền `taoChangeMoiKhiTrung: true`).
   - Nếu phân hệ đó chỉ có các change cũ **đã `archived`** → hợp lệ để tạo change mới kế thừa từ `openspec/specs/<capability>/spec.md`.
3. **Route — chọn schema & mode** theo ý định:
   - `feature`: chức năng mới / mở rộng hành vi có UI hoặc API mới (`mode: "full"` mặc định).
   - `bug-fix`: sửa lỗi ("lỗi", "bug", "sai", "không chạy") — không cần `design-brief.md`. Với lỗi nhỏ/rõ ràng, có thể đề xuất `mode: "fast"` (vẫn đủ artifact 6 bước nhưng rút gọn còn 2 cổng duyệt chính ở `verify-spec` và `test`).
   - `refactor`: cải tổ code, không đổi hành vi — không cần `design-brief.md` (có thể dùng `mode: "fast"` nếu phạm vi gọn).
   Không chắc → hỏi user một câu.
4. Hỏi nhanh (tối đa 3 câu, chỉ khi thật sự mơ hồ): ai dùng, mục tiêu chính, phạm vi.
5. Xác nhận `capability`: chọn capability đã có trong `openspec/specs/`, hoặc chỉ truyền `taoCapabilityMoi: true` khi user xác nhận mở phân hệ thật sự mới.
6. Gọi `sep_tao_change` (**chỉ skill này được gọi tool này**):
   - `moTa` · `schema` · `mode` · `tenChange` (kebab-case) · **`capability` bắt buộc** (`taoChangeMoiKhiTrung: true` chỉ khi user đã chốt ở bước 2).
   - Báo thiếu assignee → hỏi GitHub username, gọi lại với `assignee`.
   - Báo capability đang có change mở (⛔) / capability chưa tồn tại → dừng, hỏi user theo hướng dẫn của tool.
7. Tra KB: `tim_kiem_kien_thuc` với từ khoá chức năng, `xem_ngu_canh_du_an` (`MT-GRMS`), `xem_dac_ta` cho capability nếu đã có Spec gốc; đọc nhanh code liên quan nếu có.
8. Viết `proposal.md` theo hướng dẫn của schema trong kết quả tool, lưu bằng `sep_luu_artifact` (file `proposal.md`):

```markdown
# Proposal: <tên change>

## Vấn đề
## Mục tiêu
## Phạm vi
- In scope: ...
- Out of scope: ...
## Người dùng liên quan
## Tiêu chí thành công
- [ ] ... (đo được)
```

9. **Gate**:
   - Nếu `mode: "fast"` trên `bug-fix`/`refactor` (không dừng cổng `spec`): tóm tắt nhanh proposal và báo chuyển thẳng sang `/sep-brainstorm`.
   - Mặc định (`mode: "full"`): tóm tắt proposal (3–5 dòng) và hỏi "Approve hay Reject?".
     - Reject → sửa theo góp ý, lưu lại, gọi `sep_duyet_buoc` (`quyetDinh: "reject"`, `tomTat`: lý do), hỏi lại.
     - Approve → `sep_duyet_buoc` (`buoc: "spec"`, `quyetDinh: "approve"`, `tomTat`, `caiTien` nếu có).

## Kết thúc
"Bước 1/6 xong. Chạy `/sep-brainstorm` để tiếp tục" (change vừa tạo đã là change đang làm).
Nếu kết quả tool báo "chưa push" → nhắc `git push` trong thư mục `team-ai-knowledge`.
