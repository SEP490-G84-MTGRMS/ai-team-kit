/**
 * =========================================================================================
 * GOOGLE APPS SCRIPT GATEWAY — TEST REPORT SYNC (MT-GRMS & AI-TEAM-KIT)
 * =========================================================================================
 * Mục đích:
 * - Nhận HTTP POST từ AI-team-kit (MCP tool: sep_dong_bo_test_sheet) hoặc test runner.
 * - Điều phối mở 5 file Google Sheets kiểm thử (Report 5.1 -> 5.5).
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

  // ID của 5 file Google Sheets trên Google Drive (Lấy từ URL của từng file sheet)
  // URL: https://docs.google.com/spreadsheets/d/<SPREADSHEET_ID>/edit
  SPREADSHEET_IDS: {
    '5.1': 'YOUR_REPORT_5_1_SPREADSHEET_ID', // Report-5.1_Unit Test
    '5.2': 'YOUR_REPORT_5_2_SPREADSHEET_ID', // Report-5.2_Integration Test
    '5.3': 'YOUR_REPORT_5_3_SPREADSHEET_ID', // Report-5.3_System Test_FRs
    '5.4': 'YOUR_REPORT_5_4_SPREADSHEET_ID', // Report-5.4_System Test_NFRs
    '5.5': 'YOUR_REPORT_5_5_SPREADSHEET_ID', // Report-5.5_Acceptance Test Scripts
  }
};

/**
 * Xử lý GET request để kiểm tra tình trạng Web App
 */
