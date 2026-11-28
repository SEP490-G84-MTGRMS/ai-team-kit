# Specs: create-purchase-order

## API / Contract

| Method | Path | Request Body / Params | Response Body | Status & Error Codes |
|---|---|---|---|---|
| `GET` | `/api/v1/purchase-orders/matrix-metadata` | `supplierId` (UUID), `branchId` (UUID), `fromDate` (YYYY-MM-DD), `toDate` (YYYY-MM-DD), `viewDays` (7 \| 14) | `OrderMatrixMetadataDto` | `200 OK`, `400 Bad Request`, `404 Not Found` |
| `POST` | `/api/v1/purchase-orders/batch-from-grid` | `CreateBatchPurchaseOrdersCommand` | `BatchPurchaseOrdersResultDto` | `201 Created`, `400 CreditLimitExceeded`, `400 LockHourExceeded`, `400 MoqViolation`, `409 Conflict` |
| `GET` | `/api/v1/purchase-orders/draft-matrix` | `supplierId` (UUID), `branchId` (UUID) | `DraftOrderMatrixDto` | `200 OK`, `404 Not Found` |
| `POST` | `/api/v1/purchase-orders/draft-matrix` | `SaveDraftOrderMatrixCommand` | `{ success: boolean, updatedAtUtc: string }` | `200 OK`, `400 Bad Request` |

---

## ADDED Requirements

### Requirement: REQ-PO-01 Khởi tạo & Hiển thị Ma trận Đặt hàng (Order Matrix Grid)
Hệ thống **MUST** cung cấp giao diện lưới đa chiều cho phép lập kế hoạch đặt hàng theo chu kỳ:
- Dòng là danh sách các sản phẩm đang được phân phối bởi Nhà cung cấp đã chọn (`SupplierProducts`), được nhóm trực quan theo Ngành hàng (`Category`).
- Cột là các ngày giao hàng liên tiếp trong chu kỳ được chọn (mặc định 14 ngày, hoặc 7 ngày).
- Mỗi ô giao điểm giữa Sản phẩm và Ngày giao hàng cho phép nhập số lượng đặt dự kiến (`Quantity`, hỗ trợ cả số nguyên lẫn số lẻ thập phân đối với đơn vị tính Kg/lít).
- Mọi truy vấn dữ liệu **MUST** tự động lọc theo `TenantId` thông qua Global Query Filter.

#### Scenario: Khởi tạo lưới thành công với Nhà cung cấp và Chi nhánh hợp lệ
- **GIVEN** Người dùng truy cập màn hình Đặt hàng Ma trận lưới.
- **WHEN** Người dùng chọn Nhà cung cấp "Tươi Sạch" (SUP-001), Chi nhánh "Kho tổng DC1" và chọn chế độ xem 14 ngày.
- **THEN** Hệ thống hiển thị bảng ma trận gồm toàn bộ sản phẩm của "Tươi Sạch", 14 cột ngày từ ngày bắt đầu đến ngày kết thúc, kèm các hàng tính `Subtotal` theo từng ngành hàng và hàng `Daily Total Qty` ở cuối bảng.

#### Scenario: Cảnh báo khi người dùng đổi Nhà cung cấp khi đang có dữ liệu chưa lưu
- **GIVEN** Người dùng đã nhập số lượng vào một số ô trên ma trận (`dirty = true`).
- **WHEN** Người dùng chọn một Nhà cung cấp khác trên dropdown.
- **THEN** Hệ thống hiển thị hộp thoại cảnh báo: "Bạn có thay đổi chưa lưu trên ma trận. Bạn có chắc chắn muốn chuyển đổi Nhà cung cấp?". Nếu người dùng xác nhận thì mới tải lại dữ liệu của NCC mới.

---

### Requirement: REQ-PO-02 Kiểm soát Lịch giao hàng, Lead Time & Giờ khóa sửa đơn (BR-1)
Hệ thống **MUST** đọc cấu hình lịch giao hàng của NCC (`LeadTimeDays`, `CutoffHour`, `LockHour`, `ActiveDeliveryDays`, `Holidays`):
- Vô hiệu hóa và hiển thị ký hiệu `—` (Off) tại các ngày không thuộc ngày giao hoạt động hoặc trùng ngày nghỉ lễ của NCC.
- Vô hiệu hóa các ngày có khoảng cách tính từ ngày hiện tại nhỏ hơn `LeadTimeDays`.
- Đánh dấu trạng thái `(Khóa) 🔒` và vô hiệu hóa ô nhập liệu nếu thời gian hiện tại đã vượt quá `LockHour` của ngày chốt trước ngày giao đó.

