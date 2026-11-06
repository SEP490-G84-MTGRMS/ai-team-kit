# Specs: Refactor & Hoàn thiện Màn hình Quản lý Lô Hàng & Hạn Dùng (FEFO)

## 1. MODIFIED Requirements

### Requirement: REQ-01 Backend Batch Listing & Multi-dimensional Filtering API
Hệ thống backend MUST cung cấp API `GET /api/v1/batches` hỗ trợ lọc đa tiêu chí, phân trang và sắp xếp dữ liệu lô hàng FEFO.

#### Scenario: Lọc dữ liệu lô hàng theo từ khóa và trạng thái
- GIVEN danh sách lô hàng trong cơ sở dữ liệu
- WHEN người dùng gửi request `GET /api/v1/batches?keyword=HaoHao&status=Warning&pageIndex=1&pageSize=10`
- THEN hệ thống MUST trả về danh sách các lô hàng có tên sản phẩm, SKU hoặc mã lô chứa "HaoHao" và có trạng thái "Warning" (còn 4 - 30 ngày)
- AND kết quả trả về MUST bao gồm tổng số lượng bản ghi `totalCount` và thống kê `kpiSummary`.

#### Scenario: Lọc riêng rẽ theo từng trường chi tiết
- GIVEN danh sách các lô hàng
- WHEN người dùng gửi query với `sku=DY-SUA-01` hoặc `batchCode=BAT-202609-01` hoặc `productName=Vinamilk`
- THEN hệ thống MUST lọc chính xác theo từng trường tương ứng.

---

### Requirement: REQ-02 Real API Client Integration on Frontend
Giao diện frontend MUST loại bỏ dữ liệu tĩnh giả lập `MOCK_BATCH_ITEMS` và gọi API backend thật thông qua `batchApi.ts`.

#### Scenario: Tải danh sách lô hàng từ API
- GIVEN người dùng truy cập trang `/store-owner/batches`
- WHEN trang được mount
- THEN giao diện MUST hiển thị biểu tượng loading spinner trong `.so-list-title`
- AND gọi API `batchApi.getBatches(...)` để hiển thị dữ liệu thực tế từ database
- AND khi gặp lỗi mạng, giao diện MUST hiển thị toast thông báo lỗi thân thiện.

---

### Requirement: REQ-03 Unified UI Architecture (so-list-page.css)
Giao diện màn hình `BatchListPage.tsx`, `BatchFilterBar.tsx`, và `BatchTable.tsx` MUST tuân thủ nghiêm ngặt chuẩn thiết kế `src/styles/so-list-page.css` giống như màn hình `SupplierListPage.tsx`.

#### Scenario: Đồng bộ Header và Action Bar
- GIVEN người dùng ở màn hình Quản lý Lô Hàng
- THEN tiêu đề trang MUST sử dụng `.so-list-header` và `.so-list-title` kèm icon đại diện và loading spinner
- AND các nút tác vụ trên cùng (Xuất Excel, chuyển đổi vai trò) MUST nằm trong `.so-list-header-actions` với chiều cao 32px chuẩn.

#### Scenario: Đồng bộ Filter Bar theo chuẩn so-list-filter
- GIVEN thanh bộ lọc `BatchFilterBar`
- THEN khung bộ lọc MUST sử dụng class `.so-list-filter`
- AND hàng dưới cùng MUST sử dụng `.so-list-filter-row--footer` chứa dropdown Chi nhánh, Trạng thái hạn dùng, cùng hai nút `.so-list-filter-search` ("Tìm kiếm") và `.so-list-filter-reset` ("Đặt lại").

#### Scenario: Bảng dữ liệu và thanh phân trang chuẩn so-list-table-card & so-list-pager
- GIVEN bảng dữ liệu `BatchTable`
- THEN khung bảng MUST sử dụng `.so-list-table-card` gồm phần đầu cố định `.so-list-table-head` và vùng cuộn dữ liệu `.so-list-table-body`
- AND mã lô và mã SKU MUST được bọc trong badge `.so-list-code`
- AND số ngày còn lại (`daysLeft`) MUST hiển thị màu sắc trực quan (Đỏ khi quá hạn, Cam khi khẩn cấp ≤3 ngày, Xanh dương khi cảnh báo ≤30 ngày, Trung tính khi an toàn >30 ngày)
- AND các nút thao tác hàng MUST sử dụng class `.so-list-action-btn`
- AND thanh phân trang MUST sử dụng cấu trúc `.so-list-pager` hiển thị tổng số dòng, dropdown chọn `pageSize` (10, 15, 25, 50) và nút Prev/Next.

---

## 2. ADDED Requirements

### Requirement: REQ-04 Batch Data Seeding & Schema Resilience
Hệ thống backend MUST đảm bảo an toàn cấu trúc bảng `Batches` và nạp sẵn dữ liệu mẫu thực tế cho các cấp độ hạn dùng FEFO.

#### Scenario: Tự động khởi tạo và nạp seed data
- GIVEN hệ thống khởi động với cơ sở dữ liệu PostgreSQL
- WHEN phương thức `DbInitializer.InitializeAsync` được thực thi
- THEN bảng `Batches` MUST được đảm bảo tồn tại an toàn (`CREATE TABLE IF NOT EXISTS`)
- AND `DatabaseSeeder.cs` MUST nạp sẵn ít nhất 12 lô hàng mẫu phủ đủ 4 nhóm trạng thái hạn dùng (`Expired`, `Critical`, `Warning`, `Normal`) cho các sản phẩm tiêu biểu (Hảo Hảo, Omachi, Vinamilk, Coca Cola, G7) cùng liên kết Nhà cung cấp thật.
