# Proposal: create-purchase-order

## Vấn đề
Trong hoạt động bán lẻ chuỗi siêu thị mini và tạp hóa MT-GRMS, hàng hóa đặc thù (đặc biệt là nông sản tươi sống, thịt, trứng, sữa, bánh tươi) có hạn sử dụng rất ngắn (shelf-life ngắn). Việc đặt hàng nhập kho không thể thực hiện dồn dập 1 lần để lưu kho cả tuần vì gây rủi ro hư hỏng, hết hạn rất lớn. 

Hiện tại, hệ thống MT-GRMS gặp các khó khăn cốt lõi:
1. **Thiếu công cụ lập kế hoạch đặt hàng tập trung theo chu kỳ**: Nhân viên chi nhánh và Store Owner phải nhập thủ công từng đơn mua hàng (Purchase Order - PO) lẻ tẻ cho từng ngày giao hàng, dẫn đến tốn thời gian, rời rạc và không có góc nhìn tổng thể về lượng hàng cung ứng cả tuần/chu kỳ.
2. **Thiếu cơ chế tự động kiểm soát lịch giao và giờ chốt đơn của Nhà cung cấp (NCC)**: Không có cơ chế ràng buộc Lead Time (số ngày đặt trước tối thiểu), ngày NCC không giao (ngày Off, ngày nghỉ lễ), cũng như mốc giờ chốt đơn (Cutoff Time) và giờ khóa sửa đơn (Lock Hour).
3. **Rủi ro vượt hạn mức tín dụng NCC (Credit Limit)**: Không có cơ chế kiểm tra thời gian thực giữa dư nợ phải trả hiện tại (Open AP) và giá trị đơn hàng mới so với hạn mức nợ NCC cho phép, dẫn đến nguy cơ nợ xấu hoặc bị NCC đình chỉ giao hàng đột ngột.
4. **Vi phạm số lượng đặt tối thiểu (MOQ)**: Người đặt dễ nhập số lượng lẻ dưới ngưỡng MOQ đã thỏa thuận với NCC, dẫn đến việc NCC từ chối tiếp nhận đơn hoặc phát sinh chi phí vận chuyển phạt.
5. **Thiếu cơ chế phân quyền phối hợp giữa Chi nhánh và Store Owner**: Cửa hàng con cần đề xuất nhu cầu (Draft Demand), trong khi Store Owner cần quyền kiểm tra, ghi đè số lượng (Store Owner Override) và phê duyệt phát hành đơn PO tập trung.

## Mục tiêu
Xây dựng phân hệ **Tạo Đơn Mua Hàng theo Ma Trận Lưới (Order Matrix Grid)** dựa trên thiết kế chuẩn `create_po_grid.html`, đáp ứng trọn vẹn các nguyên tắc nghiệp vụ cốt lõi:
- **Ma trận lưới đa chiều (Order Matrix Grid)**: Dòng là Danh sách sản phẩm theo NCC, Cột là các Ngày giao hàng trong chu kỳ (chế độ xem 7 ngày hoặc 14 ngày).
- **Cơ chế Tự động Bóc tách PO (Auto PO Splitting)**: Khi Store Owner chốt phát hành (Submit POs), hệ thống tự động quét ma trận và bóc tách mỗi ngày giao có tổng số lượng $> 0$ thành 1 đơn PO độc lập, thỏa mãn định danh duy nhất:
  $$\mathbf{1\ PO = 1\ Nhà\ Cung\ Cấp\ (Supplier) + 1\ Chi\ Nhánh\ Nhận\ (Branch) + 1\ Ngày\ Giao\ Hàng\ (DeliveryDate)}$$
