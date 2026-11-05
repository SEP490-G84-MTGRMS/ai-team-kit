# Design Brief: Đa Chi Nhánh, Phân Quyền Vai Trò POS & Tối Ưu Tra Cứu FEFO

## 1. Luồng Người Dùng (User Flows)

### Luồng 1: Bán Hàng & Chuyển Chi Nhánh (Chủ Cửa Hàng - STORE_OWNER)
```mermaid
sequenceDiagram
    actor Owner as Trần Quốc An (Chủ tiệm)
    participant POS as PosCheckoutPage / PosHeader
    participant API as PosOrdersController / DbContext

    Owner->>POS: Đăng nhập tài khoản STORE_OWNER (0918889999)
    POS->>POS: Nhận diện isStoreOwner = true
    POS->>POS: Hiển thị Dropdown Chọn Chi Nhánh (Ba Đình, Cầu Giấy, Đống Đa)
    Owner->>POS: Chọn "An Nhiên Mart - Chi nhánh Cầu Giấy"
    POS->>API: Lấy danh sách tồn kho & bảng giá theo chi nhánh Cầu Giấy
    API-->>POS: Trả về sản phẩm & tồn kho chi nhánh Cầu Giấy
    Owner->>POS: Bán hàng & Thanh toán
    POS->>API: Tạo Order với BranchId = Cầu Giấy
```

### Luồng 2: Bán Hàng Khóa Cố Định Chi Nhánh (Nhân Viên - EMPLOYEE)
```mermaid
sequenceDiagram
    actor Staff as Phạm Thị Yến (Nhân viên)
    participant POS as PosCheckoutPage / PosHeader

    Staff->>POS: Đăng nhập tài khoản EMPLOYEE (0917778888)
    POS->>POS: Nhận diện isStoreOwner = false & Employee.BranchId = Ba Đình
    POS->>POS: Khóa cứng hiển thị Badge "Chi nhánh Ba Đình" (Không có dropdown chuyển)
    Staff->>POS: Bán hàng tại quầy Ba Đình
    POS->>POS: Mọi hóa đơn sinh ra tự động mang BranchId = Ba Đình
```

### Luồng 3: Quản Lý Đơn Hàng & Phân Quyền Hủy Đơn vs Đổi Trả (`InvoiceManagementPage`)
- **Chủ cửa hàng (`STORE_OWNER`)**:
  - Dropdown lọc chi nhánh: Cho phép chọn "Tất cả chi nhánh" hoặc từng chi nhánh cụ thể.
  - Danh sách hóa đơn: Hiển thị cả 2 nút **"Đổi trả hàng"** và **"Hủy hóa đơn"** (màu đỏ với modal xác nhận hủy).
- **Nhân viên (`EMPLOYEE`)**:
  - Dropdown lọc chi nhánh: Bị khóa cứng theo chi nhánh được gán (chỉ xem được đơn của chi nhánh mình).
  - Nút **"Đổi trả hàng"**: Hiển thị đầy đủ để nhân viên linh hoạt đổi hàng hỏng/lỗi cho khách tại quầy.
  - Nút **"Hủy hóa đơn"**: Ẩn hoàn toàn (hoặc hiển thị disabled kèm chú thích rõ "Chỉ Chủ cửa hàng mới có quyền hủy hóa đơn").

### Luồng 4: Tra Cứu Tồn Kho & Lựa Chọn Bán Theo Lô FEFO (`PosInventoryLookupModal`)
```mermaid
sequenceDiagram
    actor Cashier as Thu ngân POS
    participant POS as PosCheckoutPage
    participant Modal as PosInventoryLookupModal

    Cashier->>POS: Bấm nút "Tra cứu Lô FEFO"
    POS->>Modal: Mở Quick Modal tra cứu tại chỗ (không rời giỏ hàng)
    Cashier->>Modal: Nhập tên / Quét mã barcode
    Modal-->>Cashier: Hiển thị tồn chi nhánh hiện tại + chi nhánh khác + Danh sách Lô date
    alt Bán theo Lô FEFO tự động (mặc định)
        Cashier->>Modal: Chỉ xem thông tin rồi đóng Modal
        Cashier->>POS: Quét barcode / chọn món thông thường -> Backend tự trừ lô cận date nhất
    else Chỉ định bán Lô cụ thể (Option)
        Cashier->>Modal: Bấm "✓ Chọn bán lô này" tại dòng lô mong muốn
        Modal->>POS: Đưa sản phẩm kèm mã lô (ví dụ LOT-BIA-202612) vào giỏ hàng
        Modal->>Modal: Đóng Modal
        POS->>POS: Giỏ hàng hiển thị nhãn: Lô LOT-BIA-202612
    end
```

