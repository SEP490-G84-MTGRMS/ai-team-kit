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

---
## Requirements Sáp Nhập Từ Các Change Con

<!-- Sáp nhập từ change: batch-list -->
# Specs: batch-list (Quản lý Lô Sản Phẩm & Hạn Sử Dụng - FEFO Expiry Management)

## API / Contract (Data Types & Interfaces)

| Type / Interface | Scope | Fields / Description |
|---|---|---|
| `BatchStatus` | Frontend Enum | `'Expired' \| 'Critical' \| 'Warning' \| 'Normal'` |
| `BatchItem` | Entity Interface | `id`, `batchCode`, `productId`, `sku`, `productName`, `categoryName`, `branchId`, `branchName`, `supplierId`, `supplierName`, `mfgDate`, `expiryDate`, `daysLeft`, `qtyInitial`, `qtyCurrent`, `unit`, `costPrice`, `totalValuation`, `status`, `zoneArea`, `shelfLocation`, `originalGrnNo`, `movements: BatchMovement[]` |
| `BatchMovement` | Sub-interface | `id`, `timestamp`, `type: 'RECEIPT' \| 'POS_SALE' \| 'TRANSFER' \| 'WRITE_OFF' \| 'FEFO_LOCK'`, `quantity: number`, `documentCode: string`, `actor: string`, `notes?: string` |
| `BatchFilterState` | Filter State | `keyword: string`, `branchId: string`, `status: 'ALL' \| BatchStatus`, `pageIndex: number`, `pageSize: number`, `sortBy?: string`, `sortOrder?: 'asc' \| 'desc'` |
| `BatchKpiSummary` | Metrics Summary | `totalBatches: number`, `expiredCount: number`, `criticalCount: number`, `warningCount: number`, `normalCount: number`, `expiredValue: number` |

---

## ADDED Requirements

### Requirement: REQ-01 Expiry Risk KPI Summary Cards
Hệ thống MUST hiển thị 4 thẻ chỉ số tổng quan phân tầng mức độ rủi ro của hạn sử dụng dựa trên ngày hiện tại của hệ thống.

#### Scenario: Tính toán chỉ số và hiển thị số lượng theo 4 cấp độ
- GIVEN danh sách các lô hàng đang lưu kho của chi nhánh hoặc toàn chuỗi
- WHEN trang Quản lý Lô được tải hoặc khi bộ lọc Chi nhánh thay đổi
- THEN hệ thống MUST tính toán và hiển thị chính xác số lượng lô cho từng nhóm:
  - `Expired`: Các lô có `daysLeft <= 0` (Nền đỏ nhạt, cảnh báo bắt buộc xuất hủy)
  - `Critical`: Các lô có `1 <= daysLeft <= 3` (Nền cam nhạt, cảnh báo xả khẩn cấp)
  - `Warning`: Các lô có `4 <= daysLeft <= 30` (Nền xanh nhạt, đề xuất giảm giá FEFO)
  - `Normal`: Các lô có `daysLeft > 30` (Nền trắng, hạn an toàn)

#### Scenario: Nhấp vào thẻ KPI để lọc nhanh danh sách
- GIVEN người dùng đang xem trang Quản lý Lô
- WHEN người dùng nhấp vào thẻ KPI "Expired"
- THEN bảng dữ liệu MUST tự động lọc chỉ hiển thị các lô có trạng thái `Expired`, dropdown Trạng thái trên thanh filter tự động chọn "Expired".
- WHEN người dùng nhấp lại vào thẻ "Expired" đang chọn
- THEN bộ lọc trạng thái MUST được hoàn nguyên về "Tất cả" (`ALL`).

---

### Requirement: REQ-02 Multi-dimensional Batch Filter Bar
Hệ thống MUST cung cấp thanh bộ lọc đa chiều hỗ trợ tìm kiếm và thu hẹp danh sách lô hàng theo thời gian thực.

#### Scenario: Lọc kết hợp theo Chi nhánh và Từ khóa
- GIVEN danh sách lô hàng trên toàn chuỗi
- WHEN người dùng chọn chi nhánh "BR-01 Main Store" và nhập từ khóa "Sữa tươi"
- THEN bảng dữ liệu MUST chỉ hiển thị các lô hàng thuộc chi nhánh "BR-01" và có tên sản phẩm hoặc SKU hoặc mã lô chứa chuỗi "Sữa tươi".

#### Scenario: Khôi phục bộ lọc mặc định khi nhấn Reset
- GIVEN người dùng đang áp dụng nhiều tiêu chí lọc
- WHEN người dùng nhấn nút "🔄 Đặt lại" (Reset)
- THEN hệ thống MUST đưa các trường lọc về giá trị mặc định (`branchId = 'ALL'`, `status = 'ALL'`, `keyword = ''`), trang hiện tại trở về 1 và URL search params được làm sạch.

