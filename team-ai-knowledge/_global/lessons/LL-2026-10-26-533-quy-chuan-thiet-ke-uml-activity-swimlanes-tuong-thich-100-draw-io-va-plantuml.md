---
id: LL-2026-10-26-533
title: Quy chuẩn thiết kế UML Activity Swimlanes tương thích 100% Draw.io và PlantUML
date: '2026-10-26'
author: Des7240
scope: architecture
severity: medium
resolution: resolved
tags:
  - lesson
  - agent-generated
---

# LL-2026-10-26-533: Quy chuẩn thiết kế UML Activity Swimlanes tương thích 100% Draw.io và PlantUML

## Problem
Khi chuyển đổi và vẽ Activity Diagram Swimlanes từ PlantUML sang Draw.io (mxGraphModel) hoặc compile bằng Graphviz:
1) Cú pháp switch/case không được Draw.io regex parser hỗ trợ, dẫn đến việc bỏ rơi (drop) toàn bộ các nốt case con và dồn toàn bộ các nốt tiếp theo về cùng một tọa độ Y (y=4620), làm vỡ nát biểu đồ.
2) Cú pháp cascading else-if trong PlantUML sinh ra 2 hình thoi nối tiếp đè bẹp chữ vào nhau.
3) Gộp 2 Use Case khác thời điểm/trigger (Bán hàng ghi nợ tại quầy + Khách đến trả nợ cũ) vào 1 sơ đồ lớn chia đôi bằng if(Transaction Type?) làm Graphviz bị xung đột tọa độ (rank collision), đè bẹp các nốt ở làn MT-GRMS lên nhau.

## Solution
1) Tách các Use Case có trigger và thời điểm khác nhau thành các sơ đồ độc lập: Flow 2 (Bán chịu nợ tại quầy POS) và Flow 2B (Thu hồi nợ & Gạch nợ đa kênh).
2) Tuyệt đối không dùng switch/case hoặc cascading else-if khi cần tương thích với Draw.io importer; sử dụng Cây quyết định nhị phân lồng nhau chuẩn UML 2.5 (Nested Binary Decision Tree: if condition 1 then yes else if condition 2 then yes else no endif endif).
3) Không nhảy swimlane bên trong các nhánh rẽ điều kiện con để tránh lỗi lệch tọa độ Graphviz.
4) Ngắt dòng văn bản thủ công bằng \n sau mỗi 15-20 ký tự để tạo các nốt khối vuông cân đối (compact square boxes).
