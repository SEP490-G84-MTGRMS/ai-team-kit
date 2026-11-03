# Bản Thiết Kế Kỹ Thuật (Design Brief)

## 1. Luồng Người Dùng (User Flow)
1. **Luồng Quản lý Hóa đơn & Đơn đặt trước (`/pos/orders`):**
   - Người dùng truy cập trang Quản lý đơn hàng.
   - Frontend tự động gọi API `GET /api/orders` của backend theo TenantId của tài khoản hiện tại.
   - Phân loại dữ liệu:
     - Tab **Hóa đơn bán lẻ**: Hiển thị hóa đơn Tiền mặt, VietQR, Bán nợ, Đã hủy. Người dùng có thể xem chi tiết, In lại hóa đơn hoặc bấm Hủy hóa đơn (`PUT /api/orders/{id}/cancel`).
     - Tab **Đơn đặt trước**: Hiển thị danh sách đơn giữ kho, số tiền đã cọc, số tiền còn thiếu và lịch hẹn nhận hàng. Khi khách đến quầy nhận hàng, thu ngân bấm *"Xuất hàng & Nhận thanh toán"* -> gọi API `PUT /api/orders/{id}/fulfill`.
2. **Luồng Bán Nợ Tạp Hóa (Không Giới Hạn Hạn Mức):**
   - Chủ tiệm chọn phương thức thanh toán **Ghi nợ** trên bảng tính tiền `PosPaymentPanel`.
   - Hệ thống hiển thị: Số lần khách đã từng nợ, Tổng tiền từng nợ, Số tiền đang nợ và Tổng nợ sau đơn.
   - Bấm nút **GHI NỢ ĐƠN HÀNG** -> Tạo đơn `paymentMethod: 'DEBT'`, `paymentStatus: 'UNPAID'` và tự động cộng dồn nợ vào hồ sơ khách hàng.
3. **Luồng Thêm Khách Hàng Nhanh Tại Quầy:**
   - Thu ngân bấm nút `[+]` -> Mở `AddCustomerModal`.
   - Form tinh gọn: Tên KH, Số điện thoại, Ngày sinh, Giới tính, Địa chỉ, Khu vực, Phường xã, Ghi chú.
   - Bỏ hoàn toàn ô Mã KH (hệ thống tự sinh mã ngầm dạng `KHxxxxxx`) và ô Nhóm khách hàng.

## 2. API Endpoints & DTOs
- `GET /api/orders`: Danh sách đơn hàng theo TenantId, hỗ trợ lọc theo trạng thái (`Completed`, `Cancelled`, `PreOrder`), chi nhánh, ngày tháng.
- `POST /api/orders`: Tạo và thanh toán đơn hàng bán lẻ POS.
- `POST /api/orders/pre-orders`: Tạo đơn đặt trước giữ kho, nhận tiền cọc.
- `PUT /api/orders/{id}/fulfill`: Hoàn tất giao đơn đặt trước và thu nốt tiền còn lại.
- `PUT /api/orders/{id}/cancel`: Hủy hóa đơn và hoàn trả tồn kho FEFO.
- `OrderResponse DTO`:
  ```csharp
  public record OrderResponse(
      Guid Id,
      string OrderCode,
      Guid BranchId,
      string? BranchName,
      Guid? CustomerId,
      string? CustomerName,
      DateTime OrderDate,
      decimal TotalAmount,
      decimal DiscountAmount,
      decimal FinalAmount,
      decimal CashTendered,
      decimal ChangeAmount,
      string PaymentMethod,
      string PaymentStatus,
      string Status,
      List<OrderItemResponse> Items,
      string? CustomerPhone = null,
      decimal DepositAmount = 0m,
      string? Note = null
  );
  ```

## 3. Dữ Liệu Khởi Tạo (Seed Data)
Tài khoản chủ tiệm: `Tran Van Chu (Chu cua hang)`, Phone: `0901234567`, TenantId: `tenant_mt_mart_01`.
- **4 Hóa đơn bán lẻ mẫu:**
  - `HD-20261101-001`: Khách Nguyễn Văn Hưng - Tiền mặt 66.500đ (`PAID`).
  - `HD-20261101-002`: Khách Nguyễn Văn Khách - VietQR 260.000đ (`PAID`).
  - `HD-20261101-003`: Khách Chị Lan - Ghi nợ 522.500đ (`UNPAID / DEBT`).
  - `HD-20261101-004`: Khách lẻ - Đã hủy 38.000đ (`Cancelled`).
- **3 Đơn đặt trước giữ kho mẫu:**
  - `PO-20261101-001`: Khách Chị Lan - 1.735.000đ, Cọc 500.000đ, Hẹn lấy 17:30 (`PreOrder`).
  - `PO-20261101-002`: Khách Nguyễn Văn Hưng - 850.000đ, Cọc 300.000đ, Hẹn lấy 18:00 (`PreOrder`).
  - `PO-20261031-003`: Khách Nguyễn Văn Khách - 585.000đ, Đã hoàn tất hôm qua (`Completed`).

## 4. Phân Quyền & Bảo Mật (RBAC & Multi-Tenancy)
- Bán nợ chỉ áp dụng cho vai trò `STORE_OWNER` và `ADMIN`.
- Thu ngân (`CASHIER`) bị ẩn hoàn toàn tùy chọn bán nợ.
- Toàn bộ truy vấn CSDL đều được phân lập nghiêm ngặt qua `TenantId = "tenant_mt_mart_01"`.
