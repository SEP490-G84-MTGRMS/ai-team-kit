---
id: LL-2026-10-26-610
title: >-
  Xử lý Multi-Tenant Query Filter trong Integration Test và tránh lỗi Package
  Downgrade .NET 8
date: '2026-10-26'
author: Des7240
scope: backend
severity: medium
resolution: resolved
tags:
  - lesson
  - agent-generated
---

# LL-2026-10-26-610: Xử lý Multi-Tenant Query Filter trong Integration Test và tránh lỗi Package Downgrade .NET 8

## Problem
1. NullReferenceException khi chạy InMemory Integration Tests do Global Query Filter của AppDbContext truy cập _tenantContext.CurrentTenantId mà DbContext được khởi tạo không có ITenantContext.
2. Lỗi NU1605 Warning As Error khi add package Microsoft.Extensions.Configuration.Abstractions kéo nhầm bản 10.0.14 trong khi solution là .NET 8.

## Solution
1. Khi viết Integration Test cho DbContext có Global Query Filter, luôn mock/truyền một FakeTenantContext có CurrentTenantId hợp lệ vào constructor của AppDbContext.
2. Khi dùng dotnet add package trong dự án .NET 8, luôn chỉ định cờ --version 8.0.0 để tránh bị NuGet tự động chọn bản preview mới nhất của framework cao hơn.
