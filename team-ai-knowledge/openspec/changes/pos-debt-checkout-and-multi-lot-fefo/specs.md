# Specification Delta: POS Debt Checkout, Print Decoupling & Multi-Lot FEFO

## Capability: pos-sales-order

## MODIFIED Requirements

### Requirement: REQ-POS-DEBT-01 Thanh toán ghi nợ khách hàng (Credit Sale)
Hệ thống **MUST** cho phép nhân viên bán hàng POS hoàn tất đơn hàng với phương thức thanh toán `CREDIT` (Bán nợ) đối với khách hàng đã được cấu hình cho phép ghi nợ (`AllowDebt = true`) và số tiền nợ còn nằm trong hạn mức (`DebtLimit`).
Hệ thống **MUST** đồng bộ các thuộc tính công nợ của thực thể `Customer` xuống bảng cơ sở dữ liệu `Customers`, bao gồm cột `LastRepaymentAtUtc`, `Notes` và `RowVersion`. Khi đơn hàng nợ tạo thành công, hệ thống **MUST** cập nhật tăng `TotalDebt` của khách hàng và tự động tạo bản ghi trong bảng `CustomerDebtInvoices` và `CustomerDebtEntries`.

#### Scenario: Thanh toán bán nợ thành công cho khách hàng có hạn mức
- **GIVEN** Khách hàng Bác Minh (`KH-AN-001`) thuộc tenant `tenant_an_nhien_02` có `AllowDebt = true`, `DebtLimit = 5,000,000 VND`, và dư nợ hiện tại `TotalDebt = 0 VND`.
- **WHEN** Nhân viên POS tạo đơn hàng tổng trị giá `58,000 VND` và chọn phương thức thanh toán `CREDIT`.
- **THEN** Hệ thống **MUST** tạo đơn hàng trạng thái `Completed`, không ném lỗi missing column `LastRepaymentAtUtc`.
- **AND** Hệ thống **MUST** tăng `TotalDebt` của khách hàng lên `58,000 VND`.
- **AND** Hệ thống **MUST** tạo bản ghi hóa đơn nợ trong `CustomerDebtInvoices` với số tiền nợ bằng `58,000 VND`.

#### Scenario: Từ chối thanh toán bán nợ khi vượt quá hạn mức nợ cho phép
- **GIVEN** Khách hàng có `AllowDebt = true`, `DebtLimit = 1,000,000 VND`, và dư nợ hiện tại `TotalDebt = 950,000 VND`.
- **WHEN** Nhân viên POS tạo đơn hàng bán nợ trị giá `100,000 VND`.
- **THEN** Hệ thống **MUST** từ chối đơn hàng và trả về thông báo lỗi vi phạm hạn mức nợ.

---

### Requirement: REQ-POS-PRINT-02 Độc lập giữa tạo đơn hàng và in hóa đơn (Print Decoupling)
Hệ thống POS Frontend **MUST** thực hiện lưu đơn hàng thành công trên máy chủ trước khi gửi lệnh in hóa đơn.
Nếu quá trình in hóa đơn thất bại, máy in ngoại vi mất kết nối, hoặc nhân viên không in bill, hệ thống **MUST** giữ nguyên trạng thái đơn hàng đã hoàn tất thành công trong CSDL, không được hủy hoặc rollback đơn hàng.

#### Scenario: Hoàn tất đơn hàng thành công khi không có máy in hoặc máy in lỗi
- **GIVEN** Giỏ hàng POS có sản phẩm hợp lệ và khách hàng thanh toán thành công (tiền mặt/chuyển khoản/nợ).
- **WHEN** Lệnh in hóa đơn `posOrderApi.printDirect` bị lỗi hoặc người dùng đóng trình duyệt trước khi in.
- **THEN** Đơn hàng tại máy chủ **MUST** vẫn ở trạng thái `Completed`.
- **AND** Tồn kho và sổ quỹ / công nợ **MUST** được ghi nhận đầy đủ, không bị ảnh hưởng bởi tiến trình in hóa đơn.

---

### Requirement: REQ-POS-FEFO-03 Khấu trừ tồn kho tự động theo hạn dùng FEFO vắt qua nhiều lô (Multi-Lot FEFO)
Hệ thống **MUST** tự động trừ tồn kho theo nguyên tắc Hạn dùng trước - Xuất trước (First Expired, First Out - FEFO).
Khi số lượng sản phẩm khách mua lớn hơn số lượng tồn của lô hàng có hạn dùng gần nhất, hệ thống **MUST** khấu trừ hết toàn bộ số lượng của lô gần nhất (về 0), sau đó tiếp tục khấu trừ số lượng còn lại vào lô kế tiếp theo thứ tự hạn dùng tăng dần (`ExpiryDate ASC`).

#### Scenario: Bán 40 sản phẩm cấn trừ liên hoàn qua Lô A (tồn 20) và Lô B (tồn 30)
- **GIVEN** Sản phẩm X tại chi nhánh có 2 lô hàng còn hạn dùng:
  - Lô A: hạn dùng `2026-12-01`, số lượng tồn `QuantityOnHand = 20`.
  - Lô B: hạn dùng `2027-06-01`, số lượng tồn `QuantityOnHand = 30`.
- **WHEN** Khách hàng mua `40` sản phẩm X tại quầy POS.
- **THEN** Hệ thống **MUST** khấu trừ `20` sản phẩm từ Lô A, đưa tồn kho Lô A về `0`.
- **AND** Hệ thống **MUST** khấu trừ tiếp `20` sản phẩm từ Lô B, đưa tồn kho Lô B về `10`.
- **AND** Hệ thống **MUST** tạo 2 bản ghi giao dịch kho `StockTransaction` tương ứng cho cả 2 lô với tổng số lượng xuất là `40`.
