# EXP-2026-10-14-POS-DEBT: Khảo Sát Tính Năng Bán Hàng Ghi Nợ (Bán Nợ) & Thu Nợ Hóa Đơn Quầy POS

## 1. Problem Statement (Vấn đề cần giải quyết)
- Hiện tại, màn hình bán hàng POS (`PosCheckoutPage` / `PosPaymentPanel`) chỉ hỗ trợ 2 phương thức thanh toán: `Tiền mặt` (`cash`) và `Chuyển khoản VietQR` (`vietqr`).
- Cửa hàng tiện lợi / siêu thị mini có tệp khách hàng thân thiết, khách quen (được phân loại theo hạng thành viên hoặc thiết lập riêng bởi chủ cửa hàng) được phép mua hàng ghi nợ (`Bán nợ`).
- Cần có quy tắc kiểm soát hạn mức nợ (ví dụ: hạn mức 500.000 đ hoặc 1.000.000 đ tùy hạng). Nếu tổng nợ dự kiến vượt quá hạn mức, hệ thống phải cảnh báo rõ ràng, đồng thời cho phép thu ngân/chủ quán phê duyệt bán nợ vượt mức.
- Tại màn hình Quản Lý Hóa Đơn (`InvoiceManagementPage`), cần theo dõi danh sách hóa đơn còn ghi nợ và cung cấp tính năng **Thu nợ hóa đơn** (thu bằng Tiền mặt hoặc VietQR), ghi nhận lịch sử các lần trả nợ và giảm công nợ khách hàng tương ứng.

## 2. Context & Background (Hiện trạng code liên quan)
- **Frontend POS**:
  - `src/features/pos/types/pos.types.ts`: Định nghĩa `PaymentMethod = 'cash' | 'vietqr'`, `Customer` (đã có `loyaltyPoints`, `membershipTier`).
  - `src/features/pos/components/PosPaymentPanel.tsx`: Khối thanh toán quầy, chọn phương thức thanh toán.
  - `src/features/pos/pages/PosCheckoutPage.tsx`: Xử lý submit checkout, tạo đơn hàng mới.
  - `src/features/pos/pages/InvoiceManagementPage.tsx`: Bảng danh sách hóa đơn bán lẻ, bộ lọc trạng thái, in bill nhiệt K80 và hủy hóa đơn.
  - `src/features/pos/mock/posMockData.ts` & `inventoryMockData.ts`: Dữ liệu mock khách hàng và hóa đơn bán lẻ.
- **Frontend Promotion / Loyalty**:
  - `src/features/promotion/types/promotion.types.ts`: Có `MembershipTierRuleDTO` với các hạng thành viên `BRONZE`, `SILVER`, `GOLD`, `DIAMOND`.

## 3. Constraints (Ràng buộc kỹ thuật & nghiệp vụ)
- Phải dùng chung hệ thống giao diện, design tokens và CSS trong `pos.css`.
- Chỉ sử dụng các Lucide icon hợp lệ (`CreditCard`, `AlertTriangle`, `CheckCircle2`, `Banknote`, `QrCode`, `Receipt`, `History`, `UserCheck`). Tuyệt đối không dùng emoji `⚡` hay icon ngoài quy chuẩn.
- Bắt buộc kiểm tra: Không được bán nợ cho khách lẻ vô danh (bắt buộc phải có `Customer` cụ thể).
- **Ràng buộc Git**: Không thực hiện `git push` lên repository từ xa theo yêu cầu của user.

## 4. Assumptions (Giả định nghiệp vụ)
- **[ASSUMPTION-01]**: Mỗi hạng thành viên hoặc khách hàng có hạn mức nợ mặc định:
  - Khách lẻ/Chưa có hạng: Hạn mức nợ = 0 đ (không cho ghi nợ).
  - Hạng Đồng (Bronze): Hạn mức 200.000 đ.
  - Hạng Bạc (Silver) / Người quen cơ bản: Hạn mức 500.000 đ.
  - Hạng Vàng (Gold) / Khách VIP: Hạn mức 1.500.000 đ.
  - Hạng Kim Cương (Diamond) / Đối tác đặc biệt: Hạn mức 3.000.000 đ.
- **[ASSUMPTION-02]**: Khi nợ mới + nợ hiện tại > hạn mức, hiển thị Modal cảnh báo trực quan với thông số nợ, thu ngân bấm "Xác nhận duyệt bán nợ" để tiếp tục xuất bill.
- **[ASSUMPTION-03]**: Khách hàng có thể trả nợ nhiều lần trên một hóa đơn (hoặc trả hết một lần) bằng Tiền mặt hoặc VietQR.

## 5. Phương Án & So Sánh
- **Phương án A (Tích hợp trực tiếp vào POS + Quản lý Hóa đơn - Chọn)**:
  - Thêm radio button `Ghi nợ` vào `PosPaymentPanel`.
  - Hiển thị widget công nợ khách hàng ngay dưới thẻ khách hàng.
  - Modal cảnh báo vượt hạn mức trực quan và modal Thu nợ tại `InvoiceManagementPage`.
  - *Ưu điểm*: Tối giản, liền mạch, đúng quy trình thu ngân bán lẻ, không làm gián đoạn luồng bán hàng thông thường.
- **Phương án B (Tạo trang thanh toán công nợ tách rời ở module khác)**:
  - *Nhược điểm*: Phức tạp, thu ngân phải chuyển trang ra khỏi POS để xử lý, không đáp ứng nghiệp vụ nhanh tại quầy.

## 6. Scope & Non-Goals
### In Scope
- Thêm phương thức thanh toán `'debt'` (Ghi nợ) vào `PosPaymentPanel`.
- Mở rộng model `Customer` với `debtLimit`, `currentDebt`, `allowDebt`.
- Mở rộng model `InvoiceDTO` với `debtAmount`, `paidDebtAmount`, `debtPayments`.
- Modal cảnh báo vượt hạn mức tại POS khi chốt đơn nợ.
- Bộ lọc và hiển thị hóa đơn ghi nợ trong `InvoiceManagementPage`.
- Modal **Thu nợ hóa đơn** ghi nhận số tiền thu, hình thức thu và lịch sử thanh toán nợ.

### Non-Goals
- Tự động trừ tiền qua cổng thanh toán trung gian hoặc thẻ tín dụng ngân hàng.

## 7. Success Criteria (Tiêu chí thành công)
1. Thu ngân chọn được hình thức `Ghi nợ` khi đã gắn khách hàng.
2. Hiển thị đúng hạn mức nợ, nợ hiện tại và nợ sau đơn.
3. Cảnh báo vượt hạn mức xuất hiện khi tổng nợ vượt hạn mức, cho phép xác nhận duyệt.
4. Hóa đơn ghi nợ hiển thị nổi bật trong `InvoiceManagementPage`, có nút `Thu nợ`.
5. Thu nợ thành công, số nợ giảm đúng số tiền đã trả, lưu lịch sử phiếu thu.
6. `npm run build` thành công 100%, không push lên Git.