- **Kiểm soát toàn diện 5 quy tắc nghiệp vụ (BR-1 đến BR-5)**:
  - **BR-1**: Lịch giao hàng, Lead Time, vô hiệu hóa ngày Off/nghỉ lễ, hiển thị nhãn Khóa (🔒) đối với các ngày vượt quá Lock Hour / Cutoff Time.
  - **BR-2**: Kiểm soát hạn mức tín dụng NCC thời gian thực ($\text{Dư nợ AP} + \text{Giá trị đơn mới} \le \text{Credit Limit}$). Vượt hạn mức sẽ cảnh báo đỏ rực và khóa nút Submit PO.
  - **BR-3**: Ràng buộc MOQ với cảnh báo viền đỏ (qty-bad), tooltip chỉ dẫn mức tối thiểu và bộ lọc nhanh dòng vi phạm MOQ.
  - **BR-4**: Gợi ý đặt hàng thông minh, hiển thị Tồn kho thực tế (SOH) và Doanh số bán trung bình ngày (Sales/Day) tại chi nhánh nhận hàng.
  - **BR-5**: Tính toán giá mua lấy từ bảng giá thỏa thuận NCC (`SupplierProducts.AgreedPrice`), tính Line Amount, Grand Total Qty và Grand Total Amount.
- **Phân quyền vận hành & đồng bộ dữ liệu**:
  - Chi nhánh (Branch Staff / Manager): Nhập Bản thảo nhu cầu (Draft Store Demand).
  - Chủ chuỗi (Store Owner): Xem tổng thể toàn chuỗi hoặc theo chi nhánh, quyền Store Owner Override sửa số lượng trực tiếp trước giờ Cutoff Time, đồng bộ thời gian thực và phê duyệt phát hành đơn PO (`APPROVED` / `SENT`).

## Phạm vi

### In scope
- **Giao diện Order Matrix Grid (React + TypeScript)**:
  - Bộ lọc phạm vi: Chọn Nhà cung cấp (*), Chọn Chi nhánh nhận (*), Khoảng thời gian (From Date - To Date), Chế độ xem (7 ngày / 14 ngày).
  - Thanh thông tin tín dụng NCC: Dư nợ AP hiện tại, Giá trị đơn hàng mới, Hạn mức tín dụng và nhãn trạng thái (Safe / Vượt hạn mức).
  - Thanh thông tin lịch giao NCC: Lead time, Cutoff Time, Lock Hour, ghi chú ngày giao trong tuần.
  - Bộ lọc hỗ trợ: Lọc theo Ngành hàng (Category), Tìm kiếm Tên/SKU, Checkbox [ ] MOQ Failures, Checkbox [ ] Ordered Items, Checkbox [ ] Show Stock (SOH) & Sales/Day.
  - Thao tác ma trận: Nút Prev/This/Next Week, Sao chép tuần trước (Copy Prev Week), Tải file mẫu & Xuất Excel (Excel Download), Nhập dữ liệu từ Excel (Excel Upload).
  - Điều hướng phím tắt nhanh trong bảng: Di chuyển ô bằng phím mũi tên (↑ ↓ ← →) và phím Enter.
  - Bảng ma trận: Nhóm theo ngành hàng, tính Subtotal theo nhóm, tính Daily Total Qty theo cột ngày, tính Total Qty và Total Amount theo dòng sản phẩm.
  - Thanh Footer: Hiển thị Grand Total Qty, Grand Total Amount, Credit Status, các nút Hủy (Cancel), Lưu nháp (Save Draft), Gửi đơn (Submit POs).
  - Logic Auto PO Splitting phía Client & DTO chuẩn bị cho Backend API: Tách đơn PO theo từng ngày giao có số lượng đặt.

### Out of scope
- Quy trình kiểm tra chất lượng và nhận hàng thực tế tại kho chi nhánh (Goods Receipt Note - GRN / Inward).
- Nghiệp vụ thanh toán công nợ NCC bằng Phiếu chi (FE-17 AP Payment Voucher) - chỉ liên kết kiểm tra số dư và thông báo chặn khi vượt hạn mức.
- Nghiệp vụ trả hàng NCC và giảm trừ công nợ (Purchase Return / Debit Note).

