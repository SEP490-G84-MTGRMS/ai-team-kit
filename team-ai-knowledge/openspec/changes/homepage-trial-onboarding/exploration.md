# Exploration: Homepage Trial Onboarding

## 1. Problem Statement

Trang chủ đang tạo kỳ vọng sai về việc dùng thử: CTA mở một form cục bộ ghi 14 ngày và báo thành công dù không tạo tài khoản, tenant hay subscription. Trong khi đó, luồng đăng ký thật đã có Email OTP và backend hiện khởi tạo tenant ở gói `TRIAL` với thời hạn 3 ngày. Cần thống nhất điểm vào dùng thử để trạng thái người dùng nhìn thấy phản ánh đúng dữ liệu đã được lưu.

## 2. Context & Background

- Change phụ thuộc: `proposal.md` của `homepage-trial-onboarding`.
- HomePage có nhiều điểm gọi Trial: Navbar, Hero, CTA banner và nút chat; tất cả đang mở `TrialModal`.
- `TrialModal` chỉ xử lý state phía client, dùng nội dung 14 ngày và danh mục gói/giá cũ.
- Trang `/auth/register` đã thu thập đầy đủ thông tin, gửi Email OTP và đăng ký Store Owner.
- Backend đăng ký hiện tạo đồng thời user, tenant, chi nhánh chính và gán `CurrentPlan = TRIAL`, `SubscriptionExpiresAt = UTC now + 3 days`.
- Backend còn có hành động kích hoạt Trial riêng; nếu thiếu ràng buộc lịch sử, hành động lặp có nguy cơ đặt lại thời hạn Trial.
- Chính sách được người dùng xác nhận: Trial chỉ là gói `TRIAL`, đúng 3 ngày.

## 3. Constraints

- Không được bỏ qua Email OTP khi tạo tài khoản/gian hàng mới.
- Không được dùng dữ liệu tenant, thời hạn hoặc PlanCode do trình duyệt tự quyết định.
- Không được trừ ví, yêu cầu thẻ hoặc tự động chuyển sang gói trả phí.
- Mọi hành động theo tenant phải dựa trên phiên đăng nhập và phân quyền Store Owner.
- Phải giữ nguyên giá và hành vi mua STANDARD/PRO.
- Trial phải an toàn khi người dùng bấm nhiều lần, gửi lại request hoặc thao tác đồng thời.
- Nội dung công khai phải thống nhất 3 ngày trên desktop và responsive.

## 4. Assumptions

- **[ASSUMPTION]**: Mỗi tài khoản Store Owner mới tạo một tenant mới, một chi nhánh chính và tự bắt đầu gói TRIAL trong cùng giao dịch, dù truy cập trang đăng ký trực tiếp hay từ CTA dùng thử.
- **[ASSUMPTION]**: Email OTP đăng ký thành công đồng nghĩa email của tài khoản đã được xác minh.
- **[ASSUMPTION]**: `intent=trial` chỉ là ngữ cảnh trình bày/analytics phía frontend; backend không dùng query này để quyết định quyền lợi.
- **[ASSUMPTION]**: Tài khoản đã đăng nhập có thể xác định tenant và trạng thái subscription từ phiên/API hiện có.
- **[ASSUMPTION]**: Tenant đã dùng Trial hoặc đã chuyển sang gói trả phí không được quay lại Trial.
- **[ASSUMPTION]**: Ba ngày được tính theo 72 giờ từ thời điểm backend kích hoạt thành công, lưu UTC.
- **[ASSUMPTION]**: Các tenant tồn tại trước khi triển khai được xem là đã sử dụng Trial để tránh cấp lại ngoài ý muốn.

## 5. Scope & Non-Goals

### In Scope

- Thống nhất hành vi của mọi CTA dùng thử trên HomePage.
- Tái sử dụng luồng đăng ký và Email OTP thật.
- Điều hướng theo trạng thái chưa đăng nhập, đang Trial, Trial đã hết và gói trả phí.
- Ghi nhận bền vững việc Trial đã được cấp ngay trong đăng ký.
- Ngăn mọi endpoint cũ kích hoạt/cộng ngày Trial lặp.
- Chuẩn hóa nội dung thành Trial 3 ngày.

