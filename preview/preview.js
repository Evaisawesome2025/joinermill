import { FIELDS, normalizeBrief, exportBrief, digestText } from './brief-model.js';
import { templates } from './examples.js';
const ENDPOINT = 'https://evaos-v05-ask.joinermill-ask.workers.dev/brief/validate';
const $ = id => document.getElementById(id);
const make = (tag, cls, text) => { const n = document.createElement(tag); n.className = cls || ''; n.textContent = text; return n; };
const announce = text => { $('announcement').textContent = text; };
let prepared = null, pending = null;
function cancelCheck() {
  if (pending) { pending.abort(); pending = null; $('check-status').textContent = 'Check cancelled. You can try again.'; }
  $('check-brief').disabled = false;
}
function invalidate() { cancelCheck(); prepared = null; $('brief-tag').textContent = 'Draft'; $('check-status').textContent = ''; $('download-status').textContent = ''; }
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
  const view = ['workspace', 'brief', 'review', 'example', 'team', 'about'].includes(key) ? key : 'workspace';
  if (view === 'review' && !prepared) { location.replace('#brief'); return; }
  if (view !== 'review') cancelCheck();
  document.querySelectorAll('.view').forEach(n => { n.hidden = n.id !== 'view-' + view; });
  document.querySelectorAll('nav a').forEach(a => { if (a.dataset.view === (view === 'review' ? 'brief' : view)) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
  if (view === 'example') renderExample();
  if (view === 'review') renderReview();
  document.title = ({ workspace: 'Eva’s desk', brief: 'Edit work brief', review: 'Review work brief', example: 'Separate example', team: 'The organization', about: 'How it works' })[view] + ' — EvaOS by Joinermill';
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
function download(content, filename, button, status) {
  if (button.disabled) return;
  button.disabled = true;
  let url;
  try {
    url = URL.createObjectURL(new Blob([content], { type: 'text/plain;charset=utf-8' }));
    const a = document.createElement('a'); a.href = url; a.download = filename; document.body.append(a); a.click(); a.remove();
    if (status) status.textContent = 'Download requested. Check your browser’s downloads for the text file.';
    announce('Text-file download requested.');
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
    $('check-status').textContent = 'Format checked. The server export matches this brief byte for byte. This does not verify the plan or checklist. SHA-256: ' + result.sha256;
  } catch (error) {
    if (pending !== controller) return;
    $('check-status').textContent = error.message === 'busy' ? 'The checker is busy. Try again in a minute. Your local brief and download still work.' : 'Check unavailable or response could not be verified. Your local brief is unchanged; download it or try again.';
  } finally { clearTimeout(timer); if (pending === controller) { pending = null; $('check-brief').disabled = false; } }
});
const dialog = document.createElement('dialog'); dialog.setAttribute('aria-labelledby', 'reset-title');
dialog.append(make('h2', '', 'Clear this draft?')); dialog.firstChild.id = 'reset-title';
dialog.append(make('p', '', 'This clears all six fields from this tab. Downloaded files will remain on your device.'));
const actions = make('div', 'dialog-actions', ''); const keep = make('button', 'secondary', 'Keep editing'); const reset = make('button', 'primary', 'Clear draft'); actions.append(keep, reset); dialog.append(actions); document.body.append(dialog);
let resetTrigger;
document.querySelectorAll('[data-reset]').forEach(button => button.addEventListener('click', () => { resetTrigger = button; dialog.showModal(); keep.focus(); }));
keep.addEventListener('click', () => dialog.close());
dialog.addEventListener('close', () => resetTrigger?.focus());
reset.addEventListener('click', () => { invalidate(); $('brief-form').reset(); $('objective-form').reset(); clearErrors(); updateCount(); $('review-content').replaceChildren(); dialog.close(); location.hash = 'workspace'; announce('Draft cleared from this tab.'); });
$('team-grid').replaceChildren(...window.JoinermillRoster.map(person => {
  const card = make('article', 'person-card', ''); card.append(make('span', 'person-initial', person.name[0]), make('h3', '', person.name), make('p', 'person-role', person.role), make('p', 'person-description', person.description));
  const details = document.createElement('details'); details.append(make('summary', '', 'Responsibility boundary'), make('p', '', person.boundary)); card.append(details); return card;
}));
$('roster-count').textContent = window.JoinermillRoster.length + ' named specialists';
$('roster-note').textContent = 'Directory only. No presence feed, live assignments or background activity is connected to this workspace.';
window.addEventListener('hashchange', () => navigate(true));
renderExample(); navigate();
