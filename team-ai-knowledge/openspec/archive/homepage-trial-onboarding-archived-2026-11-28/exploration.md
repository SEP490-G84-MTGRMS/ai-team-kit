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

- **[ASSUMPTION]**: Đăng ký thường tạo tài khoản, tenant và chi nhánh ở trạng thái `NO_PLAN`; đăng ký từ CTA với yêu cầu Trial tạo cùng dữ liệu và bắt đầu TRIAL trong transaction.
- **[ASSUMPTION]**: Email OTP đăng ký thành công đồng nghĩa email của tài khoản đã được xác minh.
- **[ASSUMPTION]**: `intent=trial` là ngữ cảnh UI để frontend gửi yêu cầu bắt đầu Trial; backend vẫn tự quyết định eligibility, PlanCode và 72 giờ.
- **[ASSUMPTION]**: Mỗi tài khoản chỉ được hưởng Trial một lần trên toàn hệ thống, đồng thời mỗi tenant cũng chỉ có một Trial.
- **[ASSUMPTION]**: Tài khoản đã đăng nhập có thể xác định tenant và trạng thái subscription từ phiên/API hiện có.
- **[ASSUMPTION]**: Tenant đã dùng Trial hoặc đã chuyển sang gói trả phí không được quay lại Trial.
- **[ASSUMPTION]**: Ba ngày được tính theo 72 giờ từ thời điểm backend kích hoạt thành công, lưu UTC.
- **[ASSUMPTION]**: Các tenant tồn tại trước khi triển khai được xem là đã sử dụng Trial để tránh cấp lại ngoài ý muốn.

## 5. Scope & Non-Goals

### In Scope

- Thống nhất hành vi của mọi CTA dùng thử trên HomePage.
- Tái sử dụng luồng đăng ký và Email OTP thật.
- Điều hướng theo trạng thái chưa đăng nhập, đang Trial, Trial đã hết và gói trả phí.
- Hỗ trợ tenant `NO_PLAN` chủ động chọn bắt đầu Trial hoặc mua gói trả phí.
- Ghi nhận bền vững việc Trial đã dùng theo cả tài khoản và tenant.
- Ngăn kích hoạt/cộng ngày Trial lặp hoặc tạo tenant khác để nhận Trial mới.
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

### Phương án C — Đăng ký tách biệt với lựa chọn Trial

- Đăng ký thường tạo tenant `NO_PLAN`; người dùng tự chọn Trial hoặc gói trả phí. CTA Dùng thử truyền ngữ cảnh để Trial tự bắt đầu ngay sau OTP. Người đã đăng nhập được điều hướng theo trạng thái.
- **Ưu điểm**: Không làm mất thời gian Trial của người chỉ tạo tài khoản; CTA dùng thử vẫn vào trải nghiệm ngay; thể hiện rõ sự đồng ý bắt đầu đếm 72 giờ.
- **Nhược điểm**: Có thêm trạng thái `NO_PLAN` và phải kiểm tra Trial một lần theo cả account lẫn tenant.

## 7. Phương án chọn và lý do

Chọn **Phương án C** với hai nhánh rõ ràng: đăng ký thường tạo `NO_PLAN`, còn CTA Dùng thử yêu cầu bắt đầu TRIAL ngay sau OTP. Tenant `NO_PLAN` có thể chủ động bắt đầu Trial sau đó, nhưng backend chỉ chấp nhận khi cả account và tenant chưa từng dùng Trial.

## 8. Rủi ro và cách giảm

- **Kích hoạt lại Trial**: lưu dấu sử dụng trên cả User và Tenant trong cùng transaction; ràng buộc account một lần, tenant một lần.
- **Hai request đồng thời**: áp dụng idempotency và ràng buộc dữ liệu để chỉ một request thay đổi trạng thái.
- **Tenant cũ thiếu dấu Trial**: backfill theo hướng an toàn, xem là đã dùng Trial.
- **State frontend cũ**: luôn xác nhận trạng thái bằng API/session thay vì chỉ dùng local storage.
- **Nội dung 14 ngày còn sót**: kiểm kê tất cả CTA và chuỗi Trial trên HomePage trong acceptance test.
- **OTP gửi thành công nhưng đăng ký lỗi**: không đánh dấu Trial trước khi giao dịch tạo user/tenant/branch hoàn tất.

## 9. Success Criteria

- Không còn luồng HomePage báo kích hoạt thành công khi chưa lưu dữ liệu.
- Đăng ký thường sau OTP tới trang chọn gói với tenant `NO_PLAN`; không bắt đầu đếm Trial.
- Đăng ký từ CTA sau OTP vào Dashboard với TRIAL 72 giờ.
- Mỗi account và mỗi tenant nhận tối đa một kỳ `TRIAL`.
- Request lặp không thay đổi ngày hết hạn hoặc phát sinh tenant/branch/user trùng.
- Người dùng quay lại được điều hướng đúng theo subscription hiện tại.
