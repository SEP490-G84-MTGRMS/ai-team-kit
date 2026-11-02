# Bản Thiết Kế Chi Tiết (Design Brief): pos-annhien-data-and-staff-logout

## 1. Luồng Người Dùng (User Flow)
1. **Đăng nhập**: Người dùng chọn hoặc nhập tài khoản An Nhiên Mart (`0918889999` hoặc `0917778888`), mật khẩu `123456`.
2. **Quầy POS Bán Hàng**:
   - Giao diện nạp ngay 5 sản phẩm đặc thù: Gạo lứt huyết rồng, Trứng gà thảo mộc, Nước mắm cốt nhĩ, Táo Envy, Sữa tươi Mộc Châu.
   - Thanh tìm kiếm hỗ trợ tra cứu tên, barcode hoặc SKU của các sản phẩm này.
   - Không còn hiển thị banner màu xanh cảnh báo kho trống.
3. **Quản lý Hóa Đơn & Đặt Trước**:
   - Nạp danh sách gồm 2 đơn hàng mẫu: 1 hóa đơn bán lẻ đã hoàn tất (`HD-AN-20261102-001`) và 1 đơn đặt trước cọc VietQR (`PO-AN-20261102-001`).
4. **Đăng xuất Nhân viên**:
   - Nhân viên nhấn nút "Thao tác" ở góc trên bên phải thanh header POS.
   - Dropdown menu hiển thị thêm mục "Đăng xuất tài khoản" với icon màu đỏ (`LogOut`).
   - Nhấn vào mục này $\rightarrow$ gọi `logout()` và điều hướng về `/auth/login`.

## 2. Thiết Kế Giao Diện & Component
- **`PosHeader.tsx`**:
  - Thêm một phân tách (divider) và mục menu mới:
    ```tsx
    {!isStoreOwner && (
      <>
        <div style={{ height: 1, backgroundColor: '#e2e8f0', margin: '4px 0' }} />
        <button
          type="button"
          className="pos-dropdown-item"
          style={{ color: '#dc2626' }}
          onClick={() => {
            setIsMenuOpen(false);
            logout();
            navigate('/auth/login');
          }}
        >
          <LogOut size={16} className="text-red-600" />
          <div className="item-content">
            <div className="item-title" style={{ color: '#dc2626', fontWeight: 600 }}>Đăng xuất tài khoản</div>
            <div className="item-desc">Đăng xuất ca làm việc của nhân viên</div>
          </div>
        </button>
      </>
    )}
    ```
- **`PosCheckoutPage.tsx`**:
  - Xóa bỏ hoàn toàn khối `div` từ dòng 610 đến dòng 630.
  - Cập nhật logic `useState` và `useEffect` khởi tạo dữ liệu: nếu `user?.tenantId === 'tenant_an_nhien_02'`, gán fallback `mockProductsAnNhien` và `mockCustomersAnNhien`.
- **`InvoiceManagementPage.tsx`**:
  - Tương tự, nếu `currentTenantId === 'tenant_an_nhien_02'`, gán fallback `mockInvoicesAnNhien` và `mockPreOrdersAnNhien`.

## 3. Kiến Trúc Dữ Liệu & API
- **`posOrderApi.ts`**:
  - `getAllProducts`:
    ```ts
    const rawList = res.data?.data?.items || (Array.isArray(res.data?.data) ? res.data.data : (Array.isArray(res.data) ? res.data : []));
    ```
  - `getAllCustomers`:
    ```ts
    const rawList = res.data?.data?.items || (Array.isArray(res.data?.data) ? res.data.data : (Array.isArray(res.data) ? res.data : []));
    ```
- **Dữ liệu Mock An Nhiên Mart**:
  - Tích hợp sẵn trong `posMockData.ts` và `inventoryMockData.ts` đảm bảo Offline-First hoạt động 100% ổn định.
