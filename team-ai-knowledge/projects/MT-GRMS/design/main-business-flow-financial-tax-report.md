# 📑 BÁO CÁO THIẾT KẾ QUY TRÌNH KINH DOANH CHÍNH (MAIN BUSINESS FLOWS)
## BỘ BIỂU ĐỒ HOẠT ĐỘNG PHÂN LÀN (SWIMLANE ACTIVITY DIAGRAMS) AS-IS & TO-BE
### Phân hệ: Quản Lý Tài Chính, Sổ Quỹ, Sổ Sách Kế Toán & Thuế Đa Chi Nhánh (MT-GRMS)
**Sinh viên thực hiện:** Nguyễn Trường An  
**Mã phân hệ phụ trách:** `FE-07`, `FE-08`, `FE-10`, `FE-17`, `FE-19`  
**Chuẩn biểu diễn:** UML 2.5 Activity Diagram (BPMN Swimlane Style) — Đa nhánh rẽ (Multi-branch), Vòng lặp (Loops), Điểm quyết định (Decision Diamonds) và Điểm hợp nhất (Merge Diamonds).

---

## 1. PHÂN TÍCH CHUẨN FORMAT BIỂU ĐỒ THEO YÊU CẦU ĐỒ ÁN

Đối chiếu trực tiếp với hình ảnh biểu mẫu chuẩn của đồ án:
1. **Bản chất nghiệp vụ đa nhánh (Non-linear Multi-branch Logic):**
   - Một Quy trình Kinh doanh Chính (Main Business Flow) phản ánh chu trình vận hành hoàn chỉnh từ sự kiện kích hoạt (Trigger/Start) đến kết quả cuối cùng (Outcome/Stop).
   - Biểu đồ **không được là một đường thẳng tuột (đơn luồng)** hay chuỗi domino gượng ép; mà phải chứa đầy đủ các tình huống nghiệp vụ thực tế:
     - **Điểm quyết định (Decision Diamond):** Phân nhánh dựa trên các điều kiện rõ ràng (`[Yes]`, `[No]`, `[Tiền mặt]`, `[VietQR]`, `[Dưới hạn mức]`, `[Vượt hạn mức]`, v.v.).
     - **Vòng lặp (Repeat Loops):** Xử lý lặp qua danh sách (như kiểm tra từng mặt hàng khi tính tiền).
     - **Điểm hợp nhất (Merge Diamond):** Gom các nhánh rẽ về một luồng chung trước khi chuyển bước hoặc kết thúc (`stop`).
2. **Quy tắc tạo hình khối (Aesthetic & Geometry):**
   - **Tỷ lệ khối gần vuông (Compact Box):** Tất cả các nhãn hoạt động được chủ động ngắt dòng bằng ký tự xuống dòng (`\n`) sau mỗi 15–20 ký tự. Điều này ngăn chặn hiện tượng hộp bị kéo dãn nằm ngang làm vỡ bố cục swimlane.
   - **Bảng màu nhận diện:** Hoạt động và hình thoi sử dụng nền xanh lam nhạt (`#A9D8FF`), viền đen mảnh (`1.2px`), chữ đen căn giữa rõ ràng.
   - **Đường nối vuông góc (Orthogonal Routing):** Mũi tên kết nối chạy vuông góc, không chồng chéo, phản ánh sự tương tác tự nhiên giữa các làn (Swimlanes).
3. **Phạm vi phân quyền & Ranh giới hệ thống:**
   - Mỗi làn (Swimlane) đại diện cho một tác nhân duy nhất: Khách hàng / Nhân viên chi nhánh / Hệ thống MT-GRMS / Chủ cửa hàng / Cơ quan Thuế.
   - Ranh giới của MT-GRMS: Hệ thống **kết thúc ở bước tạo và kết xuất hồ sơ sổ sách kế toán chuẩn luật** để chủ hộ tải về máy tính lưu trữ hoặc nộp báo cáo; hệ thống **không can thiệp nộp tự động qua API cơ quan thuế**.

---

## 2. TỔNG HỢP 3 QUY TRÌNH KINH DOANH CHÍNH (MAIN BUSINESS FLOWS)

