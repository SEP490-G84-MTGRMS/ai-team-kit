# Proposal: Chốt ca và chốt ngày kinh doanh

## Vấn đề

Luồng chốt ca hiện tại chưa tách bạch đầy đủ giữa doanh thu bán hàng, tiền mặt thực tế trong két, chi phí vận hành và luân chuyển tiền nội bộ. Điều này dễ khiến người dùng hiểu sai rằng phiếu chi phải làm giảm doanh thu, hoặc coi tiền nộp từ két ca về két chủ là chi phí.

Giao diện chốt ca còn sử dụng các khái niệm kỹ thuật khó hiểu, yêu cầu thông tin người nhận ca chưa phù hợp với mô hình nhiều nhân viên cùng hoạt động trong một ca, và chưa thể hiện rõ phạm vi ngày kinh doanh đối với cửa hàng hoạt động qua nửa đêm.

Hệ thống cũng cần bảo đảm backend và frontend cùng áp dụng một bộ quy tắc validation, có kiểm thử tự động cho các công thức tiền két, điều kiện đóng ca, khóa ngày kinh doanh và điều chỉnh số liệu sau khi chốt.

## Mục tiêu

- Tách rõ doanh thu bán hàng, dòng tiền trong két, chi phí vận hành, lợi nhuận và chuyển quỹ nội bộ.
- Bảo đảm phiếu chi đã duyệt và đã thực chi làm giảm tiền dự kiến trong két nhưng không làm giảm doanh thu bán hàng.
- Chuẩn hóa luồng kiểm đếm, xử lý chênh lệch, giữ tiền cho ca sau và bàn giao tiền về két chủ/két sắt.
- Hỗ trợ nhiều nhân viên cùng bán trong một ca và truy vết người thực hiện từng giao dịch.
- Quản lý ngày kinh doanh theo từng chi nhánh, bao gồm cửa hàng hoạt động qua nửa đêm.
- Khóa số liệu sau khi chốt ngày; mọi mở lại hoặc điều chỉnh phải có quyền, lý do và audit log.
- Đồng bộ validation giữa backend và frontend, kèm unit test cho các quy tắc nghiệp vụ quan trọng.

## Phạm vi

### In scope

- Backend cho chốt ca:
  - Tổng hợp tiền đầu ca, tiền bán hàng thu bằng tiền mặt, thu khác, chi đã duyệt/đã thực trả từ két, hoàn tiền mặt và chuyển quỹ.
  - Tính tiền dự kiến, tiền thực đếm và chênh lệch.
  - Kiểm tra tiền để lại cho ca sau cộng tiền bàn giao bằng tiền thực đếm.
  - Chặn đóng ca khi còn giao dịch chưa hoàn tất theo chính sách.
  - Ghi nhận danh sách nhân viên thực tế đã hoạt động trong ca.
  - Tạo giao dịch chuyển quỹ khi bàn giao về két chủ/két sắt, không tạo phiếu chi phí.
  - Chống tạo trùng khi gửi lại yêu cầu chốt ca.

- Backend cho chốt ngày kinh doanh:
  - Xác định `BusinessDate` theo chi nhánh và thời điểm chuyển ngày được cấu hình.
  - Tổng hợp riêng doanh thu, thu/chi ngoài bán hàng, chuyển quỹ và số dư từng quỹ.
  - Chặn hoặc cảnh báo khi còn ca/giao dịch chưa hoàn tất.
  - Tạo snapshot chốt ngày và khóa kỳ.
  - Hỗ trợ quy trình mở lại/điều chỉnh có phân quyền, lý do, phê duyệt và audit log.
  - Bảo toàn lịch sử snapshot trước và sau điều chỉnh.

- Frontend:
  - Màn hình chốt ca dùng nhãn nghiệp vụ tiếng Việt dễ hiểu, không hiển thị tên biến kỹ thuật.
  - Hiển thị riêng kết quả bán hàng, biến động tiền két, kiểm đếm và bàn giao.
  - Validation đầy đủ cho tiền thực đếm, tiền giữ lại, tiền bàn giao, lý do chênh lệch và các trường bắt buộc.
  - Màn hình chốt ngày hiển thị riêng doanh thu, thu/chi, luân chuyển nội bộ, tiền đang bàn giao và đối soát theo quỹ.
  - Hiển thị lỗi backend theo đúng ngữ cảnh và ngăn gửi form không hợp lệ.
  - Không bắt buộc nhập người nhận ca tiếp theo; tiền giữ lại thuộc két/điểm bán.

