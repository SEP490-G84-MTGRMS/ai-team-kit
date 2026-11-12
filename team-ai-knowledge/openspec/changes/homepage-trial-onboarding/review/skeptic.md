# Skeptic Review: homepage-trial-onboarding

## Điểm D1-D5

- D1 Completeness: 3/5
- D2 Correctness: 3/5
- D3 Coherence: 2/5
- D4 Constraints: 3/5
- D5 Blast Radius: 3/5

## Vấn đề

- [HIGH] `proposal.md` vẫn nói mọi đăng ký kích hoạt Trial/Dashboard, mâu thuẫn specs quy định đăng ký thường tạo `NO_PLAN`.
- [HIGH] `NO_PLAN` mới chỉ có frontend route guard; gọi trực tiếp business API vẫn có thể vượt chặn.
- [HIGH] Backfill chưa có thuật toán xác định cho tenant Trial, tenant trả phí và dữ liệu mơ hồ.
- [HIGH] OTP bị tiêu thụ trước DB commit; transaction lỗi khiến người dùng không retry được.
- [MEDIUM] Chưa định nghĩa account khi soft-delete/tạo lại hoặc thay email/phone.
- [MEDIUM] Chưa chốt cơ chế DB ngăn hai tenant đồng thời dùng cùng account để nhận Trial.
- [MEDIUM] `EXPIRED` chưa nêu nguồn sự thật theo UTC.
- [MEDIUM] Allowlist `NO_PLAN` thiếu ví/nạp tiền/checkout.
- [LOW] Nên chuẩn hóa ProblemDetails/error code.

## Kết luận

Cần sửa toàn bộ vấn đề HIGH trước khi lập tasks.
