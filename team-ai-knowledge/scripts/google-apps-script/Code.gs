/**
 * =========================================================================================
 * GOOGLE APPS SCRIPT GATEWAY — TEST REPORT SYNC (MT-GRMS & AI-TEAM-KIT)
 * =========================================================================================
 * Mục đích:
 * - Nhận HTTP POST từ AI-team-kit (MCP tool: sep_dong_bo_test_sheet) hoặc test runner.
 * - Điều phối mở 5 file Google Sheets kiểm thử (Report 5.1 -> 5.5) + Master Test Matrix.
 * - Tự động clone tab mẫu (Template Tab) nếu gặp Feature mới.
 * - Tự động đăng ký vào tab 'Test Cases' (Mục lục) và 'Test Statistics' (Thống kê).
 * - Cơ chế Upsert theo Test Case ID: Nếu đã có thì cập nhật trạng thái/kết quả thực tế;
 *   nếu chưa có thì append dòng mới (tự động mở rộng dòng nếu hết trang).
 * =========================================================================================
 */

// CẤU HÌNH HỆ THỐNG
const CONFIG = {
  // Đặt API Key bí mật để bảo vệ Webhook (khớp với biến GOOGLE_SHEET_API_KEY trong .env)
  API_KEY: 'MT_GRMS_TEST_SECRET_2026',

  // ID của 5 file Google Sheets kiểm thử + Master Test Matrix trên Google Drive
  // URL: https://docs.google.com/spreadsheets/d/<SPREADSHEET_ID>/edit
  SPREADSHEET_IDS: {
    '5.1': '1kCtw6u2qd3T3aD3BothjoRUSyI-_LXOXRYavUjW2Rw8', // Report-5.1_Unit Test
    '5.2': '17JxUyHcBCo7-tJxLhYPcDsa_lV1pDgL_ZuQBIyZUrSg', // Report-5.2_Integration Test
    '5.3': '1DWNjEtj7AoBNKgcNxDicsJIaVwH7Ghl04hn2XERFelI', // Report-5.3_System Test_FRs
    '5.4': '1BuRdxZGJDwIrmBHbSn-oYMHqwAy52bl3VhF_64kCt84', // Report-5.4_System Test_NFRs
    '5.5': '1l8JkXPJ_d2ORWwzy_HPaKOLLz0eaE__NfTK_2tqf5D8', // Report-5.5_Acceptance Test Scripts
    'matrix': '1DE1qjtnxahvG0yMl44KU1Fso6kCDsVQ_AV-Zwe15XRs', // Master Test Matrix & Non-Unit Cases
  }
};

/**
 * Xử lý GET request để kiểm tra tình trạng Web App
 */
