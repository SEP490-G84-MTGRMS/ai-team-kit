---
id: LL-2026-11-09-896
title: >-
  Đồng bộ khuyến mãi bậc thang, quà tặng kho hàng, mã voucher CSDL và duyệt quỹ
  POS đa chi nhánh
date: '2026-11-09'
author: sonnguyenn10
scope: both
severity: medium
resolution: >-
  Đã sửa lỗi và xác nhận 100% bằng 577 Backend tests và Frontend build thành
  công.
tags:
  - lesson
  - agent-generated
---

# LL-2026-11-09-896: Đồng bộ khuyến mãi bậc thang, quà tặng kho hàng, mã voucher CSDL và duyệt quỹ POS đa chi nhánh

## Problem
Khuyến mãi bậc thang bị mất các bậc sau khi thêm và tải lại trang; trang Duyệt Chi Két POS không có dữ liệu do API branchId bắt buộc và chi nhánh bị hardcode; danh sách mã voucher hiển thị 0 mã khi mở rộng đợt.

## Solution
1. Map toàn bộ mảng tiers thành conditions: PromotionConditionDto[] gửi kèm khi tạo/cập nhật khuyến mãi.
2. Tích hợp chọn quà tặng trực tiếp từ kho và chọn đơn vị tính (unit) trong PromotionModal.
3. Hỗ trợ Guid? branchId nullable tại ShiftsController/ShiftService để xem toàn bộ chi nhánh.
4. Tự động fetch getVoucherCodes khi mở rộng accordion đợt voucher.
5. Thêm nút điều hướng về Dashboard cho nhân viên trên quầy POS.
