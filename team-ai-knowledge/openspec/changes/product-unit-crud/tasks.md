# Tasks: product-unit-crud

## Backend
- [ ] T1 — Tạo các DTOs `ProductUnitResponse`, `ProductUnitCreateRequest`, `ProductUnitUpdateRequest` trong `MT_GRMS.Application/Catalog/Dtos` (REQ-UNIT-01, REQ-UNIT-02, REQ-UNIT-03)
- [ ] T2 — Tạo interface `IProductUnitRepository` trong `MT_GRMS.Application` và cài đặt `ProductUnitRepository` trong `MT_GRMS.Infrastructure/Repositories` (REQ-UNIT-01, REQ-UNIT-02)
- [ ] T3 — Khai báo interface `IProductUnitService` và cài đặt service `ProductUnitService` trong `MT_GRMS.Application/Catalog` với đầy đủ logic kiểm tra nghiệp vụ và xử lý đơn vị cơ bản (REQ-UNIT-01, REQ-UNIT-02, REQ-UNIT-03, REQ-UNIT-04)
- [ ] T4 — Đăng ký Dependency Injection cho `IProductUnitRepository` và `IProductUnitService` (REQ-UNIT-01)
- [ ] T5 — Xây dựng controller `ProductUnitsController` trong `MT_GRMS.Api/Controllers` tiếp nhận 5 endpoints CRUD (REQ-UNIT-01, REQ-UNIT-02, REQ-UNIT-03, REQ-UNIT-04)

## Test
- [ ] T6 — Viết unit tests kiểm thử 100% các trường hợp thành công và ngoại lệ của ProductUnitService trong `MT_GRMS.UnitTests` (REQ-UNIT-01, REQ-UNIT-02, REQ-UNIT-03, REQ-UNIT-04)
