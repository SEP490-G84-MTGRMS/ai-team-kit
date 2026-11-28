# Skeptic Review: pos-shift-sidebar-multistaff-and-fix400

| Chiều | Điểm (1–5) | Nhận xét |
|---|---|---|
| D1 Completeness | 5/5 | Đầy đủ kịch bản cho lỗi 400, điều hướng Sidebar, tinh gọn UI bỏ Z-Report, ẩn Quầy và kịch bản 2 nhân viên bán chung ca. |
| D2 Correctness | 5/5 | Xác định đúng root cause của lỗi 400 (model binding mismatch giữa string mock và Guid DTO); giải pháp fetch động qua branchApi là chuẩn mực. |
| D3 Coherence | 5/5 | Thống nhất 100% giữa proposal.md, exploration.md và specs.md sau khi cập nhật yêu cầu dùng tài khoản thật thay vì switcher. |
| D4 Constraints | 5/5 | Tuân thủ đầy đủ Tenant Isolation, Clean Architecture và RBAC cho STORE_OWNER và EMPLOYEE. |
| D5 Blast Radius | 5/5 | Rất an toàn: Chỉ sửa giao diện hiển thị, cấu hình route và thêm fallback an toàn cho controller, không chạm vào core domain hay sổ quỹ. |

## Vấn đề
- [LOW] REQ-SHIFT-CLOSE-UX-CLEANUP: Khi loại bỏ `ZReportModal`, cần đảm bảo thông báo Toast hiển thị rõ ràng số tiền thực đếm và chênh lệch để thu ngân nắm được trước khi modal đóng $\rightarrow$ Đề xuất: Giữ Toast thành công với nội dung tóm tắt ngắn gọn.

## Kết luận: Chấp nhận
Spec đã sẵn sàng để chuyển sang lập `tasks.md` và thực thi bước Apply.
