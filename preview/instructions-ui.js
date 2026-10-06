import { FIELDS, normalizeBrief } from './brief-model.js';
import { DIRECTION_FIELDS, INSTRUCTIONS_KEY, MAX_INSTRUCTIONS_BYTES, createInstructions, encodeInstructions, decodeInstructions, startFromInstructions, readInstructions, saveInstructions, removeInstructions } from './instructions.js';

export function setupInstructions({ readDraft, showConfirmation, returnFocus, applyCopy, download }) {
  const $ = id => document.getElementById(id);
  const make = (tag, text, cls = '') => { const n = document.createElement(tag); n.textContent = text; n.className = cls; return n; };
  const allFields = { ...DIRECTION_FIELDS, ...FIELDS };
  let revision = 0, generation = 0, reading = false, action = null, trigger = null;
  const status = text => { $('instructions-status').textContent = text; };
  for (const [key, f] of Object.entries(allFields)) {
    const field = make('div', '', 'brief-field');
    const label = make('label', Object.hasOwn(FIELDS, key) ? 'Instructions: ' + f.label : f.label); label.htmlFor = 'instruction-' + key;
    const hint = make('p', (key === 'success' ? '1–12 checks, one per line, 3–240 characters each. ' : '') + (key === 'owner' ? 'A name or role you write; no one is assigned or notified. ' : key === 'blocker' ? 'What must be available or approved? Write “None identified” if applicable; this is not an enforced gate. ' : key === 'handoff' ? 'Who should receive the output, and what should they do next? Nothing is sent. ' : '') + `${f.min || 3}–${f.max} characters.`); hint.id = 'instruction-hint-' + key;
    const input = document.createElement('textarea'); input.id = 'instruction-' + key; input.name = key; input.maxLength = f.max; input.rows = ['title', 'owner'].includes(key) ? 2 : 3; input.required = true; input.setAttribute('aria-describedby', hint.id + ' instructions-error');
    field.append(label, hint, input); $('instruction-fields').append(field);
  }
  const fields = () => Object.fromEntries(Object.keys(allFields).map(key => [key, $('instruction-' + key).value]));
  function clearErrors() { $('instructions-error').hidden = true; for (const key of Object.keys(allFields)) $('instruction-' + key).removeAttribute('aria-invalid'); }
  function readEditor() {
    clearErrors(); const values = fields();
    const brief = Object.fromEntries(Object.keys(FIELDS).map(k => [k, values[k]]));
    const directions = Object.fromEntries(Object.keys(DIRECTION_FIELDS).map(k => [k, values[k]]));
    try { return createInstructions(brief, directions); }
    catch (error) {
      $('instructions-error').textContent = error.message; $('instructions-error').hidden = false;
      const briefErrors = normalizeBrief(brief).errors || {};
      const key = Object.keys(briefErrors).find(k => Object.hasOwn(FIELDS, k)) || Object.keys(DIRECTION_FIELDS).find(k => values[k].trim().length < 3 || values[k].length > allFields[k].max || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(values[k]));
      if (key) { $('instruction-' + key).setAttribute('aria-invalid', 'true'); $('instruction-' + key).focus(); }
      return null;
    }
  }
  function populate(value) {
    revision++; clearErrors();
    const values = { ...value?.brief, ...value?.directions };
    for (const key of Object.keys(allFields)) $('instruction-' + key).value = values[key] || '';
  }
  function cancelRead(message = '') {
    generation++; if (reading && message) status(message); reading = false; $('import-instructions').value = '';
  }
  const dialog = document.createElement('dialog'); dialog.setAttribute('aria-labelledby', 'instructions-confirm-title');
  const title = make('h2', ''); title.id = 'instructions-confirm-title';
  const explanation = make('p', ''); const summary = make('p', '', 'instruction-confirm-summary');
  const controls = make('div', '', 'dialog-actions'); const keep = make('button', 'Keep editing', 'secondary'); const confirm = make('button', 'Confirm', 'primary'); confirm.id = 'confirm-instructions'; keep.type = confirm.type = 'button'; controls.append(keep, confirm); dialog.append(title, explanation, summary, controls); document.body.append(dialog);
  function ask(button, heading, text, label, callback, detail = '') {
    showConfirmation(dialog, keep); trigger = button;
    title.textContent = heading; explanation.textContent = text; summary.textContent = detail; confirm.textContent = label;
    action = { revision, callback };
  }
  keep.addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => { if (dialog.open) return; action = null; returnFocus(dialog, trigger); });
  confirm.addEventListener('click', () => {
    if (!dialog.open || !action) return;
    const pending = action; action = null; dialog.close();
    if (revision !== pending.revision) { status('Instructions changed while confirmation was open. Review them and try again.'); return; }
    pending.callback();
  });
  $('instructions-form').addEventListener('submit', e => { e.preventDefault(); });
  $('instructions-form').addEventListener('input', () => { revision++; cancelRead('Import cancelled because you edited the instructions. Select the file again.'); clearErrors(); status('Instructions edited in this tab only. Save or download them to keep a copy. Active work is unchanged.'); });
  $('copy-brief-instructions').addEventListener('click', () => {
    const brief = readDraft();
    if (!Object.values(brief).some(text => text.trim())) { status('Add an active brief first, or write the instructions below.'); return; }
    ask($('copy-brief-instructions'), 'Copy the active brief into instructions?', 'Replace this instructions editor with the six active brief fields. Title, owner, blocker and handoff fields will be cleared for you to fill. Your active work, result and saved copies stay unchanged.', 'Copy brief fields', () => { populate({ brief }); status('Six brief fields copied. Add title, owner, blocker and handoff directions. No result or review was copied; nothing saved.'); $('instruction-title').focus(); });
  });
  function refresh() {
    try {
      const saved = readInstructions(window.localStorage);
      $('load-instructions').disabled = !saved; $('remove-instructions').hidden = !saved;
      $('saved-instructions-label').textContent = saved ? 'Saved instructions available: ' + saved.directions.title : 'No reusable instructions saved in this browser.';
      return saved;
    } catch {
      $('load-instructions').disabled = true; $('remove-instructions').hidden = false;
      $('saved-instructions-label').textContent = 'Saved instructions unavailable or unreadable. Nothing was loaded. You can still edit, import or download.';
      return null;
    }
  }
  $('save-instructions').addEventListener('click', () => {
    const value = readEditor(); if (!value || $('save-instructions').disabled) return;
    $('save-instructions').disabled = true;
    try { saveInstructions(window.localStorage, value); refresh(); status('Instructions saved in this browser, replacing the previous instructions copy. Active work and its saved backup are unchanged.'); }
    catch { status('Instructions saving could not be confirmed. The editor is still here; download instructions to keep a copy.'); }
    finally { setTimeout(() => { $('save-instructions').disabled = false; }, 500); }
  });
  $('load-instructions').addEventListener('click', () => {
    const saved = refresh(); if (!saved) return;
    ask($('load-instructions'), 'Load saved instructions?', 'Replace this instructions editor only. Active work and its result stay unchanged. Nothing is started or automatically saved.', 'Load instructions', () => { populate(saved); status('Saved instructions loaded into the editor only. Review before starting new work.'); $('instruction-title').focus(); }, saved.directions.title);
  });
  $('remove-instructions').addEventListener('click', () => {
    ask($('remove-instructions'), 'Remove saved instructions?', 'Delete the reusable instructions copy from this browser. The open editor, active work, its saved copy and downloaded files stay unchanged.', 'Remove instructions copy', () => {
      try { removeInstructions(window.localStorage); refresh(); status('Saved instructions removed. The open editor and active work are unchanged.'); $('instructions-heading').focus(); }
      catch { status('Instructions removal could not be confirmed. The open editor and active work are unchanged.'); }
    });
  });
  $('clear-instructions').addEventListener('click', () => ask($('clear-instructions'), 'Clear the instructions editor?', 'Clear only the unsaved instructions in this tab. Active work and all saved copies/downloads remain.', 'Clear instructions editor', () => { populate(null); status('Instructions editor cleared. Saved instructions and active work remain.'); $('instruction-title').focus(); }));
  $('download-instructions').addEventListener('click', () => {
    const value = readEditor(); if (value) download(encodeInstructions(value), 'joinermill-work-instructions.json', $('download-instructions'), $('instructions-status'), 'application/json', 'instructions JSON file');
  });
  $('start-instructions').addEventListener('click', () => {
    const value = readEditor(); if (!value) return;
    ask($('start-instructions'), 'Start fresh work from these instructions?', 'Replace the active work in this tab. Save or download any current work before continuing. Copy only the brief and owner/blocker/handoff directions; clear all prior results, sources, feedback, owner decisions, captured targets, action notes and format-check state. Saved copies stay unchanged. This does not execute, assign or schedule work.', 'Start fresh work', () => {
      applyCopy(startFromInstructions(value), 'Started fresh work from reusable instructions.', true);
      status('Fresh work created in this tab only. The reusable instructions are unchanged; nothing saved or sent.');
    }, value.directions.title + ' · Owner label: ' + value.directions.owner);
  });
  $('import-instructions').addEventListener('change', async () => {
    const file = $('import-instructions').files[0]; if (!file) return;
    cancelRead(); const ticket = generation, sourceRevision = revision; reading = true; status('Reading an instructions file locally; nothing is uploaded…');
    try {
      if (file.size > MAX_INSTRUCTIONS_BYTES) throw new Error('size');
      const raw = await file.text(); if (ticket !== generation || sourceRevision !== revision) return;
      reading = false; const value = decodeInstructions(raw);
      ask($('import-instructions'), 'Import reusable instructions?', 'Replace this instructions editor only with the file contents. Active work and its result stay unchanged. No result or acceptance is imported; nothing is saved or started.', 'Import instructions', () => { populate(value); status('Instructions imported into this editor only. Review before saving or starting new work.'); $('instruction-title').focus(); }, value.directions.title);
    } catch { if (ticket === generation) { reading = false; status('Cannot import instructions: invalid, unsupported or over 64 KiB. Use an instructions file, not a full-work backup. Current work and saved copies are unchanged.'); } }
  });
  window.addEventListener('storage', event => { if (event.key === null || event.key === INSTRUCTIONS_KEY) { refresh(); status('Saved instructions changed in another tab. This editor and active work are unchanged. Load or save only when you choose.'); } });
  refresh();
  return {
    interrupt(modal) { cancelRead('Instructions import cancelled because another confirmation was opened. Select the file again.'); if (modal !== dialog) action = null; },
    leave(view) { if (view !== 'instructions') { cancelRead('Instructions import cancelled when you left the editor. Select the file again.'); if (dialog.open) { action = null; dialog.close(); } } }
  };
}
