# Đề Xuất Tính Năng: FE-07 Service Procurement & Operating Expenses Frontend

## 1. Vấn Đề Cần Giải Quyết (Problem Statement)
Trong hoạt động bán lẻ tạp hóa và siêu thị mini hàng ngày, ngoài chi phí nhập hàng hóa FMCG, cửa hàng phát sinh liên tục các khoản chi phí vận hành định kỳ (OpEx) như tiền điện kinh doanh, tiền nước, tiền thuê mặt bằng, dịch vụ internet/phần mềm, và chi phí sửa chữa bảo trì thiết bị.
- Hiện tại, các chi phí này thường bị ghi chép phân tán trên giấy tờ hoặc quên ghi nhận, dẫn đến việc chủ cửa hàng không nắm được tổng chi phí vận hành thực tế của từng chi nhánh.
- Thiếu cơ chế cảnh báo hạn thanh toán (Due Date) hóa đơn điện/nước/mặt bằng, dễ dẫn đến gián đoạn hoạt động kinh doanh do nộp chậm.
- Chưa có giao diện để kết nối tự động giữa việc "Đã thanh toán hóa đơn dịch vụ" với việc tự động trừ tiền trong Sổ quỹ tiền mặt/ngân hàng (FE-17 Cashbook).

## 2. Mục Tiêu (Goals)
Xây dựng phân hệ giao diện người dùng (Frontend) hoàn chỉnh cho **FE-07 Service Procurement Management** trong hệ thống `MT_GRMS_FRONTEND`, tuân thủ 100% bộ quy chuẩn Design System của dự án:
- Phong cách giao diện Electric Blue (`#0066FF`), bo góc tròn mượt mà (Pill & 24px), phông chữ chuẩn `Be Vietnam Pro`.
- Cung cấp trải nghiệm nhanh, mượt mà, phân loại trực quan cho chủ chuỗi (`Store Owner`) và quản lý chi nhánh (`Store Manager`).

## 3. Phạm Vi Triển Khai (Scope)

### Trong phạm vi (In-Scope):
1. **SCR-07.1 Màn hình Danh sách Chi phí Vận hành (Service Expenses List Page)**:
   - Thẻ thống kê KPI tài chính nhanh: Tổng chi phí trong kỳ, Đã thanh toán, Còn nợ chờ thanh toán, Chi phí quá hạn.
   - Bảng dữ liệu (Data Table) chi phí: Mã chi phí, Chi nhánh, Danh mục dịch vụ (Điện, Nước, Mặt bằng, Internet, Sửa chữa, Khác), Số tiền, Ngày hóa đơn, Hạn thanh toán, Đơn vị thụ hưởng, Trạng thái (`Chờ thanh toán` / `Đã thanh toán`).
   - Bộ lọc đa chiều: Theo chi nhánh, theo khoảng thời gian, theo danh mục chi phí, theo trạng thái.
   - Thao tác nhanh: Xem chi tiết hóa đơn (kèm ảnh chứng từ đính kèm), Ghi nhận thanh toán, Xóa/Hủy chi phí nháp.
2. **SCR-07.2 Modal Ghi Nhận Chi Phí Mới (Record Service Expense Modal)**:
   - Form nhập liệu tối ưu: Chọn danh mục chi phí, nhập số tiền (format tiền tệ VND trực quan), ngày hóa đơn, hạn thanh toán, tên đơn vị cung cấp (Vendor/Beneficiary), tải lên/dán link ảnh hóa đơn đỏ, ghi chú.
   - Validation chặt chẽ qua Zod / React Hook Form.
3. **SCR-07.3 Modal Xác Nhận Thanh Toán (Mark as Paid & Cashbook Integration Modal)**:
   - Cho phép chọn hình thức chi tiền: `CASH` (Tiền mặt két thu ngân) hoặc `BANK` (Tài khoản ngân hàng cửa hàng).
   - Xác nhận ngày chi tiền thực tế.
   - Cảnh báo tự động đồng bộ sinh phiếu chi trong Sổ quỹ (Cashbook FE-17).

### Ngoài phạm vi (Out-of-Scope):
- Triển khai Backend API logic (được thực hiện ở repo `MT_GRMS_BACKEND`).
- Tích hợp cổng thanh toán tự động với nhà mạng điện lực/cấp nước (chỉ ghi nhận hóa đơn đối soát nội bộ).

## 4. Người Dùng & Phân Quyền (Actors & Permissions)
- **Store Owner**: Toàn quyền xem, thêm, sửa, thanh toán chi phí trên toàn bộ các chi nhánh của chuỗi.
- **Store Manager**: Xem và ghi nhận chi phí trong phạm vi chi nhánh được phân công.
- **Cashier / Inventory Staff**: Không có quyền truy cập màn hình chi phí vận hành.

## 5. Tiêu Chí Thành Công Đo Được (Success Metrics)
- 100% giao diện tuân thủ Design System (Electric Blue, bo tròn Pill/24px, font Be Vietnam Pro, icons Lucide-react).
- Thời gian tải trang và tương tác < 0.5s với trạng thái Loading skeleton, Empty state và Error boundary đầy đủ.
- Tích hợp liền mạch với Mock Service Worker / Axios client, sẵn sàng đấu nối với Backend API.
