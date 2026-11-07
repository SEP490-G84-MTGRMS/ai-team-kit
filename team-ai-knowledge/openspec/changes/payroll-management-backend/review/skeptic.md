# Skeptic Review: payroll-management-backend

| Chiều | Điểm (1–5) | Nhận xét |
|---|---|---|
| D1 Completeness | 4/5 | Đã bao phủ 4 REQ chính, các công thức 3 loại hình lương, OT ngày thường/nghỉ, cấn trừ nợ tạm ứng và sinh phiếu chi Sổ quỹ. Đã có kịch bản cơ bản và edge case âm thực lĩnh. |
| D2 Correctness | 5/5 | Logic nghiệp vụ khớp chính xác với luật lao động Việt Nam (BHXH 10.5% chỉ tính lương tháng, OT 150%/200%), quy đổi công chuẩn mẫu số 8.0 giờ, công thức làm tròn số học rõ ràng. |
| D3 Coherence | 5/5 | Hoàn toàn thống nhất giữa proposal.md, exploration.md, design-brief.md và specs.md. |
| D4 Constraints | 5/5 | Tuân thủ triệt để Clean Architecture 4 tầng, Repository Pattern, bảo mật cô lập TenantId, hạch toán giao dịch với IUnitOfWork. |
| D5 Blast Radius | 4/5 | Không làm thay đổi cấu trúc bảng Payslips hiện có, chỉ ghi thêm bút toán hợp lệ vào CashbookTransactions, không breaking change. |

## Vấn đề
- [MEDIUM] REQ-PAY-04: Trong kịch bản chi trả hàng loạt (`BatchPayPayslipsRequest`), cần làm rõ việc nếu có 1 phiếu trong danh sách bị lỗi hoặc đã thanh toán trước đó thì rollback toàn bộ hay chi trả các phiếu hợp lệ còn lại?
  - *Đề xuất*: Xử lý theo cơ chế Best-effort trả về `BatchPayResultDto` ghi nhận số lượng thành công `SuccessCount`, số lượng thất bại `FailedCount` và danh sách chi tiết mã phiếu lỗi.
- [LOW] DTOs `PayslipResponse`: Cần phân rã rõ 3 trường thành phần bảo hiểm (`BhxhAmount`, `BhytAmount`, `BhtnAmount`) tương ứng 8%, 1.5%, 1% để frontend hiển thị mà không cần parse nhẩm. (Đã có sẵn trong design-brief).

## Đã xử lý
- Đã quy định rõ cơ chế `BatchPayResultDto` trong design-brief và service contract để đảm bảo không bị dừng cả batch khi 1 phiếu có vấn đề.

## Kết luận: Chấp nhận
Specs đã sẵn sàng để lập tasks và thực thi apply code.
