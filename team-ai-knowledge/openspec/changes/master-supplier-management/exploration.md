# EXP-2026-10-10-FE09: Master Supplier Management & AP Ledger Infrastructure

## 1. Problem Statement
Hệ thống MT-GRMS đã có module Master Supplier (change `master-supplier-management` đã Apply + Test). Ngày 27/10/2026, đặc tả chức năng FE-09 được chốt lại với **hai role duy nhất**: Store Owner và Branch Employee.

Màn hình `/store-owner/suppliers` và spec cũ lệch FE-09 ở các điểm:
- List chưa lọc theo phạm vi chi nhánh; chưa có gán NCC–chi nhánh (FE-09.10).
- Tìm kiếm placeholder có MST nhưng backend chỉ search Name/Code/Phone.
- Thiếu filter Loại NCC (Goods/Service/Both); thừa filter công nợ và cột AP trên list.
- `SupplierSummaryDto` không trả `ContactPerson`; list/detail còn fallback mock.
- Role trên spec còn Accountant/Purchasing Staff; FE-09 chỉ Store Owner (toàn Tenant) và Branch Employee (NCC được phép tại chi nhánh).
- Cutoff thiếu `CutoffDayOffset`; spec cũ tự dời ngày giao sau cutoff — FE-09 cấm tạo/sửa đơn thường sau cutoff.
- Deactivate: spec cũ chặn khi còn nợ AP; FE-09 cho ngừng hoạt động kèm cảnh báo, không tự hủy PO đã xác nhận.
- Công nợ tổng hợp chỉ Store Owner được xem (FE-09.12).

Mục tiêu exploration bổ sung: căn chỉnh spec + refactor màn hình list/detail hiện có, không viết lại module từ đầu.

## 2. Context & Background
- **Dự án**: MT-GRMS (Clean Architecture .NET 8 Backend + React 19 Frontend).
- **Đặc tả chốt**: FE-09.01–FE-09.12, chỉ Store Owner và Branch Employee.
- **Hiện trạng codebase (2026-10-27)**:
  - Backend: `SuppliersController`, `SupplierService`, entities `Supplier`, `SupplierCategory`, `SupplierAPLedger`, `SupplierDeliveryConfig`, `SupplierBlackoutDate`, `SupplierProduct`.
  - Frontend: `src/features/supplier/` — `SupplierListPage`, `SupplierFormModal`, `SupplierDetailPage` (5 tabs, phần lớn mock), `SupplierProductManagementPage`.
  - Chưa có entity/API `SupplierBranchAssignment`.
  - Dual-role `LinkedCustomerId` và AP ledger API đã có; ghi nhận thanh toán chi tiết thuộc FE-17 (out of scope FE-09).

## 3. Constraints
1. Backend: Clean Architecture 4 tầng (.NET 8, EF Core 8, SQL Server).
2. Frontend: React 19, TypeScript, feature folder `src/features/supplier/`, KiotViet Brand Blue, `Be Vietnam Pro` + `JetBrains Mono`.
3. Multi-tenancy: Global Query Filter `TenantId`; Branch Employee chỉ thấy NCC được gán chi nhánh (hoặc NCC dùng chung khi không giới hạn).
4. Tiền: `decimal(18,2)` VND. Thời gian lưu UTC, cutoff tính theo `Asia/Ho_Chi_Minh`.
5. Không sửa migration đã merge; schema mới = migration mới.
6. Refactor surgical: chỉ chạm list/filter/DTO/RBAC/branch assignment và chỗ detail đang mock liên quan FE-09.01–09.12.

## 4. Assumptions
- **[ASSUMPTION-01]**: JWT có `tenant_id` và role `StoreOwner` | `BranchEmployee` (cùng chi nhánh được phân công).
- **[ASSUMPTION-02]**: `SupplierType` = Goods | Service | Both.
- **[ASSUMPTION-03]**: Số dư công nợ lấy từ AP ledger / hóa đơn / nhận hàng / thanh toán — không lấy từ `CreditLimit`, không cộng gộp giá trị PO chưa nhận.
- **[ASSUMPTION-04]**: Dual-role vẫn giữ độc lập AP/AR; không phải actor FE-09; không hiển thị như thao tác chính trên list.
- **[ASSUMPTION-05]**: Nếu Tenant không cấu hình giới hạn chi nhánh, NCC dùng chung mọi chi nhánh. Tenant 1 chi nhánh có thể tự gán chi nhánh duy nhất.
- **[ASSUMPTION-06]**: Mã NCC hệ thống tự sinh, không cho sửa theo cách làm lệch liên kết lịch sử.
- **[ASSUMPTION-07]**: Thay đổi giá / điều khoản / lịch giao không áp ngược PO đã gửi hoặc đã xác nhận.

