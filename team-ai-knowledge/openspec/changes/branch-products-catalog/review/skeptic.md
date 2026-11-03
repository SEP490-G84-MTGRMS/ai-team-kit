# Review: Skeptic Persona — branch-products-catalog

## 1. Bảng đánh giá tiêu chí D1–D5

| Tiêu chí | Điểm (1–5) | Nhận xét chi tiết |
|---|:---:|---|
| **D1: Tính cần thiết & Phạm vi (Scope & Necessity)** | 5/5 | Giải quyết dứt điểm vấn đề nhập nhằng giữa tồn kho vật lý (`BranchStocks`) và danh mục sản phẩm kinh doanh (`BranchProducts`). Phạm vi khoanh vùng chuẩn xác trong capability `branch-product`. |
| **D2: Tính khả thi & Thiết kế kiến trúc (Architecture & Feasibility)** | 5/5 | Mô hình quan hệ 3NF chuẩn Clean Architecture; tách bảng `BranchProducts` và `BranchProductUnitPrices` giúp quản lý giá override đa quy cách ĐVT mà không làm phình to bảng tồn kho. |
| **D3: Tính đầy đủ của kịch bản (Scenario Completeness)** | 5/5 | Đã bao phủ đầy đủ kịch bản Happy Path, Edge Cases: fallback giá Master, cô lập giữa các chi nhánh, bảo toàn dữ liệu khi migrate, khóa sửa MOQ/Cost, và chặn gỡ SP khi còn tồn kho. |
| **D4: Tính cô lập Multi-tenant & An toàn dữ liệu (Security & Isolation)** | 5/5 | Kế thừa `BaseTenantEntity`, Unique Index có filter `TenantId` và `IsDeleted = false`, kiểm soát chặt chẽ an toàn tồn kho vật lý trước khi xóa mềm. |
| **D5: Khả năng kiểm thử (Testability & Verification)** | 5/5 | Có bộ test suite chuyên biệt `BranchProductManagementTests` và `SupplierProductManagementTests` kiểm chứng độc lập logic service và repository. |

## 2. Vấn đề rà soát & Đề xuất giải pháp (Findings & Resolutions)

### Vấn đề 1 (HIGH): Nguy cơ mất dữ liệu sản phẩm đang gán khi chuyển đổi sang bảng mới
- **Mức độ**: HIGH
- **Rủi ro**: Khi triển khai bảng `BranchProducts`, nếu các sản phẩm đang có trong `BranchStocks` không được chuyển sang, toàn bộ danh mục sản phẩm của chi nhánh sẽ bị rỗng trên giao diện người dùng.
- **Giải pháp**: Viết script migration SQL `20261103230000_AddBranchProductsCatalog.cs` tự động quét toàn bộ cặp `(TenantId, BranchId, ProductId)` hiện có từ `BranchStocks` để chèn sang `BranchProducts` với cơ chế `ON CONFLICT DO NOTHING`.

### Vấn đề 2 (MEDIUM): Ghi đè sai lệch MOQ và giá thỏa thuận NCC từ màn hình chi nhánh
- **Mức độ**: MEDIUM
- **Rủi ro**: Client có thể gửi `MinOrderQuantity` hoặc giá nhập trong payload cập nhật của chi nhánh, dẫn đến việc làm thay đổi điều khoản hợp đồng của Nhà cung cấp.
- **Giải pháp**: Service `BranchProductService.UpdateProductAsync` chủ động bỏ qua trường `MinOrderQuantity` và đọc giá vốn từ `SupplierProduct.AgreedWholesalePrice` (hoặc `Product.CostPrice`), tuyệt đối không ghi đè vào bảng NCC.

### Vấn đề 3 (LOW): Xung đột giá ĐVT khi người dùng nhập giá trùng với Master
- **Mức độ**: LOW
- **Rủi ro**: Lưu thừa bản ghi override trong `BranchProductUnitPrices` dù giá bằng hệt giá Master làm tốn dung lượng CSDL.
- **Giải pháp**: Logic repository/service tự động kiểm tra: nếu giá nhập bằng giá Master thì xóa bản ghi override cũ (nếu có); chỉ lưu bản ghi override khi giá thực sự khác biệt.

## 3. Kết luận (Verdict)
**Chấp nhận (APPROVED)**. Đặc tả kỹ thuật và giải pháp kiến trúc hoàn toàn vững chắc, giải quyết triệt để vấn đề thiết kế cũ và sẵn sàng áp dụng.
