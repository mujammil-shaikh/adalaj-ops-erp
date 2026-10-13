/**
 * Reusable, dependency-free quotation/invoice HTML renderer.
 *
 * Usage:
 *   node Adalaj_Quotation_Invoice_Engine.mjs Adalaj_Quotation_Invoice_Example.json ./dist/example.html
 *
 * IMPORTANT:
 * - This is a document renderer/reference module, NOT an accounting system.
 * - The authenticated backend must validate permissions, calculate/approve tax treatment,
 *   allocate a unique document number atomically, persist an immutable issued snapshot,
 *   and audit issue/void/credit-note/print/export actions.
 * - Money values use integer minor units (INR: paise). Do not pass floating-point rupee amounts.
 * - Invoice numbers are supplied by the backend. This module never creates official numbers.
 * - Use official GST/e-invoice/IRN/QR services where applicable. Do not forge government IDs.
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const QUANTITY_SCALE = 1_000_000n; // quantity precision: up to 6 decimal places
const BPS_DENOMINATOR = 10_000n;  // 10,000 basis points = 100%

const DOCUMENT_TITLES = Object.freeze({
  quotation: 'Quotation',
  proforma_invoice: 'Pro Forma Invoice',
  sales_invoice: 'Tax Invoice',
  export_invoice: 'Commercial / Export Invoice',
  delivery_challan: 'Delivery Challan',
  packing_list: 'Packing List',
  credit_note: 'Credit Note',
  debit_note: 'Debit Note',
  receipt: 'Receipt',
  statement: 'Account Statement',
});

function htmlEscape(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[char]);
}

function asBigIntInteger(value, fieldName, { min = null, max = null } = {}) {
  if (typeof value === 'bigint') {
    if (min !== null && value < BigInt(min)) throw new TypeError(`${fieldName} is below its allowed minimum`);
    if (max !== null && value > BigInt(max)) throw new TypeError(`${fieldName} is above its allowed maximum`);
    return value;
  }
  if (!(typeof value === 'number' && Number.isSafeInteger(value)) && !(typeof value === 'string' && /^-?\d+$/.test(value))) {
    throw new TypeError(`${fieldName} must be an integer minor-unit value`);
  }
  const result = BigInt(value);
  if (min !== null && result < BigInt(min)) throw new TypeError(`${fieldName} is below its allowed minimum`);
  if (max !== null && result > BigInt(max)) throw new TypeError(`${fieldName} is above its allowed maximum`);
  return result;
}

function roundedDivide(numerator, denominator) {
  if (denominator <= 0n) throw new RangeError('Denominator must be positive');
  if (numerator < 0n) return -roundedDivide(-numerator, denominator);
  return (numerator + denominator / 2n) / denominator;
}

function quantityToScaledInt(value, fieldName = 'quantity') {
  const raw = String(value ?? '');
  const match = raw.match(/^(\d+)(?:\.(\d{1,6}))?$/);
  if (!match) throw new TypeError(`${fieldName} must be a positive decimal with at most 6 decimal places`);
  const fractional = (match[2] ?? '').padEnd(6, '0');
  const scaled = BigInt(match[1]) * QUANTITY_SCALE + BigInt(fractional || '0');
  if (scaled <= 0n) throw new RangeError(`${fieldName} must be greater than zero`);
  return scaled;
}

function currencyDigits(currencyCode, locale = 'en-IN', explicitDigits) {
  if (Number.isInteger(explicitDigits) && explicitDigits >= 0 && explicitDigits <= 4) return explicitDigits;
  try {
    return new Intl.NumberFormat(locale, { style: 'currency', currency: currencyCode }).resolvedOptions().maximumFractionDigits;
  } catch {
    throw new TypeError(`Invalid currency code: ${currencyCode}`);
  }
}

function formatMoney(minor, currencyCode, locale, digits) {
  const value = Number(minor) / (10 ** digits);
  if (!Number.isFinite(value)) return `${currencyCode} ${String(minor)}`;
  return new Intl.NumberFormat(locale, {
    style: 'currency', currency: currencyCode,
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

function formatQuantity(quantity, locale = 'en-IN') {
  const numeric = Number(quantity);
  if (!Number.isFinite(numeric)) return htmlEscape(quantity);
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 6 }).format(numeric);
}

function formatDate(value, locale = 'en-IN') {
  if (!value) return '—';
  const date = new Date(`${String(value).slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return htmlEscape(value);
  return new Intl.DateTimeFormat(locale, { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(date);
}

function safeAssetSrc(value) {
  if (!value || typeof value !== 'string') return '';
  // Allow only same-origin root-relative asset paths or HTTPS URLs. No data:, javascript: or protocol-relative URLs.
  if (value.startsWith('/') && !value.startsWith('//') && !value.includes('\\') && !value.includes('..')) return value;
  try {
    const parsed = new URL(value);
    if (parsed.protocol === 'https:' && !parsed.username && !parsed.password) return parsed.href;
  } catch { /* not an absolute URL */ }
  return '';
}

