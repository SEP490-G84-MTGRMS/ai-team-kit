# Specs: store-owner-dashboard-real-data

- Capability: `reports-pnl`
- dependencies: `proposal.md`, `exploration.md`, `design-brief.md`

## API / Contract

| Method | Path | Query | Response | Lỗi |
|---|---|---|---|---|
| GET | `/api/store-owner/dashboard` | `period=today\|yesterday\|last7days\|thisMonth`, `branchId?: Guid` | `ApiResponse<StoreOwnerDashboardResponse>` với `scope`, `sales`, `finance`, `procurement`, `inventory`, `employees` | 400 filter sai, 401 chưa đăng nhập, 403 sai quyền/chi nhánh, 5xx lỗi nguồn |

Response chứa `scope={fromUtc,toUtc,asOfUtc,branchId?,branchName}`. `sales={netRevenue,totalOrders,averageOrderValue,revenueGrowthPercent?,trend[],topProducts[]}`. `finance={grossProfit,operatingExpenses,netProfit,cogsSource,cogsWarningNotice?}`. `procurement={pendingApprovalCount,awaitingReceiptCount,receivedAmountInPeriod}`. `inventory={lowStockCount,outOfStockCount,expiryWarningCount,lowStockItems[],expiringBatches[]}`. `employees={totalCount,activeCount}`. Danh sách preview tối đa 5 dòng.

## ADDED Requirements

### Requirement: REQ-DASH-REAL-01 Dữ liệu thật và trạng thái rõ ràng

Dashboard MUST lấy số liệu vận hành từ API theo tenant của người đăng nhập. Frontend MUST bỏ số mẫu, tên chi nhánh và trạng thái ca cố định. API MUST trả kỳ, phạm vi chi nhánh và `asOfUtc`. Khi một nguồn không tính được, API MUST báo lỗi, không thay bằng 0 giả; UI SHALL cho thử lại.

#### Scenario: Có dữ liệu
- GIVEN Chủ cửa hàng có giao dịch và dữ liệu vận hành
- WHEN mở `/store-owner/dashboard`
- THEN dashboard SHALL hiển thị 5 nhóm số liệu API với kỳ, chi nhánh và thời điểm tải.

#### Scenario: Chưa có dữ liệu
- GIVEN tenant không có giao dịch trong kỳ
- WHEN mở dashboard
- THEN số liệu phát sinh SHALL là 0/danh sách rỗng thực tế và UI SHALL ghi rõ chưa có dữ liệu.

#### Scenario: API lỗi
- GIVEN nguồn dữ liệu không khả dụng
- WHEN tải dashboard
- THEN UI SHALL hiện lỗi và nút thử lại, không hiển thị số mẫu.

### Requirement: REQ-DASH-REAL-02 Kỳ và chi nhánh

Dashboard SHALL hỗ trợ hôm nay, hôm qua, 7 ngày gần nhất gồm hôm nay, tháng này theo Asia/Ho_Chi_Minh. Backend MUST dùng khoảng [fromUtc,toUtc) cho chỉ số theo kỳ. Bộ lọc chi nhánh SHALL cho chọn toàn tenant hoặc một chi nhánh được phép. Tồn kho, PO đang chờ và nhân viên là snapshot, MUST có nhãn 'Hiện tại'.

#### Scenario: Đổi kỳ/chi nhánh
- GIVEN Chủ cửa hàng có hai chi nhánh
- WHEN chọn 7 ngày và một chi nhánh
- THEN doanh số, P&L, giá trị phiếu nhập đã hoàn tất SHALL cùng kỳ/chi nhánh; snapshot SHALL thuộc chi nhánh đó tại `asOfUtc`.

#### Scenario: Đổi bộ lọc nhanh
- GIVEN request cũ chưa hoàn thành
- WHEN người dùng đổi bộ lọc lần nữa
- THEN Frontend MUST chỉ hiển thị response của lựa chọn mới nhất.

#### Scenario: Filter sai
- GIVEN period ngoài bốn giá trị hoặc branchId không phải Guid
- WHEN gọi API
- THEN Backend MUST trả 400.

### Requirement: REQ-DASH-REAL-03 Doanh số và P&L

Doanh thu thuần, số hóa đơn, giá trị trung bình, lợi nhuận gộp, chi phí vận hành, lợi nhuận ròng và trend MUST dùng cùng định nghĩa với báo cáo P&L. Top sản phẩm SHALL lấy từ doanh số thật, tối đa 5. Tăng trưởng SHALL so với kỳ liền trước cùng độ dài; nếu doanh thu kỳ trước bằng 0, trả null và UI hiển thị 'Chưa đủ dữ liệu so sánh'. Cảnh báo COGS ước tính MUST được hiển thị.

