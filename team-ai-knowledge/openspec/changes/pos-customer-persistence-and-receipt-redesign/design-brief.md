# Design Brief: pos-customer-persistence-and-receipt-redesign

## 1. Luồng người dùng (User Flows)

### Luồng 1: Thêm khách hàng mới tại quầy POS
1. **Khởi tạo**: Thu ngân bấm nút thêm khách hàng `+` bên cạnh ô tìm kiếm khách hàng trên thanh POS.
2. **Nhập liệu**: Modal `AddCustomerModal` mở ra. Thu ngân nhập:
   - Họ và tên (*)
   - Số điện thoại (*)
   - Địa chỉ (số nhà, đường, quận/huyện)
   - Email, Giới tính, Ghi chú, Hạn mức nợ (nếu có).
3. **Lưu dữ liệu**:
   - Thu ngân bấm "Lưu khách hàng" (F9 hoặc Enter).
   - Modal hiển thị trạng thái `isSubmitting`, nút bấm hiển thị spinner và bị disable.
   - Gọi API `POST /api/customers` qua `customerApi.createCustomer(...)`.
4. **Phản hồi**:
   - **Thành công**: Backend trả về `CustomerResponse` với GUID `id` thật từ PostgreSQL.
     - Cập nhật state `customers` trong `PosCheckoutPage`: `[newCustomer, ...prev]`.
     - Tự động gán khách hàng này vào tab đơn hàng hiện tại (`updateCurrentTab({ customer: newCustomer })`).
     - Hiển thị Toast thông báo thành công: "✅ Đã lưu khách hàng [Tên] vào hệ thống thành công!".
     - Đóng modal và reset form.
   - **Thất bại** (Ví dụ trùng SĐT): Hiển thị thông báo lỗi cụ thể: "Số điện thoại này đã được sử dụng cho một khách hàng khác!". Giữ nguyên form để thu ngân chỉnh sửa.
5. **Duy trì thông tin**:
   - Khi thu ngân bấm `✕` để bỏ chọn khách hàng khỏi tab đơn -> Khách hàng chuyển về "Khách lẻ".
   - Khách hàng mới vẫn được lưu vĩnh viễn trong CSDL PostgreSQL và trong danh sách tìm kiếm `customers`. Khi gõ lại SĐT hoặc tên, khách hàng xuất hiện ngay lập tức trong dropdown gợi ý.

---

### Luồng 2: Xem trước và In hóa đơn bán lẻ (Chuẩn Siêu thị)
1. **Kích hoạt**:
   - Sau khi thanh toán đơn hàng thành công (Tiền mặt, VietQR, hoặc Bán nợ).
   - Hoặc khi thu ngân bấm nút "Xem/In lại hóa đơn" trên thanh công cụ POS hoặc danh sách hóa đơn.
2. **Dữ liệu hóa đơn (`buildReceiptData`)**:
   - **Tên cửa hàng/chuỗi**: Lấy từ `user.tenantName` (viết hoa) hoặc `activeBranch.name`.
   - **Địa chỉ chi nhánh**: Lấy từ `activeBranch.address` (lấy động từ `/branches/summaries`), fallback theo địa chỉ tenant.
   - **Hotline liên hệ**: Lấy từ `activeBranch.phone` hoặc hotline tenant (`user.tenantName` chứa An Nhiên -> `0918889999` / `024 3822 9988`).
   - **Loại bỏ VAT hoàn toàn**: `vatAmount = 0`, không có dòng tính "Tổng tiền chưa VAT" hay "Tiền VAT". `finalAmount` là tổng giá trị thanh toán thực tế của đơn hàng.
   - **Thông tin khách hàng**: Gồm Tên khách hàng, Địa chỉ, Số điện thoại và Điểm tích lũy.
