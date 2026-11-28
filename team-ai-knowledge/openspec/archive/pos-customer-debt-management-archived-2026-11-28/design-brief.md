# Design Brief: Bán Hàng Ghi Nợ (Bán Nợ) & Thu Nợ Hóa Đơn Quầy POS

## 1. Luồng Người Dùng (User Flows)

### Luồng 1: Bán hàng Ghi nợ tại Quầy POS (`PosCheckoutPage`)
```
[1. Quét sản phẩm] ➔ [2. Chọn khách hàng (F4)] ➔ [3. Xem hạn mức nợ & nợ hiện tại]
➔ [4. Chọn Radio 'Ghi nợ (Bán nợ)'] ➔ [5. Bấm Thanh toán [F9]]
                                               │
                   ┌───────────────────────────┴───────────────────────────┐
                   ▼                                                       ▼
        [Trong hạn mức cho phép]                               [Vượt hạn mức nợ cho phép]
                   │                                                       │
                   │                                          [Modal Cảnh Báo Vượt Hạn Mức]
                   │                                      (Hiển thị số tiền vượt hạn mức)
                   │                                                       │
                   │                                          [Thu ngân bấm: 'Xác Nhận Duyệt Bán Nợ']
                   │                                                       │
                   └───────────────────────────┬───────────────────────────┘
                                               ▼
                              [Tạo Hóa Đơn Trạng Thái Ghi Nợ]
                                               ▼
                              [Mở Bill Nhiệt K80 Ghi Rõ Còn Nợ]
```

### Luồng 2: Thu nợ Hóa đơn tại Quản Lý Hóa Đơn (`InvoiceManagementPage`)
```
[1. Mở Quản Lý Hóa Đơn] ➔ [2. Lọc Hóa Đơn 'Ghi nợ / Còn nợ']
➔ [3. Bấm nút 'Thu nợ' trên dòng hóa đơn hoặc trong Accordion chi tiết]
➔ [4. Mở Modal 'Thu Nợ Hóa Đơn Bán Lẻ']
    - Hiển thị: Tổng tiền, Đã trả trước đó, Số tiền còn nợ
    - Nhập: Số tiền khách thanh toán (hỗ trợ nút 'Trả toàn bộ')
    - Chọn: Phương thức thu (Tiền mặt / Chuyển khoản VietQR)
    - Nhập: Ghi chú phiếu thu (nếu có)
    - Xem: Danh sách lịch sử các đợt thu nợ trước của hóa đơn
➔ [5. Bấm 'Xác Nhận Thu Nợ']
    - Cập nhật số tiền nợ còn lại của hóa đơn
    - Thêm một bản ghi vào lịch sử thu nợ (`debtPayments`)
    - Nếu số nợ còn lại = 0: Chuyển trạng thái hóa đơn sang 'COMPLETED' (Đã tất toán nợ)
    - Toast thông báo thành công và in phiếu thu nếu cần
```

---

## 2. Mở Rộng DTOs & Models

### 2.1. Cập nhật `Customer` (`src/features/pos/types/pos.types.ts`)
```typescript
export interface Customer {
  id: string;
  code: string;
  name: string;
  phone: string;
  address?: string;
  loyaltyPoints: number;
  membershipTier: string;    // 'Khách vãng lai' | 'Hạng Đồng' | 'Hạng Bạc (Người quen)' | 'Hạng Vàng (VIP)'
  debtLimit: number;         // Hạn mức nợ tối đa (VD: 500.000 đ)
  currentDebt: number;       // Nợ hiện tại chưa thanh toán (VD: 150.000 đ)
  allowDebt: boolean;        // Cho phép mua nợ hay không
}
```

### 2.2. Mở Rộng `PaymentMethod`
```typescript
export type PaymentMethod = 'cash' | 'vietqr' | 'debt';
```

### 2.3. Cập nhật `InvoiceDTO` (`src/features/pos/types/inventory.types.ts`)
```typescript
export interface DebtPaymentRecord {
  paymentId: string;
  paidAt: string;
  amount: number;
  paymentMethod: 'CASH' | 'VIETQR';
  cashierName: string;
  note?: string;
}

export class InvoiceDTO {
  // ... các trường sẵn có ...
  paymentMethod: 'CASH' | 'VIETQR' | 'DEBT' = 'CASH';
  debtAmount: number = 0;              // Số tiền còn nợ hiện tại
  paidDebtAmount: number = 0;          // Số tiền nợ đã thu được qua các đợt
  debtPaymentRecords: DebtPaymentRecord[] = []; // Lịch sử các lần thu nợ
}
```

---

## 3. Thành Phần Giao Diện (Components & Modals)

1. **`PosPaymentPanel.tsx`**:
   - Thêm nút Radio `Ghi nợ (Bán nợ)`.
   - Widget thông tin công nợ khách hàng: Thẻ hiển thị Hạn mức nợ, Nợ hiện tại và Nợ dự kiến sau đơn.
   - Kiểm tra ràng buộc: Nếu chưa chọn khách hàng và bấm `Ghi nợ`, hiện thông báo nhắc chọn khách hàng.
2. **`DebtLimitWarningModal.tsx`**:
   - Modal hiển thị khi đơn hàng làm vượt quá hạn mức nợ của khách hàng.
   - Thống kê chi tiết: Hạn mức cho phép, Nợ hiện tại, Tiền đơn này, Tổng nợ sau đơn, Số tiền vượt mức.
   - Hai nút: `Hủy thao tác` & `Xác Nhận Duyệt Bán Nợ`.
3. **`InvoiceManagementPage.tsx`**:
   - Thêm bộ lọc phương thức: `Tất cả` | `Tiền mặt` | `VietQR` | `Ghi nợ (Còn nợ)`.
   - Hiển thị badge nợ nổi bật trong bảng: `Ghi nợ (Còn nợ: 350.000 đ)`.
   - Nút `Thu nợ` tại cột Thao tác và trong phần Accordion chi tiết hóa đơn.
4. **`CollectDebtModal.tsx`**:
   - Modal thu nợ hóa đơn quầy: Nhập số tiền thu, chọn Tiền mặt/VietQR, ghi chú, xem lịch sử thu nợ.