#### Scenario: Đồng bộ bộ lọc với tham số URL (Deep-linking)
- GIVEN người dùng truy cập đường dẫn `/store-owner/batches?sku=DY-SUA-01` từ màn hình Phiếu nhập kho GRN
- WHEN trang tải xong
- THEN ô tìm kiếm MUST tự động điền "DY-SUA-01" và danh sách chỉ hiển thị các lô của sản phẩm này.

---

### Requirement: REQ-03 FEFO Batch Data Table
Hệ thống MUST hiển thị bảng dữ liệu 11 cột chuẩn prototype `batch_list.html`, mặc định ưu tiên sắp xếp theo nguyên tắc FEFO.

#### Scenario: Sắp xếp mặc định theo FEFO
- GIVEN danh sách lô hàng được tải lên
- WHEN người dùng chưa chọn tiêu chí sắp xếp thủ công
- THEN hệ thống MUST sắp xếp các lô theo thứ tự tăng dần của `expiryDate` (các lô quá hạn và cận hạn nhất luôn đứng ở các dòng đầu tiên).

#### Scenario: Hiển thị nổi bật số ngày còn lại (Days Left)
- GIVEN một lô hàng có hạn sử dụng
- WHEN hệ thống kết xuất dòng dữ liệu
- THEN cột `Days Left` MUST hiển thị định dạng số rõ nét:
  - Nếu số âm: Chữ đỏ đậm, in đậm (`-11 ngày`)
  - Nếu từ 0 đến 3 ngày: Chữ cam đậm (`1 ngày`)
  - Nếu từ 4 đến 30 ngày: Chữ xanh dương (`9 ngày`)
  - Nếu trên 30 ngày: Chữ trung tính (`50 ngày`)

---

### Requirement: REQ-04 Slide-over Batch Detail Drawer (UI-02-02)
Hệ thống MUST cung cấp Drawer xem chi tiết từng lượt hàng khi người dùng bấm vào tên sản phẩm hoặc nút "Detail".

#### Scenario: Mở Drawer xem thông tin chi tiết lô
- GIVEN người dùng đang ở bảng danh sách lô hàng
- WHEN người dùng nhấp vào nút "👁️ Detail" tại một lô hàng
- THEN một Slide-over Drawer MUST trượt ra từ cạnh phải màn hình
- AND hiển thị đầy đủ:
  - Tên sản phẩm, SKU, Chi nhánh, Nhà cung cấp
  - Ngày sản xuất, Hạn sử dụng, Số ngày còn lại
  - Số lượng ban đầu đã nhập (`qtyInitial`), Số lượng tồn hiện tại (`qtyCurrent`)
  - Đơn giá vốn nhập kho, Tổng giá trị tồn kho của lô
  - Khu vực kho (`Zone Area`), Vị trí quầy kệ (`Shelf Location`)
  - Mã phiếu nhập kho gốc (`Original GRN No`) có liên kết xem phiếu nhập
  - Bảng lịch sử luân chuyển (`Movement History`) với các mốc Nhập kho, Bán POS, Cảnh báo FEFO.

#### Scenario: Cập nhật vị trí kệ hàng trực tiếp từ Drawer
- GIVEN Drawer chi tiết lô đang mở
- WHEN người dùng nhấn nút "📍 Đổi vị trí kệ" và nhập mã vị trí mới (ví dụ: `C-B-05`)
- THEN hệ thống MUST cập nhật vị trí kệ của lô hàng đó và hiển thị thông báo thành công.

---

### Requirement: REQ-05 FEFO Action Handlers (Discount & Write-off)
Hệ thống MUST cung cấp các hành động xử lý nghiệp vụ tức thì tương ứng với từng mức độ rủi ro của lô hàng.

#### Scenario: Kích hoạt giảm giá FEFO cho lô Warning / Critical
- GIVEN một lô hàng thuộc trạng thái `Warning` hoặc `Critical`
- WHEN người dùng bấm nút "🏷️ Discount"
- THEN hệ thống MUST mở Modal xác nhận áp dụng giảm giá kích cầu FEFO với các mức chiết khấu đề xuất (15%, 20%, 30%, 50%)
- AND khi người dùng xác nhận, hiển thị Toast thông báo áp dụng giảm giá thành công cho sản phẩm.

