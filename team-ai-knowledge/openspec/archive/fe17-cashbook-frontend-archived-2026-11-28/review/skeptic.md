# Review: Skeptic Persona — fe17-cashbook-frontend

> Đánh giá phản biện bởi Skeptic Persona nhằm thẩm định tính chặt chẽ, an toàn dòng tiền và khả năng khả thi của đặc tả FE-17.

## 1. Bảng Chấm Điểm 5 Chiều (D1 - D5)

| Chiều đánh giá | Điểm (1-5) | Nhận xét chi tiết |
|---|:---:|---|
| **D1: Completeness** (Độ đầy đủ) | 5/5 | Bao quát toàn diện 5 use cases (UC-17.1 đến UC-17.5). Đầy đủ các kịch bản Gherkin chuẩn và các edge cases quan trọng (chặn xuất âm két tiền mặt, bắt buộc giải trình chênh lệch kiểm kê, khóa sửa bút toán tự động). |
| **D2: Correctness** (Tính chính xác) | 5/5 | Logic tính số dư lũy kế (`BalanceAfter`) khớp với chuẩn kế toán dòng tiền. Quy tắc `GBR-CSH-03` (chống âm quỹ) và `GBR-CSH-04` (đối soát kiểm kê) được định nghĩa rõ ràng. |
| **D3: Coherence** (Tính nhất quán) | 5/5 | 100% tuân thủ MT-GRMS Design System (Deep Teal `#0F766E`, bo góc card 24px, pill 9999px, font `Be Vietnam Pro`). Tái sử dụng triệt để `AdminToast` và `TablePagination`. Khớp 100% với ERD Draw.io đã thống nhất. |
| **D4: Constraints** (Ràng buộc kiến trúc) | 5/5 | Phạm vi hoàn toàn cô lập trong `MT_GRMS_FRONTEND` (`src/features/cashbook/`). Không can thiệp code Backend C#. Sử dụng Vanilla CSS scoped, không phụ thuộc runtime Tailwind. |
| **D5: Blast Radius** (Bán kính ảnh hưởng) | 5/5 | Module mới hoạt động độc lập dưới route `/store-owner/cashbook`, tích hợp an toàn dữ liệu từ POS (FE-08) và Chi phí dịch vụ (FE-07) qua mock service layer có type-safe contracts. |

---

## 2. Phân Tích Rủi Ro & Đề Xuất Giảm Thiểu

### Rủi ro 1: Phân định quyền hạn và đa chi nhánh (Medium)
- **Vấn đề**: Chi nhánh này có được xem hoặc chi tiền của két tiền mặt chi nhánh khác không?
- **Đánh giá**: Két tiền mặt gắn cứng với từng chi nhánh (`BranchId`), nhân viên chi nhánh nào chỉ thấy và thao tác trên két chi nhánh đó. Tài khoản ngân hàng có thể thuộc cấp cửa hàng chuỗi.
- **Giải pháp**: Frontend cung cấp bộ lọc Chi nhánh; khi chọn chi nhánh nào thì chỉ hiển thị két tiền mặt của chi nhánh đó, đảm bảo phân lập dữ liệu rõ ràng.

### Rủi ro 2: Khóa sửa/xóa giao dịch hệ thống (`GBR-CSH-01`) (Low)
- **Vấn đề**: Người dùng có thể vô tình xóa nhầm bút toán đối soát sinh từ hóa đơn POS hoặc phiếu chi tiền FE-07.
- **Giải pháp**: Kiểm tra cờ `IsAutomated === true`, ẩn hoàn toàn nút Sửa/Xóa hoặc hiển thị badge readonly màu xám, ngăn ngừa mọi can thiệp thủ công.

### Rủi ro 3: Xuất file Excel tiếng Việt bị lỗi font (Low)
- **Vấn đề**: Trình duyệt xuất CSV có thể bị lỗi font hiển thị trên Excel do thiếu BOM UTF-8.
- **Giải pháp**: Thêm tiền tố `\uFEFF` vào nội dung CSV trước khi đóng gói thành Blob tải xuống.

---

## 3. Kết Luận Đánh Giá

- **Đánh giá chung**: **CHẤP NHẬN (APPROVED)** — Không có vi phạm nghiêm trọng (No CRITICAL/HIGH issues).
- **Khuyến nghị**: Tiến hành xây dựng `tasks.md` và chuyển sang bước triển khai code (`/sep-apply`).
