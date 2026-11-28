# EXP-2026-11-14-001: Chuẩn hóa chốt ca và chốt ngày kinh doanh

## 1. Problem Statement

MT-GRMS đã có luồng mở/chốt ca, thu/chi két và khóa ngày nghiệp vụ, nhưng cách hiểu và cách tổng hợp dữ liệu chưa thống nhất hoàn toàn giữa nghiệp vụ, backend và frontend:

- Phiếu chi từ két làm giảm tiền mặt nhưng dễ bị hiểu hoặc hiển thị như làm giảm doanh thu bán hàng.
- Tiền nộp từ két ca về két chủ/két sắt đang được diễn đạt gần với “chi tiền”, trong khi bản chất là chuyển quỹ nội bộ.
- Frontend vẫn bắt buộc “người nhận ca tiếp theo” dù tiền giữ lại thuộc két/điểm bán và một ca có thể có nhiều nhân viên hoạt động.
- Frontend tự suy ra ngày kinh doanh từ thời gian mở ca, có nguy cơ lệch với `BusinessDate` do backend xác định theo cấu hình chi nhánh.
- Chốt ngày đang gộp doanh thu và thu/chi vào Cashbook, cần bảo đảm không ghi trùng các giao dịch đã được kết toán ở cấp ca.
- Ngày đã chốt chưa có luồng mở lại/điều chỉnh có kiểm soát và bảo toàn snapshot lịch sử.
- Validation backend/frontend chưa cùng một hợp đồng cho mọi trường và mọi trạng thái.

Nếu không chuẩn hóa, báo cáo doanh thu, số dư két, chi phí và đối soát ngày có thể đúng riêng lẻ ở một số ca nhưng sai khi tổng hợp hoặc gây hiểu nhầm cho chủ cửa hàng.

## 2. Context & Background

Nguồn nghiệp vụ chính: `chot-ca-chot-doanh-thu-ngay.md`.

Hiện trạng code đã khảo sát:

- Backend có `ShiftService`, `ShiftZReport`, `ShiftCashMovement`, API bắt đầu kiểm đếm, hủy kiểm đếm, xác nhận đóng ca và force-close.
- Công thức hiện tại đã có dạng `OpeningFloat + CashSales + TotalCashIn - TotalCashOut`; phiếu chờ duyệt chưa làm giảm két.
- Backend có `BusinessDateResolver`, cấu hình `Branch.BusinessDayStartTime`, `BusinessDayClosingService`, entity `BusinessDayClosing` và endpoint `POST /api/business-days/close`.
- Chốt ngày hiện chặn ca mở, bàn giao chưa xác nhận, phiếu chờ duyệt, snapshot chưa khóa và đơn PendingPayment.
- Frontend có `CloseShiftModal`, `PosShiftPage` và `posShiftApi.closeBusinessDay`.
- `CloseShiftModal` hiện yêu cầu `receiverUserId`, hiển thị thuật ngữ `Pending Handover` và thông báo kỹ thuật “Invariant”.
- `PosShiftPage` tự tính ngày nghiệp vụ từ `openedAtUtc`, thay vì dùng giá trị `BusinessDate` do backend trả về.
- Unit test backend đã có nhiều trường hợp tiền vào/ra, pending approval và phân bổ tiền, nhưng chưa bao phủ đầy đủ doanh thu không đổi bởi chi phí, chuyển quỹ nội bộ, khóa/mở lại ngày và isolation.

Spec gốc `pos-shift-management` đã bao phủ một phần quản lý ca, tiền két và nhiều nhân viên; change này mở rộng và chuẩn hóa thay vì tạo một phân hệ độc lập.

## 3. Constraints

