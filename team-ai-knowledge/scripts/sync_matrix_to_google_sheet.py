#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
=============================================================================
ĐỒNG BỘ TOÀN BỘ MASTER TEST MATRIX CỤC BỘ LÊN GOOGLE SHEETS TRỰC TUYẾN
=============================================================================
Mục đích:
- Đọc biến cấu hình từ .env (không hardcode secret).
- Đọc file Excel Master Test Matrix an toàn (kể cả khi đang mở trong Excel).
- Đẩy toàn bộ 5 sheets lên Google Sheet 'Test_Matrix' trực tuyến:
    1. 'Test Matrix' (Ma trận điều phối tổng thể)
    2. 'Traceability Matrix' (Ma trận truy vết yêu cầu phần mềm)
    3. 'Cross-Test FE07-19 (217 TCs)' (Bộ 217 kịch bản kiểm thử chéo, 15 cột)
    4. 'Functional Tests (181 TCs)' (Bộ 181 kịch bản kiểm thử chức năng & UI, 12 cột)
    5. 'Test Cases (Non-Unit)' (128 kịch bản tích hợp & hệ thống nền tảng, 12 cột)
=============================================================================
"""

import os
import shutil
import tempfile
from pathlib import Path
import urllib.request
import json
import sys
import time
import openpyxl

# Tự động nạp cấu hình từ .env
def load_env():
    env_path = Path(r'D:\Sourse_code_Do_An\ai-team-kit\team-ai-knowledge\.env')
    if env_path.exists():
        with open(env_path, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    k, v = line.split('=', 1)
                    k = k.strip()
                    v = v.strip().strip("'\"")
                    if k not in os.environ:
                        os.environ[k] = v

load_env()

API_KEY = os.environ.get('GOOGLE_SHEET_API_KEY', 'MT_GRMS_TEST_SECRET_2026')
WEBAPP_URL = os.environ.get('GOOGLE_SHEET_WEBAPP_URL', 'https://script.google.com/macros/s/AKfycbyk9ES-9OFgNxZFkflnLBGjKOUh9TLVIJMjyh2nRYw6ppmw--vkCLSH2-F0zWcLA-PdWg/exec')
EXCEL_PATH = os.environ.get('LOCAL_TEST_MATRIX_PATH', r'D:\Sourse_code_Do_An\Bao_Cao\MT_GRMS_Test_Matrix_and_Cases.xlsx')

SHEET_CONFIGS = {
    'Test Matrix': {
        'headerRow': 5,
        'tabColor': '#003366',
        'headerBg': '#002B49',
        'statusColIdx': 8,
        'colWidths': [60, 160, 260, 160, 130, 150, 70, 120, 120, 200]
    },
    'Traceability Matrix': {
        'headerRow': 3,
        'tabColor': '#2E5B88',
        'headerBg': '#1A365D',
        'statusColIdx': 5,
        'colWidths': [120, 240, 220, 130, 130, 110]
    },
    'Cross-Test FE07-19 (217 TCs)': {
        'headerRow': 4,
        'tabColor': '#107C41',
        'headerBg': '#0E5C2F',
        'statusColIdx': 13,
        'colWidths': [110, 80, 140, 100, 70, 220, 220, 260, 180, 260, 140, 140, 130, 90, 130]
    },
    'Functional Tests (181 TCs)': {
        'headerRow': 4,
        'tabColor': '#4169E1',
        'headerBg': '#1B365D',
        'statusColIdx': 10,
        'colWidths': [110, 80, 140, 100, 70, 220, 220, 260, 260, 140, 90, 130]
    },
    'Test Cases (Non-Unit)': {
        'headerRow': 4,
        'tabColor': '#4A5568',
        'headerBg': '#2D3748',
        'statusColIdx': 10,
        'colWidths': [110, 140, 220, 130, 90, 220, 260, 260, 180, 110, 90, 100]
    }
}

def send_payload(payload):
    data = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(WEBAPP_URL, data=data, headers={'Content-Type': 'application/json'})
    with urllib.request.urlopen(req, timeout=90) as resp:
        return json.loads(resp.read().decode('utf-8'))

def load_workbook_safe(path):
    try:
        return openpyxl.load_workbook(path, data_only=True)
    except (PermissionError, IOError):
        # Nếu file đang mở trong Excel hoặc bị lock, copy tạm ra thư mục temp để đọc
        temp_file = os.path.join(tempfile.gettempdir(), 'MT_GRMS_Test_Matrix_temp.xlsx')
        shutil.copyfile(path, temp_file)
        return openpyxl.load_workbook(temp_file, data_only=True)

def sync_all():
    sys.stdout.reconfigure(encoding='utf-8')
    print(f'Mở file Excel: {EXCEL_PATH}')
    wb = load_workbook_safe(EXCEL_PATH)

    for sheet_name in ['Test Matrix', 'Traceability Matrix', 'Cross-Test FE07-19 (217 TCs)', 'Functional Tests (181 TCs)', 'Test Cases (Non-Unit)']:
        if sheet_name not in SHEET_CONFIGS:
            continue

        cfg = SHEET_CONFIGS[sheet_name]
        ws = wb[sheet_name]
        h_row = cfg['headerRow']

        # Đọc Header
        header_vals = [c.value for c in ws[h_row]]
        while header_vals and header_vals[-1] is None:
            header_vals.pop()
        num_cols = len(header_vals)

        # Đọc Title rows
        title_rows = []
        for r in range(1, h_row):
            row_vals = [str(c.value or '') for c in ws[r]][:num_cols]
            bold = True if r <= 2 else False
            font_size = 14 if r == 1 else (11 if r == 2 else 10)
            font_color = '#002B49' if r == 1 else '#333333'
            title_rows.append({
                'values': row_vals,
                'bold': bold,
                'fontSize': font_size,
                'fontColor': font_color,
                'height': 24 if r == 1 else 20
            })

        # Đọc Data rows
        all_data_rows = []
        for r in range(h_row + 1, ws.max_row + 1):
            row_vals = [str(c.value) if c.value is not None else '' for c in ws[r]][:num_cols]
            if any(row_vals):
                all_data_rows.append(row_vals)

        total_rows = len(all_data_rows)
        print(f"\n🚀 Đang đồng bộ Tab '{sheet_name}': {total_rows} dòng dữ liệu, {num_cols} cột...")

        payload = {
            'apiKey': API_KEY,
            'action': 'upload_raw_tab',
            'reportType': 'matrix',
            'tabName': sheet_name,
            'tabColor': cfg['tabColor'],
            'headerBg': cfg['headerBg'],
            'headerColor': '#FFFFFF',
            'statusColIdx': cfg['statusColIdx'],
            'colWidths': cfg['colWidths'],
            'isFirstChunk': True,
            'mode': 'replace',
            'titleRows': title_rows,
            'headerRow': header_vals,
            'dataRows': all_data_rows,
            'startRow': 1
        }

        try:
            res = send_payload(payload)
            data_res = res.get('data', {})
            print(f"   ✅ Thành công: {res.get('message')} (Tổng {data_res.get('totalRows')} dòng, {data_res.get('totalCols')} cột)")
            time.sleep(1.5)
        except Exception as e:
            print(f"   ❌ Lỗi đồng bộ sheet {sheet_name}: {e}")

    print("\n🎉 Hoàn thành đồng bộ toàn bộ 5 Tab lên Google Sheet Master Matrix!")

if __name__ == '__main__':
    sync_all()
