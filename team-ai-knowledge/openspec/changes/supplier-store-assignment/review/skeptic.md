# Review: skeptic persona (Refactor Popup Phân Bổ)

## 1. Các rủi ro tiềm ẩn & Biện pháp khắc phục

### 1. Rủi ro trùng lặp khóa chính Unique Key khi tái gán (MAP-06)
- **Vấn đề**: CSDL đã có Unique Index trên `(TenantId, SupplierId, BranchId)`. Nếu NCC đã từng bị gán rồi chuyển sang `Inactive`, việc insert một bản ghi mới với cùng cặp ID sẽ ném ra lỗi `DbUpdateException: Duplicate key`.
- **Giải pháp**: Trong `AssignSuppliersToBranchAsync`, trước khi insert mới, Backend phải kiểm tra bản ghi đã tồn tại trong DB hay chưa:
  - Nếu đã tồn tại nhưng `Status == Inactive`: Cập nhật `Status = Active`, `InactiveReason = null`.
  - Nếu chưa tồn tại: Tạo bản ghi mới `Status = Active`.
  - Nếu đã tồn tại và đang `Active`: Bỏ qua, không gây lỗi.

### 2. Rủi ro Race Conditions khi 2 người dùng gán đồng thời (MAP-02)
- **Vấn đề**: Hai người dùng cùng mở popup và bấm gán cùng 1 NCC cho 1 chi nhánh trong cùng thời điểm.
- **Giải pháp**: Tận dụng Unique Index của PostgreSQL/EF Core bắt lỗi `DbUpdateException` và chuyển đổi thành thông báo thân thiện: "Nhà cung cấp đã được phân bổ cho cửa hàng này".

### 3. Rủi ro phân bổ một phần dở dang (Partial Allocation) (MAP-05)
- **Vấn đề**: Người dùng chọn 5 NCC, nhưng 1 NCC bị xóa hoặc Inactive trong lúc popup đang mở -> Hệ thống lưu 4 NCC còn 1 NCC lỗi, gây hiểu lầm.
- **Giải pháp**: Áp dụng nguyên tắc **All-or-Nothing**: Thực thi trong 1 Database Transaction duy nhất (`_unitOfWork.SaveChangesAsync()`). Kiểm tra toàn bộ danh sách hợp lệ trước khi lưu; nếu bất kỳ NCC nào không thỏa mãn, ném lỗi và từ chối toàn bộ request.

### 4. Rủi ro trải nghiệm người dùng khi chọn chi nhánh (BR-04, SUP-02)
- **Vấn đề**: Người dùng chọn chi nhánh A, tích chọn 3 NCC, sau đó đổi sang chi nhánh B. Nếu giữ nguyên 3 NCC đã chọn thì có thể gán nhầm.
- **Giải pháp**: Bắt sự kiện thay đổi chi nhánh -> Tự động xóa danh sách NCC đã chọn và fetch/lọc lại danh sách NCC khả dụng cho chi nhánh mới.

## 2. Kết luận
Kế hoạch kỹ thuật và tài liệu phân rã `tasks.md` đã bao quát đầy đủ tất cả các trường hợp biên và đảm bảo an toàn tuyệt đối cho dữ liệu. Đủ điều kiện phê duyệt bước Verify Spec.
