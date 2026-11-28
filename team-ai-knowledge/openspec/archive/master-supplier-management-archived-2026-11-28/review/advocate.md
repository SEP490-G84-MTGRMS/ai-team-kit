# Advocate Review: master-supplier-management

## Người dùng & tình huống chính
- Store Owner: mở `/store-owner/suppliers`, tìm NCC theo MST/SĐT, thêm NCC, vào chi tiết cấu hình giao hàng và chi nhánh.
- Branch Employee: chỉ xem NCC dùng được tại chi nhánh, không thấy công nợ, không thêm/sửa.
- Giờ đặt hàng: cần biết cutoff; không bị hệ thống tự đổi ngày giao đơn đã xác nhận.

## Vấn đề
- [HIGH] List hiện có cột Đang nợ/Quá hạn và nút Trả — nhân viên dễ thấy công nợ Tenant, trái FE-09.12. → Bỏ khỏi list; công nợ chỉ tab chi tiết Store Owner.
- [MEDIUM] Nút Xuất Excel và Trả là stub (toast giả) — gây mất tin. → Ẩn.
- [MEDIUM] Chi tiết đang mock + footer "Minh họa bố cục" — user tưởng đã lưu. → Nối API thật, bỏ caption.
- [MEDIUM] Thiếu filter Loại NCC trên list dù FE-09.01 yêu cầu. Search MST chưa chạy backend.
- [LOW] Form bắt SĐT trong khi FE-09.03 chỉ bắt buộc Tên.

## Đề xuất cắt giảm / để sau
- Dual-role link customer trên list/detail: giữ API, không làm thao tác chính.
- MOV / Urgent delivery: không thuộc FE-09.07 mới.
- Excel export: sau.
- Tab sản phẩm trên detail: deeplink sang `SupplierProductManagementPage` đã có.

## Kết luận: Cần sửa