#### Scenario: Ô ngày không phải lịch giao của NCC bị vô hiệu hóa
- **GIVEN** NCC "Tươi Sạch" chỉ giao hàng vào Thứ 2, Thứ 4, Thứ 5 và Thứ 7 (`ActiveDeliveryDays = [1, 3, 4, 6]`).
- **WHEN** Lưới ma trận hiển thị cột ngày Thứ 3 và Chủ Nhật.
- **THEN** Toàn bộ các ô nhập số lượng thuộc cột Thứ 3 và Chủ Nhật hiển thị ký hiệu `—`, có nền xám và bị vô hiệu hóa (`disabled`), người dùng không thể nhập số lượng.

#### Scenario: Ô ngày đã quá giờ khóa sửa đơn (Lock Hour)
- **GIVEN** Ngày giao hàng là `2026-09-28`, NCC quy định `LockHour` là 15:00 ngày hôm trước (`2026-09-27 15:00`).
- **WHEN** Thời gian hiện tại của hệ thống đã là `2026-09-27 15:30`.
- **THEN** Cột ngày `2026-09-28` hiển thị nhãn `(Khóa) 🔒` ở tiêu đề cột và các ô nhập liệu của ngày này bị khóa (`disabled`), không cho phép chỉnh sửa số lượng.

---

### Requirement: REQ-PO-03 Kiểm soát Hạn Mức Tín Dụng Nhà Cung Cấp (BR-2)
Hệ thống **MUST** tính toán kiểm tra hạn mức tín dụng thời gian thực trên giao diện và xác thực lại tại Backend Transaction:
$$\text{Dư nợ AP hiện tại (Open AP)} + \text{Tổng giá trị đơn hàng mới (New Order Amt)} \le \text{Hạn mức nợ NCC (Credit Limit)}$$
- Khi $\text{Tổng nợ mới} > \text{Credit Limit}$, hệ thống **MUST** hiển thị cảnh báo đỏ rực: `⚠️ Vượt hạn mức nợ NCC — Bị chặn đặt đơn`.
- Nút "Submit POs" **MUST** bị khóa hoàn toàn (`disabled = true`).
- Backend **MUST** bọc bước kiểm tra hạn mức tín dụng trong cùng một Database Transaction để ngăn chặn Race Condition khi nhiều chi nhánh cùng gửi đơn đồng thời.

#### Scenario: Tổng giá trị đơn hàng nằm trong hạn mức an toàn
- **GIVEN** Dư nợ AP hiện tại của NCC là 2.800.000 VNĐ, Hạn mức tín dụng là 12.000.000 VNĐ.
- **WHEN** Người dùng nhập số lượng các mặt hàng với tổng giá trị đơn hàng mới là 5.000.000 VNĐ (Tổng nợ = 7.800.000 VNĐ).
- **THEN** Thanh công nợ hiển thị nhãn `Safe — Hợp lệ` màu xanh lá cây và nút "Submit POs" sẵn sàng hoạt động (nếu các điều kiện khác hợp lệ).

#### Scenario: Phát hiện Race Condition vượt hạn mức tín dụng tại thời điểm Commit Transaction
- **GIVEN** Hai chi nhánh A và B cùng mở ma trận khi dư nợ AP là 8.000.000 VNĐ và hạn mức là 12.000.000 VNĐ (còn dư 4.000.000 VNĐ).
- **WHEN** Cả 2 chi nhánh cùng gửi đơn hàng mới trị giá 3.000.000 VNĐ trong cùng một giây. Chi nhánh A được xử lý trước (Tổng nợ thành 11.000.000 VNĐ).
- **THEN** Khi giao dịch của Chi nhánh B được thực thi, Backend phát hiện $\text{Open AP mới (11M)} + \text{Đơn mới (3M)} = 14M > 12M$, Backend tự động rollback transaction và trả về mã lỗi `400 CreditLimitExceeded`, Frontend hiển thị thông báo lỗi chi tiết yêu cầu chi nhánh B kiểm tra lại công nợ.

---

### Requirement: REQ-PO-04 Ràng buộc Số Lượng Đặt Tối Thiểu MOQ (BR-3)
Hệ thống **MUST** kiểm tra quy định số lượng đặt tối thiểu (`MinimumOrderQuantity - MOQ`) cho từng mặt hàng (hỗ trợ cả số nguyên lẫn số lượng lẻ theo Kg):
- Nếu người dùng nhập $0 < Qty < MOQ$, ô nhập liệu **MUST** tự động đổi viền đỏ cảnh báo (`qty-bad`), kèm tooltip: "Dưới MOQ! Số lượng tối thiểu là X".
- Nút "Submit POs" **MUST** bị khóa khi còn tồn tại bất kỳ ô nào vi phạm MOQ.
- Hệ thống **SHALL** cung cấp checkbox `[ ] MOQ Failures` để lọc riêng các dòng sản phẩm đang có ô vi phạm.

