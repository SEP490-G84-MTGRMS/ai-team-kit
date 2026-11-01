# Tasks: pos-return-exchange-and-preorder

## Backend (.NET 8 Clean Architecture)
- [ ] T1 — Cập nhật `OrderService.CreatePreOrderAsync` kiểm tra cọc tối thiểu $\ge 10\%$ và cập nhật `CancelOrderAsync` kiểm tra Role người dùng (chặn `CASHIER`) (REQ_POS_PRE_03, REQ_POS_SEC_02)
- [ ] T2 — Thêm DTOs `ReturnExchangeRequest` và phương thức `ProcessReturnExchangeAsync` trong `OrderService` xử lý hoàn kho hàng cũ, trừ kho FEFO hàng mới, bù trừ tiền/nợ (REQ_POS_RET_01)
- [ ] T3 — Thêm API endpoint `POST /api/orders/{id}/return-exchange` trong `OrdersController.cs` (REQ_POS_RET_01)

## Frontend (React + Vite + TypeScript)
- [ ] T4 — Cập nhật `posOrderApi.ts` thêm phương thức `returnExchangeOrder` và tích hợp kiểm tra Role ẩn/khóa nút "Hủy đơn" với Thu ngân trong `InvoiceManagementPage.tsx` (REQ_POS_SEC_02)
- [ ] T5 — Xây dựng component `ReturnExchangeModal.tsx` (3 khối: hàng trả, hàng đổi mới, bù trừ chênh lệch) và gắn nút "Đổi / Trả hàng" trong `InvoiceManagementPage.tsx` (REQ_POS_RET_01)
- [ ] T6 — Thêm ràng buộc kiểm tra cọc $\ge 10\%$ và hiển thị chi nhánh nhận hàng cho đơn đặt trước (REQ_POS_PRE_03)

## Testing & Verification
- [ ] T7 — Viết Unit Tests trong `PosReturnExchangeTests.cs` kiểm tra đổi trả, phân quyền hủy, cọc 10%; chạy xác minh toàn bộ test backend `dotnet test` và build frontend `npm run build` (REQ_POS_RET_01, REQ_POS_SEC_02, REQ_POS_PRE_03)
