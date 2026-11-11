# Spec: subscription

> Spec gốc / seed của capability. Delta nghiệp vụ nằm trong `openspec/changes/<change>/specs.md`. `/sep-archive` không merge vào đây; `/sep-refactor` sửa specs của change.

## Requirements

### Requirement: REQ-06 Mua Thêm Dung Lượng Lưu Trữ Theo Gian Hàng
Chủ cửa hàng MUST được mua thêm số GB nguyên dương cho chính gian hàng của mình với giá **15.000 đ/GB/tháng trước VAT 10%**. Backend MUST là nguồn tính tiền và hạn mức; không tin giá hoặc tenant ID do frontend gửi. Gói dùng thử không được mua thêm trước khi chuyển sang gói trả phí.

1. Khi mua/gia hạn gói, tiền dung lượng mua thêm = số GB × 15.000 đ × số tháng thanh toán; VAT 10% được cộng vào tổng đơn, trừ Ví gian hàng và lưu chứng từ giao dịch theo cơ chế mua gói hiện có. Ví dụ 1 GB trong 12 tháng có giá 180.000 đ trước VAT, 198.000 đ sau VAT.
2. Trong kỳ trả phí, chủ cửa hàng MAY mua thêm GB riêng; Backend MUST báo giá theo thời gian còn lại tới ngày hết hạn gói, hiển thị tiền và VAT trước khi xác nhận, chỉ cộng hạn mức sau khi thanh toán thành công. Phần dung lượng mua thêm hết hiệu lực cùng kỳ gói; gia hạn gói phải tính lại phần tiếp tục mua, không tự thu tiền khi chưa có xác nhận.
3. Backend MUST lưu bền vững số GB mua thêm, thời điểm hết hiệu lực và giao dịch theo từng gian hàng, chống tính tiền/cộng hạn mức hai lần khi request thanh toán bị gửi lặp, đồng thời từ chối số GB không hợp lệ hoặc giao dịch không đủ tiền.
4. Backend MUST ghi nhận số byte ảnh/tệp đang sử dụng theo từng gian hàng từ luồng tải lên và xóa tệp, kiểm tra `usedBytes + newFileBytes <= (2 + purchasedGb) × 1.073.741.824` trước khi nhận tệp. Luồng tải lên phải xác định gian hàng từ phiên đăng nhập và không cho chỉ định thư mục/tenant của gian hàng khác; cập nhật số byte và tài nguyên phải nhất quán khi upload thất bại, bị xóa hoặc thay thế.
5. Giao diện Settings/Quản lý gói MUST hiển thị dung lượng đã dùng, tổng hạn mức, ngày hết hạn phần mua thêm và hành động mua thêm. Khi phần mua thêm hết hạn, hệ thống MUST giữ nguyên tệp cũ; nếu mức đã dùng vượt hạn mức còn lại thì từ chối tải lên mới và hướng dẫn mua thêm, không xóa dữ liệu.

#### Scenario: Mua thêm khi đăng ký gói
- GIVEN chủ cửa hàng chọn gói STANDARD hoặc PRO chu kỳ 12 tháng và mua thêm 1 GB
- WHEN xác nhận thanh toán bằng Ví gian hàng
- THEN Backend tính thêm 180.000 đ trước VAT, 198.000 đ sau VAT cho phần dung lượng, lưu giao dịch và cấp tổng hạn mức 3 GB sau khi thanh toán thành công.

#### Scenario: Mua thêm giữa kỳ
- GIVEN gian hàng có gói trả phí còn hiệu lực và chọn mua thêm GB
- WHEN Backend báo giá theo thời gian còn lại và chủ cửa hàng xác nhận thanh toán thành công
- THEN số GB được cộng vào hạn mức của chính gian hàng tới ngày hết hạn gói, không thu hoặc cộng lần thứ hai với cùng giao dịch.

#### Scenario: Tải lên vượt hạn mức
- GIVEN gian hàng đã dùng gần hết dung lượng được cấp
- WHEN tải tệp khiến tổng số byte vượt hạn mức
- THEN Backend từ chối tải lên với lỗi hạn mức; dữ liệu/tài nguyên đã lưu không thay đổi.

#### Scenario: Hết hạn phần mua thêm
- GIVEN phần dung lượng mua thêm hết hạn và gian hàng đang dùng vượt 2 GB gốc
- WHEN chủ cửa hàng xem dung lượng hoặc tải tệp mới
- THEN hệ thống vẫn cho xem tệp cũ, hiển thị vượt hạn mức và chặn tải tệp mới cho tới khi mua thêm hoặc giải phóng dung lượng.

### Requirement: REQ-01 Chuẩn Hóa Danh Mục 2 Gói Cước SaaS (Giá Đột Phá 99k)
Hệ thống MUST chỉ nạp và kích hoạt 2 gói cước chính thức trong CSDL:
1. `STANDARD`: **99.000 đ/tháng**, 1 chi nhánh kiêm kho, 1 tài khoản chủ shop, **2 GB dung lượng ảnh/tệp do gian hàng tải lên**.
2. `PRO`: **249.000 đ/tháng**, mặc định sẵn 2 chi nhánh, không giới hạn tài khoản nhân viên, **2 GB dung lượng ảnh/tệp do gian hàng tải lên**.
Dung lượng ảnh/tệp được tính theo byte thực tế của tài nguyên đang thuộc gian hàng, quy đổi 1 GB = 1.073.741.824 byte; không tính dữ liệu PostgreSQL vào hạn mức này khi chưa có cơ chế đo theo gian hàng. Backend MUST trả cả dung lượng gốc và phần mua thêm trong thông tin gói/hạn mức; UI MUST phân biệt hạn mức được cấp với dung lượng đã dùng thực tế.

#### Scenario: Lấy danh sách gói cước hoạt động
- GIVEN Chủ cửa hàng đã đăng nhập vào hệ thống
- WHEN Gửi request `GET /api/tenant/pricing-plans`
- THEN Hệ thống trả về 2 gói `STANDARD` (99k) và `PRO` (249k) với đầy đủ giá tháng, giá năm, hạn mức chi nhánh và dung lượng gốc 2 GB.

## Lịch sử
- 2026-11-11 · `sep-refactor:Chốt-2-GB-dung-lượng-ảnh/tệp-gốc-cho-STA` · +1 ~1 -0
