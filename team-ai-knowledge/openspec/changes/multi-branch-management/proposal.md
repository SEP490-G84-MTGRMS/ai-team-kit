# Proposal: Multi-Branch Management (Quản trị đa chi nhánh)

## Vấn đề
- Khi chủ cửa hàng mở rộng quy mô từ 1 điểm bán lẻ sang mô hình chuỗi (2 chi nhánh trở lên), việc quản lý dữ liệu riêng biệt của từng cửa hàng (địa chỉ, số điện thoại liên hệ, quản lý chi nhánh, tình trạng hoạt động) trở nên phức tạp nếu không có công cụ quản trị tập trung.
- Hiện tại hệ thống MT-GRMS mới chỉ có entity `Branch` và API đọc danh sách/chi tiết cơ bản (`GET /api/v1/branches`), chưa có giao diện UI hoàn chỉnh cho Chủ chuỗi (Store Owner) thực hiện các thao tác quản trị chi nhánh (xem danh sách trực quan, thêm mới chi nhánh, chỉnh sửa thông tin, bật/tắt hoạt động).
- Chưa kiểm soát chặt chẽ giới hạn số chi nhánh (Quota) theo gói dịch vụ SaaS đã mua (Subscription Plan): ví dụ gói Starter cho phép 1 chi nhánh, gói Pro cho phép 3 chi nhánh, gói Enterprise cho phép mở rộng không giới hạn. Cần cơ chế tự động kiểm tra quota để ngăn chặn tạo vượt quá số lượng cho phép và hướng dẫn chủ chuỗi nâng cấp gói cước.

## Mục tiêu
- Cung cấp trang quản lý danh sách chi nhánh hoàn chỉnh cho Chủ cửa hàng (`/store-owner/branches` hoặc phân hệ Cửa hàng).
- Cho phép xem danh sách chi nhánh dạng bảng/thẻ trực quan: mã chi nhánh, tên chi nhánh, địa chỉ, số điện thoại, quản lý phụ trách, số đơn hàng đang xử lý, trạng thái hoạt động (Active / Inactive).
- Cho phép tạo mới chi nhánh với đầy đủ validation (mã chi nhánh chuẩn hóa không trùng lặp trong Tenant, tên, số điện thoại, địa chỉ trụ sở).
- Cho phép chỉnh sửa thông tin chi nhánh và cập nhật trạng thái hoạt động.
- Tự động kiểm tra và thực thi hạn mức số chi nhánh tối đa (Subscription Quota enforcement) dựa trên gói dịch vụ hiện tại của chuỗi. Hiển thị thanh tiến độ quota (VD: `2 / 3 chi nhánh đã kích hoạt`) và cảnh báo nâng cấp khi chạm trần.
- Tạo nền tảng dữ liệu chi nhánh chuẩn hóa để kết nối với các tính năng tiếp theo: Phân quyền nhân sự theo chi nhánh (RBAC), Quản lý tồn kho theo chi nhánh (`BranchStocks`), Chuyển kho liên chi nhánh (FE-15), Bán hàng POS tại quầy chi nhánh (FE-12).

## Phạm vi
### In scope
- **Giao diện người dùng (Frontend)**:
  - Trang danh sách chi nhánh: Bảng hiển thị thông tin chi nhánh, tìm kiếm theo từ khóa/mã chi nhánh, lọc theo trạng thái (Tất cả / Đang hoạt động / Tạm dừng).
  - Thanh trạng thái hạn mức chi nhánh (Quota Bar): Hiển thị số chi nhánh đang dùng / giới hạn của gói thuê bao (VD: 2/3), nút nâng cấp nhanh nếu cần mở rộng thêm.
  - Modal tạo mới chi nhánh: Nhập mã chi nhánh, tên, số điện thoại, địa chỉ, chọn quản lý phụ trách, validation dữ liệu.
  - Modal chỉnh sửa chi nhánh: Cập nhật thông tin chi tiết và chuyển đổi trạng thái Hoạt động / Tạm dừng.
- **Backend API & Nghiệp vụ**:
  - `POST /api/v1/branches`: Thêm mới chi nhánh, kiểm tra tính duy nhất của mã chi nhánh trong cùng Tenant, kiểm tra không vượt `MaxBranches` của gói thuê bao hiện tại.
  - `PUT /api/v1/branches/{id}`: Cập nhật thông tin chi nhánh (Tên, Địa chỉ, SĐT, Quản lý).
  - `PATCH /api/v1/branches/{id}/status`: Bật/tắt trạng thái hoạt động của chi nhánh.
  - `GET /api/v1/branches/quota`: Lấy thông tin số lượng chi nhánh hiện tại và hạn mức tối đa theo gói subscription.
  - Unit Tests và Integration Tests cho các API chi nhánh và logic quota.

### Out of scope
- Điều chuyển hàng hóa và tồn kho liên chi nhánh (thuộc tính năng FE-15 sẽ làm ở change riêng).
- Phân ca làm việc và chấm công nhân sự theo chi nhánh (thuộc FE-18).
- Báo cáo tài chính P&L đa chi nhánh chuyên sâu (thuộc FE-10).

## Người dùng liên quan
- **Chủ chuỗi cửa hàng (Store Owner / Admin)**: Có toàn quyền tạo, cấu hình, quản lý tất cả chi nhánh thuộc sở hữu của chuỗi.
- **Quản lý chi nhánh (Store Manager / Branch Manager)**: Được chỉ định quản lý một chi nhánh cụ thể, xem thông tin vận hành của chi nhánh mình phụ trách.
- **Thu ngân / Nhân viên kho**: Được liên kết vào chi nhánh cụ thể để làm việc và ghi nhận doanh số, xuất nhập kho.

## Tiêu chí thành công
- [ ] Chủ cửa hàng xem được danh sách toàn bộ chi nhánh với đầy đủ mã, tên, địa chỉ, hotline, quản lý phụ trách và trạng thái.
- [ ] Chủ cửa hàng có thể tạo mới chi nhánh thành công khi số lượng chi nhánh chưa vượt quá `MaxBranches` của gói thuê bao.
- [ ] Hệ thống chặn và thông báo rõ ràng kèm nút gợi ý nâng cấp gói cước khi người dùng cố gắng tạo thêm chi nhánh vượt quá quota.
- [ ] Chủ cửa hàng có thể cập nhật thông tin chi nhánh và đổi trạng thái hoạt động (Active / Inactive) thành công.
- [ ] Dữ liệu chi nhánh luôn được phân lập an toàn theo `TenantId` trong PostgreSQL.
- [ ] Backend và Frontend có bộ test tự động kiểm chứng đạt tỷ lệ pass 100%.
