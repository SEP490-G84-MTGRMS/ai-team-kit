# Đề xuất sửa lỗi: Cải thiện bố cục in hóa đơn, hiển thị động người tạo/thu ngân và chọn đơn vị cho đơn đặt trước

## 1. Vấn đề & Mô tả lỗi
1. **Lệch/chèn dòng khi in hóa đơn nhiệt POS-58**:
   - Khi sản phẩm có tên dài (vượt quá độ rộng cột ~18 ký tự trên khổ giấy nhiệt 58mm/43mm, Font B 40 ký tự), tên hàng ngắt dòng làm các số liệu (Số lượng, Đơn giá, Thành tiền) và các dòng mặt hàng phía dưới bị chèn ép, khó đọc và mất thẩm mỹ.
2. **Gán cứng tên thu ngân / người tạo đơn**:
   - Trong `ThermalPrintService.cs`, `cashier` bị gán cứng `"Thu ngan"`.
   - Trong `InvoiceManagementPage.tsx`, huy hiệu thu ngân gán cứng `"NV: Nguyễn Bá Sơn (NV004)"` và danh sách hóa đơn hiển thị `"Thu ngân quầy"` thay vì lấy đúng tên nhân viên làm ca hoặc nếu là Chủ cửa hàng thì hiển thị `"Chủ cửa hàng: [Tên]"`.
3. **Thiếu chọn đơn vị tính (thùng, lốc, hộp, kg, tấn) trong Đặt trước**:
   - Trong modal "+ Tạo Đơn Đặt Trước" (`CreatePreOrderModal.tsx`), mặt hàng chỉ dùng đơn vị cơ bản và giá bán lẻ cơ bản (`basePrice`), không cho nhân viên/khách chọn đơn vị quy đổi (Thùng 24 hộp, Lốc 6 lon, Tấn, v.v.) và backend `CreatePreOrderAsync` chưa nhân tỷ lệ quy đổi khi giữ tồn kho.

## 2. Bước tái hiện
1. Thực hiện in hóa đơn có mặt hàng tên dài (ví dụ: `Bánh Orion Choco-Pie truyền thống Hộp 12 cái`) qua máy in nhiệt POS-58 -> Dòng tên hàng và số liệu bị dính và xô lệch với dòng tiếp theo.
2. Đăng nhập bằng tài khoản Chủ cửa hàng hoặc nhân viên khác, kiểm tra hóa đơn in ra và trang Quản lý hóa đơn -> Thấy cố định `"Thu ngan"` và `"Nguyễn Bá Sơn (NV004)"`.
3. Mở modal Tạo đơn đặt trước giữ kho -> Không có dropdown chọn đơn vị đóng gói (Thùng/Lốc/Hộp), giá luôn tính theo đơn vị lẻ.

## 3. Kết quả thực tế vs Kết quả mong đợi
- **Thực tế**: Bố cục in 4 cột trên 40 ký tự bị vỡ khi tên hàng dài; Người lập đơn không phản ánh đúng phiên làm việc của nhân viên ca hoặc chủ cửa hàng; Không đặt trước theo thùng/lốc được.
- **Mong đợi**:
  - Hóa đơn nhiệt áp dụng bố cục 2 dòng chuẩn siêu thị mini (Dòng 1: STT + Tên hàng ngắt chữ nguyên vẹn; Dòng 2: `   SL x Đơn giá` thụt lề trái, `Thành tiền` căn sát lề phải tại cột 40) -> Hoàn toàn không bao giờ bị chèn/đè chữ.
  - Tên người tạo/thu ngân thể hiện đúng vai trò và họ tên người dùng đang đăng nhập (`user.fullName`, chức danh Chủ cửa hàng / Thu ngân).
  - Modal Đặt trước cho phép chọn đơn vị tính linh hoạt từ danh sách đơn vị quy đổi của sản phẩm (`unitPrices`), tự động tính lại đơn giá niêm yết, thành tiền và trừ kho theo `conversionRate`.

## 4. Phạm vi & Mức độ ảnh hưởng
- **Phạm vi tác động**:
  - Backend: `ThermalPrintService.cs`, `IThermalPrintService.cs`, `OrderService.cs`, `OrderDtos.cs`.
  - Frontend: `CreatePreOrderModal.tsx`, `InvoiceManagementPage.tsx`, `PosCheckoutPage.tsx`, `PosReceiptModal.tsx`.
- **Mức độ ảnh hưởng**: Cao đối với trải nghiệm bán hàng tại quầy thực tế và tính chính xác của hóa đơn bán lẻ.

## 5. Tiêu chí coi là đã sửa (Acceptance Criteria)
1. In hóa đơn nhiệt POS-58 hiển thị bố cục 2 dòng chuẩn, rõ ràng, không đứt chữ, không chèn đè dòng số liệu.
2. Hóa đơn in nhiệt và trang Quản lý hóa đơn hiển thị đúng tên người tạo: `"Chủ cửa hàng: [Tên]"` hoặc `"[Tên nhân viên]"`.
3. Modal Tạo đơn đặt trước có combobox chọn đơn vị quy đổi; số lượng và giá tự động tính đúng; backend giữ kho đúng số lượng quy đổi.
4. Kiểm thử Backend unit tests và Frontend build thành công 100%.
