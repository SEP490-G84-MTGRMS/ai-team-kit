# Khám phá kỹ thuật (Exploration): Tinh chỉnh UX quầy POS và kiểm soát dòng tiền ca

## 1. Tuyên bố vấn đề (Problem Statement)
Hệ thống quầy bán hàng POS và quản lý ca làm việc có một số nút chức năng dư thừa/mockup (`PosHeader.tsx`), lặp lại nút thao tác không cần thiết trong bảng quản lý hóa đơn (`InvoiceManagementPage.tsx`), thiếu tính năng chọn đơn vị quy đổi khi đổi/trả hàng và chưa validate số tiền hoàn trả hoặc phiếu chi két với lượng tiền mặt thực có trong két, thiếu khóa POS khi chưa mở ca, và thiếu nút xem chi tiết lý do chênh lệch phiên ca cho Chủ cửa hàng.

## 2. Bối cảnh & Nguyên nhân gốc rễ (Context & Root Cause)

### 2.1. Nút thừa trong Menu POS (`PosHeader.tsx` L536-L565)
- **Hiện trạng**: Menu POS chứa nút "Giữ đơn hàng (Recall)" và "In bill gần nhất".
- **Root cause**: Đây là các nút mockup từ giai đoạn đầu. Hệ thống hiện đã có thanh Đa tab đơn hàng (`Đơn 1`, `Đơn 2`...) và trang Quản lý hóa đơn đã có tính năng tìm/in lại mọi bill K80. 
- **Giải pháp**: Xóa bỏ 2 nút này và các props `onHoldOrder`, `onPrintRecent` liên quan.

### 2.2. Modal Thu/Chi két POS (`CashMovementModal.tsx` & `ShiftService.cs` L180-L201)
- **Hiện trạng**: Có nút "[+] Thu nợ khách hàng" độc lập; nhân viên có thể lập phiếu chi với số tiền lớn hơn số tiền mặt thực có trong két.
- **Root cause**:
  - Modal hardcode 4 nút, trong đó nút thu nợ không gắn với khách hàng hay mã hóa đơn nào. Thu nợ chuẩn phải thực hiện tại trang Quản lý hóa đơn.
  - Cả Frontend lẫn Backend chưa kiểm tra điều kiện invariant: `Tiền chi ra (OUT) <= Tiền mặt hiện có trong két`.
- **Giải pháp**:
  - Xóa nút thu nợ khỏi modal két.
  - Bổ sung validate ở Frontend và Backend: nếu `MovementType == OUT` và `Amount > ExpectedCash` (hoặc `OpeningFloat + CashSales + TotalCashIn - TotalCashOut`) thì báo lỗi "Số tiền chi vượt quá số tiền mặt hiện có trong két".

### 2.3. Modal Đổi / Trả hàng (`ReturnExchangeModal.tsx` L151, L185-L295)
- **Hiện trạng**:
  - Tiêu đề ghi "Đổi / Trả Hàng Chuẩn KiotViet".
  - Bảng danh sách hàng trả và hàng đổi mới không cho phép chọn Đơn vị quy đổi (`UnitName`).
  - Chưa kiểm tra số tiền hoàn tiền mặt với tiền mặt trong két.
- **Root cause**:
  - Modal được xây dựng ban đầu dựa trên đơn vị cơ sở và nhãn KiotViet tham chiếu. Bảng `ProductUnits` và mảng `product.units` chưa được binding vào modal này.
- **Giải pháp**:
  - Đổi tiêu đề thành "Đổi / Trả Hàng".
  - Cho phép chọn đơn vị tính (Unit) từ `product.units` (Hộp, Vỉ, Viên...), tự động nhân tỷ lệ quy đổi (`conversionRate`) và cập nhật giá.
  - Cảnh báo nếu chọn hoàn tiền mặt mà tiền trong két không đủ.

