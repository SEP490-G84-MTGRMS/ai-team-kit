---
id: SES-2026-11-08-478
date: '2026-11-08'
author: sonnguyenn10
project: MT-GRMS
goals:
  - >-
    Xóa các nút dư thừa không dùng trên thanh công cụ POS (Recall, In bill gần
    nhất) và accordion hóa đơn
  - >-
    Loại bỏ nút Thu nợ khách hàng khỏi popup thu chi két ca và kiểm soát tiền
    xuất quỹ không được âm
  - >-
    Bổ sung chọn đơn vị quy đổi (Unit) và kiểm soát hoàn tiền mặt trong modal
    Đổi / Trả Hàng
  - Chặn bán hàng khi chưa mở ca làm việc
  - >-
    Bổ sung nút Xem chi tiết phiên ca & Z-report, ẩn nút Nhận ca đối với Chủ cửa
    hàng
  - Dọn dẹp khối trùng lặp ca chờ bàn giao trên trang Kiểm soát quỹ POS
  - Quy chuẩn luồng tiền thu nợ khách hàng gắn với ca trực của thu ngân hiện tại
status: completed
files_changed:
  - MT_GRMS_BACKEND/src/MT_GRMS.Application/PosShifts/ShiftService.cs
  - MT_GRMS_BACKEND/tests/MT_GRMS.UnitTests/ShiftManagementServiceTests.cs
  - MT_GRMS_FRONTEND/src/features/pos/components/PosHeader.tsx
  - MT_GRMS_FRONTEND/src/features/pos/components/modals/CashMovementModal.tsx
  - MT_GRMS_FRONTEND/src/features/pos/components/modals/ReturnExchangeModal.tsx
  - MT_GRMS_FRONTEND/src/features/pos/components/modals/CollectDebtModal.tsx
  - MT_GRMS_FRONTEND/src/features/pos/pages/InvoiceManagementPage.tsx
  - MT_GRMS_FRONTEND/src/features/pos/pages/PosCheckoutPage.tsx
  - MT_GRMS_FRONTEND/src/features/pos/pages/PosShiftPage.tsx
  - MT_GRMS_FRONTEND/src/features/pos/pages/StorePosCashControlPage.tsx
tags:
  - session
  - summary
---

# Session Summary: Tinh chỉnh UX POS, kiểm soát dòng tiền két quầy và quy trình đổi trả hàng

Đã hoàn thành toàn diện quy trình SEP (change pos-cash-control-and-pos-ux-refinements):
1. Loại bỏ các nút thừa trên POS Header (Recall, In bill gần nhất) và accordion hóa đơn.
2. Kiểm soát dòng tiền mặt quầy thu ngân ở cả Backend và Frontend: chặn xuất tiền mặt vượt quá tiền có trong két (EXCEED_DRAWER_CASH).
3. Chuẩn hóa modal Đổi / Trả Hàng: hỗ trợ chọn đơn vị quy đổi (Unit) từ danh mục ProductUnits/unitPrices, tự động tính đơn giá, chặn hoàn tiền mặt nếu két thiếu tiền.
4. Bổ sung guard chặn thêm món và thanh toán POS khi chưa mở ca.
5. Thêm modal Xem chi tiết phiên ca (Z-Report, lý do chênh lệch); ẩn nút Nhận ca với vai trò Chủ cửa hàng / Admin.
6. Xóa bỏ khối ca chờ phê duyệt bàn giao trùng lặp trên trang Kiểm soát quỹ POS.
7. Quy chuẩn thu nợ khách hàng tại quầy: tiền mặt thu nợ tự động ghi nhận vào ca đang trực của thu ngân hiện tại mà không làm sai lệch người lập hóa đơn ban đầu.
8. Kiểm thử tự động: 530/530 Unit Tests PASS, 44/44 Integration Tests PASS, Frontend build PASS 0 lỗi.
