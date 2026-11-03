# EXP-2026-11-02-001: Khảo sát sửa lỗi hiển thị danh sách gói cước động từ Database

## 1. Problem Statement (Tuyên bố vấn đề)
Trên giao diện Chủ gian hàng (`/store-owner/subscriptions?tab=subscriptions`), hệ thống hiển thị 3 thẻ giá cước (Gói hỗ trợ 270k, Gói Doanh Nghiệp Toàn Năng 999k, Gói cao cấp 490k). Tuy nhiên trong cơ sở dữ liệu (`mtgrms_db.SubscriptionPlans`), thực tế chỉ có 2 gói cước là `FREE` (0 đ) và `PRO` (999.000 đ). Người dùng thấy thông tin không nhất quán và thắc mắc tại sao giao diện không render động 100% từ Database lên.

## 2. Context & Background (Bối cảnh & Hiện trạng)
- **Tái hiện**: Khi truy vấn trực tiếp Postgres container `mtgrms-postgres`:
  ```sql
  SELECT "PlanID", "PlanCode", "PlanName", "PriceMonthly" FROM "SubscriptionPlans";
  ```
  Kết quả chỉ trả về 2 dòng:
  1. `plan_pro` | `PRO` | `Gói Doanh Nghiệp (Toàn Năng)` | `999000.00`
  2. `plan_free` | `FREE` | `Gói Cơ Bản (Miễn Phí) 01` | `0.00`
- **Root Cause**:
  Trong `SubscriptionPricingCards.tsx`, component đang khởi tạo state với mảng tĩnh hardcode `SUBSCRIPTION_PLANS` 3 gói từ `storeData.ts`. Khi gọi `storeApi.getPricingPlans()` nhận về 2 gói từ Backend, component dùng `SUBSCRIPTION_PLANS.map(...)` chỉ cập nhật gói `PRO`, giữ nguyên 2 gói mẫu không có trong DB (`SUPPORT` 270k và `VIP` 490k), và bỏ sót gói `FREE` có trong DB.
- **Rủi ro hiện tại**:
  - Không phản ánh đúng gói cước được cấu hình từ Master Admin.
  - Khi Master Admin tạo mới, sửa đổi hoặc xóa gói cước trong DB, giao diện Store Owner không tự động cập nhật số lượng thẻ cước tương ứng.

## 3. Constraints (Ràng buộc kỹ thuật & nghiệp vụ)
- Không phá vỡ giao diện thẻ cước KiotViet hiện hữu (giữ thẩm mỹ nút bấm, khoảng cách, badge, responsive).
- Dữ liệu `PlanSummaryResponse` từ Backend đã có đầy đủ: `Code`, `Name`, `Description`, `MonthlyPrice`, `YearlyPrice`, `Quotas` (MaxBranches, MaxEmployees), `Features` (FefoExpiryAlert, MultiUnitConversion, VietQrDynamic, DebtZaloBook, BarcodeScanning, FinancialReporting).
- Phải có trạng thái Skeleton loading khi API đang tải và Fallback an toàn nếu mất mạng.

## 4. Assumptions (Giả định)
- **[ASSUMPTION]**: Database bảng `SubscriptionPlans` có thể chứa từ 1 đến N gói cước tùy ý do Admin cấu hình.
- **[ASSUMPTION]**: Các gói có `MonthlyPrice == 0` là gói cước Dùng thử / Miễn phí (FREE), nút hành động sẽ hiển thị "Đang dùng" hoặc "Trải nghiệm ngay" thay vì "Mua ngay".
- **[ASSUMPTION]**: Gói có `MonthlyPrice` cao nhất hoặc có cờ đánh dấu sẽ được coi là gói phổ biến/khuyên dùng (Highlight/Border xanh).

## 5. Scope & Non-Goals
### In Scope
- Loại bỏ hoàn toàn mảng tĩnh `SUBSCRIPTION_PLANS` khỏi luồng render của `SubscriptionPricingCards.tsx`.
- Viết hàm chuyển đổi `mapBackendPlanToCardItem` chuyển đổi trực tiếp `BackendPricingPlanResponse` sang thuộc tính hiển thị (tagline, branchNote, features theo quota và module thật).
- Render đúng số lượng thẻ cước theo dữ liệu trả về từ `GET /api/v1/tenant/pricing-plans` (2 thẻ ứng với DB hiện tại).
- Thêm Skeleton Loading khi `isLoading = true` và Empty State khi không có gói cước nào.
- Đảm bảo modal `SubscriptionCheckoutModal.tsx` nhận gói cước động và thực hiện mua thành công.

### Out of Scope (Non-Goals)
- Không thay đổi cấu trúc bảng `SubscriptionPlans` trong database Postgres.
- Không can thiệp vào các trang khác không liên quan đến Store Subscriptions Hub.

## 6. So sánh các phương án giải quyết
- **Phương án 1: Client-side dynamic mapping (Được chọn)**
  - *Cách làm*: Component gọi API `getPricingPlans()`, map trực tiếp từng gói cước thành thẻ giao diện. Bảng màu thẻ gán tự động linh hoạt dựa trên `code` (`FREE`, `SUPPORT`, `PRO`, `VIP`).
  - *Ưu điểm*: Độc lập, không cần sửa đổi schema DB backend, khắc phục triệt để lỗi hiển thị sai lệch, hỗ trợ N gói cước bất kỳ.
  - *Nhược điểm*: Cần hàm sinh màu sắc và nhãn tính năng trực quan ở phía frontend.
- **Phương án 2: Backend lưu metadata màu sắc**
  - *Cách làm*: Thêm cột `ThemeColor`, `Badge` vào bảng `SubscriptionPlans` ở backend.
  - *Ưu điểm*: Backend kiểm soát 100% màu sắc.
  - *Nhược điểm*: Phải tạo migration EF Core, sửa đổi entity Domain và bảng DB, tốn thời gian không cần thiết.

## 7. Success Criteria (Tiêu chí thành công)
- [x] Tái hiện và xác định chính xác root cause.
- [ ] Giao diện hiển thị đúng 2 thẻ cước (`FREE` và `PRO`) khớp với 2 bản ghi trong Database.
- [ ] Khi DB thêm gói mới, giao diện tự động sinh thêm thẻ cước tương ứng.
- [ ] Toàn bộ unit tests và build đều pass.
