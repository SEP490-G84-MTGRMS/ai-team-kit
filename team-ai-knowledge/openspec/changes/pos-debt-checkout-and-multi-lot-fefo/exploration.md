# EXP-2026-11-05-POS-01: Bán Nợ POS, Độc Lập In Hóa Đơn & Cơ Chế Khấu Trừ Kho FEFO Đa Lô

## 1. Problem Statement (Vấn đề cần giải quyết)
Khi nhân viên bán hàng thực hiện đơn hàng thanh toán bằng hình thức **Bán nợ (CREDIT)** trên giao diện POS (`/pos`), hệ thống báo lỗi máy chủ: `42703: column c.LastRepaymentAtUtc does not exist POSITION: 206`, làm gián đoạn giao dịch thanh toán.
Đồng thời, người dùng cần làm rõ và đảm bảo 2 cơ chế nghiệp vụ trọng yếu của POS:
1. **Độc lập in bill**: Nếu máy in hóa đơn bị mất kết nối, kẹt giấy hoặc nhân viên không in bill, đơn hàng có hoàn tất và ghi nhận chính xác vào cơ sở dữ liệu không?
2. **Khấu trừ tồn kho FEFO đa lô**: Khi một mặt hàng có nhiều lô hàng với số lượng khác nhau (ví dụ: Lô A có 20 sản phẩm, Lô B có 30 sản phẩm), nếu khách mua 40 sản phẩm thì hệ thống sẽ khấu trừ như thế nào?

## 2. Context & Root Cause Analysis (Hiện trạng & Nguyên nhân gốc rễ)

### 2.1. Lỗi bán nợ: `column c.LastRepaymentAtUtc does not exist`
- **Môi trường & Dữ liệu tái hiện**: Tenant `tenant_an_nhien_02`, Chi nhánh An Nhiên, Khách hàng Bác Minh (`KH-AN-001`). Khi gọi API `POST /api/v1/orders` với `paymentMethod: "CREDIT"`, EF Core thực hiện truy vấn bảng `Customers` để kiểm tra điều kiện công nợ và cập nhật nợ.
- **Root Cause**: Trong entity domain `Customer.cs` (`src/MT_GRMS.Domain/Entities/Customer.cs`), thuộc tính `public DateTime? LastRepaymentAtUtc { get; set; }` đã được khai báo, nhưng trong CSDL PostgreSQL thực tế của container `mtgrms-postgres`, cột `"LastRepaymentAtUtc"` chưa được thêm vào bảng `"Customers"` (do thiếu script migration / seed ban đầu).
- **Các cột liên đới**: Kiểm tra thêm entity `Customer.cs` phát hiện các cột `"Notes"` và `"RowVersion"` cũng cần đảm bảo đồng bộ để tránh lỗi phát sinh khi lưu concurrency check hoặc ghi chú nợ.

### 2.2. Cơ chế độc lập giữa Tạo đơn hàng và In bill
- **Phân tích mã nguồn**:
  - Tại Frontend (`PosCheckoutPage.tsx` - hàm `executeCompleteCheckout`):
    1. Bước 1: Gọi `posOrderApi.createOrder(payload)` (đồng bộ await). Đơn hàng được gửi lên backend, thực hiện trừ kho, ghi nhận doanh thu, hóa đơn nợ và trả về DTO thành công (`orderId`, `orderCode`).
    2. Bước 2: Hiển thị thông báo `Thanh toán thành công!` và đóng modal checkout.
    3. Bước 3: Lệnh in hóa đơn `posOrderApi.printDirect(receipt)` được thực hiện ở chế độ nền (background promise). Nếu máy in ngoại vi gặp lỗi hoặc không có máy in, promise chỉ catch lỗi in chứ không hề ảnh hưởng đến đơn hàng đã lưu thành công trong CSDL.
  - **Kết luận**: Đơn hàng và in bill hoàn toàn độc lập, không in bill đơn vẫn hoàn tất 100%.

