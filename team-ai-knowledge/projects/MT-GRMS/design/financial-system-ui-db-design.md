---
id: DES-MT-GRMS-004
title: "MT-GRMS — Thiết Kế Kiến Trúc Database & Giao Diện UI/UX Cho Các Phân Hệ Tài Chính, Vận Hành & Thuế (FE-07, FE-08, FE-10, FE-17, FE-19)"
date: "2026-10-14"
author: "SEP490-G84 (CFO & Retail Product Architect Perspective)"
project: "MT-GRMS"
tags: [design, database, ui-ux, finance, cashbook, tax, crm, pnl, cogs]
---

# 🏗️ THIẾT KẾ KIẾN TRÚC DATABASE & GIAO DIỆN UI/UX
## CÁC PHÂN HỆ TÀI CHÍNH, VẬN HÀNH & THUẾ (FE-07, FE-08, FE-10, FE-17, FE-19)
### *(Gióng Chuẩn 100% với Báo Cáo Ma Trận Móc Nối Tính Năng CTX-MT-GRMS-004)*

---

## PHẦN 1: THIẾT KẾ & CẬP NHẬT DATABASE SCHEMA

Để giải quyết triệt để 8 điểm gãy luồng (GAP-01 đến GAP-08) và đảm bảo nguyên tắc **Một nguồn chân lý (Single Source of Truth)**, cơ sở dữ liệu được nâng cấp bổ sung các bảng, cột và quan hệ như sau:

### 1.1 Bảng Mới: `CustomerDebtLedgers` (Sổ nhật ký biến động công nợ khách hàng)
*Giải quyết GAP-02 & GAP-08: Lưu vết toàn bộ lịch sử mua nợ và các lần thanh toán nợ của khách hàng.*

*Kế thừa `BaseTenantEntity`.*
| Tên Cột | Kiểu Dữ Liệu | Nullable | Ràng Buộc / Mặc Định | Ý Nghĩa Nghiệp Vụ |
|---|---|:---:|:---:|---|
| `Id` | `Guid` | ❌ | PK | Khóa chính duy nhất. |
| `TenantId` | `varchar(50)` | ❌ | Index | Khóa định danh người thuê (Multi-Tenancy). |
| `CustomerId` | `Guid` | ❌ | FK -> Customers | Khách hàng phát sinh biến động nợ. |
| `TransactionType` | `varchar(20)` | ❌ | | Loại biến động: `'DEBT_INCREASE'` (Mua nợ / +), `'DEBT_DECREASE'` (Trả nợ / -), `'DEBT_BAD_WRITEOFF'` (Xóa nợ xấu). |
| `Amount` | `decimal(18,2)` | ❌ | `Amount > 0` | Số tiền biến động. |
| `DebtBalanceAfter` | `decimal(18,2)`| ❌ | | Số dư nợ lũy kế của khách ngay sau giao dịch. |
| `OrderId` | `Guid` | ✔️ | FK -> Orders | Đơn hàng POS gốc phát sinh nợ (nếu là mua nợ). |
| `CashTransactionId`| `Guid` | ✔️ | FK -> LedgerTransactions | Phiếu thu tiền nợ tương ứng trong Sổ quỹ FE-17 (nếu là trả nợ). |
| `PaymentMethod` | `varchar(20)` | ✔️ | | Phương thức trả nợ: `'Cash'` (Tiền mặt), `'VietQR'` (Ngân hàng). |
| `Note` | `nvarchar(500)` | ✔️ | | Ghi chú lý do nợ hoặc nội dung chuyển khoản. |
| `RecordedBy` | `Guid` | ❌ | FK -> Employees | Thu ngân / Quản lý thực hiện ghi nhận. |

---

### 1.2 Bổ Sung Cột Bảng `ServiceExpenses` (FE-07)
*Giải quyết GAP-01 & GAP-07: Liên thông Sổ quỹ khi thanh toán và cấu hình chi phí định kỳ.*

