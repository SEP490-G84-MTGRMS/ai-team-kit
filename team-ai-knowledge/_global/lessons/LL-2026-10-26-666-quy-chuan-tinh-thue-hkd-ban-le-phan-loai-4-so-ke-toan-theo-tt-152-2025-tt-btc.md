---
id: LL-2026-10-26-666
title: >-
  Quy chuẩn Tính Thuế HKD Bán Lẻ & Phân Loại 4 Sổ Kế Toán Theo TT
  152/2025/TT-BTC
date: '2026-10-26'
author: Des7240
scope: backend
severity: high
resolution: resolved
tags:
  - lesson
  - agent-generated
---

# LL-2026-10-26-666: Quy chuẩn Tính Thuế HKD Bán Lẻ & Phân Loại 4 Sổ Kế Toán Theo TT 152/2025/TT-BTC

## Problem
Tính toán sai thuế Hộ kinh doanh và lẫn lộn sổ chi phí kế toán do áp dụng văn bản cũ (TT 40/2021) hoặc phân bổ nhầm chi phí Vốn chủ sở hữu (Equity) vào chi phí thuế.

## Solution
Áp dụng đúng Luật Quản lý thuế số 108/2025/QH15 và NĐ 141/2026/NĐ-CP với ngưỡng miễn thuế 1 tỷ VNĐ/năm; phân nhóm HKD tự động (Nhóm 1 miễn thuế; Nhóm 2 tính 1% GTGT + 0.5% TNCN); áp dụng 4 sổ kế toán TT 152/2025/TT-BTC (S2b, S2c, S2d, S2e - không dùng S3a cho tạp hóa) và lọc loại trừ 100% chi phí Vốn chủ sở hữu (CAPITAL, EQUITY) khỏi các sổ chi phí thuế.