- Giữ kiến trúc Clean Architecture .NET 8 và cấu trúc feature React/TypeScript hiện có.
- Tiền VND dùng `decimal(18,2)` ở backend; frontend không được làm tròn gây sai lệch hợp đồng.
- Thời gian lưu UTC, hiển thị theo Asia/Ho_Chi_Minh.
- Mọi truy vấn phải phân lập theo tenant và chi nhánh; không được truy cập dữ liệu tenant khác.
- Chốt ca/chốt ngày là thao tác tài chính, phải có idempotency và transaction.
- Không sửa migration đã merge; thay đổi schema phải dùng migration mới.
- Không ghi lại doanh thu, thu/chi hoặc chuyển quỹ lần hai khi chốt ngày.
- Frontend validation chỉ hỗ trợ trải nghiệm; backend vẫn là nguồn xác thực cuối cùng.
- Các thay đổi phải tương thích dữ liệu ca và snapshot hiện có.

## 4. Assumptions

- **[ASSUMPTION]**: `BusinessDayStartTime` được cấu hình theo chi nhánh và mặc định 06:00 nếu chưa cấu hình.
- **[ASSUMPTION]**: Một ca thuộc một tenant, một chi nhánh và một két/điểm bán; nhiều nhân viên có thể tham gia cùng ca.
- **[ASSUMPTION]**: Chỉ phiếu tiền mặt ở trạng thái đã hoàn tất mới ảnh hưởng số dư két.
- **[ASSUMPTION]**: Phiếu chi vận hành ảnh hưởng chi phí và tiền mặt, không điều chỉnh doanh thu bán hàng.
- **[ASSUMPTION]**: Tiền nộp két chủ/két sắt vẫn thuộc tài sản cửa hàng và là luân chuyển nội bộ.
- **[ASSUMPTION]**: Người mở ca sau xác nhận tiền đầu ca; không cần biết trước cá nhân nhận ca tại thời điểm đóng ca trước.
- **[ASSUMPTION]**: Chủ cửa hàng/Admin là các vai trò được chốt ngày và phê duyệt điều chỉnh ngày đã khóa.
- **[ASSUMPTION]**: Chênh lệch quỹ được ghi nhận để xử lý, không tự động sửa doanh thu hoặc tạo chi phí.
- **[ASSUMPTION]**: Đơn hoàn/hủy hợp lệ đã có trạng thái và dữ liệu thanh toán đủ để điều chỉnh doanh thu và dòng tiền đúng phương thức.

## 5. Scope & Non-Goals

### In Scope

- Chuẩn hóa công thức và cách phân loại doanh thu, thu/chi, hoàn tiền, chuyển quỹ và chênh lệch.
- Chuẩn hóa toàn bộ validation của chốt ca và chốt ngày ở backend/frontend.
- Dùng `BusinessDate` nhất quán giữa đơn hàng, ca và snapshot ngày.
- Không bắt buộc người nhận ca tiếp theo; truy vết nhiều người tham gia ca bằng hoạt động thực tế.
- Khóa ngày kinh doanh và bổ sung quy trình điều chỉnh có audit log, không sửa mất snapshot cũ.
- Bổ sung khả năng xem trước/tổng hợp số liệu chốt ngày trước khi xác nhận.
- Bổ sung unit test và kiểm tra frontend liên quan.

### Out of Scope (Non-Goals)

- Không xây dựng hệ thống kế toán kép hoặc sổ cái tổng hợp mới.
- Không thay đổi thuật toán giá vốn, thuế, bảng lương hoặc công nợ ngoài dữ liệu cần đọc.
- Không tích hợp ngân hàng hoặc phương thức thanh toán mới.
- Không tự động quy trách nhiệm hoặc khấu trừ lương khi thiếu quỹ.
- Không xây dựng ứng dụng mobile native.
- Không thay thế toàn bộ module Cashbook.
- Không cho phép sửa trực tiếp snapshot đã khóa mà không có lịch sử phiên bản.

## 6. Các hướng xử lý được cân nhắc

### Phương án A — Chỉ sửa giao diện và công thức hiển thị

Ưu điểm:

- Phạm vi nhỏ, triển khai nhanh.
- Ít ảnh hưởng dữ liệu hiện hữu.

