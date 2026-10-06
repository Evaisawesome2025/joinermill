import { normalizeBrief } from './brief-model.js';
import { emptyResult } from './result-review.js';

export const INSTRUCTIONS_KEY = 'joinermill.instructions.v1';
export const MAX_INSTRUCTIONS_BYTES = 65536;
export const DIRECTION_FIELDS = Object.freeze({
  title: { label: 'Instructions title', max: 120 },
  owner: { label: 'Accountable owner', max: 160 },
  blocker: { label: 'What blocks the work?', max: 1000 },
  handoff: { label: 'Handoff recipient and next step', max: 1000 }
});
const exact = (value, keys) => !!value && typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === keys.length && Object.keys(value).every(k => keys.includes(k));
export function validateDirections(value) {
  return exact(value, Object.keys(DIRECTION_FIELDS)) && Object.entries(DIRECTION_FIELDS).every(([key, field]) => typeof value[key] === 'string' && value[key].trim().length >= 3 && value[key].length <= field.max && !/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(value[key]));
}
export function createInstructions(brief, directions) {
  const normalized = normalizeBrief(brief);
  if (!normalized.ok) throw new Error(Object.values(normalized.errors)[0]);
  if (!validateDirections(directions)) throw new Error('Complete all four direction fields with 3 characters or more, within the stated limits and without control characters.');
  return { kind: 'joinermill.work-instructions', version: 1, brief: normalized.brief,
    directions: Object.fromEntries(Object.keys(DIRECTION_FIELDS).map(key => [key, directions[key].replace(/\r\n?/g, '\n').trim()])) };
}
export function encodeInstructions(value) {
  if (!exact(value, ['kind', 'version', 'brief', 'directions']) || value.kind !== 'joinermill.work-instructions' || value.version !== 1) throw new Error('Unsupported instructions format. Use an instructions file, not a work backup.');
  const raw = JSON.stringify(createInstructions(value.brief, value.directions));
  if (new TextEncoder().encode(raw).length > MAX_INSTRUCTIONS_BYTES) throw new Error('Instructions file exceeds 64 KiB.');
  return raw;
}
export function decodeInstructions(raw) {
  if (typeof raw !== 'string' || raw.length > MAX_INSTRUCTIONS_BYTES || new TextEncoder().encode(raw).length > MAX_INSTRUCTIONS_BYTES) throw new Error('Instructions file exceeds 64 KiB.');
  return JSON.parse(encodeInstructions(JSON.parse(raw)));
}
// Construct fresh work from an allowlist; no state from an earlier instance is copied.
export function startFromInstructions(value) {
  const clean = decodeInstructions(encodeInstructions(value));
  return { draft: clean.brief, directions: clean.directions, plan: { nextAction: '', unresolvedInputs: '' }, result: emptyResult() };
}
export function exportDirections(value) {
  if (value === null) return 'WORK DIRECTIONS\n[No reusable instructions applied]\n';
  if (!validateDirections(value)) throw new Error('invalid_directions');
  return ['WORK DIRECTIONS — COPIED AT START', 'Owner-written labels only. No assignment, scheduling, notification or authenticated identity.',
    ...Object.entries(DIRECTION_FIELDS).flatMap(([key, f]) => [f.label.toUpperCase(), value[key], '']),
    'These directions are independent of the reusable template. A listed blocker is not an enforced gate; the owner checks it.',
    'Owner acceptance covers the captured six-field brief, not these contextual labels.', ''].join('\n');
}
export function readInstructions(storage) {
  const raw = storage.getItem(INSTRUCTIONS_KEY);
  return raw === null ? null : decodeInstructions(raw);
}
export function saveInstructions(storage, value) {
  const raw = encodeInstructions(value);
  storage.setItem(INSTRUCTIONS_KEY, raw);
  if (storage.getItem(INSTRUCTIONS_KEY) !== raw) throw new Error('save_not_confirmed');
}
export function removeInstructions(storage) {
  storage.removeItem(INSTRUCTIONS_KEY);
  if (storage.getItem(INSTRUCTIONS_KEY) !== null) throw new Error('removal_not_confirmed');
}