#### Scenario: Đối chiếu báo cáo
- GIVEN cùng kỳ và chi nhánh
- WHEN đối chiếu dashboard với P&L
- THEN doanh thu thuần, chi phí và lợi nhuận MUST khớp.

#### Scenario: Kỳ trước không có doanh thu
- GIVEN doanh thu kỳ trước bằng 0
- WHEN hiển thị tăng trưởng
- THEN UI MUST hiển thị trạng thái chưa đủ dữ liệu thay cho phép chia 0.

### Requirement: REQ-DASH-REAL-04 Nhập hàng

`pendingApprovalCount` MUST đếm PO `PENDING_APPROVAL`. `awaitingReceiptCount` MUST đếm PO đã duyệt/chuyển nhà cung cấp nhưng chưa nhận đủ, thuộc các trạng thái `APPROVED`, `DISPATCHED`, `SENT`, `CONFIRMED`, `PARTIALLY_RECEIVED`; không đếm `DRAFT`, `PENDING_APPROVAL`, `CANCELLED`, `REJECTED`, `COMPLETED`. `receivedAmountInPeriod` MUST là tổng `GrandTotal` của GRN `COMPLETED` theo `ConfirmedAtUtc` trong kỳ; UI SHALL gọi là 'Giá trị phiếu nhập đã hoàn tất' vì số tiền này gồm các cấu phần của chứng từ. Mỗi PO/GRN chỉ đếm một lần.

#### Scenario: PO và GRN hợp lệ
- GIVEN có PO chờ duyệt, PO chờ nhận và GRN hoàn tất trong kỳ
- WHEN tải dashboard
- THEN ba chỉ số SHALL phản ánh đúng trạng thái và giá trị chứng từ thuộc phạm vi lọc.

#### Scenario: Phiếu hủy/ngoài kỳ
- GIVEN GRN bị hủy hoặc hoàn tất ngoài kỳ
- WHEN tính `receivedAmountInPeriod`
- THEN GRN đó MUST không được cộng.

### Requirement: REQ-DASH-REAL-05 Kho và nhân viên hiện tại

Dashboard MUST hiển thị số SKU tồn thấp, hết hàng, lô cận hạn và tối đa 5 cảnh báo ưu tiên từ dữ liệu kho hiện tại. Nhân viên SHALL hiển thị tổng hồ sơ và số trạng thái đang hoạt động theo tenant/chi nhánh. Không suy ra 'đang làm ca' từ trạng thái hồ sơ.

#### Scenario: Cảnh báo kho
- GIVEN có SKU dưới ngưỡng và lô cận hạn
- WHEN tải dashboard
- THEN số đếm và preview SHALL khớp kho ở chi nhánh đã chọn.

#### Scenario: Lọc nhân viên theo chi nhánh
- GIVEN nhân viên thuộc nhiều chi nhánh
- WHEN chọn một chi nhánh
- THEN `totalCount` và `activeCount` SHALL chỉ gồm nhân viên chi nhánh đó.

### Requirement: REQ-DASH-REAL-06 Phân quyền và điều hướng

API MUST lấy TenantId từ auth context, chỉ cho role `StoreOwner`/`STORE_OWNER` truy cập và kiểm tra branchId thuộc tenant; chi nhánh ngoài tenant trả 403 và không lộ dữ liệu. Frontend SHALL dẫn mỗi khối đến màn hình chi tiết tương ứng và giữ branchId nếu màn hình đích hỗ trợ.

#### Scenario: Khác tenant
- GIVEN chủ cửa hàng tenant A
- WHEN yêu cầu branchId của tenant B
- THEN API MUST trả 403, không trả dữ liệu tenant B.

#### Scenario: Role nhân viên
- GIVEN tài khoản nhân viên
- WHEN gọi API dashboard Chủ cửa hàng
- THEN API MUST trả 403.

#### Scenario: Mở chi tiết
- GIVEN chủ cửa hàng xem cảnh báo kho/PO
- WHEN chọn liên kết chi tiết
- THEN UI SHALL mở đúng màn hình quản lý tương ứng.

## Acceptance checklist

- [ ] 5 nhóm số liệu thật, không còn số/tên chi nhánh/trạng thái ca giả.
- [ ] Các phép tính P&L và nhập hàng đối chiếu được với phân hệ gốc.
- [ ] Bộ lọc, snapshot, loading/empty/error và chuyển filter nhanh hoạt động đúng.
- [ ] API kiểm tra role, tenant, chi nhánh; preview có giới hạn.
- [ ] Liên kết chi tiết đúng và UI đọc được trên desktop/tablet.