- Kiểm thử:
  - Unit test backend cho công thức tiền két, doanh thu không bị trừ bởi phiếu chi, chuyển quỹ, hoàn tiền, chênh lệch và BusinessDate qua nửa đêm.
  - Unit test cho điều kiện chặn chốt ca/chốt ngày, khóa kỳ, phân quyền và chống ghi trùng.
  - Kiểm tra build/type-check và validation frontend cho các trường của luồng chốt ca/chốt ngày.

### Out of scope

- Xây dựng hệ thống kế toán kép hoặc sổ cái tổng hợp hoàn chỉnh.
- Thay đổi cách tính giá vốn hàng bán ngoài các dữ liệu cần đọc để hiển thị báo cáo.
- Tích hợp ngân hàng mới hoặc thay đổi quy trình xác nhận VietQR.
- Ứng dụng mobile native.
- Tự động kết luận trách nhiệm tài chính của nhân viên khi có chênh lệch quỹ.
- Sửa các phân hệ thuế, bảng lương hoặc công nợ không trực tiếp liên quan đến chốt ca/chốt ngày.

## Người dùng liên quan

- **Nhân viên/Thu ngân**: bán hàng trong ca, tạo thu/chi theo quyền, kiểm đếm và thực hiện đóng ca.
- **Quản lý cửa hàng**: duyệt giao dịch vượt hạn mức, xử lý chênh lệch, giám sát ca và chốt ngày kinh doanh.
- **Chủ cửa hàng**: nhận tiền bàn giao, xem doanh thu/thu chi/đối soát, phê duyệt mở lại hoặc điều chỉnh ngày đã chốt.
- **Kế toán/Người kiểm soát**: tra cứu snapshot, chứng từ nguồn và audit log.
- **Quản trị hệ thống**: cấu hình thời điểm chuyển ngày kinh doanh, quyền và ngưỡng kiểm soát.

## Tiêu chí thành công

- [ ] Phiếu chi 300.000đ đã duyệt và thực trả từ két làm giảm tiền dự kiến đúng 300.000đ nhưng không làm giảm doanh thu bán hàng.
- [ ] Thanh toán tiền mặt làm tăng cả doanh thu và két; thanh toán QR/chuyển khoản làm tăng doanh thu nhưng không tăng két tiền mặt.
- [ ] Chuyển tiền từ két ca sang két chủ làm giảm quỹ nguồn, tăng quỹ đích hoặc tiền đang bàn giao và không thay đổi tổng tiền chi nhánh.
- [ ] Chốt ca không tự tạo phiếu chi vận hành và không ghi trùng giao dịch khi request được gửi lại.
- [ ] Tiền để lại cho ca sau cộng tiền bàn giao luôn bằng tiền thực đếm; backend và frontend cùng từ chối dữ liệu sai.
- [ ] Chênh lệch quỹ yêu cầu lý do theo ngưỡng cấu hình và không tự làm thay đổi doanh thu.
- [ ] Ca có nhiều nhân viên tổng hợp đầy đủ giao dịch, đồng thời truy vết đúng người thao tác.
- [ ] Giao dịch sau 00:00 được gắn đúng `BusinessDate` khi cửa hàng chưa đến thời điểm chuyển ngày.
- [ ] Không thể chốt ngày khi còn ca mở hoặc giao dịch bắt buộc xử lý chưa hoàn tất.
- [ ] Ngày đã chốt bị khóa; mọi điều chỉnh đều lưu người thực hiện, người phê duyệt, thời gian, lý do và số liệu trước/sau.
- [ ] Frontend validation bao phủ toàn bộ trường nhập của chốt ca và chốt ngày, hiển thị thông báo tiếng Việt rõ ràng.
- [ ] Unit test backend và build/type-check frontend liên quan đều đạt trước khi nghiệm thu.
