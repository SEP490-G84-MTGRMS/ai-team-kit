# Skeptic Review: product-images-and-unit-codes

| Chiều | Điểm (1–5) | Nhận xét |
|---|---|---|
| D1 Completeness | 5/5 | 5 REQ đều có đầy đủ Scenario GIVEN/WHEN/THEN bao quát cả case chuẩn và edge case (xóa hết ảnh, trùng mã tự sinh, không chọn ảnh chính). |
| D2 Correctness | 5/5 | Logic nghiệp vụ rõ ràng: Entity `ProductImage` quan hệ 1-N chuẩn 3NF, đồng bộ `ImageUrl` avatar, tự sinh `UnitCode` đảm bảo tính toàn vẹn dữ liệu. |
| D3 Coherence | 5/5 | Nhất quán 100% giữa proposal, exploration, design-brief và specs delta. |
| D4 Constraints | 5/5 | Bảo mật đa tenant, phân quyền cột giá vốn theo BR-SEC-01 được tôn trọng triệt để, migration EF Core code-first không phá vỡ DB hiện tại. |
| D5 Blast Radius | 5/5 | Tương thích ngược: giữ nguyên trường `ImageUrl` trên `Product` giúp các phân hệ POS và Phiếu nhập kho không bị ảnh hưởng. Bổ sung `UnitCode` nullable an toàn. |

## Vấn đề & Khuyến nghị đã xử lý
- [MEDIUM] REQ-02: Khi tự sinh `UnitCode`, cần chuẩn hóa tên đơn vị (bỏ dấu, viết liền/gạch ngang, uppercase) để tránh mã chứa ký tự đặc biệt hoặc khoảng trắng.
  - *Giải pháp*: Triển khai helper chuẩn hóa chuỗi `ToUnitCodeSlug` trên Backend: chuyển tiếng Việt không dấu, bỏ ký tự đặc biệt, viết hoa (ví dụ: "Thùng 24 lon" -> `SP001-THUNG24LON`).
- [LOW] REQ-03: Khi người dùng xóa ảnh đang giữ cờ "Ảnh chính" trong form, hệ thống cần tự động chuyển cờ cho ảnh kế tiếp.
  - *Giải pháp*: Trong frontend state logic của `ProductFormModal`, nếu ảnh bị xóa có `isMain: true` và danh sách vẫn còn ảnh khác, tự động gán `isMain: true` cho ảnh đầu tiên còn lại.

## Kết luận: Chấp nhận
Đặc tả đầy đủ, an toàn, sẵn sàng lập `tasks.md` và chuyển sang bước triển khai Apply.
