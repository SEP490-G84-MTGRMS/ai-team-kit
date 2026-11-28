---
verdict: PASS
date: '2026-11-01'
tester: '@Des7240'
feature: 'FE-19: Household Business Tax Management (TT 152/2025 & ND 141/2026)'
---

# Test Report: fe19-tax-snapshot-frontend

## Kết quả tổng quan
- **Verdict**: PASS (12/12 test scenarios đạt yêu cầu)
- **Frontend TypeScript Build**: 0 errors (`npm run build` thành công trong 1.15s).
- **Vitest Unit Tests**: **87 / 87 tests PASSED (100%)**.
- **Backend Unit & Integration Tests**: **74 / 74 tests PASSED (100%)**.
- **Tự động đồng bộ**: Hỗ trợ đồng bộ tự động lên 5 file Google Sheets kiểm thử (Report 5.1 -> 5.5).

## 1. Bảng Kịch Bản Kiểm Thử (Unified Test Table - BDD)
| Test Case ID | Tên kịch bản | Pre-conditions (GIVEN) | Procedure / Steps (WHEN) | Expected Results (THEN) | Role | Priority | Report Type | Kết quả | Ghi chú |
|---|---|---|---|---|:---:|:---:|:---:|:---:|---|
| TC-FE19-01 | REQ-FE19-01: Khởi động & Render màn hình Thuế FE-19 kèm Thước đo 1 Tỷ | Đăng nhập tài khoản StoreOwner vào hệ thống MT-GRMS | Điều hướng tới đường dẫn `/store-owner/tax-snapshots` | Giao diện load < 1s, hiển thị Thước đo ngưỡng 1 Tỷ, 5 thẻ KPI và thanh điều hướng 4 tab | StoreOwner | Critical | 5.1 | PASS | Render chuẩn Design System, Thước đo 3 vùng màu trực quan |
| TC-FE19-02 | REQ-FE19-01: Phân nhóm HKD tự động & Thẻ KPI lũy kế YTD theo NĐ 141/2026 | Dữ liệu doanh thu lũy kế cả năm đạt 1.150.000.000đ | Truy cập trang tổng quan thuế Quý 4/2026 | Hệ thống tự động phân loại Nhóm 2 (1-3 Tỷ, Sổ S2a), cờ vượt ngưỡng giữa năm = true | StoreOwner | High | 5.1 | PASS | Định dạng tiền VNĐ chuẩn, hiển thị badge Nhóm 2 |
| TC-FE19-03 | REQ-FE19-02: Tính thuế TNCN phần vượt trần & Thuế GTGT giảm 0.8% FMCG theo NQ 204 | Doanh thu thuần Q4 là 763.970.000đ, YTD vượt 1 Tỷ đúng 150.000.000đ | Kiểm tra các chỉ số thuế hiển thị trên tờ khai Quý 4 | Thuế TNCN = 150M × 0.5% = 750.000đ; Thuế GTGT tính theo phương án thận trọng 11.5M (FMCG 0.8%, hàng khác 1.0%) | Accountant | Critical | 5.1 | PASS | Khớp 100% công thức toán học và quy định Điều 10 NĐ 68/2026 |
| TC-FE19-04 | REQ-FE19-02: So sánh trực tiếp Phương pháp Tỷ lệ % vs Kê khai Lợi nhuận 15% | Doanh thu thuần 763.97M, COGS 646.87M, OPEX 54.5M | Chuyển đổi giữa 2 tab Tỷ lệ % và Kê khai trong Tờ khai | Phương pháp % ra thuế 12.25M; Phương pháp Kê khai tính thuế TNCN 15% trên lợi nhuận 56.68M = 8.5M | StoreOwner | High | 5.1 | PASS | Giúp chủ hộ chọn phương án tiết kiệm tối ưu chi phí thuế |
| TC-FE19-05 | REQ-FE19-03: Hiển thị hệ thống 7 Sổ kế toán điện tử Thông tư 152/2025/TT-BTC | Chuyển sang Tab "Sổ kế toán HKD" | Lần lượt chọn các mẫu sổ S1a, S2a, S2c, S2d, S2e, S3a Thuế Khác | Dữ liệu đổ tự động theo thời gian thực từ POS và Phiếu chi; tab S3a theo dõi riêng thuế TTĐB bia rượu, thuốc lá | Accountant | High | 5.2 | PASS | Chuẩn hóa 100% theo TT 152/2025/TT-BTC, gỡ bỏ TT 88 cũ |
| TC-FE19-06 | REQ-FE19-03: Khấu trừ doanh thu thuần từ Chiết khấu & Hàng bán bị trả lại | Đơn hàng 800M có 10M chiết khấu POS và phiếu hàng trả lại 26.03M | Hệ thống tính toán doanh thu thuần chịu thuế | Doanh thu thuần = 800M - 10M - 26.03M = 763.970.000đ | Accountant | High | 5.2 | PASS | Liên kết chính xác với bảng CustomerDebtEntries EntryType=3 |
| TC-FE19-07 | REQ-FE19-03: Loại trừ chi phí ảo & Rút vốn chủ sở hữu trong Phiếu chi OPEX | Danh sách phiếu chi có khoản chi tiền thuê nhà, điện nước và chi rút vốn | Hệ thống tổng hợp sổ chi phí S2c-HKD | Chỉ nhận phiếu chi Approved có hóa đơn, tự động loại trừ 100% từ khóa Vốn, Rút vốn, Equity, Capital | Accountant | High | 5.2 | PASS | Đảm bảo chi phí hợp lý được trừ hợp lệ theo quy định thuế |
| TC-FE19-08 | REQ-FE19-04: Lọc danh sách kỳ thuế & Biểu đồ tiến độ phân tích 4 Quý / 12 Tháng | Chọn bộ lọc Năm 2026, xem Tab Phân tích | Chuyển đổi giữa chế độ xem 4 Quý và 12 Tháng | Biểu đồ trực quan hiển thị doanh thu, thuế nộp từng kỳ, tiến độ 4 kỳ hoàn tất | StoreOwner | Medium | 5.3 | PASS | Co giãn mượt mà, hỗ trợ quản trị tài chính cả năm |
| TC-FE19-09 | REQ-FE19-04: Xuất file bảng tính Excel 4 sheet phẳng phục vụ thanh tra thuế | Nhấp nút "Xuất Excel" trên thanh công cụ | Tải về file tính thuế định dạng .xlsx | File gồm 4 sheet phẳng: Tổng hợp thuế, Sổ S2a, Sổ S2c, Lịch sử snapshot với đầy đủ cột dữ liệu | StoreOwner | High | 5.3 | PASS | Định dạng chuẩn đối chiếu của cơ quan thuế |
| TC-FE19-10 | REQ-FE19-05: Bảo mật phân quyền RBAC chặn nhân viên thu ngân truy cập | Đăng nhập tài khoản Cashier | Cố tình truy cập route `/store-owner/tax-snapshots` | Hệ thống chặn quyền và điều hướng an toàn về trang POS bán hàng | Cashier | Critical | 5.4 | PASS | Bảo vệ dữ liệu bí mật kinh doanh của chủ hộ |
| TC-FE19-11 | REQ-FE19-05: Xác thực mã PIN chủ hộ & Niêm phong mật mã HMAC-SHA256 Audit Seal | Mở modal chốt kỳ tính thuế Quý 4/2026 | Nhập mã PIN 6 chữ số và nhấn Chốt kỳ | Mã PIN xác thực SHA-256; sinh con dấu HMAC-SHA256 niêm phong dữ liệu bất biến chống sửa đổi | StoreOwner | Critical | 5.4 | PASS | Con dấu k-2026-v1:a4828... khóa cứng kỳ thuế thành công |
| TC-FE19-12 | REQ-FE19-06: Nghiệm thu kịch bản thực tế Tiệm Tạp Hóa Cô Ba chốt sổ 4/4 Quý | Hoàn thành chốt số liệu cả 4 Quý năm 2026 | Kiểm tra Tab Lịch sử và đối chiếu tổng thuế năm | Đủ 4 Quý ở trạng thái Đã chốt, tổng doanh thu 1.150M, tổng thuế năm 12.250.000đ | StoreOwner | High | 5.5 | PASS | Hoàn tất nghiệm thu nghiệp vụ thực tế trên CSDL Neon PostgreSQL |

## 2. Nhật Ký Thực Thi Kiểm Thử (Execution Logs)
- `npm run build`: `built in 1.15s` (0 lỗi biên dịch TypeScript).
- `vitest run`: **87 / 87 tests passed (100%)**.
- `dotnet test`: **74 / 74 tests passed (100%)**.
- Kiểm thử luồng nghiệp vụ trên trình duyệt bằng Chrome DevTools MCP: Vượt ngưỡng 1 tỷ, chốt kỳ Quý 4, kiểm tra Audit Seal và đối chiếu 4 Quý đạt chuẩn tuyệt đối.
