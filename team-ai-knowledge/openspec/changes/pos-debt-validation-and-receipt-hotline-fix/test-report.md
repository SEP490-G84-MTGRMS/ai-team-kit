---
verdict: PASS
---

# Báo Cáo Kiểm Thử: pos-debt-validation-and-receipt-hotline-fix

## 1. Kết Quả Nghiệm Thu Tổng Quan
- **Verdict**: **PASS** (100% kịch bản kiểm thử đều đạt).
- **Phạm vi kiểm thử**: Sửa lỗi modal thu nợ min-max validation khi nợ = 0, tìm kiếm khách hàng đa tiêu chí ở POS, xóa 2 dòng thừa chân bill, căn chỉnh cột bảng hàng hóa và đồng bộ hotline chi nhánh.

## 2. Chi Tiết Kiểm Thử Từng Requirement (specs.md)

| Mã Requirement | Kịch Bản Kiểm Thử | Kết Quả Trước Sửa | Kết Quả Sau Sửa | Đánh Giá |
|---|---|---|---|---|
| **REQ-POS-DEBT-01** | Mở modal thu nợ hoặc xem hóa đơn đã tất toán nợ (`debtAmount = 0`) | Bật tooltip lỗi HTML5: *"Minimum value (1000) must be less than the maximum value (0)."*, danh sách vẫn hiện nút "Thu nợ". | Nút "Thu nợ" ẩn, hiển thị trạng thái "Hoàn thành". Modal thông báo "Hóa đơn này đã được tất toán toàn bộ nợ", input và nút submit bị khóa an toàn. | **PASS** |
| **REQ-POS-CUST-02** | Tìm kiếm khách hàng "Sơn" (SĐT `0961934104`) bằng tên tiếng Việt không dấu ("son"), có dấu ("Sơn"), hoặc SĐT | Bị regex xóa sạch chữ cái khi gõ, chỉ tìm được bằng số. Gõ "Sơn" trả về 0 kết quả. | Gõ "son", "Sơn", "0961" hoặc mã KH đều hiển thị ngay khách hàng "Sơn", bấm Enter hoặc click chọn vào đơn ngay lập tức. | **PASS** |
| **REQ-POS-PRINT-03** | In hóa đơn bán lẻ và xem preview modal | Có 2 dòng thừa ở chân bill (*"Quý khách vui lòng kiểm tra..."* và *"[Hóa đơn khởi tạo...]"* / *"Doi tra 24h..."*), bảng hàng hóa hiện `(LÔ-FEFO)` và dòng tổng cộng bị lệch. | Xóa sạch 2 dòng thừa, chân bill chỉ có duy nhất *"CẢM ƠN QUÝ KHÁCH & HẸN GẶP LẠI!"*. Bảng hàng hóa sạch đẹp, dòng tổng số lượng và tổng tiền hàng thẳng tắp. | **PASS** |
| **REQ-POS-HOTLINE-04** | Hiển thị hotline chi nhánh cửa hàng | Hiển thị hotline fallback cố định chưa khớp với chi nhánh. | Hiển thị đúng số điện thoại/hotline của chi nhánh đang hoạt động từ CSDL (`activeBranch.phone`). | **PASS** |

## 3. Kết Quả Thực Thi Test Suites
- **Frontend Test Suite**:
  - Lệnh: `npm --prefix MT_GRMS_FRONTEND test -- pos`
  - Kết quả: `3 passed (3)` (Thời gian: 846ms).
  - Build: `npm --prefix MT_GRMS_FRONTEND run build` -> `built in 752ms` (Không có lỗi TypeScript hay cú pháp).
- **Backend Test Suite**:
  - Lệnh: `dotnet test MT_GRMS_BACKEND\tests\MT_GRMS.UnitTests`
  - Kết quả: `Passed! - Failed: 0, Passed: 347, Skipped: 0, Total: 347` (Thời gian: 893 ms).
- **Backend API Server**:
  - Đang chạy ổn định tại PID mới trên cổng `http://localhost:5232`.

## 4. Lỗi Tồn Đọng
- Không có lỗi tồn đọng.
