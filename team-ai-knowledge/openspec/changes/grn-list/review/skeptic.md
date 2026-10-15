# Skeptic Review: grn-list

| Chiều | Điểm (1–5) | Nhận xét |
|---|:---:|---|
| D1 Completeness | 5/5 | Đầy đủ các kịch bản chính và edge cases: danh sách rỗng, nhân viên chi nhánh bị giới hạn quyền, chủ chuỗi xem toàn diện, chuyển tab, phân trang. |
| D2 Correctness | 5/5 | Các trạng thái nghiệp vụ (TODAY, DRAFT, CONFIRMED, MISMATCH, CANCELED) và con số khớp 100% với prototype `design_ui/grn_list.html` và quy trình FE-05. |
| D3 Coherence | 5/5 | Thống nhất tuyệt đối giữa proposal, exploration, design brief và specs. Thuật ngữ chuẩn (GRN, PO, Lô FEFO, Mismatch). |
| D4 Constraints | 5/5 | Phân quyền RBAC chặt chẽ: Employee chỉ thấy chi nhánh mình quản lý; Store Owner xem toàn bộ chi nhánh. |
| D5 Blast Radius | 5/5 | Module hóa hoàn toàn tại `src/features/goods-receipt/`, không ảnh hưởng tới code đang chạy của các phân hệ khác. |

## Vấn đề
- [MEDIUM] REQ-02: Cơ chế kiểm thử phân quyền 2 vai trò trên môi trường dev/demo cần thuận tiện cho reviewer và tester.
  → Đề xuất: Tích hợp Role Switcher bar trên tiêu đề trang (`Store Owner (Toàn chuỗi)` vs `Employee (Thủ kho BR-01)`) để kiểm thử ngay lập tức 2 hành vi phân quyền trên cùng một giao diện.
- [LOW] REQ-05: Cần đảm bảo định dạng hiển thị Lô hàng và Hạn sử dụng trong Drawer theo đúng chuẩn FEFO (`Lô: B26-xxx | HSD: DD/MM/YYYY`).
  → Đề xuất: Sử dụng badge xám nhạt với icon `Calendar` và `Tag` cho thông tin lô hạn.

## Kết luận: Chấp nhận
Không có vấn đề mức HIGH. Đặc tả specs và design brief đã đủ độ chín muồi và sẵn sàng chuyển sang lập task list chi tiết.
