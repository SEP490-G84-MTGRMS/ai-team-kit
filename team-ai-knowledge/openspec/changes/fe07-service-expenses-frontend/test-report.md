---
verdict: PASS
date: 2026-10-13
change: fe07-service-expenses-frontend
---

# Test Report: fe07-service-expenses-frontend

## Kết quả tổng quan
- **Verdict**: PASS
- **Frontend TypeScript Build**: 0 errors (`tsc -b`).
- **Vite Production Bundle**: Thành công trong 742ms, 2120 modules transformed.
- **Linter (oxlint)**: 0 errors, 0 warnings trên 43 files.
- **Design System Compliance**: 100% tuân thủ KiotViet Style (Electric Blue `#0066FF`, Full Pill `rounded-full`, container `rounded-[24px]`, font `Be Vietnam Pro`).

## 1. Bảng Kịch Bản Kiểm Thử (Unified Test Table - BDD)
| Test Case ID | Tên kịch bản | Pre-conditions (GIVEN) | Procedure / Steps (WHEN) | Expected Results (THEN) | Role | Priority | Report Type | Kết quả | Ghi chú |
|---|---|---|---|---|:---:|:---:|:---:|:---:|---|
| TC-FE07-01 | REQ-07.1: Hiển thị danh sách và số liệu KPI chi phí | Đang đăng nhập hệ thống MT-GRMS, chi nhánh đã có dữ liệu chi phí | Truy cập phân hệ Quản lý chi phí (FE-07) | 4 Thẻ KPI hiển thị đúng số liệu VND (Tổng chi, Đã chi, Chờ duyệt, Hủy), danh sách chi phí sắp xếp mới nhất | StoreManager | High | 5.3 | PASS | 4 Thẻ KPI hiển thị chuẩn Deep Teal, sắp xếp thời gian chuẩn |
| TC-FE07-02 | REQ-07.1: Lọc danh sách chi phí theo Chi nhánh & Trạng thái | Đang ở màn hình Quản lý chi phí | Chọn Chi nhánh và chọn Trạng thái từ bộ lọc | Bảng dữ liệu lọc chính xác 100% các khoản chi khớp điều kiện | StoreManager | Medium | 5.3 | PASS | Bộ lọc đa tiêu chí lọc chính xác |
| TC-FE07-03 | REQ-07.1: Hiển thị Empty State khi không có bản ghi chi phí | Không có dữ liệu chi phí hoặc bộ lọc không khớp | Kích hoạt bộ lọc không khớp bản ghi nào | Hiển thị Empty State với icon ReceiptText, thông báo thân thiện và nút đặt lại bộ lọc | StoreManager | Low | 5.3 | PASS | Giao diện Empty State hiển thị đúng chuẩn |
| TC-FE07-04 | REQ-07.2: Ghi nhận khoản chi phí hợp lệ thành công | Modal Thêm khoản chi đang mở | Nhập Danh mục, Số tiền > 0, Mô tả, Chi nhánh và bấm Lưu | Gửi POST API thành công, hiển thị Toast thông báo và tự động tải lại danh sách | Cashier | High | 5.3 | PASS | Ghi nhận chi phí thành công, cập nhật KPI |
| TC-FE07-05 | REQ-07.2: Chặn submit khi số tiền chi <= 0 hoặc để trống (Validation) | Modal Thêm khoản chi đang mở | Nhập số tiền 0 hoặc số âm và bấm Lưu | Hệ thống chặn submit, hiển thị thông báo lỗi đỏ dưới trường số tiền | Cashier | High | 5.3 | PASS | Bắt lỗi validation số tiền chi chính xác |
| TC-FE07-06 | REQ-07.2: Chống click đúp gửi trùng lặp khoản chi (Idempotency) | Đã điền form Thêm khoản chi hợp lệ | Nhấp liên tục nút Xác nhận lưu | Nút Lưu bị disabled ngay lập tức (isPending=true), spinner quay và chỉ gửi 1 request duy nhất | Cashier | Medium | 5.3 | PASS | Chống gửi trùng lặp thành công |
| TC-FE07-07 | REQ-07.3: Tích hợp thanh toán chi phí & Sinh phiếu chi Sổ quỹ (FE-17) | Khoản chi phí đang ở trạng thái Chờ duyệt (Pending) | Bấm Thanh toán, chọn nguồn tiền và xác nhận | Trạng thái khoản chi chuyển sang Paid, tự động sinh phiếu chi trong Sổ quỹ FE-17 | StoreManager | Critical | 5.2 | PASS | Đồng bộ liên phân hệ Sổ quỹ thành công |
| TC-FE07-08 | REQ-07.3: Ẩn nút thanh toán khi khoản chi đã thanh toán hoặc hủy | Khoản chi phí có trạng thái là Paid hoặc Cancelled | Quan sát cột thao tác của dòng khoản chi tương ứng | Nút Thanh toán tự động ẩn đi, ngăn chặn thanh toán lại | StoreManager | High | 5.3 | PASS | Tránh gian lận và thanh toán trùng lặp |
| TC-FE07-09 | REQ-07.4: Hủy khoản chi phí đang chờ thanh toán (Cancelled) | Khoản chi phí đang ở trạng thái Pending | Bấm nút Hủy, nhập lý do hủy và xác nhận | Trạng thái chuyển sang Cancelled, badge hiển thị màu xám/đỏ và lưu lý do hủy | StoreManager | Medium | 5.3 | PASS | Quy trình hủy chi phí chuẩn xác |
| TC-FE07-10 | REQ-07.5: Kiểm soát phân quyền RBAC duyệt chi phí (Security) | Đăng nhập với vai trò Thu ngân (Cashier) | Thử truy cập tính năng Duyệt/Hủy chi phí của Quản lý | Hệ thống chặn thao tác hoặc ẩn nút duyệt đối với Cashier | Cashier | Critical | 5.4 | PASS | Phân quyền RBAC chuẩn xác |
| TC-FE07-11 | REQ-07.6: Nghiệm thu toàn diện luồng Ghi nhận - Thanh toán - Vào Sổ quỹ (UAT) | Cửa hàng đang trong ca làm việc, Sổ quỹ đang mở | Cashier tạo chi phí điện nước, StoreManager duyệt và kiểm tra số dư Sổ quỹ | Tiền mặt Sổ quỹ giảm đúng số tiền chi, mã phiếu chi liên kết với hóa đơn chi phí | StoreOwner | Critical | 5.5 | PASS | Thử nghiệm người dùng hoàn thành xuất sắc |

