# Khám phá: Tích hợp Cổng thanh toán SePay và Nâng cấp Giao diện Nạp ví Gian hàng (MT-GRMS)

## 1. Hiện trạng Code & Vấn đề cần giải quyết

### 1.1. Hiện trạng Frontend
- Tệp `StoreWalletTopupModal.tsx` đang là giao diện mẫu (mock):
  - Mã QR là hình vẽ SVG tĩnh giả lập, không quét được bằng app ngân hàng thật.
  - Mã nội dung chuyển khoản sinh ngẫu nhiên `WAL ${storeInfo.code} ${Math.floor(1000 + Math.random() * 9000)}` bằng JavaScript phía client, không lưu vào cơ sở dữ liệu.
  - Nút "Xác nhận đã chuyển khoản" dùng `setTimeout` 1000ms rồi giả lập thành công, không gọi API backend.
  - Bảng giao dịch `WalletLedgerTab.tsx` và số dư ví tại `StoreSettingsHubPage.tsx` đọc từ mảng giả lập tĩnh `INITIAL_TRANSACTIONS` và `INITIAL_STORE_INFO.walletBalance`.
  - Phong cách thiết kế còn mang màu xanh dương (#0066FF) cũ, chưa đồng bộ với hệ thống Deep Teal (#0F766E), font chữ và bo góc pill đồng bộ theo giao diện `SubscriptionCheckoutModal`.

### 1.2. Hiện trạng Backend
- Chưa có thực thể và bảng `WalletTransactions` (Sổ cái lịch sử biến động số dư ví).
- Thực thể `Tenant` (`Tenant.cs`) chưa có trường `WalletBalance` (decimal(18,2)).
- Chưa có API tạo yêu cầu nạp ví (Top-up Order) trả về QR VietQR động.
- Chưa có Endpoint Webhook đón nhận IPN (Instant Payment Notification) từ cổng thanh toán SePay khi có biến động tài khoản ngân hàng.
- API mua gói `TenantStoreController.PurchaseSubscription` chưa thực hiện trừ tiền ví thật sự khi người dùng chọn phương thức thanh toán `WALLET`.

---

## 2. Giả định (Assumptions)
- **[ASSUMPTION-01]**: Cổng thanh toán SePay (sepay.vn) gửi webhook POST với Content-Type `application/json` kèm mã xác thực `Apikey <token>` hoặc Secret Header mỗi khi phát sinh giao dịch nhận tiền thành công vào tài khoản ngân hàng của MT-GRMS.
- **[ASSUMPTION-02]**: Mỗi tenant trong hệ thống đều có mã định danh `Tenant.Code` duy nhất (ví dụ: `MD-RETAIL-01`, `MTMART`, v.v.).
- **[ASSUMPTION-03]**: Người dùng khi chuyển khoản qua Napas247 / VietQR sẽ quét mã QR tự động điền đúng Số tài khoản, Ngân hàng, Số tiền và Cú pháp nội dung (ví dụ: `WAL 8392` hoặc `WAL MD-RETAIL-01 8392`).
- **[ASSUMPTION-04]**: QR Code VietQR có thể tạo động trực tuyến qua API SePay (`https://qr.sepay.vn/img?...`) hoặc VietQR QuickLink (`https://img.vietqr.io/image/...`) với đầy đủ số tiền và nội dung chuyển khoản mà không phát sinh thêm chi phí hạ tầng.

---

## 3. Ràng buộc (Constraints)
- Phải tuân thủ Clean Architecture 4 tầng của Backend ASP.NET Core (.NET 8): Domain -> Application -> Infrastructure -> Api.
- Số dư ví và số tiền giao dịch phải dùng kiểu dữ liệu `decimal(18,2)` trong PostgreSQL.
- Mọi biến động số dư ví (Nạp ví, Thanh toán gói, Hoàn tiền) phải được ghi nhận bất biến (immutable audit log) trong bảng `WalletTransactions`.
- Webhook của SePay phải đảm bảo tính Idempotency (xử lý an toàn khi SePay retry gửi lại cùng 1 giao dịch nhiều lần).

---

## 4. Phạm vi & Non-Goals

### 4.1. Trong phạm vi (In Scope)
1. **Database & Backend Entities**:
   - Thêm cột `WalletBalance decimal(18,2) NOT NULL DEFAULT 0` vào bảng `Tenants`.
   - Tạo bảng `WalletTransactions` và `WalletTopupOrders` (hoặc quản lý trạng thái đơn nạp ví).
2. **SePay Webhook Integration**:
   - Endpoint `POST /api/v1/webhooks/sepay` tiếp nhận dữ liệu giao dịch từ SePay.
   - Kiểm tra Token xác thực webhook.
   - Phân tích cú pháp nội dung chuyển khoản để định danh Tenant và Đơn nạp.
   - Xử lý Idempotency: Kiểm tra mã tham chiếu ngân hàng `referenceCode` / `id` của SePay để chống cộng tiền lặp.
   - Tự động cộng số dư ví cho Tenant và lưu lịch sử biến động số dư.
3. **Tenant Wallet API**:
   - `POST /api/v1/tenant/wallet/topup-order`: Tạo đơn nạp ví, trả về mã đơn, nội dung chuyển khoản, số tài khoản thụ hưởng và đường dẫn VietQR động.
   - `GET /api/v1/tenant/wallet/topup-status/{orderCode}`: Tra cứu trạng thái đơn nạp ví (PENDING / COMPLETED / EXPIRED).
   - `GET /api/v1/tenant/wallet/balance`: Lấy số dư ví hiện tại và thống kê nạp/tiêu.
   - `GET /api/v1/tenant/wallet/transactions`: Lấy danh sách lịch sử biến động số dư có phân trang.
   - Cập nhật logic `POST /api/v1/tenant/subscriptions/purchase`: Khi thanh toán bằng `WALLET`, kiểm tra số dư và trừ tiền thực tế, ghi log giao dịch trừ ví.
4. **Frontend Modernization**:
   - Tái thiết kế toàn diện `StoreWalletTopupModal.tsx`:
     - Đồng bộ màu sắc Deep Teal (`#0F766E`), nền pastel nhẹ (`#F0FDFA`), viền tinh tế (`#CCFBF1`), font `Be Vietnam Pro`, số tiền định dạng `tabular-nums`.
     - Tạo ảnh VietQR thật bằng SePay QR URL với mã giao dịch tự động.
     - Cơ chế tự động Polling (3 giây/lần) trạng thái đơn nạp; khi SePay webhook kích hoạt thành công, modal lập tức chuyển sang màn hình thành công mượt mà.
     - Nút 1-click sao chép số tài khoản và nội dung chuyển khoản.
   - Đồng bộ `WalletLedgerTab.tsx` với API thật từ backend (thay thế mock data).

### 4.2. Ngoài phạm vi (Non-Goals)
- Không hỗ trợ rút tiền (Payout/Withdraw) từ ví gian hàng về tài khoản ngân hàng của chủ tiệm.
- Không tích hợp thẻ tín dụng quốc tế (Visa/Mastercard) trong giai đoạn này.
- Không tự động trừ phạt hay âm ví (số dư ví tối thiểu luôn >= 0).

---

## 5. So sánh các Phương án Kỹ thuật

### Phương án 1: Frontend chủ động Polling SePay API trực tiếp (Client-to-SePay)
- **Cơ chế**: Sau khi quét QR, Frontend liên tục gọi API của SePay bằng API Key công khai để kiểm tra giao dịch có khớp hay không.
- **Ưu điểm**: Không cần cấu hình Webhook server.
- **Nhược điểm**: Lộ API Key bí mật của SePay trên trình duyệt; nếu người dùng đóng trình duyệt hoặc mạng chập chờn thì không được cộng tiền; vi phạm nghiêm trọng an toàn bảo mật tài chính.
- **Đánh giá**: ❌ LOẠI BỎ vì không an toàn.

### Phương án 2: SePay Webhook Server-to-Server + Client Polling Backend Status (ĐƯỢC CHỌN)
- **Cơ chế**:
  1. Frontend gọi Backend tạo đơn nạp (`POST /api/v1/tenant/wallet/topup-order`), nhận về `orderCode` (ví dụ: `WAL9281`).
  2. Frontend hiển thị QR SePay chứa cú pháp `WAL <orderCode>` và bắt đầu polling nhẹ nhàng tới Backend (`GET /api/v1/tenant/wallet/topup-status/{orderCode}`) mỗi 3s.
  3. Khi khách quét mã và thanh toán, SePay bắn Webhook POST tới `POST /api/v1/webhooks/sepay`.
  4. Backend xác thực chữ ký/API key, mở DB Transaction, cộng `WalletBalance`, ghi log `WalletTransactions`, cập nhật đơn nạp thành `COMPLETED`.
  5. Lần polling tiếp theo của Frontend nhận kết quả `COMPLETED`, giao diện lập tức hiển thị màn hình chúc mừng và cập nhật số dư. Nếu khách bấm nút "Xác nhận đã chuyển khoản", hệ thống gọi kiểm tra ngay lập tức.
- **Ưu điểm**:
  - Bảo mật tuyệt đối (API Key SePay lưu tại Backend `appsettings.json`).
  - Giao dịch được xử lý ngay cả khi người dùng tắt modal hoặc đóng trình duyệt.
  - Idempotent chống nạp tiền 2 lần.
  - Đơn giản, nhẹ nhàng, không cần duy trì kết nối WebSocket nặng nề.
- **Nhược điểm**: Cần cấu hình địa chỉ Webhook công khai (hoặc webhook relay/ngrok cho môi trường dev local).
- **Đánh giá**: ✅ CHỌN.

### Phương án 3: SePay Webhook + SignalR WebSocket Push
- **Cơ chế**: Backend duy trì WebSocket SignalR tới từng tenant; khi có webhook SePay thì push sự kiện nạp tiền trực tiếp.
- **Ưu điểm**: Cập nhật tức thời (zero delay) không cần polling HTTP.
- **Nhược điểm**: Phức tạp trong cấu hình hạ tầng WebSocket, khó mở rộng (scale-out) nếu chưa có Redis Backplane, không cần thiết cho tính năng nạp ví chỉ diễn ra trong vòng vài chục giây.
- **Đánh giá**: ❌ KHÔNG CẦN THIẾT ở pha này.

---

## 6. Rủi ro & Giải pháp Kiểm soát

| Rủi ro | Mức độ | Biện pháp giảm thiểu |
|---|:---:|---|
| **Webhook Retry trùng lặp từ SePay** | Cao | Lưu `ReferenceCode` và `SepayTransactionId` vào bảng `WalletTransactions` có Unique Index; nếu đã tồn tại thì trả `200 OK` ngay lập tức mà không cộng số dư lần 2. |
| **Race condition khi nạp & trừ tiền đồng thời** | Trung bình | Sử dụng DB Transaction bọc toàn bộ thao tác đọc & cập nhật `WalletBalance`, sử dụng Row Version / Concurrency Token hoặc Optimistic Locking. |
| **Khách hàng chuyển khoản sai nội dung** | Trung bình | Tạo mã đơn nạp ngắn gọn dễ đọc (ví dụ: `WAL 8392`). Tích hợp nút sao chép 1 chạm và hiển thị cảnh báo hướng dẫn rõ ràng trên giao diện. |
| **Đơn nạp quá hạn thanh toán** | Thấp | Đơn nạp có hạn sử dụng 15 phút. Sau 15 phút nếu chưa thanh toán sẽ chuyển trạng thái `EXPIRED`. |
