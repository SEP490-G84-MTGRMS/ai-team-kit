# Codebase Review: employee-fe-integration

## Bản đồ ảnh hưởng
| REQ | Code hiện có | Tình trạng tích hợp | Ghi chú |
|---|---|---|---|
| REQ-FE-EMP-01 | `src/features/employee/api/employeeApi.ts`, `lib/employeeMapper.ts` | Đã hoàn thành | Kiểm tra Regex UUID cho phụ cấp, giữ nguyên ID cũ và gán `undefined` cho ID mới `al_xxx` |
| REQ-FE-EMP-02 | `src/features/employee/pages/EmployeeListPage.tsx` | Đã hoàn thành | Phân trang server-side dùng `TablePagination`, tìm kiếm debounce 300ms, lọc chi nhánh/trạng thái |
| REQ-FE-EMP-03 | `src/features/employee/components/EmployeeFormModal.tsx` | Đã hoàn thành | Chọn 1 chi nhánh, upload ảnh đại diện Cloudinary qua `POST /api/v1/media/upload`, phản hồi qua NotificationModal |
| REQ-FE-EMP-04 | `src/features/employee/components/EmployeeDetailModal.tsx` | Đã hoàn thành | Nạp dữ liệu thực tế từ `GET /employees/{id}`, optimistic pre-fill, format ngày `DD/MM/YYYY` |
| REQ-FE-EMP-05 | 16 modals & submodals trong `src/features/employee/components/` | Đã hoàn thành | Chuẩn hóa kích thước đồng nhất `900px × 85vh` |
| REQ-FE-EMP-06 | `src/features/employee/pages/EmployeeListPage.tsx` | Đã hoàn thành | Bắt lỗi `EMPLOYEE_HAS_WORK_HISTORY` (BR-EMP-03) hiển thị `NotificationModal` cảnh báo; toggle status active/inactive |
| REQ-FE-EMP-07 | `src/components/common/ConfirmModal.tsx`, `NotificationModal.tsx` | Đã hoàn thành | Bộ modal dùng chung toàn hệ thống, kế thừa từ `product` |
| REQ-FE-EMP-08 | `src/features/employee/api/shiftConfigApi.ts`, `pages/ShiftConfigPage.tsx`, `components/ShiftFormModal.tsx` | Đã hoàn thành | Tích hợp `/api/v1/hr/shift-configs`, hỗ trợ ca qua đêm và multi-branch |

## Tái sử dụng được
- `src/api/httpClient.ts` — Axios client có sẵn interceptors tự động gắn token JWT Bearer và `X-Tenant-Id`.
- `src/components/common/TablePagination.tsx` — Component phân trang chung chuẩn hóa UI.
- `src/components/common/ConfirmModal.tsx` & `NotificationModal.tsx` — Bộ popup dùng chung chuẩn hóa toàn bộ các phân hệ (Employee, Product...).

## Xung đột / Rủi ro kỹ thuật đã kiểm soát
- [ĐÃ KIỂM SOÁT] Lỗi `DbUpdateConcurrencyException` do phụ cấp mới mang ID tạm: Đã dùng regex UUID trong `employeeMapper.ts` gán `id: undefined` để Backend sinh `EntityState.Added`.
- [ĐÃ KIỂM SOÁT] Xóa nhân viên đã có dữ liệu làm việc hoặc phiếu lương: Frontend bắt mã `EMPLOYEE_HAS_WORK_HISTORY` và mở `NotificationModal` cảnh báo màu cam theo đúng `BR-EMP-03`.
- [ĐÃ KIỂM SOÁT] Cấu hình ca làm việc: Hỗ trợ linh hoạt cả 2 prefix route `/api/v1/hr/shift-configs` và `/api/v1/shift-configs`.

## Kết luận: Khả thi
Toàn bộ mã nguồn Frontend đã được kiểm chứng tương thích 100% với Backend, `npm run build` thành công 0 lỗi và test suite `employeeApi.test.ts` đạt 9/9 tests (100% PASS).
