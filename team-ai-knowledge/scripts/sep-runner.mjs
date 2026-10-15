import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { LocalProvider } from '../mcp-server/dist/providers/localProvider.js';
import { createSepWorkflow } from '../mcp-server/dist/tools/sepWorkflow.js';
import { createActiveStore } from '../mcp-server/dist/tools/localState.js';
import { createGitSync } from '../mcp-server/dist/tools/gitSync.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const kbRoot = path.resolve(__dirname, '..');

const provider = new LocalProvider(kbRoot);
const activeStore = createActiveStore(kbRoot);
const afterWrite = createGitSync(kbRoot);

const sep = createSepWorkflow(provider, {
  defaultAssignee: process.env.SEP_ASSIGNEE || 'Des7240',
  defaultProject: 'MT-GRMS',
  activeStore,
  afterWrite,
});

const action = process.argv[2];
let payload = {};

if (process.argv[3]) {
  if (process.argv[3].endsWith('.json') && fs.existsSync(process.argv[3])) {
    payload = JSON.parse(fs.readFileSync(process.argv[3], 'utf8'));
  } else {
    payload = JSON.parse(process.argv[3]);
  }
}

try {
  let result;
  if (action === 'tao_change') {
    result = await sep.handleTaoChange(payload);
  } else if (action === 'xem_change') {
    result = await sep.handleXemChange(payload);
  } else if (action === 'chon_change') {
    result = await sep.handleChonChange(payload);
  } else if (action === 'luu_artifact') {
    result = await sep.handleLuuArtifact(payload);
  } else if (action === 'duyet_buoc') {
    result = await sep.handleDuyetBuoc(payload);
  } else if (action === 'chuyen_trang_thai') {
    result = await sep.handleChuyenTrangThai(payload);
  } else if (action === 'xem_persona') {
    result = await sep.handleXemPersona(payload);
  } else if (action === 'lui_buoc') {
    result = await sep.handleLuiBuoc(payload);
  } else if (action === 'danh_sach') {
    result = await sep.handleDanhSachChange(payload);
  } else {
    throw new Error('Action unknown: ' + action);
  }
  console.log(result);
} catch (err) {
  console.error('Error:', err.message);
  process.exit(1);
}
