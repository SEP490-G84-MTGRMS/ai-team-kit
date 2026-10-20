# Skeptic Review: branch-order-management

| Chiều | Điểm (1–5) | Nhận xét |
|---|:---:|---|
| D1 Completeness | 4/5 | Đầy đủ các Scenario cho phân trang, tìm kiếm từ khóa, lọc theo trạng thái/mã chi nhánh và cô lập multi-tenant. Cần chú ý edge-case phân trang vượt ngưỡng. |
| D2 Correctness | 5/5 | Mô hình thực thể `Branch` hợp lý, trường dữ liệu khớp chuẩn domain bán lẻ chuỗi, DTOs tách biệt rõ ràng với Domain Entity. |
| D3 Coherence | 5/5 | Thống nhất 100% giữa proposal, exploration, design-brief và specs về kiến trúc Clean Architecture và bố cục layout `SupplierListPage`. |
| D4 Constraints | 5/5 | Kế thừa `BaseTenantEntity`, áp dụng Global Query Filter, đảm bảo bảo mật và cô lập dữ liệu đa người thuê. |
| D5 Blast Radius | 5/5 | Entity mới và Component UI cục bộ, không gây breaking change tới các module hiện hữu (`OrderMatrixPage`, `SupplierOrderDispatchHubPage`). |

## Vấn đề
- [MEDIUM] REQ-BR-01 / DTO: Chuẩn hóa định dạng `Status` giữa Frontend (`'active'` trong mock data cũ) và Backend (`'Active' | 'Inactive'`). → Đề xuất: Trong `branchApi.ts`, chuẩn hóa mapper chuyển đổi cả 2 định dạng về `'Active' | 'Inactive'`, đảm bảo badge hiển thị chính xác. (Đã ghi nhận để cài đặt trong API Client)
- [LOW] REQ-BR-01: Phân trang cần giới hạn chặn `pageSize` tối đa 100 để tránh quá tải tài nguyên DB khi client gửi kích thước trang bất thường. → Đề xuất: Trong `BranchService`, giới hạn `pageSize` trong khoảng `[1, 100]` và `pageIndex = Math.Max(1, pageIndex)`.
- [LOW] REQ-BR-03: Hành vi nút "Xuất Excel" trên thanh Header khi chưa có endpoint xuất file. → Đề xuất: Hiển thị toast thông báo tính năng xuất Excel đang xử lý để mang lại trải nghiệm người dùng liền mạch.

## Kết luận: Chấp nhận
Không có vấn đề mức độ HIGH. Các vấn đề MEDIUM và LOW đều có phương án xử lý rõ ràng trong quá trình cài đặt code. Specs sẵn sàng để lập tasks.