function doGet(e) {
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

    // 3. Thực thi sync theo reportType
    const reportType = String(payload.reportType || '').trim();
    if (!CONFIG.SPREADSHEET_IDS[reportType]) {
      return jsonResponse(false, `Invalid reportType: '${reportType}'. Must be one of: 5.1, 5.2, 5.3, 5.4, 5.5`);
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
    const templateSheet = ss.getSheetByName('ModuleName1') || ss.getSheets()[3];
    if (!templateSheet) throw new Error('Cannot find template sheet for Module in Report-5.1!');
    sheet = templateSheet.copyTo(ss);
    sheet.setName(targetTabName);
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
      sheet.getRange(existingRow, 6).setValue(statusVal); // Round 1
      sheet.getRange(existingRow, 7).setValue(testDate);  // Test date
      sheet.getRange(existingRow, 8).setValue(tester);    // Tester
      updatedCount++;
    } else {
      const nextRow = getNextAvailableRow(sheet, startRow);
      ensureRowExists(sheet, nextRow);
      sheet.getRange(nextRow, 1).setValue(testId);
      sheet.getRange(nextRow, 2).setValue(item.preConditions || 'N/A');
      sheet.getRange(nextRow, 3).setValue(item.inputParams || item.steps || 'N/A');
      sheet.getRange(nextRow, 4).setValue(item.expectedResults || item.expected || 'N/A');
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
    const templateSheet = ss.getSheetByName('Feature Name1') || ss.getSheets()[3];
    if (!templateSheet) throw new Error('Cannot find template sheet for Feature in Report-5.2!');
    sheet = templateSheet.copyTo(ss);
    sheet.setName(targetTabName);
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
      sheet.getRange(existingRow, 6).setValue(statusVal); // Round 1
      sheet.getRange(existingRow, 7).setValue(testDate);
      sheet.getRange(existingRow, 8).setValue(tester);
      updatedCount++;
    } else {
      const nextRow = getNextAvailableRow(sheet, startRow);
      ensureRowExists(sheet, nextRow);
      sheet.getRange(nextRow, 1).setValue(testId);
      sheet.getRange(nextRow, 2).setValue(item.description || item.name || 'N/A');
      sheet.getRange(nextRow, 3).setValue(item.procedure || item.steps || 'N/A');
      sheet.getRange(nextRow, 4).setValue(item.expectedResults || item.expected || 'N/A');
      sheet.getRange(nextRow, 5).setValue(item.preConditions || 'N/A');
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
    const templateSheet = ss.getSheetByName('Workflow Name1') || ss.getSheets()[3];
    if (!templateSheet) throw new Error('Cannot find template sheet for Workflow in Report-5.3!');
    sheet = templateSheet.copyTo(ss);
    sheet.setName(targetTabName);
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
      sheet.getRange(existingRow, 6).setValue(statusVal);
      sheet.getRange(existingRow, 7).setValue(testDate);
      sheet.getRange(existingRow, 8).setValue(tester);
      updatedCount++;
    } else {
      const nextRow = getNextAvailableRow(sheet, startRow);
      ensureRowExists(sheet, nextRow);
      sheet.getRange(nextRow, 1).setValue(testId);
      sheet.getRange(nextRow, 2).setValue(item.description || item.name || 'N/A');
      sheet.getRange(nextRow, 3).setValue(item.procedure || item.steps || 'N/A');
      sheet.getRange(nextRow, 4).setValue(item.expectedResults || item.expected || 'N/A');
      sheet.getRange(nextRow, 5).setValue(item.preConditions || 'N/A');
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
        if (item.actual) sheet.getRange(existingRow, 5).setValue(item.actual);
        sheet.getRange(existingRow, 6).setValue(statusVal);
        if (item.notes) sheet.getRange(existingRow, 8).setValue(item.notes);
        updatedCount++;
      } else {
        const nextRow = getNextAvailableRow(sheet, startRow);
        ensureRowExists(sheet, nextRow);
        sheet.getRange(nextRow, 1).setValue(testId);
        sheet.getRange(nextRow, 2).setValue(item.scenario || item.description || 'N/A');
        sheet.getRange(nextRow, 3).setValue(item.tool || 'Automated / DevTools');
        sheet.getRange(nextRow, 4).setValue(item.target || '< 2s');
        sheet.getRange(nextRow, 5).setValue(item.actual || 'PASS');
        sheet.getRange(nextRow, 6).setValue(statusVal);
        sheet.getRange(nextRow, 7).setValue(item.defectId || '');
        sheet.getRange(nextRow, 8).setValue(item.notes || '');
        insertedCount++;
      }
    } else {
      // Security: Test Case ID | Scenario Name | Role / Session | Given | When | Then | Priority | Status | Defect ID | Notes
      if (existingRow !== -1) {
        ensureRowExists(sheet, existingRow);
        sheet.getRange(existingRow, 8).setValue(statusVal);
        if (item.notes) sheet.getRange(existingRow, 10).setValue(item.notes);
        updatedCount++;
      } else {
        const nextRow = getNextAvailableRow(sheet, startRow);
        ensureRowExists(sheet, nextRow);
        sheet.getRange(nextRow, 1).setValue(testId);
        sheet.getRange(nextRow, 2).setValue(item.scenario || item.name || 'N/A');
        sheet.getRange(nextRow, 3).setValue(item.role || 'User');
        sheet.getRange(nextRow, 4).setValue(item.given || 'N/A');
        sheet.getRange(nextRow, 5).setValue(item.when || 'N/A');
        sheet.getRange(nextRow, 6).setValue(item.then || item.expected || 'N/A');
        sheet.getRange(nextRow, 7).setValue(item.priority || 'Medium');
        sheet.getRange(nextRow, 8).setValue(statusVal);
        sheet.getRange(nextRow, 9).setValue(item.defectId || '');
        sheet.getRange(nextRow, 10).setValue(item.notes || '');
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
      sheet.getRange(existingRow, 8).setValue(resultVal); // Result
      if (item.feedback) sheet.getRange(existingRow, 9).setValue(item.feedback);
      updatedCount++;
    } else {
      const nextRow = getNextAvailableRow(sheet, startRow);
      ensureRowExists(sheet, nextRow);
      sheet.getRange(nextRow, 1).setValue(scriptId);
      sheet.getRange(nextRow, 2).setValue(item.bfId || item.featureCode || 'BF-01');
      sheet.getRange(nextRow, 3).setValue(item.title || item.name || 'N/A');
      sheet.getRange(nextRow, 4).setValue(item.actor || item.role || 'Customer');
      sheet.getRange(nextRow, 5).setValue(item.scenario || item.steps || 'N/A');
      sheet.getRange(nextRow, 6).setValue(item.expectedOutcome || item.expected || 'N/A');
      sheet.getRange(nextRow, 7).setValue(item.priority || 'High');
      sheet.getRange(nextRow, 8).setValue(resultVal);
      sheet.getRange(nextRow, 9).setValue(item.feedback || '');
      insertedCount++;
    }
  });

  const totalCount = countFilledRows(sheet, startRow);
  return { tab: sheet.getName(), updated: updatedCount, inserted: insertedCount, total: totalCount };
}

/**
 * =========================================================================
 * HELPER UTILITIES
 * =========================================================================
 */

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
 * Đăng ký tab mới vào 'Test Cases' và 'Test Statistics'
 */
function registerIndexAndStats(ss, sheetName, moduleTitle, typeLabel) {
  // 1. Tab 'Test Cases'
  const indexSheet = ss.getSheetByName('Test Cases');
  if (indexSheet) {
    const lastRow = indexSheet.getLastRow();
    const nextNo = Math.max(1, lastRow - 8);
    indexSheet.appendRow(['', nextNo, moduleTitle, sheetName, `Kiểm thử ${typeLabel} cho ${moduleTitle}`, 'Hệ thống đã triển khai']);
  }

  // 2. Tab 'Test Statistics'
  const statsSheet = ss.getSheetByName('Test Statistics');
  if (statsSheet) {
    const lastRow = statsSheet.getLastRow();
    const nextNo = Math.max(1, lastRow - 10);
    // Cột: No | Module code | Passed | Failed | Pending | N/A | Number of test cases
    statsSheet.appendRow(['', nextNo, sheetName, 0, 0, 0, 0, 0]);
  }
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
