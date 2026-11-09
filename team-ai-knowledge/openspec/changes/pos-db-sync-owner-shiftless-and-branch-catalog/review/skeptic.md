# Skeptic Review: pos-db-sync-owner-shiftless-and-branch-catalog

| Chiều | Điểm (1–5) | Nhận xét |
|---|---|---|
| D1 Completeness | 5 | Toàn bộ kịch bản chính, regression và edge case trọng yếu ở Vòng 1 đã được bổ sung đầy đủ (giữ nguyên SP `Inactive` khi backfill, upsert lịch cũ `06:00-23:00` sang 24/7, khóa `self-check-in` theo `FaceDescriptor`/`Scheduled`/`ALREADY_CHECKED_IN`, cách ly tiền mặt sang `Safe`, làm sạch toàn bộ `tabs` khi đổi chi nhánh). |
| D2 Correctness | 5 | Khớp chính xác với code thật: đúng tên cột phân biệt hoa-thường `"TenantId"`, `"BranchId"`, `"ProductId"` và `UnitName varchar(50)`, đủ 7 cột mở rộng của `"Tenants"`, nâng clamp `pageSize` lên `1000` ở cả `BranchProductService` và `BranchProductRepository` (dòng 223–232), mở khóa `PosPaymentPanel.isCheckoutDisabled` cho `STORE_OWNER`, khớp hệ quy chiếu `vnNow` với `CheckOutFaceIdAsync`. |
| D3 Coherence | 4 | `specs.md` đã chuẩn hóa sang `## ADDED Requirements` theo đúng thứ tự `01 -> 05`, bảng API đồng nhất `pageIndex/pageSize` và mã lỗi. Chỉ còn câu chữ cũ `"hardcode"` còn sót nhẹ trong `proposal.md` (không ảnh hưởng `specs.md`). |
| D4 Constraints | 5 | Tuân thủ đầy đủ `config.yaml` và bảo mật: có EF Core Migration mới, tiền tệ `decimal(18,2)`, không cho header ghi đè JWT đã xác thực trong `MultiTenantMiddleware`, không tin `request.CreatorRole` từ client, bỏ hoàn toàn backdoor mật khẩu trong `AuthService`, chặn bypass AI FaceID khi nhân viên đã đăng ký `FaceDescriptor`. |
| D5 Blast Radius | 5 | Đã kiểm soát tốt ảnh hưởng chéo giữa SaaS Wallet, Catalog, POS Orders (kể cả Đặt trước & Đổi trả), POS Shifts (`ShiftParticipants`), Cashbook (`Safe` vs `Till`), HR Schedules và Auth/JWT (`"branch_id"` claim + SHA-256 deterministic `Guid`). |

## Đánh giá Vòng 2 — Các điểm Vòng 1 đã được giải quyết triệt để
1. **`REQ-DB-SYNC-01`**: Đã bổ sung EF Core Migration chuẩn, liệt kê đủ 7 cột mở rộng của `"Tenants"`, sửa `"UnitName"` về `character varying(50)`, dùng đúng tên cột `"TenantId"`, `"BranchId"`, `"ProductId"` kèm Unique Index và điều kiện không ghi đè dòng `Inactive` / `IsDeleted = true`.
2. **`REQ-SEED-AUTH-02`**: Đã loại bỏ hướng tạo backdoor trong `AuthService`, chuyển sang đồng bộ PBKDF2 `PasswordHash` ở `DbInitializer`, upsert cả các lịch cũ `06:00 - 23:00` sang `00:00:00 - 23:59:59`, truy vấn `BranchId` có `.IgnoreQueryFilters()` + `TenantId`, phát claim `"branch_id"` vào JWT, sinh `Guid` tất định bằng `SHA256("mt-grms-user:" + rawUserId.Trim())` và lưu đúng tên thật nhân viên mở ca.
3. **`REQ-EMP-ATTENDANCE-POS-03`**: Đã khóa chặt `self-check-in` chỉ cho nhân viên chưa có `FaceDescriptor` (`FACE_ID_REQUIRED` nếu đã có), kiểm tra `Status == Scheduled`, chống gọi lặp `ALREADY_CHECKED_IN` (`409`), khớp `CheckInTime = vnNow` với `CheckOutFaceIdAsync`, và đồng bộ tức thời nút vào POS lên `AppTopNav`.
4. **`REQ-OWNER-SHIFTLESS-04`**: Đã xét quyền thuần theo `_tenantContext.CurrentRole`, mở khóa `PosPaymentPanel.isCheckoutDisabled` cho `STORE_OWNER`, không ghi `STORE_OWNER` vào `ShiftParticipants`, và hạch toán tiền mặt đơn không ca vào `FinanceAccountType.Safe` (`GetOrCreateSafeAsync`) tách biệt hoàn toàn khỏi `Till` thu ngân cho cả bán lẻ, đặt trước và đổi trả.
5. **`REQ-POS-BRANCH-SWITCH-05`**: Đã nâng clamp `pageSize` lên `1000` ở cả `BranchProductService` và `BranchProductRepository`, tách `useEffect` kèm `AbortController`, làm sạch toàn bộ `tabs` hóa đơn (kể cả quà tặng) khi đổi chi nhánh và cho phép tra cứu barcode phạm vi chi nhánh.

## Vấn đề
- [LOW] REQ-SEED-AUTH-02: Tại `specs.md` ghi tên trường `FailedLoginAttempts = 0, LockedUntil = null`, trong khi entity thực tế `User.cs` (dòng 34–35) đặt tên là `AccessFailedCount` và `LockoutEnd`. → Đề xuất: Khi hiện thực trong `DbInitializer` ánh xạ đúng sang `AccessFailedCount = 0` và `LockoutEnd = null`.
- [LOW] REQ-OWNER-SHIFTLESS-04: Trong `PosOrderServiceTests.cs`, các unit test hiện hữu khởi tạo `OrderService` độc lập với `shiftRepository: null` và `tenantContext: null`. → Đề xuất: Khi bổ sung chặn `SHIFT_NOT_OPEN` cho `STAFF` trong `OrderService`, chỉ kích hoạt khi `_shiftRepository != null && _tenantContext != null && !isOwnerOrAdmin` để bảo toàn 100% unit test hiện có.

## Kết luận: Chấp nhận
