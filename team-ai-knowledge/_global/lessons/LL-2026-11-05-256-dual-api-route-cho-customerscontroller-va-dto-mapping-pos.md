---
id: LL-2026-11-05-256
title: Dual API Route cho CustomersController và DTO Mapping POS
date: '2026-11-05'
author: sonnguyenn10
scope: Backend API Routing & POS Customer DTO Mapping
severity: high
resolution: >-
  Bổ sung [Route('api/v1/[controller]')] cho CustomersController và
  CustomerDebtController, đồng thời map c.fullName || c.name và c.phoneNumber ||
  c.phone tại posOrderApi.ts. Khách hàng thực tế từ PostgreSQL hiện lên chuẩn
  xác 100%.
tags:
  - lesson
  - agent-generated
---

# LL-2026-11-05-256: Dual API Route cho CustomersController và DTO Mapping POS

## Problem
POS sử dụng httpClient với baseURL /api/v1 trong khi CustomersController backend chỉ khai báo [Route('api/[controller]')] dẫn đến HTTP 404 Not Found và tự động fallback về mock data mockCustomersAnNhien thay vì tải dữ liệu khách hàng từ PostgreSQL của tenant. Ngoài ra DTO CustomerResponse trả về FullName và PhoneNumber nhưng posOrderApi lại đọc c.name và c.phone.

## Solution
1. Luôn khai báo route kép [Route('api/[controller]')] và [Route('api/v1/[controller]')] trên các Controller ASP.NET Core để đảm bảo mọi frontend client (dù dùng baseURL /api hay /api/v1) đều gọi thành công.
2. Ánh xạ DTO frontend cần hỗ trợ cả camelCase/PascalCase và alias (c.fullName || c.name, c.phoneNumber || c.phone).
