# Guardian Review: fix-pos-autopromo-400-and-preorder-units

| Hạng mục | Tình trạng (OK / Rủi ro / Thiếu) | Ghi chú |
|---|---|---|
| Multi-tenant | OK | Đã bắt buộc kiểm tra `CurrentTenantId` khác rỗng và lọc tường minh `b.TenantId == currentTenantId && !b.IsDeleted` khi phân giải `BranchId` chuỗi; đối khớp token chính xác qua `Split(',', ';')` thay vì `.Contains()` tránh khớp nhầm mã chi nhánh con; xóa UUID cứng chéo Tenant trên `InvoiceManagementPage`. |
| AuthN/AuthZ | OK | Quy định rõ lấy role từ JWT Claims khi hủy đơn (`CancelOrderAsync`), tách quyền quản trị KM với quyền thẩm định giỏ / tạo đơn POS & Đơn đặt trước của thu ngân. |
| Validation | OK | Giới hạn độ dài `BranchId`/`CustomerId` (`<= 100`), chặn `SubTotal < 0`, `Quantity <= 0`, `ConversionRate <= 0` và xử lý an toàn `UnitId`/`ProductId` không phải UUID. |
| Toàn vẹn dữ liệu | OK | Tách 2 bước trừ kho FEFO và tạo `OrderDetail` trên `CreatePreOrderAsync` + `ProcessReturnExchangeAsync` (`NewItems` & `ReturnedItems`); bọc khóa dòng FEFO và lưu đơn/ngân sách KM trong `_unitOfWork.ExecuteInTransactionAsync`; đồng bộ cột `"ProductUnitID"`, `"UnitName"`, `"ConversionRate"` giữa `OrderDetailConfiguration`, Migration và `DbInitializer` (bọc `IsNpgsql()`). |
| Vận hành & audit | OK | Gán đầy đủ `Order.CreatedBy` cho Đơn đặt trước, chống gọi trùng `FulfillPreOrderAsync`, và báo lỗi thật trên UI thay vì nuốt ngoại lệ tạo đơn `PO` / toast thành công giả. |

## Vấn đề (Vòng 1 phát hiện → Đã khóa an toàn trong `specs.md` Vòng 2)
- [RESOLVED - Vòng 1 HIGH] Hỏng số lượng, thành tiền và hoàn kho khi `CreatePreOrderAsync` tách qua nhiều lô FEFO hoặc có nhiều dòng cùng `ProductId` khác `UnitId` → Đã quy định tách 2 bước trong `REQ-FIX-PREUNIT-02`.
- [RESOLVED - Vòng 1 HIGH] `DbInitializer` bỏ qua `MigrateAsync()` trên DB hiện hữu và hậu tố cột `ID` viết hoa trong `OrderDetailConfiguration` → Đã quy định đồng bộ `"ProductUnitID"`, `"UnitName"`, `"ConversionRate"` và bọc `context.Database.IsNpgsql()`.
- [RESOLVED - Vòng 1 HIGH] Thiếu Transaction bao bọc `SELECT ... FOR UPDATE` và thiếu quy đổi `ConversionRate` cho `NewItems` khi Đổi/Trả → Đã cập nhật vào `REQ-FIX-PREUNIT-02`.
- [RESOLVED - Vòng 1 HIGH] Khớp chuỗi con `.Contains(branchId)` và nguy cơ chéo Tenant → Đã bắt buộc lọc `TenantId` tường minh và tách mảng token `Split(',', ';')` trong `REQ-FIX-PROMO-01`.

## Kết luận: An toàn
