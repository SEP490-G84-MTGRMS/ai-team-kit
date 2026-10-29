# Proposal: purchase-order-grid-creation (FE-05 Ordering)

## 1. Vấn đề nghiệp vụ
Trong chuỗi siêu thị bán lẻ MT-GRMS, việc đặt hàng nhập kho cho các chi nhánh gặp các vấn đề lớn:
1. **Thiếu kế hoạch đa ngày**: Nhân viên hoặc Chủ cửa hàng chỉ có thể lập từng đơn cho một ngày cố định. Không thể nhìn tổng thể kế hoạch nhập hàng cho 1 tuần, 2 tuần hay cả tháng (tối đa 31 ngày) theo lịch giao hàng của từng nhà cung cấp.
2. **Nhầm lẫn giữa Ngày Nhập - Ngày Giao - Ngày Chốt (Cutoff)**:
   - Ngày nhập: ngày nhân viên/chủ cửa hàng thao tác trên hệ thống.
   - Ngày giao hàng (DeliveryDate): ngày nhà cung cấp dự kiến giao hàng tới chi nhánh.
   - Ngày chốt (CutoffDateTime): hạn cuối để hệ thống chốt số lượng cho một ngày giao cụ thể.
   - Khi người dùng nhập số lượng cho nhiều ngày trong tương lai (ví dụ thứ Hai nhập cho cả tuần này và tuần sau), hệ thống cũ có xu hướng gom toàn bộ thành 1 PO duy nhất hoặc khóa toàn bộ dữ liệu của tuần sau quá sớm.
3. **Xung đột điều chỉnh số lượng giữa Chi nhánh và Chủ cửa hàng**:
   - Nhân viên chi nhánh đề xuất số lượng (`EmployeeQty`).
   - Store Owner cần quyền kiểm tra, điều chỉnh (`StoreQty`).
   - Cần phân biệt rõ: `StoreQty = NULL` (chưa can thiệp, dùng EmployeeQty) và `StoreQty = 0` (chủ cửa hàng chủ động hủy mặt hàng đó khỏi PO).
   - Dữ liệu hiển thị cần làm nổi bật ô đã được Chủ cửa hàng điều chỉnh để nhân viên nhận diện rõ ràng.

## 2. Mục tiêu giải pháp
Nâng cấp và hoàn thiện màn hình **Tạo Đơn Đặt Hàng Dạng Ma Trận (Ordering Grid)** tại route `/store-owner/purchase-orders/create-matrix` tuân thủ đầy đủ đặc tả nghiệp vụ FE-05:
- **Ma trận đặt hàng đa ngày (tối đa 31 ngày / 1 tháng)**:
  - Cho phép chọn Chi nhánh nhận hàng, Nhà cung cấp (hoặc Tất cả NCC) và khoảng thời gian (7, 14, 21, 31 ngày).
  - Cho phép nhập trước số lượng cho các ngày giao hợp lệ trong phạm vi tối đa 31 ngày, miễn là từng ngày chưa qua cutoff tương ứng.
- **Mô hình 3 trường số lượng (3-tier Quantity Model)**:
  - `employee_qty`: Số lượng do nhân viên chi nhánh nhập.
  - `store_qty`: Số lượng do Chủ cửa hàng điều chỉnh (cho phép `NULL`).
  - `final_qty`: Số lượng chốt cuối cùng:
    - Nếu `store_qty === NULL` ➜ `final_qty = employee_qty`.
    - Nếu `store_qty !== NULL` ➜ `final_qty = store_qty`.
  - Hiển thị dấu hiệu trực quan (badge/màu sắc nổi bật) khi Chủ cửa hàng đã điều chỉnh, hỗ trợ xem số lượng ban đầu và khôi phục về đề xuất của nhân viên.
- **Đề xuất số lượng thông minh (Suggested Qty)**:
  - Tính toán số lượng đề xuất dựa trên tồn kho hiện tại (SOH), tốc độ bán (Sales/Day), mức an toàn (Safety Stock).
