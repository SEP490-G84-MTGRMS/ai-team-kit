---
verdict: PASS
date: '2026-10-13'
tester: '@Des7240'
feature: 'FE-08: Customer CRM & Accounts Receivable Frontend'
---

# Test Report: fe08-customer-crm-frontend

## Kết quả tổng quan
- **Verdict**: PASS (10/10 test scenarios đạt yêu cầu)
- **Frontend TypeScript Build**: 0 errors (`tsc -b && vite build`).
- **Linter (oxlint)**: 0 errors trên 113 files.
- **Tự động đồng bộ**: Tích hợp cổng công cụ đồng bộ lên 5 file Google Sheets kiểm thử (Report 5.1 -> 5.5).

## 1. Bảng Kịch Bản Kiểm Thử (Unified Test Table - BDD)
| Test Case ID | Tên kịch bản | Pre-conditions (GIVEN) | Procedure / Steps (WHEN) | Expected Results (THEN) | Role | Priority | Report Type | Kết quả | Ghi chú |
|---|---|---|---|---|:---:|:---:|:---:|:---:|---|
| TC-FE08-01 | REQ-08.1: Tìm kiếm tức thì khách hàng theo SĐT & Tên | Danh sách hiển thị 100 khách hàng trên màn hình CRM | Nhập "0912345678" vào ô tìm kiếm nhanh | Lọc chính xác khách hàng khớp trong vòng < 300ms không reload trang | Cashier | High | 5.3 | PASS | Phản hồi < 150ms, debounce mượt mà |
| TC-FE08-02 | REQ-08.1: Lọc danh sách theo Hạng thẻ VIP (Standard/Silver/Gold/VIP) | Đang ở màn hình danh sách khách hàng CRM | Chọn bộ lọc hạng VIP từ dropdown bộ lọc | Dữ liệu bảng lọc chính xác 100% các khách hàng thuộc hạng tương ứng | StoreManager | Medium | 5.3 | PASS | Dữ liệu lọc khớp 100% |
| TC-FE08-03 | REQ-08.1: Lọc khách hàng có nguy cơ vượt hạn mức nợ (DebtLimit) | Khách hàng có CurrentDebtAR >= DebtLimit | Kích hoạt bộ lọc "Quá hạn mức" từ dropdown công nợ | Bảng chỉ hiển thị khách hàng có nợ vượt hạn mức kèm badge cảnh báo đỏ | StoreManager | High | 5.3 | PASS | Hiển thị đúng badge cảnh báo đỏ |
| TC-FE08-04 | REQ-08.2: Thêm mới khách hàng với đầy đủ trường hợp lệ | Mở modal "Thêm khách hàng" | Nhập Họ tên, SĐT 10 số, Hạn mức nợ 5,000,000 VNĐ và bấm Lưu | Form submit thành công, hiển thị toast thông báo và thêm vào đầu danh sách | Cashier | High | 5.3 | PASS | Submit thành công, cập nhật KPI |
| TC-FE08-05 | REQ-08.2: Chặn submit khi SĐT sai định dạng (Edge Case) | Form modal Thêm/Sửa khách hàng đang mở | Nhập SĐT "12345" và bấm Lưu | Hệ thống báo lỗi "Số điện thoại không đúng định dạng (10 chữ số)" và ngăn submit | Cashier | High | 5.3 | PASS | Bắt lỗi regex 10 số VN |
| TC-FE08-06 | REQ-08.3: Mở Drawer chi tiết Profile & widget % nợ dễ dùng | Khách hàng đang có CurrentDebtAR = 2,000,000 và DebtLimit = 5,000,000 | Bấm vào dòng khách hàng trên bảng | Drawer trượt mượt mà hiển thị thanh tiến độ nợ 40% (màu vàng) và đủ 3 tabs | StoreManager | Medium | 5.3 | PASS | Drawer trượt mượt, đủ 3 tabs |
| TC-FE08-07 | REQ-08.4: Lập phiếu thu nợ & Tạo mã VietQR động Napas 247 | Khách hàng đang nợ 1,500,000 VNĐ, tài khoản ngân hàng cấu hình sẵn | Bấm Thu nợ, nhập 1,000,000 VNĐ và chọn phương thức Chuyển khoản VietQR | Modal render mã QR Napas 247 đúng số tiền 1,000,000 VNĐ và cú pháp THUNO <SĐT> | Cashier | Critical | 5.2 | PASS | Sinh mã QR chuẩn, đúng STK và cú pháp THUNO |
| TC-FE08-08 | REQ-08.4: Chặn thu nợ vượt quá số tiền nợ hiện tại (Edge Case) | Khách hàng đang nợ 500,000 VNĐ | Nhập số tiền thu là 600,000 VNĐ trong modal Thu nợ | Hệ thống báo lỗi vượt quá số nợ và vô hiệu hóa nút xác nhận | Cashier | High | 5.3 | PASS | Form chặn submit và báo lỗi đỏ |
| TC-FE08-09 | REQ-08.5: Kiểm soát quyền điều chỉnh hạn mức nợ DebtLimit (RBAC) | Đang đăng nhập với vai trò Cashier (Thu ngân) | Mở form chỉnh sửa thông tin khách hàng và cố sửa DebtLimit | Trường DebtLimit bị vô hiệu hóa (disabled) kèm thông báo chỉ Quản lý mới được sửa | Cashier | Critical | 5.4 | PASS | Chỉ StoreOwner/Manager được sửa trần nợ |
| TC-FE08-10 | Nghiệm thu toàn diện luồng Thu nợ & Đồng bộ Sổ quỹ (Acceptance) | Khách hàng nợ 1,000,000 VNĐ, Sổ quỹ đang mở phiên giao dịch | Cashier lập phiếu thu nợ 500,000 VNĐ, StoreOwner kiểm tra Sổ quỹ và Công nợ | Sổ quỹ ghi nhận phiếu thu +500,000 VNĐ, Công nợ khách hàng giảm còn 500,000 VNĐ | StoreOwner | High | 5.5 | PASS | Thử nghiệm luồng end-to-end thành công |

## 2. Kiểm Thử Biên Dịch & Chất Lượng Mã Nguồn
- `npm run build`: PASS (built in 2.02s)
- `npm run lint`: PASS (0 errors trên 113 files)
