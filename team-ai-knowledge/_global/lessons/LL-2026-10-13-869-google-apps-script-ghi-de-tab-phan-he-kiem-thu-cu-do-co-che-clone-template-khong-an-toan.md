---
id: LL-2026-10-13-869
title: >-
  Google Apps Script ghi đè tab phân hệ kiểm thử cũ do cơ chế clone template
  không an toàn
date: '2026-10-13'
author: Des7240
scope: qa
severity: high
resolution: resolved
tags:
  - lesson
  - agent-generated
---

# LL-2026-10-13-869: Google Apps Script ghi đè tab phân hệ kiểm thử cũ do cơ chế clone template không an toàn

## Problem
Khi đồng bộ kịch bản kiểm thử cho phân hệ mới (ví dụ FE-08), script Google Apps Script cũ sử dụng cơ chế fallback nguy hiểm `ss.getSheets()[3]` khi không tìm thấy đúng tên template ('ModuleName1' hay 'Workflow Name1'). Điều này dẫn đến việc clone và đổi tên chính tab của phân hệ trước (như FE-07), xóa sạch dữ liệu kịch bản của phân hệ đó. Ngoài ra, bảng test cũ thiếu cột Test Case ID và định dạng BDD khiến việc phân loại report type bị sai lệch.

## Solution
1. Nâng cấp Code.gs: Bổ sung hàm `findSafeTemplateSheet` tìm kiếm template theo danh sách ưu tiên ('_Template_', 'Template', 'Feature Name1', 'Workflow Name1') và loại trừ tuyệt đối các tab đã mang tên phân hệ ('FE-*', 'WF-*'). Loại bỏ hoàn toàn fallback lấy sheet theo vị trí index cứng.
2. Tự động di chuyển tab mới clone về cuối bảng tính bằng `ss.moveActiveSheet(ss.getNumSheets())`.
3. Kiểm tra trùng lặp (alreadyExists) trước khi đăng ký vào tab mục lục 'Test Cases' và 'Test Statistics' để tránh nhân bản dòng.
4. Chuẩn hóa cấu trúc bảng test trong Markdown sang bảng Unified 10 cột chuẩn BDD (Test Case ID, Scenario, Pre-condition, Given, When, Then, Priority, Status, Defect ID, Report Type) để đồng bộ chính xác vào các file 5.1 đến 5.5.
5. Đảm bảo MCP Server chạy chế độ Stdio chuyển 100% console.log sang stderr để không làm gãy luồng JSON-RPC của IDE.
