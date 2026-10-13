# Proposal: supplier-order-dispatch-cutoff

## 1. Vấn đề
Sau khi nhân viên hoặc chủ cửa hàng lên kế hoạch đặt hàng trên bảng lưới (Order Grid / Matrix), hệ thống cần phân rã và gom nhóm dữ liệu theo từng Nhà cung cấp (NCC) để phát hành các Đơn Mua Hàng (Purchase Order - PO) độc lập.

Trong chuỗi cửa hàng bán lẻ và tạp hóa, mỗi NCC có các quy tắc vận hành hoàn toàn khác nhau:
- **Quy tắc Giờ chốt đơn (Cutoff Time)**: Hàng tươi sống (thịt, rau củ) thường cutoff hàng ngày (ví dụ 15:00 hôm nay để giao sáng mai); hàng khô, đông lạnh hoặc bao bì chỉ cutoff 1–2 lần/tuần (ví dụ Thứ 3, Thứ 6 lúc 11:00).
- **Rủi ro vận hành**: Nếu không có màn hình tập trung sắp xếp theo mức độ khẩn cấp (Urgency), Store Owner rất dễ bị lỡ giờ cutoff của các NCC gấp, dẫn đến việc thiếu hàng, hụt nguyên liệu kinh doanh vào sáng hôm sau.
- **Giá trị đơn hàng tối thiểu (MOV - Min Order Value)**: Mỗi NCC đều có điều kiện đơn hàng tối thiểu để được freeship hoặc chấp nhận giao hàng.

Do đó, cần có màn hình chuyên biệt **"Trung tâm Chốt Đơn & Tách PO theo Nhà Cung Cấp" (Supplier Order Dispatch & Cutoff Hub)** giúp Store Owner bao quát toàn diện, kiểm soát chặt chẽ deadline và chốt đơn kịp thời.

## 2. Mục tiêu
- Xây dựng màn hình **Supplier Order Dispatch & Cutoff Hub** tối ưu trải nghiệm cho Store Owner.
- Tổ chức theo 3 phân vùng chiến lược:
  1. **Top Urgency Bar**: Chỉ số tổng quan, phân loại mức độ khẩn cấp (🔴 < 2h, 🟡 hôm nay, ⚪ ngày sau) và nút "Chốt nhanh các đơn hết hạn hôm nay".
  2. **Filter & Grouping Bar**: Tabs lọc nhanh (Tất cả, Cần chốt gấp, Hôm nay, Đợt tới, Đã chốt) và tìm kiếm theo NCC / ngành hàng.
  3. **Supplier Order Cards (Accordion 2 tầng)**:
     - Tầng 1 (Summary Card): Tên NCC, thẻ phân loại, Cutoff time & Countdown timer đếm ngược, ngày giao dự kiến, tổng SKU, tổng tiền, trạng thái đạt/chưa đạt MOV, nút CTA chốt đơn.
     - Tầng 2 (Expanded Items Grid): Bảng mini các SKU kèm khả năng sửa nhanh số lượng tại chỗ, ghi chú giao hàng cho NCC.
- Hỗ trợ xử lý thông minh các Edge Cases:
  - Phân nhóm hàng ngày vs hàng tuần của cùng 1 NCC.
  - Cảnh báo đơn quá giờ Cutoff (Overdue) và chuyển đổi lịch giao sang ngày tiếp theo.
  - Cảnh báo & chặn chốt đơn nếu chưa đạt MOV (kèm gợi ý đặt thêm).
  - Modal xác nhận phát hành PO trước khi gửi chính thức.
- Tuân thủ quy chuẩn thiết kế `RULE_UI_DESIGN_SYSTEM.md`.

## 3. Phạm vi (Scope)
### In scope:
- Tạo trang `SupplierOrderDispatchHubPage.tsx` và các component con liên quan trong `src/features/purchase-order/`.
- Cấu hình routing `/store-owner/purchase-orders/dispatch-hub` (hoặc `/store-owner/purchase-orders/cutoff-hub`) trong `src/app/router.tsx` và bổ sung vào menu điều hướng.
- Thanh chỉ số tổng quan với thống kê số NCC nháp, tổng giá trị, cảnh báo đếm ngược urgency.
- Hệ thống đếm ngược Cutoff Time (Countdown Timer) trực quan theo thời gian thực hoặc mock reference time.
- Danh sách thẻ NCC dạng Accordion: xem và sửa nhanh số lượng inline, tính lại thành tiền tức thì.
- Modal xác nhận trước khi gửi PO (hiển thị tóm tắt NCC, phương thức gửi, ngày giao, tổng tiền).
- Nút "Chốt nhanh tất cả NCC hết hạn hôm nay".

### Out of scope:
- Tích hợp cổng gửi tin nhắn Zalo ZNS / B2B EDI thực tế ra bên thứ ba (mô phỏng dispatch qua modal & toast thông báo).
- Thay đổi cấu trúc cơ sở dữ liệu backend.

## 4. Người dùng liên quan
- **Chủ chuỗi / Cửa hàng trưởng (Store Owner / Branch Manager)**: Người ra quyết định chốt đơn mua hàng cuối cùng và gửi PO tới các nhà cung cấp.
- **Nhân viên thu mua (Purchasing Staff)**: Người theo dõi tiến độ giao hàng và xác nhận đơn PO đã phát hành.

## 5. Tiêu chí thành công
- [ ] Giao diện hiển thị đầy đủ 3 khu vực theo đúng wireframe và chuẩn thiết kế compact enterprise.
- [ ] Phân loại chính xác các trạng thái Cutoff: Cần chốt gấp (< 2 giờ), Hôm nay, Đợt tới trong tuần, Đã chốt.
- [ ] Cho phép mở rộng Accordion xem chi tiết và sửa nhanh số lượng mặt hàng tại chỗ.
- [ ] Hiển thị cảnh báo trực quan khi chưa đạt MOV hoặc khi đã quá giờ cutoff.
- [ ] Modal xác nhận tạo PO hoạt động mượt mà, sau khi xác nhận thì chuyển trạng thái thẻ NCC sang "Đã chốt / Đã phát hành PO".
- [ ] Build frontend thành công (`npm run build`), không phát sinh lỗi TypeScript.