function doGet(e) {
  try {
    if (e && e.parameter && e.parameter.action === 'inspect') {
      const summary = {};
      Object.keys(CONFIG.SPREADSHEET_IDS).forEach(rType => {
        const id = CONFIG.SPREADSHEET_IDS[rType];
        if (id && !id.startsWith('YOUR_')) {
          try {
            const ss = SpreadsheetApp.openById(id);
            summary[rType] = {
              name: ss.getName(),
              sheets: ss.getSheets().map(s => ({
                name: s.getName(),
                rows: s.getLastRow(),
                cols: s.getLastColumn()
              }))
            };
          } catch (err) {
            summary[rType] = { error: err.message };
          }
        }
      });
      return ContentService.createTextOutput(JSON.stringify({ status: 'ok', summary })).setMimeType(ContentService.MimeType.JSON);
    }
  } catch (err) {}

  return ContentService.createTextOutput(JSON.stringify({
    status: 'online',
    message: 'Google Apps Script Test Report Gateway is running!',
    timestamp: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Xử lý POST request từ MCP Server hoặc script kiểm thử
 */
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonResponse(false, 'Missing post data');
    }

    const payload = JSON.parse(e.postData.contents);

    // 1. Kiểm tra xác thực API Key
    if (!payload.apiKey || payload.apiKey !== CONFIG.API_KEY) {
      return jsonResponse(false, 'Unauthorized: Invalid or missing apiKey');
    }

    // 2. Kiểm tra action ping
    if (payload.action === 'ping') {
      return jsonResponse(true, 'Pong! Connection successful.', { serverTime: new Date().toISOString() });
    }

    // 2.1 Action đồng bộ Tab nguyên bản (Upload Raw Tab) theo format chuẩn file Excel
    if (payload.action === 'upload_raw_tab') {
      const targetType = String(payload.reportType || 'matrix').trim();
      const spreadsheetId = CONFIG.SPREADSHEET_IDS[targetType] || CONFIG.SPREADSHEET_IDS['matrix'];
      if (!spreadsheetId || spreadsheetId.startsWith('YOUR_')) {
        return jsonResponse(false, `Spreadsheet ID for reportType '${targetType}' not configured!`);
      }
      const ss = SpreadsheetApp.openById(spreadsheetId);
      const res = handleUploadRawTab(ss, payload);
      return jsonResponse(true, `Uploaded tab '${payload.tabName}' successfully`, res);
    }

    // 2.2 Action xóa tab lỗi thời / tab mẫu rác
    if (payload.action === 'delete_tab') {
      const targetType = String(payload.reportType || 'matrix').trim();
      const spreadsheetId = CONFIG.SPREADSHEET_IDS[targetType];
      if (!spreadsheetId || spreadsheetId.startsWith('YOUR_')) {
        return jsonResponse(false, `Spreadsheet ID for reportType '${targetType}' not configured!`);
      }
      const ss = SpreadsheetApp.openById(spreadsheetId);
      const tabName = String(payload.tabName || '').trim();
      const sheet = ss.getSheetByName(tabName);
      if (sheet) {
        if (ss.getSheets().length > 1) {
          ss.deleteSheet(sheet);
          return jsonResponse(true, `Deleted tab '${tabName}' in Report-${targetType}`);
        } else {
          return jsonResponse(false, `Cannot delete the only sheet in spreadsheet`);
        }
      }
      return jsonResponse(true, `Tab '${tabName}' did not exist in Report-${targetType}`);
    }

    // 2.3 Action làm mới và tính lại toàn bộ mục lục và bảng thống kê cho Report
    if (payload.action === 'rebuild_index_and_stats') {
      const targetType = String(payload.reportType || '').trim();
      const spreadsheetId = CONFIG.SPREADSHEET_IDS[targetType];
      if (!spreadsheetId || spreadsheetId.startsWith('YOUR_')) {
        return jsonResponse(false, `Spreadsheet ID for reportType '${targetType}' not configured!`);
      }
      const ss = SpreadsheetApp.openById(spreadsheetId);
      const res = rebuildReportIndexAndStats(ss, targetType);
      return jsonResponse(true, `Rebuilt index and stats for Report-${targetType} successfully`, res);
    }

    // 3. Thực thi sync theo reportType
    const reportType = String(payload.reportType || '').trim();
    if (!CONFIG.SPREADSHEET_IDS[reportType]) {
      return jsonResponse(false, `Invalid reportType: '${reportType}'. Must be one of: 5.1, 5.2, 5.3, 5.4, 5.5, matrix`);
    }

    const spreadsheetId = CONFIG.SPREADSHEET_IDS[reportType];
    if (!spreadsheetId || spreadsheetId.startsWith('YOUR_')) {
      return jsonResponse(false, `Spreadsheet ID for reportType '${reportType}' has not been configured in Code.gs!`);
    }

    const ss = SpreadsheetApp.openById(spreadsheetId);
    let result = null;

    switch (reportType) {
      case '5.1':
        result = syncReport51(ss, payload);
        break;
      case '5.2':
        result = syncReport52(ss, payload);
        break;
      case '5.3':
        result = syncReport53(ss, payload);
        break;
      case '5.4':
        result = syncReport54(ss, payload);
        break;
      case '5.5':
        result = syncReport55(ss, payload);
        break;
      case 'matrix':
        result = syncTestMatrix(ss, payload);
        break;
      default:
        return jsonResponse(false, `Unsupported reportType: ${reportType}`);
    }

    return jsonResponse(true, `Synced successfully to Report-${reportType}`, result);

  } catch (error) {
    return jsonResponse(false, `Server error: ${error.message} \nStack: ${error.stack}`);
  }
}

/**
 * =========================================================================
 * XỬ LÝ REPORT-5.1: UNIT TEST
 * =========================================================================
 */
function syncReport51(ss, payload) {
  const featureCode = payload.featureCode || 'FE-General';
  const featureName = payload.featureName || featureCode;
  const targetTabName = sanitizeTabName(payload.tabName || featureCode);
  const items = payload.items || [];
  const testDate = payload.testDate || getTodayFormatted();
  const tester = payload.tester || 'AI-Agent';

  // 1. Tìm hoặc nhân bản tab từ template 'ModuleName1'
  let sheet = ss.getSheetByName(targetTabName);
  let isNewTab = false;

  if (!sheet) {
    const templateSheet = findSafeTemplateSheet(ss, ['ModuleName1', 'ModuleName 1', 'Module 1', 'Module1', 'Template']);
    if (!templateSheet) throw new Error('Cannot find template sheet for Module in Report-5.1!');
    sheet = templateSheet.copyTo(ss);
    sheet.setName(targetTabName);
    ss.setActiveSheet(sheet);
    ss.moveActiveSheet(ss.getNumSheets());
    isNewTab = true;

    // Cập nhật ô tiêu đề B2
    sheet.getRange('B2').setValue(featureName);

    // Xóa các dòng mẫu cũ từ dòng 12 trở đi nếu có
    const maxRows = sheet.getMaxRows();
    if (maxRows >= 12) {
      sheet.getRange(12, 1, Math.max(1, maxRows - 11), sheet.getMaxColumns()).clearContent();
    }

    // Đăng ký vào tab 'Test Cases' và 'Test Statistics'
    registerIndexAndStats(ss, targetTabName, featureName, 'Module');
  }


  const startRow = 12;
  let updatedCount = 0;
  let insertedCount = 0;

  items.forEach(item => {
    const testId = String(item.testId || item.id || '').trim();
    if (!testId) return;

    const existingRow = findTestRow(sheet, testId, startRow);
    const statusVal = formatStatus(item.status);

    if (existingRow !== -1) {
      ensureRowExists(sheet, existingRow);
      sheet.getRange(existingRow, 2).setValue(item.preConditions || 'Môi trường và dữ liệu khởi tạo sẵn sàng');
      sheet.getRange(existingRow, 3).setValue(item.inputParams || item.steps || 'Thực hiện thao tác với tham số hợp lệ');
      sheet.getRange(existingRow, 4).setValue(item.expectedResults || item.expected || 'Đáp ứng đúng quy tắc nghiệp vụ');
      sheet.getRange(existingRow, 5).setValue(item.type || 'Normal');
      sheet.getRange(existingRow, 6).setValue(statusVal); // Round 1
      sheet.getRange(existingRow, 7).setValue(testDate);  // Test date
      sheet.getRange(existingRow, 8).setValue(tester);    // Tester
      updatedCount++;
    } else {
      const nextRow = getNextAvailableRow(sheet, startRow);
      ensureRowExists(sheet, nextRow);
      sheet.getRange(nextRow, 1).setValue(testId);
      sheet.getRange(nextRow, 2).setValue(item.preConditions || 'Môi trường và dữ liệu khởi tạo sẵn sàng');
      sheet.getRange(nextRow, 3).setValue(item.inputParams || item.steps || 'Thực hiện thao tác với tham số hợp lệ');
      sheet.getRange(nextRow, 4).setValue(item.expectedResults || item.expected || 'Đáp ứng đúng quy tắc nghiệp vụ');
      sheet.getRange(nextRow, 5).setValue(item.type || 'Normal');
      sheet.getRange(nextRow, 6).setValue(statusVal);
      sheet.getRange(nextRow, 7).setValue(testDate);
      sheet.getRange(nextRow, 8).setValue(tester);
      insertedCount++;
    }
  });

  // 3. Cập nhật thống kê trên đầu sheet 5.1
  updateHeaderStatistics51(sheet, startRow);
  const totalCount = countFilledRows(sheet, startRow);

  return { tab: targetTabName, isNewTab, updated: updatedCount, inserted: insertedCount, total: totalCount };
}

/**
 * =========================================================================
 * XỬ LÝ REPORT-5.2: INTEGRATION TEST
 * =========================================================================
 */
function syncReport52(ss, payload) {
  const isSecurity = payload.category === 'security' || payload.tabName === 'SecurityTest';
  const targetTabName = isSecurity ? 'SecurityTest' : sanitizeTabName(payload.tabName || payload.featureCode || 'Feature1');
  const featureName = payload.featureName || payload.featureCode || targetTabName;
  const items = payload.items || [];
  const testDate = payload.testDate || getTodayFormatted();
  const tester = payload.tester || 'AI-Agent';

  let sheet = ss.getSheetByName(targetTabName);
  let isNewTab = false;

  if (isSecurity) {
    if (!sheet) throw new Error("Sheet 'SecurityTest' not found in Report-5.2!");
    return syncSecurityTab(sheet, items, 2);
  }

  // Functional Integration Feature
  if (!sheet) {
    const templateSheet = findSafeTemplateSheet(ss, ['Feature Name1', 'Feature Name 1', 'Feature 1', 'Feature1', 'Template']);
    if (!templateSheet) throw new Error('Cannot find template sheet for Feature in Report-5.2!');
    sheet = templateSheet.copyTo(ss);
    sheet.setName(targetTabName);
    ss.setActiveSheet(sheet);
    ss.moveActiveSheet(ss.getNumSheets());
    isNewTab = true;

    sheet.getRange('B2').setValue(featureName);
    const maxRows = sheet.getMaxRows();
    if (maxRows >= 11) {
      sheet.getRange(11, 1, Math.max(1, maxRows - 10), sheet.getMaxColumns()).clearContent();
    }
    registerIndexAndStats(ss, targetTabName, featureName, 'Feature');
  }

  const startRow = 11;
  let updatedCount = 0;
  let insertedCount = 0;

  items.forEach(item => {
    const testId = String(item.testId || item.id || '').trim();
    if (!testId) return;

    const existingRow = findTestRow(sheet, testId, startRow);
    const statusVal = formatStatus(item.status);

    if (existingRow !== -1) {
      ensureRowExists(sheet, existingRow);
      sheet.getRange(existingRow, 2).setValue(item.description || item.name || item.scenario || 'Kịch bản tích hợp chức năng');
      sheet.getRange(existingRow, 3).setValue(item.procedure || item.steps || 'Thực hiện luồng thao tác tích hợp');
      sheet.getRange(existingRow, 4).setValue(item.expectedResults || item.expected || 'Hệ thống đồng bộ dữ liệu chính xác');
      sheet.getRange(existingRow, 5).setValue(item.preConditions || 'Môi trường và các phân hệ liên quan sẵn sàng');
      sheet.getRange(existingRow, 6).setValue(statusVal); // Round 1
      sheet.getRange(existingRow, 7).setValue(testDate);
      sheet.getRange(existingRow, 8).setValue(tester);
      updatedCount++;
    } else {
      const nextRow = getNextAvailableRow(sheet, startRow);
      ensureRowExists(sheet, nextRow);
      sheet.getRange(nextRow, 1).setValue(testId);
      sheet.getRange(nextRow, 2).setValue(item.description || item.name || item.scenario || 'Kịch bản tích hợp chức năng');
      sheet.getRange(nextRow, 3).setValue(item.procedure || item.steps || 'Thực hiện luồng thao tác tích hợp');
      sheet.getRange(nextRow, 4).setValue(item.expectedResults || item.expected || 'Hệ thống đồng bộ dữ liệu chính xác');
      sheet.getRange(nextRow, 5).setValue(item.preConditions || 'Môi trường và các phân hệ liên quan sẵn sàng');
      sheet.getRange(nextRow, 6).setValue(statusVal);
      sheet.getRange(nextRow, 7).setValue(testDate);
      sheet.getRange(nextRow, 8).setValue(tester);
      insertedCount++;
    }
  });

  updateHeaderStatistics52(sheet, startRow);
  const totalCount = countFilledRows(sheet, startRow);

  return { tab: targetTabName, isNewTab, updated: updatedCount, inserted: insertedCount, total: totalCount };
}

/**
 * =========================================================================
 * XỬ LÝ REPORT-5.3: SYSTEM TEST FRs
 * =========================================================================
 */
function syncReport53(ss, payload) {
  const targetTabName = sanitizeTabName(payload.tabName || payload.workflowCode || payload.featureCode || 'Workflow1');
  const workflowName = payload.workflowName || payload.featureName || targetTabName;
  const items = payload.items || [];
  const testDate = payload.testDate || getTodayFormatted();
  const tester = payload.tester || 'AI-Agent';

  let sheet = ss.getSheetByName(targetTabName);
  let isNewTab = false;

  if (!sheet) {
    const templateSheet = findSafeTemplateSheet(ss, ['Workflow Name1', 'Workflow Name 1', 'Workflow 1', 'Workflow1', 'Template']);
    if (!templateSheet) throw new Error('Cannot find template sheet for Workflow in Report-5.3!');
    sheet = templateSheet.copyTo(ss);
    sheet.setName(targetTabName);
    ss.setActiveSheet(sheet);
    ss.moveActiveSheet(ss.getNumSheets());
    isNewTab = true;

    sheet.getRange('B2').setValue(workflowName);
    const maxRows = sheet.getMaxRows();
    if (maxRows >= 11) {
      sheet.getRange(11, 1, Math.max(1, maxRows - 10), sheet.getMaxColumns()).clearContent();
    }
    registerIndexAndStats(ss, targetTabName, workflowName, 'Workflow');
  }

  const startRow = 11;
  let updatedCount = 0;
  let insertedCount = 0;

  items.forEach(item => {
    const testId = String(item.testId || item.id || '').trim();
    if (!testId) return;

    const existingRow = findTestRow(sheet, testId, startRow);
    const statusVal = formatStatus(item.status);

    if (existingRow !== -1) {
      ensureRowExists(sheet, existingRow);
      sheet.getRange(existingRow, 2).setValue(item.description || item.name || item.scenario || 'Kịch bản kiểm thử luồng hệ thống');
      sheet.getRange(existingRow, 3).setValue(item.procedure || item.steps || 'Thực hiện các bước thao tác trên màn hình');
      sheet.getRange(existingRow, 4).setValue(item.expectedResults || item.expected || 'Giao diện và hệ thống phản hồi đúng quy tắc');
      sheet.getRange(existingRow, 5).setValue(item.preConditions || 'Môi trường hệ thống và dữ liệu sẵn sàng');
      sheet.getRange(existingRow, 6).setValue(statusVal);
      sheet.getRange(existingRow, 7).setValue(testDate);
      sheet.getRange(existingRow, 8).setValue(tester);
      updatedCount++;
    } else {
      const nextRow = getNextAvailableRow(sheet, startRow);
      ensureRowExists(sheet, nextRow);
      sheet.getRange(nextRow, 1).setValue(testId);
      sheet.getRange(nextRow, 2).setValue(item.description || item.name || item.scenario || 'Kịch bản kiểm thử luồng hệ thống');
      sheet.getRange(nextRow, 3).setValue(item.procedure || item.steps || 'Thực hiện các bước thao tác trên màn hình');
      sheet.getRange(nextRow, 4).setValue(item.expectedResults || item.expected || 'Giao diện và hệ thống phản hồi đúng quy tắc');
      sheet.getRange(nextRow, 5).setValue(item.preConditions || 'Môi trường hệ thống và dữ liệu sẵn sàng');
      sheet.getRange(nextRow, 6).setValue(statusVal);
      sheet.getRange(nextRow, 7).setValue(testDate);
      sheet.getRange(nextRow, 8).setValue(tester);
      insertedCount++;
    }
  });

  updateHeaderStatistics52(sheet, startRow);
  const totalCount = countFilledRows(sheet, startRow);

  return { tab: targetTabName, isNewTab, updated: updatedCount, inserted: insertedCount, total: totalCount };
}

/**
 * =========================================================================
 * XỬ LÝ REPORT-5.4: SYSTEM TEST NFRs (Security & Performance)
 * =========================================================================
 */
function syncReport54(ss, payload) {
  const category = (payload.category || payload.tabName || 'Security').toLowerCase();
  const isPerf = category.includes('perf');
  const targetTabName = isPerf ? 'Performance' : 'Security';
  const sheet = ss.getSheetByName(targetTabName);
  if (!sheet) throw new Error(`Sheet '${targetTabName}' not found in Report-5.4!`);

  const items = payload.items || [];
  const startRow = 2; // Header ở dòng 1
  let updatedCount = 0;
  let insertedCount = 0;

  items.forEach(item => {
    const testId = String(item.testId || item.id || '').trim();
    if (!testId) return;

    const existingRow = findTestRow(sheet, testId, startRow);
    const statusVal = formatStatus(item.status);

    if (isPerf) {
      // Performance: Test Case ID | Scenario | Tool | Target | Actual | Status | Defect IDs | Notes
      if (existingRow !== -1) {
        ensureRowExists(sheet, existingRow);
        sheet.getRange(existingRow, 2).setValue(item.scenario || item.description || 'Kiểm thử hiệu năng tải và phản hồi');
        sheet.getRange(existingRow, 3).setValue(item.tool || 'Automated / DevTools');
        sheet.getRange(existingRow, 4).setValue(item.target || '< 2s');
        if (item.actual) sheet.getRange(existingRow, 5).setValue(item.actual);
        sheet.getRange(existingRow, 6).setValue(statusVal);
        if (item.defectId) sheet.getRange(existingRow, 7).setValue(item.defectId);
        sheet.getRange(existingRow, 8).setValue(item.notes || 'Hiệu năng đạt yêu cầu');
        updatedCount++;
      } else {
        const nextRow = getNextAvailableRow(sheet, startRow);
        ensureRowExists(sheet, nextRow);
        sheet.getRange(nextRow, 1).setValue(testId);
        sheet.getRange(nextRow, 2).setValue(item.scenario || item.description || 'Kiểm thử hiệu năng tải và phản hồi');
        sheet.getRange(nextRow, 3).setValue(item.tool || 'Automated / DevTools');
        sheet.getRange(nextRow, 4).setValue(item.target || '< 2s');
        sheet.getRange(nextRow, 5).setValue(item.actual || 'PASS');
        sheet.getRange(nextRow, 6).setValue(statusVal);
        sheet.getRange(nextRow, 7).setValue(item.defectId || '');
        sheet.getRange(nextRow, 8).setValue(item.notes || 'Hiệu năng đạt yêu cầu');
        insertedCount++;
      }
    } else {
      // Security: Test Case ID | Scenario Name | Role / Session | Given | When | Then | Priority | Status | Defect ID | Notes
      if (existingRow !== -1) {
        ensureRowExists(sheet, existingRow);
        sheet.getRange(existingRow, 2).setValue(item.scenario || item.name || item.description || 'Kiểm tra bảo mật và quyền truy cập');
        sheet.getRange(existingRow, 3).setValue(item.role || 'Cashier');
        sheet.getRange(existingRow, 4).setValue(item.given || item.preConditions || 'Người dùng đã xác thực với vai trò tương ứng');
        sheet.getRange(existingRow, 5).setValue(item.when || item.procedure || item.steps || 'Cố tình thực hiện hành động trái quyền');
        sheet.getRange(existingRow, 6).setValue(item.then || item.expected || item.expectedResults || 'Hệ thống chặn truy cập HTTP 403 Forbidden');
        sheet.getRange(existingRow, 7).setValue(item.priority || 'Critical');
        sheet.getRange(existingRow, 8).setValue(statusVal);
        if (item.defectId) sheet.getRange(existingRow, 9).setValue(item.defectId);
        sheet.getRange(existingRow, 10).setValue(item.notes || 'Bảo mật đạt chuẩn RBAC');
        updatedCount++;
      } else {
        const nextRow = getNextAvailableRow(sheet, startRow);
        ensureRowExists(sheet, nextRow);
        sheet.getRange(nextRow, 1).setValue(testId);
        sheet.getRange(nextRow, 2).setValue(item.scenario || item.name || item.description || 'Kiểm tra bảo mật và quyền truy cập');
        sheet.getRange(nextRow, 3).setValue(item.role || 'Cashier');
        sheet.getRange(nextRow, 4).setValue(item.given || item.preConditions || 'Người dùng đã xác thực với vai trò tương ứng');
        sheet.getRange(nextRow, 5).setValue(item.when || item.procedure || item.steps || 'Cố tình thực hiện hành động trái quyền');
        sheet.getRange(nextRow, 6).setValue(item.then || item.expected || item.expectedResults || 'Hệ thống chặn truy cập HTTP 403 Forbidden');
        sheet.getRange(nextRow, 7).setValue(item.priority || 'Critical');
        sheet.getRange(nextRow, 8).setValue(statusVal);
        sheet.getRange(nextRow, 9).setValue(item.defectId || '');
        sheet.getRange(nextRow, 10).setValue(item.notes || 'Bảo mật đạt chuẩn RBAC');
        insertedCount++;
      }
    }
  });

  const totalCount = countFilledRows(sheet, startRow);
  return { tab: targetTabName, updated: updatedCount, inserted: insertedCount, total: totalCount };
}

/**
 * =========================================================================
 * XỬ LÝ REPORT-5.5: ACCEPTANCE TEST SCRIPTS (UAT & Exploratory)
 * =========================================================================
 */
function syncReport55(ss, payload) {
  const targetTabName = (payload.tabName || 'UAT').trim();
  const sheet = ss.getSheetByName(targetTabName) || ss.getSheetByName('UAT');
  if (!sheet) throw new Error(`Sheet '${targetTabName}' not found in Report-5.5!`);

  const items = payload.items || [];
  const startRow = 2; // Header ở dòng 1
  let updatedCount = 0;
  let insertedCount = 0;

  // UAT: Script ID | BF-ID | Title | Actor / Role | Scenario | Expected Business Outcome | Priority | Result | Feedback
  items.forEach(item => {
    const scriptId = String(item.scriptId || item.testId || item.id || '').trim();
    if (!scriptId) return;

    const existingRow = findTestRow(sheet, scriptId, startRow);
    const resultVal = formatStatus(item.status || item.result);

    if (existingRow !== -1) {
      ensureRowExists(sheet, existingRow);
      sheet.getRange(existingRow, 2).setValue(item.bfId || item.featureCode || 'BF-01');
      sheet.getRange(existingRow, 3).setValue(item.title || item.name || item.scenario || item.description || 'Kịch bản nghiệm thu người dùng');
      sheet.getRange(existingRow, 4).setValue(item.actor || item.role || 'StoreOwner');
      sheet.getRange(existingRow, 5).setValue(item.scenario || item.procedure || item.steps || 'Thực hiện quy trình nghiệp vụ thực tế');
      sheet.getRange(existingRow, 6).setValue(item.expectedOutcome || item.expected || item.expectedResults || 'Nghiệm thu đạt yêu cầu vận hành');
      sheet.getRange(existingRow, 7).setValue(item.priority || 'High');
      sheet.getRange(existingRow, 8).setValue(resultVal); // Result
      sheet.getRange(existingRow, 9).setValue(item.feedback || item.notes || 'Đạt yêu cầu nghiệm thu');
      updatedCount++;
    } else {
      const nextRow = getNextAvailableRow(sheet, startRow);
      ensureRowExists(sheet, nextRow);
      sheet.getRange(nextRow, 1).setValue(scriptId);
      sheet.getRange(nextRow, 2).setValue(item.bfId || item.featureCode || 'BF-01');
      sheet.getRange(nextRow, 3).setValue(item.title || item.name || item.scenario || item.description || 'Kịch bản nghiệm thu người dùng');
      sheet.getRange(nextRow, 4).setValue(item.actor || item.role || 'StoreOwner');
      sheet.getRange(nextRow, 5).setValue(item.scenario || item.procedure || item.steps || 'Thực hiện quy trình nghiệp vụ thực tế');
      sheet.getRange(nextRow, 6).setValue(item.expectedOutcome || item.expected || item.expectedResults || 'Nghiệm thu đạt yêu cầu vận hành');
      sheet.getRange(nextRow, 7).setValue(item.priority || 'High');
      sheet.getRange(nextRow, 8).setValue(resultVal);
      sheet.getRange(nextRow, 9).setValue(item.feedback || item.notes || 'Đạt yêu cầu nghiệm thu');
      insertedCount++;
    }
  });

  const totalCount = countFilledRows(sheet, startRow);
  return { tab: sheet.getName(), updated: updatedCount, inserted: insertedCount, total: totalCount };
}

/**
 * =========================================================================
 * XỬ LÝ UPLOAD RAW TAB TỪ FILE EXCEL (ĐỒNG BỘ 100% CẤU TRÚC VÀ ĐỊNH DẠNG)
 * =========================================================================
 */
function handleUploadRawTab(ss, payload) {
  const tabName = String(payload.tabName || '').trim();
  if (!tabName) throw new Error('Missing tabName in upload_raw_tab payload!');

  let sheet = ss.getSheetByName(tabName);
  const isNewTab = !sheet;
  if (!sheet) {
    sheet = ss.insertSheet(tabName);
  }

  if (payload.tabColor) {
    sheet.setTabColor(payload.tabColor);
  }

  // Nếu là chunk đầu tiên hoặc chế độ replace thì clear toàn bộ sheet
  if (payload.mode === 'replace' || payload.isFirstChunk) {
    sheet.clear();
  }

  let currentRow = payload.startRow || 1;

  // 1. Ghi các dòng tiêu đề (Title rows)
  if (payload.titleRows && payload.titleRows.length > 0) {
    payload.titleRows.forEach(tr => {
      if (tr.values && tr.values.length > 0) {
        const numCols = tr.values.length;
        sheet.getRange(currentRow, 1, 1, numCols).setValues([tr.values]);
        const rRange = sheet.getRange(currentRow, 1, 1, numCols);
        if (tr.bold) rRange.setFontWeight('bold');
        if (tr.fontSize) rRange.setFontSize(tr.fontSize);
        if (tr.fontColor) rRange.setFontColor(tr.fontColor);
        if (tr.bg) rRange.setBackground(tr.bg);
        if (tr.height) sheet.setRowHeight(currentRow, tr.height);
      }
      currentRow++;
    });
  }

  // 2. Ghi dòng Header
  if (payload.headerRow && payload.headerRow.length > 0) {
    const numCols = payload.headerRow.length;
    sheet.getRange(currentRow, 1, 1, numCols).setValues([payload.headerRow]);
    const headerRange = sheet.getRange(currentRow, 1, 1, numCols);
    headerRange.setBackground(payload.headerBg || '#1B365D')
               .setFontColor(payload.headerColor || '#FFFFFF')
               .setFontWeight('bold')
               .setHorizontalAlignment('center')
               .setVerticalAlignment('middle')
               .setWrap(true);
    sheet.setRowHeight(currentRow, payload.headerHeight || 30);
    currentRow++;
  }

  // 3. Ghi dữ liệu Data rows
  const rows = payload.dataRows || [];
  if (rows.length > 0) {
    const numCols = rows[0].length;
    const numRows = rows.length;
    sheet.getRange(currentRow, 1, numRows, numCols).setValues(rows);
    const dataRange = sheet.getRange(currentRow, 1, numRows, numCols);
    dataRange.setBorder(true, true, true, true, true, true, '#D0D7DE', SpreadsheetApp.BorderStyle.SOLID);
    dataRange.setVerticalAlignment('top');

    // Tô màu xen kẽ
    for (let i = 0; i < numRows; i++) {
      const r = currentRow + i;
      if (i % 2 === 1) {
        sheet.getRange(r, 1, 1, numCols).setBackground('#F8F9FA');
      }
      // Highlight trạng thái PASS/FAIL
      if (payload.statusColIdx !== undefined && payload.statusColIdx >= 0 && payload.statusColIdx < numCols) {
        const stCell = sheet.getRange(r, payload.statusColIdx + 1);
        const stVal = String(rows[i][payload.statusColIdx] || '').toUpperCase();
        if (stVal.includes('PASS')) {
          stCell.setBackground('#D4EDDA').setFontColor('#155724').setFontWeight('bold');
        } else if (stVal.includes('FAIL')) {
          stCell.setBackground('#F8D7DA').setFontColor('#721C24').setFontWeight('bold');
        }
      }
    }
    currentRow += numRows;
  }

  // 4. Định dạng độ rộng cột nếu có
  if (payload.colWidths && Array.isArray(payload.colWidths)) {
    payload.colWidths.forEach((w, idx) => {
      if (w > 0) sheet.setColumnWidth(idx + 1, w);
    });
  }

  return { tab: tabName, isNewTab, totalRows: sheet.getLastRow(), totalCols: sheet.getLastColumn() };
}

/**
 * =========================================================================
 * XỬ LÝ MASTER TEST MATRIX & NON-UNIT CASES (HỖ TRỢ ĐA TAB & FORMAT 15 CỘT)
 * =========================================================================
 */
function syncTestMatrix(ss, payload) {
  const items = payload.items || [];
  const tester = payload.tester || 'AI-Agent';
  const testDate = payload.testDate || getTodayFormatted();

  // Xác định tab đích: Nếu có tabName chỉ định, hoặc có chứa dữ liệu Cross-Test thì ghi vào đúng tab
  const isCrossTest = payload.tabName === 'Cross-Test FE07-19 (217 TCs)' ||
                      items.some(it => it.testData || it.data || it.author || it.isCrossTest);
  const isFunctional = payload.tabName === 'Functional Tests (181 TCs)' || payload.format === 'functional';

  let targetTabName = payload.tabName;
  if (!targetTabName) {
    if (isCrossTest) targetTabName = 'Cross-Test FE07-19 (217 TCs)';
    else if (isFunctional) targetTabName = 'Functional Tests (181 TCs)';
    else targetTabName = 'Test Cases (Non-Unit)';
  }

  let sheet = ss.getSheetByName(targetTabName);
  if (!sheet) {
    // Nếu tab chưa tồn tại thì fallback về tab có sẵn hoặc tạo mới
    sheet = ss.getSheetByName('Test Cases (Non-Unit)') || ss.getSheetByName('Test Cases') || ss.getSheets()[1] || ss.getSheets()[0];
  }

  const activeTabName = sheet.getName();
  const is15Cols = activeTabName.includes('Cross-Test') || isCrossTest;
  const is12ColsFunc = activeTabName.includes('Functional') || isFunctional;

  const headerRow = (activeTabName === 'Test Matrix' || activeTabName === 'Traceability Matrix') ? 5 : 4;
  const startRow = headerRow + 1;
  const lastRow = Math.max(sheet.getLastRow(), headerRow);
  const existingMap = new Map();

  if (lastRow >= startRow) {
    const ids = sheet.getRange(startRow, 1, lastRow - headerRow, 1).getValues();
    ids.forEach((r, idx) => {
      const tcId = String(r[0] || '').trim();
      if (tcId) {
        existingMap.set(tcId, startRow + idx);
      }
    });
  }

  let updated = 0;
  let inserted = 0;
  const toAppend = [];

  items.forEach(item => {
    const rawReportType = String(item.reportType || item.report_type || '').trim();
    // Quy tắc: KHÔNG đồng bộ Unit Test 5.1 vào bảng Test Matrix
    if (rawReportType === '5.1' || String(item.id || item.tcId || '').startsWith('TC-UT')) {
      return;
    }

    const tcId = String(item.id || item.testCaseId || item.tcId || item.code || '').trim();
    if (!tcId) return;

    const moduleName = String(item.module || item.moduleName || item.subsystem || item.featureCode || payload.featureCode || 'BÁN HÀNG & POS');
    const criteria = String(item.criteria || item.tieuChi || 'Luồng nghiệp vụ');
    const techType = String(item.techType || item.type || 'Happy');
    const priority = String(item.priority || item.uuTien || 'P1');
    const scenario = String(item.scenario || item.description || item.title || item.name || '');
    const given = String(item.given || item.preConditions || '');
    const when = String(item.when || item.steps || item.procedure || '');
    const testData = String(item.testData || item.data || item.inputParams || '');
    const then = String(item.then || item.expected || item.expectedResults || '');
    const author = String(item.author || item.nguoiViet || 'Nguyễn Trường An');
    const runner = String(item.runner || item.tester || item.nguoiChay || tester);
    const actual = String(item.actual || item.actualResults || 'Xác nhận thành công');
    const status = formatStatus(item.status || item.actualStatus || 'PASS');
    const defectId = String(item.defectId || item.bugId || item.notes || '');
    const date = String(item.date || testDate);
    const reportType = rawReportType || '5.3';

    if (existingMap.has(tcId)) {
      const rowIdx = existingMap.get(tcId);
      if (is15Cols) {
        sheet.getRange(rowIdx, 13).setValue(actual);
        sheet.getRange(rowIdx, 14).setValue(status);
        sheet.getRange(rowIdx, 15).setValue(defectId);
        const stCell = sheet.getRange(rowIdx, 14);
        if (status === 'Passed' || status === 'PASS') {
          stCell.setBackground('#D4EDDA').setFontColor('#155724').setFontWeight('bold');
        } else if (status === 'Failed' || status === 'FAIL') {
          stCell.setBackground('#F8D7DA').setFontColor('#721C24').setFontWeight('bold');
        }
      } else if (is12ColsFunc) {
        sheet.getRange(rowIdx, 11).setValue(status);
        sheet.getRange(rowIdx, 12).setValue(defectId);
        const stCell = sheet.getRange(rowIdx, 11);
        if (status === 'Passed' || status === 'PASS') {
          stCell.setBackground('#D4EDDA').setFontColor('#155724').setFontWeight('bold');
        } else if (status === 'Failed' || status === 'FAIL') {
          stCell.setBackground('#F8D7DA').setFontColor('#721C24').setFontWeight('bold');
        }
      } else {
        sheet.getRange(rowIdx, 9).setValue(actual);
        sheet.getRange(rowIdx, 10).setValue(runner);
        sheet.getRange(rowIdx, 11).setValue(status);
        sheet.getRange(rowIdx, 12).setValue(date);
        const stCell = sheet.getRange(rowIdx, 11);
        if (status === 'Passed' || status === 'PASS') {
          stCell.setBackground('#D4EDDA').setFontColor('#155724').setFontWeight('bold');
        } else if (status === 'Failed' || status === 'FAIL') {
          stCell.setBackground('#F8D7DA').setFontColor('#721C24').setFontWeight('bold');
        }
      }
      updated++;
    } else {
      if (is15Cols) {
        toAppend.push([
          tcId, moduleName, criteria, techType, priority,
          scenario, given, when, testData, then,
          author, runner, actual, status, defectId
        ]);
      } else if (is12ColsFunc) {
        toAppend.push([
          tcId, moduleName, criteria, techType, priority,
          scenario, given, when, then, runner, status, defectId
        ]);
      } else {
        toAppend.push([
          tcId, moduleName, scenario, criteria, reportType,
          given, when, then, actual, runner, status, date
        ]);
      }
      inserted++;
    }
  });

  if (toAppend.length > 0) {
    const startAppendRow = sheet.getLastRow() + 1;
    const numRows = toAppend.length;
    const numCols = toAppend[0].length;
    const range = sheet.getRange(startAppendRow, 1, numRows, numCols);
    range.setValues(toAppend);

    const statusColIdx = is15Cols ? 14 : 11;
    for (let r = 0; r < numRows; r++) {
      const targetRow = startAppendRow + r;
      const rowRange = sheet.getRange(targetRow, 1, 1, numCols);
      rowRange.setBorder(true, true, true, true, true, true, '#D0D7DE', SpreadsheetApp.BorderStyle.SOLID);
      if (targetRow % 2 === 0) {
        rowRange.setBackground('#F7F9FC');
      }
      const stCell = sheet.getRange(targetRow, statusColIdx);
      const stVal = toAppend[r][statusColIdx - 1];
      if (stVal === 'Passed' || stVal === 'PASS') {
        stCell.setBackground('#D4EDDA').setFontColor('#155724').setFontWeight('bold');
      } else if (stVal === 'Failed' || stVal === 'FAIL') {
        stCell.setBackground('#F8D7DA').setFontColor('#721C24').setFontWeight('bold');
      }
    }
  }

  updateMatrixTabStats(ss);

  return { tab: sheet.getName(), is15Cols, updated, inserted, total: existingMap.size + inserted };
}

/**
 * Cập nhật số lượng test case thực tế và trạng thái trên tab 'Test Matrix'
 */
function updateMatrixTabStats(ss) {
  try {
    const matrixSheet = ss.getSheetByName('Test Matrix') || ss.getSheets()[0];
    const casesSheet = ss.getSheetByName('Test Cases (Non-Unit)') || ss.getSheetByName('Test Cases');
    if (!matrixSheet || !casesSheet) return;

    const casesLastRow = casesSheet.getLastRow();
    if (casesLastRow < 5) return;

    const casesData = casesSheet.getRange(5, 1, casesLastRow - 4, 11).getValues();
    const countByModule = {};
    let totalCases = 0;
    casesData.forEach(r => {
      const mod = String(r[1] || '').trim();
      const status = String(r[10] || '').trim().toUpperCase();
      if (mod) {
        if (!countByModule[mod]) countByModule[mod] = { total: 0, passed: 0 };
        countByModule[mod].total++;
        if (status.includes('PASS')) countByModule[mod].passed++;
        totalCases++;
      }
    });

    const matrixLastRow = matrixSheet.getLastRow();
    if (matrixLastRow >= 6) {
      const matrixData = matrixSheet.getRange(6, 2, matrixLastRow - 5, 8).getValues();
      matrixData.forEach((r, idx) => {
        const mod = String(r[0] || '').trim();
        const rowIdx = 6 + idx;
        if (countByModule[mod]) {
          const stCell = matrixSheet.getRange(rowIdx, 9);
          if (countByModule[mod].passed === countByModule[mod].total) {
            stCell.setValue('Đã chạy (PASS)').setBackground('#D4EDDA').setFontColor('#155724').setFontWeight('bold');
          }
        }
      });
    }
  } catch (err) {
    Logger.log('Warning in updateMatrixTabStats: ' + err.message);
  }
}

/**
 * =========================================================================
 * HELPER UTILITIES
 * =========================================================================
 */

/**
 * Xử lý riêng cho tab Security trong Report-5.2
 */
function syncSecurityTab(sheet, items, startRow) {
  let updatedCount = 0;
  let insertedCount = 0;

  items.forEach(item => {
    const testId = String(item.testId || item.id || '').trim();
    if (!testId) return;

    const existingRow = findTestRow(sheet, testId, startRow);
    const statusVal = formatStatus(item.status);

    if (existingRow !== -1) {
      ensureRowExists(sheet, existingRow);
      sheet.getRange(existingRow, 2).setValue(item.scenario || item.name || item.description || 'Kiểm tra bảo mật và quyền truy cập');
      sheet.getRange(existingRow, 3).setValue(item.role || 'Cashier');
      sheet.getRange(existingRow, 4).setValue(item.given || item.preConditions || 'Người dùng đã xác thực với vai trò tương ứng');
      sheet.getRange(existingRow, 5).setValue(item.when || item.procedure || item.steps || 'Cố tình thực hiện hành động trái quyền');
      sheet.getRange(existingRow, 6).setValue(item.then || item.expected || item.expectedResults || 'Hệ thống chặn truy cập HTTP 403 Forbidden');
      sheet.getRange(existingRow, 7).setValue(item.priority || 'Critical');
      sheet.getRange(existingRow, 8).setValue(statusVal);
      if (item.defectId) sheet.getRange(existingRow, 9).setValue(item.defectId);
      sheet.getRange(existingRow, 10).setValue(item.notes || 'Bảo mật đạt chuẩn RBAC');
      updatedCount++;
    } else {
      const nextRow = getNextAvailableRow(sheet, startRow);
      ensureRowExists(sheet, nextRow);
      sheet.getRange(nextRow, 1).setValue(testId);
      sheet.getRange(nextRow, 2).setValue(item.scenario || item.name || item.description || 'Kiểm tra bảo mật và quyền truy cập');
      sheet.getRange(nextRow, 3).setValue(item.role || 'Cashier');
      sheet.getRange(nextRow, 4).setValue(item.given || item.preConditions || 'Người dùng đã xác thực với vai trò tương ứng');
      sheet.getRange(nextRow, 5).setValue(item.when || item.procedure || item.steps || 'Cố tình thực hiện hành động trái quyền');
      sheet.getRange(nextRow, 6).setValue(item.then || item.expected || item.expectedResults || 'Hệ thống chặn truy cập HTTP 403 Forbidden');
      sheet.getRange(nextRow, 7).setValue(item.priority || 'Critical');
      sheet.getRange(nextRow, 8).setValue(statusVal);
      sheet.getRange(nextRow, 9).setValue(item.defectId || '');
      sheet.getRange(nextRow, 10).setValue(item.notes || 'Bảo mật đạt chuẩn RBAC');
      insertedCount++;
    }
  });

  const totalCount = countFilledRows(sheet, startRow);
  return { tab: sheet.getName(), updated: updatedCount, inserted: insertedCount, total: totalCount };
}

/**
 * Tìm dòng có testId, trả về row number (1-based), hoặc -1 nếu chưa có
 */
function findTestRow(sheet, testId, startRow) {
  const lastRow = sheet.getLastRow();
  if (lastRow < startRow) return -1;
  const values = sheet.getRange(startRow, 1, lastRow - startRow + 1, 1).getValues();
  const target = String(testId).trim().toLowerCase();
  for (let i = 0; i < values.length; i++) {
    if (String(values[i][0] || '').trim().toLowerCase() === target) {
      return startRow + i;
    }
  }
  return -1;
}

/**
 * Tìm dòng trống tiếp theo ở cột 1
 */
function getNextAvailableRow(sheet, startRow) {
  const lastRow = sheet.getLastRow();
  if (lastRow < startRow) return startRow;
  const values = sheet.getRange(startRow, 1, lastRow - startRow + 1, 1).getValues();
  let lastFilled = startRow - 1;
  for (let i = 0; i < values.length; i++) {
    if (String(values[i][0] || '').trim()) {
      lastFilled = startRow + i;
    }
  }
  return lastFilled + 1;
}

/**
 * Tự động chèn thêm dòng nếu vượt quá số dòng hiện tại của sheet
 */
function ensureRowExists(sheet, targetRow) {
  const maxRows = sheet.getMaxRows();
  if (targetRow > maxRows) {
    sheet.insertRowsAfter(maxRows, targetRow - maxRows + 5);
  }
}

/**
 * Đếm số lượng test case thực tế (không rỗng)
 */
function countFilledRows(sheet, startRow) {
  const lastRow = sheet.getLastRow();
  if (lastRow < startRow) return 0;
  const values = sheet.getRange(startRow, 1, lastRow - startRow + 1, 1).getValues();
  let count = 0;
  for (let i = 0; i < values.length; i++) {
    if (String(values[i][0] || '').trim()) count++;
  }
  return count;
}

/**
 * Tìm tab mẫu an toàn để nhân bản cho Feature mới.
 * Tuyệt đối không lấy nhầm tab của các Feature đã có dữ liệu (FE-xx, Module-xx, Workflow-xx).
 */
function findSafeTemplateSheet(ss, preferredNames) {
  const names = preferredNames || [];
  // 1. Tìm theo các tên tab mẫu chuẩn
  for (let i = 0; i < names.length; i++) {
    const s = ss.getSheetByName(names[i]);
    if (s) return s;
  }

  // 2. Tìm tab có tên chứa chữ 'template', 'mẫu', 'sample', 'name1'
  const allSheets = ss.getSheets();
  for (let i = 0; i < allSheets.length; i++) {
    const s = allSheets[i];
    const sName = s.getName().toLowerCase();
    if (sName.includes('template') || sName.includes('mẫu') || sName.includes('name1') || sName.includes('sample')) {
      return s;
    }
  }

  // 3. Nếu không thấy, tìm tab đầu tiên KHÔNG PHẢI là các tab hệ thống và KHÔNG PHẢI là tab của Feature khác
  const systemNames = ['overview', 'test plan', 'test cases', 'test statistics', 'performance', 'security', 'uat', 'test matrix', 'traceability matrix'];
  for (let i = 0; i < allSheets.length; i++) {
    const s = allSheets[i];
    const sName = s.getName().trim().toLowerCase();
    const isSystem = systemNames.includes(sName);
    const isFeatureTab = /^fe-?\d+/i.test(sName); // Bỏ qua mọi tab đã mang tên FE-01, FE-07, FE-08...
    if (!isSystem && !isFeatureTab) {
      return s;
    }
  }

  // 4. Fallback an toàn: lấy tab đầu tiên không phải system
  for (let i = 0; i < allSheets.length; i++) {
    const s = allSheets[i];
    const sName = s.getName().trim().toLowerCase();
    if (!systemNames.includes(sName)) {
      return s;
    }
  }

  return allSheets[allSheets.length - 1];
}

/**
 * Đăng ký tab mới vào 'Test Cases' và 'Test Statistics' (chống trùng dòng)
 */
function registerIndexAndStats(ss, sheetName, moduleTitle, typeLabel) {
  // 1. Tab 'Test Cases'
  const indexSheet = ss.getSheetByName('Test Cases');
  if (indexSheet) {
    const lastRow = indexSheet.getLastRow();
    let alreadyExists = false;
    if (lastRow >= 9) {
      const existing = indexSheet.getRange(9, 4, lastRow - 8, 1).getValues();
      alreadyExists = existing.some(r => String(r[0] || '').trim().toLowerCase() === sheetName.toLowerCase());
    }
    if (!alreadyExists) {
      const nextNo = Math.max(1, lastRow - 8);
      indexSheet.appendRow(['', nextNo, moduleTitle, sheetName, `Kiểm thử ${typeLabel} cho ${moduleTitle}`, 'Hệ thống đã triển khai']);
    }
  }

  // 2. Tab 'Test Statistics'
  const statsSheet = ss.getSheetByName('Test Statistics');
  if (statsSheet) {
    const lastRow = statsSheet.getLastRow();
    let alreadyExists = false;
    if (lastRow >= 11) {
      const existing = statsSheet.getRange(11, 3, lastRow - 10, 1).getValues();
      alreadyExists = existing.some(r => String(r[0] || '').trim().toLowerCase() === sheetName.toLowerCase());
    }
    if (!alreadyExists) {
      const nextNo = Math.max(1, lastRow - 10);
      // Cột: No | Module code | Passed | Failed | Pending | N/A | Number of test cases
      statsSheet.appendRow(['', nextNo, sheetName, 0, 0, 0, 0, 0]);
    }
  }
}

/**
 * Tự động tính toán lại toàn bộ Mục lục (Test Cases) và Thống kê (Test Statistics)
 */
function rebuildReportIndexAndStats(ss, targetType) {
  const ignoreSheets = ['Cover', 'Test Cases', 'Test Statistics', 'Template'];
  const allSheets = ss.getSheets().filter(s => !ignoreSheets.includes(s.getName()));
  const statsList = [];
  const startRow = (targetType === '5.1') ? 12 : 11;

  allSheets.forEach((sheet, idx) => {
    const sName = sheet.getName();
    const lastRow = sheet.getLastRow();
    let total = 0;
    let passed = 0;
    let failed = 0;
    let pending = 0;

    if (lastRow >= startRow) {
      const numRows = lastRow - startRow + 1;
      const statusCol = 6;
      const data = sheet.getRange(startRow, 1, numRows, Math.max(statusCol, sheet.getLastColumn())).getValues();
      data.forEach(r => {
        const id = String(r[0] || '').trim();
        if (id && !id.startsWith('<') && !id.startsWith('Function') && !id.startsWith('Scenario') && !id.startsWith('methodName')) {
          total++;
          const st = String(r[statusCol - 1] || '').trim().toLowerCase();
          if (st === 'passed' || st === 'pass') passed++;
          else if (st === 'failed' || st === 'fail') failed++;
          else pending++;
        }
      });
    }

    // Cập nhật header trong chính sheet đó
    try {
      if (targetType === '5.1') {
        sheet.getRange('B3').setValue(total);
        sheet.getRange('B5').setValue(passed);
        sheet.getRange('C5').setValue(failed);
        sheet.getRange('D5').setValue(pending);
      } else if (targetType === '5.2' || targetType === '5.3') {
        sheet.getRange('B4').setValue(total);
        sheet.getRange('B6').setValue(passed);
        sheet.getRange('C6').setValue(failed);
        sheet.getRange('D6').setValue(pending);
      }
    } catch (e) {}

    statsList.push({
      no: idx + 1,
      name: sName,
      passed,
      failed,
      pending,
      na: 0,
      total
    });
  });

  // 1. Cập nhật tab 'Test Cases'
  const indexSheet = ss.getSheetByName('Test Cases');
  if (indexSheet) {
    const maxRows = indexSheet.getMaxRows();
    if (maxRows >= 9) {
      indexSheet.getRange(9, 1, Math.max(1, maxRows - 8), indexSheet.getMaxColumns()).clearContent();
    }
    const indexRows = statsList.map(s => ['', s.no, s.name, s.name, `Kiểm thử ${targetType} cho ${s.name}`, 'Đã hoàn thành']);
    if (indexRows.length > 0) {
      ensureRowExists(indexSheet, 8 + indexRows.length);
      indexSheet.getRange(9, 1, indexRows.length, indexRows[0].length).setValues(indexRows);
      const range = indexSheet.getRange(9, 2, indexRows.length, 5);
      range.setBorder(true, true, true, true, true, true, '#D0D7DE', SpreadsheetApp.BorderStyle.SOLID);
    }
  }

  // 2. Cập nhật tab 'Test Statistics'
  const statsSheet = ss.getSheetByName('Test Statistics');
  if (statsSheet) {
    const maxRows = statsSheet.getMaxRows();
    if (maxRows >= 11) {
      statsSheet.getRange(11, 1, Math.max(1, maxRows - 10), statsSheet.getMaxColumns()).clearContent();
    }
    const statsRows = statsList.map(s => ['', s.no, s.name, s.passed, s.failed, s.pending, s.na, s.total]);
    if (statsRows.length > 0) {
      ensureRowExists(statsSheet, 10 + statsRows.length);
      statsSheet.getRange(11, 1, statsRows.length, statsRows[0].length).setValues(statsRows);
      const range = statsSheet.getRange(11, 2, statsRows.length, 7);
      range.setBorder(true, true, true, true, true, true, '#D0D7DE', SpreadsheetApp.BorderStyle.SOLID);
    }
    // Cập nhật tổng số dòng 7
    let sumPassed = 0, sumFailed = 0, sumPending = 0, sumTotal = 0;
    statsList.forEach(s => { sumPassed += s.passed; sumFailed += s.failed; sumPending += s.pending; sumTotal += s.total; });
    try {
      statsSheet.getRange('B7').setValue(sumPassed);
      statsSheet.getRange('C7').setValue(sumFailed);
      statsSheet.getRange('D7').setValue(sumPending);
      statsSheet.getRange('F7').setValue(sumTotal);
    } catch (e) {}
  }

  return { sheetsCount: statsList.length, statsList };
}

/**
 * Cập nhật số đếm thống kê cho Report 5.1
 */
function updateHeaderStatistics51(sheet, startRow) {
  const lastRow = sheet.getLastRow();
  if (lastRow < startRow) {
    sheet.getRange('B3').setValue(0);
    sheet.getRange('B5').setValue(0);
    sheet.getRange('C5').setValue(0);
    sheet.getRange('D5').setValue(0);
    return;
  }

  const numRows = lastRow - startRow + 1;
  const data = sheet.getRange(startRow, 1, numRows, 6).getValues();
  let passed = 0;
  let failed = 0;
  let pending = 0;
  let total = 0;

  data.forEach(r => {
    const id = String(r[0] || '').trim();
    if (!id) return;
    total++;
    const status = String(r[5] || '').toLowerCase(); // Col 6 là Round 1
    if (status.includes('pass')) passed++;
    else if (status.includes('fail')) failed++;
    else pending++;
  });

  sheet.getRange('B3').setValue(total);
  sheet.getRange('B5').setValue(passed);
  sheet.getRange('C5').setValue(failed);
  sheet.getRange('D5').setValue(pending);
}

/**
 * Cập nhật số đếm thống kê cho Report 5.2 & 5.3
 */
function updateHeaderStatistics52(sheet, startRow) {
  const lastRow = sheet.getLastRow();
  if (lastRow < startRow) {
    sheet.getRange('B4').setValue(0);
    sheet.getRange('B6').setValue(0);
    sheet.getRange('C6').setValue(0);
    sheet.getRange('D6').setValue(0);
    return;
  }

  const numRows = lastRow - startRow + 1;
  const data = sheet.getRange(startRow, 1, numRows, 6).getValues();
  let passed = 0;
  let failed = 0;
  let pending = 0;
  let total = 0;

  data.forEach(r => {
    const id = String(r[0] || '').trim();
    if (!id) return;
    total++;
    const status = String(r[5] || '').toLowerCase(); // Col 6 là Round 1
    if (status.includes('pass')) passed++;
    else if (status.includes('fail')) failed++;
    else pending++;
  });

  sheet.getRange('B4').setValue(total);
  sheet.getRange('B6').setValue(passed);
  sheet.getRange('C6').setValue(failed);
  sheet.getRange('D6').setValue(pending);
}

function formatStatus(status) {
  const s = String(status || '').trim().toLowerCase();
  if (s.includes('pass') || s === 'passed' || s === 'pass' || s === 'ok') return 'Passed';
  if (s.includes('fail') || s === 'failed') return 'Failed';
  if (s.includes('pending') || s.includes('not run') || s.includes('untested')) return 'Pending';
  return 'Passed';
}

function sanitizeTabName(name) {
  return String(name || 'Tab').replace(/[\\/?*[\]]/g, '_').substring(0, 31);
}

function getTodayFormatted() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function jsonResponse(success, message, data = null) {
  const output = { success, message, data };
  return ContentService.createTextOutput(JSON.stringify(output)).setMimeType(ContentService.MimeType.JSON);
}
