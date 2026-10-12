---
id: CTX-MT-GRMS-002
title: "MT-GRMS — 8 Luồng Nghiệp Vụ Chuẩn & Quy Tắc Vận Hành (Main Business Flows & Rules)"
date: "2026-10-12"
author: "SEP490-G84"
project: "MT-GRMS"
tags: [context, business-flows, fefo, pos, rules]
---

# 🔄 MT-GRMS — 8 Luồng Nghiệp Vụ Chuẩn & Quy Tắc Vận Hành

Tài liệu này chuẩn hóa toàn bộ 8 luồng nghiệp vụ cốt lõi (**BF-01 đến BF-08**) được trích xuất từ Báo cáo SRS (Report-3) và sơ đồ tương tác hệ thống. Mọi AI Agent và lập trình viên khi viết code xử lý logic, API handler hoặc unit test đều phải tuân thủ nghiêm ngặt các bước này.

---

## 1. Chi Tiết 8 Luồng Nghiệp Vụ Cốt Lõi (Main Business Flows)

### BF-01: Bán Hàng POS & Nhận Diện Khách Hàng (Sales Invoice Creation)
* **Tác tử thực hiện**: Cashier (Thu ngân), Customer (Khách mua).
* **Mục tiêu**: Bắt đầu phiên bán hàng, quét sản phẩm nhanh chóng, nhận diện thành viên để tích điểm/áp dụng chiết khấu.
* **Các bước nghiệp vụ**:
  1. Thu ngân mở giao diện POS tại chi nhánh hiện tại (chi nhánh gắn liền với ca làm việc).
  2. Thu ngân nhập số điện thoại khách hàng hoặc quét mã thẻ thành viên:
     - Nếu tìm thấy: Hệ thống nạp thông tin khách hàng, hạng thẻ (Bronze, Silver, Gold) và số điểm tích lũy hiện có.
     - Nếu không tìm thấy: Hệ thống tạo nhanh khách vãng lai hoặc thêm khách mới chỉ với Số điện thoại và Tên.
  3. Thu ngân quét mã vạch sản phẩm (Barcode/SKU) bằng máy quét hoặc gõ tìm kiếm:
     - Hệ thống tự động xác định đơn vị tính mặc định (ví dụ: Lon, Gói, Chai).
     - Nếu sản phẩm có nhiều đơn vị quy đổi (ví dụ: Thùng / Lốc), thu ngân có thể chuyển đổi nhanh qua phím tắt.
     - **Tự động áp dụng FEFO**: Hệ thống tự động chọn lô hàng có ngày hết hạn gần nhất (Earliest Expiration Date) còn tồn kho tại chi nhánh để gán vào dòng hóa đơn.
  4. Hệ thống kiểm tra các chương trình khuyến mãi tự động (Mua A tặng B, chiết khấu theo tổng tiền, giảm giá theo nhóm sản phẩm) và áp dụng voucher nếu khách hàng cung cấp.
  5. Thu ngân xác nhận danh sách giỏ hàng và chuyển sang bước thanh toán (BF-02).

---

### BF-02: Thanh Toán & Hoàn Tất Hóa Đơn POS (Payment & Order Completion)
* **Tác tử thực hiện**: Cashier, Customer, Banking Gateway (Ngân hàng/VietQR).
* **Mục tiêu**: Hoàn tất giao dịch tài chính, trừ tồn kho chính xác theo lô, in hóa đơn và cập nhật doanh thu.
* **Các bước nghiệp vụ**:
  1. Thu ngân chọn phương thức thanh toán: **Tiền mặt (Cash)** hoặc **Chuyển khoản VietQR (Banking)** hoặc **Điểm tích lũy / Voucher**.
  2. **Trường hợp Chuyển khoản VietQR (Tự động hóa)**:
     - Hệ thống sinh mã **Dynamic VietQR** chứa: Số tài khoản đích của cửa hàng, Số tiền chính xác của đơn hàng, Mã tham chiếu đơn hàng duy nhất (`ORD-XXXXX`).
     - Màn hình phụ hướng về phía khách hiển thị mã QR. Khách hàng quét mã bằng ứng dụng ngân hàng.
     - Khi giao dịch thành công, Ngân hàng bắn tín hiệu **Webhook** về hệ thống MT-GRMS:
       - Hệ thống tự động kiểm tra số tiền khớp 100%.
       - Màn hình POS tự động chuyển trạng thái `PAID` và phát âm thanh thông báo thành công (Beep sound).
  3. **Trường hợp Tiền mặt**:
     - Thu ngân nhập số tiền khách đưa. Hệ thống tự động tính tiền thối (Change).
     - Lệnh mở ngăn kéo đựng tiền (Cash Drawer) được kích hoạt qua máy in bill.
  4. **Cập nhật dữ liệu hệ thống (Atomic Transaction)**:
     - Trừ số lượng tồn kho theo đúng `BatchId` đã chọn ở BF-01.
     - Nếu số lượng tồn kho giảm xuống dưới ngưỡng an toàn (Reorder Point), bắn cờ cảnh báo nhập hàng.
     - Cộng điểm tích lũy cho khách hàng theo tỉ lệ quy định.
     - Ghi nhận bút toán thu tiền vào Sổ quỹ (Cashbook) của ca làm việc.
  5. In hóa đơn bán lẻ (POS Receipt) gửi khách hàng và hoàn tất đơn hàng.

