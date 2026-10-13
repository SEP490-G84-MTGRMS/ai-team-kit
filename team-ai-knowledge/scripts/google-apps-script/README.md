# Hướng dẫn Thiết lập Google Apps Script & 5 File Report Kiểm thử

Tài liệu này hướng dẫn chi tiết cách đưa 5 file Excel mẫu lên Google Drive thành Google Sheets, cấu hình mã nguồn `Code.gs` và lấy Web App URL để tích hợp đồng bộ tự động với `ai-team-kit`.

---

## Bước 1: Đưa 5 File Excel lên Google Drive thành Google Sheets

5 file mẫu nằm tại thư mục: `d:\Sourse_code_Do_An\Tham_khao\`:
1. `Report-5.1_Unit Test.xls`
2. `Report-5.2_Integration Test.xlsx`
3. `Report-5.3_System Test_FRs.xlsx`
4. `Report-5.4_System Test_NFRs.xlsx`
5. `Report-5.5_Acceptance Test Scripts.xlsx`

### Cách thực hiện:
1. Truy cập [Google Drive](https://drive.google.com).
2. Tạo 1 thư mục mới, ví dụ: `MT_GRMS_Test_Reports`.
3. Kéo thả cả 5 file trên vào thư mục này.
4. **Quan trọng**: Mở từng file lên và chọn **Tệp (File)** > **Lưu dưới dạng Google Trang tính (Save as Google Sheets)**.
5. Sau khi mở dưới dạng Google Sheets, nhìn lên thanh địa chỉ trình duyệt (URL) để lấy **Spreadsheet ID**:
   - Định dạng URL: `https://docs.google.com/spreadsheets/d/`**`<SPREADSHEET_ID>`**`/edit`
   - Ví dụ: `1A2b3C4d5E6F...` chính là Spreadsheet ID.

Ghi lại 5 ID này tương ứng:
- ID 5.1: `...`
- ID 5.2: `...`
- ID 5.3: `...`
- ID 5.4: `...`
- ID 5.5: `...`

---

## Bước 2: Tạo Google Apps Script Project

Bạn có thể tạo Apps Script độc lập hoặc gắn vào file `Report-5.1`:
1. Truy cập [script.google.com](https://script.google.com) hoặc trong file Google Sheet chọn menu **Tiện ích mở rộng (Extensions)** > **Apps Script**.
2. Đặt tên dự án là: `MT-GRMS-Test-Report-Gateway`.
3. Mở file `Code.gs` và dán toàn bộ nội dung từ file [Code.gs](./Code.gs) vào.
4. Cập nhật biến `CONFIG`:
   ```javascript
   const CONFIG = {
     API_KEY: 'MT_GRMS_TEST_SECRET_2026', // Bạn có thể đổi mật khẩu nếu muốn
     SPREADSHEET_IDS: {
       '5.1': 'DÁN_ID_CỦA_SHEET_5_1_VÀO_ĐÂY',
       '5.2': 'DÁN_ID_CỦA_SHEET_5_2_VÀO_ĐÂY',
       '5.3': 'DÁN_ID_CỦA_SHEET_5_3_VÀO_ĐÂY',
       '5.4': 'DÁN_ID_CỦA_SHEET_5_4_VÀO_ĐÂY',
       '5.5': 'DÁN_ID_CỦA_SHEET_5_5_VÀO_ĐÂY',
     }
   };
   ```
5. Bấm biểu tượng **Lưu (Save / Ctrl+S)**.

---

## Bước 3: Triển khai (Deploy) thành Web App

1. Ở góc trên bên phải giao diện Apps Script, bấm nút **Triển khai (Deploy)** > **Triển khai mới (New deployment)**.
2. Bấm vào biểu tượng bánh răng ⚙️ bên cạnh "Chọn loại (Select type)", chọn **Ứng dụng web (Web app)**.
3. Điền thông tin:
   - **Mô tả (Description)**: `Test Report Gateway v1`
   - **Thực thi dưới dạng (Execute as)**: **Tôi (Me / email của bạn)**
   - **Ai có quyền truy cập (Who has access)**: **Bất kỳ ai (Anyone)** *(Bắt buộc chọn Anyone để MCP Server từ máy gọi tới được; bảo mật sẽ do API_KEY đảm nhiệm)*.
4. Bấm **Triển khai (Deploy)**.
5. Google sẽ yêu cầu bạn cấp quyền truy cập Google Sheets:
   - Bấm **Ủy quyền truy cập (Authorize access)**.
   - Chọn tài khoản Google của bạn.
   - Bấm **Nâng cao (Advanced)** > **Đi tới MT-GRMS-Test-Report-Gateway (không an toàn) / Go to ... (unsafe)**.
   - Bấm **Cho phép (Allow)**.
6. Sao chép đường link **URL ứng dụng web (Web App URL)**:
   - Định dạng link: `https://script.google.com/macros/s/AKfycb.../exec`

---

## Bước 4: Cấu hình vào AI-Team-Kit

Mở file `.env` (hoặc tạo file `.env` nếu chưa có) tại:
`d:\Sourse_code_Do_An\ai-team-kit\team-ai-knowledge\.env`

Thêm 3 dòng sau:
```env
GOOGLE_SHEET_WEBAPP_URL=https://script.google.com/macros/s/AKfycb.../exec
GOOGLE_SHEET_API_KEY=MT_GRMS_TEST_SECRET_2026
GOOGLE_SHEET_DEFAULT_TESTER=Tên_Của_Bạn
```

*(Hoặc cấu hình trực tiếp vào `C:\Users\PC\.gemini\config\mcp_config.json` trong mục env của server `sep`)*.

---

## Bước 5: Cách Hoạt Động Khi Làm Việc

Khi bạn phát triển tính năng và chạy lệnh `/sep-test`:
1. AI sẽ chạy test và sinh file `test-report.md`.
2. Trong bảng `test-report.md`, mỗi dòng test case có cột `Report Type` (5.1, 5.2, 5.3, 5.4, 5.5).
3. AI sẽ tự động phân loại và gọi công cụ `sep_dong_bo_test_sheet` để:
   - Tự động tạo Tab mới mang tên Feature (ví dụ: `FE-01_Catalog`) từ tab mẫu nếu tab chưa tồn tại.
   - Tự động cập nhật số liệu và kết quả thực tế (PASS/FAIL).
   - Tự động ghi vào các sheet mục tiêu mà bạn mong muốn.
