# Proposal: subscription-tier-quota-redesign

## Vấn đề
Hiện tại hệ thống SaaS của MT-GRMS gặp các bất cập lớn về mô hình gói cước và phân bổ tài nguyên:
1. **Lệch pha dữ liệu và gói cước**: Database backend chỉ seed 2 gói `FREE` (0đ) và `PRO` (999.000đ), trong khi giao diện hiển thị "Gói Hỗ Trợ" (270.000đ). Khi khách hàng có gói cước là `SUPPORT`, backend kiểm tra hạn mức chi nhánh không tìm thấy gói và fallback về hạn mức 1 chi nhánh.
2. **Sai lệch mô hình thực tế**: Hệ thống đang cho dùng miễn phí vĩnh viễn (Free forever) và tách riêng tiện ích "Kho phụ (+150k)", trong khi thực tế mô hình tạp hóa / siêu thị mini mỗi chi nhánh vật lý vừa là điểm bán hàng POS vừa kiêm luôn kho hàng lưu trữ tại chỗ (không tồn tại chi nhánh chỉ làm kho đơn thuần).
3. **Chưa phân tầng tính năng nhân viên & chi nhánh hợp lý**: Gói thường và gói Pro chưa có sự phân định ranh giới rõ ràng về quản lý nhân viên và số lượng chi nhánh chuỗi.

## Mục tiêu
1. **Xóa bỏ gói miễn phí vĩnh viễn**, thay bằng cơ chế **Dùng thử (Trial) 3 ngày full tính năng** khi đăng ký tài khoản mới. Hết 3 ngày sẽ yêu cầu thanh toán gói cước để tiếp tục sử dụng.
2. **Chuẩn hóa danh mục thành 2 gói cước chính thức**:
   - **Gói Thường (270.000 đ/tháng)**: Dành cho 1 chi nhánh độc lập (bán hàng + kho). Mặc định 1 tài khoản chủ shop; muốn dùng tính năng Quản lý & Phân quyền nhân viên thì mua thêm Option (+80.000 đ/tháng).
   - **Gói Pro (490.000 đ/tháng)**: Dành cho chuỗi bán lẻ. Mặc định có sẵn **2 chi nhánh**, bao gồm sẵn tính năng Quản lý nhân viên; mua thêm chi nhánh tính +200.000 đ/chi nhánh/tháng.
3. **Loại bỏ khái niệm "Kho phụ"**, thống nhất 1 chi nhánh = 1 điểm bán kiêm kho hàng.
4. **Đồng bộ hóa toàn diện** từ Database, Backend DTO/API tính giá và kiểm tra Quota, đến giao diện Bảng giá (`SubscriptionPricingCards`) và Modal thanh toán (`SubscriptionCheckoutModal`).

## Phạm vi
### In scope:
- **Database & Backend**:
  - Cập nhật hạt giống dữ liệu (`DbInitializer.cs`) với 2 gói: `STANDARD` (270k) và `PRO` (490k).
  - Bổ sung trường `ExtraBranches`, `HasStaffManagementAddon`, `SubscriptionStatus` ('TRIAL', 'ACTIVE', 'EXPIRED') vào bảng `Tenants`.
  - Cập nhật logic tính tiền mua gói & gia hạn tại `TenantStoreController.PurchaseSubscription` (chu kỳ 6m, 12m + 1m tặng, 24m + 3m tặng; tính VAT 10%; cộng dồn `ExtraBranches` khi mua gói Pro).
  - Cập nhật kiểm tra hạn mức tại `BranchService.GetBranchQuotaAsync`: tổng chi nhánh cho phép = `Plan.MaxBranches + Tenant.ExtraBranches`.
- **Frontend**:
  - Cập nhật bảng giá `SubscriptionPricingCards.tsx`: Bỏ gói Free 0đ, hiển thị 2 gói Thường (270k) và Pro (490k) với mô tả tính năng chuẩn.
  - Cập nhật Modal thanh toán `SubscriptionCheckoutModal.tsx`: Bỏ ô "Kho phụ", tự động hiển thị Option "Thêm nhân viên" cho gói Thường và Stepper "Thêm chi nhánh" cho gói Pro.
  - Cập nhật hiển thị thời hạn và hạn mức chi nhánh tại trang Quản lý chi nhánh (`BranchManagement.tsx`).

### Out of scope:
- Tích hợp cổng thanh toán trực tiếp ngân hàng qua Payment Gateway bên thứ 3 (giữ nguyên cơ chế Trừ tiền ví gian hàng và Hiển thị mã VietQR tĩnh/động như hiện tại).
- Thay đổi cấu trúc nghiệp vụ nội bộ của các module POS, FEFO, Báo cáo tài chính.

## Người dùng liên quan
- **Chủ cửa hàng (Store Owner / Tenant Admin)**: Xem thông tin gói cước, đăng ký dùng thử 3 ngày, gia hạn / nâng cấp gói, mua thêm chi nhánh hoặc option quản lý nhân viên.
- **Quản trị viên hệ thống (SaaS Master Admin)**: Cấu hình và quản lý các gói dịch vụ trên toàn hệ thống.

## Tiêu chí thành công
- [ ] Tài khoản mới tạo được cấp trạng thái Dùng thử 3 ngày (`TRIAL`) với đầy đủ quyền hạn.
- [ ] Bảng giá hiển thị đúng 2 gói: Gói Thường (270.000 đ/tháng) và Gói Pro (490.000 đ/tháng), không còn gói Free 0đ.
- [ ] Modal thanh toán không còn trường "Kho phụ". Gói Thường có option "Quản lý nhân viên (+80k)", Gói Pro có stepper "Thêm chi nhánh (+200k)".
- [ ] API thanh toán gói tính đúng tổng tiền và VAT 10%, cộng dồn hạn mức chi nhánh vào Tenant khi mua thành công.
- [ ] Tạo chi nhánh mới thành công khi chưa vượt quá Quota (`Plan.MaxBranches + Tenant.ExtraBranches`), và bị chặn chính xác khi vượt quá hạn mức.
- [ ] Build dự án Frontend và Backend pass 100% không có lỗi.