| Tên Cột | Kiểu Dữ Liệu | Nullable | Ràng Buộc / Mặc Định | Ý Nghĩa Nghiệp Vụ |
|---|---|:---:|:---:|---|
| `PaidFromAccountId` | `Guid` | ✔️ | FK -> CashAccounts | Tài khoản quỹ xuất tiền thanh toán (Két Q1, Két Q7, TK Ngân hàng). |
| `IsRecurring` | `bit` | ❌ | Def: 0 | Đánh dấu khoản chi định kỳ lặp lại hàng tháng (Mặt bằng, Internet). |
| `RecurringDayOfMonth`| `int` | ✔️ | 1 - 31 | Ngày trong tháng hệ thống tự động sinh hóa đơn chi phí chờ duyệt. |

---

### 1.3 Bổ Sung Cột & Mở Rộng Bảng `LedgerTransactions` (FE-17)
*Giải quyết GAP-03, GAP-05 & GAP-06: Nguồn gốc chứng từ, nộp thuế ngân sách và chuyển tiền nội bộ.*

| Tên Cột | Kiểu Dữ Liệu | Nullable | Ràng Buộc / Mặc Định | Ý Nghĩa Nghiệp Vụ |
|---|---|:---:|:---:|---|
| `ReferenceDocType` | `varchar(50)` | ✔️ | Mở rộng Enum | Bổ sung: `'TAX_PAYMENT'` (Nộp thuế TT40 từ FE-19), `'INTERNAL_TRANSFER'` (Chuyển tiền nội bộ). |
| `SourceModuleName` | `varchar(30)` | ❌ | Def: 'MANUAL' | Nhãn nguồn hệ thống: `'POS'`, `'CRM_DEBT'`, `'SERVICE_OPEX'`, `'TAX_SNAPSHOT'`, `'SUPPLIER_PO'`, `'PAYROLL'`, `'MANUAL'`. |
| `LinkedTransactionId`| `Guid` | ✔️ | FK -> LedgerTransactions | Khóa liên kết đối ứng khi chuyển tiền nội bộ giữa 2 quỹ (1 Chi - 1 Thu). |

---

### 1.4 Bổ Sung Cột Bảng `TaxSnapshots` (FE-19)
*Giải quyết GAP-03: Liên thông Phiếu chi nộp ngân sách nhà nước.*

| Tên Cột | Kiểu Dữ Liệu | Nullable | Ràng Buộc / Mặc Định | Ý Nghĩa Nghiệp Vụ |
|---|---|:---:|:---:|---|
| `CashTransactionId` | `Guid` | ✔️ | FK -> LedgerTransactions | Phiếu chi tương ứng trong Sổ quỹ FE-17 khi nộp thuế thành công. |
| `SubmittedAt` | `datetime2` | ✔️ | | Thời điểm nộp hồ sơ tờ khai lên cổng Thuế. |
| `PaidAt` | `datetime2` | ✔️ | | Thời điểm hoàn tất nộp tiền thuế vào Kho bạc Nhà nước. |
| `IsLocked` | `bit` | ❌ | Def: 0 | Đóng băng dữ liệu hóa đơn thuộc Quý sau khi chốt số liệu. |

---

### 1.5 Bổ Sung Cột Bảng `DailySalesSummaries` (FE-10 P&L)
*Giải quyết GAP-04: Đưa nghĩa vụ thuế HKD vào báo cáo P&L để tính lãi ròng thực tế.*

| Tên Cột | Kiểu Dữ Liệu | Nullable | Ràng Buộc / Mặc Định | Ý Nghĩa Nghiệp Vụ |
|---|---|:---:|:---:|---|
| `TaxEstimatedAmount` | `decimal(18,2)`| ❌ | Def: 0 | Nghĩa vụ thuế HKD ước tính trong ngày (`NetRevenue * 1.5%`). |
| `NetProfitAfterTax` | `decimal(18,2)`| ❌ | Def: 0 | **Lợi nhuận ròng sau thuế thực tế của chủ tiệm** (`NetProfit - TaxEstimatedAmount`). |

