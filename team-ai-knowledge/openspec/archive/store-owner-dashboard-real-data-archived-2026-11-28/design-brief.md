# Design Brief: store-owner-dashboard-real-data

Phụ thuộc: `proposal.md`, `exploration.md`; capability `reports-pnl`.

## 1. Luồng người dùng

1. Chủ cửa hàng mở `/store-owner/dashboard`; mặc định xem hôm nay, toàn bộ chi nhánh được phép.
2. Header hiển thị tên cửa hàng thật, bộ lọc kỳ (hôm nay, hôm qua, 7 ngày, tháng này), bộ lọc chi nhánh và thời điểm tải dữ liệu.
3. Hàng đầu hiển thị doanh thu thuần, số hóa đơn, lợi nhuận ròng và việc cần chú ý. Biểu đồ doanh thu theo kỳ nằm ngay dưới.
4. Các khối tiếp theo lần lượt là tài chính, nhập hàng, cảnh báo kho/hạn dùng và nhân viên. Mỗi khối có liên kết đến màn hình chi tiết.
5. Đổi kỳ/chi nhánh tải lại số liệu của cùng phạm vi. Chỉ số snapshot như tồn kho/nhân viên có nhãn 'Hiện tại'; số dư quỹ nếu dùng cũng có nhãn snapshot. Không gắn nhãn 'thời gian thực' nếu không có cơ chế cập nhật tương ứng.

## 2. Bố cục và trạng thái

- Dùng lại `StoreOwnerDashboardPage` và tách các card theo 5 nhóm; thay dữ liệu giả trong `StoreOwnerKpiRow`, `StoreRevenueChartCard`, `FefoWarningCard`, `LowStockWarningCard`, `TopSellingProductsCard`.
- Desktop: KPI và biểu đồ ở trên, nhóm nghiệp vụ ở dưới; tablet: card xếp 2 cột hoặc 1 cột để không tràn ngang. Nút/badge pill, icon SVG đơn sắc, màu chủ đạo theo design system.
- Loading: skeleton cho từng vùng hoặc khung chính; không nhảy về số mẫu.
- Empty: hiển thị 0 đúng khi nguồn trả 0, bảng rỗng ghi 'Chưa có dữ liệu trong kỳ/chi nhánh này'.
- Error: thông báo khối không tải được và nút thử lại. Lỗi toàn trang chỉ khi không thể tải dữ liệu chính.
- Chuyển bộ lọc nhanh phải bỏ kết quả yêu cầu cũ để tránh hiển thị sai kỳ.
- Mỗi khối hiển thị kỳ, chi nhánh và đường dẫn chi tiết; ẩn lối tắt nếu người dùng không có quyền mở màn hình đích.

## 3. Nguồn dữ liệu và API

### Nguồn đã có

| Nhóm | Nguồn hiện có | Khoảng trống cần xác nhận |
|---|---|---|
| Doanh số / P&L | `GET /api/finance/reports/pnl/summary`, `comparison`, `trend` | Công thức doanh thu và trend có cùng bộ lọc; dùng `NetRevenue`, `TotalOrders`, `NetProfit`, `TopProducts` |
| Tài chính | P&L summary; `GET /api/Cashbook/summary` | Cashbook summary không nhận kỳ, nên chỉ dùng dưới nhãn snapshot nếu xuất hiện |
| Nhập hàng | `GET /api/purchase-orders`; phân hệ goods receipt | Cần thống nhất trạng thái PO chờ xử lý/chờ nhận và giá trị thực nhận trong kỳ |
| Kho | `GET /api/inventory` trả `KpiSummary` và lô trong item | Cần truy vấn cảnh báo giới hạn, không phụ thuộc một trang sản phẩm |
| Nhân viên | `GET /api/employees` có lọc chi nhánh/trạng thái | Cần đếm tổng/đang hoạt động trên toàn bộ phạm vi, không dựa trên một trang kết quả |

### Contract đề xuất

