# Design Brief: Tái Cấu Trúc Hệ Thống Gói Cước SaaS MT-GRMS (Mốc Giá 99k)

## 1. Luồng Người Dùng & Bảng Giá Mới

```mermaid
flowchart TD
    subgraph Gia["BẢNG GIÁ ĐỘT PHÁ MT-GRMS"]
        T["🏬 GÓI THƯỜNG: 99.000 đ/tháng (~3.300 đ/ngày)<br/>• 1 Chi nhánh kiêm kho<br/>• 1 Tài khoản chủ shop<br/>• Mua thêm Option Quản lý nhân viên: +30.000 đ/tháng"]
        P["🏢 GÓI PRO: 249.000 đ/tháng<br/>• Mặc định sẵn 2 Chi nhánh kiêm kho<br/>• Đã bao gồm toàn bộ tính năng nhân viên không giới hạn<br/>• Mua thêm chi nhánh: +80.000 đ/chi nhánh/tháng"]
    end

    Trial["⏳ DÙNG THỬ 3 NGÀY GÓI PRO FULL TÍNH NĂNG KHI ĐĂNG KÝ MỚI"] --> Gia
```

---

## 2. Giao Diện & Trạng Thái Màn Hình (UI Components & States)

### A. Thẻ Bảng Giá (`SubscriptionPricingCards.tsx`):
1. **Gói Thường (99.000 đ/tháng)**:
   - Badge: "Tiết kiệm - 1 Cửa hàng".
   - Giá: **99.000 đ / tháng** (Giá năm: 1.188.000 đ / năm).
   - Đặc điểm: 1 Chi nhánh độc lập (Bán hàng & Kho tại chỗ).
   - Quản lý nhân viên: Tùy chọn mua thêm (+30k/tháng).
   - Nút hành động: "Đăng ký gói này".
2. **Gói Pro (249.000 đ/tháng)** - *Highlight viền xanh / vương miện*:
   - Badge: "Khuyên dùng - Chuỗi bán lẻ".
   - Giá: **249.000 đ / tháng** (Giá năm: 2.988.000 đ / năm).
   - Đặc điểm: **Mặc định sẵn 2 Chi nhánh**.
   - **Đã bao gồm sẵn tính năng Quản lý & Phân quyền nhân viên**.
   - Mua thêm chi nhánh: +80.000 đ/chi nhánh/tháng.
   - Nút hành động: "Nâng cấp chuỗi".

### B. Cửa Sổ Thanh Toán (`SubscriptionCheckoutModal.tsx`):
- **Bỏ hoàn toàn**: Stepper "Kho phụ (+150k)".
- **Động theo gói cước**:
  - Khi `planCode == 'STANDARD'`:
    - Hiện checkbox: `[ ] Mua thêm tính năng Quản lý & Phân quyền nhân viên (+30.000 đ/tháng)`.
    - Ẩn stepper thêm chi nhánh.
  - Khi `planCode == 'PRO'`:
    - Hiện stepper: `Số chi nhánh mua thêm: [ - ] {extraBranches} [ + ] (+80.000 đ/tháng/chi nhánh)`.
    - Ghi chú: *"Mặc định gói đã bao gồm sẵn 2 chi nhánh và toàn bộ tính năng nhân viên"*.
- **Chu kỳ**: 6 tháng (chuẩn), 12 tháng (+1m tặng = 13 tháng), 24 tháng (+3m tặng = 27 tháng).
- **Thuế GTGT (VAT 10%)**: Tự động tính trên tổng hóa đơn.

---

## 3. Thay Đổi Database (Schema & Migration)

### A. Bảng `Tenants` (Entity: `MT_GRMS.Domain.Entities.SaaS.Tenant`):
| Tên cột | Kiểu dữ liệu | Mặc định | Ý nghĩa |
| :--- | :--- | :--- | :--- |
| `ExtraBranches` | `int` | `0` | Số chi nhánh mua thêm (áp dụng cho Gói Pro) |
| `HasStaffManagementAddon` | `bool` | `false` | Cờ mua thêm tính năng Quản lý nhân viên (Gói Thường) |
| `SubscriptionStatus` | `varchar(20)` | `'TRIAL'` | Trạng thái: `'TRIAL'`, `'ACTIVE'`, `'EXPIRED'`, `'SUSPENDED'` |

### B. Bảng `SubscriptionPlans` (Seed Data trong `DbInitializer.cs`):
```csharp
// 1. Gói Thường
new SubscriptionPlan
{
    Id = "plan_standard",
    PlanCode = "STANDARD",
    PlanName = "Gói Thường (Cửa Hàng Độc Lập)",
    PriceMonthly = 99000.00m,
    PriceYearly = 1188000.00m,
    MaxBranches = 1,
    MaxStaff = 1, // Chủ shop; mở thêm qua addon
    EnabledModulesJson = "[\"Catalog\",\"Pos\",\"Inventory\",\"Finance\"]",
    IsActive = true
};

// 2. Gói Pro
new SubscriptionPlan
{
    Id = "plan_pro",
    PlanCode = "PRO",
    PlanName = "Gói Pro (Chuỗi Cửa Hàng)",
    PriceMonthly = 249000.00m,
    PriceYearly = 2988000.00m,
    MaxBranches = 2, // Mặc định sẵn 2 chi nhánh
    MaxStaff = 100, // Đã bao gồm nhân viên
    EnabledModulesJson = "[\"Catalog\",\"Pos\",\"Inventory\",\"Supplier\",\"Finance\",\"HR\",\"Tax\",\"MultiBranch\"]",
    IsActive = true
};
```

---

## 4. API Endpoints & Request/Response Contracts

### A. `POST /api/tenant/subscriptions/purchase`
- **Request Body DTO**:
  ```csharp
  public record PurchaseSubscriptionRequest(
      string PlanCode,
      int Months,
      int ExtraBranches = 0,
      bool HasStaffManagementAddon = false,
      string PaymentMethod = "WALLET"
  );
  ```
- **Logic Tính Tiền (Áp Dụng Mức Giá Mới)**:
  ```csharp
  var basePrice = plan.PriceMonthly * months;
  var branchAddonPrice = request.ExtraBranches * 80000m * months;
  var staffAddonPrice = (plan.PlanCode == "STANDARD" && request.HasStaffManagementAddon)
      ? 30000m * months
      : 0m;
  var subTotal = basePrice + branchAddonPrice + staffAddonPrice;
  var vatAmount = Math.Round(subTotal * 0.1m, 0);
  var grandTotal = subTotal + vatAmount;
  ```