#### Scenario: Nhập số lượng nhỏ hơn MOQ gây cảnh báo
- **GIVEN** Sản phẩm "Thịt ba chỉ heo" có MOQ = 3 kg.
- **WHEN** Người dùng nhập số lượng vào ô ngày Thứ 4 là `1.5` kg.
- **THEN** Ô nhập liệu chuyển sang viền đỏ `qty-bad`, tooltip hiển thị "Dưới MOQ! Số lượng tối thiểu là 3", và nút "Submit POs" bị vô hiệu hóa.

#### Scenario: Sử dụng bộ lọc MOQ Failures để khắc phục vi phạm
- **GIVEN** Bảng ma trận có 20 sản phẩm, trong đó có 2 sản phẩm có ô nhập liệu vi phạm MOQ.
- **WHEN** Người dùng tích chọn checkbox `[x] MOQ Failures`.
- **THEN** Bảng ma trận chỉ hiển thị duy nhất 2 dòng sản phẩm có vi phạm MOQ để người dùng nhanh chóng điều chỉnh lại số lượng hợp lệ.

---

### Requirement: REQ-PO-05 Hiển thị Tồn kho thực tế (SOH) & Doanh số bán hàng ngày (BR-4)
Hệ thống **SHALL** hỗ trợ tùy chọn bật/tắt hiển thị số liệu tồn kho và tốc độ bán:
- Khi người dùng tích chọn checkbox `[x] Show Stock (SOH) & Sales/Day`:
  - Lưới bổ sung 2 cột số liệu: Cột `Stock (SOH)` (Tồn kho vật lý tại chi nhánh nhận) và Cột `Sales/Day` (Doanh số bán trung bình ngày).
  - Hỗ trợ công thức gợi ý: $\text{SuggestedQty} = \max(0, \text{MinStockLevel} - \text{OnHandQty} - \text{OnOrderQty})$.

#### Scenario: Bật hiển thị SOH và Sales/Day tại chi nhánh
- **GIVEN** Người dùng đang ở màn hình ma trận đặt hàng của chi nhánh "Kho Thủ Đức (BR-02)".
- **WHEN** Người dùng tích chọn `[x] Show Stock (SOH) & Sales/Day`.
- **THEN** Bảng ma trận mở rộng thêm 2 cột số liệu SOH và Sales/Day tương ứng với số liệu tồn kho và bán hàng của chi nhánh BR-02.

---

### Requirement: REQ-PO-06 Tự động Bóc tách Đơn PO theo Ngày Giao & Định giá Thỏa thuận (BR-5)
Hệ thống **MUST** áp dụng đơn giá mua từ bảng giá thỏa thuận NCC (`SupplierProducts.AgreedPrice`):
$$\text{LineAmount} = Qty \times \text{AgreedPrice}$$
Khi người dùng bấm **Submit POs**, hệ thống **MUST** thực hiện cơ chế **Auto PO Splitting**:
- Quét qua toàn bộ các cột ngày trong ma trận đã chọn.
- Mỗi ngày có $\text{Daily Total Quantity} > 0$ **MUST** được tự động tách thành 1 phiếu PO độc lập, thỏa mãn định danh:
  $$\mathbf{1\ PO = 1\ Nhà\ Cung\ Cấp\ + 1\ Chi\ Nhánh\ + 1\ Ngày\ Giao\ Hàng}$$
- Số lượng từng mặt hàng lưu dạng `DECIMAL(12,3)`. Các ngày có tổng số lượng đặt bằng 0 sẽ không sinh đơn PO.

#### Scenario: Tự động bóc tách thành nhiều đơn PO độc lập theo ngày giao
- **GIVEN** Người dùng nhập ma trận 14 ngày, trong đó có 3 ngày có đặt hàng: Ngày 28/09 (tổng đặt 15.5 kg), Ngày 30/09 (tổng đặt 20 kg) và Ngày 02/10 (tổng đặt 25.2 kg).
- **WHEN** Người dùng bấm "Submit POs" và xác nhận gửi đơn.
- **THEN** Hệ thống tự động tạo chính xác 3 đơn PO độc lập tương ứng với 3 ngày giao trên, mỗi đơn PO ghi nhận đúng sản phẩm, số lượng, đơn giá thỏa thuận và ngày giao cụ thể.

---

