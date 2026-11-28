# Proposal: admin-tenant-detail-redesign

## Vấn đề
Trang `/admin/tenants/:id` đang trộn dữ liệu API với dữ liệu mock. Khi không tìm thấy tenant, trang có thể hiển thị tenant đầu tiên trong danh sách mẫu. Việc tải API không có phản hồi lỗi rõ ràng. Một số thao tác quản lý nuốt lỗi API rồi vẫn báo thành công. Bố cục trang chưa đồng bộ với bảng tenant vừa được thiết kế lại.

## Mục tiêu
Thiết kế lại trang chi tiết tenant Admin thành giao diện gọn, dễ tra cứu và phản ánh đúng dữ liệu cùng kết quả thao tác từ API. Áp dụng màu Deep Teal #0F766E, typography và cách trình bày bảng thống nhất với danh sách tenant.

## Phạm vi
### In scope
- Header có tên cửa hàng, subdomain, trạng thái và nút quay lại danh sách.
- Các vùng thông tin cửa hàng/chủ sở hữu, gói dịch vụ/hợp đồng và bảng chi nhánh.
- Dữ liệu được tải theo đúng tenant trong URL. Thông tin thiếu hiển thị `—`.
- Loading, lỗi tải có thử lại và trạng thái không tìm thấy tenant.
- Bố cục responsive, nút nằm trong khung nội dung và bảng cuộn trong vùng riêng khi cần.
- Badge trạng thái theo API, nhãn ân hạn hiển thị `Ân hạn`.
- Xác nhận khóa/mở khóa/gia hạn, phản hồi lỗi thực tế, chỉ báo thành công khi API xác nhận thành công và tải lại dữ liệu sau thao tác.
- Rà soát mapping/API chi tiết hiện có để cung cấp đúng các trường cần hiển thị.

### Out of scope
- Chức năng nghiệp vụ mới ngoài xem chi tiết và các thao tác quản lý tenant đã có.
- Thay đổi chính sách gói cước, tính phí, thời gian ân hạn hoặc quyền truy cập.
- Thiết kế lại các màn hình Admin khác.

## Người dùng liên quan
Admin quản trị nền tảng SaaS có quyền tra cứu tenant và thực hiện thao tác quản lý hợp đồng.

## Tiêu chí thành công
- [ ] Trang luôn hiển thị đúng tenant theo URL và dữ liệu API.
- [ ] Không hiển thị tenant mẫu thay thế khi API lỗi hoặc tenant không tồn tại.
- [ ] Thông tin thiếu hiển thị `—`, không tạo dữ liệu giả.
- [ ] Bố cục đồng bộ danh sách tenant, các nút không tràn khỏi khung nội dung.
- [ ] Bảng chi nhánh hiển thị dữ liệu API và trạng thái rỗng phù hợp.
- [ ] Badge ân hạn chỉ hiển thị `Ân hạn`.
- [ ] Khóa/mở khóa/gia hạn có xác nhận, phản ánh đúng kết quả API và cập nhật lại dữ liệu.
- [ ] Build frontend thành công và kiểm chứng các luồng tải/thao tác theo đặc tả.
