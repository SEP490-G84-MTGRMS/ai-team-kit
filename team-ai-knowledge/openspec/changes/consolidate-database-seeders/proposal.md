# Đề xuất Refactor: Gộp DatabaseSeeder vào DbInitializer

## 1. Vấn đề của code hiện tại
- Hệ thống đang duy trì song song 2 file seeder rất lớn trong `MT_GRMS.Infrastructure/Persistence/`:
  - `DbInitializer.cs` (~1.291 dòng)
  - `DatabaseSeeder.cs` (~1.589 dòng)
- Cả hai file đều được gọi đồng thời tại `Program.cs` khi khởi động ứng dụng:
  - Gây trùng lặp kiểm tra `AnyAsync()` cho `Tenants`, `Users`, `Branches`, `Categories`, `Products`.
  - Tồn tại các tập dữ liệu người dùng và danh mục chồng chéo giữa hai file.
  - Tăng thời gian khởi động container và tăng chi phí bảo trì (Technical Debt).

## 2. Mục tiêu
- Hợp nhất toàn bộ dữ liệu nghiệp vụ đặc thù từ `DatabaseSeeder.cs` (Thuế HKD Nghị quyết 204, Doanh thu mẫu Q3/2026, Sổ quỹ Till/Safe/Bank, Công nợ khách hàng FIFO, Ma trận PO NCC) vào cấu trúc của `DbInitializer.cs`.
- Xóa bỏ hoàn toàn file `DatabaseSeeder.cs`.
- Đơn giản hóa `Program.cs` chỉ còn gọi một điểm khởi tạo duy nhất: `await DbInitializer.InitializeAsync(dbContext);`.

## 3. Phạm vi (Scope)
- **Trong phạm vi (In-scope)**:
  - `src/MT_GRMS.Infrastructure/Persistence/DbInitializer.cs`: Nhận dữ liệu seed từ `DatabaseSeeder`.
  - `src/MT_GRMS.Infrastructure/Persistence/DatabaseSeeder.cs`: Xóa bỏ file.
  - `src/MT_GRMS.Api/Program.cs`: Bỏ lời gọi `DatabaseSeeder.SeedAsync`.
  - Cập nhật các Unit/Integration test nếu có tham chiếu đến `DatabaseSeeder`.
- **Ngoài phạm vi (Out-of-scope)**:
  - Không thay đổi schema CSDL (34 bảng giữ nguyên 100%).
  - Không thay đổi hành vi API hay logic nghiệp vụ của các Controller/Service.

## 4. Tiêu chí thành công (Acceptance Criteria)
- `DatabaseSeeder.cs` được loại bỏ hoàn toàn khỏi solution.
- `dotnet build project/MT_GRMS_BACKEND/MT_GRMS_BACKEND.sln` thành công 100% với 0 lỗi.
- `dotnet test project/MT_GRMS_BACKEND/MT_GRMS_BACKEND.sln` vượt qua toàn bộ 451/451 tests.
- Backend khởi động bình thường, dữ liệu demo phục vụ màn hình Thuế, POS, Sổ quỹ và Nhà cung cấp vẫn được nạp đầy đủ.