function safeQrSrc(value) {
  if (!value || typeof value !== 'string') return '';
  // QR images must be generated by the app/backend and supplied as a base64 raster or authorised same-origin asset.
  if (/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(value)) return value;
  return safeAssetSrc(value);
}

function normalizeBps(value, fieldName) {
  const bps = asBigIntInteger(value ?? 0, fieldName, { min: 0, max: 100_000 });
  return bps;
}

function calculateTax(taxableMinor, taxDefinition, digits) {
  const label = String(taxDefinition.label ?? 'Tax');
  const rateBps = normalizeBps(taxDefinition.rateBps ?? 0, `${label} rateBps`);
  const amountMinor = taxDefinition.amountMinorOverride !== undefined
    ? asBigIntInteger(taxDefinition.amountMinorOverride, `${label} amountMinorOverride`, { min: 0 })
    : roundedDivide(taxableMinor * rateBps, BPS_DENOMINATOR);
  return {
    label,
    rateBps,
    amountMinor,
    ratePercent: Number(rateBps) / 100,
  };
}

function calculateItem(item, digits, prefix = 'line item') {
  const quantity = quantityToScaledInt(item.quantity, `${prefix} quantity`);
  const unitPriceMinor = asBigIntInteger(item.unitPriceMinor, `${prefix} unitPriceMinor`, { min: 0 });
  const grossMinor = roundedDivide(unitPriceMinor * quantity, QUANTITY_SCALE);
  let discountMinor;
  if (item.discountMinor !== undefined) {
    discountMinor = asBigIntInteger(item.discountMinor, `${prefix} discountMinor`, { min: 0, max: grossMinor });
  } else {
    const discountBps = normalizeBps(item.discountBps ?? 0, `${prefix} discountBps`);
    if (discountBps > BPS_DENOMINATOR) throw new RangeError(`${prefix} discount cannot exceed 100%`);
    discountMinor = roundedDivide(grossMinor * discountBps, BPS_DENOMINATOR);
  }
  const taxableMinor = grossMinor - discountMinor;
  const taxes = (Array.isArray(item.taxes) ? item.taxes : []).map((tax) => calculateTax(taxableMinor, tax, digits));
  const taxMinor = taxes.reduce((sum, tax) => sum + tax.amountMinor, 0n);
  return { quantity, grossMinor, discountMinor, taxableMinor, taxes, taxMinor, totalMinor: taxableMinor + taxMinor };
}

