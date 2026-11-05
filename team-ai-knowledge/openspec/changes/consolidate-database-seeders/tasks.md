# Kế Hoạch Thực Hiện (Tasks) - Refactor Database Seeders

- [x] T1: Tích hợp dữ liệu nghiệp vụ Thuế NQ 204, Doanh thu Q3 (385tr), Sổ quỹ (Till, Safe, Bank), Công nợ FIFO và PO Matrix từ `DatabaseSeeder.cs` vào `DbInitializer.cs` theo các hàm phân hệ sạch sẽ. (Tham chiếu: REQ-SEED-02, REQ-SEED-03)
- [x] T2: Cập nhật `src/MT_GRMS.Api/Program.cs` chỉ gọi duy nhất `await DbInitializer.InitializeAsync(dbContext, logger);`. (Tham chiếu: REQ-SEED-01)
- [x] T3: Xóa bỏ tệp `src/MT_GRMS.Infrastructure/Persistence/DatabaseSeeder.cs` khỏi dự án. (Tham chiếu: REQ-SEED-01)
- [x] T4: Chạy `dotnet build` và kiểm thử toàn bộ `dotnet test` (yêu cầu 451/451 tests PASS). (Tham chiếu: REQ-SEED-01)
- [x] T5: Lập worklog chi tiết trong `project/MT_GRMS_BACKEND/docs/worklogs/` và cập nhật `CHANGELOG.md`. (Tham chiếu: REQ-SEED-01)
