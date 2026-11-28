# Specs: pos-promotions-gift-db-and-cash-approval-sync

## API / Contract

| Method | Path | Request Body | Response Body | HTTP Status / Errors |
|---|---|---|---|---|
| `POST` | `/api/promotions` | `PromotionCreateRequest (Conditions: PromotionConditionDto[])` | `ApiResponse<PromotionResponse>` | 200 OK, 400 Bad Request |
| `PUT` | `/api/promotions/{id}` | `PromotionUpdateRequest (Conditions: PromotionConditionDto[])` | `ApiResponse<PromotionResponse>` | 200 OK, 400 Bad Request, 404 Not Found |
| `GET` | `/api/pos/cash-movements/pending` | None (Query: `branchId?: Guid`) | `ApiResponse<PendingMovementsSummaryResponse>` | 200 OK, 401 Unauthorized, 403 Forbidden |
| `GET` | `/api/vouchers/{id}/codes` | None (Query: `pageIndex`, `pageSize`, `status`) | `ApiResponse<PagedResult<VoucherCodeDto>>` | 200 OK, 404 Not Found |
| `POST` | `/api/pos/cash-movements/{id}/approve` | None | `ApiResponse<ShiftCashMovementDto>` | 200 OK, 400 Bad Request, 404 Not Found |
| `POST` | `/api/pos/cash-movements/{id}/reject` | `{ reason: string }` | `ApiResponse<ShiftCashMovementDto>` | 200 OK, 400 Bad Request, 404 Not Found |

---

## ADDED Requirements

### Requirement: REQ-PROMO-TIERS-CONDITIONS-01 Lưu trọn vẹn các bậc thang khuyến mãi vào CSDL
Hệ thống MUST hỗ trợ lưu trữ và nạp lại toàn bộ các bậc thang điều kiện (`tiers`) dưới dạng `conditions` khi Tạo mới (`POST`) và Cập nhật (`PUT`) chương trình khuyến mại:
- Frontend `PromotionListPage.tsx` MUST chuyển đổi tất cả các bậc thang trong `savedPromo.tiers` thành mảng `PromotionConditionDto[]` gửi kèm trong payload.
- Backend `PromotionService.cs` MUST thay thế toàn bộ danh sách điều kiện cũ bằng danh sách mới thông qua `ReplaceConditionsAsync`.
- Khi người dùng tải lại trang (`F5`), danh sách khuyến mãi MUST hiển thị đầy đủ tất cả các bậc đã cấu hình từ CSDL.

#### Scenario: Chủ cửa hàng tạo khuyến mãi chiết khấu 3 bậc thang
- **GIVEN**: Chủ cửa hàng cấu hình khuyến mãi đơn hàng với 3 bậc:
  - Bậc 1: Đơn từ 100.000 đ giảm 5%.
  - Bậc 2: Đơn từ 300.000 đ giảm 10%.
  - Bậc 3: Đơn từ 500.000 đ giảm 15%.
- **WHEN**: Chủ cửa hàng bấm [Lưu thay đổi] và sau đó tải lại trang (`F5`).
- **THEN**:
  - Backend lưu thành công 3 bản ghi vào bảng `PromotionConditions`.
  - Khi xem lại chi tiết, cả 3 bậc thang đều hiển thị chính xác ngưỡng tiền và tỷ lệ giảm.

---

### Requirement: REQ-PROMO-PRODUCT-GIFT-PICKER-02 Bộ chọn sản phẩm tặng kèm & Đơn vị tính trong Khuyến mãi
Giao diện `PromotionModal.tsx` MUST cung cấp bộ chọn sản phẩm thực tế từ danh mục kho hàng của cửa hàng cho hình thức Mua X tặng Y (`BUY_X_GET_Y`):
- Cho phép người dùng tìm kiếm sản phẩm theo tên hoặc mã barcode.
- Khi chọn sản phẩm tặng, hệ thống MUST hiển thị danh sách Đơn vị tính (`unit`) tương ứng để người dùng lựa chọn (ví dụ: Gói, Thùng, Lon).
- Lưu trữ chính xác `productId`, `productName`, `unit` và số lượng tặng (`giftQty`).

#### Scenario: Chọn quà tặng kèm là Lon Coca-Cola khi mua mì tôm
- **GIVEN**: Người dùng chọn hình thức khuyến mãi "Mua X tặng Y". Bậc 1: Mua 5 gói mì tôm Hảo Hảo.
- **WHEN**: Người dùng gõ "Coca" tại ô chọn quà tặng, chọn "Nước ngọt Coca-Cola 330ml", chọn Đơn vị tính là "Lon" và nhập số lượng "1".
- **THEN**:
  - Dòng bậc thang hiển thị: "Tặng 1 Lon - Nước ngọt Coca-Cola 330ml".
  - Khi lưu, `conditions` chứa `productId` chuẩn của sản phẩm Coca-Cola.

---