---

### BF-03: Mua Hàng & Lập Đơn Đặt Hàng Nhà Cung Cấp (Purchase Order Creation)
* **Tác tử thực hiện**: Store Owner, Store Manager.
* **Mục tiêu**: Lập danh sách mua hàng gửi nhà cung cấp dựa trên nhu cầu tồn kho và đơn đặt trước.
* **Các bước nghiệp vụ**:
  1. Quản lý xem danh sách cảnh báo thiếu hàng (Low Stock Alert) hoặc nhu cầu nhập từ các đơn Pre-order.
  2. Chọn Nhà cung cấp (Supplier) từ danh mục đối tác.
  3. Thêm các sản phẩm cần mua, số lượng, đơn vị nhập (Thùng, Kiện), đơn giá nhập dự kiến từ nhà cung cấp.
  4. Hệ thống tính toán tổng giá trị đơn hàng, thuế VAT và điều khoản thanh toán nợ (Công nợ AP).
  5. Chủ cửa hàng duyệt đơn Purchase Order (PO chuyển trạng thái `APPROVED`).
  6. Xuất file PO (PDF/Excel) hoặc gửi email trực tiếp cho đại diện nhà cung cấp.

---

### BF-04: Nhận Hàng & Ghi Nhận Lô Hạn FEFO (Goods Receipt & Batch Tracking)
* **Tác tử thực hiện**: Inventory Staff (Nhân viên kho), Store Manager.
* **Mục tiêu**: Kiểm đếm hàng hóa thực tế giao tới, nhập thông tin Số Lô (Batch Code) và Hạn sử dụng (Expiry Date) vào kho.
* **Các bước nghiệp vụ**:
  1. Nhân viên mở đơn PO tương ứng để lập phiếu Nhập kho (Goods Receipt).
  2. Kiểm đếm số lượng thực tế giao (hỗ trợ nhập từng phần - Partial Shipment nếu giao thiếu).
  3. **Bắt buộc nhập dữ liệu Lô Hạn**:
     - Với mỗi mặt hàng nhạy cảm thời hạn (FMCG, thực phẩm, sữa), nhân viên quét/nhập **Mã Lô (Batch Code)**, **Ngày Sản Xuất (MFG)** và **Hạn Sử Dụng (EXP)**.
     - In tem mã vạch Lô (Batch Barcode) dán lên kiện hàng nếu cần.
  4. Phân bổ chi phí vận chuyển phát sinh vào giá vốn sản phẩm (Landed Cost Allocation):
     - $\text{Giá vốn mới} = \text{Giá mua NCC} + \text{Chi phí vận chuyển phân bổ}$.
  5. Quản lý xác nhận phiếu nhập:
     - Tồn kho tại chi nhánh tăng lên theo đúng từng Lô hạn.
     - Ghi nhận công nợ phải trả Nhà cung cấp (Accounts Payable).

---