Nhược điểm:

- API vẫn cho phép dữ liệu không thống nhất hoặc gọi trực tiếp bỏ qua frontend.
- Không giải quyết BusinessDate, ghi trùng Cashbook, audit và isolation.
- Unit test không bảo vệ được các quy tắc tài chính cốt lõi.

### Phương án B — Chuẩn hóa xuyên suốt ca và ngày kinh doanh

Ưu điểm:

- Một bộ quy tắc thống nhất từ dữ liệu nguồn, backend tới frontend.
- Có thể kiểm thử từng quy tắc và ngăn sai lệch khi gọi API trực tiếp.
- Giữ được lịch sử và truy vết tài chính.

Nhược điểm:

- Phạm vi thay đổi rộng hơn.
- Cần kiểm tra tương thích dữ liệu/snapshot cũ và đồng thời khi đóng ca, duyệt phiếu, chốt ngày.

### Phương án C — Thay mới hoàn toàn module ca và sổ quỹ

Ưu điểm:

- Có thể thiết kế lại mô hình lý tưởng từ đầu.

Nhược điểm:

- Rủi ro migration và hồi quy rất cao.
- Trùng lặp nhiều chức năng đã tồn tại.
- Vượt phạm vi và không phù hợp tiến độ dự án.

### Phương án chọn

Chọn **Phương án B**: chuẩn hóa xuyên suốt trên các luồng hiện có. Phương án này giải quyết đúng rủi ro toàn vẹn tài chính mà vẫn tái sử dụng entity, service, API và UI hiện hữu; tránh thay mới toàn bộ module.

## 7. Rủi ro và cách giảm thiểu

| Rủi ro | Ảnh hưởng | Giảm thiểu |
|---|---|---|
| Ghi trùng doanh thu/thu chi giữa chốt ca và chốt ngày | Số dư Cashbook bị đội lên | Xác định một nguồn posting, dùng trạng thái posting và idempotency |
| Frontend/backend tính BusinessDate khác nhau | Chốt nhầm ngày hoặc bỏ sót ca | Backend trả BusinessDate chính thức; frontend không tự suy luận |
| Chốt ca đồng thời với duyệt phiếu chi | Snapshot không nhất quán | Transaction/concurrency check và kiểm tra lại trạng thái trước commit |
| Request chốt gửi lại | Tạo nhiều snapshot/chuyển quỹ | Idempotency key và unique constraint phù hợp |
| Dữ liệu lịch sử thiếu trường mới | Trang lịch sử lỗi | Trường nullable/default và mapping tương thích |
| Điều chỉnh ngày đã khóa làm mất lịch sử | Không audit được | Tạo phiên bản điều chỉnh, giữ snapshot cũ bất biến |
| Sai tenant/branch | Rò rỉ hoặc sửa dữ liệu cửa hàng khác | Lọc tenant bắt buộc, kiểm tra branch ownership và test negative |
| UI quá nhiều thuật ngữ kế toán | Người dùng thao tác sai | Chia khối nghiệp vụ và dùng nhãn tiếng Việt trực tiếp |

## 8. Success Criteria

- Phiếu chi thực trả làm giảm tiền két nhưng doanh thu bán hàng không đổi.
- Chuyển két ca sang két chủ không tạo chi phí và không thay đổi tổng tiền chi nhánh.
- Backend/frontend cùng từ chối dữ liệu phân bổ hoặc trường nhập không hợp lệ.
- Frontend dùng BusinessDate từ backend và hiển thị đúng ca qua nửa đêm.
- Không chốt ngày khi còn ca/giao dịch bắt buộc xử lý.
- Chốt ngày không tạo trùng các bút toán đã posting.
- Điều chỉnh ngày đã khóa có quyền, lý do và lịch sử trước/sau.
- Unit test bao phủ case chính, biên, trùng request, đồng thời, sai quyền và khác tenant.
