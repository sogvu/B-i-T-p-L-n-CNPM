const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { createObjectCsvWriter } = require('csv-writer');

const DATA_DIR = path.join(__dirname, '../data');

/**
 * Đọc file CSV và trả về mảng objects
 */
function readCSV(filename) {
  return new Promise((resolve, reject) => {
    const results = [];
    const filePath = path.join(DATA_DIR, filename);

    if (!fs.existsSync(filePath)) {
      return resolve([]);
    }

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', reject);
  });
}

/**
 * Ghi toàn bộ dữ liệu vào file CSV (overwrite)
 */
async function writeCSV(filename, records, headers) {
  const filePath = path.join(DATA_DIR, filename);

  if (!records || records.length === 0) {
    return;
  }

  const headerConfig = headers || Object.keys(records[0]).map((key) => ({ id: key, title: key }));

  const writer = createObjectCsvWriter({
    path: filePath,
    header: headerConfig,
  });

  await writer.writeRecords(records);
}

/**
 * Thêm một hàng mới vào cuối CSV
 */
async function appendRow(filename, record) {
  const filePath = path.join(DATA_DIR, filename);
  const existingRecords = await readCSV(filename);

  const allRecords = [...existingRecords, record];
  const headers = Object.keys(record).map((key) => ({ id: key, title: key }));

  // Use existing headers if file already has them
  if (existingRecords.length > 0) {
    const existingHeaders = Object.keys(existingRecords[0]).map((key) => ({ id: key, title: key }));
    await writeCSV(filename, allRecords, existingHeaders);
  } else {
    await writeCSV(filename, allRecords, headers);
  }
}

/**
 * Cập nhật một row theo ID field
 */
async function updateRow(filename, idField, idValue, updatedData) {
  const records = await readCSV(filename);
  const index = records.findIndex((r) => r[idField] === idValue);

  if (index === -1) {
    throw new Error(`Record with ${idField}=${idValue} not found`);
  }

  records[index] = { ...records[index], ...updatedData };
  const headers = Object.keys(records[0]).map((key) => ({ id: key, title: key }));
  await writeCSV(filename, records, headers);
  return records[index];
}

/**
 * Xóa một row theo ID field
 */
async function deleteRow(filename, idField, idValue) {
  const records = await readCSV(filename);
  const filtered = records.filter((r) => r[idField] !== idValue);

  if (filtered.length === records.length) {
    throw new Error(`Record with ${idField}=${idValue} not found`);
  }

  const headers = Object.keys(records[0]).map((key) => ({ id: key, title: key }));
  await writeCSV(filename, filtered, headers);
}

module.exports = { readCSV, writeCSV, appendRow, updateRow, deleteRow };
