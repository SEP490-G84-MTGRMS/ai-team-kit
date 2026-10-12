---
id: CTX-MT-GRMS-001
title: "MT-GRMS — Tổng quan dự án & Lộ trình tính năng (Project Overview & Roadmap)"
date: "2026-10-12"
author: "SEP490-G84"
project: "MT-GRMS"
tags: [context, overview, srs, scope, roadmap]
---

# 🛒 MT-GRMS — Multi-Tenant Grocery Retail Management System

**Tên tiếng Anh:** Multi-Tenant Grocery Retail Management System  
**Tên tiếng Việt:** Hệ Thống Cung Cấp Dịch Vụ Quản Lý Tạp Hóa Bán Lẻ  
**Mã dự án:** MT-GRMS (Mã code backend: SGMS)  
**Nhóm thực hiện:** SEP490-G84 (FPT University, Fall 2026)  
**Loại ứng dụng:** Web Application (Responsive Web POS & Management Portal)  

---

## 1. Bối cảnh Sản phẩm & 5 Bài toán Cốt lõi (Problem Statements)

Trong bối cảnh thị trường bán lẻ FMCG tại Việt Nam, các cửa hàng tạp hóa gia đình, siêu thị mini và chuỗi bán lẻ nhỏ đang chịu sức ép số hóa mạnh mẽ từ cả quy định pháp lý (thuế hộ kinh doanh TT88/TT40, hóa đơn điện tử) lẫn bài toán quản trị vận hành. Các hệ thống ERP doanh nghiệp lớn (như SAP, Oracle) hoặc phần mềm kế toán cồng kềnh (MISA) quá đắt đỏ và phức tạp; trong khi sổ sách giấy và Excel lại thiếu tự động hóa trầm trọng.

MT-GRMS ra đời nhằm giải quyết triệt để 5 bài toán nhức nhối:

1. **Problem-01: Quá tải vận hành & Ghi chép thủ công (Manual Operations & Sales Bottleneck)**:
   - Chủ cửa hàng phải ghi nhớ giá bán, lật sổ tìm công nợ khách hàng, kiểm soát 800 - 1.000 SKU sản phẩm.
   - Ùn tắc thanh toán giờ cao điểm, tính nhẩm sai sót gây thất thoát tiền bạc.
2. **Problem-02: Thất thoát tồn kho & Hết hạn sử dụng (Inventory Shrinkage & Expiry Losses)**:
   - Thiếu cơ chế cảnh báo hạn sử dụng theo nguyên tắc **FEFO (First Expired, First Out)**, khiến hàng thực phẩm, sữa tươi bị đẩy sâu vào góc kệ và hư hỏng.
   - Thất thoát trung bình 5% - 8% giá trị tồn kho mỗi tháng do hàng quá hạn và sai lệch kiểm kê.
3. **Problem-03: Rối loạn chuỗi cung ứng & Giá vốn đầu vào (Supplier Debt & Cost Inefficiency)**:
   - Không kiểm soát được biến động giá nhập, chi phí vận chuyển phân bổ vào giá vốn (Landed Cost), và công nợ phải trả (Accounts Payable - AP).
4. **Problem-04: Phụ thuộc con người & Rủi ro gian lận (HR Dependency & Internal Shrinkage)**:
   - Thiếu công cụ phân quyền theo vai trò (RBAC), chấm công ca kíp, khiến chủ cửa hàng phải có mặt 24/7.
   - Thiếu cơ chế đối soát ca dẫn đến thất thoát tiền mặt tại quầy thu ngân.
5. **Problem-05: Áp lực pháp lý & Tuân thủ thuế (Tax Compliance & Fiscal Risks)**:
   - Quy định siết chặt về thuế khoán, sổ kế toán hộ kinh doanh và hóa đơn điện tử đòi hỏi dữ liệu xuất bán minh bạch, chuẩn hóa.

---

## 2. Đối sánh Thị trường (Existing Solutions Benchmark)

| Tiêu chí | Sổ sách & Excel | MISA eShop | KiotViet Retail | **MT-GRMS (Đề xuất)** |
|---|---|---|---|---|
| **Chi phí** | Miễn phí | Cao (gói kế toán cồng kềnh) | Thu phí duy trì định kỳ | **Tối ưu chi phí SaaS theo quy mô** |
| **Tốc độ POS** | Rất chậm, tính tay | Trung bình (nhiều bước nghiệp vụ) | Nhanh | **Siêu tốc, phím tắt, quét mã vạch** |
| **Quản lý FEFO** | Không có | Cơ bản, cấu hình phức tạp | Có | **Tự động gợi ý lô cận date ưu tiên** |
| **Thanh toán VietQR** | Quét tĩnh, đối soát tay | Có tích hợp | Có tích hợp | **Dynamic QR + Webhook tự động nhảy tiền** |
| **Độ phức tạp UI** | Dễ dùng nhưng rời rạc | Quá nặng nghiệp vụ kế toán | Đầy đủ nhưng thừa tính năng | **Tinh gọn, tập trung bán lẻ tạp hóa** |

