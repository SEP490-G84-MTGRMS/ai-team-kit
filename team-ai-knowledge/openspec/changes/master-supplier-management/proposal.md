# Proposal: master-supplier-management

## Vấn đề
Hiện tại trong hệ thống MT-GRMS (Garage & Chuỗi phân phối phụ tùng đa chi nhánh), chưa có phân hệ quản lý danh mục Nhà cung cấp (Master Supplier) tập trung. Thông tin về các đối tác cung cấp phụ tùng gầm máy, dầu nhớt, sơn xe, lốp xe và vật tư cơ khí đang bị rời rạc, thiếu chuẩn hóa thông tin xuất hóa đơn VAT, tài khoản ngân hàng và chính sách công nợ. Điều này gây khó khăn trực tiếp cho bộ phận quản lý kho khi tạo Đơn nhập hàng (Purchase Order) và phòng kế toán khi theo dõi công nợ (Accounts Payable).

## Mục tiêu
1. Xây dựng phân hệ Quản lý Master Supplier hoàn chỉnh, chuẩn hóa hồ sơ nhà cung cấp dùng chung toàn hệ thống garage cho từng Tenant (`TenantId`).
2. Hỗ trợ tra cứu nhanh, lọc đa tiêu chí (nhóm hàng, trạng thái hoạt động, khu vực, xếp hạng uy tín).
3. Cung cấp giao diện trực quan chuẩn KiotViet Brand Blue (React 19 + TypeScript) hiển thị KPI tổng quan, danh sách phân trang, modal thêm/sửa, drawer chi tiết và tiện ích xuất Excel, sao chép nhanh thông tin thanh toán.
4. Xây dựng Backend .NET 8 Clean Architecture với đầy đủ validation, Global Query Filter đa người thuê, soft delete an toàn (chặn xóa khi đã có giao dịch ràng buộc).

## Phạm vi
### In scope:
- **Backend (.NET 8 Clean Architecture)**:
  - Entity `Supplier` (kế thừa `BaseAuditableEntity`, implement `IMustHaveTenant`), Enum `SupplierStatus` (Active, Inactive).
  - CRUD Supplier API: Query phân trang (`GetSuppliersWithPaginationQuery`), chi tiết (`GetSupplierByIdQuery`), thống kê KPI (`GetSupplierStatsQuery`), Command tạo mới (`CreateSupplierCommand`), cập nhật (`UpdateSupplierCommand`), đổi trạng thái (`ChangeSupplierStatusCommand`), xóa an toàn (`DeleteSupplierCommand`).
  - Validation: Số điện thoại (VN format), Email, Mã số thuế, tính duy nhất của Mã NCC trong cùng `TenantId`.
  - Khóa xóa cứng (Soft Delete / Block Delete) khi NCC đã phát sinh PO hoặc phiếu chi.
- **Frontend (React 19 + Vite + TypeScript)**:
  - Trang danh sách NCC (`SupplierListPage.tsx`) với 4 KPI Cards (Tổng NCC, NCC Active, NCC có phát sinh nhập hàng, Tạm ngưng).
  - Bộ lọc đa điều kiện: Tìm kiếm từ khóa, nhóm hàng cung ứng, trạng thái hoạt động, khu vực, phân trang (10, 20, 50).
  - Modal thêm mới / sửa NCC với đầy đủ thông tin: Cơ bản, Liên hệ, Tài chính & Hóa đơn, Ngân hàng (VietQR suggestion), Điều khoản thanh toán.
  - Drawer xem chi tiết hồ sơ & lịch sử nhập hàng liên kết.
  - Tiện ích: Copy nhanh STK/MST/SĐT 1-click, Xuất Excel (.xlsx).
  - Tuân thủ thiết kế: Bảng màu KiotViet Brand Blue (`#0066FF`), bo góc Full Pill, font `Be Vietnam Pro` + `JetBrains Mono` (tabular-nums), không animation nhún nhảy.

### Out of scope:
- Nghiệp vụ tạo trực tiếp Đơn nhập kho (Purchase Order) và Lập phiếu chi công nợ chi tiết (thuộc về các feature `purchase-order` và `ap-payment` liên kết sau).
- Tích hợp cổng thanh toán ngân hàng tự động chuyển khoản (chỉ lưu trữ thông tin tài khoản và gợi ý VietQR).
- Đồng bộ tự động danh bạ NCC từ phần mềm kế toán bên thứ 3 (MISA, FAST).

## Người dùng liên quan
- **Quản trị viên hệ thống (Admin)**: Toàn quyền cấu hình, quản lý, xuất dữ liệu và đổi trạng thái NCC.
- **Quản lý kho / Trưởng bộ phận phụ tùng (Parts Manager)**: Tra cứu NCC, thêm mới NCC, xem lịch sử giao dịch và tạo yêu cầu đặt hàng.
- **Kế toán kho / Kế toán công nợ (Accountant)**: Tra cứu thông tin thuế, tài khoản ngân hàng và kiểm tra điều khoản thanh toán.

## Tiêu chí thành công
- [ ] Giao diện danh sách hiển thị đầy đủ thông tin, tải dữ liệu < 500ms, hỗ trợ phân trang và lọc đa điều kiện tức thì.
- [ ] Thêm mới và cập nhật NCC thành công, chặn trùng mã NCC và báo lỗi đúng chuẩn ProblemDetails khi sai định dạng SĐT/Email/MST.
- [ ] Chặn xóa thành công đối với NCC đã có lịch sử nhập kho, hiển thị thông báo hướng dẫn chuyển sang Inactive.
- [ ] UI tuân thủ 100% Design System: Màu KiotViet Blue `#0066FF`, bo góc Full Pill/Card 24-28px, font `Be Vietnam Pro` + `JetBrains Mono`, 0 animation floatBounce.
- [ ] Cấu trúc code bóc tách thành các component nhỏ gọn trong `src/features/suppliers/`, 0 monolithic file.
- [ ] Kiểm thử Backend (`dotnet test`) và Frontend (`npm run build`, `npm run lint`) đạt 100% PASS, 0 warning/error.