---

## PHẦN 2: THIẾT KẾ NÂNG CẤP GIAO DIỆN UI/UX 5 PHÂN HỆ

### 2.1 FE-07: Mua Sắm Dịch Vụ & Chi Phí Vận Hành (Service Expenses)

#### 1. Modal Thanh Toán Chi Phí (`PayExpenseModal`):
* **Bổ sung Dropdown:** "Tài khoản nguồn xuất tiền" (Query danh sách từ `CashAccounts` hoạt động: *Két tiền mặt Q1: 12.500.000 đ*, *Két tiền mặt Q7: 8.200.000 đ*, *MB Bank: 45.000.000 đ*).
* **Callout Tự động hóa:** *"Hệ thống sẽ tự động tạo Phiếu Chi giảm số dư tài khoản tương ứng trong Sổ quỹ FE-17."*
* **Trigger Action:** Bấm "Xác nhận thanh toán" -> Cập nhật trạng thái chi phí sang `Paid` + Gửi command tạo `LedgerTransaction (PAYMENT, EXPENSE_BILL)` vào Sổ quỹ.

#### 2. Modal Tạo Mới Chi Phí (`CreateExpenseModal`):
* **Bổ sung Tùy chọn Chi phí định kỳ:** Checkbox `[x] Khoản chi định kỳ lặp lại hàng tháng`. Khi tích chọn, hiển thị trường chọn "Ngày đến hạn trong tháng (1 - 31)" (ví dụ: ngày 01 trả tiền thuê nhà).

---

### 2.2 FE-08: Quản Lý Khách Hàng, Thành Viên & Công Nợ AR (Customer CRM)

#### 1. Modal Thu Nợ Khách Hàng (`CollectDebtModal`):
* **Bổ sung Tùy chọn Hình thức thu tiền:**
  - 💵 **Tiền mặt tại quầy:** Chọn Két tiền mặt chi nhánh thu nhận (mặc định két thu ngân đang mở).
  - 💳 **Chuyển khoản VietQR:** Hiển thị mã QR động theo đúng số tiền nợ khách muốn trả. Khi khách quét xong, tiền vào tài khoản ngân hàng.
* **Trigger Action:** Xác nhận thu nợ -> Giảm `CurrentDebtAR` của khách + Tạo bản ghi `CustomerDebtLedgers` + Tự động sinh `LedgerTransaction (RECEIPT, DEBT_PAYMENT)` trong Sổ quỹ FE-17.

#### 2. Drawer Xem Lịch Sử Công Nợ Chi Tiết (`CustomerDebtLedgerDrawer`):
* Mở ra khi click vào khách hàng:
  - Header: Tên khách hàng, Hạn mức nợ, Dư nợ hiện tại (màu đỏ nếu chạm trần).
  - Bảng dòng thời gian (Timeline Table):
    * Cột 1: Thời gian & Mã chứng từ (`HD-20261012-001` hoặc `PT-DEBT-002`).
    * Cột 2: Loại biến động (`+ Mua nợ` màu đỏ, `- Trả nợ` màu xanh lá).
    * Cột 3: Số tiền.
    * Cột 4: Dư nợ còn lại sau giao dịch.
    * Cột 5: Phương thức & Người thu.

---

### 2.3 FE-10: Dashboard KPIs & Báo Cáo Lãi / Lỗ (P&L & COGS FEFO)

