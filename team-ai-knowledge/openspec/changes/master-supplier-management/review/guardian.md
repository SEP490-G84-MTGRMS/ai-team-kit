# Guardian Review: master-supplier-management

| Hạng mục | Tình trạng (OK / Rủi ro / Thiếu) | Ghi chú |
|---|---|---|
| Multi-tenant | OK | Global Query Filter TenantId; GET cross-tenant 404. |
| AuthN/AuthZ | Thiếu | `SuppliersController` không `[Authorize]`; chưa lọc branch assignment; AP có thể lộ qua list DTO. |
| Validation | Rủi ro | CreditLimit/DueDays >=0 đã nói; CutoffDayOffset/LeadTimeDays âm chưa. |
| Toàn vẹn dữ liệu | Rủi ro | Inactive khi còn nợ OK theo FE-09; xóa cứng khi có lịch sử phải chặn cả PO/GRN không chỉ CurrentDebt. |
| Vận hành & audit | Rủi ro | CreatedBy/UpdatedAt có trên entity; đổi status/gán chi nhánh nên ghi người thực hiện. |

## Vấn đề
- [HIGH] Mọi write (POST/PUT/PATCH status/delivery/branches) MUST Store Owner ở Application layer, không chỉ ẩn nút UI. Employee GET `{id}` NCC không được phép MUST `404` (không `403` để hạn chế enumeration).
- [HIGH] `GET /suppliers` MUST NOT trả `CurrentDebt`/`OverdueDebt` cho Branch Employee. List UI MUST NOT dựa vào client tự ẩn.
- [HIGH] `PUT .../branches` MUST từ chối `BranchId` khác Tenant. Unique (TenantId, SupplierId, BranchId).
- [MEDIUM] Delete hiện chỉ chặn `CurrentDebt>0` — FE-09 cấm xóa khi đã có lịch sử PO/GRN/ledger.
- [MEDIUM] CutoffDayOffset, LeadTimeDays, PaymentDueDays MUST >= 0; OrderCutoffTime HH:mm.
- [LOW] Dev fallback tenant `default-tenant` trong middleware — không nới trên API supplier.

## Kết luận: Cần sửa