### Requirement: REQ-PO-07 Phân quyền Phê duyệt & Ghi đè Số lượng (Store Owner Override)
Hệ thống **MUST** phân định quyền hạn theo vai trò người dùng:
- **Branch Staff / Manager**: Tạo đơn nhu cầu chi nhánh (Draft Store Demand). Khi submit, các đơn PO sinh ra có trạng thái `PENDING_APPROVAL`.
- **Store Owner**:
  - Có quyền xem ma trận của bất kỳ chi nhánh nào hoặc xem tổng hợp toàn chuỗi.
  - Có quyền sửa đổi trực tiếp số lượng đặt hàng của bất kỳ chi nhánh nào (Store Owner Override) trước giờ Cutoff Time.
  - Khi Store Owner submit, các đơn PO sinh ra có trạng thái `APPROVED` / `SENT`.

#### Scenario: Store Owner trực tiếp phê duyệt và phát hành đơn PO
- **GIVEN** Người dùng đăng nhập với vai trò Store Owner.
- **WHEN** Store Owner điều chỉnh số lượng trên ma trận và bấm "Submit POs".
- **THEN** Toàn bộ các đơn PO bóc tách được chuyển thẳng sang trạng thái `APPROVED`, sẵn sàng để gửi đến Nhà cung cấp.

---

### Requirement: REQ-PO-08 Điều hướng Phím tắt & Tiện ích Lưới Nâng Cao
Hệ thống **SHALL** hỗ trợ trải nghiệm nhập liệu chuyên nghiệp tương đương bảng tính:
- Di chuyển giữa các ô nhập liệu bằng các phím mũi tên: Mũi tên Phải (→) hoặc Enter để sang ô tiếp theo, Mũi tên Trái (←) để lùi lại, Mũi tên Xuống (↓) để xuống dòng cùng cột, Mũi tên Lên (↑) để lên dòng cùng cột.
- Cung cấp nút `Copy Prev Week`: Sao chép số lượng đặt của tuần trước đó vào tuần hiện tại đối với các ngày giao mở.
- Cung cấp nút `Excel Download` (xuất file CSV/Excel ma trận hiện tại) và `Excel Upload` (nạp số lượng từ file Excel).
- Cung cấp nút `Save Draft`: Lưu tạm ma trận để làm việc tiếp sau.

---

## Acceptance Checklist
- [ ] **REQ-PO-01**: Hiển thị lưới ma trận đầy đủ dòng sản phẩm theo NCC, nhóm theo ngành hàng, cột ngày theo chu kỳ 7 hoặc 14 ngày.
- [ ] **REQ-PO-02**: Vô hiệu hóa đúng các ngày Off/nghỉ lễ (`—`), hiển thị nhãn Khóa (🔒) đối với các ngày vượt quá giờ Lock Hour.
- [ ] **REQ-PO-03**: Tính toán chuẩn xác công nợ thời gian thực ($\text{Open AP} + \text{New Orders} \le \text{Credit Limit}$); khóa nút Submit khi vượt hạn mức; xác thực transaction tại Backend chống Race Condition.
- [ ] **REQ-PO-04**: Đổi viền đỏ cảnh báo `qty-bad` khi $0 < Qty < MOQ$; lọc đúng các dòng vi phạm qua checkbox `MOQ Failures`.
- [ ] **REQ-PO-05**: Hiển thị chính xác tồn kho thực tế (SOH) và doanh số bán/ngày (Sales/Day) tại chi nhánh nhận.
- [ ] **REQ-PO-06**: Tính đúng thành tiền theo giá thỏa thuận NCC; lưu số lượng chuẩn `DECIMAL(12,3)`; tự động bóc tách ma trận thành $N$ đơn PO độc lập cho $N$ ngày giao có đặt hàng.
- [ ] **REQ-PO-07**: Gán đúng trạng thái PO theo vai trò người tạo (`APPROVED` cho Store Owner, `PENDING_APPROVAL` cho Branch Staff).
- [ ] **REQ-PO-08**: Hỗ trợ di chuyển ô mượt mà bằng phím mũi tên (↑ ↓ ← →, Enter), Copy Prev Week và Excel Download/Upload.

---
## Requirements Sáp Nhập Từ Các Change Con

<!-- Sáp nhập từ change: supplier-order-dispatch-cutoff -->
# Specs: supplier-order-dispatch-cutoff

## API / Contract