/** Calculates totals using integer minor units; returns BigInt totals for safe downstream arithmetic. */
export function calculateDocumentTotals(document, company = {}) {
  const currencyCode = document.currencyCode || company.currencyCode || 'INR';
  const locale = document.locale || company.locale || 'en-IN';
  const digits = currencyDigits(currencyCode, locale, document.currencyMinorDigits ?? company.currencyMinorDigits);
  const lines = (Array.isArray(document.lines) ? document.lines : []).map((item, index) => ({
    source: item,
    calculated: calculateItem(item, digits, `line ${index + 1}`),
  }));
  const charges = (Array.isArray(document.charges) ? document.charges : []).map((charge, index) => {
    const amountMinor = asBigIntInteger(charge.amountMinor, `charge ${index + 1} amountMinor`, { min: 0 });
    const taxes = (Array.isArray(charge.taxes) ? charge.taxes : []).map((tax) => calculateTax(amountMinor, tax, digits));
    return { source: charge, amountMinor, taxes, taxMinor: taxes.reduce((sum, tax) => sum + tax.amountMinor, 0n) };
  });
  const subtotalMinor = lines.reduce((sum, line) => sum + line.calculated.grossMinor, 0n);
  const discountMinor = lines.reduce((sum, line) => sum + line.calculated.discountMinor, 0n);
  const lineTaxableMinor = lines.reduce((sum, line) => sum + line.calculated.taxableMinor, 0n);
  const chargeMinor = charges.reduce((sum, charge) => sum + charge.amountMinor, 0n);
  const taxableMinor = lineTaxableMinor + chargeMinor;
  const lineTaxMinor = lines.reduce((sum, line) => sum + line.calculated.taxMinor, 0n);
  const chargeTaxMinor = charges.reduce((sum, charge) => sum + charge.taxMinor, 0n);
  const taxMinor = lineTaxMinor + chargeTaxMinor;
  const totalMinor = taxableMinor + taxMinor;
  const receiptsMinor = asBigIntInteger(document.receiptsAppliedMinor ?? 0, 'receiptsAppliedMinor', { min: 0 });
  const creditsMinor = asBigIntInteger(document.creditsAppliedMinor ?? 0, 'creditsAppliedMinor', { min: 0 });
  const withholdingMinor = asBigIntInteger(document.withholdingRecognisedMinor ?? 0, 'withholdingRecognisedMinor', { min: 0 });
  const dueMinor = totalMinor - receiptsMinor - creditsMinor - withholdingMinor;

  const taxSummaryMap = new Map();
  const allTaxes = [...lines.flatMap((line) => line.calculated.taxes), ...charges.flatMap((charge) => charge.taxes)];
  for (const tax of allTaxes) {
    const key = `${tax.label}|${tax.rateBps}`;
    const current = taxSummaryMap.get(key) ?? { label: tax.label, rateBps: tax.rateBps, amountMinor: 0n };
    current.amountMinor += tax.amountMinor;
    taxSummaryMap.set(key, current);
  }

  return {
    currencyCode, locale, digits, lines, charges,
    subtotalMinor, discountMinor, taxableMinor, chargeMinor, taxMinor, totalMinor,
    receiptsMinor, creditsMinor, withholdingMinor, dueMinor,
    taxSummary: [...taxSummaryMap.values()],
  };
}

function rowsForTaxSummary(totals) {
  if (totals.taxSummary.length === 0) return '';
  return `<section class="tax-summary"><h3>Tax summary</h3><table><thead><tr><th>Tax</th><th>Rate</th><th class="num">Amount</th></tr></thead><tbody>${totals.taxSummary.map((tax) => `<tr><td>${htmlEscape(tax.label)}</td><td>${(Number(tax.rateBps) / 100).toFixed(2).replace(/\.00$/, '')}%</td><td class="num">${formatMoney(tax.amountMinor, totals.currencyCode, totals.locale, totals.digits)}</td></tr>`).join('')}</tbody></table></section>`;
}

function renderParty(party, heading) {
  if (!party) return '';
  const addressLines = Array.isArray(party.addressLines) ? party.addressLines : [];
  const contactLines = [party.contactName, party.phone, party.email].filter(Boolean);
  const identifiers = Array.isArray(party.identifiers) ? party.identifiers : [];
  return `<section class="party"><h3>${htmlEscape(heading)}</h3><strong>${htmlEscape(party.legalName || party.name || '')}</strong>${party.tradeName ? `<div>${htmlEscape(party.tradeName)}</div>` : ''}${addressLines.map((line) => `<div>${htmlEscape(line)}</div>`).join('')}${[party.city, party.stateOrProvince, party.postalCode, party.country].filter(Boolean).length ? `<div>${htmlEscape([party.city, party.stateOrProvince, party.postalCode, party.country].filter(Boolean).join(', '))}</div>` : ''}${contactLines.map((line) => `<div>${htmlEscape(line)}</div>`).join('')}${identifiers.map((identifier) => `<div><span class="muted">${htmlEscape(identifier.label)}:</span> ${htmlEscape(identifier.value)}</div>`).join('')}</section>`;
}

