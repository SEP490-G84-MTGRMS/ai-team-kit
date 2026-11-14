# Exploration: store-owner-dashboard-real-data

## 1. Problem Statement

Chủ cửa hàng chưa có một màn hình tổng quan đáng tin cậy để nhìn cùng lúc doanh số, tài chính, nhập hàng, tồn kho và nhân viên. Dashboard hiện dùng nhiều con số và tên chi nhánh cố định nên có thể khiến người dùng hiểu nhầm là dữ liệu vận hành thực.

## 2. Context & Background

- `StoreOwnerDashboardPage` đã có các khối KPI bán lẻ, biểu đồ doanh thu, FEFO, tồn thấp, top sản phẩm và lối tắt.
- `StoreOwnerKpiRow` và `StoreRevenueChartCard` chứa số liệu mô phỏng; header có tên chi nhánh và nhãn cập nhật theo thời gian thực cố định.
- Hệ thống đã có báo cáo P&L, danh sách PO, tồn kho và nhân viên ở các phân hệ riêng. Khả năng lọc kỳ và chi nhánh khác nhau giữa các nguồn.
- Đặc tả cũ `store-owner-dashboard-overview/specs.md` chỉ bao phủ dashboard bán lẻ; change này mở rộng khả năng quan sát và thay dữ liệu mẫu.
- Phụ thuộc: `proposal.md` của change này; capability `reports-pnl`; các phân hệ finance, purchase-order, inventory, employee.

## 3. Constraints

- Số tiền thuộc các khái niệm khác nhau phải có tên rõ ràng: doanh thu, lợi nhuận theo P&L, số dư quỹ không được cộng/gộp tùy tiện.
- Dữ liệu nhiều chi nhánh cần giới hạn theo tenant và quyền truy cập.
- Tồn kho và nhân sự là số liệu tại thời điểm xem; doanh số/tài chính/nhập hàng là số liệu theo kỳ.
- Không hiển thị dữ liệu mẫu dưới dạng kết quả thật; giao diện phải có trạng thái tải, rỗng và lỗi.
- Desktop/tablet phải đọc được các ưu tiên chính trong một lượt xem.

## 4. Assumptions

- **[ASSUMPTION]** Chủ cửa hàng được xem tổng hợp toàn tenant và lọc từng chi nhánh thuộc tenant; cần xác nhận theo phân quyền thực tế ở bước verify-spec.
- **[ASSUMPTION]** "Tài chính" trên dashboard là doanh thu thuần, chi phí và lợi nhuận từ P&L; số dư quỹ nếu hiển thị phải được ghi là snapshot riêng.
- **[ASSUMPTION]** "Nhập hàng" gồm số PO đang chờ xử lý, PO chờ nhận và giá trị hàng đã nhận trong kỳ; trạng thái chính xác sẽ đối chiếu với enum/code.
- **[ASSUMPTION]** "Tổng quan nhân viên" trước mắt là tổng nhân viên, đang hoạt động và phân bố theo chi nhánh; không suy ra ai đang làm ca nếu chưa có dữ liệu ca tin cậy.
- **[ASSUMPTION]** Người dùng cần điều hướng tới màn hình chi tiết để xử lý, không thao tác sửa nghiệp vụ ngay trong dashboard.

## 5. Scope & Non-Goals

### In Scope

- Xem 5 nhóm vận hành trên một dashboard, có bộ lọc và nhãn phạm vi phù hợp.
- Định nghĩa rõ dữ liệu của từng chỉ số và cách xử lý nguồn không có dữ liệu.
- Dẫn người dùng đến trang chi tiết liên quan.

### Out of Scope (Non-Goals)

- Thay thế P&L, PO, kho, nhân sự hoặc các màn hình tác nghiệp.
- Thay đổi quy tắc hạch toán, trạng thái PO, tồn kho, chấm công hay phân quyền gốc.
- Dashboard Admin SaaS, dự báo AI, thông báo đẩy thời gian thực.

## 6. Phương án ở mức trải nghiệm

1. **Hiển thị song song 5 nhóm ngang hàng.** Ưu điểm: bao quát đều. Nhược điểm: khó nhận ra biến động quan trọng trên màn hình vừa và nhỏ.
2. **Ưu tiên doanh số/tài chính trên đầu, sau đó là việc cần chú ý ở nhập hàng, tồn kho và nhân viên.** Ưu điểm: chủ cửa hàng thấy tình hình và việc cần làm theo thứ tự tự nhiên. Nhược điểm: các khối phía dưới cần cuộn.

**Chọn phương án 2** vì phù hợp mục tiêu theo dõi nhanh và điều hướng tới nơi xử lý; chi tiết bố cục và nguồn dữ liệu sẽ chốt trong `design-brief.md`.

## 7. Rủi ro cần kiểm chứng

- Cùng tên KPI nhưng công thức ở các phân hệ có thể khác nhau. Cần đối chiếu với nguồn chuẩn trước khi hiển thị.
- Không đồng nhất kỳ lọc giữa số liệu dòng thời gian và snapshot. Cần ghi rõ kỳ/phạm vi cho từng khối.
- Dữ liệu nhiều chi nhánh dễ lộ chéo tenant nếu chỉ lọc ở UI. Cần kiểm soát trên API.

## 8. Success Criteria

- Người dùng nhận diện được 5 nhóm thông tin và điều hướng vào chi tiết.
- Chỉ số có nguồn thật, kỳ/phạm vi rõ ràng và đối chiếu được với phân hệ gốc.
- Không còn tên chi nhánh, trạng thái ca hoặc con số vận hành giả trên dashboard.
