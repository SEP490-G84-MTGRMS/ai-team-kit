# Design Brief: Phân hệ Frontend Kê khai & Chốt số liệu thuế Hộ kinh doanh (FE-19 Tax Snapshot)

## 1. Kiến trúc Module Frontend (`src/features/tax-snapshot/`)

Tuân thủ kiến trúc Feature-based đồng nhất với `service-expenses`, `customer-crm`, `cashbook`:

```
src/features/tax-snapshot/
├── api/
│   └── taxSnapshotApi.ts           # Gọi API backend (Mock API + REST Client)
├── components/
│   ├── CreateTaxSnapshotModal.tsx   # Modal tạo kỳ tính thuế & xem trước số liệu
│   ├── TaxExportModal.tsx          # Modal hỗ trợ xuất tờ khai thuế (Excel/XML)
│   ├── TaxKPICards.tsx             # 4 thẻ KPI tổng quan nghĩa vụ thuế trong năm
│   ├── TaxSnapshotDetailDrawer.tsx # Drawer xem chi tiết kỳ thuế & danh sách hóa đơn
│   ├── TaxSnapshotFilterBar.tsx    # Thanh công cụ lọc theo Năm, Quý, Trạng thái
│   ├── TaxSnapshotStatusBadge.tsx  # Badge trạng thái (Draft, Finalized, Submitted, Paid)
│   └── TaxSnapshotTable.tsx        # Bảng hiển thị danh sách các kỳ tính thuế
├── hooks/
│   ├── useTaxSnapshotPreview.ts    # Hook tính toán doanh thu & thuế xem trước
│   └── useTaxSnapshots.ts          # Hook quản lý danh sách & thao tác CRUD kỳ thuế
├── pages/
│   └── TaxSnapshotPage.tsx         # Trang chính điều phối phân hệ FE-19
├── types/
│   └── taxSnapshot.ts              # Khai báo TypeScript types & DTOs
└── index.ts                        # Public exports
```

## 2. Thiết kế Dữ liệu & TypeScript Types (`taxSnapshot.ts`)

```typescript
export type TaxSnapshotStatus = 'Draft' | 'Finalized' | 'Submitted' | 'Paid';

export interface TaxSnapshot {
  id: string;
  tenantId: string;
  year: number;
  quarter: number; // 1, 2, 3, 4
  taxableRevenue: number;
  vatRate: number; // Def: 1.00 (%)
  vatAmount: number;
  pitRate: number; // Def: 0.50 (%)
  pitAmount: number;
  totalTaxAmount: number; // vatAmount + pitAmount
  status: TaxSnapshotStatus;
  note?: string;
  ordersCount: number;
  generatedAt: string;
  submittedAt?: string;
}

export interface TaxOrderSummaryItem {
  orderId: string;
  orderCode: string;
  orderDate: string;
  customerName?: string;
  finalAmount: number;
  paymentMethod: string;
}

export interface TaxSnapshotDetail extends TaxSnapshot {
  orders: TaxOrderSummaryItem[];
}

export interface TaxPreviewRequest {
  year: number;
  quarter: number;
}

export interface TaxPreviewResponse {
  year: number;
  quarter: number;
  taxableRevenue: number;
  vatRate: number;
  vatAmount: number;
  pitRate: number;
  pitAmount: number;
  totalTaxAmount: number;
  ordersCount: number;
  orders: TaxOrderSummaryItem[];
  canCreate: boolean;
  warningMessage?: string;
}
```

## 3. Luồng Người Dùng & Tương Tác UI (User Flow)

1. **Xem tổng quan & Danh sách:**
   - Người dùng truy cập trang `/admin/tax-snapshots`.
   - Hệ thống hiển thị 4 KPI Cards: Doanh thu chịu thuế lũy kế, Thuế GTGT đã tính (1%), Thuế TNCN đã tính (0.5%), Tổng thuế đã nộp / Còn phải nộp.
   - Bảng hiển thị danh sách các kỳ tính thuế đã chốt trong hệ thống.
2. **Khởi tạo kỳ tính thuế mới:**
   - Người dùng bấm nút **"+ Tạo kỳ tính thuế"**.
   - Modal mở ra: Người dùng chọn Năm và Quý (mặc định chọn quý gần nhất vừa kết thúc).
   - Hệ thống tự động tính toán số liệu xem trước (`TaxPreviewResponse`), hiển thị tổng doanh thu từ hóa đơn `Paid` và số thuế tạm tính.
   - Người dùng bấm **"Lưu nháp (Draft)"** hoặc **"Chốt kỳ thuế (Finalized)"**.
3. **Xem chi tiết & Vòng đời tờ khai:**
   - Bấm vào một dòng kỳ thuế -> Mở Drawer chi tiết:
     - Thống kê tỷ lệ phân bổ thuế.
     - Danh sách bảng kê các đơn hàng cấu thành.
     - Nút hành động:
       - Nếu là `Draft`: Có nút "Chốt số liệu" (`Finalized`) hoặc "Xóa nháp".
       - Nếu là `Finalized`: Có nút "Đánh dấu Đã nộp thuế" (`Submitted`) và "Xuất tờ khai Form 01/CNKD".
4. **Xuất tờ khai:**
   - Bấm "Xuất tờ khai" -> Hỗ trợ tải file bảng kê Excel hoặc XML mẫu phục vụ nộp thuế điện tử.

## 4. API Endpoints Contract

- `GET /api/v1/tax-snapshots`: Lấy danh sách kỳ thuế của Tenant (kèm filter `year`, `quarter`, `status`).
- `GET /api/v1/tax-snapshots/{id}`: Lấy chi tiết kỳ thuế và bảng kê hóa đơn đi kèm.
- `POST /api/v1/tax-snapshots/preview`: Tính toán xem trước doanh thu và thuế theo Quý/Năm.
- `POST /api/v1/tax-snapshots`: Tạo bản ghi kỳ thuế mới (`Draft` hoặc `Finalized`).
- `PUT /api/v1/tax-snapshots/{id}/status`: Cập nhật trạng thái (`Finalized`, `Submitted`, `Paid`).
- `DELETE /api/v1/tax-snapshots/{id}`: Xóa kỳ thuế nháp (chỉ áp dụng khi `Draft`).

## 5. Quy Tắc Nghiệp Vụ & Phân Quyền (Business Rules)
- **BR-01 (Công thức thuế HKD):** $\text{VAT} = \text{TaxableRevenue} \times 1\%$; $\text{PIT} = \text{TaxableRevenue} \times 0.5\%$.
- **BR-02 (Tính bất biến):** Kỳ thuế ở trạng thái `Finalized` hoặc `Submitted` tuyệt đối không được sửa hoặc xóa.
- **BR-03 (Duy nhất theo kỳ):** Trong cùng một Năm và Quý, mỗi Tenant chỉ tồn tại 1 kỳ thuế hiệu lực.
- **BR-04 (Phân quyền):** Chỉ `StoreOwner` và `Accountant` mới có quyền truy cập màn hình này.
