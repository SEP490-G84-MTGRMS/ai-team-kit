---
verdict: PASS
date: '2026-10-14'
tester: '@Des7240'
feature: 'FE-19: Household Business Tax Snapshot Frontend'
---

# Test Report: fe19-tax-snapshot-frontend

## Kết quả tổng quan
- **Verdict**: PASS (10/10 test scenarios đạt yêu cầu)
- **Frontend TypeScript Build**: 0 errors (`built in 818ms`).
- **Linter (oxlint)**: 0 errors trên 169 files.
- **Tự động đồng bộ**: Hỗ trợ đồng bộ tự động lên Google Sheets kiểm thử (Report 5.1 -> 5.5).

## 1. Bảng Kịch Bản Kiểm Thử (Unified Test Table - BDD)
| Test Case ID | Tên kịch bản | Pre-conditions (GIVEN) | Procedure / Steps (WHEN) | Expected Results (THEN) | Role | Priority | Report Type | Kết quả | Ghi chú |
|---|---|---|---|---|:---:|:---:|:---:|:---:|---|
| TC-FE19-01 | REQ-FE19-01: Khởi động & Render màn hình Kê khai thuế FE-19 | Đăng nhập tài khoản StoreOwner vào hệ thống MT-GRMS | Điều hướng tới đường dẫn `/store-owner/tax-snapshots` | Giao diện load < 1s, hiển thị tiêu đề FE-19, thẻ KPI và bảng kỳ thuế | StoreOwner | Critical | 5.1 | PASS | Load tức thì, render chuẩn Design System |
| TC-FE19-02 | REQ-FE19-01: Hiển thị 4 thẻ KPI thuế lũy kế năm | Đang ở màn hình danh sách kỳ tính thuế | Xem 4 thẻ KPI đầu trang | Hiển thị chính xác Doanh thu chịu thuế, Thuế GTGT 1%, Thuế TNCN 0.5%, Tổng thuế đã nộp / còn nợ | StoreOwner | High | 5.2 | PASS | Định dạng tiền VND chuẩn, màu sắc trực quan |
| TC-FE19-03 | REQ-FE19-01: Lọc danh sách kỳ tính thuế theo Năm, Quý và Trạng thái | Danh sách có các kỳ thuế từ Quý 1 đến Quý 3/2026 | Chọn Năm = 2026, Quý = Q2, Trạng thái = "Submitted" | Bảng chỉ hiển thị đúng bản ghi Quý 2/2026 trạng thái Đã nộp tờ khai | StoreOwner | Medium | 5.3 | PASS | Bộ lọc phản hồi tức thì < 50ms |
| TC-FE19-04 | REQ-FE19-02: Xem trước số liệu (Preview) khi chọn Quý và Năm | Mở modal "+ Tạo kỳ tính thuế" | Chọn Năm 2026 và Quý 4 | Hệ thống gọi preview tính tổng doanh thu từ hóa đơn Paid và hiển thị số thuế dự tính | StoreOwner | High | 5.3 | PASS | Hiển thị khớp doanh thu và số lượng đơn hàng |
| TC-FE19-05 | REQ-FE19-02: Tính toán thuế chính xác theo TT 40 (VAT 1%, PIT 0.5%) | Doanh thu chịu thuế xem trước là 550.000.000đ | Kiểm tra các chỉ số thuế hiển thị | Thuế GTGT = 5.500.000đ (1%), Thuế TNCN = 2.750.000đ (0.5%), Tổng = 8.250.000đ (1.5%) | Accountant | Critical | 5.3 | PASS | Khớp 100% công thức toán học và pháp lý |
| TC-FE19-06 | REQ-FE19-02: Ngăn chặn tạo trùng kỳ thuế đã Finalized | Kỳ Quý 3/2026 đã tồn tại ở trạng thái Finalized | Trong modal tạo mới, chọn lại Quý 3/2026 | Hệ thống hiển thị cảnh báo kỳ thuế đã tồn tại và vô hiệu hóa nút Lưu | StoreOwner | High | 5.4 | PASS | Disable nút chốt, hiển thị Alert vàng rõ ràng |
| TC-FE19-07 | REQ-FE19-03: Chuyển trạng thái tờ khai từ Draft sang Finalized | Có kỳ thuế Quý 4/2026 đang ở trạng thái Draft | Bấm nút "Chốt số liệu" từ bảng hoặc Drawer chi tiết | Trạng thái chuyển sang Finalized, khóa các thao tác chỉnh sửa | StoreOwner | High | 5.3 | PASS | Toast thông báo thành công, badge đổi màu xanh dương |
| TC-FE19-08 | REQ-FE19-03: Kiểm tra tính bất biến (Immutable) của kỳ thuế đã chốt | Kỳ thuế ở trạng thái Finalized hoặc Submitted | Kiểm tra các nút hành động trong bảng và Drawer | Không còn nút Xóa nháp hay Sửa doanh thu, đảm bảo tính bất biến kế toán | StoreOwner | Critical | 5.4 | PASS | Ẩn hoàn toàn nút xóa/sửa khi đã chốt số liệu |
| TC-FE19-09 | REQ-FE19-04: Xem bảng kê chi tiết các hóa đơn POS cấu thành | Mở Drawer chi tiết của một kỳ thuế | Chuyển sang tab "Bảng kê hóa đơn" | Hiển thị danh sách hóa đơn chi tiết với Mã HĐ, Thời gian, Khách hàng, PTTT, Số tiền | Accountant | Medium | 5.3 | PASS | Phân trang bảng kê rõ ràng, minh bạch số liệu |
| TC-FE19-10 | REQ-FE19-04: Xuất mẫu tờ khai Form 01/CNKD ra file Excel/XML | Đang xem chi tiết kỳ thuế đã chốt | Bấm nút "Xuất tờ khai Form 01", chọn Excel/XML | Trình duyệt tải về tệp tin tương ứng kèm thông báo thành công | StoreOwner | High | 5.5 | PASS | Tải file mượt mà, định dạng đúng tên tệp quy chuẩn |

## 2. Nhật Ký Thực Thi Kiểm Thử (Execution Logs)
- `npm run build`: `built in 818ms` (2242 modules transformed, 0 lỗi biên dịch).
- `npm run lint`: `Finished on 169 files with 0 errors`.
- Kiểm thử luồng nghiệp vụ trên trình duyệt: Khởi tạo, xem trước, chốt số liệu, xuất tờ khai chạy mượt mà.
