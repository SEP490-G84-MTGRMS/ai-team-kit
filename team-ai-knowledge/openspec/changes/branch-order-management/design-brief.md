# Design Brief: branch-order-management

## 1. Luồng Người Dùng (User Flow)
```text
[Store Owner]
      │
      ▼
Truy cập: /store-owner/purchase-orders/branches
      │
      ├──> [Page Header]
      │      ├── Tiêu đề "Đặt hàng theo chi nhánh" + Loader icon khi tải dữ liệu
      │      └── Action Buttons: [📋 Lịch sử đơn hàng] -> /store-owner/purchase-orders/list
      │                          [📥 Xuất Excel]
      │
      ├──> [BranchFilterBar] (Khung lọc trắng viền bo góc)
      │      ├── Input từ khóa (Mã chi nhánh, Tên, Địa chỉ, Quản lý, SĐT)
      │      ├── Dropdown Mã CN (Tất cả, BR-01, BR-02, DC-01...)
      │      ├── Dropdown Trạng thái (Tất cả, Hoạt động, Ngừng hoạt động)
      │      └── Nút [🔍 Tìm kiếm] và nút [🔄 Đặt lại]
      │
      └──> [BranchOrderTable] (Card bảng dữ liệu phân trang)
             ├── Sticky Header cố định khi cuộn
             ├── Vùng tbody cuộn dọc/ngang độc lập
             ├── Cột dữ liệu:
             │     - Mã CN (BR-01, DC-01...)
             │     - Tên chi nhánh & Địa chỉ
             │     - Người phụ trách & Số điện thoại
             │     - Đơn PO đang chờ xử lý (Badge số lượng)
             │     - Lần cập nhật cuối (DD/MM/YYYY)
             │     - Trạng thái (Hoạt động / Ngừng hoạt động)
             │     - Thao tác:
             │         + [🛒 Đặt hàng] -> /store-owner/purchase-orders/create-matrix?branchId={id}
             │         + [👁️ Chi tiết] -> /store-owner/purchase-orders/create-matrix?branchId={id}&mode=view
             └── Footer Phân trang tích hợp:
                   - Dải đếm: Hiển thị 1 - 10 trên N chi nhánh
                   - Chọn kích cỡ trang: [10 | 20 | 30 | 50]
                   - Điều hướng: [Trước] Trang X / Y [Sau]
```

## 2. Giao diện & Thành phần Component (Frontend)
1. **`BranchOrderListPage.tsx`**:
   - Khung bao ngoài: `className="po-matrix-container"` với `overflow: hidden`, `display: flex`, `flexDirection: column`.
   - Kết nối `branchApi.getBranches(appliedFilters)` qua `useCallback` & `useEffect`.
   - Toast feedback qua `AdminToast`.
2. **`BranchFilterBar.tsx`**:
   - Thiết kế đồng bộ `SupplierFilterBar.tsx`.
   - Lưu trữ state bản nháp `draftFilters`, chỉ kích hoạt `onSearch` khi nhấn Enter hoặc bấm nút "Tìm kiếm".
3. **`BranchOrderTable.tsx`**:
   - Sử dụng table colgroup cố định tỷ lệ các cột.
   - Thead tách biệt với tbody cuộn bên trong wrapper có class `overflow-y: auto`.
   - Empty state sinh động với icon `Building2` khi không tìm thấy kết quả.
   - Footer thanh phân trang nằm cố định phía dưới bảng.

## 3. Thiết kế Cơ Sở Dữ Liệu (Backend Database Schema)
Bảng `branches` (PostgreSQL):
- `id`: `uuid` (Khóa chính, mặc định `gen_random_uuid()`)
- `tenant_id`: `uuid` (NOT NULL, Global Query Filter)
- `code`: `varchar(50)` (NOT NULL, Index duy nhất theo tenant)
- `name`: `varchar(200)` (NOT NULL)
- `address`: `varchar(500)` (NOT NULL)
- `phone`: `varchar(20)` (NULL)
- `manager_name`: `varchar(100)` (NULL)
- `status`: `varchar(20)` (Mặc định 'Active')
- `pending_orders_count`: `integer` (Mặc định 0)
- `last_order_date`: `timestamptz` (NULL)
- `created_at`: `timestamptz` (NOT NULL, UTC)
- `is_deleted`: `boolean` (NOT NULL, mặc định false)

## 4. Đặc tả Hợp Đồng REST API (API Contract)
### 4.1. `GET /api/v1/branches`
- **Query Parameters**:
  - `keyword` (string, optional): Tìm kiếm theo Code, Name, Address, ManagerName, Phone.
  - `branchCode` (string, optional): Lọc chính xác mã chi nhánh.
  - `status` (string, optional): 'Active' | 'Inactive' | 'all'.
  - `pageIndex` (int, default 1).
  - `pageSize` (int, default 10).
- **Response Format**:
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "11111111-1111-1111-1111-111111111111",
        "code": "BR-01",
        "name": "Chi nhánh Cầu Giấy",
        "address": "123 Đường Cầu Giấy, Q. Cầu Giấy, Hà Nội",
        "phone": "024.3768.9999",
        "managerName": "Nguyễn Văn An",
        "status": "Active",
        "pendingOrdersCount": 3,
        "lastOrderDate": "2026-10-18T10:30:00Z",
        "createdAt": "2026-01-01T00:00:00Z"
      }
    ],
    "totalCount": 5,
    "pageIndex": 1,
    "pageSize": 10,
    "totalPages": 1
  },
  "message": null,
  "errors": []
}
```

### 4.2. `GET /api/v1/branches/{id}`
- Lấy thông tin chi tiết một chi nhánh theo định danh `id`.
