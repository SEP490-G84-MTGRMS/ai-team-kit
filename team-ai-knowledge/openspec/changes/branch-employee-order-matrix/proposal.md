# Proposal: branch-employee-order-matrix

## 1. Vấn đề
Hiện tại hệ thống MT-GRMS đã hoàn thiện màn hình đặt hàng ma trận (`OrderMatrixPage` tại `/store-owner/purchase-orders/create-matrix`) phục vụ cấp Quản trị viên / Chủ cửa hàng (Store Owner), cho phép linh hoạt chọn bất kỳ chi nhánh nào qua dropdown filter.

Tuy nhiên, nhân viên tại từng chi nhánh (Branch Employee / Chi nhánh cơ sở) chỉ có quyền hạn và trách nhiệm tạo kế hoạch đặt hàng cho **chính chi nhánh của mình**. Việc giữ dropdown chọn chi nhánh là không phù hợp với phân quyền thực tế và dễ gây nhầm lẫn khi thao tác nhập hàng. Do đó, hệ thống cần một màn hình đặt hàng ma trận riêng cho nhân viên chi nhánh, kế thừa toàn bộ trải nghiệm bảng ma trận nhưng khóa chặt phạm vi chi nhánh.

## 2. Mục tiêu
- Cung cấp màn hình Đặt hàng ma trận (Order Matrix) dành riêng cho Nhân viên chi nhánh (`Branch Employee`).
- Kế thừa toàn bộ logic nghiệp vụ đặt hàng ma trận mạnh mẽ: lập lịch đặt hàng theo ngày giao (Lead time, lịch giao NCC), kiểm tra ngưỡng MOQ, cảnh báo đặt hàng, tính toán tổng chi phí và công nợ, sao chép tuần trước, xuất/nhập bảng tính Excel.
- Tối ưu thanh công cụ lọc (`FilterBar`): **loại bỏ hoàn toàn dropdown chuyển đổi chi nhánh**, cố định chi nhánh theo tài khoản/ngữ cảnh chi nhánh của nhân viên.
- Tuân thủ nghiêm ngặt bộ quy chuẩn thiết kế `RULE_UI_DESIGN_SYSTEM.md` vừa được thiết lập.

## 3. Phạm vi (Scope)
### In scope:
- Tạo trang `EmployeeOrderMatrixPage` và cấu hình route cho nhân viên (ví dụ `/employee/purchase-orders/create-matrix` hoặc route tương ứng trong kiến trúc layout POS/Employee).
- Tái sử dụng và cấu hình component `OrderMatrixFilterBar` ở chế độ `isBranchFixed: true` (hoặc ẩn dropdown Branch Selector, chỉ hiển thị thông tin chi nhánh hiện tại dạng badge cố định nếu cần).
- Đảm bảo đầy đủ các chức năng nghiệp vụ ma trận:
  - Chọn Nhà cung cấp (hoặc Tất cả NCC).
  - Lọc theo danh mục sản phẩm, từ khóa tìm kiếm, bộ lọc phụ (chỉ hiện sản phẩm vi phạm MOQ, chỉ hiện sản phẩm đã đặt, ẩn/hiện tồn kho thực tế SOH).
  - Điều hướng tuần (Tuần này, dịch chuyển tuần, sao chép đơn tuần trước).
  - Bảng ma trận nhập số lượng theo ngày giao hợp lệ (tự động khóa ngày nghỉ, ngày lễ, ngày vi phạm lead time).
  - Tổng kết giá trị đơn hàng, kiểm tra MOQ và hạn mức công nợ.
  - Các thao tác: Lưu nháp (Save draft), Gửi đơn đặt hàng (Submit order), Xuất/Nhập Excel.
- Đảm bảo responsive, layout compact data-dense và không bị tràn viewport.

### Out of scope:
- Tích hợp hệ thống Authentication / JWT RBAC backend phức tạp (sẽ dùng context chi nhánh hiện tại / mock session cho giao diện).
- Quy trình duyệt đơn nâng cao từ phía Store Owner (thuộc phạm vi chức năng phê duyệt đơn hàng riêng).

## 4. Người dùng liên quan
- **Nhân viên chi nhánh (Branch Employee / Staff)**: Người trực tiếp kiểm đếm nhu cầu hàng hóa và lên đơn đặt hàng định kỳ cho chi nhánh.
- **Chủ cửa hàng (Store Owner)**: Người theo dõi và phê duyệt đơn đặt hàng được nhân viên chi nhánh gửi lên.

## 5. Tiêu chí thành công
- [ ] Giao diện Đặt hàng ma trận nhân viên hiển thị đúng tại route quy định và liên kết điều hướng mượt mà.
- [ ] Thanh filter toolbar không có dropdown đổi chi nhánh; chi nhánh được cố định chính xác theo ngữ cảnh của nhân viên.
- [ ] Toàn bộ logic tính toán (tổng số lượng, tổng tiền, kiểm tra MOQ, trạng thái ngày giao khóa/mở) hoạt động đồng nhất 100% với phiên bản Store Owner.
- [ ] Giao diện đáp ứng đầy đủ tiêu chuẩn UI Design System (bảng gọn gàng, nút bấm rõ ràng, phân cấp màu sắc hài hòa, không clipping).
- [ ] Dự án build thành công (`npm run build`), không có lỗi TypeScript hoặc linting.
