# Skeptic Review: payroll-management-ui

| Chiều | Điểm (1–5) | Nhận xét |
|---|---|---|
| D1 Completeness | 5/5 | Đầy đủ 6 requirements với các Scenario Gherkin chi tiết bao phủ cả luồng chính lẫn edge cases (danh sách rỗng, lỗi validation, lỗi kỳ chốt). |
| D2 Correctness | 5/5 | Khớp 100% với hợp đồng API của backend `PayslipsController.cs` (Query params, URL paths, DTOs và cấu trúc ApiResponse). |
| D3 Coherence | 5/5 | Nhất quán tuyệt đối giữa `proposal.md`, `exploration.md`, `design-brief.md` và `specs.md`. Thuật ngữ chuẩn hóa. |
| D4 Constraints | 5/5 | Tuân thủ wrapper `httpClient`, tự động đính kèm JWT header, xử lý lỗi theo chuẩn `ProblemDetails` qua `problemDetailsMapper.ts`. |
| D5 Blast Radius | 5/5 | Phạm vi giới hạn trong tầng UI của feature `employee`, không thay đổi backend DB, không gây breaking change cho các phân hệ khác. |

## Vấn đề

- **[MEDIUM] REQ-FE-PAY-02: Tham số `branchId` khi người dùng chọn "Tất cả chi nhánh"**
  - *Vấn đề:* Trong dropdown chi nhánh, nếu người dùng chọn `ALL`, không được gửi `branchId="ALL"` lên backend vì backend mong đợi kiểu `Guid?`.
  - *Đề xuất:* Trong `payslipApi.ts` hoặc `PayslipManagementPage.tsx`, nếu `branchId === 'ALL'`, gán `undefined` để backend hiểu là truy vấn tất cả chi nhánh của Tenant. Đã được ghi nhận vào thiết kế.

- **[LOW] REQ-FE-PAY-04: Kỳ tháng mặc định khi mở modal tạo bảng lương**
  - *Vấn đề:* Cần đảm bảo kỳ tháng hiển thị trong `CreatePayslipModal` đồng bộ với kỳ tháng đang xem ở thanh điều hướng bên ngoài.
  - *Đề xuất:* Truyền `periodMonth` hiện tại của trang vào làm `initialPeriodMonth` của modal.

## Kết luận: Chấp nhận
Không có vấn đề nghiêm trọng (0 vấn đề HIGH). Specs đã sẵn sàng để lập `tasks.md` và triển khai.
