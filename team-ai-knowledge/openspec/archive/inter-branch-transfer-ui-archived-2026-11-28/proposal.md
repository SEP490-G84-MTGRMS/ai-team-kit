# Proposal: inter-branch-transfer-ui
## Phân hệ FE-15: Chuyển hàng Liên chi nhánh (Inter-Branch Inventory Transfer)

---

## 1. Vấn đề
Trong chuỗi cửa hàng bán lẻ và siêu thị mini đa tenant (**MT-GRMS**), các chi nhánh độc lập thường xuyên gặp tình trạng mất cân đối tồn kho cục bộ:
- **Thiếu hàng cục bộ:** Chi nhánh A bị cháy hàng đối với các mặt hàng thiết yếu hoặc bán chạy, trong khi chi nhánh B gần đó có lượng hàng vượt định mức an toàn, hoặc cần điều chuyển gấp để phục vụ đơn đặt hàng trước của khách hàng ([FE-14](file:///d:/FPT_uni/Sesmester_9_Fall_26/Doc/Report-3_Software%20Requirement%20Specification.docx.md#L866)) mà nhà cung cấp chưa kịp bổ sung.
- **Rủi ro thất thoát & sai lệch tồn kho trên đường:** Khi xuất hàng vận chuyển giữa hai kho, nếu không có cơ chế quản lý trạng thái trung gian "Hàng đang chuyển" (`In-Transit`), tồn kho dễ bị bán trùng hoặc ghi nhận âm kho ảo.
- **Mất kiểm soát Lô & Hạn sử dụng (FEFO):** Hàng thực phẩm, đồ uống khi điều chuyển nếu không được bảo toàn số Lô (`BatchNumber`) và Hạn sử dụng (`ExpiryDate`) sẽ gây sai lệch nghiêm trọng thẻ kho và rủi ro cận date/hết hạn.
- **Thiếu minh bạch khi phát sinh chênh lệch:** Khi hàng đến nơi phát sinh bể vỡ, thất thoát hoặc thiếu hàng so với phiếu xuất, hiện tại thiếu quy trình ghi nhận biên bản đối soát và hạch toán hao hụt vận chuyển dẫn đến tranh chấp trách nhiệm giữa kho gửi, kho nhận và bên vận tải.

---

## 2. Mục tiêu
- Xây dựng giao diện và luồng nghiệp vụ hoàn chỉnh cho Phân hệ **FE-15: Inter-Branch Inventory Transfer** trên nền tảng Frontend MT-GRMS (React 19 + TypeScript + Vite + TailwindCSS v4 + Ant Design) tích hợp vào `StoreOwnerLayout` tại route `/dashboard/transfers` và `/store-owner/transfers`.
- Hiện thực hóa đầy đủ 5 Use Cases chuẩn theo đặc tả [Report-3 SRS FE-15](file:///d:/FPT_uni/Sesmester_9_Fall_26/Doc/Report-3_Software%20Requirement%20Specification.docx.md#L2353):
  - **[UC-15.1: View Transfer Order List](file:///d:/FPT_uni/Sesmester_9_Fall_26/Doc/Report-3_Software%20Requirement%20Specification.docx.md#L2353)**: Danh sách phiếu chuyển phân trang, bộ lọc đa tiêu chí (Chi nhánh gửi, Chi nhánh nhận, Trạng thái, Khoảng ngày, Tình trạng nhận hàng), huy hiệu trạng thái thời gian thực (`Draft`, `In-Transit`, `Received`, `Cancelled`), bảo mật phân quyền chi nhánh ([BR-SEC-02](file:///d:/FPT_uni/Sesmester_9_Fall_26/Doc/Report-3_Software%20Requirement%20Specification.docx.md#L4765)).
  - **[UC-15.2: Create Transfer Order](file:///d:/FPT_uni/Sesmester_9_Fall_26/Doc/Report-3_Software%20Requirement%20Specification.docx.md#L2369)**: Khởi tạo phiếu xuất chuyển hàng, chọn chi nhánh gửi/nhận (chặn trùng), tìm kiếm quét mã vạch SKU/Barcode, chọn ĐVT quy đổi, chọn số Lô/Hạn sử dụng FEFO ([BR-TRF-02](file:///d:/FPT_uni/Sesmester_9_Fall_26/Doc/Report-3_Software%20Requirement%20Specification.docx.md#L4767)), kiểm tra tồn khả dụng thời gian thực, lưu nháp hoặc xuất chuyển trừ kho ngay lập tức ([BR-TRF-01](file:///d:/FPT_uni/Sesmester_9_Fall_26/Doc/Report-3_Software%20Requirement%20Specification.docx.md#L4766)).
  - **[UC-15.3: View Transfer Order Detail](file:///d:/FPT_uni/Sesmester_9_Fall_26/Doc/Report-3_Software%20Requirement%20Specification.docx.md#L2385)**: Màn hình chi tiết 360 độ gồm Header tóm tắt, Timeline vòng đời vận chuyển, danh mục hàng hóa (SL chuyển, SL nhận, chênh lệch), nút tác vụ linh hoạt theo ngữ cảnh vai trò chi nhánh.
  - **[UC-15.4: Confirm Receipt](file:///d:/FPT_uni/Sesmester_9_Fall_26/Doc/Report-3_Software%20Requirement%20Specification.docx.md#L2401)**: Màn hình kiểm đếm thực tế khi xe hàng đến chi nhánh nhận; nút "Nhận đủ 100%" hoặc nhập số lượng thực nhận; kiểm soát chênh lệch bắt buộc giải trình (`Discrepancy Note`), ghi tăng tồn kho theo số lượng thực nhận ([BR-TRF-03](file:///d:/FPT_uni/Sesmester_9_Fall_26/Doc/Report-3_Software%20Requirement%20Specification.docx.md#L4768)) và hạch toán số thiếu vào sổ hao hụt ([BR-TRF-04](file:///d:/FPT_uni/Sesmester_9_Fall_26/Doc/Report-3_Software%20Requirement%20Specification.docx.md#L4769)).
  - **[UC-15.5: Cancel Transfer Order](file:///d:/FPT_uni/Sesmester_9_Fall_26/Doc/Report-3_Software%20Requirement%20Specification.docx.md#L2417)**: Hủy phiếu chuyển hàng (chỉ kho gửi hoặc Store Owner [BR-TRF-06](file:///d:/FPT_uni/Sesmester_9_Fall_26/Doc/Report-3_Software%20Requirement%20Specification.docx.md#L4771)), chặn hủy nếu kho nhận đã xác nhận; tự động hoàn tác (Rollback) 100% tồn kho và số lô về lại kho gửi ([BR-TRF-05](file:///d:/FPT_uni/Sesmester_9_Fall_26/Doc/Report-3_Software%20Requirement%20Specification.docx.md#L4770)).

---

## 3. Phạm vi

### 3.1. In scope
1. **Màn hình Danh sách Phiếu chuyển hàng (`TransferListPage`):**
   - Header: Tìm kiếm theo mã phiếu `TRFxxxxxx`, các nút tác vụ `+ Chuyển hàng`, `Import file Excel`, `Xuất file`, in phiếu.
   - Sidebar bộ lọc: Lọc Chi nhánh chuyển đi, Chi nhánh nhận về, Trạng thái phiếu (`Phiếu tạm`, `Đang chuyển`, `Đã nhận`, `Đã hủy`), Thời gian (Ngày chuyển, Ngày nhận, Tháng này, Tùy chỉnh), Tình trạng nhận hàng (Tất cả, Khớp, Không khớp/Lệch).
   - Bảng dữ liệu: Checkbox chọn nhiều, Favorite sao, Mã chuyển hàng, Ngày chuyển, Ngày nhận, Từ chi nhánh, Tới chi nhánh, Giá trị chuyển (VND), Huy hiệu trạng thái màu sắc trực quan.
2. **Màn hình / Form Lập phiếu Chuyển hàng (`CreateTransferPage`):**
   - Thông tin điều chuyển: Chi nhánh gửi (mặc định theo chi nhánh hiện tại), Chi nhánh nhận (dropdown, tự động validate chặn trùng chi nhánh gửi), Ngày hẹn giao, Ghi chú.
   - Thêm sản phẩm: Tìm kiếm theo tên/SKU/quét barcode, chọn ĐVT (Lon/Lốc/Thùng), hiển thị tồn kho hiện tại và tồn kho chi nhánh nhận để đối chiếu.
   - **Modal Chọn Lô & Hạn sử dụng (`SelectBatchModal` - BR-TRF-02):** Danh sách các lô còn tồn kho, cảnh báo lô hết hạn, chọn số lượng xuất theo thứ tự ưu tiên hạn dùng gần (FEFO).
   - Kiểm tra tồn khả dụng: Chặn xuất và bôi đỏ nếu `SentQty > AvailableQty`.
   - Nút hành động: `Lưu tạm (Draft)` và `Xuất chuyển hàng (In-Transit)`.
   - **Modal Thêm sản phẩm từ file Excel (`ImportTransferExcelModal`):** Cho phép tải file mẫu và import hàng loạt mặt hàng vào phiếu.
3. **Màn hình Xác nhận Nhập kho (`ReceiveTransferPage`):**
   - Lọc phân loại kiểm đếm: Tab `Tất cả`, `Khớp`, `Lệch`, `Chưa nhận`.
   - Bảng kiểm đếm: Tên hàng, ĐVT, Tồn kho hiện tại, SL chuyển, ô nhập `SL nhận` (`ReceivedQty`), Đơn giá chuyển, Thành tiền thực tế.
   - Nút tiện ích `Nhận đủ tất cả` (gán 100% `ReceivedQty = SentQty`).
   - Xử lý chênh lệch: Khi `ReceivedQty < SentQty`, bắt buộc nhập `Discrepancy Note` (Lý do thiếu hụt / bể vỡ); chặn xác nhận nếu bỏ trống lý do.
   - Hoàn tất: Bấm `Xác nhận nhập kho` chuyển trạng thái sang `Received`.
4. **Màn hình / Modal Chi tiết Phiếu chuyển 360 độ (`TransferDetailPage`):**
   - Header thông tin tổng quan: Mã phiếu, Thời gian, Chi nhánh gửi & nhận, Tổng giá trị chuyển, Huy hiệu trạng thái.
   - Tab chi tiết hàng chuyển: Bảng danh sách hàng hóa kèm số lượng gửi, số lượng nhận, chênh lệch thực tế, Lô/Date và ghi chú giải trình.
   - Thanh tác vụ ngữ cảnh:
     - Tại chi nhánh nhận: Hiển thị nút `Nhận hàng` (dẫn tới màn hình kiểm đếm).
     - Tại chi nhánh gửi / Store Owner: Hiển thị nút `Hủy phiếu chuyển` (bật `CancelTransferModal`).
     - In phiếu chuyển kho kiêm biên bản giao nhận.
5. **Modal Hủy Phiếu chuyển & Hoàn tác (`CancelTransferModal`):**
   - Hộp thoại xác nhận hủy phiếu với cảnh báo tự động hoàn trả tồn kho về kho gửi ([BR-TRF-05](file:///d:/FPT_uni/Sesmester_9_Fall_26/Doc/Report-3_Software%20Requirement%20Specification.docx.md#L4770)).
   - Bắt buộc nhập `Lý do hủy` trước khi kích hoạt lệnh hủy.
6. **Thực thi các Quy tắc nghiệp vụ (Business Rules):**
   - **[BR-SEC-02](file:///d:/FPT_uni/Sesmester_9_Fall_26/Doc/Report-3_Software%20Requirement%20Specification.docx.md#L4765):** Phân quyền phạm vi chi nhánh (Nhân viên chỉ thấy phiếu của chi nhánh mình tham gia; Store Owner xem toàn chuỗi).
   - **[BR-TRF-01](file:///d:/FPT_uni/Sesmester_9_Fall_26/Doc/Report-3_Software%20Requirement%20Specification.docx.md#L4766):** Trừ tồn kho chi nhánh gửi ngay khi chuyển sang trạng thái `In-Transit`.
   - **[BR-TRF-02](file:///d:/FPT_uni/Sesmester_9_Fall_26/Doc/Report-3_Software%20Requirement%20Specification.docx.md#L4767):** Bảo toàn Lô - Hạn sử dụng theo FEFO.
   - **[BR-TRF-03](file:///d:/FPT_uni/Sesmester_9_Fall_26/Doc/Report-3_Software%20Requirement%20Specification.docx.md#L4768):** Chỉ ghi nhận tăng tồn kho chi nhánh nhận theo số lượng thực nhận.
   - **[BR-TRF-04](file:///d:/FPT_uni/Sesmester_9_Fall_26/Doc/Report-3_Software%20Requirement%20Specification.docx.md#L4769):** Ghi nhận hao hụt vào sổ thất thoát vận chuyển khi phát sinh thiếu hụt.
   - **[BR-TRF-05](file:///d:/FPT_uni/Sesmester_9_Fall_26/Doc/Report-3_Software%20Requirement%20Specification.docx.md#L4770):** Hoàn trả 100% tồn kho và số lô về kho gửi khi hủy phiếu.
   - **[BR-TRF-06](file:///d:/FPT_uni/Sesmester_9_Fall_26/Doc/Report-3_Software%20Requirement%20Specification.docx.md#L4771):** Kiểm tra thẩm quyền hủy (chặn chi nhánh nhận tự ý hủy phiếu của kho gửi).

### 3.2. Out of scope
- Phân hệ định tuyến xe tải GPS thời gian thực (nằm ngoài phạm vi của Web/POS MT-GRMS).
- Thanh toán cước vận tải đối ngoại với đơn vị 3PL (quản lý ở phân hệ Chi phí vận hành FE-07).

---

## 4. Người dùng liên quan
- **Store Owner (Chủ chuỗi cửa hàng):** Toàn quyền xem, điều phối, phê duyệt và hủy các phiếu chuyển hàng trên toàn bộ mạng lưới chi nhánh.
- **Dispatching Staff (Nhân viên / Kế toán kho gửi):** Lập phiếu chuyển, chọn hàng và lô/date, bấm xuất chuyển hàng đi, hủy phiếu khi có sự cố.
- **Receiving Staff (Nhân viên kho nhận):** Xem danh sách hàng đang trên đường tới chi nhánh mình, kiểm đếm dỡ hàng, nhập số lượng thực nhận và ghi chú giải trình chênh lệch.

---

## 5. Tiêu chí thành công
- [ ] **SC-01:** Khởi tạo thành công phiếu chuyển hàng tự sinh mã `TRFxxxxxx`, tự động chặn chọn trùng chi nhánh nhận = chi nhánh gửi.
- [ ] **SC-02:** Chọn được sản phẩm kèm Lô & Hạn sử dụng theo FEFO; kiểm tra tồn kho tức thì (chặn xuất khi `SentQty > AvailableQty`).
- [ ] **SC-03:** Trạng thái `In-Transit` trừ ngay tồn kho khả dụng tại chi nhánh gửi ([BR-TRF-01](file:///d:/FPT_uni/Sesmester_9_Fall_26/Doc/Report-3_Software%20Requirement%20Specification.docx.md#L4766)).
- [ ] **SC-04:** Màn hình xác nhận nhận hàng hỗ trợ nút "Nhận đủ tất cả" và kiểm soát chênh lệch (bắt buộc nhập lý do khi `ReceivedQty < SentQty`).
- [ ] **SC-05:** Khi hoàn tất nhận hàng, tồn kho chi nhánh đích được cộng chính xác theo `ReceivedQty` ([BR-TRF-03](file:///d:/FPT_uni/Sesmester_9_Fall_26/Doc/Report-3_Software%20Requirement%20Specification.docx.md#L4768)); phần chênh lệch được ghi nhận vào sổ hao hụt ([BR-TRF-04](file:///d:/FPT_uni/Sesmester_9_Fall_26/Doc/Report-3_Software%20Requirement%20Specification.docx.md#L4769)).
- [ ] **SC-06:** Thao tác hủy phiếu thành công tự động hoàn tác 100% tồn kho và số lô về lại kho gửi ([BR-TRF-05](file:///d:/FPT_uni/Sesmester_9_Fall_26/Doc/Report-3_Software%20Requirement%20Specification.docx.md#L4770)); chặn chi nhánh nhận tự ý hủy phiếu ([BR-TRF-06](file:///d:/FPT_uni/Sesmester_9_Fall_26/Doc/Report-3_Software%20Requirement%20Specification.docx.md#L4771)).
- [ ] **SC-07:** Tích hợp menu và routing hoàn chỉnh vào `StoreOwnerLayout` và `AppTopNav` (menu "Chuyển hàng" / "Điều chuyển kho").
- [ ] **SC-08:** Giao diện tuân thủ 100% Design System Deep Teal (`#0F766E`), bo tròn KiotViet và vượt qua kiểm thử build `npm run build` không lỗi.