| Method / Interface | Route / Component | Request / Props | Response / Output | Lỗi / Cảnh báo |
|---|---|---|---|---|
| `GET` | `/api/purchase-orders/dispatch-hub` | `branchId?: string, supplierId?: string` | `List<DispatchSupplierDto>` gom matrix cells FinalQty > 0 trong 14 ngày | 401 Unauthorized, 403 Forbidden |
| `POST` | `/api/purchase-orders/matrix/split/preview` | `PreviewSplitMatrixRequestDto { SupplierId, Scope (NEAREST/WEEK), ReferenceDate, BranchIds, Note }` | `SplitPreviewResultDto { Groups, SkippedGroups, TotalEstimatedPOs, TotalBranches, TotalSkus, TotalEstimatedAmount, HasMissingPrice }` | 400 Bad Request nếu thiếu SupplierId hoặc Scope không hợp lệ |
| `POST` | `/api/purchase-orders/matrix/split` | `SplitMatrixPoBatchRequestDto { SupplierId, Scope (NEAREST/WEEK), ReferenceDate, BranchIds, Note }` | `SplitMatrixBatchResultDto { Summary, Results: List<SplitGroupResultDto> }` | Partial success: từng group trả về SUCCESS, FAILED, hoặc SKIPPED |
| Component | `SupplierOrderDispatchHubPage` | `/store-owner/purchase-orders/dispatch-hub` | Giao diện điều phối chốt đơn toàn bộ chi nhánh theo NCC | Empty state nếu không có đơn nháp |
| Component | `DispatchConfirmModal` | Props: `isOpen, supplier, scope, onClose, onConfirm` | Popup xác nhận chốt đơn tinh gọn căn giữa màn hình, preview 4 metrics cards, bảng 6 cột | Cảnh báo thiếu giá hoặc quá giờ cutoff |

---

## ADDED Requirements

### Requirement: REQ-01 Top Urgency Bar & Overview Metrics
Hệ thống MUST hiển thị thanh chỉ số tổng quan ở đầu màn hình (Top Urgency Bar), bao gồm tổng số NCC có đơn nháp, tổng số SKU, tổng tiền dự kiến, và phân loại theo 3 mức độ deadline:
- 🔴 Sắp hết hạn (< 2 giờ)
- 🟡 Trong hôm nay
- ⚪ Các ngày sau trong tuần  
Đồng thời, hệ thống MUST cung cấp nút tác vụ nhanh: **"Chốt nhanh các đơn hết hạn hôm nay"**.

#### Scenario: Hiển thị đầy đủ các chỉ số khẩn cấp
- **GIVEN** Người dùng mở màn hình Trung tâm Chốt Đơn (`/store-owner/purchase-orders/dispatch-hub`).
- **WHEN** Dữ liệu đơn nháp được tải.
- **THEN** Thanh chỉ số hiển thị tổng số NCC (VD: 8 NCC), tổng tiền (VD: 45.200.000 đ) và số lượng NCC cần chốt gấp theo deadline.

#### Scenario: Bấm nút Chốt nhanh các đơn hết hạn hôm nay
- **GIVEN** Có 2 NCC có trạng thái sắp hết hạn trong hôm nay và đều đạt điều kiện MOV.
- **WHEN** Người dùng bấm nút "Chốt nhanh các đơn hết hạn hôm nay".
- **THEN** Hệ thống mở modal xác nhận chốt gộp 2 NCC này thành các PO độc lập tương ứng.

---

### Requirement: REQ-02 Urgency Tabs & Supplier Search
Hệ thống MUST cung cấp thanh lọc phân loại (Filter Tabs/Pills) gồm: **Tất cả**, **🔴 Cần chốt gấp**, **Hôm nay**, **Đợt tới trong tuần**, **Đã gửi PO** kèm số đếm bản ghi trên từng tab. Hệ thống SHALL hỗ trợ ô tìm kiếm realtime theo tên NCC, mã NCC hoặc nhóm sản phẩm.

#### Scenario: Lọc danh sách theo tab Cần chốt gấp
- **GIVEN** Danh sách có 8 NCC gồm cả các đơn khẩn cấp và đơn tuần tới.
- **WHEN** Người dùng nhấp chọn tab "🔴 Cần chốt gấp".
- **THEN** Danh sách chỉ hiển thị các thẻ NCC có thời gian Cutoff còn dưới 2 giờ.

#### Scenario: Tìm kiếm NCC theo từ khóa
- **GIVEN** Người dùng đang ở màn hình chốt đơn.
- **WHEN** Người dùng nhập từ khóa "Hương Quê" vào ô tìm kiếm.
- **THEN** Danh sách lọc ngay lập tức chỉ hiển thị NCC "Công ty Thực phẩm Tươi Sống Hương Quê".

---

### Requirement: REQ-03 Two-Tier Supplier Order Accordion Cards with Deep-Link
Mỗi Nhà cung cấp MUST được hiển thị dưới dạng một thẻ (Card) tổng hợp:
- **Tầng 1 (Summary Card)**: Tên & mã NCC, tag nhóm hàng, Cutoff Time kèm Countdown timer đếm ngược, Ngày giao dự kiến, Số SKU, Tổng SL, Tổng tiền tạm tính, trạng thái MOV, và nút [Xem chi tiết], [Chốt & Tạo PO].
- **Deep-Link sang Matrix**: Khi cần xem chi tiết ma trận đặt hàng hoặc chỉnh sửa số lượng trước khi chốt, người dùng SHALL có thể bấm liên kết trực tiếp sang trang Order Matrix với bộ lọc `?supplierId={id}&orderedOnly=true`.