### 2.3. Thuật toán khấu trừ tồn kho FEFO đa lô (First Expired, First Out)
- **Phân tích mã nguồn**:
  - Tại Backend (`OrderRepository.cs` và `OrderService.cs` dòng 132-156):
    - `GetBranchStocksForProductFefoAsync` truy vấn tất cả các lô hàng của sản phẩm tại chi nhánh và sắp xếp nghiêm ngặt theo:
      `OrderBy(s => s.ExpiryDate ?? DateTime.MaxValue).ThenBy(s => s.ManufactureDate ?? DateTime.MaxValue)`.
    - Khi duyệt danh sách lô:
      ```csharp
      var remainingToDeduct = requiredBaseQty; // Ví dụ: 40 sp
      foreach (var stock in availableStocks)
      {
          var deductQty = Math.Min(stock.QuantityOnHand, remainingToDeduct);
          stock.QuantityOnHand -= deductQty;
          remainingToDeduct -= deductQty;
          // Tạo StockTransaction loại SALE
          if (remainingToDeduct == 0) break;
      }
      ```
  - **Kịch bản Lô A 20 sp, Lô B 30 sp, bán 40 sp**:
    - Bước 1: Duyệt Lô A (hạn dùng gần nhất, tồn 20): Trừ `Math.Min(20, 40) = 20`. Tồn Lô A còn `0`. Số lượng cần trừ còn `20`.
    - Bước 2: Duyệt tiếp Lô B (hạn dùng sau, tồn 30): Trừ `Math.Min(30, 20) = 20`. Tồn Lô B còn `10`. Số lượng cần trừ còn `0`.
    - Bước 3: Đạt đủ 40 sản phẩm, thoát vòng lặp, commit transaction.
  - **Kết luận**: Thuật toán FEFO đã xử lý chuẩn xác việc cấn trừ liên hoàn vắt qua nhiều lô.

## 3. Các phương án giải quyết (Options Considered)

### Phương án 1: Thêm cột bằng DDL SQL trực tiếp trên Postgres & cập nhật init script
- **Ưu điểm**: Nhanh, khắc phục ngay lập tức lỗi blocking trên môi trường dev/staging mà không cần tạo migration rỗng nếu migration đã từng tồn tại.
- **Nhược điểm**: Nếu không lưu vào code migration hoặc init script sẽ bị mất khi dựng lại DB từ đầu.
- **Đánh giá**: Kết hợp chạy DDL trực tiếp trên container và đồng bộ vào `init-db.sql`.

### Phương án 2: Tạo EF Core Migration mới `AddMissingCustomerDebtColumns`
- **Ưu điểm**: Đúng chuẩn quy trình Code-First của .NET.
- **Nhược điểm**: Đòi hỏi snapshot model khớp hoàn toàn với migration history hiện tại của DB.
- **Lựa chọn**: Áp dụng Phương án 1 để giải phóng môi trường chạy thực tế và cập nhật `init-db.sql`, đảm bảo tính ổn định và tính sẵn sàng.

## 4. Assumptions (Giả định)
- **[ASSUMPTION-01]**: Khách hàng mua nợ đã được thiết lập `AllowDebt = true` và `DebtLimit` còn hạn mức lớn hơn tổng tiền đơn hàng.
- **[ASSUMPTION-02]**: Mọi giao dịch POS chạy trong database transaction; nếu bất kỳ bước trừ kho hoặc ghi sổ nợ nào thất bại, toàn bộ đơn hàng được rollback.

## 5. Scope & Non-Goals
### In Scope
- Sửa lỗi thiếu cột `"LastRepaymentAtUtc"`, `"Notes"`, `"RowVersion"` trên bảng `"Customers"` trong CSDL PostgreSQL.
- Đặc tả rõ kịch bản thanh toán nợ POS thành công.
- Đặc tả kịch bản in hóa đơn độc lập với trạng thái hoàn thành của đơn hàng.
- Đặc tả và kiểm chứng kịch bản khấu trừ tồn kho FEFO cấn trừ liên hoàn qua 2 lô hàng.

### Out of Scope (Non-Goals)
- Không can thiệp vào quy tắc tính điểm thưởng loyalty hoặc voucher khuyến mãi.
- Không thay đổi cấu trúc bảng `Orders` và `OrderDetails`.

## 6. Success Criteria (Tiêu chí thành công)
1. Đơn hàng mua nợ tại POS hoàn tất thành công, không phát sinh lỗi 42703. Bảng `CustomerDebtInvoices` và `CustomerDebtEntries` ghi nhận chính xác dư nợ mới.
2. Không cần in bill, đơn hàng vẫn lưu vào CSDL với trạng thái `Completed`.
3. Kịch bản mua 40 sản phẩm từ Lô A (20) và Lô B (30) trừ chính xác Lô A về 0 và Lô B còn 10.
4. Toàn bộ unit tests backend và frontend pass 100%.