### BF-05: Kiểm Kê Kho & Cân Đối Sai Lệch (Inventory Stocktake & Audit)
* **Tác tử thực hiện**: Inventory Staff, Store Owner.
* **Mục tiêu**: Đối soát tồn kho vật lý tại quầy/kệ với tồn kho trên hệ thống, phát hiện thất thoát và cân đối sổ sách.
* **Các bước nghiệp vụ**:
  1. Tạo phiếu kiểm kê (Stocktake Slip) theo toàn bộ kho hoặc theo từng Nhóm danh mục/Kệ hàng.
  2. Nhân viên cầm máy quét mã vạch quét từng sản phẩm và từng lô hạn thực tế đang nằm trên kệ.
  3. Hệ thống so sánh:
     $$\text{Chênh lệch (Variance)} = \text{Tồn thực tế kiểm đếm} - \text{Tồn sổ sách hệ thống}$$
  4. Nếu phát hiện chênh lệch âm (thất thoát) hoặc chênh lệch dương (thừa):
     - Nhân viên ghi chú nguyên nhân (Hao hụt tự nhiên, quét nhầm mã, mất cắp).
  5. Trình Chủ cửa hàng duyệt phiếu kiểm kê:
     - Sau khi Chủ duyệt, hệ thống tự động sinh **Phiếu điều chỉnh kho (Inventory Adjustment Voucher)** để đưa tồn sổ sách về bằng đúng tồn thực tế.
     - Ghi nhận chi phí hao hụt vào báo cáo tài chính P&L.

---

### BF-06: Chuyển Kho Liên Chi Nhánh (Inter-Branch Inventory Transfer)
* **Tác tử thực hiện**: Store Manager (Chi nhánh xuất), Store Manager (Chi nhánh nhận).
* **Mục tiêu**: Điều chuyển hàng hóa giữa các cửa hàng trong cùng chuỗi để cân bằng tồn kho.
* **Các bước nghiệp vụ**:
  1. Chi nhánh A tạo Yêu cầu chuyển kho (Transfer Request) gửi Chi nhánh B.
  2. Chi nhánh B duyệt yêu cầu và xuất hàng:
     - Chọn đúng Lô hàng (Batch) cần xuất theo nguyên tắc FEFO.
     - Tồn kho khả dụng tại Chi nhánh B giảm xuống, hàng chuyển sang trạng thái **Đang vận chuyển (In-Transit)**.
  3. Khi hàng tới Chi nhánh A:
     - Nhân viên Chi nhánh A kiểm đếm số lượng và hạn sử dụng thực tế.
     - Nếu khớp: Xác nhận nhận hàng. Hàng nhập vào tồn kho Chi nhánh A với đúng thông tin Lô hạn gốc từ Chi nhánh B.
     - Nếu hư hỏng/thiếu hụt trên đường đi: Ghi nhận biên bản thất thoát vận chuyển.

---

### BF-07: Phân Ca Làm Việc & Điểm Danh (Shift Scheduling & Attendance)
* **Tác tử thực hiện**: Store Manager, Cashier, Employee.
* **Mục tiêu**: Sắp xếp lịch làm việc theo ca, theo dõi giờ vào/ra và tính công thực tế.
* **Các bước nghiệp vụ**:
  1. Quản lý lập lịch phân ca tuần/tháng (Ca sáng, Ca chiều, Ca tối) cho nhân viên từng chi nhánh.
  2. Khi đến giờ làm việc, nhân viên đăng nhập vào hệ thống tại quầy POS chi nhánh và bấm **Check-in**:
     - Hệ thống ghi nhận thời gian chính xác, IP mạng cửa hàng và chụp log kiểm tra.
  3. **Mở két đầu ca (Open Cash Drawer)**:
     - Thu ngân đếm số tiền mặt lẻ có sẵn trong ngăn kéo đầu ca và nhập vào hệ thống (ví dụ: 1.000.000 VNĐ tiền lẻ trả lại).
  4. Cuối ca, nhân viên bấm **Check-out**:
     - **Bàn giao két tiền (Close Cash Drawer)**: Thu ngân đếm tổng tiền mặt thực tế trong két.
     - Hệ thống đối soát:
       $$\text{Tiền mặt dự kiến} = \text{Tiền đầu ca} + \text{Doanh thu bán tiền mặt} - \text{Chi tiền mặt trong ca}$$
       $$\text{Chênh lệch ca} = \text{Tiền thực tế} - \text{Tiền dự kiến}$$
     - In biên bản kết ca (Z-Report) và chuyển giao cho thu ngân ca sau.