#### Scenario: Xem thẻ NCC và chuyển sang Order Matrix để chỉnh sửa
- **GIVEN** Thẻ NCC "Công ty Thực phẩm Tươi Sống Hương Quê" đang ở trạng thái nháp.
- **WHEN** Người dùng muốn điều chỉnh số lượng của từng mặt hàng cho từng chi nhánh.
- **THEN** Người dùng nhấp vào link "Xem chi tiết ma trận đặt hàng", hệ thống điều hướng sang trang Order Matrix với đúng chi nhánh và NCC đã chọn.

---

### Requirement: REQ-04 Min Order Value (MOV) & Overdue Cutoff Validation
Hệ thống MUST kiểm tra điều kiện Giá trị đơn hàng tối thiểu (MOV) của từng NCC:
- Nếu tổng tiền < MOV: Hiển thị cảnh báo màu vàng/đỏ và vô hiệu hóa nút chốt đơn trực tiếp (hoặc yêu cầu xác nhận kèm nhắc nhở đặt thêm).
- Nếu đã quá giờ Cutoff (Overdue): Hiển thị cảnh báo đỏ và thông báo đơn hàng sẽ tự động dời lịch giao sang ngày kế tiếp hoặc bị bỏ qua nếu chốt theo kỳ hiện tại.

#### Scenario: Cảnh báo chưa đạt giá trị đơn tối thiểu (MOV)
- **GIVEN** NCC "Bao bì Việt Tiến" yêu cầu đơn hàng tối thiểu là 1.000.000 đ.
- **WHEN** Đơn nháp hiện tại của NCC này chỉ có giá trị 850.000 đ.
- **THEN** Thẻ hiển thị cảnh báo "Chưa đạt đơn tối thiểu 1.000.000 đ (Thiếu 150.000 đ)" và nút Chốt đơn bị khóa hoặc chuyển sang trạng thái cảnh báo.

#### Scenario: Cảnh báo đơn quá giờ Cutoff
- **GIVEN** Giờ cutoff của NCC là 15:00 và thời gian hệ thống đã là 15:10.
- **WHEN** Người dùng xem thẻ NCC này.
- **THEN** Hệ thống hiển thị badge "ĐÃ QUÁ GIỜ CUTOFF" và cảnh báo lịch giao không thể chốt cho ngày hiện tại.

---

### Requirement: REQ-05 Single-Center Purchase Order Dispatch Confirmation Modal
Hệ thống MUST cung cấp popup xác nhận chốt đơn NCC tập trung (`DispatchConfirmModal`):
- Vị trí cố định giữa màn hình (`fixed`, căn giữa, `z-index: 99999`) với backdrop mờ tối.
- Tiêu đề hiển thị rõ tên và mã NCC được chọn.
- Segmented control lựa chọn phạm vi: "Ngày giao gần nhất" và "Cả tuần (T2–CN)".
- 4 Card Metrics tóm tắt:
  1. Tổng số PO dự kiến tạo
  2. Số chi nhánh có đơn
  3. Tổng số SKU
  4. Tổng giá trị dự kiến (hiển thị thông báo nếu thiếu giá)
- Bảng Preview Table tinh gọn 6 cột: `Chi nhánh`, `Ngày giao`, `Số SKU`, `SL đặt`, `Giá trị dự kiến`, `Trạng thái`. **KHÔNG CÓ dropdown mũi tên mở rộng sản phẩm** để tránh rối loạn giao diện khi chốt hàng chục chi nhánh.
- Khối cảnh báo danh sách nhóm bị bỏ qua (Skipped Groups) và lý do chi tiết.
- Textarea ghi chú đính kèm gửi NCC (chỉ áp dụng cho các PO được tạo thành công).
- Sticky footer với nút Hủy và nút Submit hành động ("Chốt ngày giao gần nhất" hoặc "Chốt đơn cả tuần"), có loading spinner, disable khi không có group hợp lệ và chống bấm đúp (double-click).

#### Scenario: Hiển thị modal xác nhận và kiểm tra thông tin tóm tắt
- **GIVEN** Người dùng chọn bấm "Chốt đơn" trên thẻ NCC "Hương Quê".
- **WHEN** Modal xác nhận mở ra.
- **THEN** Hệ thống gọi API Preview để lấy danh sách PO dự kiến; modal hiển thị căn giữa màn hình với 4 thẻ metrics và bảng 6 cột tinh gọn rõ ràng.

