import { FIELDS, normalizeBrief, exportBrief, digestText } from './brief-model.js';
import { validatePlan, exportPlan, readSaved, saveDraft, removeSaved, encodeSnapshot, decodeSnapshot, MAX_SNAPSHOT_BYTES } from './work-plan.js';
import { emptyResult, validateResult, editResult, recordResult, reviewResult, sameBrief, DECISIONS } from './result-review.js';
import { DIRECTION_FIELDS } from './instructions.js';
import { setupInstructions } from './instructions-ui.js';
import { templates } from './examples.js';
const ENDPOINT = 'https://evaos-v05-ask.joinermill-ask.workers.dev/brief/validate';
const $ = id => document.getElementById(id);
const make = (tag, cls, text) => { const n = document.createElement(tag); n.className = cls || ''; n.textContent = text; return n; };
const announce = text => { $('announcement').textContent = text; };
let prepared = null, pending = null, resultRecord = emptyResult(), acceptanceTarget = null, activeDirections = null, instructionsUI;
let resultOrigin = 'Entered in this tab. Browser-clock timestamps and owner identity are not authenticated.';
function cancelCheck() {
  if (pending) { pending.abort(); pending = null; $('check-status').textContent = 'Check cancelled. You can try again.'; }
  $('check-brief').disabled = false;
}
function invalidate() { markUnsaved(); cancelCheck(); prepared = null; $('brief-tag').textContent = 'Draft'; $('check-status').textContent = ''; $('download-status').textContent = ''; }
function readDraft() { return Object.fromEntries(Object.keys(FIELDS).map(key => [key, $('edit-' + key).value])); }
function clearErrors() {
  $('form-error').hidden = true;
  for (const key of Object.keys(FIELDS)) { $('error-' + key).hidden = true; $('edit-' + key).removeAttribute('aria-invalid'); }
}
function showErrors(errors) {
  clearErrors();
  $('form-error').textContent = errors.form || 'Check the highlighted fields before reviewing your brief.';
  $('form-error').hidden = false;
  let first;
  for (const [key, message] of Object.entries(errors)) {
    if (!Object.hasOwn(FIELDS, key)) continue;
    $('error-' + key).textContent = message; $('error-' + key).hidden = false;
    $('edit-' + key).setAttribute('aria-invalid', 'true'); first ||= $('edit-' + key);
  }
  first?.focus();
}
function renderReview() {
  if (!prepared) return;
  $('desk-objective').textContent = prepared.objective;
  $('desk-deliverable').textContent = prepared.deliverable;
  $('desk-stop').textContent = prepared.stopRule;
  renderResult(); renderDirections();
  $('review-content').replaceChildren(...Object.entries(FIELDS).map(([key, field]) => {
    const section = make('section', 'review-section', ''); section.append(make('h2', '', field.label));
    if (key === 'success') {
      const list = make('ul', '', '');
      for (const item of prepared[key].split('\n')) {
        const li = make('li', '', ''); const mark = make('span', '', '□'); mark.setAttribute('aria-hidden', 'true');
        li.append(mark, make('span', '', item)); list.append(li);
      }
      section.append(list);
    } else section.append(make('p', '', prepared[key]));
    return section;
  }));
}
function renderExample() {
  const t = templates[$('example-template').value] || templates.offer;
  $('brief-objective').textContent = t.objective;
  $('brief-subtitle').textContent = 'A fixed example, separate from your own brief. Nothing here has been executed.';
  $('template-label').textContent = 'EXAMPLE TEMPLATE / ' + t.label.toUpperCase();
  $('brief-title').textContent = t.title; $('brief-summary').textContent = t.summary;
  $('work-steps').replaceChildren(...t.steps.map(s => make('li', '', s)));
  $('artifact-text').textContent = t.artifact; $('stop-condition').textContent = t.stop;
  $('proposed-team').replaceChildren(...t.team.map(name => {
    const member = window.JoinermillRoster.find(p => p.name === name); const row = make('div', 'suggested-person', '');
    row.append(make('span', 'person-initial', name[0])); const text = make('div', '', name);
    text.append(make('small', '', member?.role || 'Specialist')); row.append(text); return row;
  }));
}
function navigate(focus = false) {
  const key = location.hash.slice(1) || 'workspace';
  const view = ['workspace', 'brief', 'review', 'instructions', 'example', 'team', 'about'].includes(key) ? key : 'workspace';
  if (view === 'review' && !prepared) { location.replace('#brief'); return; }
  if (view !== 'review') cancelCheck();
  instructionsUI?.leave(view);
  document.querySelectorAll('.view').forEach(n => { n.hidden = n.id !== 'view-' + view; });
  document.querySelectorAll('nav a').forEach(a => { if (a.dataset.view === (view === 'review' ? 'brief' : view)) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
  if (view === 'example') renderExample();
  if (view === 'review') renderReview();
  document.title = ({ workspace: 'Eva’s desk', brief: 'Edit work brief', review: 'Your work desk', example: 'Separate example', instructions: 'Reusable work instructions', team: 'The organization', about: 'How it works' })[view] + ' — EvaOS by Joinermill';
  if (focus) { $('main').focus({ preventScroll: true }); window.scrollTo(0, 0); }
}
function updateCount() { $('character-count').textContent = $('objective').value.length + ' / 600'; $('objective-error').hidden = true; $('objective').removeAttribute('aria-invalid'); }
$('objective').addEventListener('input', () => {
  $('edit-objective').value = $('objective').value; invalidate(); updateCount();
});
$('objective-form').addEventListener('submit', event => {
  event.preventDefault(); const value = $('objective').value.trim();
  if (value.length < 12 || value.length > 600) { $('objective-error').textContent = 'Add a little more direction: use 12–600 characters.'; $('objective-error').hidden = false; $('objective').setAttribute('aria-invalid', 'true'); $('objective').focus(); return; }
  $('edit-objective').value = value; invalidate(); location.hash = 'brief'; announce('Objective added. Complete the other fields to prepare your brief.');
});
$('brief-form').addEventListener('input', event => {
  invalidate();
  if (event.target.name === 'objective') { $('objective').value = event.target.value; updateCount(); }
  const key = event.target.name;
  if (Object.hasOwn(FIELDS, key)) { $('error-' + key).hidden = true; event.target.removeAttribute('aria-invalid'); }
});
$('brief-form').addEventListener('submit', event => {
  event.preventDefault(); const result = normalizeBrief(readDraft());
  if (!result.ok) { showErrors(result.errors); return; }
  clearErrors(); invalidate(); prepared = result.brief;
  for (const [key, value] of Object.entries(prepared)) $('edit-' + key).value = value;
  $('objective').value = prepared.objective; updateCount(); $('brief-tag').textContent = 'Prepared';
  renderReview(); location.hash = 'review'; announce('Brief prepared locally. Checklist items remain unverified.');
});
function download(content, filename, button, status, mime = 'text/plain;charset=utf-8', fileKind = null) {
  if (button.disabled) return;
  button.disabled = true;
  let url;
  try {
    url = URL.createObjectURL(new Blob([content], { type: mime }));
    const a = document.createElement('a'); a.href = url; a.download = filename; document.body.append(a); a.click(); a.remove();
    const kind = fileKind || (mime === 'application/json' ? 'JSON backup' : 'text file');
    if (status) status.textContent = 'Download requested. Check your browser’s downloads for the ' + kind + '.';
    announce(kind + ' download requested.');
  } catch { if (status) status.textContent = 'Download could not start. Your draft is still here; try again in this browser.'; announce('Download could not start.'); }
  finally { setTimeout(() => { if (url) URL.revokeObjectURL(url); button.disabled = false; }, 600); }
}
$('download-brief').addEventListener('click', () => { if (prepared) download(exportBrief(prepared), 'joinermill-work-brief.txt', $('download-brief'), $('download-status')); });
$('download-example').addEventListener('click', () => {
  const t = templates[$('example-template').value] || templates.offer;
  download(['JOINERMILL / EVAOS — FIXED EXAMPLE', 'Not your brief. No work has been executed.', '', t.objective, t.title, t.summary, '', 'EXAMPLE STEPS', ...t.steps, '', 'TEMPLATE DRAFT', t.artifact, '', 'PROPOSED ROLES (not assigned)', t.team.join(', '), '', 'STOP CONDITION', t.stop].join('\n'), 'joinermill-example.txt', $('download-example'));
});
$('example-template').addEventListener('change', renderExample);
async function readResponse(response) {
  if (!response.headers.get('Content-Type')?.startsWith('application/json')) throw new Error('format');
  const reader = response.body.getReader(); let length = 0, text = ''; const decoder = new TextDecoder();
  try {
    while (true) {
      const { done, value } = await reader.read(); if (done) break;
      length += value.byteLength; if (length > 131072) throw new Error('size'); text += decoder.decode(value, { stream: true });
    }
    return JSON.parse(text + decoder.decode());
  } finally { reader.cancel().catch(() => {}); }
}
$('check-brief').addEventListener('click', async () => {
  if (!prepared || pending) return;
  const snapshot = prepared; const controller = new AbortController(); pending = controller;
  $('check-brief').disabled = true; $('check-status').textContent = 'Sending this brief for a structure check…';
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(ENDPOINT, { method: 'POST', mode: 'cors', credentials: 'omit', cache: 'no-store', referrerPolicy: 'no-referrer', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(snapshot), signal: controller.signal });
    if (!response.ok) throw new Error(response.status === 429 ? 'busy' : 'failed');
    const result = await readResponse(response); const expected = exportBrief(snapshot);
    if (!result.ok || result.schema_version !== 1 || result.kind !== 'deterministic_work_brief' || result.executed !== false || result.validation !== 'structure_only' || result.exportText !== expected || result.sha256 !== await digestText(expected) || JSON.stringify(result.brief) !== JSON.stringify(snapshot)) throw new Error('mismatch');
    if (pending !== controller || prepared !== snapshot) return;
    $('check-status').textContent = 'Format checked. The six-field brief export matches byte for byte. Your planning notes, work directions, result and owner review stayed local. This does not verify the plan or checklist. SHA-256: ' + result.sha256;
  } catch (error) {
    if (pending !== controller) return;
    $('check-status').textContent = error.message === 'busy' ? 'The checker is busy. Try again in a minute. Your local brief and download still work.' : 'Check unavailable or response could not be verified. Your local brief is unchanged; download it or try again.';
  } finally { clearTimeout(timer); if (pending === controller) { pending = null; $('check-brief').disabled = false; } }
});
const dialog = document.createElement('dialog'); dialog.setAttribute('aria-labelledby', 'reset-title');
dialog.append(make('h2', '', 'Clear this draft?')); dialog.firstChild.id = 'reset-title';
dialog.append(make('p', '', 'This clears the brief, planning notes, result and owner review from this tab. The saved browser copy and downloaded files remain. Use Remove saved copy to delete the browser snapshot.'));
const actions = make('div', 'dialog-actions', ''); const keep = make('button', 'secondary', 'Keep editing'); const reset = make('button', 'primary', 'Clear draft'); actions.append(keep, reset); dialog.append(actions); document.body.append(dialog);
let resetTrigger;
document.querySelectorAll('[data-reset]').forEach(button => button.addEventListener('click', () => { resetTrigger = button; showConfirmation(dialog, keep); }));
keep.addEventListener('click', () => dialog.close());
dialog.addEventListener('close', () => returnFocus(dialog, resetTrigger));
reset.addEventListener('click', () => { if (!dialog.open) return; closeConfirmations(); invalidate(); clearResult(); activeDirections = null; renderDirections(); cancelImport(); $('brief-form').reset(); $('objective-form').reset(); $('nextAction').value = ''; $('unresolvedInputs').value = ''; updatePlanNotes(); clearErrors(); updateCount(); $('review-content').replaceChildren(); for (const key of ['desk-objective', 'desk-deliverable', 'desk-stop']) $(key).textContent = ''; dialog.close(); location.hash = 'workspace'; announce('Draft cleared from this tab.'); });
function readPlan() { return { nextAction: $('nextAction').value, unresolvedInputs: $('unresolvedInputs').value }; }
function storageStatus(text) { if ($('storage-status').textContent !== text) $('storage-status').textContent = text; }
function markUnsaved() { storageStatus('Changes in this tab are not saved automatically. Save a browser copy or download your work plan.'); }
function updatePlanNotes() {
  const plan = readPlan(); const result = validatePlan(plan);
  $('plan-error').hidden = result.ok;
  if (!result.ok) $('plan-error').textContent = result.error;
  for (const key of ['nextAction', 'unresolvedInputs']) {
    if (!result.ok && result.field === key) $(key).setAttribute('aria-invalid', 'true'); else $(key).removeAttribute('aria-invalid');
  }
  $('next-note').textContent = plan.nextAction.trim() ? 'Your action note is set. Nothing is scheduled or assigned.' : 'No next action set by you.';
  $('missing-note').textContent = result.ok && result.items.length ? result.items.length + ' input note' + (result.items.length === 1 ? '' : 's') + ' listed by you. You decide what blocks the work.' : 'No missing inputs listed. This does not establish readiness.';
  return result.ok;
}
for (const key of ['nextAction', 'unresolvedInputs']) $(key).addEventListener('input', () => { updatePlanNotes(); markUnsaved(); });
function refreshSaved() {
  try {
    const saved = readSaved(window.localStorage);
    $('saved-banner').hidden = !saved; $('restore-draft').disabled = !saved; $('remove-saved').hidden = !saved;
    if (saved) { $('saved-label').textContent = 'Browser copy saved ' + new Date(saved.savedAt).toLocaleString(); $('saved-description').textContent = 'Stored on this device only. Restore it explicitly; nothing loads or sends automatically.'; }
    return saved;
  } catch (error) {
    const corrupt = ['invalid_snapshot', 'unsupported_snapshot', 'snapshot_too_large'].includes(error.message);
    $('saved-banner').hidden = !corrupt; $('restore-draft').disabled = true; $('remove-saved').hidden = !corrupt;
    if (corrupt) { $('saved-label').textContent = 'Saved copy could not be read.'; $('saved-description').textContent = 'It is invalid or from an unsupported version. Nothing was restored. You can remove this copy.'; }
    else storageStatus('Browser saving is unavailable. You can still work in this tab and download a work plan.');
    return null;
  }
}
function briefAndPlanOK() {
  if (!validateResult(resultRecord)) { storageStatus('Result text needs attention: use the stated limits and remove control characters before saving or exporting.'); return false; }
  if (updatePlanNotes()) return true;
  storageStatus('Planning note needs attention: ' + $('plan-error').textContent + ' Review the brief to edit that note.');
  return false;
}
document.querySelectorAll('[data-save]').forEach(button => button.addEventListener('click', () => {
  if (button.disabled || !briefAndPlanOK()) return;
  button.disabled = true;
  try {
    saveDraft(window.localStorage, readDraft(), readPlan(), resultRecord, activeDirections); refreshSaved();
    storageStatus('Saved in this browser. Later edits need another Save; nothing was sent to a server.');
  } catch { storageStatus('Saving could not be confirmed. Your draft is still in this tab. Download a work plan to keep a copy.'); }
  finally { setTimeout(() => { button.disabled = false; }, 500); }
}));
document.querySelectorAll('[data-download-plan]').forEach(button => button.addEventListener('click', () => {
  if (!briefAndPlanOK()) return;
  try { download(exportPlan(readDraft(), readPlan(), resultRecord, activeDirections), 'joinermill-work-plan.txt', button, $('storage-status')); }
  catch { storageStatus('The draft contains unsupported characters or is too long. Review the fields before exporting.'); }
}));
const restoreDialog = document.createElement('dialog'); restoreDialog.setAttribute('aria-labelledby', 'restore-title');
const restoreTitle = make('h2', '', 'Replace this tab’s draft?'); restoreTitle.id = 'restore-title';
restoreDialog.append(restoreTitle, make('p', '', 'Restoring replaces the current brief, planning notes, result and owner review with the saved browser copy. Unsaved changes will be lost.'));
const restoreActions = make('div', 'dialog-actions', ''); const cancelRestore = make('button', 'secondary', 'Keep current draft'); const confirmRestore = make('button', 'primary', 'Restore copy');
restoreActions.append(cancelRestore, confirmRestore); restoreDialog.append(restoreActions); document.body.append(restoreDialog);
function applyCopy(saved, source, fresh = false) {
  closeConfirmations(); invalidate();
  for (const [key, value] of Object.entries(saved.draft)) $('edit-' + key).value = value;
  $('objective').value = saved.draft.objective;
  for (const [key, value] of Object.entries(saved.plan)) $(key).value = value;
  activeDirections = saved.directions ?? null; renderDirections();
  resultRecord = saved.result; resultOrigin = fresh ? 'Started from instructions. No result, source, owner decision or prior timestamps were copied.' : source + ' Decisions and timestamps in this copy are user-provided claims, not authenticated approval.'; populateResult();
  clearErrors(); updateCount(); updatePlanNotes();
  const result = normalizeBrief(saved.draft);
  if (result.ok) { prepared = result.brief; $('brief-tag').textContent = 'Prepared'; renderReview(); location.hash = 'review'; }
  else location.hash = 'brief';
  storageStatus(source + ' No server check was restored or run. Nothing was sent or saved automatically.');
  // A restore may keep the same hash; update the visible view and focus explicitly.
  navigate(true);
}
function restoreCurrentSaved() { const saved = refreshSaved(); if (saved) { cancelImport(); applyCopy(saved, 'Restored the browser copy into this tab.'); } }
$('restore-draft').addEventListener('click', () => {
  if (!refreshSaved()) return;
  if (Object.values(readDraft()).some(Boolean) || Object.values(readPlan()).some(Boolean) || resultRecord.baseline || [resultRecord.text, resultRecord.provenance, resultRecord.feedback].some(Boolean)) { showConfirmation(restoreDialog, cancelRestore); }
  else restoreCurrentSaved();
});
cancelRestore.addEventListener('click', () => restoreDialog.close());
restoreDialog.addEventListener('close', () => returnFocus(restoreDialog, $('restore-draft')));
confirmRestore.addEventListener('click', () => { if (!restoreDialog.open) return; restoreDialog.close(); restoreCurrentSaved(); });
$('remove-saved').addEventListener('click', () => {
  try { removeSaved(window.localStorage); refreshSaved(); storageStatus('Saved browser copy removed. The draft open in this tab and downloads are unchanged.'); $('main').focus({ preventScroll: true }); }
  catch { storageStatus('The browser copy could not be removed. Your current draft is unchanged; try again or use browser site-data controls.'); }
});
window.addEventListener('storage', event => {
  if (event.key === null || event.key === 'joinermill.workdesk.v1') { refreshSaved(); storageStatus('The saved copy changed in another tab. Your open draft is unchanged. Restore or save only when you choose.'); }
});
function resultError(message = '') { $('result-error').textContent = message; $('result-error').hidden = !message; }
function renderResult() {
  const recorded = !!resultRecord.recordedAt;
  $('result-badge').textContent = recorded ? DECISIONS[resultRecord.decision] : (resultRecord.text || resultRecord.provenance ? 'Result draft' : 'No result recorded');
  $('result-state').textContent = recorded ? DECISIONS[resultRecord.decision] + ' — for the captured brief only.' : 'Record a result and its source before making an owner decision.';
  $('result-times').textContent = recorded ? 'Recorded: ' + resultRecord.recordedAt + (resultRecord.reviewedAt ? ' · Owner decision: ' + resultRecord.reviewedAt : '') : '';
  $('result-origin').textContent = resultOrigin;
  const current = normalizeBrief(readDraft());
  $('result-mismatch').hidden = !resultRecord.baseline || (current.ok && sameBrief(current.brief, resultRecord.baseline));
  $('result-baseline').hidden = !resultRecord.baseline;
  $('result-baseline-content').replaceChildren(...(resultRecord.baseline ? Object.entries(FIELDS).map(([key, field]) => {
    const section = make('section', 'review-section', ''); section.append(make('h3', '', field.label), make('p', '', resultRecord.baseline[key])); return section;
  }) : []));
  $('record-result').disabled = recorded;
  $('record-result').textContent = resultRecord.baseline ? 'Record updated result for original brief' : 'Record result for this brief';
  $('needs-revision').disabled = !recorded || resultRecord.decision === 'needs_revision';
  $('accept-result').disabled = !recorded || resultRecord.decision === 'accepted';
}
function populateResult() { for (const key of ['text', 'provenance', 'feedback']) $('result-' + key).value = resultRecord[key]; resultError(); renderResult(); }
function clearResult() { resultRecord = emptyResult(); resultOrigin = 'Entered in this tab. Browser-clock timestamps and owner identity are not authenticated.'; $('result-baseline').open = false; populateResult(); }
for (const key of ['text', 'provenance', 'feedback']) $('result-' + key).addEventListener('input', () => {
  resultRecord = editResult(resultRecord, key, $('result-' + key).value); resultError(); renderResult(); markUnsaved();
});
$('record-result').addEventListener('click', () => {
  try { resultRecord = recordResult(resultRecord, readDraft()); resultError(); renderResult(); markUnsaved(); announce('Result recorded locally against the captured brief. It is not yet saved or reviewed.'); }
  catch (error) { resultError(error.message); }
});
function decideResult(decision) {
  try { resultRecord = reviewResult(resultRecord, decision); resultError(); renderResult(); markUnsaved(); announce(DECISIONS[decision] + ' for the captured brief. This is an owner decision, not independent verification.'); return true; }
  catch (error) { resultError(error.message); return false; }
}
$('needs-revision').addEventListener('click', () => decideResult('needs_revision'));
const acceptDialog = document.createElement('dialog'); acceptDialog.setAttribute('aria-labelledby', 'accept-title');
const acceptTitle = make('h2', '', 'Accept this result as owner?'); acceptTitle.id = 'accept-title';
acceptDialog.append(acceptTitle, make('p', '', 'You are recording your own acceptance for the captured original brief. This does not verify the output, authenticate your identity or establish that every criterion was met. It does not save automatically.'));
const acceptActions = make('div', 'dialog-actions', ''); const keepReviewing = make('button', 'secondary', 'Keep reviewing'); const confirmAccept = make('button', 'primary', 'Record owner acceptance');
acceptActions.append(keepReviewing, confirmAccept); acceptDialog.append(acceptActions); document.body.append(acceptDialog);
$('accept-result').addEventListener('click', () => {
  try { reviewResult(resultRecord, 'accepted'); resultError(); showConfirmation(acceptDialog, keepReviewing); acceptanceTarget = resultRecord; }
  catch (error) { resultError(error.message); }
});
keepReviewing.addEventListener('click', () => acceptDialog.close());
acceptDialog.addEventListener('close', () => {
  if (acceptDialog.open) return;
  acceptanceTarget = null;
  returnFocus(acceptDialog, $('result-feedback'), $('accept-result'));
});
confirmAccept.addEventListener('click', () => {
  if (!acceptDialog.open) return;
  if (!acceptanceTarget || acceptanceTarget !== resultRecord) {
    acceptDialog.close(); acceptanceTarget = null;
    resultError('The result changed while confirmation was open. Review it again before accepting.'); return;
  }
  if (decideResult('accepted')) { acceptanceTarget = null; acceptDialog.close(); }
});
$('download-backup').addEventListener('click', () => {
  if (!briefAndPlanOK()) return;
  try { download(encodeSnapshot(readDraft(), readPlan(), new Date().toISOString(), resultRecord, activeDirections), 'joinermill-local-backup.json', $('download-backup'), $('import-status'), 'application/json'); }
  catch { $('import-status').textContent = 'Backup could not be created. Check the field limits; your current draft remains here.'; }
});
let importGeneration = 0, importCandidate = null, importReading = false;
const importDialog = document.createElement('dialog'); importDialog.setAttribute('aria-labelledby', 'import-title');
const importTitle = make('h2', '', 'Replace this tab with the backup?'); importTitle.id = 'import-title';
importDialog.append(importTitle, make('p', '', 'The file passed format checks only. Import replaces the open brief, notes, result and owner review. Decisions in it are not authenticated approval. Your saved browser copy stays unchanged until you explicitly Save.'));
const importActions = make('div', 'dialog-actions', ''); const cancelImportButton = make('button', 'secondary', 'Keep current work'); const confirmImport = make('button', 'primary', 'Import into this tab');
importActions.append(cancelImportButton, confirmImport); importDialog.append(importActions); document.body.append(importDialog);
function cancelImport(message = '') {
  const interrupted = importReading || !!importCandidate;
  importGeneration++; importReading = false; importCandidate = null; $('import-backup').value = '';
  $('import-status').textContent = interrupted ? message : '';
  if (importDialog.open) importDialog.close();
}
// Queued close events must not steal focus after the person has selected another field.
function returnFocus(modal, target, opener = target) {
  if (modal.open || document.querySelector('dialog[open]')) return;
  const active = document.activeElement;
  if (active === document.body || active === opener || modal.contains(active)) target?.focus();
}
// A confirmation must not outlive the work it describes, or stack over a different action.
function closeConfirmations() {
  instructionsUI?.interrupt(null);
  acceptanceTarget = null;
  document.querySelectorAll('dialog[open]').forEach(modal => modal.close());
}
function showConfirmation(modal, cancelButton) {
  instructionsUI?.interrupt(modal);
  if (modal !== importDialog) cancelImport('Import cancelled because another confirmation was opened. Select the backup again to import it.');
  document.querySelectorAll('dialog[open]').forEach(other => {
    if (other === modal) return;
    if (other === acceptDialog) acceptanceTarget = null;
    other.close();
  });
  if (!modal.open) modal.showModal();
  cancelButton.focus();
}
$('import-backup').addEventListener('change', async () => {
  const file = $('import-backup').files[0]; if (!file) return;
  cancelImport(); const generation = importGeneration; importReading = true;
  $('import-status').textContent = 'Reading a local backup; nothing is uploaded…';
  try {
    if (file.size > MAX_SNAPSHOT_BYTES) throw new Error('size');
    const raw = await file.text(); if (generation !== importGeneration) return;
    importReading = false;
    importCandidate = decodeSnapshot(raw);
    $('import-status').textContent = 'Backup format checked. Confirm before replacing this tab.';
    showConfirmation(importDialog, cancelImportButton);
  } catch { if (generation === importGeneration) { importReading = false; importCandidate = null; $('import-status').textContent = 'Cannot import: invalid, unsupported or oversized backup. The current draft and saved copy are unchanged.'; } }
});
cancelImportButton.addEventListener('click', () => importDialog.close());
importDialog.addEventListener('close', () => {
  if (importDialog.open) return;
  if (importCandidate) $('import-status').textContent = 'Import cancelled. Current work and the saved browser copy are unchanged.';
  importCandidate = null; returnFocus(importDialog, $('import-backup'));
});
confirmImport.addEventListener('click', () => {
  if (!importDialog.open || !importCandidate) return;
  const copy = importCandidate; cancelImport(); applyCopy(copy, 'Imported a local file into this tab.');
  $('import-status').textContent = 'Imported into this tab only. Use Save to replace the browser copy, or download to keep a file.';
});
function renderDirections() {
  $('active-directions').hidden = !activeDirections; $('directions-heading').textContent = activeDirections?.title || '';
  $('directions-content').replaceChildren(...(activeDirections ? Object.entries(DIRECTION_FIELDS).filter(([key]) => key !== 'title').map(([key, field]) => { const section = make('section', '', ''); section.append(make('h3', '', field.label), make('p', '', activeDirections[key])); return section; }) : []));
}
instructionsUI = setupInstructions({ readDraft, showConfirmation, returnFocus, applyCopy, download });
$('team-grid').replaceChildren(...window.JoinermillRoster.map(person => {
  const card = make('article', 'person-card', ''); card.append(make('span', 'person-initial', person.name[0]), make('h3', '', person.name), make('p', 'person-role', person.role), make('p', 'person-description', person.description));
  const details = document.createElement('details'); details.append(make('summary', '', 'Responsibility boundary'), make('p', '', person.boundary)); card.append(details); return card;
}));
$('roster-count').textContent = window.JoinermillRoster.length + ' named specialists';
$('roster-note').textContent = 'Directory only. No presence feed, live assignments or background activity is connected to this workspace.';
window.addEventListener('hashchange', () => navigate(true));
refreshSaved(); updatePlanNotes(); populateResult(); renderExample(); navigate();