`GET /api/store-owner/dashboard?period=today|yesterday|last7days|thisMonth&branchId=<guid?>`

Response `ApiResponse<StoreOwnerDashboardResponse>`:
- `scope`: `tenantId`, `branchId`, `branchName`, `fromUtc`, `toUtc`, `asOfUtc`.
- `sales`: `netRevenue`, `totalOrders`, `averageOrderValue`, `revenueGrowthPercent?`, `trend[]`, `topProducts[]`.
- `finance`: `netProfit`, `operatingExpenses`, `grossProfit`, `cogsSource`, `cogsWarningNotice?`. Dùng chính công thức P&L, không tự suy ra từ số dư quỹ.
- `procurement`: `pendingOrderCount`, `awaitingReceiptCount`, `receivedAmountInPeriod`. Phân loại dựa trên trạng thái PO/GRN thực tế.
- `inventory`: `lowStockCount`, `outOfStockCount`, `expiryWarningCount`, `lowStockItems[]`, `expiringBatches[]`; snapshot tại `asOfUtc`.
- `employees`: `totalCount`, `activeCount`; snapshot tại `asOfUtc`.

Các danh sách preview giới hạn 5 dòng, sắp theo mức độ cần xử lý, không thay thế API danh sách có phân trang. Trường tiền là decimal VND phía backend; thời gian lưu UTC, UI hiển thị Asia/Ho_Chi_Minh. Khoảng kỳ là [fromUtc, toUtc), tính từ lịch Việt Nam. Kỳ 7 ngày gồm hôm nay và 6 ngày trước; tháng này tính từ ngày 1 đến thời điểm xem. So sánh tăng trưởng là kỳ liền trước cùng độ dài, trả null nếu mẫu số bằng 0.

### Xử lý

- Application service tổng hợp dữ liệu từ các nguồn hiện có, dùng cùng tenant và phạm vi chi nhánh đã kiểm tra. Không tạo bảng/migration mới cho màn hình đọc tổng hợp.
- Nếu một phân hệ chưa có truy vấn tổng hợp đủ chính xác, thêm query đọc có giới hạn tại phân hệ đó rồi dùng trong response; tránh tải nhiều trang dữ liệu về client để tự cộng.
- API lỗi xác thực/phân quyền trả 401/403; filter không hợp lệ trả 400; nhánh ngoài tenant trả 403/404 theo chuẩn hiện có, không rò dữ liệu.
- Nếu từng nguồn vận hành lỗi, cân nhắc response có trạng thái riêng cho từng khối và UI hiện lỗi tương ứng; không trả số 0 giả cho nguồn lỗi. Quy tắc lỗi cụ thể cần được xác minh ở bước verify-spec.

## 4. Phân quyền và tính nhất quán

- Chỉ StoreOwner hoặc role quản trị cửa hàng được phép xem đúng phạm vi, theo quyền hiện có; không mở rộng quyền cho nhân viên bán hàng.
- TenantId lấy từ auth context, không nhận từ query. `branchId` phải thuộc tenant và phạm vi truy cập.
- Chỉ số doanh số và tài chính cùng nguồn P&L; không trộn doanh thu gộp với doanh thu thuần.
- Không tính 'nhân viên đang làm ca' từ trạng thái nhân viên. Chỉ hiển thị nếu có nguồn ca thực đã đối chiếu.
- Dữ liệu snapshot không đổi theo kỳ; UI ghi rõ 'Hiện tại'. Dữ liệu nhập hàng theo ngày hoàn tất nhận hàng; PO đang chờ là snapshot.

## 5. Thay đổi DB và kiểm chứng

- Không dự kiến thêm bảng/cột/index/migration; chỉ bổ sung truy vấn đọc khi cần.
- Kiểm chứng đối chiếu doanh số/P&L với API báo cáo, nhập hàng với PO/GRN, cảnh báo với kho, nhân viên với danh sách tương ứng; xác minh phân quyền tenant/chi nhánh và build.