function visibleRegistrations(company, issueDate) {
  const list = Array.isArray(company.registrations) ? company.registrations : [];
  return list.filter((item) => {
    if (item.displayOnDocument !== true || !item.label || !item.value) return false;
    if (item.validUntil && issueDate && String(item.validUntil) < String(issueDate).slice(0, 10)) return false;
    return true;
  });
}

function imageTag(src, alt, className = '') {
  const safe = safeAssetSrc(src);
  return safe ? `<img class="${htmlEscape(className)}" src="${htmlEscape(safe)}" alt="${htmlEscape(alt)}">` : '';
}

function renderLineRow(item, calculated, index, totals) {
  const taxesText = calculated.taxes.map((tax) => `${tax.label} ${(Number(tax.rateBps) / 100).toFixed(2).replace(/\.00$/, '')}%`).join(', ');
  const pack = [item.packSize, item.packagingDescription, item.batchNumber ? `Batch ${item.batchNumber}` : ''].filter(Boolean).join(' · ');
  return `<tr><td class="center">${index + 1}</td><td><strong>${htmlEscape(item.description || item.name || 'Item')}</strong>${item.sku ? `<div class="muted">SKU: ${htmlEscape(item.sku)}</div>` : ''}${item.hsnSac ? `<div class="muted">HSN/SAC: ${htmlEscape(item.hsnSac)}</div>` : ''}${pack ? `<div class="muted">${htmlEscape(pack)}</div>` : ''}${item.fulfilmentNote ? `<div class="muted">${htmlEscape(item.fulfilmentNote)}</div>` : ''}</td><td class="num">${htmlEscape(formatQuantity(item.quantity, totals.locale))}</td><td>${htmlEscape(item.unit || 'unit')}</td><td class="num">${formatMoney(asBigIntInteger(item.unitPriceMinor, 'unitPriceMinor', { min: 0 }), totals.currencyCode, totals.locale, totals.digits)}</td><td class="num">${calculated.discountMinor ? formatMoney(calculated.discountMinor, totals.currencyCode, totals.locale, totals.digits) : '—'}</td><td>${htmlEscape(taxesText || item.taxTreatmentLabel || '—')}</td><td class="num">${formatMoney(calculated.totalMinor, totals.currencyCode, totals.locale, totals.digits)}</td></tr>`;
}

function renderChargeRow(charge, totals) {
  return `<tr><td>${htmlEscape(charge.source.label || 'Additional charge')}</td><td class="num">${formatMoney(charge.amountMinor, totals.currencyCode, totals.locale, totals.digits)}</td></tr>`;
}

