# Proposal: Màn hình Quản lý Ca làm POS, Bàn giao Z-Report & Khóa sổ Doanh thu Ngày (`pos-shift-management`)

## Vấn đề
Cửa hàng cần đối soát chặt tiền mặt đầu ca – cuối ca (Z-Report) của từng thu ngân, xử lý trường hợp nhân viên quên đóng ca và khóa sổ doanh thu tổng hợp cuối ngày kinh doanh (EOD Closing) vào Sổ quỹ.

## Mục tiêu
Tích hợp lịch sử ca bán hàng đa nhân viên, quy trình kiểm đếm xác nhận bàn giao ca và chốt khóa sổ ngày kinh doanh (`BusinessDaysController`) trên một màn hình thống nhất.

## Phạm vi
- **In scope**:
  - Màn hình Frontend tại tuyến đường `/store-owner/shifts`, `/shifts` (`src/features/pos/pages/PosShiftPage.tsx`).
  - Các thành phần giao diện con và hộp thoại thao tác: `TablePagination`, `SortableHeader`.
  - Tích hợp đầy đủ với tầng API Backend (`ShiftsController`, `BusinessDaysController`) và thực thể nghiệp vụ (`ShiftZReport`, `ShiftCashMovement`, `BusinessDayClosing`, `CashbookEntry`).
- **Out of scope**:
  - Các màn hình độc lập khác nằm ngoài route `/store-owner/shifts`, `/shifts` (được quản lý ở từng Change màn hình riêng biệt tương ứng).

## Người dùng liên quan
- **Chủ chuỗi cửa hàng (Store Owner)**
- **Nhân viên chi nhánh (Thu ngân / Thủ kho)**

## Tiêu chí thành công
- [ ] Màn hình hoạt động ổn định trên các tuyến đường `/store-owner/shifts`, `/shifts`, tuân thủ chuẩn thiết kế UI của MT-GRMS và kiểm tra phân quyền RBAC/Tenant cô lập dữ liệu 100%.
- [ ] Toàn bộ 4 quy tắc nghiệp vụ cốt lõi trên màn hình khớp dữ liệu thật với Backend ASP.NET Core 8 (`0` lỗi biên dịch C# / TypeScript).
- [ ] Đạt đầy đủ kịch bản kiểm thử theo từng tầng (Unit, Integration, System FRs/NFRs, Acceptance) gắn với mã màn hình `UI-03-02` (FE-03).
