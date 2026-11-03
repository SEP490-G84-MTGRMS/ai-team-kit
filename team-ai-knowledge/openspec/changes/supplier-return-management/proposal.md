# Proposal: supplier-return-management

## Vấn đề
Trong hoạt động bán lẻ và quản lý chuỗi siêu thị/cửa hàng tiện lợi MT-GRMS, việc kiểm soát và xử lý hàng hóa không còn phù hợp để kinh doanh là nghiệp vụ thiết yếu. Các tình huống phát sinh thực tế gồm:
1. Hàng cận date hoặc sắp hết hạn không kịp tiêu thụ nhưng thuộc diện được nhà cung cấp (NCC) thu hồi theo hợp đồng.
2. Hàng hóa bị lỗi chất lượng, biến dạng, hư hỏng trong quá trình lưu kho cần hoàn trả.
3. Hàng giao sai quy cách, sai thỏa thuận phát hiện sau khi nhập kho.
Hiện tại, hệ thống MT-GRMS chưa có quy trình quản lý trả hàng cho nhà cung cấp (Return to Vendor - RTV), dẫn đến:
- Rủi ro thất thoát tồn kho khi nhân viên tự ý trả hàng mà không có chứng từ đối soát.
- Hàng chờ trả vẫn bị hệ thống hiểu là hàng khả dụng, dẫn đến bán nhầm hàng hỏng/cận date cho khách hàng tại quầy POS.
- Không kiểm soát được số lượng còn được phép trả theo từng lô của phiếu nhập kho gốc (Goods Receipt).

## Mục tiêu
Xây dựng phân hệ **Quản lý Trả hàng Nhà cung cấp (Supplier Return / RTV)** theo đúng tài liệu phạm vi nghiệp vụ `MT-GRMS_Pham_vi_Nghiep_vu_Tra_hang_NCC.md` V1:
1. **Nguồn gốc minh bạch**: 100% phiếu trả hàng phải bắt nguồn từ Phiếu nhập kho (Goods Receipt) đã hoàn thành (`COMPLETED`).
2. **Kiểm soát chặt chẽ theo Lô (Batch-based)**: Kiểm tra công thức giới hạn số lượng còn được phép trả:
   `AvailableReturnQty = ReceivedQty - ReturnedQty - PendingReturnQty`.
3. **Cơ chế cô lập tồn kho (Phương án B)**: Khi gửi yêu cầu trả hàng (`PENDING_SUPPLIER`), số lượng hàng này lập tức chuyển sang trạng thái chờ trả (`PENDING_RETURN`) và bị loại khỏi tồn khả dụng (`AvailableQty`), tránh bán nhầm tại POS.
4. **Quy trình phản hồi NCC**: Ghi nhận kết quả NCC phản hồi (Chấp nhận toàn bộ, Chấp nhận một phần, Từ chối). Hàng bị từ chối được giải phóng hoặc chuyển sang quy trình hủy (Write-off).
5. **Thời điểm trừ tồn kho thực tế**: Chỉ trừ tồn kho chi nhánh khi nhân viên thực hiện bàn giao thực tế (`COMPLETED`), ghi nhận giao dịch `SUPPLIER_RETURN`.
6. **Bộ ba màn hình hoàn chỉnh**:
   - Màn hình Danh sách phiếu trả hàng (`/store-owner/supplier-returns`)
   - Màn hình Tạo phiếu trả hàng (`/store-owner/supplier-returns/create`)
   - Màn hình Chi tiết phiếu trả hàng (`/store-owner/supplier-returns/:id`)

## Phạm vi (V1)
### In Scope:
- Tạo phiếu trả hàng từ phiếu nhập kho `COMPLETED`, chọn cụ thể SKU và Lô hàng.
- Ràng buộc số lượng trả không vượt quá `AvailableReturnQty`.
- Chuyển trạng thái hàng sang `PENDING_RETURN` khi gửi yêu cầu.
- Ghi nhận phản hồi NCC: `APPROVED` (kèm số lượng chấp nhận), `REJECTED`.
- Bàn giao thực tế: Nhân viên xác nhận số lượng bàn giao thực tế (`HandedOverQty <= ApprovedQty`), cập nhật trạng thái phiếu thành `COMPLETED`, trừ tồn kho `BranchStocks`.
- Hủy phiếu khi chưa bàn giao hoàn tất (`CANCELLED`), giải phóng số lượng chờ trả.
- Đính kèm ảnh/tài liệu biên bản chứng minh lỗi hàng hóa.

### Out of Scope (V1):
- Trả hàng không có phiếu nhập gốc.
- Tự động cấn trừ công nợ NCC / hoàn tiền (sẽ tích hợp trong phân hệ Tài chính AP sau).
- Tự động gửi email/EDI trực tiếp sang hệ thống của NCC (nhân viên liên hệ và ghi nhận kết quả phản hồi vào phần mềm).

## Tiêu chí thành công
- [ ] Tuân thủ 100% tài liệu `MT-GRMS_Pham_vi_Nghiep_vu_Tra_hang_NCC.md`.
- [ ] Backend API đầy đủ: Controller, Service, Repository, DTOs, Unit tests đạt 100% pass.
- [ ] Frontend UI React 19 chuẩn B2B SaaS đẹp mắt, responsive, kết nối API backend mượt mà.
- [ ] Tồn kho chỉ giảm khi bàn giao hoàn tất; hàng chờ trả không thể bán tại POS.
