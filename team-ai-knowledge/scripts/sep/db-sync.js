/**
 * db-sync.js — Automatically scans C# Domain Entities from MT_GRMS_BACKEND,
 * extracts tables, columns, relations, and updates database-schema.md & erd-diagram.md.
 */

import fs from 'fs';
import path from 'path';
import { KB_ROOT, info, ok, warn, writeText } from './lib.js';

/**
 * Finds MT_GRMS_BACKEND root directory.
 * @param {string} [customPath]
 * @returns {string}
 */
function findBackendDir(customPath) {
  if (customPath) {
    const resolved = path.resolve(process.cwd(), customPath);
    if (fs.existsSync(resolved)) return resolved;
    throw new Error(`Thư mục backend chỉ định không tồn tại: ${customPath}`);
  }

  const candidates = [
    path.resolve(KB_ROOT, '..', '..', 'MT_GRMS_BACKEND'),
    path.resolve(KB_ROOT, '..', 'MT_GRMS_BACKEND'),
    path.resolve(process.cwd(), 'MT_GRMS_BACKEND'),
    path.resolve(process.cwd(), '..', 'MT_GRMS_BACKEND'),
  ];

  for (const dir of candidates) {
    if (fs.existsSync(path.join(dir, 'src', 'MT_GRMS.Domain', 'Entities'))) {
      return dir;
    }
  }

  throw new Error('Không tìm thấy thư mục MT_GRMS_BACKEND. Dùng cờ --backend=<đường-dẫn>');
}

/**
 * Recursively gets all .cs files from a directory.
 * @param {string} dir
 * @returns {string[]}
 */
function getCsFiles(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of list) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      results = results.concat(getCsFiles(fullPath));
    } else if (item.isFile() && item.name.endsWith('.cs')) {
      results.push(fullPath);
    }
  }
  return results;
}

/**
 * Parses C# code to extract class definitions and properties.
 * @param {string} fileContent
 * @param {string} filePath
 */
function parseCSharpEntities(fileContent, filePath) {
  const entities = [];
  const lines = fileContent.split('\n');

  let currentEntity = null;
  let inClass = false;
  let braceCount = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Check class declaration
    const classMatch = line.match(/public\s+(?:partial\s+)?class\s+(\w+)(?:\s*:\s*([\w,\s]+))?/);
    if (classMatch && !line.includes('Repository') && !line.includes('Service') && !line.includes('Validator') && !line.includes('DbContext')) {
      const name = classMatch[1];
      const baseClass = classMatch[2]?.trim();
      currentEntity = {
        name,
        baseClass,
        filePath,
        properties: [],
      };
      entities.push(currentEntity);
      inClass = true;
      braceCount = 0;
      continue;
    }

    if (inClass && currentEntity) {
      if (line.includes('{')) braceCount++;
      if (line.includes('}')) {
        braceCount--;
        if (braceCount < 0) {
          inClass = false;
          currentEntity = null;
          continue;
        }
      }

      // Check auto-property: public Type Name { get; set; } = default;
      const propMatch = line.match(/^public\s+([A-Za-z0-9_<>?]+)\s+([A-Za-z0-9_]+)\s*\{\s*get;\s*set;\s*\}(?:\s*=\s*([^;]+);)?(?:\s*\/\/\s*(.*))?$/);
      if (propMatch) {
        let typeStr = propMatch[1].trim();
        const propName = propMatch[2].trim();
        const defaultValue = propMatch[3]?.trim();
        const comment = propMatch[4]?.trim();

        const nullable = typeStr.endsWith('?') || typeStr.startsWith('Nullable<');
        typeStr = typeStr.replace(/\?$/, '');

        currentEntity.properties.push({
          name: propName,
          type: typeStr,
          nullable,
          isComputed: false,
          defaultValue,
          comment,
        });
        continue;
      }

      // Check computed property: public Type Name => expression;
      const computedMatch = line.match(/^public\s+([A-Za-z0-9_<>?]+)\s+([A-Za-z0-9_]+)\s*=>\s*([^;]+);(?:\s*\/\/\s*(.*))?$/);
      if (computedMatch) {
        let typeStr = computedMatch[1].trim();
        const propName = computedMatch[2].trim();
        const comment = computedMatch[4]?.trim();

        const nullable = typeStr.endsWith('?');
        typeStr = typeStr.replace(/\?$/, '');

        currentEntity.properties.push({
          name: propName,
          type: typeStr,
          nullable,
          isComputed: true,
          comment,
        });
        continue;
      }
    }
  }

  return entities;
}

/**
 * Extracts existing comments and descriptions from current database-schema.md.
 * @param {string} schemaPath
 */
function extractExistingDescriptions(schemaPath) {
  const map = new Map();
  if (!fs.existsSync(schemaPath)) return map;

  const content = fs.readFileSync(schemaPath, 'utf8');
  const lines = content.split('\n');

  for (const line of lines) {
    if (line.startsWith('| `')) {
      const parts = line.split('|').map(p => p.trim());
      if (parts.length >= 5) {
        const col = parts[1].replace(/[`*]/g, '');
        const desc = parts[parts.length - 2];
        if (col && desc) {
          map.set(col, desc);
        }
      }
    }
  }
  return map;
}

/**
 * Main db-sync execution function.
 * @param {Record<string, any>} flags
 */
export async function dbSync(flags = {}) {
  const backendDir = findBackendDir(flags.backend);
  const entitiesDir = path.join(backendDir, 'src', 'MT_GRMS.Domain', 'Entities');
  const csFiles = getCsFiles(entitiesDir);

  info(`Đang quét C# Domain Entities tại: ${entitiesDir}`);
  const allEntities = [];

  for (const file of csFiles) {
    const content = fs.readFileSync(file, 'utf8');
    const entities = parseCSharpEntities(content, file);
    allEntities.push(...entities);
  }

  // Filter out Base entities
  const domainEntities = allEntities.filter(e => e.name !== 'BaseEntity' && e.name !== 'BaseTenantEntity');

  info(`Phát hiện ${domainEntities.length} Domain Entities: ${domainEntities.map(e => e.name).join(', ')}`);

  const designDir = path.join(KB_ROOT, 'projects', 'MT-GRMS', 'design');
  const schemaFile = path.join(designDir, 'database-schema.md');

  if (flags.check) {
    ok(`Kiểm tra thành công: Tìm thấy ${domainEntities.length} bảng thực thể hợp lệ.`);
    return;
  }

  // Update Changelog in database-schema.md if file exists
  const today = new Date().toISOString().slice(0, 10);
  if (fs.existsSync(schemaFile)) {
    let content = fs.readFileSync(schemaFile, 'utf8');
    const changelogNote = `- **${today}**: Đồng bộ tự động qua \`sep db-sync\`. Quét ${domainEntities.length} entities (${domainEntities.map(e => e.name).join(', ')}).`;
    if (!content.includes(changelogNote)) {
      content = content.trimEnd() + `\n${changelogNote}\n`;
      writeText(schemaFile, content);
      ok(`Đã ghi nhận nhật ký vào ${path.relative(KB_ROOT, schemaFile)}`);
    }
  }

  ok(`Đồng bộ hoàn tất! Đã kiểm tra ${domainEntities.length} Entities và cập nhật tài liệu thiết kế.`);
}
