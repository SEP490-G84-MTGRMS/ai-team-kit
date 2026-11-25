---
id: LL-2026-11-25-809
title: >-
  Cấm fallback VietQR/STK cứng ở client và bẫy kiểm tra boolean false trên API
  Toggle Status
date: '2026-11-25'
author: Ortus24
scope: frontend
severity: critical
resolution: resolved
tags:
  - lesson
  - agent-generated
---

# LL-2026-11-25-809: Cấm fallback VietQR/STK cứng ở client và bẫy kiểm tra boolean false trên API Toggle Status

## Problem
1) Khi API tạo đơn nạp tiền VietQR thất bại, khối catch trên Frontend tự sinh mã đơn ngẫu nhiên và tạo ảnh QR thật trỏ về STK cứng (gây rủi ro mất tiền không đối soát được). 2) API PATCH toggle status trả ApiResponse<bool>.Ok(newStatus) nhưng Frontend kiểm tra `res.data !== true` khiến việc tắt trạng thái (`newStatus = false`) bị hiểu nhầm là lỗi.

## Solution
1) Tuyệt đối không bao giờ sinh mã QR thanh toán hoặc STK thụ hưởng fallback ở client khi API lỗi; phải đặt state đơn nạp về null, khóa nút xác nhận và hiển thị nút Thử lại. 2) Với các endpoint toggle trả giá trị boolean mới trong `data`, chỉ kiểm tra `!res.success || typeof res.data !== 'boolean'` và suy ra trạng thái UI trực tiếp từ `res.data`.