- **Quy tắc chốt đơn và Tách PO độc lập**:
  - Mỗi ngày giao hàng có thời hạn Cutoff riêng.
  - Đến cutoff của ngày nào, hệ thống chỉ chốt số lượng của ngày giao đó; các ngày giao tiếp theo vẫn tiếp tục là dữ liệu dự kiến và cho phép chỉnh sửa cho đến cutoff tương ứng.
  - Khi chốt, hệ thống tự động bóc tách thành các đơn PO độc lập theo quy tắc: **1 PO cho mỗi [Chi nhánh nhận hàng + Nhà cung cấp + Ngày giao hàng]**.
  - Không gom các ngày giao khác nhau vào chung một PO.
  - Sản phẩm có `final_qty = 0` sẽ không tạo dòng trong PO.
  - Kiểm tra tự động các ràng buộc: MOQ (Số lượng tối thiểu), Bội số đặt hàng (Order Multiple), Lead time, Ngày nghỉ/Lễ (Holidays/Blackouts), và Hạn mức tín dụng công nợ (Credit Limit).

## 3. Phạm vi (Scope)
- **In scope**:
  - Giao diện Ma trận đặt hàng Store Owner (`OrderMatrixPage` tại `/store-owner/purchase-orders/create-matrix`) và Employee (`EmployeeOrderMatrixPage`).
  - Bộ lọc đa năng 1 hàng gọn gàng: Chi nhánh, Nhà cung cấp, Khoảng thời gian (Preset 7/14/21/31 ngày, custom tối đa 31 ngày), Tìm kiếm, Bộ lọc phụ (Đã nhập, Vi phạm MOQ, Đã được Chủ điều chỉnh, Hiện SOH & Bán/ngày).
  - Bảng Ma trận động: Hiển thị ngày giao hàng, trạng thái Cutoff từng ngày (Mở / Đến hạn Cutoff / Đã chốt PO / Ngày nghỉ NCC), các ô số lượng 3 lớp với chỉ báo trực quan.
  - Modal "Chốt Đơn & Tách Purchase Order": Phân loại PO theo từng Ngày giao + NCC, hỗ trợ chọn "Chốt các ngày đã đến Cutoff" hoặc "Chốt tất cả các ngày".
  - Tiện ích: Gợi ý số lượng (Suggested Qty), Sao chép số lượng tuần trước, Xuất/Nhập bảng tính Excel (CSV/XLSX đầy đủ 3 trường SL).
  - Cập nhật tài liệu OpenSpec và bài học nghiệp vụ.
- **Out of scope**:
  - Quy trình kho nhận hàng thực tế (thuộc FE-04 Goods Receipt).

## 4. Người dùng liên quan
- **Branch Employee**: Nhân viên tại từng chi nhánh, lập kế hoạch và nhập `employee_qty` cho chi nhánh của mình.
- **Store Owner**: Chủ chuỗi/cửa hàng, có quyền xem tất cả chi nhánh, rà soát, điều chỉnh `store_qty`, quyết định chốt PO và gửi nhà cung cấp.
- **Supplier**: Nhà cung cấp nhận các đơn PO độc lập đúng ngày giao và đúng chi nhánh.

## 5. Tiêu chí thành công
- [ ] Cho phép lập kế hoạch đặt hàng cho nhiều ngày giao trong phạm vi tối đa 31 ngày trên cùng một Grid.
- [ ] Vận hành chính xác 3 trường số lượng (`employee_qty`, `store_qty`, `final_qty`), phân biệt rõ `NULL` và `0`.
- [ ] Hiển thị trực quan ô được Chủ cửa hàng ghi đè, cho phép khôi phục về số lượng nhân viên.
- [ ] Hiển thị trạng thái Cutoff rõ ràng trên từng cột ngày giao hàng.
- [ ] Nút và modal Chốt Đơn tách đúng 1 PO cho mỗi [Chi nhánh + Nhà cung cấp + Ngày giao hàng].
- [ ] Chốt đúng ngày đến hạn cutoff mà không làm khóa các ngày giao trong tương lai.
- [ ] Kiểm tra chặt chẽ MOQ, Lead time, Ngày nghỉ NCC, và hạn mức tín dụng.
- [ ] Build thành công (`npm run build`) không có lỗi TypeScript / linting.