---

## 3. Mục tiêu & Giá trị Giải pháp Đề xuất (Proposed Solution)

MT-GRMS là nền tảng SaaS Multi-Tenant tinh gọn được thiết kế chuyên biệt cho các cửa hàng tạp hóa và chuỗi bán lẻ nhỏ:
- **Kiến trúc Multi-Tenant phân lập dữ liệu tuyệt đối**: Mỗi chủ chuỗi là 1 Tenant độc lập, hỗ trợ mở rộng nhiều chi nhánh (Branches).
- **Xuất bán FEFO tự động**: Ngăn chặn thất thoát hàng cận date bằng thuật toán tự động gợi ý lô có hạn sử dụng gần nhất.
- **Thanh toán Dynamic VietQR & Đối soát tức thì**: Tích hợp ngân hàng qua Webhook, tiền vào tài khoản là hóa đơn tự động hoàn tất, không cần nhân viên chụp màn hình.
- **Kiểm soát ca kíp & Bàn giao tiền mặt**: Tự động chốt chênh lệch tiền mặt đầu ca/cuối ca, chống gian lận tại quầy POS.
- **Báo cáo chuẩn hóa**: Báo cáo P&L, doanh thu, giá vốn COGS và xuất file báo cáo thuế hộ kinh doanh chuẩn quy định.

---

## 4. Danh mục 23 Tính năng Cốt lõi & Lộ trình Thực hiện (Features & Roadmap)

