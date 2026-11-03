# Skeptic Review: generate-backend-domain-models

| Chiều | Điểm (1–5) | Nhận xét |
|---|---|---|
| D1 Completeness | 5/5 | Phủ trọn vẹn 34 bảng thuộc 7 phân hệ nghiệp vụ theo chuẩn 3NF từ MT_GRMS_Full_Database.sql. Các kịch bản mở rộng và edge cases về composite key, precision và isolation đều rõ ràng. |
| D2 Correctness | 5/5 | Mô hình hóa dữ liệu chính xác, kiểu dữ liệu C# tương ứng khớp 100% với kiểu dữ liệu SQL (DECIMAL, DATETIME, TIME, BIT, VARCHAR). |
| D3 Coherence | 5/5 | Tính thống nhất cao giữa proposal, exploration, design brief và specs delta. |
| D4 Constraints | 5/5 | Đảm bảo tính cô lập Multi-tenancy qua BaseTenantEntity, Soft Delete tự động, và kiểm soát đồng thời qua RowVersion Concurrency Token. |
| D5 Blast Radius | 4/5 | Đang có một số entity cũ trong codebase (Product, Supplier, Branch, User, Order). Cần chú ý giữ tương thích ngược để không làm vỡ các use-case hiện có trong tầng Application. |

## Vấn đề
- [MEDIUM] REQ-01: Một số entity hiện tại trong `MT_GRMS.Domain/Entities` (như `Product.SKU`, `Product.ProductName`, `User.Username`) có tên thuộc tính khác với schema SQL (`ProductCode`, `Name`, `UserName`). Nếu đổi đột ngột có thể làm vỡ code trong `MT_GRMS.Application`.
  - **Đề xuất**: Trong các Entity tương ứng, ngoài thuộc tính chuẩn hóa theo SQL, bổ sung thêm các thuộc tính `[NotMapped]` alias chuyển tiếp (ví dụ `[NotMapped] public string SKU { get => ProductCode; set => ProductCode = value; }`) hoặc refactor đồng bộ sạch sẽ các chỗ gọi trong Application.
- [LOW] REQ-02: Cần đảm bảo các trường Enum được map chuẩn `HasConversion<int>()` hoặc `HasConversion<string>()` đúng với kiểu cột trong SQL (`TINYINT` -> int, `VARCHAR` -> string).
  - **Đề xuất**: Rà soát từng Fluent API Configuration khi implement.

## Kết luận: Chấp nhận
Không có vấn đề mức HIGH. Vấn đề MEDIUM được giải quyết bằng thuộc tính alias / refactor trong danh sách tasks.
