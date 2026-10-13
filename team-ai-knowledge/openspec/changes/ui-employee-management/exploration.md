# Exploration: ui-employee-management
## Nghiên cứu và Thiết kế Kỹ thuật Phân hệ Quản lý Nhân sự (FE-Employee)

## 1. Hiện trạng Kiến trúc Frontend MT-GRMS
- Nền tảng công nghệ: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React / Ant Design SVG Icons.
- Layout chuẩn: `StoreOwnerLayout` với header 2 tầng (`AppTopNav`), thanh breadcrumb ngữ cảnh, tông màu chủ đạo Deep Teal (`#0F766E`), bo góc hiện đại 24–28px / Full Pill, phông chữ `Be Vietnam Pro`.
- Các phân hệ tương tự đã hoàn thành:
  - `product-management-ui` (FE-01: Quản lý hàng hóa, Multi-UOM, Combo, Category, Stock Ledger).
  - `inter-branch-transfer-ui` (FE-15: Chuyển hàng liên kho, Lô/Date FEFO, Dispatch/Receive/Rollback).
  - `supplier` (FE-03: Nhà cung cấp & Quản lý giá nhập).
  - `service-expenses` (FE-07: Chi phí vận hành).
- Trải nghiệm người dùng: Đạt tiêu chuẩn KiotViet SaaS: bảng dữ liệu gọn gàng, bộ lọc bên trái (Filter Sidebar), modal thêm mới đa tab trực quan, modal chi tiết dạng panel/drawer đa năng, badge thông báo trạng thái, phản hồi tức thì với toast.

---

## 2. Phân tích So sánh Phương án Kỹ thuật

| Tiêu chí | Phương án A: Clean Architecture Module với State Hooks & In-Memory Service (Được chọn) | Phương án B: Tích hợp Redux Toolkit Slice / Zustand |
|---|---|---|
| **Cấu trúc dữ liệu & State** | Quản lý state theo component & custom hook `useEmployeeState`, mock store in-memory có persistence mô phỏng API delay | Khởi tạo Redux slice `employeeSlice`, dispatch actions toàn cục |
| **Độ phức tạp & Boilerplate** | Tối giản, gọn nhẹ, dễ bảo trì, hoàn toàn đồng bộ với các module `product`, `transfer`, `service-expenses` trong dự án | Tăng boilerplate (action, reducer, selector), không cần thiết khi dữ liệu nhân sự chưa chia sẻ liên component ngoài màn hình |
| **Hiệu năng & Tái cấu trúc** | Tối ưu re-render qua memo và callback, cô lập logic trong `features/employee` | Cồng kềnh hơn, đòi hỏi cấu hình store toàn cục |
| **Khả năng nối Backend** | Chỉ cần thay thế layer `employeeService` từ mock sang `axios/fetch` mà không cần sửa UI | Phải viết thêm thunk / RTK Query |

**Quyết định:** Chọn **Phương án A** nhằm duy trì tính nhất quán kiến trúc với toàn bộ dự án MT-GRMS.

---

## 3. Các Giả định & Ràng buộc Nghiệp vụ
1. **Mã nhân viên (Employee Code):** Tự sinh định dạng `NV000001`, `NV000002`... nếu người dùng để trống; kiểm tra tính duy nhất trên toàn hệ thống.
2. **Chi nhánh làm việc (Working Branches):** Một nhân viên có thể làm việc tại một hoặc nhiều chi nhánh, nhưng chỉ có **1 Chi nhánh trả lương (Salary Branch)** duy nhất.
3. **Cấu hình lương & Phụ cấp:** Hỗ trợ linh hoạt cả hình thức lương cố định theo tháng và lương theo giờ/ca; hỗ trợ hệ số tăng ca (OT Ngày thường, Ngày nghỉ, Ngày lễ); hỗ trợ nhiều danh mục phụ cấp (Ăn trưa, Đi lại, Trách nhiệm, Điện thoại...).
4. **Nợ & Tạm ứng:** Khi tổng tiền thanh toán vượt quá số nợ lương hiện tại (hoặc khi nợ = 0), hệ thống tự động ghi nhận là phiếu **Tạm ứng lương** cho nhân viên.
5. **Duyệt yêu cầu:** Yêu cầu từ nhân viên chia làm 2 loại chính: Yêu cầu hồ sơ nhân viên (sửa thông tin, số điện thoại) và Yêu cầu chấm công (đổi thiết bị chấm công, check-in ngoài phạm vi). Hỗ trợ duyệt/từ chối từng yêu cầu hoặc hàng loạt.
6. **Import Excel:** Giới hạn tối đa 500 nhân viên mỗi lần nạp; hỗ trợ 2 chế độ xử lý lỗi: "Dừng lại khi gặp lỗi" hoặc "Bỏ qua dòng lỗi để tiếp tục".

---

## 4. Kế hoạch Quản trị Rủi ro (Risk Mitigation)
- **Rủi ro rò rỉ dữ liệu lương:** Thiết kế che trường lương với vai trò không có thẩm quyền hoặc cảnh báo khi mở tab tài chính.
- **Rủi ro xung đột lịch làm việc:** Cảnh báo khi người dùng hủy liên kết chi nhánh của một nhân viên đã có phân ca tại chi nhánh đó.
- **Rủi ro nhập sai dữ liệu file Excel:** Validation kỹ các cột bắt buộc (Họ tên, SĐT, Chi nhánh trả lương) trước khi insert vào danh sách, hiển thị preview và danh sách dòng lỗi chi tiết.
