# Khảo sát & Phân tích Kiến trúc (Exploration) — pos-inventory-invoice-ui

## 1. Bối cảnh & Mục tiêu Nghiệp vụ
Hệ thống Siêu thị mini MT-GRMS đang triển khai hoàn thiện các phân hệ quầy thu ngân (POS) và quản lý vận hành bán lẻ.
Hai màn hình được yêu cầu triển khai:
1. **Tra cứu tồn kho & Lô hạn dùng FEFO (`/employee/inventory-lookup`)**:
   - Dựa trên mẫu thiết kế wireframe `Tra_Cuu_Ton_Kho_Lo_FEFO.html`.
   - Giúp thu ngân và nhân viên kiểm tra tức thời số lượng tồn kho theo từng điểm bán / tổng kho.
   - Cung cấp danh sách Lô hàng theo nguyên tắc FEFO (First Expired, First Out - Hàng hết hạn trước xuất trước), phân loại mức độ cận date, hỗ trợ xả hàng giảm giá hoặc chọn đích danh lô để bán tại quầy POS.
2. **Quản lý Hóa đơn & Đơn đặt trước (`/employee/orders`)**:
   - Dựa trên mẫu thiết kế wireframe `Quan_Ly_Hoa_Don.html`.
   - Phục vụ quản lý cửa hàng và thu ngân tra cứu lịch sử hóa đơn bán lẻ (100% thanh toán tại quầy qua VietQR / Tiền mặt, không công nợ lẻ).
   - Quản lý và xử lý đơn đặt trước & giữ kho (Pre-order) tại quầy.
   - Xem chi tiết hóa đơn (Accordion / Drawer) và xem trước / in lại hóa đơn khổ nhiệt K80.

## 2. Điểm tích hợp & Điều hướng
- **Điểm truy cập trên Header POS**:
  - Menu hamburger `[ ≡ Thao tác ]` trên `PosHeader.tsx` được mở rộng thêm 2 mục:
    - `📦 Tra cứu tồn kho & Lô FEFO` -> điều hướng tới `/employee/inventory-lookup`
    - `📄 Quản lý hóa đơn & Đặt trước` -> điều hướng tới `/employee/orders`
- **Đường dẫn URL yêu cầu**:
  - Màn hình nối tiếp sau URL gốc: `http://localhost:5173/employee/`
  - Đồng thời hỗ trợ alias route `/pos/inventory-lookup` và `/pos/orders` để trải nghiệm xuyên suốt trong POS Layout.
  - Mỗi màn hình đều có nút quay lại `⚡ Bán hàng [F1]` dẫn về `/employee/pos` hoặc `/pos`.

## 3. Đối chiếu ERD & Thiết kế DTO
Căn cứ sơ đồ ERD hệ thống MT-GRMS:
- Bảng Sản phẩm & Đơn vị tính (`Product`, `ProductUnit`): Mã SKU, Barcode, Giá theo từng ĐVT (Hộp, Lốc, Thùng), Vị trí quầy kệ.
- Bảng Kho & Chi nhánh (`Branch`, `InventoryStock`): Số lượng vật lý, số lượng đang giữ đơn (Hold), số lượng khả dụng (Available), định mức tồn an toàn (Safety threshold).
- Bảng Quản lý Lô (`ProductBatch` / `Batch`): Mã lô (BatchID), Ngày sản xuất (MFG), Hạn sử dụng (EXP), Tồn khả dụng theo lô, Nhà cung cấp, Trạng thái cảnh báo cận date.
- Bảng Hóa đơn & Chi tiết (`Invoice` / `Order`, `InvoiceItem`): Mã hóa đơn (`HD-...`), Ngày tạo, Thu ngân, Khách hàng, Phương thức thanh toán (VietQR, Tiền mặt), Tổng tiền hàng, Giảm giá voucher, Tổng thanh toán, Trạng thái (Hoàn thành, Đã hủy).
- Bảng Đơn đặt trước (`PreOrder`): Mã đặt trước, Khách hàng, Tiền cọc (Deposit), Thời gian hẹn nhận, Lô giữ kho, Trạng thái.

Toàn bộ Models/Interfaces được khai báo dưới dạng `class ...DTO` có constructor gán `Partial<T>` và chú thích ánh xạ sang C# .NET Backend.

## 4. Ràng buộc & Tái sử dụng giao diện
- Tái sử dụng `TablePagination` từ `src/components/common` (Props: `currentPage`, `totalPages`, `pageSize`, `totalItems`, `onPageChange`, `onPageSizeChange`). Không tạo pagination mới.
- Hệ thống màu sắc: Deep Teal (`#0F766E`), nền Slate (`#F8FAFC`), Font `Be Vietnam Pro`, nút bấm và tag bo tròn pill hài hòa.
- Không đưa các trường giao hàng hay phí vận chuyển vào hóa đơn bán lẻ tại quầy POS.
- Không thực hiện commit/push git vào repo `MT_GRMS_FRONTEND` khi chưa có lệnh.