## Người dùng liên quan
| Vai trò | Quyền hạn & Trách nhiệm trên hệ thống |
|---|---|
| **Store Owner (Chủ chuỗi / Admin)** | - Xem ma trận nhu cầu của từng chi nhánh hoặc tổng hợp toàn chuỗi.<br>- Thực hiện quyền ghi đè (Store Owner Override) số lượng đặt hàng trước giờ Cutoff Time.<br>- Chốt duyệt và phát hành các đơn PO độc lập sang trạng thái `APPROVED` / `SENT`.<br>- Theo dõi và quản lý công nợ NCC thời gian thực. |
| **Branch Manager / Branch Staff** | - Nhập và đề xuất số lượng đặt hàng cho chi nhánh phụ trách dưới dạng Bản thảo nhu cầu (Draft Store Demand).<br>- Theo dõi các mốc Cutoff Time và Lock Hour của NCC.<br>- Xem số lượng sau khi Store Owner đã điều chỉnh hoặc phát hành. |
| **Nhà cung cấp (Supplier)** | - Tiếp nhận các đơn PO độc lập bóc tách theo đúng từng ngày giao hàng và chi nhánh giao nhận. |

## Tiêu chí thành công
- [ ] **Giao diện ma trận**: Hiển thị đầy đủ danh sách sản phẩm theo NCC và lưới ngày giao hàng (7 ngày / 14 ngày), nhóm theo ngành hàng, cuộn mượt mà với số lượng hàng chục sản phẩm.
- [ ] **Quy tắc BR-1 (Lead time & Cutoff)**: Vô hiệu hóa chính xác các ngày không giao hàng (ngày Off, ngày nghỉ lễ). Ô nhập của các ngày vượt quá Lock Hour / Cutoff Time hiển thị nhãn Khóa (🔒) và bị vô hiệu hóa chỉnh sửa.
- [ ] **Quy tắc BR-2 (Kiểm soát hạn mức nợ)**: Hiển thị và cập nhật thời gian thực $\text{Open AP} + \text{New Order Amount} \le \text{Credit Limit}$. Khi tổng nợ vượt hạn mức, nhãn cảnh báo đỏ rực hiển thị và nút "Submit POs" bị khóa hoàn toàn.
- [ ] **Quy tắc BR-3 (Kiểm soát MOQ)**: Các ô nhập có $0 < Qty < MOQ$ tự động đánh dấu viền đỏ cảnh báo (`qty-bad`), hiển thị tooltip chỉ dẫn MOQ. Checkbox lọc `MOQ Failures` lọc chính xác 100% các dòng có ô vi phạm.
- [ ] **Quy tắc BR-4 (Gợi ý SOH & Sales/Day)**: Checkbox `Show Stock (SOH) & Sales/Day` hiển thị đầy đủ tồn kho thực tế và doanh số trung bình ngày của sản phẩm tại chi nhánh.
- [ ] **Quy tắc BR-5 (Đơn giá & Tổng tiền)**: Giá nhập sỉ được lấy từ bảng giá thỏa thuận của NCC (`SupplierProducts.AgreedPrice`), tính đúng thành tiền từng dòng, từng ngày và tổng giá trị đơn hàng.
- [ ] **Cơ chế Auto PO Splitting**: Khi Store Owner bấm Submit POs, hệ thống bóc tách chính xác ma trận thành $N$ đơn PO độc lập ứng với $N$ ngày giao có đặt hàng, mỗi đơn PO gắn đúng 1 Nhà cung cấp, 1 Chi nhánh nhận và 1 Ngày giao hàng.
- [ ] **Điều hướng & Phím tắt**: Hỗ trợ di chuyển giữa các ô nhập số lượng bằng các phím mũi tên (↑ ↓ ← →) và phím Enter.
