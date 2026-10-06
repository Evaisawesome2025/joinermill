import { FIELDS, normalizeBrief } from './brief-model.js';
export const RESULT_LIMITS = Object.freeze({ text: 8000, provenance: 1000, feedback: 2000 });
export const DECISIONS = Object.freeze({ unreviewed: 'Not reviewed by owner', needs_revision: 'Needs revision', accepted: 'Accepted by owner' });
export const emptyResult = () => ({ text: '', provenance: '', feedback: '', baseline: null, recordedAt: null, decision: 'unreviewed', reviewedAt: null });
const keys = Object.keys(emptyResult());
const textOK = (s, max) => typeof s === 'string' && s.length <= max && !/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(s);
export const validTimestamp = value => typeof value === 'string' && /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString() === value;
export function sameBrief(a, b) { return !!a && !!b && Object.keys(FIELDS).every(key => a[key] === b[key]); }
export function validateResult(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value) || Object.keys(value).length !== keys.length || !Object.keys(value).every(k => keys.includes(k))) return false;
  if (!Object.entries(RESULT_LIMITS).every(([key, limit]) => textOK(value[key], limit)) || typeof value.decision !== 'string' || !Object.hasOwn(DECISIONS, value.decision)) return false;
  if (value.baseline !== null) {
    const normalized = normalizeBrief(value.baseline);
    if (!normalized.ok || !sameBrief(value.baseline, normalized.brief)) return false;
  }
  if (value.recordedAt !== null && (!validTimestamp(value.recordedAt) || !value.baseline || value.text.trim().length < 3 || value.provenance.trim().length < 3)) return false;
  if (value.decision === 'unreviewed') return value.reviewedAt === null;
  return value.recordedAt !== null && validTimestamp(value.reviewedAt) && value.feedback.trim().length >= 3;
}
export function editResult(value, field, text) {
  if (!Object.hasOwn(RESULT_LIMITS, field)) throw new Error('unknown_result_field');
  if (value[field] === text) return value;
  return { ...value, [field]: text, recordedAt: field === 'feedback' ? value.recordedAt : null, decision: 'unreviewed', reviewedAt: null };
}
export function recordResult(value, draft, now = new Date().toISOString()) {
  if (!validateResult(value) || value.text.trim().length < 3 || value.provenance.trim().length < 3 || !validTimestamp(now)) throw new Error('Add a result and its source, with at least 3 characters each and within the stated limits.');
  if (value.recordedAt) return value;
  const normalized = normalizeBrief(draft);
  if (!value.baseline && !normalized.ok) throw new Error('Prepare the six-field brief before recording a result.');
  return { ...value, baseline: value.baseline || normalized.brief, recordedAt: now, decision: 'unreviewed', reviewedAt: null };
}
export function reviewResult(value, decision, now = new Date().toISOString()) {
  if (!validateResult(value) || !value.recordedAt || !['accepted', 'needs_revision'].includes(decision) || !validTimestamp(now)) throw new Error('Record the result and its source before making an owner decision.');
  if (value.feedback.trim().length < 3) throw new Error('Add feedback explaining your decision (at least 3 characters).');
  if (value.decision === decision) return value;
  return { ...value, decision, reviewedAt: now };
}
export function exportResult(value, currentDraft) {
  if (!validateResult(value)) throw new Error('invalid_result');
  const current = normalizeBrief(currentDraft);
  return ['OWNER RESULT & REVIEW',
    'User-provided record only. No AI delivery, authenticated identity or independent verification.',
    'Decision: ' + (value.recordedAt ? DECISIONS[value.decision] + ' — for the captured brief only' : 'Result draft; not recorded or reviewed'),
    'Recorded at (browser clock): ' + (value.recordedAt || '[Not recorded]'),
    'Reviewed at (browser clock): ' + (value.reviewedAt || '[No decision recorded]'), '',
    'ACTUAL RESULT / DELIVERABLE (entered by owner)', value.text || '[Not supplied]', '',
    'SOURCE / PROVENANCE (owner assertion; links are not fetched)', value.provenance || '[Not supplied]', '',
    'OWNER FEEDBACK', value.feedback || '[Not supplied]', '',
    ...(value.baseline ? ['CAPTURED BRIEF — ORIGINAL REVIEW TARGET',
      current.ok && sameBrief(current.brief, value.baseline) ? 'Current brief matches the captured review target.' : 'Current brief differs. The decision does not apply to the current brief.', '',
      ...Object.entries(FIELDS).flatMap(([key, field]) => [field.label.toUpperCase(), value.baseline[key], ''])] : ['No original review target captured yet.', '']),
    'Editing a result/source requires recording it again. Editing result, source or feedback clears the owner decision.',
    'One current record only; no revision history. Imported/restored claims and timestamps are not authenticated.', ''].join('\n');
}
