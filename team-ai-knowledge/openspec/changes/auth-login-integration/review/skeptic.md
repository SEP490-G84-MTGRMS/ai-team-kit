# Skeptic Review: auth-login-integration

| Chiều | Điểm (1–5) | Nhận xét |
|---|---|---|
| D1 Completeness | 4/5 | Đã bao phủ các kịch bản thành công, fallback tenant, sinh dynamic user. Cần bổ sung xử lý khi sai mật khẩu và dữ liệu rỗng. |
| D2 Correctness | 4/5 | AuthService hiện tại chưa kiểm tra mật khẩu `user.Password == request.Password` khi user tồn tại. Cần kiểm tra mật khẩu trước khi cấp token. |
| D3 Coherence | 5/5 | Proposal, Design-brief và Specs hoàn toàn thống nhất về mô hình DTO `usernameOrEmail`, port `5232` và Vite proxy. |
| D4 Constraints | 5/5 | Tuân thủ chặt chẽ RULE_UI_DESIGN_SYSTEM (Monochrome icon, nút Full Pill) và quy tắc tạo Worklog cho Backend trước commit. |
| D5 Blast Radius | 5/5 | Phạm vi an toàn, hỗ trợ route kép `/api` và `/api/v1` giúp không phá vỡ bất kỳ endpoint hiện có nào. |

## Vấn đề
- [MEDIUM] REQ-01: `AuthService.LoginAsync` hiện tại chưa so sánh `user.Password == request.Password` khi user tồn tại trong DB → Đề xuất: Bổ sung kiểm tra mật khẩu; nếu không khớp, ném `UnauthorizedAccessException` hoặc trả về thông báo lỗi 401 hợp chuẩn.
- [LOW] REQ-02: Trường `UserInfo` trả về nên chứa cả `Role` và `RoleName` để đảm bảo cả frontend cũ và mới đều đọc được role của user mà không cần map phức tạp → Đề xuất: Khai báo thêm thuộc tính `Role` trong `UserInfo` record.

## Kết luận: Chấp nhận (Sau khi đưa yêu cầu kiểm tra mật khẩu và thêm trường Role vào Tasks)
