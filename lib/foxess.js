// Minimal client for the FoxESS OpenAPI.
//
// Docs: https://www.foxesscloud.com/public/i18n/en/OpenApiDocument.html
//
// Every request must carry a Signature header:
//   MD5(`${path}\r\n${token}\r\n${timestamp}`)
// where `path` is the request path only (no domain/query string).
//
// Unlike a browser, a native Expo app is not subject to CORS, so this
// call can go straight from the device to FoxESS's servers — no proxy
// server required. Your API key does live on the device, though, so
// only do this in an app you control and trust.

import MD5 from 'crypto-js/md5';

const BASE_URL = 'https://www.foxesscloud.com';
const REAL_QUERY_PATH = '/op/v1/device/real/query';

function buildHeaders(path, token) {
  const timestamp = Date.now().toString();
  const toSign = `${path}\r\n${token}\r\n${timestamp}`;
  const signature = MD5(toSign).toString();
  return {
    token,
    timestamp,
    signature,
    lang: 'en',
    'Content-Type': 'application/json',
  };
}

// Fetches the latest instantaneous readings for one inverter.
// `variables` lets you ask for specific channels; leave empty for the
// default set (pvPower, batChargePower, batDischargePower, batSoc,
// gridConsumptionPower, feedinPower, loadsPower, etc — the exact
// names are listed in the OpenAPI docs' variable dictionary).
export async function fetchRealtime({ apiKey, sn, variables = [] }) {
  const headers = buildHeaders(REAL_QUERY_PATH, apiKey);
  const res = await fetch(BASE_URL + REAL_QUERY_PATH, {
    method: 'POST',
    headers,
    body: JSON.stringify({ sn, variables }),
  });

  const json = await res.json();
  if (json.errno && json.errno !== 0) {
    throw new Error(`FoxESS error ${json.errno}: ${json.msg || 'request failed'}`);
  }
  return normalizeRealtime(json);
}

// Reshapes FoxESS's { result: [{ datas: [{variable, value}, ...] }] }
// response into the flat shape the UI components expect.
function normalizeRealtime(json) {
  const datas = json?.result?.[0]?.datas || [];
  const byName = {};
  for (const d of datas) byName[d.variable] = d.value;

  const pv = byName.pvPower ?? 0;
  const load = byName.loadsPower ?? 0;
  const batCharge = byName.batChargePower ?? 0;
  const batDischarge = byName.batDischargePower ?? 0;
  const gridConsumption = byName.gridConsumptionPower ?? 0;
  const feedIn = byName.feedinPower ?? 0;
  const soc = byName.SoC ?? byName.batSoc ?? null;

  return {
    pv,
    load,
    battFlow: batCharge - batDischarge, // positive = charging
    gridFlow: feedIn - gridConsumption, // positive = exporting
    soc,
    raw: byName,
  };
}
