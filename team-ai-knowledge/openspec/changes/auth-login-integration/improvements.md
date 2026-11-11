# Improvements: auth-login-integration

## Spec · 2026-10-13 03:54

Đã bổ sung danh sách 9 test cases chi tiết gồm input/output cho MT_GRMS_BACKEND

## Brainstorm · 2026-10-13 04:22

Đã đặc tả đầy đủ 3 tài liệu exploration.md, design-brief.md và specs.md định dạng delta cho auth-login-integration

## Verify Spec · 2026-10-13 04:29

Đã phản biện theo persona skeptic và bóc tách 9 task chi tiết trong tasks.md

## Brainstorm · 2026-11-09 11:21

Chuyển đổi toàn diện sang HttpOnly Cookie cho cả Access Token và Refresh Token, loại bỏ 100% localStorage khỏi client, tích hợp GET /api/auth/me và Silent Refresh Axios Queue.

## Verify Spec · 2026-11-09 11:25

Đã hoàn tất rà soát skeptic review và lập danh sách tasks chi tiết cho cả Backend và Frontend loại bỏ 100% localStorage sang HttpOnly Cookie.

## Spec · 2026-11-11 12:45

Đã bổ sung luật bắt buộc tìm & cập nhật spec cũ thay vì tạo change mới / refactor tràn lan

## Brainstorm · 2026-11-11 12:48

Cập nhật đặc tả chi tiết cho Email OTP 2FA Đăng nhập và Đăng ký cửa hàng, bỏ TextBee SMS

## Verify Spec · 2026-11-11 12:52

Bóc tách 12 tasks rõ ràng cho luồng Email OTP 2FA đăng nhập và đăng ký cửa hàng

## Brainstorm · 2026-11-11 16:12

Sau refactor spec, kiểm tra định dạng delta và đủ requirement/API contract trước khi lưu artifact.
