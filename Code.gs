const SPREADSHEET_ID = '1LJrEEyM13Nmjo_9gR8Z-OSlcQErTlkPe4c1GHcworZA';
const CASE_SHEET_NAME = '04_案件紀錄表';

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents || '{}');
    const result = handleAction(payload);
    return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.message || 'Internal server error' }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function handleAction(payload) {
  if (!payload || !payload.action) {
    return { status: 'error', message: 'Missing action' };
  }

  switch (payload.action) {
    case 'owner_confirm':
      return handleOwnerConfirm(payload);
    case 'create_case':
      return createCaseRecord(payload);
    default:
      return { status: 'error', message: 'Unknown action: ' + payload.action };
  }
}

function handleOwnerConfirm(payload) {
  const createCaseResult = createCaseRecord({
    quoteNo:      payload.quoteNo,
    customerName: payload.customerName,
    projectName:  payload.projectName,
    revenue:      payload.revenue,
    cost:         payload.cost,
    days:         payload.days,
    owner:        payload.owner || payload.ownerName || '',
    daysNote:     payload.daysNote,
    status:       '已簽名完成',
    source:       'owner_confirm',
  });

  if (createCaseResult.status !== 'ok') {
    return {
      status: 'error',
      message: 'owner_confirm succeeded but create_case failed: ' + createCaseResult.message,
      caseCreated: false,
    };
  }

  return {
    status: 'ok',
    ownerConfirmed: true,
    caseCreated: createCaseResult.caseCreated === true,
    message: createCaseResult.message || '',
  };
}

function createCaseRecord(data) {
  const quoteNo = String(data.quoteNo || '').trim();
  if (!quoteNo) {
    return { status: 'error', message: 'quoteNo is required' };
  }

  const sheet = getCaseSheet();
  if (!sheet) {
    return { status: 'error', message: 'Sheet not found: ' + CASE_SHEET_NAME };
  }

  if (caseExists(sheet, quoteNo)) {
    return { status: 'ok', caseCreated: false, message: 'Case already exists for quoteNo ' + quoteNo };
  }

  const row = [
    new Date(),
    quoteNo,
    String(data.customerName || ''),
    String(data.projectName || ''),
    Number(data.revenue) || 0,
    Number(data.cost) || 0,
    Number(data.days) || 0,
    String(data.owner || ''),
    String(data.daysNote || ''),
    String(data.status || '已簽名完成'),
    String(data.source || 'owner_confirm')
  ];

  sheet.appendRow(row);
  return { status: 'ok', caseCreated: true };
}

function getCaseSheet() {
  return SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(CASE_SHEET_NAME);
}

function caseExists(sheet, quoteNo) {
  const values = sheet.getDataRange().getValues();
  for (let i = 0; i < values.length; i++) {
    for (let j = 0; j < values[i].length; j++) {
      if (String(values[i][j] || '').trim() === quoteNo) {
        return true;
      }
    }
  }
  return false;
}
