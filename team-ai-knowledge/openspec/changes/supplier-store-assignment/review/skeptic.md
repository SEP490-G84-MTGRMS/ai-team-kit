# Review: skeptic persona

## 1. Các rủi ro tiềm ẩn (Identified Risks)
1. **Rủi ro ảnh hưởng tới quy trình tạo PO**:
   - Nếu một chi nhánh bị hủy gán khỏi NCC, nhân viên chi nhánh có thể không tìm thấy NCC đó nữa khi tạo PO mới.
   - *Biện pháp*: Đảm bảo các đơn PO đang ở trạng thái Pending hoặc Approved vẫn tiếp tục được xử lý bình thường.
2. **Rủi ro trùng lặp dữ liệu (Duplicate Assignment)**:
   - Khi gán hàng loạt nhiều chi nhánh cho một NCC, nếu một chi nhánh đã được gán trước đó thì có thể gây lỗi Unique Constraint.
   - *Biện pháp*: Phía Backend và Frontend cần lọc `Distinct` và kiểm tra trùng trước khi `Add` mới.
3. **Độ trễ khi tải danh mục chi nhánh lớn**:
   - Một chuỗi lớn có thể có hàng chục chi nhánh và hàng trăm NCC, tạo ra hàng nghìn liên kết.
   - *Biện pháp*: Bắt buộc phân trang từ phía API (Paging với pageSize mặc định là 12), không load all vào client.

## 2. Kết luận
Spec và thiết kế đáp ứng đầy đủ tính an toàn, bảo mật multi-tenancy và tính khả thi kỹ thuật.
Đạt tiêu chuẩn phê duyệt bước Verify Spec.
