# Tasks: purchase-order-grid-creation (FE-05 Ordering)

## Backend (.NET 8)
- [x] T1 — Tạo DTOs cho PO Grid (`GridInitDto`, `GridProductDto`, `SubmitGridPoCommand`, `SplitPoItemDto`) trong `MT_GRMS.Application` (REQ-POGRID-01, REQ-POGRID-02)
- [x] T2 — Triển khai Query Handler `GetPoGridProductsQuery` với logic lọc LeadTime, ActiveDays, Holidays và CutoffSchedules trong `MT_GRMS.Application` (REQ-POGRID-01, REQ-POGRID-03)
- [x] T3 — Triển khai FluentValidation cho `SubmitGridPoCommand` kiểm tra MOQ & Bội số đặt hàng (REQ-POGRID-05)
- [x] T4 — Triển khai Command Handler `SubmitGridPoCommandHandler` tự động tách PO theo `[BranchId + SupplierId + DeliveryDate]` & gán trạng thái `PENDING_CREDIT_APPROVAL` nếu vượt `CreditLimit` (REQ-POGRID-04, REQ-POGRID-08)
- [x] T5 — Thêm Controller Endpoint `PurchaseOrderGridController` trong `MT_GRMS.Api` (REQ-POGRID-01, REQ-POGRID-04)

## Frontend (Vite + React 19 + TypeScript)
- [x] T6 — Mở rộng Types trong `types/po.types.ts`: cấu trúc `MatrixCellData` (3 trường `employeeQty`, `storeQty`, `finalQty`), `DayCutoffStatus`, `SplitPoPreview` (REQ-POGRID-02, REQ-POGRID-03)
- [x] T7 — Nâng cấp `OrderMatrixFilterBar`: hỗ trợ chọn preset thời gian 7/14/21/31 ngày, ràng buộc tối đa 31 ngày, filter "Chủ đã sửa", "Cảnh báo vi phạm MOQ" (REQ-POGRID-01, REQ-POGRID-02)
- [x] T8 — Nâng cấp `OrderMatrixTable`: hiển thị Cutoff Header theo từng ngày giao, ô nhập 3 trường số lượng kèm chỉ báo trực quan Store Owner override và khôi phục số lượng NV (REQ-POGRID-02, REQ-POGRID-03)
- [x] T9 — Triển khai tiện ích Đề xuất số lượng (Suggested Qty), Sao chép tuần trước, Xuất/Nhập Excel (REQ-POGRID-06, REQ-POGRID-07)
- [x] T10 — Triển khai Modal `OrderMatrixSplitModal`: xem trước và thực hiện chốt đơn bóc tách độc lập theo từng `[Chi nhánh + NCC + Ngày giao hàng]`, phân biệt ngày đến hạn Cutoff vs ngày tương lai (REQ-POGRID-03, REQ-POGRID-04)
- [x] T11 — Cập nhật `OrderMatrixPage` kết nối toàn bộ luồng nghiệp vụ FE-05 tại `/store-owner/purchase-orders/create-matrix` (REQ-POGRID-01 -> REQ-POGRID-08)

## Test & Verification
- [x] T12 — Kiểm tra tính toán FinalQty = EmployeeQty khi StoreQty = null và FinalQty = StoreQty khi StoreQty != null
- [x] T13 — Kiểm tra tách PO theo từng ngày giao hàng và NCC khi chốt đơn
- [x] T14 — TypeScript compilation (`tsc -b`) và Vite production build đạt 100% PASS
