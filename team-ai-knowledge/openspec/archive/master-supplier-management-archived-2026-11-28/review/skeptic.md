# Skeptic Review: master-supplier-management

| Chiều | Điểm (1–5) | Nhận xét |
|---|---|---|
| D1 Completeness | 3 | Có scenario list/search/branch/AP; thiếu map role JWT thật (`STORE_OWNER`/`ADMIN` vs `MANAGER`) và scenario GET `{id}` ngoài phạm vi. |
| D2 Correctness | 3 | REQ-03 cho Inactive khi còn nợ — đúng FE-09 nhưng ngược code/test cũ. REQ-DEL01 cấm tạo PO sau cutoff thuộc FE-05, dễ lệch phạm vi change này. |
| D3 Coherence | 3 | Design ẩn cột AP trên list; specs còn `CurrentDebt` trên SummaryDto cho Store Owner. Dual-role vẫn trong Unchanged trong khi FE-09 không đưa lên list. |
| D4 Constraints | 3 | TenantId có; AuthZ controller hiện không có `[Authorize]`. CutoffDayOffset âm chưa cấm. |
| D5 Blast Radius | 4 | Đổi BR-S03 phá test `SUPPLIER_HAS_OUTSTANDING_DEBT`. Gán chi nhánh ảnh hưởng PO picker. |

## Vấn đề
- [HIGH] REQ-RBAC-01: Spec dùng `StoreOwner`/`BranchEmployee` nhưng FE auth dùng `STORE_OWNER`/`ADMIN`/`MANAGER`/`CASHIER` (`authTypes.ts`). → Đề xuất: map Store Owner = `STORE_OWNER`\|`ADMIN`; Branch Employee = user có `branchId` và không phải Store Owner (thường `MANAGER`). GET `{id}` ngoài phạm vi trả `404`.
- [HIGH] REQ-DEL01: "từ chối tạo PO thường" nằm ngoài FE-09 apply (PO là FE-05). → Đề xuất: change này cung cấp config + `IsPastCutoff`/`valid-dates`; không implement tạo PO.
- [HIGH] REQ-LIST-01 vs REQ-AP-VIEW-01: list FE-09.01 không có cột công nợ. → Đề xuất: list không render AP cho mọi role; AP chỉ tab chi tiết Store Owner.
- [MEDIUM] REQ-01: "tự sinh nếu không nhập" vs FE-09 mã luôn hệ thống tạo. → UI không cho nhập mã khi tạo.
- [MEDIUM] REQ-03: cho Inactive khi còn nợ phá unit test cũ — cần cập nhật test, không giữ 400 `SUPPLIER_HAS_OUTSTANDING_DEBT` cho Inactive.
- [LOW] Dual-role trên list là thao tác phụ, không thuộc FE-09.01.

## Kết luận: Cần sửa
