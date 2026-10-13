# Skeptic Review: refactor-shared-table-pagination

| Chiều | Điểm (1–5) | Nhận xét |
|---|---|---|
| D1 Completeness | 5/5 | Đã bao phủ đủ các kịch bản phân trang: số trang nhỏ, số trang lớn có dấu ba chấm (đầu/giữa/cuối), edge cases. |
| D2 Correctness | 5/5 | Logic tính toán dải trang và bảo toàn ranh giới trang (boundary guard) chuẩn xác. |
| D3 Coherence | 5/5 | Đồng nhất hoàn toàn giữa proposal, exploration và specs về kiến trúc component dùng chung. |
| D4 Constraints | 5/5 | Tuân thủ tuyệt đối quy tắc Vanilla CSS Tokens của dự án, không thêm thư viện ngoài, không ảnh hưởng API Backend. |
| D5 Blast Radius | 4/5 | Chạm vào 5 bảng giao diện. Cần đảm bảo adapter tương thích ngược cho prop `pageIndex` của phân hệ Supplier. |

## Vấn đề
- [MEDIUM] Tương thích prop `pageIndex`: Trong `SupplierTable.tsx`, cha truyền vào `pageIndex` (1-based). Để không breaking caller `SupplierListPage`, cần map prop `currentPage={pageIndex}` vào `TablePagination`.
  → Đề xuất: Giữ nguyên interface bên ngoài của các Table component cha nếu không bắt buộc phải đổi, chỉ thay thế phần footer render bên trong.
- [LOW] Xử lý khi danh sách rỗng (`totalItems === 0`): Cần xử lý hiển thị `0 - 0 trên tổng số 0` và disable toàn bộ nút thay vì hiển thị `1 - 0`.
  → Đề xuất: Thêm logic guard `from = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1`.

## Kết luận: Chấp nhận
Các vấn đề đã được ghi nhận và có giải pháp rõ ràng, sẵn sàng lập checklist `tasks.md`.