3. **Giao diện Modal xem trước (`PosReceiptModal.tsx`)**:
   - Header: Căn giữa, tên cửa hàng/siêu thị in đậm, địa chỉ, hotline, tiêu đề `HÓA ĐƠN BÁN LẺ`, Số HĐ, Ngày bán, Tên thu ngân.
   - Bảng mặt hàng: Dạng bảng kẻ rõ ràng gồm các cột `STT | Hàng hóa | SL | Đơn giá | Thành tiền`.
   - Dòng tổng số lượng hàng.
   - Khối tổng tiền: Tổng tiền hàng, Chiết khấu (nếu có), Tổng phải trả, Tiền khách trả (Tiền mặt / VietQR / Ghi nợ), Tiền thừa / Còn nợ.
   - Khối `THÔNG TIN KHÁCH HÀNG`: Tên khách hàng, Địa chỉ, Số điện thoại, Tổng điểm tích lũy.
   - Footer: Lời cảm ơn và chính sách đổi trả hàng.
4. **Lệnh in nhiệt ESC/POS (`ThermalPrintService.cs`)**:
   - Xóa bỏ hoàn toàn khối in `Thue VAT:` và dòng wifi mặc định.
   - In động thông tin đơn vị/địa chỉ/hotline từ thông tin chi nhánh liên kết của đơn hàng.
   - Định dạng bảng hàng hóa rõ ràng với STT, tên món, số lượng, đơn giá và thành tiền.
   - In khối thông tin khách hàng ở cuối hóa đơn trước lời cảm ơn.

---

## 2. Component & Endpoint Chính

### Frontend Components
- `MT_GRMS_FRONTEND/src/features/pos/components/modals/AddCustomerModal.tsx`:
  - Thêm state `isSubmitting: boolean` và `errorMessage: string | null`.
  - Tích hợp gọi `customerApi.createCustomer(...)`.
  - Chuyển đổi DTO trả về thành kiểu `Customer` của POS và gửi ra qua `onSave`.
- `MT_GRMS_FRONTEND/src/features/pos/pages/PosCheckoutPage.tsx`:
  - Cập nhật state `activeBranch` thành `{ id: string; name: string; address?: string; phone?: string }`.
  - Cập nhật hàm `buildReceiptData`: Bỏ VAT (`vatAmount: 0`, `finalAmount = calculatedFinal`), gán storeName, storeAddress, storePhone động.
  - Cập nhật handler `onSave` của `AddCustomerModal` để ghi đè/bổ sung vào `customers` state và tự động chọn vào `currentTab.customer`.
- `MT_GRMS_FRONTEND/src/features/pos/components/PosReceiptModal.tsx`:
  - Thiết kế lại bố cục HTML theo mẫu thực tế siêu thị Đức Thành.
  - Bỏ triệt để các phần tử liên quan đến VAT.
  - Bổ sung khối thông tin khách hàng ở chân bill.

### Backend Services
- `MT_GRMS.Infrastructure/Services/Printer/ThermalPrintService.cs`:
  - Tối ưu `BuildEscPosReceipt`:
    - Xóa bỏ việc cộng và in `Thue VAT:`.
    - Xóa bỏ dòng `Wifi: MT-GROCERY`.
    - Đọc `order.Branch.Name`, `order.Branch.Address`, `order.Branch.Phone` (kèm fallback Tenant name/hotline).
    - In khối thông tin khách hàng (Tên, SĐT, Địa chỉ, Điểm tích lũy) ở cuối hóa đơn.

---

## 3. Database Changes
- **Không có**: Không cần thêm bảng hay cột mới. Sử dụng dữ liệu hiện có trong bảng `Customers`, `Branches`, `Tenants`, `Orders`.

---

## 4. Business Rules & Permissions
- **Multi-tenancy**: Mọi thao tác thêm khách hàng đều tự động gán `TenantId` của user đang đăng nhập. Không thể tra cứu hay ghi đè khách hàng của Tenant khác.
- **Tính toàn vẹn**: Số điện thoại là định danh chính của khách hàng tại quầy; hệ thống ngăn chặn trùng lặp số điện thoại trong cùng một Tenant.
