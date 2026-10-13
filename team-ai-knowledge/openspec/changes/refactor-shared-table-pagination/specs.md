# Specifications: Shared Table Pagination (Delta)

## MODIFIED Requirements

### Requirement: REQ-SHARED-PAGE-01 Uniform Pagination Layout & Behavior
Hệ thống giao diện bảng dữ liệu MUST hiển thị component phân trang đồng nhất với 3 khu vực:
1. Thông tin bản ghi: `{from} - {to} / {total} {itemLabel}`
2. Bộ chọn số dòng / trang (`10, 20, 50`)
3. Điều hướng trang: Nút Prev, danh sách nút số trang (tự rút gọn `...` khi > 7 trang), nút Next.

#### Scenario: Hiển thị khi tổng số trang nhỏ (<= 7)
- **GIVEN** Tổng số bản ghi là 45, kích thước trang là 10 (tương đương 5 trang)
- **WHEN** Component `TablePagination` render
- **THEN** Hiển thị đầy đủ tất cả các nút trang [1, 2, 3, 4, 5] không có dấu ba chấm `...`
- **AND** Nút trang hiện tại có style active `var(--blue-primary)`

#### Scenario: Hiển thị khi tổng số trang lớn (> 7) và đang ở trang đầu
- **GIVEN** Tổng số trang là 10, trang hiện tại là 2
- **WHEN** Component `TablePagination` render
- **THEN** Hiển thị dải trang dạng `[1, 2, 3, 4, '...', 10]`
- **AND** Nút Prev bật (clickable), nút trang 2 ở trạng thái active

#### Scenario: Hiển thị khi tổng số trang lớn (> 7) và đang ở trang giữa
- **GIVEN** Tổng số trang là 15, trang hiện tại là 8
- **WHEN** Component `TablePagination` render
- **THEN** Hiển thị dải trang dạng `[1, '...', 7, 8, 9, '...', 15]`

#### Scenario: Hiển thị khi tổng số trang lớn (> 7) và đang ở trang cuối
- **GIVEN** Tổng số trang là 12, trang hiện tại là 11
- **WHEN** Component `TablePagination` render
- **THEN** Hiển thị dải trang dạng `[1, '...', 9, 10, 11, 12]`
- **AND** Nút Next bật (clickable), nút trang 11 ở trạng thái active

### Requirement: REQ-SHARED-PAGE-02 Boundary & Safe Navigation Invariants
Component phân trang MUST đảm bảo các bất biến về ranh giới dữ liệu:
- Nút Prev MUST bị disabled khi `currentPage <= 1`.
- Nút Next MUST bị disabled khi `currentPage >= totalPages`.
- Khi người dùng chọn kích thước trang mới (`pageSize`), nếu `currentPage > newTotalPages`, hệ thống MUST tự động chuyển về trang `newTotalPages` hoặc trang 1.

#### Scenario: Chặn điều hướng vượt quá trang 1
- **GIVEN** Người dùng đang ở trang 1
- **WHEN** Người dùng quan sát nút Prev hoặc click vào nút Prev
- **THEN** Nút Prev bị disabled (`disabled={true}`) và không phát sinh sự kiện `onPageChange`

#### Scenario: Thay đổi kích thước trang an toàn
- **GIVEN** Có tổng cộng 50 bản ghi, `pageSize` hiện tại là 10 và người dùng đang ở trang 5
- **WHEN** Người dùng đổi `pageSize` thành 50 (tổng số trang mới chỉ còn 1 trang)
- **THEN** Callback `onPageChange` được gọi với giá trị trang 1 (hoặc hook tự reset)
- **AND** Bảng hiển thị 50 bản ghi trên trang 1 mà không bị lỗi trang trắng