Toàn bộ phạm vi trách nhiệm của Nguyễn Trường An được phân rã thành **3 Quy trình Kinh doanh độc lập**, tương ứng 3 cặp biểu đồ **AS-IS** (Hiện trạng thủ công) và **TO-BE** (Chuẩn hóa số trên MT-GRMS):

| STT | Tên Quy Trình Nghiệp Vụ Chính | Mã Phân Hệ | Tác Nhân Tham Gia (Swimlanes) | Điểm Quyết Định Cốt Lõi |
|---|---|---|---|---|
| **Luồng 1** | **Chi phí vận hành & Chi quỹ tiền mặt/ngân hàng** (*Operational Expenses & Cash Disbursement*) | `FE-07`<br>`FE-17`<br>`FE-10` | • Đơn vị dịch vụ/Chủ nhà<br>• Nhân viên/Quản lý chi nhánh<br>• Hệ thống MT-GRMS<br>• Chủ chuỗi (Store Owner) | • Chủ có mặt tại quầy?<br>• Chi phí vượt hạn mức tự duyệt?<br>• Chủ duyệt hay từ chối?<br>• Nguồn chi: Két quầy vs Tài khoản số? |
| **Luồng 2** | **Quản lý bán chịu & Thu hồi công nợ khách hàng** (*Customer Credit Control & AR Settlement*) | `FE-08`<br>`FE-17`<br>`FE-10` | • Khách hàng (Customer)<br>• Nhân viên thu ngân mPOS<br>• Hệ thống MT-GRMS | • Khách mua mới xin nợ hay Khách trả nợ cũ?<br>• Có vượt hạn mức nợ / nợ quá hạn?<br>• Kênh trả nợ: Tiền mặt vs Dynamic VietQR? |
| **Luồng 3** | **Giám sát ngưỡng doanh thu, Phân nhóm thuế & Xuất sổ kế toán** (*Tax Monitoring & Statutory Ledger Export*) | `FE-10`<br>`FE-19` | • Chủ chuỗi (Store Owner)<br>• Hệ thống MT-GRMS<br>• Máy tính cá nhân / Kế toán | • Doanh thu YTD thuộc Nhóm 1, 2 hay 3?<br>• Lựa chọn phương pháp tính thuế (Nhóm 2)?<br>• Đóng gói Sổ S1a hay Trọn bộ 6 Sổ (S2a–S2e, S3a)? |

---

## 3. CHI TIẾT CÁC LUỒNG NGHIỆP VỤ (AS-IS & TO-BE)

### 3.1. LUỒNG 1: QUẢN LÝ CHI PHÍ VẬN HÀNH & CHI QUỸ (FE-07 & FE-17)

#### A. Hiện trạng AS-IS (Chi tiền tự phát, rách hóa đơn & nghi ngờ thất thoát)
- **Kịch bản:** Nhân viên điện lực/chủ nhà đưa hóa đơn đến chi nhánh đòi tiền.
- **Rẽ nhánh nghiệp vụ:**
  - Nếu chủ có mặt: Chủ móc tiền túi hoặc chuyển khoản cá nhân trả $\rightarrow$ Vứt hóa đơn vào góc, không ghi chép sổ sách.
  - Nếu chủ vắng mặt: Nhân viên gọi điện xin phép:
    - Nếu chủ không nghe máy/từ chối: Hẹn quay lại sau $\rightarrow$ Nguy cơ bị cắt điện nước, gián đoạn kinh doanh.
    - Nếu chủ đồng ý miệng: Nhân viên tự mở ngăn kéo lấy tiền mặt trả $\rightarrow$ Kẹp hóa đơn dưới hộc bàn $\rightarrow$ Đến cuối ca quên ghi chú.
  - **Hậu quả:** Chủ chuỗi kiểm tra két thấy thiếu tiền so với doanh số bán. Nếu tìm lại được hóa đơn thì tự bù trừ trong ấm ức; nếu hóa đơn bị quét rác mất thì nảy sinh nghi ngờ nhân viên trộm cắp, gây mâu thuẫn nội bộ.

