---
id: LL-2026-11-05-723
title: HTML5 min-max validation modal thu nợ và tìm kiếm khách hàng đa tiêu chí POS
date: '2026-11-05'
author: sonnguyenn10
scope: POS và Quản lý hóa đơn công nợ
severity: medium
resolution: >-
  Đã sửa triệt để ở CollectDebtModal, InvoiceManagementPage, PosPaymentPanel,
  PosReceiptModal và ThermalPrintService.cs, toàn bộ test pass 100%.
tags:
  - lesson
  - agent-generated
---

# LL-2026-11-05-723: HTML5 min-max validation modal thu nợ và tìm kiếm khách hàng đa tiêu chí POS

## Problem
1. Lỗi HTML5 min-max validation ở thẻ input modal thu nợ khi hóa đơn có remainingDebt = 0.
2. Thu ngân POS gõ tên khách hàng vừa thêm vào CSDL không tìm thấy do ô tìm kiếm chặn nhập chữ cái.
3. Hóa đơn bán lẻ in ra còn các dòng khuyến cáo thừa, mã lô kho FEFO và hotline chi nhánh chưa đồng bộ.

## Solution
1. Cấu hình min/max an toàn cho thẻ input số tiền khi nợ = 0: min={remainingDebt > 0 ? Math.min(1000, remainingDebt) : undefined}, max={remainingDebt > 0 ? remainingDebt : undefined}, disabled={remainingDebt <= 0}, đồng thời ẩn nút 'Thu nợ' trên danh sách khi hóa đơn đã hết nợ.
2. Mở rộng tìm kiếm khách hàng ở POS cho phép gõ tự do cả Tên (tiếng Việt không dấu/có dấu qua normalize NFD), Số điện thoại và Mã KH.
3. Loại bỏ mã lô (LÔ-FEFO) và các dòng khuyến cáo thừa ở chân bill, chuẩn hóa hiển thị Hotline của chi nhánh cửa hàng.
