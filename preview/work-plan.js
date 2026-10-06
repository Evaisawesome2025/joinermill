import { FIELDS, normalizeBrief, exportBrief } from './brief-model.js';
import { emptyResult, validateResult, validTimestamp, exportResult } from './result-review.js';
import { validateDirections, exportDirections } from './instructions.js';
export const STORAGE_KEY = 'joinermill.workdesk.v1';
export const MAX_SNAPSHOT_BYTES = 131072;
export const PLAN_LIMITS = Object.freeze({ nextAction: 600, unresolvedInputs: 1600 });
const textOK = (text, max) => typeof text === 'string' && text.length <= max && !/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(text);
const exactKeys = (value, keys) => value && typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === keys.length && Object.keys(value).every(k => keys.includes(k));
export function validateDraft(draft) {
  return exactKeys(draft, Object.keys(FIELDS)) && Object.entries(FIELDS).every(([key, f]) => textOK(draft[key], f.max));
}
export function validatePlan(plan) {
  if (!exactKeys(plan, Object.keys(PLAN_LIMITS))) return { ok: false, error: 'Provide only the next action and missing-input notes.' };
  if (!textOK(plan.nextAction, 600)) return { ok: false, field: 'nextAction', error: 'Use at most 600 characters, without control characters.' };
  if (!textOK(plan.unresolvedInputs, 1600)) return { ok: false, field: 'unresolvedInputs', error: 'Use at most 1,600 characters, without control characters.' };
  const items = plan.unresolvedInputs.split(/\r\n?|\n/).map(s => s.trim()).filter(Boolean);
  return { ok: true, items };
}
export function encodeSnapshot(draft, plan, savedAt = new Date().toISOString(), result = emptyResult(), directions = null) {
  if (!validateDraft(draft) || !validatePlan(plan).ok || !validTimestamp(savedAt) || !validateResult(result) || (directions !== null && !validateDirections(directions))) throw new Error('invalid_snapshot');
  const value = JSON.stringify({ version: 3, savedAt, draft, plan, result, directions });
  if (new TextEncoder().encode(value).length > MAX_SNAPSHOT_BYTES) throw new Error('snapshot_too_large');
  return value;
}
export function decodeSnapshot(raw) {
  if (typeof raw !== 'string' || raw.length > MAX_SNAPSHOT_BYTES || new TextEncoder().encode(raw).length > MAX_SNAPSHOT_BYTES) throw new Error('snapshot_too_large');
  let data; try { data = JSON.parse(raw); } catch { throw new Error('invalid_snapshot'); }
  if (data?.version === 1 && exactKeys(data, ['version', 'savedAt', 'draft', 'plan'])) {
    // Reading old copies does not write or overwrite them; upgrade only on explicit Save.
    data = { ...data, result: emptyResult(), directions: null };
  } else if (data?.version === 2 && exactKeys(data, ['version', 'savedAt', 'draft', 'plan', 'result'])) {
    data = { ...data, directions: null };
  } else if (data?.version !== 3 || !exactKeys(data, ['version', 'savedAt', 'draft', 'plan', 'result', 'directions'])) throw new Error('unsupported_snapshot');
  encodeSnapshot(data.draft, data.plan, data.savedAt, data.result, data.directions);
  return data;
}
export function exportPlan(draft, plan, result = emptyResult(), directions = null) {
  if (!validateDraft(draft) || !validatePlan(plan).ok) throw new Error('invalid_plan');
  const normalized = normalizeBrief(draft);
  const brief = normalized.ok ? exportBrief(normalized.brief) : ['JOINERMILL / EVAOS — INCOMPLETE BRIEF', 'Status: draft; required brief fields still need review.', '', ...Object.entries(FIELDS).flatMap(([key, f]) => [f.label.toUpperCase(), draft[key] || '[Not supplied]', ''])].join('\n');
  return ['JOINERMILL / EVAOS — LOCAL WORK PLAN', 'User-entered intent and planning notes. No AI judgment, work execution or verified result.', '',
    'YOUR NEXT ACTION (not executed)', plan.nextAction || '[Not set by you]', '',
    'INPUTS STILL NEEDED (your notes, not an assessment)', plan.unresolvedInputs || '[None listed; readiness has not been established]', '',
    exportDirections(directions), '', brief, '', exportResult(result, draft), '', 'Local planning notes, work directions, results and owner reviews are not sent with the optional six-field brief format check.', ''].join('\n');
}
// Access is injected so blocked storage, quota and corrupt records remain testable.
export function readSaved(storage) {
  const raw = storage.getItem(STORAGE_KEY);
  return raw === null ? null : decodeSnapshot(raw);
}
export function saveDraft(storage, draft, plan, result = emptyResult(), directions = null) {
  const raw = encodeSnapshot(draft, plan, new Date().toISOString(), result, directions);
  storage.setItem(STORAGE_KEY, raw);
  if (storage.getItem(STORAGE_KEY) !== raw) throw new Error('save_not_confirmed');
  return decodeSnapshot(raw);
}
export function removeSaved(storage) {
  storage.removeItem(STORAGE_KEY);
  if (storage.getItem(STORAGE_KEY) !== null) throw new Error('removal_not_confirmed');
}
