# Design Brief: admin-service-plans-management

## 1. Kiến trúc Giao diện & Hệ thống Design System
Tái sử dụng 100% token và class có sẵn trong `src/styles/admin.css` và `src/index.css`:
- **Bảng màu chủ đạo**:
  - Primary Deep Teal: `#0F766E` (`--blue-primary`)
  - Primary Hover: `#115E59` (`--blue-hover`)
  - Bề mặt mềm (Surfaces): `#FFFFFF` (Card) & `var(--bg-soft-blue)` (Background)
  - Viền chuẩn đồng bộ: `1px solid #cbd5e1` cho toàn bộ toolbar, inputs, selects
  - Viền bảng: `1px solid var(--border-light)` (`#edf2f9`) và header `#f8fafc`
- **Typography & Con số**:
  - Font văn bản: `'Be Vietnam Pro', sans-serif`
  - Font số liệu, tiền tệ và mã gói: `'JetBrains Mono', monospace` kèm `font-variant-numeric: tabular-nums`
- **Hệ thống Bo góc (Border Radius Scale)**:
  - Khung Toolbar & Table Card: `border-radius: 10px`
  - Ô nhập liệu & Selects: `border-radius: 8px`
  - Nút bấm hành động & Tag: `border-radius: 6px` - `8px`
  - Huy hiệu trạng thái (Badges): `border-radius: var(--radius-pill)`

## 2. Cấu trúc Thành phần (Component Hierarchy)

```
src/
├── features/admin/
│   ├── types/
│   │   └── plan.types.ts                 # Kiểu dữ liệu SubscriptionPlan, Quota, Filter...
│   ├── data/
│   │   └── mockPlanData.ts               # Dữ liệu mẫu 4 gói cước chuẩn
│   └── components/
│       └── subscriptions/
│           ├── index.ts                  # Barrel export
│           ├── PlanKPIBanner.tsx         # 4 thẻ KPI thống kê tình hình gói cước
│           ├── PlanFilterToolbar.tsx     # Thanh tìm kiếm, dropdown trạng thái, nút Tạo gói & Xuất Excel
│           ├── PlanDataTable.tsx         # Bảng hiển thị danh sách gói, checkbox, action buttons
│           ├── CreatePlanModal.tsx       # Popup 3 phần khởi tạo gói mới
│           ├── UpdatePlanModal.tsx       # Popup cập nhật thông tin & quota gói cước
│           └── PlanDetailModal.tsx       # Popup hồ sơ kỹ thuật & danh sách tenant đang thuê
└── pages/admin/
    └── SubscriptionPlanPage.tsx          # Trang quản trị chính tích hợp các components
```

## 3. Luồng Tương tác & Trạng thái UI (States & UX Flows)

### 3.1. Trang danh sách (`SubscriptionPlanPage`)
- **KPI Banner**:
  - `Tổng số gói`: Tổng số gói hiện có trên hệ thống (VD: 4 gói).
  - `Đang mở bán (Active)`: Số gói đang cho phép khách hàng mới đăng ký (VD: 3 gói - màu xanh lá `#059669`).
  - `Tạm ngừng bán (Inactive)`: Số gói cũ ngừng phân phối (VD: 1 gói - màu cam `#d97706`).
  - `Tổng Tenant đang thuê`: Tổng số khách hàng đang duy trì hợp đồng (VD: 128 tenants).
- **Thanh lọc Toolbar (`PlanFilterToolbar`)**:
  - Ô tìm kiếm mã gói (`PLAN_...`) hoặc tên gói cước (debounce 250ms).
  - Dropdown lọc trạng thái: `Tất cả trạng thái`, `Đang mở bán (Active)`, `Tạm ngừng bán (Inactive)`.
  - Nút `+ Tạo gói mới` (màu Deep Teal `#0F766E`) kích hoạt `CreatePlanModal`.
  - Nút `Xuất Excel` tải tệp danh mục gói cước.
- **Bảng dữ liệu (`PlanDataTable`)**:
  - Checkbox chọn tất cả / từng hàng.
  - Cột: Mã gói (Mono), Tên gói, Đơn giá/tháng, Đơn giá/năm (tiết kiệm 15-20%), Hạn mức chi nhánh & nhân sự, Số Tenant đang dùng, Trạng thái mở bán (Switch hoặc Badge), Hành động.
  - Nút hành động: `Chi tiết`, `Chỉnh sửa`, `Ngừng bán/Mở bán`.
  - Empty state khi không tìm thấy kết quả.

### 3.2. Modal Khởi tạo / Chỉnh sửa Gói cước (`CreatePlanModal` / `UpdatePlanModal`)
Được thiết kế gồm 3 khối nội dung rõ ràng:
1. **Thông tin Cơ bản & Bảng giá**:
   - Tên gói (VD: Gói Nâng Cao - Advanced Mart).
   - Mã gói (Tự động in hoa, VD: `PLAN_ADVANCED`).
   - Đơn giá tháng (VNĐ) và Đơn giá năm (VNĐ).
   - Mô tả ngắn gọn nhóm đối tượng tiệm tạp hóa phù hợp.
2. **Định ngạch Kỹ thuật (Technical Quotas)**:
   - Số chi nhánh tối đa (VD: 3 chi nhánh; hoặc không giới hạn `-1`).
   - Số tài khoản nhân viên / thu ngân tối đa (VD: 10 nhân viên).
   - Dung lượng lưu trữ Database tối đa (VD: 5 GB, 20 GB).
   - Tần suất sao lưu tự động (Hàng ngày, Hàng tuần).
3. **Module Tính năng Nghiệp vụ Cốt lõi**:
   - Toggle switches bật/tắt: Quản lý cận hạn FEFO 3 mức màu, Quét mã vạch Barcode, Quy đổi Đa đơn vị thùng/lon, VietQR động khớp tiền tự động, Sổ nợ Zalo & Bán hàng nợ, Báo cáo tài chính & Sổ quỹ.

### 3.3. Modal Xem chi tiết Gói cước (`PlanDetailModal`)
- Tab 1: Thông số kỹ thuật & Danh mục tính năng (Thanh tiến trình Quota, danh sách module bật).
- Tab 2: Danh sách các Tenant đang sử dụng gói này (Mã subdomain, Tên chuỗi, Ngày kích hoạt, Hạn hợp đồng).

## 4. Đặc tả Dữ liệu (TypeScript Types)
```typescript
export type PlanStatus = 'Active' | 'Inactive';
export type BackupFrequency = 'Daily' | 'Weekly' | 'Hourly';

export interface PlanQuotaConfig {
  maxBranches: number;      // -1: Unlimited
  maxEmployees: number;     // -1: Unlimited
  maxStorageGb: number;
  backupFrequency: BackupFrequency;
}

export interface PlanFeatureConfig {
  fefoExpiryAlert: boolean;
  multiUnitConversion: boolean;
  vietQrDynamic: boolean;
  debtZaloBook: boolean;
  barcodeScanning: boolean;
  financialReporting: boolean;
}

export interface SubscriptionPlan {
  id: string;
  code: string;             // PLAN_STARTER, PLAN_BASIC, PLAN_ADVANCED, PLAN_ENTERPRISE
  name: string;
  description: string;
  monthlyPrice: number;     // VNĐ / tháng
  yearlyPrice: number;      // VNĐ / năm
  status: PlanStatus;
  activeTenantCount: number;
  quotas: PlanQuotaConfig;
  features: PlanFeatureConfig;
  createdAt: string;
  updatedAt: string;
}
```