#### B. Mục tiêu TO-BE (Số hóa phiếu chi, phê duyệt phân quyền & tự động ghi sổ)
- **Kịch bản:** Hóa đơn dịch vụ đưa tới chi nhánh.
- **Rẽ nhánh nghiệp vụ:**
  - Nhân viên mở `FE-07`, chụp ảnh hóa đơn và nhập số tiền.
  - MT-GRMS kiểm tra hạn mức tự duyệt của chi nhánh (ví dụ: $\le 500.000$ VNĐ):
    - **Dưới hạn mức:** Tự động duyệt ngay lập tức.
    - **Vượt hạn mức:** Gửi thông báo đẩy (Push Notification) đến điện thoại Chủ chuỗi $\rightarrow$ Chủ chuỗi xem ảnh chứng từ và quyết định: *Từ chối* (hủy phiếu) hoặc *Phê duyệt*.
  - Sau khi duyệt, lựa chọn nguồn tiền chi:
    - **Két tiền mặt chi nhánh:** Rút tiền mặt két quầy trả $\rightarrow$ Hệ thống tự sinh **Phiếu Chi Tiền Mặt** trong Sổ quỹ (`FE-17`), trừ số dư két quầy chi nhánh đó.
    - **Tài khoản ngân hàng số:** Chủ thực hiện chuyển khoản số $\rightarrow$ Hệ thống sinh **Phiếu Chi Ngân Hàng** trong Sổ quỹ (`FE-17`), trừ số dư tài khoản số tập trung.
  - **Tự động hóa kế toán:** Hệ thống tự động ghi nhận vào **Sổ Chi phí Sản xuất Kinh doanh (`S2c-HKD`)** và trừ vào Báo cáo Lợi nhuận P&L (`FE-10`) của chi nhánh đó.

---

### 3.2. LUỒNG 2: BÁN CHỊU & THU HỒI CÔNG NỢ KHÁCH HÀNG (FE-08 & FE-17)

#### A. Hiện trạng AS-IS (Chuẩn theo hình ảnh biểu mẫu của nhóm)
- **Kịch bản:** Khách hàng mang hàng ra quầy tính tiền.
- **Rẽ nhánh nghiệp vụ:**
  - Nhân viên kiểm tra và tính tiền thủ công (vòng lặp cho từng món).
  - Khách hỏi mua nợ không?
    - Không: Khách trả tiền mặt ngay $\rightarrow$ Cất tiền vào ngăn kéo $\rightarrow$ Kết thúc.
    - Có: Nhân viên/Chủ xem xét có cho nợ không?
      - Không: Từ chối bán chịu $\rightarrow$ Yêu cầu trả ngay hoặc hủy đơn cất đồ lại.
      - Có: Mở cuốn sổ tay vật lý ghi: Tên khách, ngày nợ, số tiền.
  - **Khi trả nợ sau này:** Khách mang tiền đến trả $\rightarrow$ Chủ lật sổ tìm tên $\rightarrow$ Dùng bút mực gạch ngang tên $\rightarrow$ Nhét tiền vào túi cá nhân. Nếu khách trả một phần thì dễ tính nhầm số nợ còn lại; nếu sổ rách nát hoặc mất là mất trắng tiền nợ.

#### B. Mục tiêu TO-BE (Được phân rã thành 2 biểu đồ chuẩn hóa, sạch sẽ, không chồng chéo)
Để tránh hiện tượng Graphviz bị nén ép đồ thị (layout collision) khi gộp hai sự kiện khác thời điểm vào một biểu đồ, quy trình TO-BE của Công nợ được chuẩn hóa thành 2 sơ đồ độc lập:

