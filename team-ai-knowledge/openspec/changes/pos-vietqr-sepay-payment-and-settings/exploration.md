# Khảo Sát Kỹ Thuật: Tích Hợp Thanh Toán VietQR Tự Động & Cấu Hình Cổng SePay (EXP-2026-11-02-001)

## 1. Vấn Đề (Problem Statement)
- Chủ cửa hàng bán lẻ không có tư cách pháp nhân công ty để mở cổng thanh toán doanh nghiệp (VNPay, MoMo Doanh nghiệp). Nhu cầu cốt lõi là tiền bán hàng tại quầy POS phải chảy trực tiếp về **tài khoản ngân hàng cá nhân** của từng Chủ tiệm.
- Việc kiểm tra chuyển khoản thủ công bằng mắt trên app ngân hàng điện thoại của thu ngân rất chậm chạp, dễ gây nhầm lẫn và tiềm ẩn rủi ro lừa đảo bởi các ứng dụng làm giả hóa đơn chuyển khoản (Fake Bill).
- Chủ cửa hàng chưa có nơi thiết lập tài khoản ngân hàng và nhập API Key SePay trực quan trên giao diện (tại nút Bánh răng cài đặt Header / TopBar), chưa có tài liệu hướng dẫn đăng ký SePay từng bước.
- Cần giải quyết triệt để bài toán an ninh mạng: Chống giả mạo Webhook (fake request) bằng kỹ thuật phòng thủ chiều sâu 6 lớp, đảm bảo tuyệt đối không có lỗ hổng ngay cả khi lộ API Key.

## 2. Bối Cảnh & Hiện Trạng Code (Context & Background)
- **Frontend:**
  - `src/layouts/StoreOwnerLayout/AppTopNav.tsx` (L1466-1490) có sẵn icon Bánh răng Settings (`<Settings size={18} />`) dẫn đến trung tâm thiết lập cửa hàng.
  - `src/features/pos/components/PosHeader.tsx` là thanh điều hướng quầy thu ngân POS, có menu Thao tác và thông tin người dùng.
  - `src/pages/store/StoreSettingsHubPage.tsx` là trung tâm cài đặt của Chủ cửa hàng với các tab: `store-info`, `subscriptions`, `order-history`.
  - `src/features/pos/pages/PosCheckoutPage.tsx` hiện xử lý thanh toán giỏ hàng nhưng phương thức chuyển khoản mới chỉ ở mức giả lập cơ bản, chưa có modal sinh mã VietQR động chuẩn Napas 247.
- **Backend .NET 8:**
  - Chưa có Entity `StorePaymentConfig` để lưu thông tin ngân hàng và API Key SePay mã hóa theo từng `TenantId`.
  - Chưa có Webhook Controller (`SePayWebhookController`) để hứng dữ liệu giao dịch từ SePay và kiểm tra xác thực.

## 3. Ràng Buộc Kỹ Thuật (Constraints)
- Phân lập dữ liệu triệt để theo mô hình Multi-tenant: Tiền của chi nhánh/cửa hàng nào chảy về tài khoản ngân hàng của cửa hàng đó.
- Không yêu cầu pháp nhân doanh nghiệp (hoạt động hoàn hảo với tài khoản ngân hàng cá nhân).
- Bảo mật thông tin nhạy cảm: `SePayApiKey` và `WebhookSecret` phải được mã hóa AES-256 khi lưu vào CSDL, không bao giờ lộ chuỗi thô ra ngoài Frontend.
- Chế độ Offline-First: Khi chưa bật Backend hoặc mất kết nối mạng ngoài, quầy POS vẫn hoạt động trơn tru qua cơ chế Mock Fallback.