#### 1. Cấu Trúc Bảng P&L Chi Tiết Chuẩn Hóa:
Nâng cấp bảng P&L với đầy đủ 2 tầng lợi nhuận:
```
1. DOANH THU BÁN LẺ
   ├── Doanh thu gộp (Gross Revenue)
   └── Trừ: Chiết khấu, Khuyến mãi & Giảm giá (Discounts & Vouchers)
   ══════════════════════════════════════════════════════════════
   (=) DOANH THU THUẦN (Net Revenue)

2. GIÁ VỐN HÀNG BÁN (COGS)
   └── Trừ: Giá vốn hàng hóa xuất kho theo FEFO
   ══════════════════════════════════════════════════════════════
   (=) LỢI NHUẬN GỘP (Gross Profit) — [Biên lãi gộp: %]

3. CHI PHÍ VẬN HÀNH & TỔN THẤT
   ├── Trừ: Chi phí dịch vụ ngoài & vận hành (FE-07 OpEx: Điện, Nước, Thuê nhà)
   ├── Trừ: Chi phí nhân công & quỹ lương (FE-18 Payroll)
   └── Trừ: Tổn thất hao hụt hàng hóa xuất hủy (FE-06 Waste Loss)
   ══════════════════════════════════════════════════════════════
   (=) LỢI NHUẬN VẬN HÀNH TRƯỚC THUẾ (EBT / Operating Profit)

4. NGHĨA VỤ THUẾ HỘ KINH DOANH (THÔNG TƯ 40/2021/TT-BTC)  <-- [BỔ SUNG MỚI]
   └── Trừ: Thuế GTGT 1% + Thuế TNCN 0.5% (1.5% trên Doanh thu) [Link sang FE-19]
   ══════════════════════════════════════════════════════════════
   (=) LỢI NHUẬN RÒNG THỰC NHẬN CỦA CHỦ TIỆM (Net Profit After Tax)
```

#### 2. Thẻ Đối Soát Thuế & Tài Chính (Tax-Financial Reconciliation Widget):
* Nằm ở chân trang P&L:
  - So sánh đối soát giữa **Doanh thu P&L** và **Doanh thu kê khai thuế FE-19**.
  - Nút bấm nhanh: *"Xem Tờ khai thuế Quý tại FE-19"* với badge trạng thái đồng bộ.

---

### 2.4 FE-17: Sổ Quỹ & Quản Lý Dòng Tiền (Cashbook Ledger & Cashflow)

#### 1. Bổ sung Cột "Nguồn Giao Dịch" (Source Badge):
Bảng nhật ký giao dịch hiển thị nhãn màu nhận diện nguồn phát sinh tự động:
* 🛒 **`BÁN LẺ POS`** (Nền xanh lá cây nhạt) — Tự sinh khi hoàn tất đơn hàng POS. Nút hành động bị vô hiệu hóa (Disabled) kèm tooltip: *"Phiếu tự động từ POS, không thể sửa tay"*.
* 👥 **`THU NỢ KHÁCH`** (Nền xanh ngọc) — Tự sinh từ FE-08 khi khách trả nợ.
* ⚡ **`CHI PHÍ VẬN HÀNH`** (Nền cam) — Tự sinh từ FE-07 khi thanh toán tiền điện/nước/mặt bằng.
* 📑 **`NỘP THUẾ NSNN`** (Nền tím) — Tự sinh từ FE-19 khi xác nhận nộp thuế.
* ✏️ **`THỦ CÔNG`** (Nền xám) — Phiếu thu/chi do chủ tiệm tạo tay (cho phép sửa/hủy).

#### 2. Nút Hành Động & Modal "Chuyển Tiền Nội Bộ" (Internal Fund Transfer):
* Nút `⇄ Chuyển quỹ nội bộ` nằm tại thanh công cụ đầu trang:
  - Form chuyển quỹ:
    * *Từ tài khoản:* Dropdown chọn tài khoản nguồn (VD: Két tiền mặt Q1 - Số dư: 12.500.000 đ).
    * *Đến tài khoản:* Dropdown chọn tài khoản đích (VD: Tài khoản MB Bank chính - Số dư: 45.000.000 đ).
    * *Số tiền chuyển:* Input tiền tệ.
    * *Ghi chú:* "Nộp tiền mặt doanh thu bán lẻ cuối tuần vào ngân hàng".
  - Khi xác nhận: Hệ thống sinh đồng thời 2 bút toán liên kết (`LinkedTransactionId`):
    1. Phiếu Chi (`PAYMENT, INTERNAL_TRANSFER`) tại Két Q1.
    2. Phiếu Thu (`RECEIPT, INTERNAL_TRANSFER`) tại Tài khoản MB Bank.

