# Design Brief: pos-cash-refund-and-preorder-rules

## 1. Luồng Người Dùng (User Flows)

### 1.1. Luồng Đổi / Trả hàng chuẩn tại quầy thu ngân
1. Thu ngân bấm **"Đổi / Trả"** tại dòng hóa đơn đã hoàn thành trong `InvoiceManagementPage`.
2. Modal `ReturnExchangeModal` mở lên:
   - **Phần 1 - Hàng khách trả**: Thu ngân nhập số lượng muốn trả, chọn **Tình trạng hàng trả**:
     - `Nhập lại kho (Restock)`: Hàng còn nguyên vẹn, bao bì chuẩn.
     - `Hỏng/Hủy (Damaged)`: Hàng bị rách, hỏng, cận hạn (không cộng tồn khả dụng).
   - **Phần 2 - Chọn sản phẩm đổi mới (nếu có)**: Thu ngân chọn sản phẩm đổi mới từ danh mục, chọn đơn vị quy đổi (Unit) và số lượng. Hệ thống tự động tính thành tiền hàng đổi.
   - **Phần 3 - Bù trừ chênh lệch**:
     - *Nếu khách cần trả thêm (`netAmount > 0`)*: Chọn thanh toán thêm bằng `Tiền mặt` hoặc `Chuyển khoản VietQR`.
     - *Nếu cửa hàng cần hoàn tiền lại cho khách (`netAmount < 0`)*:
       - Hình thức hoàn tiền: **Duy nhất "Hoàn tiền mặt từ két quầy"**.
       - Hiển thị số dư tiền mặt hiện tại trong két.
       - Nếu số dư két < số tiền cần hoàn: Hiển thị cảnh báo đỏ và khóa nút hoàn tất, hướng dẫn thu ngân nạp thêm tiền vào két quầy.
   - **Phần 4 - Lý do đổi trả**: Thu ngân bắt buộc chọn lý do từ dropdown:
     - `Sản phẩm lỗi/hỏng do nhà sản xuất`
     - `Khách mua nhầm sản phẩm`
     - `Khách đổi ý muốn lấy loại khác`
     - `Hàng giao sai quy cách / đơn vị`
     - `Khác (ghi rõ trong ghi chú)`
     Kèm ô nhập ghi chú chi tiết.
3. Thu ngân bấm **"Xác nhận hoàn tất"**:
   - Nếu có hoàn tiền mặt: Tạo phiếu chi/hoàn tiền `ShiftCashMovement` loại `OUT`, danh mục `REFUND`, tăng chỉ số `E` (CashRefund) của ca đang mở.
   - Tồn kho tự động cập nhật: Chỉ hàng có trạng thái `Restock` mới được cộng lại vào tồn kho khả dụng. Hàng đổi mới bị trừ tồn kho theo FEFO.

### 1.2. Luồng Kiểm soát Đơn Đặt Trước (Pre-Order)
1. **Khi nhận cọc**:
   - Khách cọc tiền mặt: Tạo phiếu `IN`, danh mục `CUSTOMER_DEPOSIT`, cộng vào `C` (tiền thu khác vào két quầy), **chưa tính vào doanh thu bán hàng `B`**.
2. **Khi bàn giao hàng**:
   - Khách thanh toán phần tiền còn thiếu: Chỉ phần tiền thu thêm này mới được cộng vào doanh thu bán hàng `B` (hoặc `TotalBankRevenue`).
   - Tiền cọc trước đó tuyệt đối không cộng vào `B` lần 2.
3. **Khi đổi trả hóa đơn xuất phát từ Đơn đặt trước**:
   - Hệ thống kiểm tra nguồn gốc hóa đơn (`isPreOrderOrigin` hoặc có `preOrderId`).
   - Nếu là đơn đặt trước: **Chỉ cho phép Đổi hàng (chọn sản phẩm đổi mới)**. Không cho phép trả hàng hoàn tiền mặt, trừ trường hợp lý do chọn là `Sản phẩm lỗi/hỏng do nhà sản xuất`.

---

## 2. Thiết Kế Giao Diện & Component

### 2.1. `ReturnExchangeModal.tsx`
- **Tiêu đề**: "Đổi / Trả Hàng" kèm thông tin hóa đơn và số dư tiền mặt trong két.
- **Bảng hàng trả**:
  - Cột mới: **Tình trạng hàng** (Dropdown: `Restock` - Nhập lại kho | `Damaged` - Hỏng/Hủy).
- **Khối Bù trừ chênh lệch**:
  - Xóa bỏ hoàn toàn radio `Chuyển khoản (VietQR)` và `Trừ vào sổ nợ`.
  - Thay bằng khối thông tin hoàn tiền mặt:
    - *Số tiền hoàn trả*: `-X đ`.
    - *Tiền mặt trong két*: `Y đ`.
    - Trạng thái hợp lệ (`Y >= X`): Nút xanh *"Xác nhận hoàn tiền mặt từ két"*.
    - Trạng thái thiếu tiền (`Y < X`): Khung cảnh báo màu đỏ: *"Tiền mặt trong két quầy hiện không đủ để hoàn tiền. Vui lòng nạp thêm tiền vào két quầy!"*.
- **Dropdown Lý do đổi trả**: Bắt buộc chọn trước khi gửi.

---

## 3. Trạng Thái Loading / Empty / Error
- **Loading**: Disable nút bấm và hiển thị spinner/text `Đang xử lý đổi trả...` khi gọi API.
- **Empty**: Chặn xác nhận nếu thu ngân chưa chọn sản phẩm nào để trả hoặc để đổi mới.
- **Error**:
  - Chưa chọn lý do đổi trả: Cảnh báo `Vui lòng chọn lý do đổi trả hàng`.
  - Két không đủ tiền hoàn mặt: Chặn xác nhận và yêu cầu nạp tiền két.
  - Đơn đặt trước cố tình trả hàng lấy tiền mặt mà không phải lỗi NSX: Cảnh báo `Đơn đặt trước giữ kho chỉ hỗ trợ đổi sang sản phẩm khác. Trả hàng hoàn tiền mặt chỉ áp dụng đối với sản phẩm lỗi từ nhà sản xuất!`.

---

## 4. Dữ Liệu & API Contract
- Payload `onConfirmReturnExchange`:
  ```typescript
  {
    returnedItems: Array<{
      productId: string;
      quantity: number;
      unitPrice: number;
      unitName?: string;
      condition: 'RESTOCK' | 'DAMAGED'; // Mới
    }>;
    newItems: Array<{
      productId: string;
      quantity: number;
      unitPrice: number;
      unitName?: string;
    }>;
    settlementMethod: 'CASH'; // Cố định
    returnReason: string; // Mới
    note?: string;
  }
  ```

---

## 5. Phân Quyền
- **Thu ngân (Cashier)**: Thực hiện đổi trả hàng trong phạm vi số dư tiền mặt két quầy ca trực; bàn giao đơn đặt trước tại quầy.
- **Chủ cửa hàng (Store Owner / Admin)**: Theo dõi toàn bộ lịch sử hoàn tiền trên Z-report; quản lý cấu hình két và chính sách hủy đơn đặt trước.
