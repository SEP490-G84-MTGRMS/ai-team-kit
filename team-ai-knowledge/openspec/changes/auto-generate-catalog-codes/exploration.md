# EXP-2026-10-31-001: Tự động sinh mã tuần tự cho Nhóm hàng (CAT) và Sản phẩm (SP)

## 1. Problem Statement
Trong phân hệ Catalog của MT-GRMS:
- Khi người dùng tạo mới Category hoặc Product mà không nhập mã, hệ thống đang dùng chuỗi GUID ngẫu nhiên: `CAT-XXXXXX` (6 ký tự ngẫu nhiên) và `SP-XXXXXX`.
- Vấn đề:
  1. Mã ngẫu nhiên khó nhớ, khó tìm kiếm và không phản ánh tính tuần tự trong quản lý bán lẻ.
  2. Người dùng mong muốn chuẩn hóa theo format chuẩn thị trường:
     - Nhóm hàng: `CAT000001`, `CAT000002`, `CAT000003`...
     - Sản phẩm: `SP000001`, `SP000002`, `SP000003`...

## 2. Context & Background
- Mã nguồn hiện tại:
  - `CategoryService.cs`: dòng 48-51: `code = $"CAT-{Guid.NewGuid().ToString()[..6].ToUpper()}";`
  - `CatalogService.cs`: dòng 112-114: `code = $"SP-{Guid.NewGuid().ToString()[..6].ToUpper()}";`
  - `CategoryRepository.cs` và `ProductRepository.cs` đã kế thừa `GenericRepository` và tự động cách ly theo `ITenantContext`.
- Bối cảnh: Đảm bảo tính nhất quán trên cả API, cơ sở dữ liệu và tương thích với giao diện POS / Quản lý kho.

## 3. Constraints
- Không thay đổi kiểu dữ liệu cột trong CSDL (giữ nguyên string `CategoryCode` và `ProductCode`).
- Không phá vỡ các mã cũ đã tồn tại dạng `CAT-XXXXXX` hoặc mã do người dùng tự nhập tùy chỉnh.
- Đảm bảo tính cô lập dữ liệu theo từng Tenant (`ITenantContext`).
- Phải an toàn trước xung đột trùng lặp (Concurrency collision avoidance).

## 4. Assumptions
- **[ASSUMPTION-01]**: Độ dài phần số là 6 chữ số (`D6`), hỗ trợ tối đa 999,999 nhóm hàng và 999,999 sản phẩm cho mỗi cửa hàng (thừa đáp ứng quy mô bán lẻ tạp hóa).
- **[ASSUMPTION-02]**: Khi người dùng tự nhập mã tùy chỉnh (ví dụ: `BANH-MI-01`), hệ thống tôn trọng mã nhập đó và không làm gián đoạn chuỗi số của mã tự sinh.
- **[ASSUMPTION-03]**: Đối với sản phẩm, nếu cả `ProductCode` và `Barcode` đều bỏ trống, `Barcode` sẽ được gán mặc định bằng chính mã `ProductCode` tự sinh.

## 5. Scope & Non-Goals
### In Scope
- Thêm phương thức lấy số thứ tự mã lớn nhất hiện có trong Repository:
  - `ICategoryRepository.GetNextCodeAsync(CancellationToken ct)` hoặc `GetMaxCodeNumberAsync`
  - `IProductRepository.GetNextCodeAsync(CancellationToken ct)` hoặc `GetMaxCodeNumberAsync`
- Cập nhật `CategoryService.CreateAsync` để sinh `CAT000001`, `CAT000002`...
- Cập nhật `CatalogService.CreateProductAsync` để sinh `SP000001`, `SP000002`...
- Viết Unit Tests đầy đủ cho cả hai Service.

### Non-Goals (Out of Scope)
- Không migration cập nhật lại mã của các dữ liệu đã lưu trong CSDL trước đây.
- Không cấu hình tiền tố động (prefix vẫn cố định là `CAT` cho Category và `SP` cho Product).

## 6. So sánh các Phương án Kỹ thuật

### Phương án A: Quét toàn bộ mã và Parse số trong bộ nhớ (In-memory Parsing)
- **Cơ chế**: Lấy tất cả `CategoryCode` bắt đầu bằng `CAT` về ứng dụng, duyệt qua từng mã và tìm số lớn nhất.
- **Ưu điểm**: Dễ viết, không phụ thuộc hàm SQL.
- **Nhược điểm**: Hiệu năng kém khi số lượng sản phẩm lên đến hàng chục nghìn bản ghi.

### Phương án B (ĐƯỢC CHỌN): Tận dụng tính chất sắp xếp chuỗi cố định độ dài (Fixed-length String Ordering) + Vòng lặp chống trùng lặp
- **Cơ chế**:
  - Với Category: `CAT` + 6 chữ số = độ dài đúng 9 ký tự.
  - Với Product: `SP` + 6 chữ số = độ dài đúng 8 ký tự.
  - Vì độ dài cố định và có leading zeros (`000001` đến `999999`), thứ tự sắp xếp chuỗi (Alphabetical) hoàn toàn đồng nhất với thứ tự số học (Numerical):
    `SELECT TOP 1 ProductCode FROM Products WHERE ProductCode LIKE 'SP%' AND LEN(ProductCode) = 8 ORDER BY ProductCode DESC`
  - Trích xuất phần số, tăng thêm 1. Nếu chưa có mã nào thì bắt đầu từ 1.
  - Kèm vòng lặp `while (await ExistsByCodeAsync(candidateCode)) candidateCode = prefix + (++nextNum).ToString("D6")` để triệt tiêu 100% rủi ro trùng mã.
- **Ưu điểm**:
  - Tối ưu hiệu năng: Chỉ đọc 1 bản ghi duy nhất từ Database trong $O(1)$ hoặc index seek.
  - Không nạp danh sách lớn vào RAM.
  - Chống va chạm tuyệt đối (collision-proof).
- **Rủi ro & Giảm thiểu**: Nếu có mã tự nhập ngẫu nhiên có độ dài đúng 8 ký tự bắt đầu bằng SP, vòng lặp kiểm tra `ExistsByCodeAsync` sẽ tự động nhảy qua số đó để lấy số kế tiếp, không bao giờ bị lỗi `Duplicate Key`.

## 7. Success Criteria
- Thêm Category bỏ trống mã $\rightarrow$ sinh `CAT000001`, tiếp theo là `CAT000002`.
- Thêm Product bỏ trống mã $\rightarrow$ sinh `SP000001`, tiếp theo là `SP000002`.
- 100% Unit Tests & Integration Tests pass.