### Out of Scope (Non-Goals)

- Không thay đổi giá, quota hoặc quyền lợi STANDARD/PRO.
- Không xây dựng onboarding nhập hàng mẫu hay liên hệ Zalo.
- Không sửa cơ chế 2FA đăng nhập.
- Không thiết kế lại toàn bộ HomePage hoặc trang Subscription.
- Không bổ sung thanh toán, thẻ hoặc auto-renew.
- Không cấp lại Trial cho tenant cũ.

## 6. Các hướng tiếp cận sản phẩm

### Phương án A — Giữ form Trial riêng trên HomePage

- **Ưu điểm**: Người dùng nhập ít trường ngay trên trang chủ; số bước cảm nhận ban đầu ngắn.
- **Nhược điểm**: Trùng dữ liệu với trang đăng ký, dễ lệch validation/OTP, khó giải thích trạng thái đăng nhập và tiếp tục tạo mật khẩu; nguy cơ duy trì hai luồng onboarding khác nhau.

### Phương án B — CTA dẫn thẳng tới trang đăng ký hiện có

- **Ưu điểm**: Một nguồn biểu mẫu và validation, dùng lại Email OTP thật, giảm nhầm lẫn và chi phí bảo trì.
- **Nhược điểm**: Cần truyền rõ ngữ cảnh Trial và xử lý người đã đăng nhập để tránh đưa họ quay lại form đăng ký.

### Phương án C — Một quy tắc đăng ký, điều hướng theo trạng thái

- Mọi đăng ký gian hàng mới đều tự nhận TRIAL 3 ngày; `intent=trial` chỉ đổi nội dung UI/analytics. Người đã đăng nhập được chuyển tới Dashboard hoặc trang gói theo trạng thái subscription, không có bước kích hoạt Trial lần hai.
- **Ưu điểm**: Một nguồn đăng ký và một invariant backend; loại bỏ trạng thái trung gian và nguy cơ cộng lại ngày Trial.
- **Nhược điểm**: Cần backfill lịch sử tenant cũ và vô hiệu hóa hành vi cấp Trial của endpoint cũ.

## 7. Phương án chọn và lý do

Chọn **Phương án C** với invariant: mọi đăng ký gian hàng thành công đều nhận đúng một TRIAL 3 ngày ngay trong transaction đăng ký. Đây là phương án đơn giản nhất vì không tồn tại tenant mới ở trạng thái chờ kích hoạt; HomePage chỉ là điểm vào/điều hướng và endpoint cũ không còn quyền cấp hoặc kéo dài Trial.

## 8. Rủi ro và cách giảm

- **Kích hoạt lại Trial**: lưu dấu Trial ngay khi đăng ký; endpoint cũ chỉ trả lại trạng thái ACTIVE hoặc từ chối, không cấp mới.
- **Hai request đồng thời**: áp dụng idempotency và ràng buộc dữ liệu để chỉ một request thay đổi trạng thái.
- **Tenant cũ thiếu dấu Trial**: backfill theo hướng an toàn, xem là đã dùng Trial.
- **State frontend cũ**: luôn xác nhận trạng thái bằng API/session thay vì chỉ dùng local storage.
- **Nội dung 14 ngày còn sót**: kiểm kê tất cả CTA và chuỗi Trial trên HomePage trong acceptance test.
- **OTP gửi thành công nhưng đăng ký lỗi**: không đánh dấu Trial trước khi giao dịch tạo user/tenant/branch hoàn tất.

## 9. Success Criteria

- Không còn luồng HomePage báo kích hoạt thành công khi chưa lưu dữ liệu.
- Tài khoản mới chỉ vào Dashboard sau Email OTP và tạo tenant thành công.
- Tenant nhận đúng một kỳ `TRIAL` dài 72 giờ.
- Request lặp không thay đổi ngày hết hạn hoặc phát sinh tenant/branch/user trùng.
- Người dùng quay lại được điều hướng đúng theo subscription hiện tại.
