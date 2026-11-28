# Proposal: database-storage-selection

## Vấn đề
- Hệ thống MT-GRMS (Multi-Tenant Grocery Retail Management System) là nền tảng SaaS quản lý bán lẻ chuỗi tạp hóa, đòi hỏi xử lý giao dịch bán hàng POS thời gian thực, quản lý kho theo hạn dùng FEFO (First Expired, First Out), đối soát sổ quỹ và phân lập dữ liệu đa người thuê (Multi-Tenancy).
- Hiện tại trong mã nguồn `MT_GRMS_BACKEND`, tầng Infrastructure đang cấu hình linh động hỗ trợ cả InMemory, SQL Server và PostgreSQL (`Npgsql`), trong khi tài liệu thiết kế và `appsettings.json` đang trỏ về PostgreSQL. Dự án cần phân tích chuyên sâu các đặc thù nghiệp vụ để đưa ra quyết định kiến trúc chính thức: Nên chọn dạng database nào (RDBMS vs NoSQL) và công nghệ cụ thể nào (PostgreSQL vs SQL Server) làm chuẩn lưu trữ chính, tối ưu cả về chi phí vận hành, tính toàn vẹn ACID, khả năng mở rộng và tốc độ phát triển.

## Mục tiêu
- Phân tích đối chiếu toàn diện giữa các mô hình lưu trữ (RDBMS Quan hệ vs NoSQL Document/Key-Value) dựa trên 9 Domain Entities hiện có (`Product`, `Batch`, `StockOnHand`, `Order`, `OrderItem`, `CashbookTransaction`, `User`, `Role`, `Tenant`).
- Đánh giá chi tiết ưu/nhược điểm kỹ thuật và chi phí vận hành giữa **PostgreSQL** và **Microsoft SQL Server** trong hệ sinh thái ASP.NET Core 8 & EF Core 8 Code-First.
- Đưa ra quyết định kiến trúc chuẩn thức (Architecture Decision) cùng chiến lược lưu trữ dữ liệu (Primary RDBMS + Caching layer) đảm bảo tính toàn vẹn giao dịch ACID tuyệt đối cho POS, hạn chế rò rỉ dữ liệu đa người thuê và chuẩn hóa bộ cấu hình EF Core Provider.

## Phạm vi
- **In scope**:
  - Đánh giá mô hình dữ liệu MT-GRMS: tính chất giao dịch (POS, trừ kho FEFO, sổ quỹ thu chi), quan hệ dữ liệu (khóa ngoại đa cấp), và yêu cầu phân lập Multi-Tenancy.
  - So sánh RDBMS (PostgreSQL, MSSQL) vs NoSQL (MongoDB) theo các tiêu chí: ACID, Concurrency Control, Phân lập Multi-Tenant, Hỗ trợ JSON phi cấu trúc, Chi phí triển khai Cloud (Docker/Render/Supabase/Azure).
  - Khuyến nghị dạng database tối ưu và giải pháp bổ trợ (Redis cho Caching/Distributed Lock).
  - Chuẩn hóa cấu hình Connection String, EF Core Provider và kế hoạch triển khai Migrations trong `MT_GRMS_BACKEND`.
- **Out of scope**:
  - Viết code nghiệp vụ bán hàng hoặc thay đổi cấu trúc bảng Domain Entities.
  - Cấu hình hạ tầng cluster phân tán nâng cao (Database Sharding, Read-Replica đa vùng) ở giai đoạn Capstone hiện tại.

## Người dùng liên quan
- **Chủ cửa hàng / Thu ngân**: Hưởng lợi từ hệ thống POS mượt mà, không bao giờ bị sai lệch số liệu tồn kho hoặc tiền quỹ do xung đột ghi đồng thời.
- **Đội ngũ phát triển (Backend Developers & DevOps)**: Có tiêu chuẩn công nghệ cơ sở dữ liệu rõ ràng, dễ dàng viết EF Core Migrations, chạy Unit/Integration Tests và deploy tự động qua Docker.
- **Hội đồng chấm đồ án / Giảng viên SEP490**: Nhận được cơ sở lý luận kiến trúc vững chắc, có tài liệu phân tích kỹ thuật và quyết định công nghệ rõ ràng.

## Tiêu chí thành công
- [ ] Hoàn thành bảng phân tích định lượng & định tính so sánh RDBMS (PostgreSQL, MSSQL) vs NoSQL đối với bài toán bán lẻ tạp hóa MT-GRMS.
- [ ] Xác định rõ ràng công nghệ Database chính (Primary Database) và lý do lựa chọn phù hợp nhất với bối cảnh dự án và năng lực nhóm.
- [ ] Kiến trúc `MT_GRMS_BACKEND` tầng Infrastructure phản ánh nhất quán công nghệ được chọn, đảm bảo EF Core Migrations hoạt động ổn định và thông suốt.
- [ ] Tài liệu phân tích được kiểm chứng và sẵn sàng tích hợp vào hồ sơ kiến trúc đồ án tốt nghiệp (ADR).