1. **Biểu đồ TO-BE 2 (Chính — Đối ứng 1:1 với AS-IS của nhóm): `TO_BE_Flow2_CustomerCredit_POS`**
   - **Kịch bản:** Khách hàng mua giỏ hàng tại quầy và đề nghị mua chịu nợ.
   - **Quy trình:**
     - Khách mang hàng đến quầy $\rightarrow$ Thu ngân quét mã vạch trên mPOS $\rightarrow$ MT-GRMS tính tổng tiền.
     - Khách xem tổng tiền: Có xin mua nợ không?
       - **Không (Trả tiền ngay):** Khách trả tiền mặt hoặc quét VietQR $\rightarrow$ MT-GRMS sinh Phiếu thu Sổ quỹ (`FE-17`), ghi nhận doanh thu Sổ `S2a-HKD` $\rightarrow$ Giao hàng $\rightarrow$ Kết thúc.
       - **Có (Mua nợ):** Thu ngân chọn hồ sơ khách $\rightarrow$ MT-GRMS tự động thẩm định tín dụng (`FE-08`): Kiểm tra hạn mức nợ và nợ quá hạn:
         - *Từ chối (Vượt hạn mức/Quá hạn):* Hiện cảnh báo đỏ $\rightarrow$ Bắt buộc trả ngay (Nếu trả thì hoàn tất, nếu không thì hủy giỏ trả hàng về kệ).
         - *Phê duyệt (Hợp lệ):* Thu ngân xác nhận $\rightarrow$ MT-GRMS sinh hồ sơ nợ AR (`FE-08`), tăng số dư nợ, gửi tin nhắn Zalo/SMS nợ tự động cho khách $\rightarrow$ Giao hàng kèm hóa đơn nợ $\rightarrow$ Kết thúc.

2. **Biểu đồ TO-BE 2B (Bổ trợ thu hồi nợ): `TO_BE_Flow2B_DebtSettlement_Recovery`**
   - **Kịch bản:** Khách hàng đến quầy chi nhánh hoặc quét mã từ xa để trả khoản nợ cũ.
   - **Quy trình:**
     - Thu ngân tra cứu hồ sơ khách trên `FE-08`, hiển thị các hóa đơn nợ chưa trả.
     - Khách lựa chọn kênh trả nợ:
       - **Tiền mặt tại quầy:** Khách đưa tiền $\rightarrow$ Thu ngân nhận tiền bỏ két quầy $\rightarrow$ MT-GRMS sinh **Phiếu Thu Tiền Mặt** trong Sổ quỹ (`FE-17`), tăng số dư két quầy chi nhánh.
       - **Chuyển khoản Dynamic VietQR:** Thu ngân chọn VietQR $\rightarrow$ MT-GRMS tạo mã QR động chứa đúng số tiền nợ $\rightarrow$ Khách quét app ngân hàng thanh toán $\rightarrow$ Webhook ngân hàng xác nhận $\rightarrow$ MT-GRMS sinh **Phiếu Thu Ngân Hàng** trong Sổ quỹ (`FE-17`).
     - MT-GRMS tự động giảm trừ công nợ (AR), đánh dấu hóa đơn "Đã Tất Toán", phục hồi hạn mức tín dụng cho khách hàng.
     - Thu ngân in/gửi biên lai xác nhận tất toán cho khách $\rightarrow$ Kết thúc.

---

### 3.3. LUỒNG 3: GIÁM SÁT DOANH THU THUẾ, PHÂN NHÓM & XUẤT SỔ SÁCH (FE-10 & FE-19)

#### A. Hiện trạng AS-IS (Kinh doanh không sổ sách, thuế ấn định & truy thu)
- **Kịch bản:** Cửa hàng vận hành chuỗi nhưng không dùng phần mềm sổ sách kế toán; dòng tiền kinh doanh trộn lẫn tài khoản cá nhân.
- **Rẽ nhánh nghiệp vụ:**
  - Cơ quan thuế thanh tra dữ liệu dòng tiền qua tài khoản ngân hàng và đối soát hóa đơn điện tử đầu vào từ nhà phân phối.
  - Cơ quan thuế yêu cầu: *Chủ chuỗi có xuất trình được chứng từ hóa đơn, sổ sách kế toán chứng minh chi phí hợp lệ trong 3 năm không?*
    - *Nếu có sổ sách:* Nộp thẩm tra (thực tế hầu như không có do làm mất hóa đơn).
    - *Nếu không có sổ sách:* Cơ quan thuế bác bỏ toàn bộ chi phí tự kê khai $\rightarrow$ Áp dụng biện pháp **Ấn định doanh thu khoán** $\rightarrow$ Truy thu thuế GTGT và TNCN trên toàn bộ dòng tiền ngân hàng $\rightarrow$ Phạt trốn thuế 20% và phạt chậm nộp 0.03%/ngày. Chủ chuỗi gánh chịu thiệt hại nặng nề.

