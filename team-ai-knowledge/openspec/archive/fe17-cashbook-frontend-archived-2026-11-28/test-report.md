---
verdict: PASS
change: fe17-cashbook-frontend
executed_by: Des7240
executed_at: 2026-10-14T01:55:00Z
---

# Test Report: fe17-cashbook-frontend

## 1. Bảng Kịch Bản Kiểm Thử (Unified Test Table - BDD)
| Test Case ID | Tên kịch bản | Pre-conditions (GIVEN) | Procedure / Steps (WHEN) | Expected Results (THEN) | Role | Priority | Report Type | Kết quả | Ghi chú |
|---|---|---|---|---|:---:|:---:|:---:|:---:|---|
| TC-FE17-01 | REQ-17.1: Khởi tạo tài khoản quỹ và hiển thị số dư tức thời | Hệ thống có tài khoản két tiền mặt và tài khoản ngân hàng | Người dùng truy cập trang Sổ quỹ `/store-owner/cashbook` | Danh sách thẻ tài khoản hiển thị đúng số dư, phân loại rõ Két tiền mặt và Ngân hàng | StoreOwner | High | 5.1 | PASS | Khởi tạo thành công 4 tài khoản quỹ mặc định |
| TC-FE17-02 | REQ-17.2: Lập Phiếu Thu tiền mặt thành công | Modal Lập Phiếu Thu đang mở, chọn Két tiền mặt Q1 | Nhập số tiền thu 2.000.000 đ, người nộp và nhấn "Lưu Phiếu Thu" | Số dư két tăng thêm 2.000.000 đ, tạo bút toán RECEIPT, hiển thị AdminToast thành công | Cashier | High | 5.3 | PASS | Bút toán ghi nhận số dư lũy kế chính xác |
| TC-FE17-03 | REQ-17.2: Chặn submit Phiếu Thu khi số tiền <= 0 hoặc thiếu thông tin | Modal Lập Phiếu Thu đang mở | Nhập số tiền thu bằng 0 hoặc để trống đối tượng nộp và nhấn lưu | Hệ thống chặn submit, hiển thị thông báo lỗi màu đỏ yêu cầu nhập số tiền > 0 | Cashier | Medium | 5.3 | PASS | Kiểm tra validation form thu tiền chặt chẽ |
| TC-FE17-04 | REQ-17.3: Lập Phiếu Chi tiền mặt hợp lệ khi đủ số dư két | Két tiền mặt Q1 có số dư 12.500.000 đ, Modal Phiếu Chi đang mở | Nhập số tiền chi 1.500.000 đ cho NCC và nhấn "Xác Nhận Chi Tiền" | Số dư két giảm còn 11.000.000 đ, tạo bút toán PAYMENT, hiển thị AdminToast | StoreManager | High | 5.3 | PASS | Ghi nhận phiếu chi và trừ số dư két chính xác |
| TC-FE17-05 | REQ-17.3: Chặn âm két tiền mặt theo quy tắc GBR-CSH-03 (Chống âm quỹ) | Két tiền mặt có số dư 1.000.000 đ, Modal Phiếu Chi đang mở | Nhập số tiền chi 1.500.000 đ (vượt quá 1.000.000 đ) | Hệ thống hiện cảnh báo đỏ GBR-CSH-03 và vô hiệu hóa nút "Xác Nhận Chi Tiền" | StoreManager | Critical | 5.4 | PASS | Quy tắc GBR-CSH-03 ngăn ngừa triệt để âm két |
| TC-FE17-06 | REQ-17.4: Kiểm kê két tiền mặt khớp 100% với sổ sách | Két tiền mặt có số dư sổ sách 10.000.000 đ, mở Modal Kiểm kê | Nhập số tiền thực tế đếm được 10.000.000 đ và nhấn "Chốt Kiểm Kê" | Chênh lệch bằng 0 đ, hệ thống thông báo khớp hoàn toàn và không tạo bút toán lệch | StoreManager | High | 5.4 | PASS | Đối soát kiểm kê két khớp hoàn toàn |
| TC-FE17-07 | REQ-17.4: Bắt buộc giải trình chênh lệch kiểm kê theo quy tắc GBR-CSH-04 | Két tiền mặt có số dư 10.000.000 đ, tiền thực tế đếm được 9.800.000 đ | Để trống lý do giải trình hoặc nhập lý do "Bù tiền thối nhầm" và chốt | Bắt buộc nhập lý do mới cho chốt; khi chốt tạo bút toán ADJUSTMENT -200.000 đ | StoreManager | Critical | 5.4 | PASS | Quy tắc GBR-CSH-04 thực thi bắt buộc giải trình |
| TC-FE17-08 | REQ-17.5: Khóa sửa/xóa bút toán hệ thống sinh tự động (GBR-CSH-01) | Bảng Sổ quỹ hiển thị giao dịch từ POS (IsAutomated = true) | Quan sát cột thao tác / nguồn giao dịch | Hiển thị badge "🔒 Hệ thống", không cho phép sửa hoặc xóa thủ công | Cashier | Critical | 5.4 | PASS | Bảo vệ toàn vẹn dữ liệu kế toán tự động |
| TC-FE17-09 | REQ-17.1: Tích hợp TablePagination và bộ lọc đa tiêu chí KiotViet | Trang Sổ quỹ có nhiều giao dịch phát sinh | Chọn lọc theo Chi nhánh Q1, lọc loại Phiếu Thu, chuyển trang phân trang | Bảng Sổ quỹ lọc chính xác dữ liệu, phân trang TablePagination chuyển mượt mà | StoreManager | Medium | 5.2 | PASS | Tích hợp hoàn hảo component TablePagination |
| TC-FE17-10 | REQ-17.5: Xuất file Excel CSV có UTF-8 BOM và xem trước bản in A4 (UAT) | Đang xem danh sách Sổ quỹ, mở Modal Xuất & In Sổ Quỹ | Tải file .CSV và bấm "Xem Trước & In A4" | File CSV mở trên Excel không vỡ font tiếng Việt (BOM \uFEFF), bản in A4 có 3 chữ ký | StoreOwner | High | 5.5 | PASS | Nghiệm thu UAT xuất file và in ấn A4 chuẩn mực |

---

## 2. Kết Quả Chạy Lệnh Kiểm Thử Thực Tế

### Lệnh 1: Chạy Unit Tests Vitest
```bash
$ npx vitest run src/features/cashbook/__tests__/cashbook.test.ts

 RUN  v5.0.4 D:/Sourse_code_Do_An/MT_GRMS_FRONTEND

 ✓ src/features/cashbook/__tests__/cashbook.test.ts (9 tests) 37ms

 Test Files  1 passed (1)
      Tests  9 passed (9)
   Duration  1.82s
```

### Lệnh 2: Kiểm tra biên dịch Type Check
```bash
$ npx tsc --noEmit
# Exit code: 0 (Không phát hiện bất kỳ lỗi kiểu dữ liệu nào)
```

---

## 3. Xác Minh Giao Diện & Tuân Thủ Thiết Kế Dự Án
- **Design System MT-GRMS**: Màu chủ đạo Deep Teal (`#0F766E`), bo góc card `24px`, pill `9999px`, font `Be Vietnam Pro`, `tabular-nums` hiển thị tiền tệ.
- **Shared Components**: Tích hợp hoàn hảo `AdminToast` và `TablePagination` mà không làm thay đổi logic core.
- **Phân hệ điều hướng**: Route `/store-owner/cashbook` và menu trong `AppTopNav.tsx` hoạt động trơn tru.
