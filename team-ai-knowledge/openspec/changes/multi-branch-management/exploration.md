# EXP-2026-11-01-MULTI-BRANCH: Khám phá Thiết kế & Quản lý Đa Chi nhánh MT-GRMS

## 1. Problem Statement (Vấn đề)
Chủ chuỗi cửa hàng tạp hóa bán lẻ (Store Owner) khi kinh doanh từ 2 cửa hàng trở lên đang gặp các bất cập:
- Chưa có giao diện trực quan để xem, thêm mới, sửa đổi thông tin chi nhánh và bật/tắt trạng thái hoạt động.
- Chưa có điểm truy cập (nút bấm, điều hướng) thuận tiện từ thanh Menu chính (`Cửa hàng`), thanh trạng thái (`StoreTopStatusBar`), hoặc bộ chuyển đổi chi nhánh (`Branch Switcher`).
- Chưa có cơ chế hiển thị và ràng buộc hạn mức số chi nhánh (Subscription Quota) theo gói dịch vụ SaaS đã mua (ví dụ gói Pro tối đa 3 chi nhánh), dẫn đến nguy cơ vượt hạn mức hoặc trải nghiệm không rõ ràng khi cần nâng cấp.

## 2. Context & Background (Bối cảnh & Hiện trạng)
- **Backend**: Đã có Entity `Branch` (kế thừa `BaseTenantEntity`), `BranchesController.cs` với 2 endpoint đọc (`GET /api/v1/branches`, `GET /api/v1/branches/{id}`), bảng `Branches` trong PostgreSQL liên kết `TenantId`. Chưa có endpoint tạo mới (`POST`), cập nhật (`PUT`), đổi trạng thái (`PATCH`), hay kiểm tra quota (`GET /quota`).
- **Frontend**: Menu `Cửa hàng` trong `AppTopNav.tsx` có link `Chi nhánh & Kho hàng`, nhưng trỏ tới `?tab=store-info&view=branches` chưa được hiện thực. `StoreTopStatusBar.tsx` hiển thị nhãn tĩnh "Số chi nhánh: 2" nhưng không thể click hay xem chi tiết. `StoreSettingsHubPage.tsx` mới chỉ có 4 tab: `store-info`, `subscriptions`, `order-history`, `service-confirm`.

## 3. Constraints (Ràng buộc kỹ thuật & Nghiệp vụ)
- Phải đảm bảo phân lập dữ liệu đa tenant (`TenantId` trong header JWT, không được lộ chi nhánh của chuỗi khác).
- Tiền tệ VND, định dạng ngày tháng hiển thị theo `Asia/Ho_Chi_Minh`.
- Phải kiểm tra quota: `CurrentBranchesCount < MaxBranches` từ gói thuê bao của Tenant trước khi cho phép tạo mới.
- Không sửa trực tiếp migration cũ; nếu thay đổi DB phải dùng EF Core migration mới.
- Giữ vững chuẩn Clean Architecture (Domain -> Application -> Infrastructure -> Api).

## 4. Assumptions (Giả định)
- **[ASSUMPTION-01]**: Mỗi chi nhánh có một mã duy nhất (`BranchCode`) trong phạm vi Tenant (ví dụ: `CN-01`, `CN-Q1`), không trùng lặp.
- **[ASSUMPTION-02]**: Khi chi nhánh chuyển sang trạng thái `Inactive`, các đơn hàng cũ vẫn được giữ nguyên lịch sử nhưng nhân viên không thể mở ca POS mới tại chi nhánh này.
- **[ASSUMPTION-03]**: Chủ chuỗi (`Store Owner` / `Admin`) có toàn quyền CRUD chi nhánh. Cửa hàng trưởng (`Branch Manager`) chỉ xem thông tin chi nhánh của mình.

## 5. Scope & Non-Goals
### In Scope
- Thêm tab **"Quản lý chi nhánh"** (`branches`) trong Store Settings Hub và cập nhật điều hướng từ Menu `Cửa hàng` + nút bấm từ thanh trạng thái `StoreTopStatusBar`.
- Hiển thị thanh tiến độ Quota: `Đang dùng X / Y chi nhánh (Gói Z)`.
- Nút **"+ Thêm chi nhánh mới"** (có kiểm soát quota, tự động mở modal tạo mới hoặc modal thông báo nâng cấp gói).
- Danh sách chi nhánh hiển thị dạng thẻ Grid/Table: Mã chi nhánh, Tên, Địa chỉ, SĐT, Quản lý phụ trách, Trạng thái hoạt động (Active/Inactive toggle).
- Modal tạo mới và chỉnh sửa thông tin chi nhánh với form validation chuẩn.
- Các API Backend hoàn chỉnh: `POST /api/v1/branches`, `PUT /api/v1/branches/{id}`, `PATCH /api/v1/branches/{id}/status`, `GET /api/v1/branches/quota`.

### Out of Scope (Non-Goals)
- Điều chuyển hàng hóa và tồn kho liên chi nhánh (thuộc FE-15 sẽ làm ở change riêng).
- Phân ca, chấm công và bảng lương theo chi nhánh (thuộc FE-18).
- Báo cáo tài chính P&L tách rời theo chi nhánh (thuộc FE-10).

## 6. Đánh giá Các Phương án Thiết kế (Options & Trade-offs)
### Phương án A: Tích hợp thành Tab `branches` trong `StoreSettingsHubPage`
- *Mô tả:* Bổ sung tab thứ 5 vào `StoreSidebarNav` và `StoreSettingsHubPage`. Bấm vào "Số chi nhánh" ở TopBar sẽ chuyển ngay đến tab này.
- *Ưu điểm:* Tập trung toàn bộ quản trị chuỗi (Thông tin chuỗi, Chi nhánh, Gói cước, Hóa đơn) trong một Hub duy nhất, thống nhất trải nghiệm người dùng, không cần tạo thêm layout mới.
- *Nhược điểm:* Chiều ngang của nội dung bị thu hẹp một phần bởi Sidebar của Hub.

### Phương án B: Tách thành Trang độc lập `/store-owner/branches`
- *Mô tả:* Xây dựng một trang riêng biệt, Menu `Cửa hàng` trỏ thẳng vào trang này.
- *Ưu điểm:* Không gian màn hình rộng rãi, hiển thị được nhiều cột dữ liệu.
- *Nhược điểm:* Phân mảnh trải nghiệm giữa việc quản lý thông tin chuỗi (Store Info), gói thuê bao (Subscriptions) và chi nhánh.

### 👉 Phương án lựa chọn: Kết hợp (Hybrid) - Phương án A mở rộng
- Sử dụng tab `branches` trong `StoreSettingsHubPage` (`/store-owner/subscriptions?tab=branches`), đồng thời route alias `/store-owner/branches` tự động điều hướng về tab này.
- Biến ô **"Số chi nhánh: 2"** trên `StoreTopStatusBar` thành nút bấm tương tác dẫn thẳng vào tab Quản lý chi nhánh.
- Thêm mục rõ ràng **"Danh sách chi nhánh"** trong dropdown Menu `Cửa hàng` trên TopNav.

## 7. Rủi ro & Cách giảm thiểu
- *Rủi ro vượt quota do race condition*: Hai người cùng bấm tạo chi nhánh cùng lúc.
  *Cách giảm thiểu:* Kiểm tra số lượng chi nhánh trong Transaction với khóa cấp Tenant trước khi lưu.
- *Rủi ro mã chi nhánh trùng*: Trùng mã chi nhánh trong cùng tenant.
  *Cách giảm thiểu:* Unique index trên `(TenantId, BranchCode)` trong database.