---

## 2. Thiết Kế Màn Hình & Thành Phần Giao Diện (UI Components)

### 2.1. `PosHeader.tsx`
- **Props mở rộng**:
  - `branches: Array<{ id: string; name: string; address?: string }>`
  - `selectedBranchId: string`
  - `onSelectBranch: (branchId: string) => void`
  - `onOpenInventoryLookup: () => void`
- **Render Chi Nhánh**:
  - Nếu `isStoreOwner`: Render `<select>` dạng pill cao cấp với icon `Store`, hiển thị tên các chi nhánh của An Nhiên Mart, border xanh emerald tinh tế.
  - Nếu `!isStoreOwner`: Render `<div>` badge tĩnh với icon `MapPin` và text tên chi nhánh cố định của nhân viên.
- **Nút Tra Cứu FEFO**:
  - Đặt cạnh nút "Đơn đặt trước" và "Quản lý hóa đơn", icon `Search` / `Layers`, nhãn: "Tra cứu Lô FEFO".

### 2.2. `PosInventoryLookupModal.tsx` (Component Mới Tinh Gọn)
- Header: "Tra Cứu Tồn Kho & Lô Hạn Dùng FEFO" + nút đóng (✕ / ESC).
- Ô tìm kiếm: Tích hợp scanner listener + input gợi ý tên/barcode.
- Khối thông tin sản phẩm:
  - Thẻ tóm tắt: Tên sản phẩm, Đơn vị tính, Tổng tồn kho toàn chuỗi.
  - Bảng 1: Phân bổ tồn kho theo Chi nhánh (Ba Đình, Cầu Giấy, Đống Đa).
  - Bảng 2: Danh sách các Lô hàng (`Batches`):
    - Mã Lô (`batchId`)
    - Hạn sử dụng (`expDate`)
    - Số ngày còn lại & Trạng thái: Cận date (cam/đỏ), An toàn (xanh lá)
    - Tồn khả dụng
    - Cột thao tác: **Nút "✓ Chọn bán lô này"** (Primary button xanh emerald nhỏ gọn). Khi bấm, đưa sản phẩm gắn mã lô đó vào giỏ hàng POS và đóng modal.

### 2.3. `PosCheckoutPage.tsx`
- Nhận event `onSelectBatchFromModal(product, batchId)`:
  - Tạo món giỏ hàng gắn `batchCode = batchId`.
  - Hiển thị badge lô cụ thể trên dòng giỏ hàng: `Lô: ${batchId}` (thay vì mặc định `LÔ-FEFO`).

### 2.4. `InvoiceManagementPage.tsx`
- `branchFilter`:
  - Khởi tạo giá trị mặc định theo vai trò đăng nhập.
  - Nếu là `EMPLOYEE`, disable selector lọc chi nhánh hoặc ẩn dropdown, cố định ở chi nhánh nhân viên.
- Bảng hóa đơn:
  - Cột thao tác: Kiểm tra `isStoreOwner` trước khi render nút Hủy hóa đơn.
  - Nút Đổi trả hàng luôn sẵn sàng cho cả 2 vai trò.

---

## 3. Cập Nhật CSDL & Dữ Liệu Mẫu (`DbInitializer.cs`)
- Tenant An Nhiên Mart (`tenant_an_nhien_02`):
  - **Chi nhánh 1**: `BR-AN-01` (`An Nhiên Mart - Chi nhánh Ba Đình`, 120 Hoàng Hoa Thám).
  - **Chi nhánh 2**: `BR-AN-02` (`An Nhiên Mart - Chi nhánh Cầu Giấy`, 268 Cầu Giấy).
  - **Chi nhánh 3**: `BR-AN-03` (`An Nhiên Mart - Chi nhánh Đống Đa`, 85 Chùa Bộc).
- Nhân sự:
  - `usr_owner_annhien_02` (`0918889999`): Gán vai trò `STORE_OWNER`, quản lý toàn bộ chi nhánh.
  - `usr_employee_annhien_02` (`0917778888` - Phạm Thị Yến): Gán vai trò `EMPLOYEE`, gắn `BranchId` = `BR-AN-01`.
  - `usr_employee_annhien_03` (`0916667777` - Lê Hoàng Nam): Gán vai trò `EMPLOYEE`, gắn `BranchId` = `BR-AN-02`.
- Tồn kho & Lô hàng:
  - Khởi tạo `BranchStock` và `Batches` cho các sản phẩm tại cả 3 chi nhánh để kiểm thử tra cứu chéo chi nhánh và chuyển đổi POS.
