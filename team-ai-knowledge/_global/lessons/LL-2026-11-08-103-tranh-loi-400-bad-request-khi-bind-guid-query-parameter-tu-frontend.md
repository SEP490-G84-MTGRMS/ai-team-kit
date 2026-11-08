---
id: LL-2026-11-08-103
title: Tránh lỗi 400 Bad Request khi bind Guid query parameter từ Frontend
date: '2026-11-08'
author: sonnguyenn10
scope: fullstack
severity: medium
resolution: resolved
tags:
  - lesson
  - agent-generated
---

# LL-2026-11-08-103: Tránh lỗi 400 Bad Request khi bind Guid query parameter từ Frontend

## Problem
Frontend PosShiftPage gửi branchId dưới dạng chuỗi mã chi nhánh (ví dụ BR-AN-01) hoặc để trống. Backend khai báo [FromQuery] Guid branchId khiến ASP.NET Core Model Binding thất bại và ném lỗi 400 Bad Request 'The value is not valid for Guid'.

## Solution
1. Backend: Đổi kiểu tham số trong controller thành string? branchId và triển khai helper ResolveBranchIdAsync để tự động phân giải linh hoạt (nếu là Guid parse theo Guid, nếu là branchCode tìm chi nhánh theo code, nếu rỗng fallback về TenantContext.CurrentBranchId). 2. Frontend: Thay thế danh sách mock bằng API getBranches thực tế để gửi đúng Guid lên API.
