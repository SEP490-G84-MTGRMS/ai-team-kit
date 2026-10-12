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
- Mỗi ô giao điểm giữa Sản phẩm và Ngày giao hàng cho phép nhập số lượng đặt dự kiến (`Quantity`).
- Mọi truy vấn dữ liệu **MUST** tự động lọc theo `TenantId` thông qua Global Query Filter.

#### Scenario: Khởi tạo lưới thành công với Nhà cung cấp và Chi nhánh hợp lệ
- **GIVEN** Người dùng truy cập màn hình Đặt hàng Ma trận lưới.
- **WHEN** Người dùng chọn Nhà cung cấp "Tươi Sạch" (SUP-001), Chi nhánh "Kho tổng DC1" và chọn chế độ xem 14 ngày.
- **THEN** Hệ thống hiển thị bảng ma trận gồm toàn bộ sản phẩm của "Tươi Sạch", 14 cột ngày từ ngày bắt đầu đến ngày kết thúc, kèm các hàng tính `Subtotal` theo từng ngành hàng và hàng `Daily Total Qty` ở cuối bảng.

#### Scenario: Không tìm thấy sản phẩm nào được gán cho Nhà cung cấp
- **GIVEN** Người dùng chọn Nhà cung cấp mới tạo chưa có sản phẩm nào được liên kết trong hệ thống.
- **WHEN** Hệ thống tải danh mục sản phẩm của NCC này.
- **THEN** Hệ thống hiển thị trạng thái rỗng (Empty State) với thông báo: "Nhà cung cấp chưa có sản phẩm nào được liên kết. Vui lòng gán sản phẩm trước khi lập đơn đặt hàng." kèm nút liên kết đến trang Quản lý Sản phẩm NCC.

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
Hệ thống **MUST** tính toán kiểm tra hạn mức tín dụng thời gian thực trên giao diện và xác thực lại tại Backend:
$$\text{Dư nợ AP hiện tại (Open AP)} + \text{Tổng giá trị đơn hàng mới (New Order Amt)} \le \text{Hạn mức nợ NCC (Credit Limit)}$$
- Khi $\text{Tổng nợ mới} > \text{Credit Limit}$, hệ thống **MUST** hiển thị cảnh báo đỏ rực: `⚠️ Vượt hạn mức nợ NCC — Bị chặn đặt đơn`.
- Nút "Submit POs" **MUST** bị khóa hoàn toàn (`disabled = true`).

#### Scenario: Tổng giá trị đơn hàng nằm trong hạn mức an toàn
- **GIVEN** Dư nợ AP hiện tại của NCC là 2.800.000 VNĐ, Hạn mức tín dụng là 12.000.000 VNĐ.
- **WHEN** Người dùng nhập số lượng các mặt hàng với tổng giá trị đơn hàng mới là 5.000.000 VNĐ (Tổng nợ = 7.800.000 VNĐ).
- **THEN** Thanh công nợ hiển thị nhãn `Safe — Hợp lệ` màu xanh lá cây và nút "Submit POs" sẵn sàng hoạt động (nếu các điều kiện khác hợp lệ).

#### Scenario: Tổng giá trị đơn hàng vượt hạn mức tín dụng của NCC
- **GIVEN** Dư nợ AP hiện tại là 2.800.000 VNĐ, Hạn mức tín dụng là 12.000.000 VNĐ.
- **WHEN** Người dùng nhập số lượng đơn hàng mới đạt giá trị 10.000.000 VNĐ (Tổng nợ = 12.800.000 VNĐ > 12.000.000 VNĐ).
- **THEN** Thanh công nợ lập tức chuyển sang nhãn cảnh báo đỏ: `⚠️ Vượt hạn mức nợ NCC — Bị chặn đặt đơn`, nút "Submit POs" bị khóa lập tức và hiển thị hướng dẫn thanh toán bớt nợ cũ.

---

### Requirement: REQ-PO-04 Ràng buộc Số Lượng Đặt Tối Thiểu MOQ (BR-3)
Hệ thống **MUST** kiểm tra quy định số lượng đặt tối thiểu (`MinimumOrderQuantity - MOQ`) cho từng mặt hàng:
- Nếu người dùng nhập $0 < Qty < MOQ$, ô nhập liệu **MUST** tự động đổi viền đỏ cảnh báo (`qty-bad`), kèm tooltip: "Dưới MOQ! Số lượng tối thiểu là X".
- Nút "Submit POs" **MUST** bị khóa khi còn tồn tại bất kỳ ô nào vi phạm MOQ.
- Hệ thống **SHALL** cung cấp checkbox `[ ] MOQ Failures` để lọc riêng các dòng sản phẩm đang có ô vi phạm.

#### Scenario: Nhập số lượng nhỏ hơn MOQ gây cảnh báo
- **GIVEN** Sản phẩm "Thịt ba chỉ heo" có MOQ = 3 kg.
- **WHEN** Người dùng nhập số lượng vào ô ngày Thứ 4 là `1` kg.
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
- Các ngày có tổng số lượng đặt bằng 0 sẽ không sinh đơn PO.