#### B. Mục tiêu TO-BE (Giám sát ngưỡng doanh thu tự động & Đóng gói trọn bộ sổ sách)
- **Kịch bản:** Định kỳ hàng quý hoặc cuối năm tài chính, Chủ chuỗi truy cập phân hệ Thuế & Sổ sách Kế toán (`FE-19`).
- **Rẽ nhánh nghiệp vụ:**
  - MT-GRMS tự động tổng hợp Doanh thu lũy kế năm (YTD) từ tất cả các chi nhánh:
    - **Nhóm 1 ($\le 1$ Tỷ VNĐ/năm):** Hệ thống hiển thị trạng thái Miễn thuế, tự động sinh mẫu Sổ đơn giản `S1a-HKD`. Nếu YTD $> 850$ Triệu VNĐ, hệ thống kích hoạt cảnh báo vàng "Sắp chạm ngưỡng chuyển Nhóm 2".
    - **Nhóm 2 ($> 1 - 3$ Tỷ VNĐ/năm):** Cảnh báo bắt buộc sử dụng Hóa đơn điện tử máy tính tiền. Chủ hộ chọn phương pháp tính thuế:
      - *Phương pháp 1 (% Doanh thu):* Đóng gói Sổ `S2a-HKD` (Thuế 1% GTGT + 0.5% TNCN).
      - *Phương pháp 2 (Kê khai chi phí/lợi nhuận 15%):* Đóng gói trọn bộ 6 sổ kế toán (`S2a` đến `S2e`, `S3a`).
    - **Nhóm 3 ($> 3 - 50$ Tỷ VNĐ/năm — Mô hình Chuỗi đa chi nhánh):** Hệ thống **khóa cứng phương pháp tính theo Chi phí/Lợi nhuận (17%)**; tự động kiểm tra tính hợp lệ của toàn bộ chi phí vận hành (`FE-07`), giá vốn kho và lương nhân viên; bắt buộc trọn bộ 6 sổ kế toán.
  - Chủ chuỗi kiểm tra bảng đối soát P&L (`FE-10`) và bấm nút **"Xuất Trọn Bộ Hồ Sơ Sổ Sách Thuế"**.
  - MT-GRMS tạo các file Excel & PDF chuẩn mẫu Thông tư 88/2021/TT-BTC có mã định danh kiểm toán (Audit Hash).
  - Tải bộ file về máy tính cá nhân để phục vụ nộp báo cáo hoặc tiếp đoàn thanh tra thuế minh bạch.

---

## 4. HƯỚNG DẪN RENDER BIỂU ĐỒ TRONG TÀI LIỆU VÀ TRÊN IDE

Toàn bộ mã nguồn PlantUML của 3 cặp quy trình trên được lưu trữ đầy đủ tại:
👉 `nguyen_truong_an_financial_tax_multibranch_design.puml`

### Danh sách các Diagram Name sẵn sàng render:
1. `AS_IS_Flow1_ServiceExpense_CashDisbursement`
2. `TO_BE_Flow1_ServiceExpense_CashDisbursement`
3. `AS_IS_Flow2_CustomerCredit_ManualDebt` *(Tái hiện chuẩn 100% theo ảnh mẫu)*
4. `TO_BE_Flow2_CustomerCredit_DebtRecovery`
5. `AS_IS_Flow3_TaxAudit_WithoutBooks`
6. `TO_BE_Flow3_TaxMonitoring_LedgerExport`

Các biểu đồ này được thiết kế tương thích hoàn toàn với extension PlantUML trong VS Code / Antigravity IDE, đồng thời render chuẩn xác trên trang web [PlantText](https://www.planttext.com/) hoặc [PlantUML Online Server](https://www.plantuml.com/plantuml/).