---

### 2.5 FE-19: Kế Toán & Kê Khai Thuế Hộ Kinh Doanh (Tax Snapshot)

#### 1. Modal Xác Nhận Nộp Thuế Vào Kho Bạc (`ConfirmTaxPaymentModal`):
* Khi chủ tiệm bấm **"Xác nhận Đã nộp thuế"** (chuyển trạng thái từ `Submitted` sang `Paid`):
  - Hiển thị Popup xác nhận:
    * Số tiền thuế phải nộp: **7.680.000 đ** (gồm 1% VAT: 5.120.000 đ + 0.5% TNCN: 2.560.000 đ).
    * Chọn tài khoản xuất tiền nộp: Dropdown chọn Tài khoản ngân hàng nộp thuế (VD: MB Bank).
    * Mã giao dịch nộp ngân sách / Số biên lai thuế: Input text.
  - Khi bấm Xác nhận: Tờ khai chuyển trạng thái `Paid` + Tự động sinh Phiếu Chi `TAX_PAYMENT` trong Sổ quỹ FE-17.

#### 2. Cơ Chế Đóng Băng Dữ Liệu Kỳ Thuế (Data Freeze Callout):
* Sau khi kỳ thuế đạt trạng thái `Finalized` hoặc `Paid`:
  - Hiển thị huy hiệu ổ khóa xanh: *"Kỳ tính thuế đã chốt số liệu kiểm toán. Hóa đơn bán lẻ thuộc kỳ này đã được đóng băng để đảm bảo tính hợp lệ của hồ sơ thuế."*

---

## PHẦN 3: KẾ HOẠCH HÀNH ĐỘNG TRIỂN KHAI (IMPLEMENTATION MATRIX)

| Giai Đoạn | Phân Hệ | Công Việc Kỹ Thuật Trọng Tâm | Kết Quả Nghiệm Thu (DoD) |
|---|---|---|---|
| **Phase 1** | **FE-07 & FE-17** | Thêm chọn tài khoản khi bấm Thanh toán chi phí; Auto-sync Phiếu Chi sang Sổ quỹ | Tiền trong két/ngân hàng giảm đúng số tiền hóa đơn chi phí |
| **Phase 2** | **FE-08 & FE-17** | Thêm chọn hình thức thu nợ (Tiền mặt/VietQR); Auto-sync Phiếu Thu sang Sổ quỹ; Tạo Drawer lịch sử nợ | Thu nợ khách xong tiền tự động cộng vào Sổ quỹ, có lịch sử chi tiết |
| **Phase 3** | **FE-19 & FE-17** | Modal xác nhận tài khoản nộp thuế; Auto-sync Phiếu Chi nộp ngân sách sang Sổ quỹ | Nộp thuế xong Sổ quỹ có ngay chứng từ chi nộp Kho bạc |
| **Phase 4** | **FE-10 & FE-19** | Bổ sung dòng Thuế HKD 1.5% vào bảng P&L; Thêm widget đối soát doanh thu | Bảng P&L phản ánh chuẩn Lợi nhuận ròng sau thuế thực nhận |
| **Phase 5** | **FE-17** | Thêm Source Badge và Modal Chuyển quỹ nội bộ (Két <-> Ngân hàng) | Nhân viên không sửa được phiếu tự động; chuyển tiền giữa các két mượt mà |