/** Render quotation or invoice data as self-contained responsive/print-ready HTML. */
export function renderDocumentHtml({ company, customer, document }) {
  if (!company || !document) throw new TypeError('company and document are required');
  const type = String(document.type || 'quotation');
  const title = DOCUMENT_TITLES[type];
  if (!title) throw new TypeError(`Unsupported document type: ${type}`);
  if (!document.documentNumber) throw new TypeError('document.documentNumber is required; the backend must allocate it');
  if (!Array.isArray(document.lines) || document.lines.length === 0) throw new TypeError('At least one document line is required');

  const totals = calculateDocumentTotals(document, company);
  const issueDate = document.issueDate || '';
  const logo = safeAssetSrc(company.logoUrl);
  const qrCode = safeQrSrc(document.qrCodeDataUri || document.paymentQrUrl || '');
  const signature = safeAssetSrc(company.signatureUrl);
  const stamp = safeAssetSrc(company.stampUrl);
  const registrations = visibleRegistrations(company, issueDate);
  const terms = Array.isArray(document.terms) ? document.terms : [];
  const notes = Array.isArray(document.notes) ? document.notes : [];
  const references = [
    ['Customer PO', document.customerPurchaseOrderNumber],
    ['Order reference', document.salesOrderNumber],
    ['Place of supply', document.placeOfSupply],
    ['Dispatch / shipment', document.shipmentReference],
    ['Incoterms', document.incoterms],
  ].filter(([, value]) => value);
  const companyName = company.legalName || company.displayName || 'Company';
  const docLabel = document.status === 'draft' ? `${title} · DRAFT / NOT ISSUED` : title;
  const totalsTitle = type === 'quotation' ? 'Quotation total' : (type === 'delivery_challan' || type === 'packing_list' ? 'Reference value (if supplied)' : 'Grand total');
  const shouldShowDue = !['quotation', 'delivery_challan', 'packing_list', 'statement'].includes(type);
  const meta = [
    ['Document no.', document.documentNumber], ['Issue date', issueDate ? formatDate(issueDate, totals.locale) : '—'],
    ['Due date', document.dueDate ? formatDate(document.dueDate, totals.locale) : '—'],
    ['Valid until', document.validUntil ? formatDate(document.validUntil, totals.locale) : '—'],
    ['Payment terms', document.paymentTermsLabel],
    ['Fulfilment / delivery date', document.promisedFulfilmentDate ? formatDate(document.promisedFulfilmentDate, totals.locale) : ''],
    ['Currency', totals.currencyCode],
  ].filter(([, value]) => value);

  const headerLogo = logo ? `<img class="brand-logo" src="${htmlEscape(logo)}" alt="${htmlEscape(companyName)} logo">` : '';
  const taxIdentifiers = registrations.map((item) => `<div><span class="muted">${htmlEscape(item.label)}:</span> ${htmlEscape(item.value)}</div>`).join('');
  const totalsRows = [
    ['Subtotal', totals.subtotalMinor],
    ...(totals.discountMinor ? [['Discounts', -totals.discountMinor]] : []),
    ...(totals.chargeMinor ? [['Additional charges', totals.chargeMinor]] : []),
    ['Taxable value', totals.taxableMinor],
    ...(totals.taxMinor ? [['Total tax', totals.taxMinor]] : []),
    [totalsTitle, totals.totalMinor, 'grand'],
  ].map(([label, amount, css]) => `<tr class="${css || ''}"><th>${htmlEscape(label)}</th><td class="num">${formatMoney(amount, totals.currencyCode, totals.locale, totals.digits)}</td></tr>`).join('');

  const receiptRows = (totals.receiptsMinor || totals.creditsMinor || totals.withholdingMinor) ? `<div class="payment-summary"><h3>Settlement summary</h3><table><tbody>${totals.receiptsMinor ? `<tr><th>Receipts applied</th><td class="num">${formatMoney(totals.receiptsMinor, totals.currencyCode, totals.locale, totals.digits)}</td></tr>` : ''}${totals.creditsMinor ? `<tr><th>Credits applied</th><td class="num">${formatMoney(totals.creditsMinor, totals.currencyCode, totals.locale, totals.digits)}</td></tr>` : ''}${totals.withholdingMinor ? `<tr><th>Withholding recognised (configured)</th><td class="num">${formatMoney(totals.withholdingMinor, totals.currencyCode, totals.locale, totals.digits)}</td></tr>` : ''}<tr class="grand"><th>Calculated balance</th><td class="num">${formatMoney(totals.dueMinor, totals.currencyCode, totals.locale, totals.digits)}</td></tr></tbody></table><p class="muted small">Use the backend's approved allocation and accounting rules before treating withholding as settled.</p></div>` : '';

  const sellerBank = Array.isArray(company.paymentDetails) ? company.paymentDetails : [];
  const bankBlock = sellerBank.length ? `<section class="payment-details"><h3>Payment details</h3>${sellerBank.map((item) => `<div><span class="muted">${htmlEscape(item.label)}:</span> ${htmlEscape(item.value)}</div>`).join('')}</section>` : '';
  const taxIds = [company.gstin ? ['GSTIN', company.gstin] : null, company.pan ? ['PAN', company.pan] : null, company.cin ? ['CIN', company.cin] : null, company.iec ? ['IEC', company.iec] : null].filter(Boolean);
  const docSnapshotHash = document.snapshotHash ? `<div class="snapshot-hash">Document snapshot: ${htmlEscape(document.snapshotHash)}</div>` : '';

  return `<!doctype html>
<html lang="${htmlEscape(document.language || company.language || 'en')}" dir="${document.direction === 'rtl' ? 'rtl' : 'ltr'}">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${htmlEscape(docLabel)} ${htmlEscape(document.documentNumber)}</title>
<meta name="color-scheme" content="light">
<style>
:root{font-family:Arial,Helvetica,sans-serif;color:#17202b;background:#f0f2f5;font-synthesis:none;text-rendering:optimizeLegibility}*{box-sizing:border-box}body{margin:0;padding:clamp(8px,2vw,24px);line-height:1.42}.toolbar{max-width:210mm;margin:0 auto 12px;display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap}.toolbar button{border:0;border-radius:7px;background:#8b1d24;color:#fff;font-weight:700;padding:10px 15px;cursor:pointer}.sheet{max-width:210mm;min-height:297mm;margin:0 auto;background:#fff;padding:clamp(16px,3vw,32px);box-shadow:0 5px 24px #00000012}.topbar{display:flex;align-items:flex-start;justify-content:space-between;gap:18px;border-bottom:3px solid #8b1d24;padding-bottom:16px}.brand{display:flex;gap:14px;align-items:flex-start;min-width:0}.brand-logo{max-width:110px;max-height:82px;object-fit:contain}.company-name{font-size:19px;font-weight:800;overflow-wrap:anywhere}.muted{color:#596474;font-size:.91em}.doc-title{text-align:right;min-width:150px}.doc-title h1{font-size:clamp(20px,3vw,29px);margin:0;color:#8b1d24}.doc-no{font-weight:700;overflow-wrap:anywhere}.parties{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:18px;margin:20px 0}.party{min-width:0;overflow-wrap:anywhere}.party h3,.tax-summary h3,.payment-details h3,.payment-summary h3{font-size:12px;text-transform:uppercase;letter-spacing:.07em;color:#8b1d24;margin:0 0 8px}.party strong{display:block;margin-bottom:5px}.meta-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px 14px;margin:12px 0 18px}.meta-cell{border-bottom:1px solid #e4e7eb;padding:7px 0;min-width:0;overflow-wrap:anywhere}.meta-label{display:block;color:#667080;font-size:11px}.meta-value{display:block;font-weight:600}.table-wrap{width:100%;overflow-x:auto}table{width:100%;border-collapse:collapse;font-size:12px}th,td{padding:9px 7px;border-bottom:1px solid #e5e7eb;vertical-align:top;text-align:left}thead th{background:#f7f0f0;color:#692027;border-bottom:1px solid #dec4c6;font-size:10px;text-transform:uppercase;letter-spacing:.04em}td.num,th.num{text-align:right;white-space:nowrap}.center{text-align:center}.muted.small{font-size:10px}.line-table td:nth-child(2){min-width:155px}.bottom-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(240px,.75fr);gap:22px;margin-top:20px}.totals{width:100%;max-width:380px;margin-left:auto}.totals th{font-weight:500}.totals .grand th,.totals .grand td,.grand th,.grand td{font-weight:800;font-size:14px;background:#fbf2f2;border-top:2px solid #8b1d24}.tax-summary,.payment-summary,.payment-details{margin-top:18px}.terms{white-space:normal;overflow-wrap:anywhere}.terms h3{font-size:12px;color:#8b1d24;text-transform:uppercase;letter-spacing:.07em}.terms ol,.terms ul{padding-left:20px;margin-top:6px}.notes{margin-top:14px;overflow-wrap:anywhere}.qr-area{display:flex;gap:12px;align-items:center;justify-content:flex-end;margin-top:12px}.qr-area img{width:100px;height:100px;object-fit:contain}.signature-area{display:flex;gap:14px;justify-content:flex-end;align-items:flex-end;margin-top:22px;flex-wrap:wrap}.signature-area img{max-width:130px;max-height:70px;object-fit:contain}.signature-label{font-size:11px;text-align:center;min-width:120px;border-top:1px solid #aeb5bf;padding-top:6px}.footer{border-top:1px solid #e5e7eb;margin-top:26px;padding-top:12px;color:#596474;font-size:10px;overflow-wrap:anywhere}.snapshot-hash{font-size:9px;color:#798291;margin-top:8px;overflow-wrap:anywhere}.status-draft{margin:10px 0;padding:8px 10px;border:1px solid #be8a2c;background:#fff8e5;color:#684400;font-weight:700;font-size:12px}.certificate-line{overflow-wrap:anywhere}@media(max-width:620px){body{padding:0;background:#fff}.sheet{padding:16px;box-shadow:none;min-height:auto}.topbar{flex-direction:column}.doc-title{text-align:left}.parties{grid-template-columns:1fr}.meta-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.bottom-grid{grid-template-columns:1fr}.totals{max-width:none}.toolbar{padding:8px}.line-table{min-width:720px}.qr-area{justify-content:flex-start}}@media print{@page{size:A4;margin:10mm}body{background:#fff;padding:0;color:#111}.toolbar{display:none!important}.sheet{max-width:none;min-height:0;margin:0;padding:0;box-shadow:none}.topbar,.parties,.meta-grid,.bottom-grid,.signature-area{break-inside:avoid}tr{break-inside:avoid}thead{display:table-header-group}.footer{break-inside:avoid}a{color:inherit;text-decoration:none}}
</style>
</head>
<body>
<div class="toolbar"><button type="button" onclick="window.print()">Print / Save as PDF</button></div>
<main class="sheet">
<header class="topbar"><div class="brand">${headerLogo}<div><div class="company-name">${htmlEscape(companyName)}</div>${company.tradeName ? `<div>${htmlEscape(company.tradeName)}</div>` : ''}${(company.addressLines || []).map((line) => `<div>${htmlEscape(line)}</div>`).join('')}${[company.city, company.stateOrProvince, company.postalCode, company.country].filter(Boolean).length ? `<div>${htmlEscape([company.city, company.stateOrProvince, company.postalCode, company.country].filter(Boolean).join(', '))}</div>` : ''}${company.phone ? `<div>Phone: ${htmlEscape(company.phone)}</div>` : ''}${company.email ? `<div>Email: ${htmlEscape(company.email)}</div>` : ''}${company.website ? `<div>${htmlEscape(company.website)}</div>` : ''}${taxIds.map(([label, value]) => `<div><span class="muted">${label}:</span> ${htmlEscape(value)}</div>`).join('')}${taxIdentifiers}</div></div><div class="doc-title"><h1>${htmlEscape(docLabel)}</h1><div class="doc-no">${htmlEscape(document.documentNumber)}</div>${document.status === 'draft' ? '<div class="status-draft">DRAFT — NOT A VALID ISSUED TAX DOCUMENT</div>' : ''}${document.originalDocumentNumber ? `<div class="muted">Original document: ${htmlEscape(document.originalDocumentNumber)}</div>` : ''}</div></header>
<div class="parties">${renderParty(customer, type === 'quotation' ? 'Quotation for' : 'Bill to')}${document.shipTo ? renderParty(document.shipTo, 'Ship to / Deliver to') : ''}</div>
<section class="meta-grid">${meta.map(([label, value]) => `<div class="meta-cell"><span class="meta-label">${htmlEscape(label)}</span><span class="meta-value">${htmlEscape(value)}</span></div>`).join('')}${references.map(([label, value]) => `<div class="meta-cell"><span class="meta-label">${htmlEscape(label)}</span><span class="meta-value">${htmlEscape(value)}</span></div>`).join('')}</section>
<div class="table-wrap"><table class="line-table"><thead><tr><th>#</th><th>Description / SKU</th><th class="num">Qty</th><th>Unit</th><th class="num">Unit price</th><th class="num">Discount</th><th>Tax / treatment</th><th class="num">Line total</th></tr></thead><tbody>${totals.lines.map(({ source, calculated }, index) => renderLineRow(source, calculated, index, totals)).join('')}</tbody></table></div>
${totals.charges.length ? `<section class="tax-summary"><h3>Additional charges</h3><table><tbody>${totals.charges.map((charge) => renderChargeRow(charge, totals)).join('')}</tbody></table></section>` : ''}
<div class="bottom-grid"><div><div class="terms"><h3>Terms and conditions</h3>${terms.length ? `<ol>${terms.map((term) => `<li>${htmlEscape(term)}</li>`).join('')}</ol>` : '<p class="muted">No terms have been configured for this document.</p>'}</div>${notes.length ? `<div class="notes"><strong>Notes</strong><ul>${notes.map((note) => `<li>${htmlEscape(note)}</li>`).join('')}</ul></div>` : ''}${document.amountInWords ? `<p><strong>Amount in words:</strong> ${htmlEscape(document.amountInWords)}</p>` : ''}${bankBlock}${receiptRows}</div><div><table class="totals"><tbody>${totalsRows}</tbody></table>${shouldShowDue && !receiptRows ? `<p class="muted small">Balance due is maintained by the accounting/payment-allocation workflow; this document total does not by itself prove payment receipt.</p>` : ''}${qrCode ? `<div class="qr-area"><div class="muted">${htmlEscape(document.qrCaption || 'Scan QR')}</div><img src="${htmlEscape(qrCode)}" alt="${htmlEscape(document.qrCaption || 'QR code')}"></div>` : ''}</div></div>
<div class="signature-area">${signature ? `<div>${imageTag(signature, 'Authorised signature')}<div class="signature-label">Authorised signatory</div></div>` : ''}${stamp ? `<div>${imageTag(stamp, 'Company stamp')}<div class="signature-label">Company stamp</div></div>` : ''}${company.authorisedSignatoryName ? `<div class="signature-label">${htmlEscape(company.authorisedSignatoryName)}<br>Authorised signatory</div>` : ''}</div>
<footer class="footer">${company.footerText ? `<div>${htmlEscape(company.footerText)}</div>` : ''}${document.disclaimer ? `<div>${htmlEscape(document.disclaimer)}</div>` : ''}${docSnapshotHash}<div>This document was rendered from application data. The backend must determine whether it is a valid issued document, and apply the legally approved tax/document rules before issuance.</div></footer>
</main></body></html>`;
}

