# Tasks: Dashboard Admin SaaS — MRR, Tenant và Nâng cấp gói

## Backend

- [ ] T1 — Cập nhật luồng mua subscription để nhận diện chuyển từ plan hiện tại lên plan cao hơn và lưu `WalletTransaction.Type = UPGRADE_PLAN`, không đánh dấu gia hạn/mua lần đầu/dùng thử là nâng cấp (REQ-DASH-ADMIN-01).
- [ ] T2 — Bổ sung truy vấn đếm giao dịch `UPGRADE_PLAN` có `Status = SUCCESS` và trả KPI tổng số tenant, MRR dự kiến, số nâng cấp thành công từ Admin Dashboard API (REQ-DASH-ADMIN-01).
- [ ] T3 — Loại bỏ dữ liệu Dashboard Backend được sinh mô phỏng; trả dữ liệu thật hoặc tập rỗng phù hợp khi chưa có dữ liệu (REQ-DASH-ADMIN-01).

## Frontend

- [ ] T4 — Sửa `AdminDashboardPage` hiển thị ba KPI MRR dự kiến, tổng tenant và số nâng cấp thành công bằng API thật; không khởi tạo hoặc fallback sang mock (REQ-DASH-ADMIN-01).
- [ ] T5 — Bổ sung trạng thái loading, empty, error và nút tải lại; giữ Dashboard Admin tách biệt KPI bán lẻ Store Owner (REQ-DASH-ADMIN-01, REQ-DASH-01).

## Test và tài liệu

- [ ] T6 — Viết/cập nhật Backend tests cho công thức MRR, tổng tenant và phân loại giao dịch nâng cấp; bao phủ gia hạn, mua lần đầu, nâng cấp thành công và giao dịch thất bại (REQ-DASH-ADMIN-01).
- [ ] T7 — Viết/cập nhật Frontend tests cho dữ liệu thành công, giá trị 0, lỗi API và tải lại; chạy build/lint/test liên quan (REQ-DASH-ADMIN-01).
- [ ] T8 — Cập nhật Backend worklog và `CHANGELOG.md` theo quy định repository, ghi rõ file thay đổi và kết quả test.
