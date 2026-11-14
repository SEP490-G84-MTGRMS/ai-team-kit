# Skeptic Review: store-owner-dashboard-overview

| Chiều | Điểm (1–5) | Nhận xét |
|---|---:|---|
| D1 Completeness | 3/5 | Đã có ba KPI và các trạng thái rỗng/lỗi, nhưng chưa định nghĩa nguồn dữ liệu cho yêu cầu nâng cấp. |
| D2 Correctness | 2/5 | “Doanh thu đã thu” không khớp cách Backend hiện tính MRR dự kiến từ giá gói của tenant active. |
| D3 Coherence | 4/5 | REQ-DASH-01 và REQ-DASH-ADMIN-01 thống nhất về việc tách Dashboard Admin khỏi Store Owner. |
| D4 Constraints | 4/5 | Đã yêu cầu dữ liệu thật và không dùng mock; phân quyền route Admin đã có ở Backend. |
| D5 Blast Radius | 3/5 | Cần sửa cả Backend API và Frontend; có thể cần bổ sung nơi lưu upgrade request nếu muốn đếm mọi yêu cầu. |

## Vấn đề
- [HIGH] REQ-DASH-ADMIN-01 dùng cụm “tổng doanh thu subscription thu được”, nhưng `AdminDashboardService` hiện chỉ tính MRR dự kiến bằng tổng `PriceMonthly` của tenant active; đây không phải tiền đã thu. → Đề xuất: chốt rõ KPI là MRR dự kiến hay tổng giao dịch subscription thành công, rồi quy định nguồn dữ liệu tương ứng.
- [HIGH] REQ-DASH-ADMIN-01 yêu cầu “tổng số yêu cầu nâng cấp subscription plan”, nhưng code hiện xử lý mua/nâng cấp trực tiếp qua `POST /subscriptions/purchase` và không có entity/repository lưu mọi upgrade request để đếm. → Đề xuất: chốt đếm giao dịch nâng cấp thành công hiện có, hoặc bổ sung mô hình lưu upgrade request và trạng thái.
- [MEDIUM] Frontend `AdminDashboardPage` khởi tạo bằng mock và Backend `GetMonthlyAnalyticsAsync` sinh chuỗi số liệu mô phỏng; điều này xung đột với yêu cầu “không sử dụng số liệu mock”. → Đề xuất: thêm task loại bỏ fallback/mock và hiển thị loading/empty/error đúng spec.

## Kết luận: Cần sửa
Chưa sẵn sàng lập tasks cuối cùng cho phần Dashboard Admin cho đến khi hai KPI HIGH được chốt nghĩa nghiệp vụ.
