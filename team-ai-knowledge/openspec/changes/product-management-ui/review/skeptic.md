# Skeptic Review: product-management-ui

| Chiều | Điểm (1–5) | Nhận xét |
|---|---|---|
| D1 Completeness | 5 | Đã bao phủ 6 Use Cases (UC-01.1 -> UC-01.6) từ danh sách, tạo chuẩn, quy đổi ĐVT, combo, chi tiết 360 độ, phân loại nhóm hàng cây và các edge case. |
| D2 Correctness | 5 | Công thức tính giá vốn Combo và tồn khả dụng động $\min(\lfloor \text{Tồn}_i / \text{Định lượng}_i \rfloor)$ chính xác; quy tắc bất biến Base UOM và soft delete khớp với SRS. |
| D3 Coherence | 5 | Proposal, Design-brief và Specs đồng nhất hoàn toàn về cấu trúc DTO, terminology và quy ước tiền tệ VND/phân trang. |
| D4 Constraints | 5 | Đảm bảo triệt để BR-SEC-01 (che giá vốn với Cashier), BR-PROD-01 (khóa Base UOM sau giao dịch), BR-CAT-01 (kiểm tra tính duy nhất nhóm hàng) và Tenant isolation. |
| D5 Blast Radius | 4 | Tác động chủ yếu lên phân hệ FE-01 Product Catalog; các route tích hợp mượt mà vào `StoreOwnerLayout` và `AppTopNav` mà không ảnh hưởng tới Purchase Order hay Supplier. |

## Vấn đề

- [MEDIUM] REQ-01: Cần đảm bảo khi nhân viên thu ngân (Cashier) xuất file Excel hoặc in tem mã vạch, các trường nhạy cảm như Cost Price cũng phải bị che hoặc loại bỏ hoàn toàn để tránh rò rỉ dữ liệu ngoài UI bảng.  
  → Đề xuất: Trong API & Export/Print utility, áp dụng kiểm tra quyền `Role === 'StoreOwner'` trước khi map cột giá vốn.
- [LOW] REQ-02 & REQ-03: Trải nghiệm người dùng khi nhập tỷ lệ quy đổi hoặc giá bán bằng số tiền lớn (VND) có thể nhầm lẫn hàng nghìn/hàng triệu nếu không format tiền tệ theo thời gian thực (ví dụ: `20,000` thay vì `20000`).  
  → Đề xuất: Sử dụng `InputNumber` của Ant Design với `formatter` và `parser` phân tách hàng nghìn tự động.
- [LOW] REQ-06: Cây danh mục nhóm hàng có thể có nhiều cấp độ sâu (ví dụ: Đồ uống > Nước ngọt > Có ga); cần giới hạn UI hiển thị thụt đầu dòng tối đa 3 cấp để tránh vỡ giao diện trên sidebar.  
  → Đề xuất: Giới hạn độ sâu danh mục tối đa 3 cấp (Depth <= 3) trên form tạo nhóm hàng.

## Kết luận: Chấp nhận
Spec chi tiết, logic chặt chẽ, đáp ứng đầy đủ yêu cầu nghiệp vụ và kỹ thuật. Đã sẵn sàng lập kế hoạch Tasks và thực thi áp dụng code.