### Requirement: REQ-POS-CASH-APPROVAL-MULTI-BRANCH-03 Xem & Duyệt chi két POS đa chi nhánh và toàn bộ hệ thống
Hệ thống MUST hỗ trợ Chủ cửa hàng xem và phê duyệt các phiếu chi két vượt hạn mức và phiếu rút két của toàn bộ chi nhánh hoặc lọc theo chi nhánh cụ thể:
- Backend `GET /api/pos/cash-movements/pending` MUST chấp nhận `branchId` là tùy chọn (`Guid? branchId = null`). Nếu không truyền hoặc rỗng, hệ thống MUST truy vấn tất cả các phiếu chờ duyệt của mọi chi nhánh thuộc `CurrentTenantId`.
- Giao diện `StorePosCashControlPage.tsx` MUST nạp danh sách chi nhánh thật từ CSDL thông qua `branchManagementApi.getBranches()`, loại bỏ hoàn toàn mảng mock `AN_NHIEN_BRANCHES`.
- Khi người dùng chọn "Toàn bộ chi nhánh" (`ALL`), hệ thống gọi API không truyền `branchId`, hiển thị đầy đủ tất cả các phiếu chi vượt hạn mức chưa duyệt.

#### Scenario: Chủ cửa hàng xem phiếu chi vượt hạn mức vừa tạo của thu ngân
- **GIVEN**: Thu ngân tại chi nhánh Cầu Giấy vừa tạo phiếu chi tiền mặt 300.000 đ (vượt hạn mức 200.000 đ), phiếu ở trạng thái `PendingApproval`.
- **WHEN**: Chủ cửa hàng mở trang "Hạn Mức & Duyệt Chi Két POS" với bộ lọc chi nhánh là "Toàn bộ chi nhánh".
- **THEN**:
  - Giao diện hiển thị ngay lập tức phiếu chi 300.000 đ kèm tên chi nhánh Cầu Giấy, lý do và thời gian tạo.
  - Chủ cửa hàng có thể bấm [Duyệt chi] hoặc [Từ chối].

---

### Requirement: REQ-VOUCHER-REAL-CODES-FETCH-04 Tải danh sách mã Voucher con thật từ CSDL & Loại bỏ Mock data
Hệ thống MUST loại bỏ hoàn toàn mock data trong phân hệ Voucher & Khuyến mãi:
- Khởi tạo danh sách bằng mảng rỗng `[]`, hiển thị đúng dữ liệu thật từ CSDL.
- Khi người dùng bấm mở rộng xem chi tiết đợt voucher (`isExpanded`) trong `VoucherBatchTable.tsx`:
  - Hệ thống MUST tự động gọi `promotionApi.getVoucherCodes(batch.id)`.
  - Hiển thị danh sách mã voucher con thật từ CSDL kèm trạng thái `UNUSED`, `USED`, `EXPIRED` và số lượng mã thực tế.

#### Scenario: Xem danh sách mã voucher sau khi sinh thêm mã
- **GIVEN**: Đợt voucher "GIAM20K" đã được sinh 10 mã voucher trong CSDL. Người dùng tải lại trang (`F5`).
- **WHEN**: Người dùng bấm mũi tên mở rộng đợt voucher "GIAM20K".
- **THEN**:
  - Hệ thống gọi API `GET /api/vouchers/{id}/codes`.
  - Tiêu đề hiển thị: "Danh sách mã code trong đợt (10 mã đã tạo)" và hiển thị đầy đủ bảng 10 mã kèm nút sao chép.

---

### Requirement: REQ-EMPLOYEE-DASHBOARD-NAV-05 Lối tắt điều hướng Dashboard cho Nhân viên quầy POS
Giao diện bán hàng POS `PosHeader.tsx` MUST cung cấp nút điều hướng thoát về Dashboard dành riêng cho nhân viên:
- Trong Menu Hamburger:
  - Nếu là Chủ cửa hàng (`isStoreOwner`): Hiển thị "Về Dashboard Chủ Cửa Hàng" (`/store-owner/dashboard`).
  - Nếu là Nhân viên bán hàng (`!isStoreOwner`): Hiển thị "Về Cổng Nhân Viên / Lịch làm việc" (`/employee/schedule`).
- Bổ sung nút icon nhanh trên Topbar POS cho phép nhân viên thu ngân click 1 chạm để chuyển về Dashboard ca (`/pos/cashier-shift` hoặc `/employee/schedule`).

#### Scenario: Nhân viên thu ngân click quay về Cổng nhân viên từ POS
- **GIVEN**: Nhân viên A đăng nhập với vai trò `EMPLOYEE` và đang ở màn hình bán hàng POS (`/pos` hoặc `/employee/pos`).
- **WHEN**: Nhân viên A mở Menu thao tác hoặc click nút Dashboard trên Topbar.
- **THEN**:
  - Hệ thống điều hướng mượt mà sang `/employee/schedule` (hoặc `/pos/cashier-shift`).
  - Nhân viên có thể xem lịch làm việc, bảng chấm công mà không bị kẹt ở màn hình POS.

---

## Acceptance Criteria Checklist

- [ ] 1. Thêm 3 bậc thang khuyến mãi, bấm Lưu, F5 lại trang vẫn hiển thị đủ 3 bậc thang từ CSDL.
- [ ] 2. Trong modal khuyến mãi Mua X tặng Y, chọn được sản phẩm thật từ danh mục và đơn vị tính (Unit).
- [ ] 3. Tạo phiếu chi tiền két vượt hạn mức, mở trang Hạn Mức & Duyệt Chi Két POS thấy phiếu hiển thị ngay lập tức (cả khi chọn ALL lẫn chọn chi nhánh).
- [ ] 4. Mở chi tiết đợt voucher hiển thị danh sách mã code thật từ CSDL, không còn bị "(0 mã đã tạo)".
- [ ] 5. Nhân viên thu ngân trên POS có nút bấm quay về Dashboard / Cổng nhân viên.
- [ ] 6. Toàn bộ Backend Unit Tests và Frontend Build vượt qua 100% không lỗi.
