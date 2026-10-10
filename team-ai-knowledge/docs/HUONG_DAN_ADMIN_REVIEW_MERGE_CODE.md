# HƯỚNG DẪN DÀNH CHO ADMIN / TECH LEAD: QUẢN LÝ TIẾN ĐỘ, REVIEW & MERGE CODE QUA AI TEAM KIT

> **Dự án**: Multi-Tenant Grocery Retail Management System (MT-GRMS)  
> **Áp dụng cho**: Admin, Project Manager (PM), Backend Lead, Frontend Lead  
> **Hệ thống trung tâm**: [`ai-team-kit/team-ai-knowledge`](../README.md)

---

## 1. Tổng Quan Cơ Chế Quản Lý Mới

Hệ thống ghi log thủ công trước đây trong từng thư mục riêng lẻ (`MT_GRMS_BACKEND/docs/worklogs` và `MT_GRMS_FRONTEND/docs/worklogs`) đã được **chuyển giao toàn diện sang AI Team Kit**.

### Ưu điểm vượt trội:
1. **Phân chia theo từng người**: Mỗi Change gắn với một `assignee` cụ thể, không còn tình trạng dẫm chân lên nhau.
2. **Review đa chiều tự động trước khi code**: Kích hoạt các persona (Skeptic, Codebase, Guardian, Advocate) phát hiện lỗi ngay từ khâu thiết kế.
3. **Minh bạch những gì đã làm**: Quản lý từng dòng việc qua `tasks.md` checklist và `test-report.md` (yêu cầu `PASS`).
4. **Hỗ trợ Admin merge code an toàn**: Admin có dashboard theo dõi tập trung, xem chi tiết từng change và nghiệm thu trước khi bấm merge PR.

---

## 2. Phân Chia Nhiệm Vụ Theo Từng Thành Viên

| Thành viên | Vai trò | Trách nhiệm chính trong MT-GRMS | Thay đổi trong OpenSpec |
|---|---|---|---|
| **Đức** (`@Ortus24`) | Backend Lead | ARCH, FE-02 (Lô & Hạn FEFO), FE-04 (Kiểm kê), FE-05 (Nhập kho), FE-06 (Xuất hủy), FE-09 (Nhà cung cấp), FE-16 (Xả hàng) | `fefo-batch-tracking`, `purchase-order-...`, `supplier-management` |
| **Tâm** | Frontend Lead | ARCH, FE-01 (Quản lý hàng hóa Catalog, bảng dữ liệu, bộ lọc) | `product-catalog-...` |
| **Sơn** | Fullstack Dev | FE-03 (Bảng giá), FE-14 (Khuyến mãi), FE-18 (Chi nhánh), FE-22 (Audit Log), FE-23 (In mã vạch), FE-24 (Thông báo), FE-26 (Sao lưu) | Thay đổi gán theo `@son` |
| **An** | Backend / Financial | FE-07 (Dịch vụ), FE-08 (CRM & Khách hàng), FE-10 (Dashboard), FE-11 (Nhân viên), FE-17 (Sổ quỹ & Thuế), FE-25 (Tích hợp bên thứ 3) | Thay đổi gán theo `@an` |
| **Nhật** | Fullstack Dev | FE-12 (Bán hàng POS), FE-13 (Đổi trả), FE-15 (Web Mini), FE-19 (Phân quyền RBAC), FE-20 (SaaS Tenant), FE-21 (AI Giỏ hàng) | `cart-checkout-bug`, `auth-login-feature`, `user-management` |

---

## 3. Các Lệnh CLI Quan Trọng Cho Admin

Chạy trong thư mục `ai-team-kit/team-ai-knowledge`:

### 3.1. Xem tổng thể tiến độ của toàn bộ thành viên
```bash
npm run sep -- list --all
```
*Kết quả hiển thị dạng bảng: Tên Change | Người phụ trách (Assignee) | Loại schema | Bước hiện tại | Tỷ lệ hoàn thành (Compliance %) | Việc cần làm tiếp theo.*

### 3.2. Lọc riêng công việc của một thành viên
```bash
npm run sep -- list --user=@Ortus24
```

### 3.3. Xem chi tiết tiến độ và checklist của một Change
```bash
npm run sep -- status <tên-change>
```
*Lệnh này hiển thị chi tiết: Bước đang đứng, các persona review đã hoàn thành chưa, bao nhiêu task trong `tasks.md` đã tick `[x]`, và kết quả test.*

---

## 4. Quy Trình 4 Bước Cho Admin Khi Duyệt & Merge Pull Request

Khi một thành viên mở Pull Request trên GitHub (Backend hoặc Frontend), Admin thực hiện quy trình sau:

### Bước 1: Kiểm Tra Hồ Sơ Đổi Mới (Change Dossier)
Mở terminal và gõ:
```bash
npm run sep -- status <tên-change>
```
Kiểm tra:
- **Bước 3 (Verify Spec)**: Đọc phản biện của **Skeptic** (`openspec/changes/<change>/review/skeptic.md`) xem có lỗ hổng kiến trúc hoặc rủi ro dữ liệu nào chưa xử lý không.
- **Bước 4 (Tasks Checklist)**: Xem file `tasks.md` để biết chính xác thành viên đó đã làm những gì, các file code nào đã được thêm/sửa. Bắt buộc 100% task phải là `- [x]`.

### Bước 2: Kiểm Tra Kết Quả Kiểm Thử (Verification Gate)
Đọc file `openspec/changes/<change>/test-report.md`:
- Tiêu đề frontmatter phải có: `verdict: PASS`.
- Backend: `dotnet build` đạt 0 warning, 0 error; `dotnet test` pass 100%.
- Frontend: `npm run build` không có lỗi Type/Bundle; đã kiểm tra giao diện không vi phạm quy tắc thiết kế KiotViet (không animation rung lắc).

### Bước 3: Duyệt & Merge PR Trên GitHub
- Nếu thoả mãn các tiêu chí trên: Admin bấm **Approve** và **Merge** (Squash and merge hoặc Rebase merge) trên GitHub repository.
- Nếu chưa đạt: Admin từ chối và ghi lý do dựa trên `review/skeptic.md` hoặc `tasks.md`.

### Bước 4: Lưu Trữ & Tích Hợp Đặc Tả (Archive Change)
Sau khi code đã được merge vào nhánh chính:
```bash
/sep-archive <tên-change>
```
Hệ thống AI Team Kit sẽ:
1. Đánh dấu Change thành công (`status: archived`).
2. Tự động merge các delta spec (`specs.md`) vào spec gốc hệ thống trong `openspec/specs/`.
3. Đồng bộ Knowledge Base để toàn đội ngũ kế thừa cho các tính năng tiếp theo.
