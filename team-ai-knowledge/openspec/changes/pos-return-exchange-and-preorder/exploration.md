# EXP-2026-11-01-POS-RETURN-PREORDER: Khảo Sát Nghiệp Vụ Đổi Trả Hàng, Phân Quyền Hủy Đơn & Đơn Đặt Trước Giữ Kho

## 1. Problem Statement
Hệ thống POS bán lẻ của MT-GRMS hiện đang gặp 3 khoảng trống nghiệp vụ cần hoàn thiện:
1. **Thiếu cơ chế Đổi / Trả hàng (Return & Exchange)**: Khách hàng mua hàng mang về nhưng sau đó đem đổi sang sản phẩm khác (hoặc trả hàng lấy lại tiền). Chưa có giao diện và API cho phép chọn sản phẩm trả, chọn sản phẩm đổi và tự động tính bù trừ chênh lệch (Net Amount).
2. **Nguy cơ thất thoát tiền & hàng do thiếu phân quyền Hủy đơn**: Nhân viên thu ngân (`CASHIER`) hiện có thể bấm hủy bất kỳ hóa đơn nào (kể cả hóa đơn đã thanh toán tiền mặt từ trước), tạo lỗ hổng gian lận thu ngân bỏ túi tiền mặt rồi hủy hóa đơn.
3. **Đơn đặt trước (Pre-Order) giữ kho thiếu chế tài cọc**: Chưa có kiểm soát mức đặt cọc tối thiểu ($\ge 10\%$), dẫn đến rủi ro khách "bỏ bom" làm tồn kho FEFO bị khóa ảo; đồng thời chưa có quy định hiển thị rõ ràng chi nhánh nhận hàng.

## 2. Context & Background
* **Backend hiện tại**:
  * Entity `Order` và `OrderDetail` nằm trong `MT_GRMS.Domain.Entities.Sales`.
  * `OrderService` có sẵn các hàm: `CreateOrderAsync`, `CreatePreOrderAsync`, `FulfillPreOrderAsync`, `CancelOrderAsync`.
  * Quản lý tồn kho: `BranchStocks` quản lý theo `(BranchId, ProductId, BatchId)`.
* **Frontend hiện tại**:
  * `PosCheckoutPage.tsx`: Hỗ trợ đa tab (`Hóa đơn 1`, `Hóa đơn 2`), quét mã vạch, thanh toán Tiền mặt / VietQR / Nợ.
  * `InvoiceManagementPage.tsx`: Quản lý danh sách Hóa đơn bán lẻ và Đơn đặt trước.
* **Tham chiếu ngành**: KiotViet, Sapo POS đều tách biệt rõ Phiếu trả hàng và Hóa đơn bán lẻ, bù trừ tức thì trên 1 màn hình và khóa quyền hủy hóa đơn đối với tài khoản thu ngân.

## 3. Assumptions & Non-Goals
### Assumptions:
* Hóa đơn gốc chỉ được đổi/trả khi đang ở trạng thái `Completed`.
* Số lượng sản phẩm khách trả lại không được vượt quá số lượng đã mua trong hóa đơn gốc.
* Hàng khách trả lại phải còn nguyên vẹn để hoàn lại vào tồn kho `BranchStocks` của chi nhánh.
* Mô hình cọc đơn đặt trước áp dụng tối thiểu 10% tổng giá trị đơn hàng.
* Khách nhận hàng tại chi nhánh đã đăng ký đặt đơn.

### Non-Goals:
* Không tích hợp cổng thanh toán tự động qua thiết bị loa phần cứng (dùng âm thanh Web Audio và Toast notification).
* Không hỗ trợ chuyển hàng bằng xe tải liên chi nhánh trong phạm vi tính năng này.

## 4. Phân Tích Các Phương Án Kỹ Thuật

### Vấn đề 1: Nghiệp vụ Đổi / Trả hàng
* **Phương án A (Hủy hóa đơn cũ + Tạo hóa đơn mới)**:
  * *Ưu điểm*: Tận dụng code tạo đơn hiện tại.
  * *Nhược điểm*: Phá vỡ toàn vẹn kế toán, làm thay đổi doanh thu ngày cũ, thu ngân phải nhập lại toàn bộ các sản phẩm khách không đổi. ❌ **Loại**.
* **Phương án B (Phiếu Trả Hàng + Hóa Đơn Mới liên kết - Chuẩn KiotViet)**:
  * *Ưu điểm*:
    * Giữ nguyên vẹn hóa đơn gốc `Completed` làm bằng chứng lịch sử.
    * Tạo giao dịch bù trừ: Hàng trả hoàn kho `+Qty`, hàng mới trừ kho `-Qty`.
    * Tự động tính chênh lệch: Nếu `Hàng mới > Hàng trả` $\rightarrow$ Thu thêm tiền; nếu `Hàng mới < Hàng trả` $\rightarrow$ Thối tiền/giảm nợ.
    * Thu ngân thao tác trọn gói trong 1 modal trực quan.
  * *Nhược điểm*: Cần thêm DTO và endpoint xử lý đổi trả.
  * 👉 **CHỌN PHƯƠNG ÁN B**.

### Vấn đề 2: Phân quyền Hủy đơn
* **Phương án A (Chỉ kiểm tra ở Frontend)**:
  * *Nhược điểm*: Dễ bị bypass nếu gọi trực tiếp API. ❌ **Loại**.
* **Phương án B (Phân quyền 2 lớp Frontend & Backend)**:
  * *Frontend*: Nếu user có role `CASHIER`, ẩn nút "Hủy đơn" hoặc hiển thị thông báo "Chức năng yêu cầu quyền Quản lý".
  * *Backend*: Trong `CancelOrderAsync`, kiểm tra `currentUser.Role`. Nếu là `CASHIER`, ném `UnauthorizedAccessException` / `403 Forbidden`. Chỉ cho phép `STORE_OWNER`, `MANAGER`, `ADMIN`.
  * 👉 **CHỌN PHƯƠNG ÁN B**.

### Vấn đề 3: Đơn đặt trước giữ kho (Pre-Order)
* **Phương án**:
  * Backend bổ sung validation: `if (request.DepositAmount < 0.10m * finalAmount) throw new InvalidOperationException("Tiền đặt cọc tối thiểu phải bằng 10% tổng giá trị đơn hàng.");`
  * Frontend: Validate số tiền cọc $\ge 10\%$ ngay trên form và hiển thị chi nhánh nhận hàng.
  * 👉 **CHỌN TRIỂN KHAI**.

## 5. Rủi Ro & Biện Pháp Giảm Thiểu
1. **Rủi ro âm kho khi đổi sang hàng mới**: Món hàng khách muốn đổi sang có thể không đủ tồn kho tại chi nhánh.
   * *Giải pháp*: Backend kiểm tra tồn kho FEFO của món mới trước khi thực thi giao dịch đổi. Nếu không đủ $\rightarrow$ rollback toàn bộ giao dịch và báo lỗi chi tiết.
2. **Rủi ro sai lệch công nợ khi trả hàng**: Nếu đơn cũ mua nợ, trả hàng thì hoàn tiền mặt hay giảm nợ?
   * *Giải pháp*: Cho phép thu ngân lựa chọn hình thức hoàn trả: Giảm trừ vào sổ nợ khách hàng (nếu khách còn nợ) hoặc Hoàn tiền mặt.
