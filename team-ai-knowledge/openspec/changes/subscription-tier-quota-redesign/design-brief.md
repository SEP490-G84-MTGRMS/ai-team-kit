# Design Brief: Tái Cấu Trúc Hệ Thống Gói Cước SaaS MT-GRMS

## 1. Luồng Người Dùng (User Flows)

```mermaid
sequenceDiagram
    actor Owner as Chủ Cửa Hàng
    participant FE as Frontend UI (Modal / Bảng giá)
    participant BE as Backend API (TenantStoreController)
    participant DB as PostgreSQL (Tenants / SubscriptionPlans)

    Note over Owner, DB: Luồng 1: Đăng ký mới & Trải nghiệm dùng thử (3 Ngày)
    Owner->>BE: Đăng ký tài khoản Tenant mới
    BE->>DB: Khởi tạo Tenant (CurrentPlan='PRO', Status='TRIAL', ExpiresAt=Now + 3 ngày)
    BE-->>FE: Đăng nhập thành công, Header hiển thị: "⏳ Dùng thử còn 3 ngày"

    Note over Owner, DB: Luồng 2: Xem Bảng Giá & Nâng Cấp Gói Thường / Pro
    Owner->>FE: Truy cập trang "Gói dịch vụ"
    FE->>BE: GET /api/tenant/pricing-plans
    BE-->>FE: Danh sách 2 gói: STANDARD (270k) & PRO (490k)
    Owner->>FE: Bấm chọn "Gói Thường" hoặc "Gói Pro"
    FE->>FE: Mở SubscriptionCheckoutModal thích ứng theo gói

    alt Khách chọn Gói Thường (270k)
        FE->>Owner: Hiển thị Checkbox: "[ ] Mua thêm tính năng Quản lý nhân viên (+80.000 đ/tháng)"
        Note over FE: Ẩn Stepper "Thêm chi nhánh" (Cố định 1 chi nhánh)
    else Khách chọn Gói Pro (490k)
        FE->>Owner: Hiển thị Stepper: "[ - ] Thêm chi nhánh [ + ] (+200.000 đ/tháng/chi nhánh)"
        Note over FE: Badge "✓ Đã bao gồm miễn phí Quản lý nhân viên"
    end

    Owner->>FE: Chọn chu kỳ (6m, 12m + 1m tặng, 24m + 3m tặng) & Bấm "Xác nhận thanh toán"
    FE->>BE: POST /api/tenant/subscriptions/purchase
    BE->>DB: Trừ tiền ví (nếu chọn WALLET) / Tạo QR VietQR
    BE->>DB: Cập nhật Tenant: CurrentPlan, ExtraBranches, HasStaffManagementAddon, ExpiresAt
    BE-->>FE: Trả kết quả 200 OK, cập nhật thời hạn & Quota tức thì
```

---

## 2. Giao Diện & Trạng Thái Màn Hình (UI Components & States)

### A. Thẻ Bảng Giá (`SubscriptionPricingCards.tsx`):
- **Hiển thị 2 Thẻ đối xứng**:
  1. **Gói Thường (270.000 đ/tháng)**:
     - Badge: "Tiêu chuẩn - 1 Cửa hàng".
     - Đặc điểm: 1 Chi nhánh độc lập (Bán hàng & Kho tại chỗ).
     - Quản lý nhân viên: Tùy chọn mua thêm (+80k/tháng).
     - Không hỗ trợ quản lý chuỗi.
  2. **Gói Pro (490.000 đ/tháng)** - *Highlight viền xanh / vương miện*:
     - Badge: "Khuyên dùng - Chuỗi bán lẻ".
     - Đặc điểm: **Mặc định sẵn 2 Chi nhánh**.
     - **Đã bao gồm sẵn tính năng Quản lý & Phân quyền nhân viên**.
     - Mua thêm chi nhánh: +200.000 đ/chi nhánh/tháng.
- **Trạng thái**:
  - *Loading*: Skeleton loading 2 thẻ.
  - *Current Plan Badge*: Thẻ gói khách hàng đang sử dụng sẽ có badge "✓ Gói hiện tại đang dùng".

### B. Cửa Sổ Thanh Toán (`SubscriptionCheckoutModal.tsx`):
- **Bỏ hoàn toàn**: Stepper "Kho phụ (+150k)".
- **Động theo gói cước**:
  - Khi `planCode == 'STANDARD'`:
    - Hiện checkbox: `[ ] Mua thêm tính năng Quản lý & Phân quyền nhân viên (+80.000 đ/tháng)`.
  - Khi `planCode == 'PRO'`:
    - Hiện stepper: `Số chi nhánh mua thêm: [ - ] {extraBranches} [ + ] (+200.000 đ/tháng/chi nhánh)`.
    - Dòng ghi chú: *"Mặc định gói đã bao gồm sẵn 2 chi nhánh và toàn bộ tính năng nhân viên"*.
- **Phương thức thanh toán**:
  - *Ví gian hàng (Wallet)*: Tự động so sánh số dư `walletBalance` với `grandTotal`. Nếu thiếu tiền hiện alert đỏ và chặn submit.
  - *Quét mã VietQR*: Hiển thị mã VietQR động kèm cú pháp chuyển khoản tự động.

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
    PriceMonthly = 270000.00m,
    PriceYearly = 2700000.00m,
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
    PriceMonthly = 490000.00m,
    PriceYearly = 4900000.00m,
    MaxBranches = 2, // Mặc định sẵn 2 chi nhánh
    MaxStaff = 100, // Đã bao gồm nhân viên
    EnabledModulesJson = "[\"Catalog\",\"Pos\",\"Inventory\",\"Supplier\",\"Finance\",\"HR\",\"Tax\",\"MultiBranch\"]",
    IsActive = true
};
```

---

## 4. API Endpoints & Request/Response Contracts

### A. `GET /api/tenant/pricing-plans`
- **Response**: Trả về danh sách gói hoạt động (`STANDARD` và `PRO`).

### B. `POST /api/tenant/subscriptions/purchase`
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
- **Logic Tính Tiền**:
  ```csharp
  var basePrice = plan.PriceMonthly * months;
  var branchAddonPrice = request.ExtraBranches * 200000m * months;
  var staffAddonPrice = (plan.PlanCode == "STANDARD" && request.HasStaffManagementAddon)
      ? 80000m * months
      : 0m;
  var subTotal = basePrice + branchAddonPrice + staffAddonPrice;
  var vatAmount = Math.Round(subTotal * 0.1m, 0);
  var grandTotal = subTotal + vatAmount;
  ```
- **Logic Cập Nhật Tenant**:
  ```csharp
  tenant.CurrentPlan = plan.PlanCode;
  tenant.SubscriptionExpiresAt = newExpiresAt;
  tenant.SubscriptionStatus = "ACTIVE";
  if (plan.PlanCode == "PRO")
  {
      tenant.ExtraBranches += request.ExtraBranches;
      tenant.HasStaffManagementAddon = true;
  }
  else
  {
      if (request.HasStaffManagementAddon)
          tenant.HasStaffManagementAddon = true;
  }
  ```

### C. `GET /api/branches/quota` (Tại `BranchService.cs`)
- **Công thức tính hạn mức mới**:
  ```csharp
  var maxBranches = plan.MaxBranches + tenant.ExtraBranches;
  var canAddMore = usedBranches < maxBranches;
  ```