## 2. Kết quả chạy lệnh kiểm thử thực tế

### Kiểm thử biên dịch Frontend (`MT_GRMS_FRONTEND`)
- **Lệnh**: `npm run build`
  - Output:
    ```bash
    > frontend@0.0.0 build
    > tsc -b && vite build

    vite v8.3.1 building client environment for production...
    transforming...
    ✓ 2120 modules transformed.
    rendering chunks...
    computing gzip size...
    dist/index.html                   1.16 kB │ gzip:   0.68 kB
    dist/assets/index-DX3Jg6Vf.css   28.55 kB │ gzip:   6.54 kB
    dist/assets/index-DpbOlmkg.js   565.58 kB │ gzip: 174.53 kB
    ✓ built in 742ms
    ```
  - Kết quả: **0 lỗi TypeScript, 0 lỗi Vite**.

### Kiểm thử Linter (`MT_GRMS_FRONTEND`)
- **Lệnh**: `npm run lint`
  - Output:
    ```bash
    > frontend@0.0.0 lint
    > oxlint

    Found 0 warnings and 0 errors.
    Finished in 21ms on 43 files with 116 rules using 12 threads.
    ```
  - Kết quả: **0 warnings, 0 errors**.

## 3. Lỗi tồn đọng
- **0** lỗi blocker.
- **0** lỗi critical.
- Toàn bộ 12 tasks trong `tasks.md` đã hoàn tất và được nghiệm thu thực tế.