---

### Requirement: REQ-06 Phạm vi Chốt Đơn (Scope): NEAREST và WEEK
Hệ thống MUST hỗ trợ 2 phạm vi chốt đơn:
1. **NEAREST**:
   - Chọn ngày giao gần nhất trong tương lai **có số lượng đặt hàng (`FinalQty > 0`)** và còn đủ điều kiện chốt (thời điểm hiện tại chưa vượt quá Cutoff time).
   - Bỏ qua các ngày đã quá hạn Cutoff, ngày NCC không hoạt động (`SUPPLIER_OFF`), hoặc ngày không có mặt hàng nào được đặt.
2. **WEEK**:
   - Chọn tất cả các ngày giao hợp lệ từ **Thứ Hai đến Chủ nhật** của tuần hiện tại (hoặc tuần được chọn) theo múi giờ `Asia/Ho_Chi_Minh`.
   - Mỗi ngày giao có số lượng đặt hàng (`FinalQty > 0`) và chưa quá cutoff sẽ được tạo thành PO riêng biệt.

#### Scenario: Chốt theo phạm vi NEAREST
- **GIVEN** NCC có dữ liệu đặt hàng vào Thứ Tư (04/11) và Thứ Sáu (06/11). Thời điểm hiện tại Thứ Tư chưa quá cutoff.
- **WHEN** Người dùng chọn scope "Ngày giao gần nhất" và bấm Chốt.
- **THEN** Hệ thống chỉ tạo PO cho ngày Thứ Tư (04/11). Ngày Thứ Sáu vẫn giữ nguyên ở trạng thái nháp.

#### Scenario: Chốt theo phạm vi WEEK
- **GIVEN** Chi nhánh có lịch đặt Thứ Tư và Thứ Sáu cùng tuần với FinalQty > 0.
- **WHEN** Người dùng chọn scope "Cả tuần (T2–CN)" và xác nhận chốt.
- **THEN** Hệ thống tạo 2 Purchase Order riêng biệt cho Thứ Tư và Thứ Sáu của tuần đó.

---

### Requirement: REQ-07 Nguyên tắc Bất biến 1 PO = 1 Branch + 1 Supplier + 1 DeliveryDate
Hệ thống SHALL bảo đảm nguyên tắc phân rã bất biến:
- Mỗi Purchase Order chỉ tương ứng với đúng **1 Chi nhánh + 1 Nhà cung cấp + 1 Ngày giao hàng cụ thể**.
- TUYỆT ĐỐI KHÔNG gộp nhiều ngày giao vào cùng 1 PO.
- TUYỆT ĐỐI KHÔNG gộp nhiều chi nhánh vào cùng 1 PO.
- Đảm bảo tính duy nhất nghiệp vụ: Trong cùng 1 Tenant, không thể tạo 2 Purchase Order ở trạng thái cam kết (COMMITTED/APPROVED) cho cùng một bộ `(BranchId, SupplierId, DeliveryDate)`.

#### Scenario: Tách thành nhiều PO độc lập khi chốt nhiều chi nhánh và ngày giao
- **GIVEN** Có 2 chi nhánh (Q1 và Q2) cùng đặt hàng của NCC A vào 2 ngày (T4 và T6).
- **WHEN** Store Owner thực hiện chốt đơn cả tuần.
- **THEN** Hệ thống tạo đúng 4 Purchase Order độc lập: (Q1, A, T4), (Q1, A, T6), (Q2, A, T4), (Q2, A, T6).

---

### Requirement: REQ-08 Nguồn Dữ liệu Chốt 100% từ Database Matrix Draft
Hệ thống MUST lấy số lượng chốt trực tiếp từ cơ sở dữ liệu Draft Matrix (`PurchaseOrderDetails` có trạng thái DRAFT):
- Công thức tính: `FinalQty = detail.StoreQty ?? detail.EmployeeQty ?? 0`.
- Client (Frontend) KHÔNG ĐƯỢC PHÉP gửi danh sách số lượng tự tính lên khi chốt để ngăn chặn tình trạng stale data hoặc gian lận số lượng.
- Frontend chỉ gửi `SupplierId`, `Scope`, `ReferenceDate`, `BranchIds` (tùy chọn) và `Note`. Backend sẽ truy vấn và tính toán lại 100%.

#### Scenario: Tính toán số lượng chốt từ DB Draft
- **GIVEN** Chi nhánh có một mặt hàng với `EmployeeQty = 10`, sau đó Store Owner chỉnh sửa `StoreQty = 15` trên Matrix.
- **WHEN** Thực hiện Preview hoặc Chốt đơn.
- **THEN** Backend tự động lấy `FinalQty = 15` từ DB, tính thành tiền theo đơn giá hiện hành và tạo chi tiết PO với số lượng 15.