function safeFileStem(value) {
  return String(value || 'document').replace(/[^a-zA-Z0-9._-]+/g, '_').replace(/^\.+/, '').slice(0, 100) || 'document';
}

async function runCli() {
  const inputPath = process.argv[2];
  if (!inputPath) {
    process.stderr.write('Usage: node Adalaj_Quotation_Invoice_Engine.mjs <input.json> [output.html]\n');
    process.exitCode = 2;
    return;
  }
  const absoluteInput = resolve(inputPath);
  const raw = await readFile(absoluteInput, 'utf8');
  const data = JSON.parse(raw);
  const html = renderDocumentHtml(data);
  const requestedOutput = process.argv[3];
  const defaultName = `${safeFileStem(data.document?.documentNumber || data.document?.type || basename(inputPath, '.json'))}.html`;
  const outputPath = resolve(requestedOutput || resolve('dist', defaultName));
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, html, 'utf8');
  process.stdout.write(`Rendered HTML document: ${outputPath}\n`);
  process.stdout.write('Before issuing: verify backend numbering, permissions, tax treatment, approved terms and immutable document snapshot.\n');
}

const invokedPath = process.argv[1] ? resolve(process.argv[1]) : '';
if (invokedPath && invokedPath === resolve(fileURLToPath(import.meta.url))) {
  runCli().catch((error) => {
    process.stderr.write(`Document render failed: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
    process.exitCode = 1;
  });
}

export {
  QUANTITY_SCALE,
  BPS_DENOMINATOR,
  DOCUMENT_TITLES,
  htmlEscape,
  asBigIntInteger,
  roundedDivide,
  quantityToScaledInt,
  currencyDigits,
  formatMoney,
  formatQuantity,
  formatDate,
  normalizeBps,
  calculateTax,
  calculateItem,
  safeFileStem,
  runCli,
};

