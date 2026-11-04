# Tasks: shift-config-crud

## 1. Database & Infrastructure
- [x] **T1** — Xây dựng `IShiftConfigRepository` và `ShiftConfigRepository` trong `MT_GRMS.Infrastructure/Repositories`, đăng ký DI trong `DependencyInjection.cs` (REQ-SHF-01, REQ-SHF-02)

## 2. Backend Application
- [x] **T2** — Tạo các DTOs `ShiftConfigDtos.cs` (`CreateShiftConfigRequest`, `UpdateShiftConfigRequest`, `ShiftConfigResponse`, `UpdateShiftConfigStatusRequest`) trong `MT_GRMS.Application/HR/ShiftConfigs/Dtos` (REQ-SHF-01, REQ-SHF-03)
- [x] **T3** — Viết bộ kiểm tra hợp lệ dữ liệu `ShiftConfigValidators.cs` bằng FluentValidation cho tạo mới và cập nhật ca (REQ-SHF-01, REQ-SHF-03)
- [x] **T4** — Xây dựng `IShiftConfigService` và `ShiftConfigService` thực thi toàn bộ nghiệp vụ: Tạo ca tự động tính thời lượng ca vắt đêm, chặn trùng `ShiftCode` trong chi nhánh, lấy danh sách theo chi nhánh, cập nhật ca, bật/tắt `IsActive`, xóa mềm (REQ-SHF-01, REQ-SHF-02, REQ-SHF-03, REQ-SHF-04)

## 3. Backend API
- [x] **T5** — Xây dựng `ShiftConfigsController.cs` tại `MT_GRMS.Api/Controllers` phơi bày 6 endpoints RESTful với phân quyền `Authorize` (REQ-SHF-01, REQ-SHF-02, REQ-SHF-03, REQ-SHF-04)

## 4. Frontend Integration
- [x] **T6** — Khai báo TypeScript types và API client service gọi backend cho ShiftConfig tại `MT_GRMS_FRONTEND` (REQ-SHF-01, REQ-SHF-02)
- [x] **T7** — Xây dựng component `ShiftConfigTable` và modal `ShiftConfigModal` tích hợp vào phân hệ quản lý ca làm việc (REQ-SHF-01, REQ-SHF-03, REQ-SHF-04)

## 5. Testing & Verification
- [x] **T8** — Viết Unit Tests toàn diện cho `ShiftConfigServiceTests.cs` trong `MT_GRMS.UnitTests` bao phủ 100% các Scenario trong `specs.md` (Tạo ca chuẩn, ca qua đêm, chặn trùng mã, cập nhật, xóa mềm) (REQ-SHF-01, REQ-SHF-02, REQ-SHF-03, REQ-SHF-04)
- [x] **T9** — Chạy kiểm thử toàn bộ solution `dotnet test` bảo đảm 0 lỗi regression (REQ-SHF-01, REQ-SHF-02, REQ-SHF-03, REQ-SHF-04)
