# Specs: store-owner-dashboard-real-data

- Capability: `reports-pnl`
- dependencies: `proposal.md`, `exploration.md`, `design-brief.md`
- Đây là delta bổ sung cho màn hình Tổng quan Chủ cửa hàng; không thay đổi dashboard Admin SaaS.

## API / Contract

| Method | Path | Request | Response | Lỗi |
|---|---|---|---|---|
| GET | `/api/store-owner/dashboard` | `period=today\|yesterday\|last7days\|thisMonth`, `branchId?: Guid` | `ApiResponse<StoreOwnerDashboardResponse>` gồm scope, sales, finance, procurement, inventory, employees | 400 filter sai; 401 chưa đăng nhập; 403 không có quyền/chi nhánh ngoài phạm vi; 5xx khi nguồn không khả dụng |

`scope` gồm `fromUtc`, `toUtc`, `asOfUtc`, `branchId?`, `branchName`. `sales` gồm `netRevenue`, `totalOrders`, `averageOrderValue`, `revenueGrowthPercent?`, `trend[]`, `topProducts[]`. `finance` gồm `grossProfit`, `operatingExpenses`, `netProfit`, `cogsSource`, `cogsWarningNotice?`. `procurement` gồm `pendingApprovalCount`, `awaitingReceiptCount`, `receivedAmountInPeriod`. `inventory` gồm `lowStockCount`, `outOfStockCount`, `expiryWarningCount`, `lowStockItems[]`, `expiringBatches[]`. `employees` gồm `totalCount`, `activeCount`.

## ADDED Requirements

### Requirement: REQ-DASH-REAL-01 Một nguồn dữ liệu thật cho Dashboard Chủ cửa hàng

Backend MUST trả dữ liệu tổng hợp thuộc tenant của người đăng nhập, có cùng phạm vi chi nhánh và kỳ báo cáo. Frontend MUST dùng dữ liệu API cho mọi chỉ số vận hành; không dùng mock/fallback số liệu, tên chi nhánh hoặc trạng thái ca cố định. API MUST trả `asOfUtc` và kỳ/phạm vi hiệu lực.

#### Scenario: Mở dashboard có dữ liệu
- GIVEN Chủ cửa hàng có dữ liệu bán hàng, nhập hàng, kho và nhân viên
- WHEN mở `/store-owner/dashboard`
- THEN màn hình SHALL hiển thị 5 nhóm thông tin từ API, kèm kỳ, chi nhánh và thời điểm cập nhật.

#### Scenario: Không có dữ liệu trong kỳ
- GIVEN tenant hợp lệ chưa phát sinh giao dịch trong kỳ chọn
- WHEN mở dashboard
- THEN chỉ số phát sinh trong kỳ MUST là 0 hoặc danh sách rỗng theo kết quả API, và giao diện SHALL ghi rõ chưa có dữ liệu; không hiển thị số liệu mẫu.

#### Scenario: Nguồn dữ liệu lỗi
- GIVEN API tổng hợp không thể tính chính xác một nhóm chỉ số
- WHEN yêu cầu dashboard thất bại
- THEN Backend MUST trả lỗi thay vì giá trị 0 giả; Frontend SHALL hiển thị lỗi và cho thử lại.

### Requirement: REQ-DASH-REAL-02 Bộ lọc thời gian và chi nhánh nhất quán

Dashboard SHALL hỗ trợ hôm nay, hôm qua, 7 ngày gần nhất (gồm hôm nay) và tháng hiện tại theo Asia/Ho_Chi_Minh. Backend MUST áp dụng khoảng [fromUtc, toUtc) cho chỉ số theo kỳ. Bộ lọc chi nhánh SHALL gồm toàn bộ chi nhánh được phép hoặc một chi nhánh hợp lệ. Tồn kho, PO đang chờ và nhân viên là snapshot hiện tại, MUST ghi rõ nhãn 'Hiện tại' thay vì thay đổi giả theo kỳ.

#### Scenario: Đổi kỳ và chi nhánh
- GIVEN Chủ cửa hàng có nhiều chi nhánh
- WHEN chọn 7 ngày gần nhất và một chi nhánh
- THEN doanh số, tài chính và giá trị nhập đã hoàn tất SHALL dùng cùng khoảng ngày và chi nhánh; snapshot SHALL lấy chi nhánh đó tại thời điểm tải.

#### Scenario: Chuyển bộ lọc liên tiếp
- GIVEN yêu cầu cho bộ lọc cũ chưa hoàn tất
- WHEN người dùng chọn bộ lọc mới
- THEN Frontend MUST chỉ hiển thị kết quả của bộ lọc mới.

#### Scenario: Kỳ không hợp lệ
- GIVEN query có `period` ngoài 4 giá trị cho phép hoặc `branchId` sai định dạng
- WHEN gọi API
- THEN Backend MUST trả HTTP 400.

### Requirement: REQ-DASH-REAL-03 Doanh số và tài chính cùng nguồn P&L

Dashboard MUST hiển thị doanh thu thuần, số hóa đơn, giá trị trung bình hóa đơn, xu hướng doanh thu, lợi nhuận gộp, chi phí vận hành và lợi nhuận ròng theo cùng định nghĩa với báo cáo P&L. Top sản phẩm SHALL lấy từ dữ liệu bán hàng thực và giới hạn tối đa 5 sản phẩm. Tăng trưởng SHALL so với kỳ liền trước có độ dài tương ứng; khi mẫu số bằng 0 MUST hiển thị 'Chưa đủ dữ liệu so sánh', không chia cho 0. Nếu nguồn P&L cảnh báo COGS ước tính, dashboard MUST hiển thị cảnh báo đó.

