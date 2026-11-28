# Skeptic Review: pos-branch-scoped-catalog-and-stock

| Chiều | Điểm (1–5) | Nhận xét |
|---|---|---|
| D1 Completeness | 5 | Đầy đủ scenarios cho POS sale, pre-order, return-exchange NewItems, gift items, và UI empty / filter state. |
| D2 Correctness | 5 | Root cause được phân tích chính xác ở cả frontend API fallback, mock state, và backend missing branch-product validation. Logic giá và FEFO giữ nguyên. |
| D3 Coherence | 5 | Nhất quán 100% giữa proposal, exploration và specs dạng delta. Thuật ngữ và mã lỗi (`PRODUCT_NOT_IN_BRANCH`) chuẩn hóa. |
| D4 Constraints | 5 | Tôn trọng Clean Architecture, tenant isolation, không thay đổi migration hay DB schema, không vi phạm repository contracts. |
| D5 Blast Radius | 4 | Tác động lớn nhất là ~60 tests trong `PosOrderServiceTests` (harness dùng `FakeOrderRepository` rỗng `BranchProducts`). Cần cập nhật test setup trước. |

## Vấn đề
- [MEDIUM] **REQ-BRANCH-SCOPE-02**: So sánh trạng thái `BranchProduct.Status` cần dùng `string.Equals(bp.Status, "Active", StringComparison.OrdinalIgnoreCase)` để phòng ngừa sai khác casing trong dữ liệu thực tế.
  → Đề xuất: Thực hiện so sánh không phân biệt hoa thường khi duyệt `branchProducts` trong `OrderService`.
- [MEDIUM] **REQ-BRANCH-SCOPE-02**: Xử lý quà tặng (`IsGift = true`) khi sản phẩm quà chưa được gán vào chi nhánh: không được làm fail đơn mà chỉ omit dòng quà kèm warning để thu ngân vẫn thanh toán được cho khách.
  → Đề xuất: Kiểm tra `IsGift` trước khi ném `PRODUCT_NOT_IN_BRANCH`, nếu là gift thì loại bỏ khỏi danh sách quà tặng khả dụng tương tự như khi hết tồn.
- [LOW] **Harness Test Setup**: Tránh vỡ 60 unit tests hiện có trong `PosOrderServiceTests.cs`.
  → Đề xuất: Trong `FakeOrderRepository`, tự động gán `BranchProduct` Active cho các sản phẩm mẫu (`_prodHaoHaoId`, `_prodCocaId`) đối với `_branchQ1Id`, đồng thời thêm test case riêng biệt cho sản phẩm không thuộc chi nhánh hoặc Inactive.

## Kết luận: Chấp nhận
Spec đạt yêu cầu, sẵn sàng chuyển sang lập task list `tasks.md`.
