# Proposal: store-owner-dashboard-real-data

## Vấn đề

Màn hình Tổng quan Chủ cửa hàng hiện tập trung vào bán lẻ và cảnh báo kho, trong khi nhiều chỉ số đang dùng dữ liệu mô phỏng. Chủ cửa hàng phải mở nhiều phân hệ để nắm tình hình doanh số, tài chính, nhập hàng, tồn kho và nhân viên; các số liệu trên màn hình tổng quan có thể không phản ánh hoạt động thực tế.

## Mục tiêu

Thiết kế lại `/store-owner/dashboard` thành nơi theo dõi nhanh hoạt động cửa hàng bằng dữ liệu thật, giúp chủ cửa hàng nhận ra biến động và đi đến đúng màn hình xử lý. Các chỉ số phải nhất quán theo kỳ xem và phạm vi chi nhánh.

## Phạm vi

- In scope:
  - Bố cục dashboard rõ thứ tự ưu tiên cho doanh số, tình hình tài chính, tiến độ nhập hàng, cảnh báo tồn kho/hạn dùng và tổng quan nhân viên.
  - Lấy dữ liệu từ API hiện có khi phù hợp; xác định nhu cầu API tổng hợp còn thiếu ở bước thiết kế, không dùng số liệu giả làm kết quả thật.
  - Bộ lọc thời gian và chi nhánh áp dụng nhất quán cho những chỉ số có hỗ trợ; nêu rõ phạm vi và thời điểm cập nhật của mỗi chỉ số.
  - Trạng thái đang tải, chưa có dữ liệu và lỗi tải; đường dẫn từ từng khối tới màn hình quản lý chi tiết.
  - Chỉ hiển thị dữ liệu của tenant/chi nhánh mà tài khoản Chủ cửa hàng được phép xem.
- Out of scope:
  - Thay đổi quy trình tạo hóa đơn, phiếu nhập, bút toán tài chính hay hồ sơ nhân viên.
  - Thay thế các báo cáo chuyên sâu và màn hình quản lý chi tiết.
  - Dashboard quản trị SaaS tại `/admin/dashboard`.

## Người dùng liên quan

- Chủ cửa hàng và người dùng được cấp quyền xem số liệu quản trị của cửa hàng.
- Các phân hệ bán hàng, tài chính, nhập hàng, kho và nhân sự cung cấp dữ liệu cho dashboard.

## Tiêu chí thành công

- [ ] Màn hình hiển thị đủ 5 nhóm thông tin doanh số, tài chính, nhập hàng, tồn kho và nhân viên theo bố cục dễ đọc trên desktop và tablet.
- [ ] Các số liệu vận hành hiển thị trên dashboard được lấy từ API và khớp cùng kỳ/phạm vi với màn hình chi tiết tương ứng.
- [ ] Chuyển kỳ hoặc chi nhánh cập nhật đúng các khối liên quan; khối không hỗ trợ bộ lọc ghi rõ phạm vi dữ liệu.
- [ ] Không có số liệu mẫu hiển thị như dữ liệu thật; lỗi API và dữ liệu rỗng có thông báo rõ ràng.
- [ ] Người dùng chỉ xem được dữ liệu thuộc tenant/chi nhánh được phép; các lối tắt mở đúng màn hình chi tiết.
- [ ] Frontend build thành công và các luồng chính được kiểm chứng ở bước test.