## 4. Giả Định (Assumptions)
- **[ASSUMPTION-01]**: Chủ cửa hàng có ít nhất 1 tài khoản ngân hàng nội địa Việt Nam (MB, VCB, ACB, TPB, Techcombank, VPBank...) và điện thoại thông minh nhận thông báo số dư.
- **[ASSUMPTION-02]**: SePay cung cấp dịch vụ đọc biến động số dư qua Webhook POST (Content-Type: `application/json`) và API đối soát giao dịch `GET /userapi/transactions/details/{id}` bằng Bearer token.
- **[ASSUMPTION-03]**: Mã VietQR chuẩn Napas 247 có thể sinh động thông qua QuickLink `https://img.vietqr.io/image/{bankCode}-{accountNo}-compact2.png?amount={amount}&addInfo={orderContent}` mà không cần phụ thuộc vào thư viện ngoài nặng nề.

## 5. Phạm Vi & Non-Goals
### In Scope
- Thêm Tab / Modal Cấu hình thanh toán chuyển khoản SePay truy cập từ nút Bánh răng cài đặt (`AppTopNav` và `PosHeader`).
- Cẩm nang hướng dẫn trực quan 5 bước đăng ký SePay từ A-Z.
- Modal quét mã VietQR động tại quầy POS, tự động cập nhật số tiền và mã hóa đơn dạng `<TENANT>_<ORDER_CODE>`.
- Backend Webhook tiếp nhận thanh toán với mô hình 6 lớp bảo mật (Secret Token, IP Check, Double-Check API, Amount Matching, Idempotency, SignalR).

### Non-Goals
- Không thực hiện lệnh rút tiền hoặc chuyển tiền đi khỏi tài khoản ngân hàng.
- Không tích hợp máy quẹt thẻ POS cầm tay (POS Terminal thẻ chip).

## 6. So Sánh Các Phương Án (Comparison of Alternatives)

| Tiêu chí | Phương án 1 (Chọn): VietQR Động + SePay Webhook Double-Check | Phương án 2: QR Tĩnh dán tại quầy + Thu ngân tự nhìn điện thoại | Phương án 3: Cổng thanh toán doanh nghiệp (VNPay/MoMo) |
|---|---|---|---|
| **Yêu cầu pháp lý** | 🟢 Cá nhân / Hộ kinh doanh không cần giấy phép ĐKKD | 🟢 Không cần giấy phép | 🔴 Bắt buộc GPKD doanh nghiệp & thuế |
| **Trải nghiệm khách hàng** | 🟢 Quét 1 chạm (tự điền số tiền, không sợ chuyển nhầm) | 🔴 Khách phải tự gõ số tiền và nội dung bằng tay | 🟢 Quét QR tự động |
| **Tự động gạch nợ** | 🟢 Ting ting tự động 100% sau 1-3 giây | 🔴 Thủ công, thu ngân phải nhìn app ngân hàng | 🟢 Tự động |
| **Chống Fake Bill** | 🟢 Tuyệt đối an toàn (Hệ thống tự đối soát số dư) | 🔴 Nguy cơ cao bị lừa app tạo bill giả mạo | 🟢 An toàn |
| **Độ phức tạp tích hợp** | 🟡 Vừa phải (Tích hợp Webhook & 6 lớp bảo vệ) | 🟢 Rất thấp | 🔴 Rất cao |

👉 **Lựa chọn:** Phương án 1 là giải pháp tối ưu số 1 cho chuỗi cửa hàng bán lẻ MT-GRMS.

## 7. Rủi Ro & Biện Pháp Giảm Thiểu
1. **Rủi ro lộ API Key:** Giải quyết triệt để bằng cơ chế **Lớp 3: Double-Check API** (gọi ngược lại SePay) và **Lớp 5: Idempotency** (chống lặp mã giao dịch ngân hàng).
2. **Rủi ro nghẽn mạng ngân hàng:** POS luôn cung cấp nút *"Xác nhận thu tiền thủ công"* để thu ngân linh hoạt xử lý trong tình huống khách vội hoặc mạng ngân hàng quốc gia bảo trì.