---

### BF-08: Tính & Chi Trả Lương Nhân Viên (Payroll Processing)
* **Tác tử thực hiện**: Store Owner, Store Manager.
* **Mục tiêu**: Tổng hợp giờ công, ca làm việc, tính lương theo giờ/cố định và thanh toán lương.
* **Các bước nghiệp vụ**:
  1. Cuối kỳ (hàng tuần hoặc hàng tháng), hệ thống tự động tổng hợp dữ liệu chấm công từ BF-07:
     - Tổng giờ công chuẩn, giờ đi muộn/về sớm, giờ tăng ca (Overtime).
  2. Áp dụng chính sách lương của từng nhân viên:
     - Lương theo giờ (Hourly rate) $\times$ Số giờ thực tế.
     - Lương cứng (Base salary) + Thưởng doanh số (Commission) - Phạt vi phạm.
  3. Tạo Bảng tính lương dự thảo (Draft Payroll Slip).
  4. Chủ cửa hàng rà soát và Duyệt bảng lương (`APPROVED`).
  5. Xuất phiếu chi lương, tự động tạo bút toán chi tiền trong Sổ quỹ (Cashbook) khi thanh toán tiền mặt hoặc chuyển khoản.

---

## 2. Các Quy Tắc Nghiệp Vụ Bất Biến (Invariant Business Rules)

### BR-01: Thuật Toán Ưu Tiên Xuất Kho FEFO (First Expired, First Out)
* **Quy tắc**: Khi bán hàng hoặc xuất kho, hệ thống **luôn luôn tự động gợi ý Lô có ngày hết hạn (`ExpiryDate`) nhỏ nhất (gần nhất)** mà số lượng tồn (`QuantityOnHand > 0`).
* **Cảnh báo cận hạn (Near-Expiry Alert)**:
  - Mỗi sản phẩm có cấu hình số ngày cảnh báo (ví dụ: 15 ngày đối với sữa tươi, 45 ngày đối với bánh kẹo).
  - Khi $\text{ExpiryDate} - \text{CurrentDate} \le \text{Threshold}$, hệ thống tự động gắn nhãn cờ vàng cảnh báo trên POS và Dashboard, đề xuất tạo chương trình giảm giá thanh lý để thu hồi vốn.

### BR-02: Kiểm Soát Giá Bán Không Dưới Giá Vốn (Below-Cost Pricing Protection)
* **Quy tắc**: Giá bán của sản phẩm (`SellingPrice`) trên hóa đơn sau khi trừ mọi chiết khấu **không được phép thấp hơn Giá vốn trung bình (`Average Cost`)** của sản phẩm đó, trừ khi có quyền phê duyệt đặc biệt của `Store Owner`.
* Nếu thu ngân cố tình giảm giá dưới vốn mà không có mã PIN duyệt của chủ cửa hàng: Hệ thống **chặn đứng thao tác thanh toán**.

### BR-03: Quy Chuẩn Multi-Tenancy Tuyệt Đối (Tenant Data Isolation)
* Mọi bảng dữ liệu nghiệp vụ (trừ bảng cấu hình gói SaaS chung của Master Admin) đều **bắt buộc chứa cột `TenantId`**.
* Tầng Data Access (Entity Framework Core) bắt buộc áp dụng **Global Query Filter**:
  ```csharp
  modelBuilder.Entity<Product>().HasQueryFilter(e => e.TenantId == _currentTenantId);
  ```
  Tuyệt đối không một người dùng hay API nào có thể đọc hoặc ghi đè dữ liệu của Tenant khác.

### BR-04: Độc Lập Ca & Bảo Toàn Tiền Mặt (Cash Drawer Integrity)
* Mỗi thu ngân trong một thời điểm chỉ được phép mở 1 ca làm việc (`CashierShift`) tại 1 quầy thu ngân (`CashDrawer`).
* Nghiêm cấm xóa hoặc sửa đổi lịch sử các giao dịch đã chốt trong ca. Mọi chênh lệch âm/dương cuối ca đều được ghi nhận vĩnh viễn vào biên bản kiểm toán (Audit Trail) để đối soát kế toán.
