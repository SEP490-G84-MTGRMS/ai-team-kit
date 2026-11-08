# EXP-2026-11-08-001: Khám Phá & Đánh Giá Mô Hình 2 Gói Cước SaaS MT-GRMS

## 1. Hiện Trạng Hệ Thống & Vấn Đề (Context & Problem Statement)

### A. Hiện trạng mã nguồn liên quan:
- **Backend**:
  - `SubscriptionPlan.cs`: Thực thể lưu gói cước SaaS, hiện chỉ lưu `PlanCode`, `PlanName`, `PriceMonthly`, `PriceYearly`, `MaxBranches`, `MaxStaff`, `EnabledModulesJson`.
  - `DbInitializer.cs` (dòng 702-732): Chỉ nạp 2 gói `FREE` (0đ, 1 chi nhánh, 3 nhân viên) và `PRO` (999.000đ, 10 chi nhánh, 100 nhân viên).
  - `Tenant.cs`: Lưu thông tin khách thuê nhưng **chưa có các cột** lưu số chi nhánh mua thêm (`ExtraBranches`), cờ mua thêm nhân viên (`HasStaffManagementAddon`), và trạng thái dùng thử (`SubscriptionStatus`).
  - `BranchService.cs` (`GetBranchQuotaAsync`): Đang tính hạn mức cố định theo `Plan.MaxBranches`. Khi tenant có gói là `SUPPORT` thì bị fallback về `maxBranches = 1`.
  - `TenantStoreController.cs` (`subscriptions/purchase`): Đang tính addon kho phụ (`request.ExtraWarehouses * 150000m`) và chưa cộng dồn hạn mức chi nhánh vào Tenant.
- **Frontend**:
  - `storeData.ts`: Khai báo cứng 3 gói `SUPPORT` (270k), `PRO` (330k), `PREMIUM` (490k).
  - `SubscriptionPricingCards.tsx`: Hiển thị gói Free 0đ và map dữ liệu không đồng nhất.
  - `SubscriptionCheckoutModal.tsx`: Có ô nhập "Kho phụ (+150k)" không đúng với nghiệp vụ thực tế.

### B. Vấn đề cốt lõi cần giải quyết:
1. Gói miễn phí vĩnh viễn (Free forever) không phù hợp với thực tế kinh doanh SaaS B2B cho siêu thị tạp hóa; cần chuyển sang **Dùng thử (Trial) 3 ngày full tính năng**.
2. Mô hình bán lẻ tạp hóa: **Mỗi chi nhánh sinh ra vừa là điểm bán POS vừa là kho hàng lưu trữ tại chỗ**, không có chi nhánh nào là kho riêng biệt. Vì vậy cần bỏ hẳn addon "Kho phụ".
3. Cần phân định ranh giới 2 gói rõ ràng:
   - **Gói Thường**: 1 chi nhánh độc lập, không quản lý chuỗi; muốn dùng quản lý nhân viên thì mua thêm Option.
   - **Gói Pro**: Dành cho chuỗi; mặc định sẵn 2 chi nhánh + bao gồm sẵn tính năng quản lý nhân viên; mua thêm chi nhánh thì trả thêm phí.

---

## 2. Assumptions (Giả Định)
- **[ASSUMPTION-01]**: Mỗi chi nhánh (`Branch`) luôn gắn liền với tồn kho và quầy bán hàng tại địa điểm đó. Không tách biệt thực thể Kho độc lập khỏi Chi nhánh.
- **[ASSUMPTION-02]**: Khách hàng mới đăng ký tài khoản tự động được gán gói `PRO` ở chế độ `TRIAL` với thời hạn chính xác là 3 ngày (`DateTime.UtcNow.AddDays(3)`).
- **[ASSUMPTION-03]**: Hết 3 ngày dùng thử, hệ thống chuyển trạng thái `EXPIRED` và yêu cầu chọn thanh toán Gói Thường hoặc Gói Pro để tiếp tục sử dụng.

---

## 3. Scope & Non-Goals
### In Scope:
- Thống nhất danh mục 2 gói: Gói Thường (`STANDARD`) và Gói Doanh Nghiệp (`PRO`).
- Bỏ trường nhập "Kho phụ" trên Frontend và Backend DTO.
- Bổ sung trường `ExtraBranches`, `HasStaffManagementAddon`, `SubscriptionStatus` trong `Tenant`.
- Cập nhật công thức tính tiền và cộng dồn hạn mức chi nhánh trong `TenantStoreController`.
- Cập nhật `BranchService.GetBranchQuotaAsync` để tính hạn mức: `Quota = Plan.MaxBranches + Tenant.ExtraBranches`.

### Non-Goals:
- Không thay đổi nghiệp vụ bán hàng POS hay luân chuyển nội bộ FEFO.
- Không tích hợp thêm cổng thanh toán thẻ quốc tế mới (duy trì Ví gian hàng và VietQR Napas247).

---

## 4. Các Phương Án Xem Xét (Evaluated Options)

### Phương án 1: Giữ nguyên 3 gói (Cơ bản 0đ, Hỗ trợ 270k, Doanh nghiệp 999k)
- **Ưu điểm**: Không cần đổi cấu trúc Frontend hiện có nhiều.
- **Nhược điểm**: Lãng phí tài nguyên cho tài khoản rác (gói 0đ); bước nhảy từ 270k lên 999k quá lớn; duy trì option "Kho phụ" gây hiểu nhầm nghiệp vụ.

### Phương án 2 (ĐƯỢC CHỌN): Tinh gọn thành 2 Gói chuẩn hóa (Thường 270k & Pro 490k + Dùng thử 3 ngày)
- **Cấu hình**:
  - Gói Thường: 270.000 đ/tháng, 1 chi nhánh (Bán + Kho), Option Nhân viên +80.000 đ/tháng.
  - Gói Pro: 490.000 đ/tháng, mặc định sẵn 2 chi nhánh, miễn phí tính năng nhân viên, mua thêm chi nhánh +200.000 đ/chi nhánh/tháng.
  - Bỏ "Kho phụ", dùng thử 3 ngày gói Pro cho khách mới.
- **Ưu điểm**:
  - Đúng chuẩn mô hình bán lẻ thực tế (KiotViet, Sapo).
  - Phân tầng giá hấp dẫn (270k vs 490k), kích thích khách hàng chuỗi nâng cấp lên Pro.
  - Quy tắc kiểm tra Quota chi nhánh và tính tiền mạch lạc, triệt tiêu mọi lỗi lệch pha giữa FE và BE.
- **Nhược điểm**: Cần cập nhật đồng bộ cả Seeder CSDL, Entity, API Controller và Form Modal.

---

## 5. Rủi Ro & Biện Pháp Giảm Thiểu (Risks & Mitigations)
- **Rủi ro**: Dữ liệu tenant cũ đang mang `CurrentPlan = "FREE"` hoặc `CurrentPlan = "SUPPORT"`.
  - **Cách xử lý**: Viết migration / update script trong `DbInitializer` để map `FREE` / `SUPPORT` sang `STANDARD` hoặc `TRIAL` an toàn.
- **Rủi ro**: Khách hàng đang có nhiều hơn 1 chi nhánh nếu hạ cấp xuống Gói Thường.
  - **Cách xử lý**: Khóa chức năng tạo thêm chi nhánh, giữ nguyên các chi nhánh cũ ở trạng thái hoạt động (Read-only / Không cho thêm mới).