---

### Requirement: REQ-09 Xử lý Chốt Đơn Hàng Loạt Hỗ trợ Partial Success
Hệ thống MUST xử lý từng nhóm PO độc lập trong một phiên chốt hàng loạt (Batch Execution):
- Mỗi group `(BranchId, DeliveryDate)` được kiểm tra điều kiện riêng biệt.
- Nếu 1 group bị lỗi (ví dụ: đã quá giờ cutoff hoặc đã chốt trước đó), hệ thống KHÔNG ĐƯỢC rollback toàn bộ các group khác.
- Kết quả trả về danh sách chi tiết:
  - `SUCCESS`: Tạo PO thành công kèm `PurchaseOrderId` và `PurchaseOrderCode`.
  - `SKIPPED`: Bỏ qua kèm lý do chuẩn hóa (`CUTOFF_EXPIRED`, `ALREADY_FINALIZED`, `NO_QUANTITY`, `SUPPLIER_OFF`).
  - `FAILED`: Thất bại kèm thông điệp lỗi nghiệp vụ cụ thể (`MIN_ORDER_VALUE_NOT_MET`, `PRODUCT_INACTIVE`).

#### Scenario: Xử lý partial success khi một chi nhánh quá giờ cutoff
- **GIVEN** Chi nhánh A đã quá giờ cutoff 14:00, chi nhánh B có giờ cutoff 16:00 (vẫn còn hạn).
- **WHEN** Store Owner bấm chốt đơn cho cả 2 chi nhánh.
- **THEN** Chi nhánh B tạo PO thành công (Status: SUCCESS). Chi nhánh A bị bỏ qua với lý do "Đã quá thời gian cutoff" (Status: SKIPPED). Hệ thống trả về kết quả rõ ràng cho người dùng.

---

### Requirement: REQ-10 Dry Run Preview API Endpoint
Hệ thống MUST cung cấp API `POST /api/purchase-orders/matrix/split/preview`:
- Thực hiện toàn bộ logic phân rã, kiểm tra cutoff, gom nhóm và tính tiền giả lập trong bộ nhớ mà KHÔNG ghi dữ liệu vào cơ sở dữ liệu.
- Trả về danh sách PO dự kiến tạo, danh sách group bị bỏ qua, tổng số PO, tổng chi nhánh, tổng SKU, tổng giá trị ước tính và cờ `HasMissingPrice`.
- Giúp Frontend render bảng xác nhận chính xác tuyệt đối với Backend trước khi người dùng ra quyết định chốt.

#### Scenario: Gọi Preview trước khi mở modal
- **GIVEN** Store Owner nhấp vào nút "Chốt đơn" của NCC Hương Quê.
- **WHEN** Modal mở ra.
- **THEN** Frontend gọi ngay API Preview; backend tính toán và trả về chính xác số PO sẽ tạo và số tiền, không xảy ra sai lệch số liệu giữa FE và BE.

---

## Acceptance checklist
- [x] REQ-01: Top Urgency Bar hiển thị đầy đủ tổng quan số NCC, tổng tiền, deadline badges và nút Chốt nhanh.
- [x] REQ-02: Bộ lọc Tab pills và ô tìm kiếm hoạt động realtime mượt mà.
- [x] REQ-03: Thẻ NCC tổng hợp hiển thị rõ ràng thông tin deadline và hỗ trợ link sang Matrix khi cần chỉnh sửa.
- [x] REQ-04: Cảnh báo MOV và cảnh báo quá giờ cutoff hiển thị trực quan và chính xác.
- [x] REQ-05: Modal xác nhận hiển thị căn giữa, bảng 6 cột tinh gọn (không có dropdown mũi tên sản phẩm), 4 metrics cards, chống double-click.
- [x] REQ-06: Hỗ trợ 2 phạm vi chốt đơn NEAREST và WEEK chính xác theo múi giờ `Asia/Ho_Chi_Minh`.
- [x] REQ-07: Đảm bảo nguyên tắc 1 PO = 1 Branch + 1 Supplier + 1 DeliveryDate (không gộp ngày).
- [x] REQ-08: Nguồn dữ liệu số lượng chốt 100% từ Database Matrix Draft (`FinalQty = StoreQty ?? EmployeeQty`).
- [x] REQ-09: Batch Split hỗ trợ Partial Success độc lập từng group, phân biệt rõ SUCCESS / FAILED / SKIPPED.
- [x] REQ-10: Dry Run Preview API hoạt động chuẩn xác, không side-effect.
- [x] Giao diện tuân thủ UI Design System, build FE và BE 100% không lỗi.