## 5. Scope & Non-Goals
### In Scope
- FE-09.01 list: search mã/tên/SĐT/MST, filter loại + trạng thái, phân trang, cột mã/tên/người liên hệ/SĐT/trạng thái, scope theo role.
- FE-09.02 detail tabs theo quyền (Store Owner sửa cấu hình dùng chung; Branch Employee chỉ xem phần cần cho chi nhánh).
- FE-09.03–09.05 create/update/activate-deactivate (Store Owner).
- FE-09.06 payment terms (cấu hình, không chặn PO mặc định khi vượt Credit Limit).
- FE-09.07–09.08 delivery schedule + blackout; `CutoffDayOffset` + `OrderCutoffTime`; timezone `Asia/Ho_Chi_Minh`.
- FE-09.10 gán NCC–chi nhánh.
- FE-09.11 lịch sử PO/GRN theo phạm vi chi nhánh.
- FE-09.12 xem số dư công nợ (Store Owner); ẩn AP tổng hợp với Branch Employee.
- Bỏ silent mock fallback trên list; map đủ `ContactPerson` trên Summary DTO.

### Out of Scope (Non-Goals)
- Tạo/sửa PO, GRN, phiếu chi thanh toán (FE-05, FE-17).
- Tự động cấn trừ AR/AP.
- Xuất Excel list (nút stub hiện tại: ẩn hoặc giữ non-blocking, không thuộc FE-09).
- Nút "Trả nợ" trên list (stub; thanh toán thuộc FE-17).
- Viết lại toàn bộ `SupplierProductManagementPage` (FE-09.09 đã có change `supplier-product-management`).

## 6. Technical Options Analysis

### Phương án A: Viết lại feature supplier từ đầu theo FE-09
- **Ưu**: Sạch theo tài liệu mới.
- **Nhược**: Mất CRUD/API/test đã có; phạm vi lớn, rủi ro regression.
- **Không chọn.**

### Phương án B (ĐƯỢC CHỌN): Surgical refactor trên code hiện có + delta spec
- **Mô tả**: Giữ subdomain Supplier, AP ledger, delivery/blackout. Bổ sung `SupplierBranchAssignment`, RBAC 2 role, sửa list/filter/DTO, nối detail tabs đang mock vào API thật, chỉnh cutoff/deactivate theo FE-09.
- **Ưu**: Tái sử dụng backend/UI; đúng yêu cầu "update change cũ".
- **Nhược**: Phải dọn cột/nút thừa (công nợ, Trả, Excel) và mock fallback cẩn thận.

### Phương án C: Chỉ sửa UI list, không đổi backend/RBAC
- **Ưu**: Nhanh.
- **Nhược**: Không đáp ứng FE-09.01 (MST search, loại NCC, scope chi nhánh) và FE-09.10/09.12.
- **Không chọn.**

## 7. Risks & Mitigations
- **Rủi ro 1**: Branch Employee thấy công nợ Tenant nếu quên ẩn cột AP.
  - *Mitigation*: API list không trả `CurrentDebt` cho Branch Employee; UI ẩn cột/nút theo role.
- **Rủi ro 2**: Deactivate khi còn PO mở — user tưởng hệ thống tự hủy đơn.
  - *Mitigation*: Confirm dialog + cảnh báo số PO đang xử lý; không auto-cancel CONFIRMED.
- **Rủi ro 3**: List fallback mock khi API lỗi làm lệch dữ liệu.
  - *Mitigation*: Bỏ fallback; hiện error banner, không render mock như dữ liệu thật.
- **Rủi ro 4**: Cutoff timezone sai (UTC vs VN).
  - *Mitigation*: Lưu UTC, so sánh cutoff theo `Asia/Ho_Chi_Minh`.