Phạm vi 23 tính năng (FE-01 đến FE-23) được phân bổ theo 5 nhóm phân hệ và 3 coding iterations (tổng dung lượng 2,400 man-hours):

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           23 CORE FEATURES OF MT-GRMS                           │
├───────────────────────────────┬─────────────────────────────────────────────────┤
│ Phân hệ                       │ Mã tính năng & Tên chức năng                   │
├───────────────────────────────┼─────────────────────────────────────────────────┤
│ 1. Hàng hóa & Kho (Catalog)   │ FE-01: Quản lý Danh mục & Sản phẩm đa đơn vị    │
│                               │ FE-02: Quản lý Lô & Hạn sử dụng (FEFO)          │
│                               │ FE-03: Kiểm soát Giá bán & Lịch sử đổi giá      │
│                               │ FE-04: Kiểm kê kho & Cân đối sai lệch           │
├───────────────────────────────┼─────────────────────────────────────────────────┤
│ 2. Chuỗi cung ứng (Supply)    │ FE-05: Đơn mua hàng (PO) & Nhập kho             │
│                               │ FE-06: Xuất nội bộ & Hàng hỏng/Hết hạn          │
│                               │ FE-07: Mua sắm dịch vụ (Chi phí mặt bằng/điện)  │
├───────────────────────────────┼─────────────────────────────────────────────────┤
│ 3. Bán hàng & Đối tác (Sales) │ FE-08: Khách hàng & Công nợ AR                  │
│                               │ FE-09: Nhà cung cấp & Công nợ AP                │
│                               │ FE-10: Dashboard KPIs & Báo cáo P&L             │
│                               │ FE-11: Cấu hình cửa hàng & Phân quyền RBAC      │
│                               │ FE-12: Thu ngân POS & Bàn giao ca               │
│                               │ FE-13: Thanh toán VietQR & Tiền mặt             │
│                               │ FE-14: Đặt trước (Pre-order) & Giữ hàng         │
│                               │ FE-15: Chuyển kho liên chi nhánh                │
│                               │ FE-16: Khuyến mãi, Voucher & Tích điểm          │
├───────────────────────────────┼─────────────────────────────────────────────────┤
│ 4. Tài chính & Nhân sự (Ops)  │ FE-17: Sổ quỹ (Cashbook) & Dòng tiền            │
│                               │ FE-18: Ca làm việc, Chấm công & Bảng lương      │
│                               │ FE-19: Tài chính & Thuế hộ kinh doanh           │
├───────────────────────────────┼─────────────────────────────────────────────────┤
│ 5. Quản trị SaaS (Platform)   │ FE-20: Tài khoản Tenant & Phân lập dữ liệu      │
│                               │ FE-21: Quản lý Gói cước (Subscription SaaS)     │
│                               │ FE-22: Khóa/Mở tài khoản & Quên mật khẩu        │
│                               │ FE-23: Master Dashboard dành cho SaaS Provider  │
└───────────────────────────────┴─────────────────────────────────────────────────┘
```

### Lộ trình 3 Coding Iterations (Project Iteration Roadmap)

| Iteration | Tuần | Mức độ | Nhóm tính năng trọng tâm | Deliverables |
|---|---|---|---|---|
| **Iteration 1** | Tuần 6 - 7 | **P1 (Must-Have)** | **Core POS, Catalog & Identity**: FE-01 (Product), FE-02 (Batches FEFO), FE-03 (Pricing), FE-11 (RBAC), FE-12 (POS Cashier), FE-13 (VietQR Payment), FE-20 (Multi-Tenant Isolation). | Chạy luồng bán hàng POS quét mã, thanh toán QR, trừ kho theo lô hạn date gần nhất. |
| **Iteration 2** | Tuần 8 - 9 | **P1 & P2 (Should)** | **Supply Chain, Inventory & Partners**: FE-04 (Stocktaking), FE-05 (PO & Goods Receipt), FE-06 (Disposal), FE-07 (Service Expenses), FE-08 (Customer CRM), FE-09 (Suppliers), FE-14 (Pre-order), FE-15 (Inter-branch Transfer). | Hoàn thiện chuỗi nhập hàng từ NCC, phân bổ giá vốn, kiểm kê cân đối kho và chuyển hàng giữa các chi nhánh. |
| **Iteration 3** | Tuần 10 - 11 | **P2 & P3 (Could)** | **Advanced Operations, Finance & SaaS Platform**: FE-10 (Reports & P&L), FE-16 (Promotions & Loyalty), FE-17 (Cashbook), FE-18 (HR & Payroll), FE-19 (Tax Report), FE-21 (Subscription SaaS), FE-22 (Account Recovery), FE-23 (Master Dashboard). | Toàn diện hệ thống: Quản lý dòng tiền, bảng lương, báo cáo thuế HKD và cổng quản trị SaaS Provider. |

---

## 5. Giới hạn & Phạm vi Loại trừ (Limitations & Exclusions)

Nhằm đảm bảo sản phẩm tinh gọn và hoàn thành đúng cam kết trong 15 tuần:
- **LI-01: Không xây dựng ứng dụng Mobile Native (iOS/Android)**: Phiên bản v1 tập trung 100% vào Web Application responsive cao cấp (React 19, Vite, tối ưu cảm ứng trên tablet/POS terminal).
- **LI-02: Không hỗ trợ sản xuất phức tạp & BOM nhiều tầng**: Hệ thống chỉ phục vụ bán lẻ tạp hóa FMCG, không hỗ trợ công thức chế biến/sản xuất công nghiệp.
- **LI-03: Không tích hợp robot kho tự động (ASRS)**: Vận hành kho dựa trên máy quét mã vạch cầm tay của con người.
- **LI-04: Không thay thế phần mềm kế toán thuế doanh nghiệp lớn**: Hệ thống cung cấp báo cáo doanh thu, sổ quỹ và xuất dữ liệu thuế hộ kinh doanh; không thay thế hệ thống tài chính chuyên sâu cấp tập đoàn.

---

## 6. Đội ngũ & Ma trận Phân công Trách nhiệm (Stakeholders & RACI Matrix)

**Giảng viên hướng dẫn:** Nguyễn Quỳnh Chi (chinq14@fe.edu.vn)  

| Thành viên | Vai trò | Chuyên môn phụ trách chính (Accountable) |
|---|---|---|
| **Nguyễn Long Nhật** | Leader | Kiến trúc hệ thống, Backend Core, Identity & SaaS Platform (FE-11, 20, 21, 22, 23) |
| **Nguyễn Minh Tâm** | Member | Quản lý Hàng hóa, Lô hạn FEFO, Nhập mua & Kho (FE-01, 02, 04, 05, 06, 15) |
| **Nguyễn Trương An** | Member | POS Checkout, Thanh toán VietQR, Khuyến mãi & Khách hàng (FE-03, 12, 13, 14, 16) |
| **Nguyễn Bá Sơn** | Member | Tài chính, Dòng tiền, Thuế hộ kinh doanh & Nhà cung cấp (FE-07, 08, 09, 10, 17, 19) |
| **Đặng Đỗ Minh Đức** | Member | Quản lý Nhân sự, Ca làm việc, Chấm công & Bảng lương (FE-18) |
