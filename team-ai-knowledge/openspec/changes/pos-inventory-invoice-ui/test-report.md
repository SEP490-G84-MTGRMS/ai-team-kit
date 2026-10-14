---
verdict: PASS
date: 2026-10-14
tester: "@sonnguyenn10"
---

# Báo cáo Kiểm thử Nghiệm thu (Test Report) — pos-inventory-invoice-ui

## 1. Kết quả Kiểm thử theo Yêu cầu Đặc tả (specs.md)

| Mã Yêu Cầu | Tên Chức Năng | Kịch Bản Kiểm Thử | Kết Quả |
|---|---|---|:---:|
| `REQ-FE-INV-01` | Tra cứu tồn kho thời gian thực | Gõ tìm kiếm "Sữa chua Ba Vì", SKU "SP652399", barcode "8934567890123" hoặc chọn dropdown ngành hàng; hệ thống hiển thị bảng tồn kho chi nhánh trung tâm, Hà Đông, Cầu Giấy và Mê Linh | **PASS** |
| `REQ-FE-INV-02` | Quản lý Lô FEFO & Xả hàng | Bảng lô sắp xếp tự động theo thứ tự ưu tiên hạn sử dụng gần nhất `[ #1 ]`, cảnh báo màu theo 4 cấp (Khẩn cấp, Cận date cao, Ưu tiên xả, An toàn); nút "Chọn Lô Bán POS" và nút "Xả hàng -20%" hoạt động chính xác | **PASS** |
| `REQ-FE-INV-03` | Điều chuyển kho nội bộ | Bấm nút "Yêu cầu chuyển kho", mở modal nhập số lượng, nguồn điều chuyển và gửi thành công với toast thông báo | **PASS** |
| `REQ-FE-ORD-01` | Lịch sử Hóa đơn bán lẻ | Danh sách hóa đơn hiển thị đầy đủ, lọc theo Preset (Hôm nay, hôm qua, tuần này, tháng này), phương thức thanh toán VietQR / Tiền mặt, 100% thanh toán quầy; phân trang mượt mà bằng `TablePagination` | **PASS** |
| `REQ-FE-ORD-02` | Chi tiết hóa đơn & In bill K80 | Bấm vào dòng hóa đơn mở rộng Accordion hiển thị chi tiết dòng hàng, ĐVT, đơn giá, chiết khấu; bấm "In bill" mở modal xem trước hóa đơn in nhiệt K80 đúng khổ 80mm | **PASS** |
| `REQ-FE-ORD-03` | Đơn đặt trước & Giữ kho | Chuyển sang Tab "Đơn Đặt Trước & Giữ Kho (Pre-order)", hiển thị thông tin tiền cọc, số tiền còn lại phải thu, trạng thái giữ kho; **không có phí vận chuyển hay giao hàng** theo đúng nghiệp vụ siêu thị bán lẻ | **PASS** |
| `REQ-FE-NAV-01` | Tích hợp Menu Hamburger POS | Menu `[ ≡ Thao tác ]` trên Header bán hàng tích hợp 2 mục điều hướng trực tiếp tới `/employee/inventory-lookup` và `/employee/orders` cùng alias `/pos/...` | **PASS** |

## 2. Kiểm thử Tích hợp & Build TypeScript
- **Lệnh thực thi**: `npm run build` (`tsc -b && vite build`)
- **Kết quả build**:
  - `transforming... ✓ 2259 modules transformed`
  - `dist/index.html 1.16 kB`
  - `dist/assets/index-C2HeE7a-.css 185.20 kB`
  - `dist/assets/index-FKuE1-op.js 1,305.14 kB`
  - **Mã thoát (Exit code)**: `0` (Hoàn toàn không có lỗi TypeScript hay Lint)

## 3. Lỗi Tồn đọng (Defects)
- Không có lỗi tồn đọng (0 defects).
- Đã tuân thủ nghiêm ngặt quy tắc không commit hay push git vào repository `MT_GRMS_FRONTEND`.