### 2.4. Trùng lặp nút thao tác chi tiết hóa đơn (`InvoiceManagementPage.tsx` L1235-L1277)
- **Hiện trạng**: Khi mở rộng accordion xem chi tiết hóa đơn, 3 nút `Đổi / Trả Hàng`, `Hủy Hóa Đơn Này`, `In Hóa Đơn Nhiệt K80` lặp lại y nguyên các nút đã có ở dòng chính ngoài bảng.
- **Root cause**: Template accordion sao chép thừa cụm nút action bar.
- **Giải pháp**: Xóa cụm 3 nút này trong accordion chi tiết.

### 2.5. POS chưa chặn cứng khi chưa mở ca (`PosCheckoutPage.tsx` L400-L450)
- **Hiện trạng**: `handleCheckoutSubmit` chỉ kiểm tra lịch trực ca và trạng thái `isShiftClosing`, nhưng không kiểm tra `if (!currentShift)`.
- **Root cause**: Bỏ sót điều kiện tiên quyết: bắt buộc phải có ca làm việc đang mở.
- **Giải pháp**: Chặn thanh toán và hiển thị thông báo/modal yêu cầu mở ca nếu `!currentShift`.

### 2.6. Bảng phiên ca thiếu xem chi tiết & Nút nhận ca cho Chủ (`PosShiftPage.tsx` L500-L605)
- **Hiện trạng**:
  - Không có nút xem chi tiết Z-Report trên từng ca.
  - Nút "Nhận ca" hiển thị cho cả Chủ cửa hàng.
- **Root cause**: Cột Thao tác chỉ có duy nhất nút "Nhận ca" khi `isPendingHandover`.
- **Giải pháp**:
  - Bổ sung nút "Xem chi tiết" mở modal xem đầy đủ: thông tin ca, doanh thu chi tiết, lý do chênh lệch (`differenceReason`/`notes`), danh sách phiếu thu/chi.
  - Ẩn nút "Nhận ca" khi role là `STORE_OWNER` hoặc `ADMIN`.

### 2.7. Khối ca bàn giao tồn đọng ở trang Hạn mức (`StorePosCashControlPage.tsx` L1060-L1150)
- **Hiện trạng**: Khối "Ca Làm Việc Chờ Phê Duyệt Bàn Giao" nằm ở trang Hạn mức & Duyệt chi két POS.
- **Root cause**: Dư thừa tính năng đã có ở trang Lịch sử ca.
- **Giải pháp**: Xóa khối này khỏi trang Hạn mức.

---

## 3. Ràng buộc (Constraints)
- Không thay đổi schema Database vì các thực thể `ProductUnits`, `ShiftCashMovements`, `Shifts` đã đầy đủ.
- Giữ nguyên các luồng bán hàng chuẩn, tính chiết khấu, quét mã vạch và kiểm soát FEFO.
- Tất cả unit tests backend và frontend build phải hoàn toàn pass.

## 4. Giả định (Assumptions)
- `product.units` luôn có ít nhất đơn vị cơ sở (`isBaseUnit = true`, `conversionRate = 1`).
- Khi thu ngân chọn hoàn tiền qua VietQR / Chuyển khoản, tiền không bị trừ khỏi két quầy.

## 5. Phạm vi & Non-Goals
- **In Scope**: Sửa đổi tại 6 file frontend (`PosHeader.tsx`, `PosCheckoutPage.tsx`, `CashMovementModal.tsx`, `ReturnExchangeModal.tsx`, `InvoiceManagementPage.tsx`, `PosShiftPage.tsx`, `StorePosCashControlPage.tsx`) và 1 file backend (`ShiftService.cs`).
- **Non-Goals**: Không viết lại hệ thống công nợ hay thêm các bảng dữ liệu mới.

## 6. Tiêu chí thành công (Success Criteria)
- Giao diện POS sạch sẽ, không còn nút thừa hay nút trùng lặp.
- Không thể rút âm két; không thể bán hàng khi chưa mở ca.
- Đổi trả hàng hỗ trợ đầy đủ đơn vị quy đổi.
- Chủ cửa hàng có thể xem chi tiết lý do chênh lệch của mọi ca làm việc.