#### Scenario: Kích hoạt xuất hủy (Write-off) cho lô Expired / Critical
- GIVEN một lô hàng thuộc trạng thái `Expired` hoặc `Critical`
- WHEN người dùng bấm nút "🗑️ Write-off"
- THEN hệ thống MUST hiển thị hộp thoại cảnh báo xác nhận xuất hủy hàng hỏng quá hạn
- AND khi người dùng xác nhận, thực hiện cập nhật trừ tồn hoặc điều hướng an toàn.

---

### Requirement: REQ-06 In báo cáo kiểm kê Hạn sử dụng (Print Report)
Hệ thống MUST cung cấp tính năng in báo cáo danh sách lô hàng cận date và quá hạn theo chuẩn in ấn khổ A4 ngang.

#### Scenario: Người dùng nhấn In báo cáo
- GIVEN người dùng đã lọc danh sách lô hàng mong muốn
- WHEN người dùng nhấn nút "🖨️ In báo cáo" (Print Report)
- THEN hệ thống MUST kích hoạt giao diện in của trình duyệt (`window.print()`)
- AND CSS in ấn (@media print) MUST ẩn bỏ các thành phần điều hướng (Sidebar, Topbar, Filter controls) và chỉ hiển thị tiêu đề báo cáo, ngày in, và bảng dữ liệu lô hàng sạch sẽ.

---

### Requirement: REQ-07 Navigation & Route Registration
Hệ thống MUST tích hợp màn hình Quản lý Lô vào hệ thống định tuyến và Menu điều hướng của MT-GRMS.

#### Scenario: Định tuyến ứng dụng
- GIVEN người dùng đã đăng nhập với vai trò Store Owner
- WHEN người dùng truy cập URL `/store-owner/batches` hoặc `/store-owner/expiry`
- THEN hệ thống MUST tải thành công trang `BatchListPage`.

#### Scenario: Truy cập qua Menu điều hướng
- GIVEN người dùng đang ở bất kỳ trang nào trong cổng Store Owner
- WHEN người dùng mở menu "Hàng hóa" -> "Kho & Hạn dùng (FEFO)"
- THEN mục "Quản lý lô & Hạn sử dụng" MUST xuất hiện và điều hướng đến `/store-owner/batches`.

---

## MODIFIED Requirements
*Không có requirements nào bị thay đổi.*

---

## REMOVED Requirements
*Không có requirements nào bị gỡ bỏ.*

---

## Acceptance checklist
- [ ] REQ-01: 4 Thẻ KPI Summary Cards hiển thị chính xác số lượng lô Expired, Critical, Warning, Normal và hỗ trợ click để lọc nhanh.
- [ ] REQ-02: Bộ lọc hợp nhất lọc được theo Chi nhánh, Trạng thái, Từ khóa và hỗ trợ khôi phục bộ lọc khi nhấn Đặt lại.
- [ ] REQ-03: Bảng dữ liệu 11 cột hiển thị chính xác Days Left, định dạng màu sắc rủi ro, và mặc định sắp xếp theo FEFO.
- [ ] REQ-04: Slide-over Drawer mở êm ái khi bấm Detail, hiển thị nguồn gốc phiếu nhập GRN, vị trí quầy kệ và lịch sử luân chuyển.
- [ ] REQ-05: Modal Giảm giá FEFO và Xác nhận Xuất hủy hoạt động trơn tru với phản hồi Toast thông báo.
- [ ] REQ-06: Chế độ In báo cáo trình duyệt hiển thị sạch đẹp, ẩn toàn bộ navigation.
- [ ] REQ-07: Định tuyến `/store-owner/batches` và menu trong `AppTopNav.tsx` hoạt động chuẩn xác 100%.
- [ ] Kiểm thử biên dịch `npm run build` thành công, 0 lỗi TypeScript và 0 lỗi lint.


<!-- Sáp nhập từ change: fefo-batch-tracking -->
# Specs: FEFO Batch Tracking

## Service
`IBatchAllocationService.Allocate(productId, branchId, qty) → List<BatchAllocation>`

## API
- `GET /api/batches?productId=&branchId=&alertLevel=` — danh sách lô
- `GET /api/batches/expiring?days=30` — lô sắp hết hạn

## Yêu cầu
- **REQ-1**: Phân bổ theo `ExpiryDate` tăng dần; `NULL` xếp cuối
- **REQ-2**: Không bao giờ phân bổ từ lô đã hết hạn
- **REQ-3**: Toàn bộ phân bổ trong 1 transaction; thiếu tồn → rollback, `409 InsufficientStock`
- **REQ-4**: Mỗi lô bị trừ sinh đúng 1 `StockMovements` (`MovementType = 'SaleOut'`)
- **REQ-5**: Job 00:05 hằng ngày cập nhật `AlertLevel`