#### Scenario: Đối chiếu báo cáo
- GIVEN Chủ cửa hàng chọn cùng kỳ và chi nhánh trên dashboard và báo cáo P&L
- WHEN so sánh các chỉ số tương ứng
- THEN doanh thu thuần, lợi nhuận và chi phí MUST khớp báo cáo P&L.

#### Scenario: Kỳ trước bằng 0
- GIVEN kỳ trước không có doanh thu
- WHEN hiển thị tăng trưởng doanh thu
- THEN dashboard MUST hiển thị trạng thái không đủ dữ liệu so sánh.

### Requirement: REQ-DASH-REAL-04 Tiến độ nhập hàng theo PO và phiếu nhận

Dashboard MUST hiển thị số PO chờ duyệt (`PENDING_APPROVAL`), số PO đang chờ nhận theo trạng thái PO hợp lệ chưa hoàn tất, và tổng `GrandTotal` của phiếu nhập `COMPLETED` được xác nhận trong kỳ. PO đang chờ là snapshot hiện tại; giá trị đã nhận là chỉ số theo kỳ. Không tính phiếu `DRAFT`/`CANCELLED` hoặc tính trùng một phiếu.

#### Scenario: Có PO chờ và phiếu nhận hoàn tất
- GIVEN tenant có PO chờ duyệt, PO chờ nhận và phiếu nhập hoàn tất trong kỳ
- WHEN mở dashboard
- THEN ba chỉ số nhập hàng SHALL phản ánh đúng trạng thái PO và phiếu nhập của phạm vi đã chọn.

#### Scenario: Phiếu nhận bị hủy hoặc ngoài kỳ
- GIVEN có phiếu nhập bị hủy hoặc xác nhận ngoài kỳ
- WHEN tính giá trị nhập đã nhận
- THEN phiếu đó MUST không góp vào `receivedAmountInPeriod`.

### Requirement: REQ-DASH-REAL-05 Cảnh báo kho và tổng quan nhân viên hiện tại

Dashboard MUST dùng số liệu tồn kho hiện có để hiển thị số SKU tồn thấp, hết hàng, cảnh báo cận hạn và tối đa 5 dòng ưu tiên cần xử lý. Nhân viên SHALL hiển thị tổng số và số đang hoạt động theo tenant/chi nhánh hiện tại. Dashboard MUST không suy ra 'đang làm ca' chỉ từ trạng thái hồ sơ nhân viên.

#### Scenario: Có cảnh báo kho
- GIVEN một sản phẩm dưới ngưỡng tồn và một lô cận hạn ở chi nhánh được chọn
- WHEN mở dashboard
- THEN số đếm và danh sách cảnh báo SHALL khớp dữ liệu kho hiện tại của chi nhánh đó.

#### Scenario: Nhân viên thuộc chi nhánh khác
- GIVEN tenant có nhân viên ở nhiều chi nhánh
- WHEN lọc một chi nhánh
- THEN tổng nhân viên và nhân viên hoạt động SHALL chỉ tính nhân viên thuộc chi nhánh được chọn.

### Requirement: REQ-DASH-REAL-06 Phân quyền và điều hướng

Backend MUST lấy tenant từ auth context, kiểm tra role có quyền xem dashboard quản trị cửa hàng và từ chối chi nhánh ngoài phạm vi. Frontend SHALL chỉ hiển thị lối tắt đến màn hình chi tiết mà role được quyền mở. Các khối SHALL dẫn đến màn hình bán hàng/báo cáo, tài chính, PO/phiếu nhập, kho và nhân viên phù hợp.

#### Scenario: Truy cập chi nhánh tenant khác
- GIVEN người dùng hợp lệ của tenant A
- WHEN gọi dashboard với `branchId` của tenant B
- THEN Backend MUST trả HTTP 403 và không trả số liệu tenant B.

#### Scenario: Role không được phép
- GIVEN tài khoản chỉ có quyền thu ngân
- WHEN gọi API dashboard quản trị
- THEN Backend MUST trả HTTP 403.

#### Scenario: Đi tới màn hình chi tiết
- GIVEN Chủ cửa hàng xem một cảnh báo tồn kho hoặc PO
- WHEN chọn liên kết chi tiết
- THEN Frontend SHALL mở đúng màn hình quản lý tương ứng và giữ phạm vi chi nhánh khi màn hình đích hỗ trợ.

## Acceptance checklist

- [ ] Dashboard hiển thị 5 nhóm dữ liệu thật, không còn con số/tên chi nhánh/trạng thái ca mẫu.
- [ ] Doanh thu và tài chính khớp P&L theo cùng kỳ và chi nhánh.
- [ ] Nhập hàng, cảnh báo kho và số nhân viên khớp các phân hệ gốc.
- [ ] Bộ lọc kỳ/chi nhánh, snapshot, loading/empty/error và yêu cầu chuyển bộ lọc nhanh hoạt động đúng.
- [ ] API giới hạn dữ liệu theo tenant/role/chi nhánh; không rò dữ liệu khi lỗi quyền.
- [ ] Các lối tắt hợp lệ và dashboard hiển thị tốt trên desktop/tablet.
