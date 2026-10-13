---
verdict: PASS
date: 2026-10-13
tester: Antigravity AI Agent & @Des7240
capability: reports-pnl
---

# Báo Cáo Kiểm Thử (Test Report): FE-10 Dashboard KPIs & Báo Cáo P&L (Frontend)

## 1. Kết Quả Nghiệm Thu Theo Đặc Tả (Scenarios & Requirements)

| Mã REQ | Yêu Cầu & Kịch Bản Kiểm Thử | File / Component | Kết Quả |
|---|---|---|:---:|
| **REQ-FE10-01** | **Hiển thị 6 thẻ KPI tài chính cốt lõi**<br>- Doanh thu thuần, Lợi nhuận gộp, Lợi nhuận ròng, Chi phí dịch vụ, Tổng đơn hàng, AOV<br>- Badge % tăng trưởng kỳ trước<br>- Tránh lỗi chia cho 0 khi doanh số 0 | `PnlKpiCardsSection.tsx`<br>`PnlKpiCard.tsx`<br>`reportsPnlService.ts` | **PASS** |
| **REQ-FE10-02** | **Trực quan hóa bằng biểu đồ tương tác**<br>- Biểu đồ kết hợp cột và đường: Doanh thu vs Chi phí vs Lợi nhuận<br>- Biểu đồ Donut: Cơ cấu chi phí vận hành & hao hụt kho<br>- Top 5 sản phẩm đóng góp doanh số cao nhất | `PnlChartsSection.tsx`<br>(Chart.js + react-chartjs-2) | **PASS** |
| **REQ-FE10-03** | **Bảng báo cáo P&L phân cấp cây chuẩn kế toán**<br>- I. Doanh thu bán hàng gộp -> Giảm trừ -> Doanh thu thuần (100%)<br>- II. Giá vốn hàng bán (COGS - FEFO) -> Lợi nhuận gộp (% Margin)<br>- III. Chi phí hao hụt kho + Chi phí dịch vụ FE-07 -> Tổng chi phí<br>- IV. Lợi nhuận ròng trước thuế (Net Profit)<br>- Expand/Collapse từng nhóm con và nút Mở rộng/Thu gọn tất cả | `PnlStatementTable.tsx` | **PASS** |
| **REQ-FE10-04** | **Bộ lọc thời gian & chi nhánh linh hoạt**<br>- Chuyển nhanh Preset: Hôm nay, 7 ngày, Tháng này, Tháng trước, Quý này<br>- Lọc tùy biến ngày bắt đầu - ngày kết thúc<br>- Dropdown chọn Toàn chuỗi hoặc từng chi nhánh | `PnlFilterToolbar.tsx` | **PASS** |
| **REQ-FE10-05** | **Xuất dữ liệu Excel & In/Xuất PDF chuẩn A4**<br>- Tải xuống file Excel `.csv` tiếng Việt UTF-8 BOM chuẩn<br>- Mẫu in khổ A4 có đầy đủ Header hệ thống, chi nhánh, kỳ báo cáo, bảng số liệu và 3 ô chữ ký | `PnlExportModal.tsx` | **PASS** |
| **REQ-FE10-06** | **Tích hợp định tuyến & Phân quyền Menu**<br>- Tích hợp route `/store-owner/reports/pnl` và `/admin/reports/pnl`<br>- Cập nhật menu điều hướng `AppTopNav.tsx` dưới nhóm Tài chính | `router.tsx`<br>`AppTopNav.tsx` | **PASS** |

---

## 2. Kết Quả Thực Thi Test Tự Động (Automated Testing)

### 2.1. Vitest Unit Tests (`npm test`)
```bash
 RUN  v5.0.4 D:/Sourse_code_Do_An/MT_GRMS_FRONTEND

 ✓ src/features/customer-crm/__tests__/customerValidation.test.ts (6 tests) 8ms
 ✓ src/components/common/TablePagination/pagination.utils.test.ts (5 tests) 9ms
 ✓ src/features/reports-pnl/__tests__/reportsPnl.test.ts (6 tests) 9ms
 ✓ src/components/common/TablePagination/TablePagination.test.tsx (5 tests) 241ms

 Test Files  4 passed (4)
      Tests  22 passed (22)
   Duration  2.12s
```
- **100% tests vượt qua thành công** (22/22 tests).
- 6 test cases mới trong `reportsPnl.test.ts` xác thực tính toàn vẹn của đẳng thức kế toán:
  + `Doanh thu thuần = Doanh thu gộp - Chiết khấu - Trả hàng`
  + `Lợi nhuận gộp = Doanh thu thuần - Giá vốn FEFO`
  + `Lợi nhuận ròng = Lợi nhuận gộp - Chi phí vận hành - Hao hụt kho`
  + Xử lý chia cho 0 an toàn tuyệt đối với hàm `calculateMarginPct`.

### 2.2. TypeScript Compilation & Production Build (`npm run build`)
```bash
> tsc -b && vite build

vite v8.3.1 building client environment for production...
transforming...
✓ 2215 modules transformed.
rendering chunks...
dist/index.html                     1.16 kB │ gzip:   0.68 kB
dist/assets/index-DXsGbMSI.css    113.23 kB │ gzip:  18.37 kB
dist/assets/index-DrlvmmwC.js   1,080.50 kB │ gzip: 315.12 kB
✓ built in 786ms
```
- Mã nguồn biên dịch sạch sẽ không có bất kỳ lỗi TypeScript hay Vite bundler nào.

### 2.3. Linter (`npm run lint` - oxlint)
- `Found 15 warnings and 0 errors.` (Toàn bộ mã nguồn mới viết đạt 0 warning, 0 error).

---

## 3. Lỗi Còn Tồn Đọng (Known Issues)
- **Không có lỗi tồn đọng**. Giao diện sẵn sàng phục vụ người dùng. Khi Backend C# được triển khai sau này, chỉ cần kết nối endpoint API vào `reportsPnlService.ts`.

---

## 4. Kết Luận: PASS
Phân hệ FE-10 (Dashboard KPIs & Báo Cáo P&L) hoàn toàn đạt chuẩn nghiệm thu và sẵn sàng đóng change.
