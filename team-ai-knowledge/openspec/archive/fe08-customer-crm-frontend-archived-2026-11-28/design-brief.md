# Design Brief: Frontend Quản Lý Khách Hàng & Công Nợ (FE-08)

## 1. Luồng Người Dùng (User Flow)
1. **Tra cứu & Khám phá danh sách:**
   - Người dùng truy cập menu `Đối tác -> Khách hàng & CRM`.
   - Xem 4 thẻ tóm tắt KPI trên cùng:
     - `Tổng số khách hàng` (Active Customers).
     - `Tổng công nợ phải thu` (Total Accounts Receivable).
     - `Khách quá hạn mức` (Exceeded Debt Limit).
     - `Tổng điểm tích lũy` (Total Loyalty Points).
   - Sử dụng thanh tìm kiếm (nhập SĐT hoặc Tên) hoặc dropdown bộ lọc (Hạng thẻ VIP: Standard, Silver, Gold, VIP; Trạng thái nợ: Đang nợ, Hết nợ, Quá hạn mức).
2. **Thêm mới / Sửa thông tin khách hàng:**
   - Nhấn nút "Thêm khách hàng" -> Hiển thị Modal với các trường: Họ tên, Số điện thoại (bắt buộc), Email, Địa chỉ, Hạn mức nợ (`DebtLimit`).
   - Kiểm tra trùng lặp SĐT theo thời gian thực (Client validation + API debounce).
3. **Xem chi tiết khách hàng qua Drawer:**
   - Nhấn vào bất kỳ dòng nào trong bảng -> Mở Drawer trượt bên phải hiển thị:
     - Header: Avatar viết tắt, Tên, Badge Hạng thẻ (Màu sắc theo VIP level), Trạng thái nợ.
     - Widget Công nợ: Số nợ hiện tại / Hạn mức nợ, Thanh Progress bar % đã dùng.
     - Widget Điểm thưởng: Điểm khả dụng, Giá trị quy đổi tiền mặt.
     - Tabs:
       - Tab 1: Thông tin liên hệ & Ghi chú.
       - Tab 2: Lịch sử mua hàng (Mã đơn, Ngày, Tổng tiền, Trạng thái thanh toán).
       - Tab 3: Lịch sử thanh toán nợ (Ngày thu, Số tiền, Phương thức Tiền mặt/VietQR, Nhân viên thu).
4. **Quy trình Lập phiếu thu nợ & Thanh toán VietQR:**
   - Từ bảng danh sách hoặc từ Drawer, nhấn nút "Thu nợ".
   - Mở Modal Thu Nợ:
     - Hiển thị số nợ hiện tại.
     - Ô nhập số tiền thu (có nút bấm nhanh: "Thu 100% nợ", "Thu 50% nợ").
     - Chọn hình thức: "Tiền mặt" hoặc "Chuyển khoản VietQR".
     - Nếu chọn VietQR: Hiển thị ngay khung mã QR động theo chuẩn Napas 247 kèm thông tin STK, Tên chủ TK, Số tiền và Cú pháp nội dung chuyển khoản (`THUNO <SĐT>`).
     - Hỗ trợ nút "Tải mã QR" hoặc "Copy link chuyển khoản" để gửi khách hàng qua Zalo.
     - Nút "Xác nhận đã thu tiền": Cập nhật tức thì giảm công nợ khách hàng và ghi nhận 1 bút toán thu vào Sổ quỹ (`Cashbook`).

## 2. Danh Sách Components (Frontend Architecture)
- `CustomerManagementPage`: Container chính chứa Header, KPI Cards, Filter Bar, Customer Table và Drawer.
- `CustomerKpiGrid`: Grid hiển thị 4 chỉ số tài chính và khách hàng trọng yếu.
- `CustomerTable`: Bảng danh sách phân trang (pagination), sorting theo nợ/điểm/tên, hành động nhanh (Xem, Thu nợ, Sửa).
- `CustomerDrawerDetail`: Drawer chi tiết hiển thị toàn diện hồ sơ và lịch sử giao dịch.
- `CustomerFormModal`: Modal tạo mới hoặc cập nhật hồ sơ khách hàng.
- `DebtCollectionModal`: Modal lập phiếu thu nợ và sinh mã VietQR động.
- `VietQrDisplayCard`: Component hiển thị mã QR, thông tin ngân hàng và nút sao chép cú pháp.

## 3. Trạng Thái Giao Diện (UI States)
- **Loading State:** Hiển thị Skeleton loading cho các thẻ KPI và Skeleton table khi đang nạp dữ liệu.
- **Empty State:** Hình minh họa thân thiện khi không có khách hàng nào phù hợp với bộ lọc tìm kiếm kèm nút "Xóa bộ lọc".
- **Error State:** Alert banner hiển thị thông báo lỗi thân thiện khi không thể kết nối hoặc API trả mã lỗi, kèm nút "Thử lại".
- **Warning State:** Đổi màu viền thẻ hoặc badge sang màu đỏ khi khách hàng chạm hoặc vượt `DebtLimit`.

## 4. Cấu Trúc Dữ Liệu & DTO Mapping
```typescript
interface CustomerDto {
  id: string;
  tenantId: string;
  phoneNumber: string;
  fullName: string;
  email?: string;
  address?: string;
  loyaltyPoints: number;
  membershipTier: 'Standard' | 'Silver' | 'Gold' | 'VIP';
  currentDebtAR: number;
  debtLimit: number;
  createdAt: string;
}

interface DebtPaymentRequestDto {
  customerId: string;
  amount: number;
  paymentMethod: 'CASH' | 'VIETQR';
  note?: string;
}

interface VietQrPayload {
  bankId: string;
  accountNo: string;
  accountName: string;
  amount: number;
  description: string;
  qrDataUrl: string;
}
```

## 5. Quy Tắc Nghiệp Vụ (Business Rules) & Phân Quyền RBAC
- **BR-01**: Số điện thoại là định danh duy nhất của khách hàng trong phạm vi một Tenant. Không cho phép tạo trùng SĐT trong cùng một cửa hàng.
- **BR-02**: `CurrentDebtAR` không được vượt quá `DebtLimit` khi tạo đơn mua nợ tại quầy POS.
- **BR-03**: Số tiền thu nợ trong phiếu thu (`DebtPayment.Amount`) phải lớn hơn 0 và không được vượt quá `CurrentDebtAR`.
- **BR-04**: Khi thu nợ thành công, hệ thống phải tự động tạo một bản ghi `CashbookTransaction` loại `RECEIPT` (Phiếu thu) với danh mục `DebtCollection`.
- **RBAC**:
  - `StoreOwner` / `StoreManager`: Toàn quyền thao tác, bao gồm điều chỉnh `DebtLimit`.
  - `Cashier`: Xem danh sách, tạo khách mới, lập phiếu thu nợ. Không có quyền sửa `DebtLimit`.
