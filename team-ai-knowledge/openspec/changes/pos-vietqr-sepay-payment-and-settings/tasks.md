# Kế Hoạch Triển Khai (Tasks): pos-vietqr-sepay-payment-and-settings

- [x] T1: [Backend] Định nghĩa Entity StorePaymentConfig, PaymentTransaction và các DTOs cấu hình thanh toán ngân hàng (REQ-PAY-CONFIG-01, REQ-IDEMPOTENCY-01)
- [x] T2: [Backend] Triển khai SePayWebhookController với 6 lớp bảo mật (kiểm tra Secret Token, IP Whitelist, Double-Check SePay API, Idempotency) và PaymentConfigController (REQ-WEBHOOK-SECURITY-01, REQ-IDEMPOTENCY-01)
- [x] T3: [Frontend] Xây dựng component PaymentConfigModal gồm 2 Tab: Cấu hình tài khoản ngân hàng (che mặt nạ API Key an toàn) & Cẩm nang hướng dẫn đăng ký SePay 5 bước trực quan (REQ-PAY-CONFIG-01, REQ-SEPAY-GUIDE-01)
- [x] T4: [Frontend] Tích hợp nút Bánh răng cài đặt trên PosHeader.tsx (chỉ hiển thị cho STORE_OWNER) và AppTopNav.tsx để mở nhanh PaymentConfigModal (REQ-PAY-CONFIG-01)
- [x] T5: [Frontend] Xây dựng component VietQrPaymentModal hiển thị mã VietQR động chuẩn Napas 247 và tích hợp vào quy trình thanh toán quầy PosCheckoutPage.tsx (REQ-VIETQR-CHECKOUT-01)
- [x] T6: [Frontend] Cung cấp cấu hình thanh toán mẫu cho tenant_an_nhien_02 và tenant_mt_mart_01 trong posMockData.ts để hỗ trợ trải nghiệm Offline-First hoàn hảo (REQ-PAY-CONFIG-01, REQ-VIETQR-CHECKOUT-01)
- [x] T7: [Verification] Kiểm tra build toàn diện Frontend (npm run build) và Backend (dotnet build), đảm bảo 0 lỗi biên dịch và không có warning nghiêm trọng (REQ-PAY-CONFIG-01, REQ-WEBHOOK-SECURITY-01)