#### Scenario: Tự động bóc tách thành nhiều đơn PO độc lập theo ngày giao
- **GIVEN** Người dùng nhập ma trận 14 ngày, trong đó có 3 ngày có đặt hàng: Ngày 28/09 (tổng đặt 15 kg), Ngày 30/09 (tổng đặt 20 kg) và Ngày 02/10 (tổng đặt 25 kg).
- **WHEN** Người dùng bấm "Submit POs" và xác nhận gửi đơn.
- **THEN** Hệ thống tự động tạo chính xác 3 đơn PO độc lập tương ứng với 3 ngày giao trên, mỗi đơn PO ghi nhận đúng sản phẩm, số lượng, đơn giá thỏa thuận và ngày giao cụ thể.

#### Scenario: Không thể submit khi toàn bộ ma trận đều có số lượng bằng 0
- **GIVEN** Toàn bộ các ô nhập trong ma trận đều để trống hoặc bằng 0 (`Grand Total Qty = 0`).
- **WHEN** Người dùng xem thanh footer.
- **THEN** Nút "Submit POs" bị vô hiệu hóa (`disabled = true`) kèm thông báo yêu cầu nhập ít nhất 1 số lượng sản phẩm.

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

#### Scenario: Nhân viên chi nhánh gửi bản thảo nhu cầu
- **GIVEN** Người dùng đăng nhập với vai trò Branch Staff tại chi nhánh BR-01.
- **WHEN** Nhân viên hoàn tất nhập ma trận và bấm "Submit POs".
- **THEN** Các đơn PO bóc tách được chuyển vào trạng thái `PENDING_APPROVAL` để chờ Store Owner xem xét phê duyệt.

---

### Requirement: REQ-PO-08 Điều hướng Phím tắt & Tiện ích Lưới Nâng Cao
Hệ thống **SHALL** hỗ trợ trải nghiệm nhập liệu chuyên nghiệp tương đương bảng tính:
- Di chuyển giữa các ô nhập liệu bằng các phím mũi tên: Mũi tên Phải (→) hoặc Enter để sang ô tiếp theo, Mũi tên Trái (←) để lùi lại, Mũi tên Xuống (↓) để xuống dòng cùng cột, Mũi tên Lên (↑) để lên dòng cùng cột.
- Cung cấp nút `Copy Prev Week`: Sao chép số lượng đặt của tuần trước đó vào tuần hiện tại đối với các ngày giao mở.
- Cung cấp nút `Excel Download` (xuất file CSV/Excel ma trận hiện tại) và `Excel Upload` (nạp số lượng từ file Excel).
- Cung cấp nút `Save Draft`: Lưu tạm ma trận để làm việc tiếp sau.

#### Scenario: Di chuyển ô nhập bằng phím mũi tên bàn phím
- **GIVEN** Con trỏ đang focus ở ô nhập số lượng của Sản phẩm A ngày 28/09.
- **WHEN** Người dùng nhấn phím Mũi tên Xuống (↓).
- **THEN** Con trỏ tự động chuyển focus đến ô nhập số lượng của Sản phẩm B (dòng dưới) tại cùng cột ngày 28/09 và bôi đen giá trị hiện tại để người dùng có thể gõ đè số mới.

---

## Acceptance Checklist
- [ ] **REQ-PO-01**: Hiển thị lưới ma trận đầy đủ dòng sản phẩm theo NCC, nhóm theo ngành hàng, cột ngày theo chu kỳ 7 hoặc 14 ngày.
- [ ] **REQ-PO-02**: Vô hiệu hóa đúng các ngày Off/nghỉ lễ (`—`), hiển thị nhãn Khóa (🔒) đối với các ngày vượt quá giờ Lock Hour.
- [ ] **REQ-PO-03**: Tính toán chuẩn xác công nợ thời gian thực ($\text{Open AP} + \text{New Orders} \le \text{Credit Limit}$); khóa nút Submit khi vượt hạn mức.
- [ ] **REQ-PO-04**: Đổi viền đỏ cảnh báo `qty-bad` khi $0 < Qty < MOQ$; lọc đúng các dòng vi phạm qua checkbox `MOQ Failures`.
- [ ] **REQ-PO-05**: Hiển thị chính xác tồn kho thực tế (SOH) và doanh số bán/ngày (Sales/Day) tại chi nhánh nhận.
- [ ] **REQ-PO-06**: Tính đúng thành tiền theo giá thỏa thuận NCC; tự động bóc tách ma trận thành $N$ đơn PO độc lập cho $N$ ngày giao có đặt hàng.
- [ ] **REQ-PO-07**: Gán đúng trạng thái PO theo vai trò người tạo (`APPROVED` cho Store Owner, `PENDING_APPROVAL` cho Branch Staff).
- [ ] **REQ-PO-08**: Hỗ trợ di chuyển ô mượt mà bằng phím mũi tên (↑ ↓ ← →, Enter), Copy Prev Week và Excel Download/Upload.
