const billInput    = document.getElementById('bill');
const customTip    = document.getElementById('custom-tip');
const peopleInput  = document.getElementById('people');
const tipBtns      = document.querySelectorAll('.tip-btn');
const resetBtn     = document.getElementById('reset-btn');

const outTip       = document.getElementById('out-tip');
const outTotal     = document.getElementById('out-total');
const outPerPerson = document.getElementById('out-per-person');

const billErr      = document.getElementById('bill-err');
const tipErr       = document.getElementById('tip-err');
const peopleErr    = document.getElementById('people-err');

// tracks which preset is active; null = custom
let activeTip = null;

// ── validation helpers ──
// returns { value, ok, msg }
function validateBill(raw) {
    if (raw === '' || raw === null) return { value: null, ok: false, msg: 'Enter a bill amount' };
    const n = parseFloat(raw);
    if (isNaN(n))        return { value: null, ok: false, msg: 'Must be a number' };
    if (n < 0)           return { value: null, ok: false, msg: 'Bill cannot be negative' };
    if (n > 10_000_000)  return { value: null, ok: false, msg: 'Value is unrealistically large' };
    return { value: n, ok: true, msg: '' };
}

function validateTip(raw) {
    if (raw === '' || raw === null) return { value: null, ok: false, msg: 'Select or enter a tip %' };
    const n = parseFloat(raw);
    if (isNaN(n))   return { value: null, ok: false, msg: 'Must be a number' };
    if (n < 0)      return { value: null, ok: false, msg: 'Tip cannot be negative' };
    if (n > 100)    return { value: null, ok: false, msg: 'Tip above 100% — are you sure?' };
    return { value: n, ok: true, msg: '' };
}

function validatePeople(raw) {
    if (raw === '' || raw === null) return { value: null, ok: false, msg: 'Enter number of people' };
    const n = parseInt(raw, 10);
    if (isNaN(n) || !Number.isInteger(n)) return { value: null, ok: false, msg: 'Must be a whole number' };
    if (n < 1)     return { value: null, ok: false, msg: 'Must be at least 1 person' };
    if (n > 10000) return { value: null, ok: false, msg: 'Unrealistically large group' };
    return { value: n, ok: true, msg: '' };
}

  // show/hide inline error for a field
function setError(input, errEl, msg) {
    if (msg) {
      input.classList.add('invalid');
      errEl.textContent = msg;
    } else {
      input.classList.remove('invalid');
      errEl.textContent = '';
    }
}

// ── rounding policy ──
// Round each person's share UP to nearest 2 decimal places (Math.ceil to 2dp).
// This ensures the group never underpays the total.
// The tiny overage (at most 1 paisa x n people) is absorbed by the payer.
function roundUp2(n) { return Math.ceil(n * 100) / 100; }

// format as currency string
function fmt(n) {
    return 'Rs ' + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }

// ── main calculation ──
function recalc() {
    const rawBill   = billInput.value.trim();
    const rawPeople = peopleInput.value.trim();

    // determine tip source: active preset or custom input
    let rawTip;
    if (activeTip !== null) {
      rawTip = String(activeTip);
    } else {
      rawTip = customTip.value.trim();
    }

    // validate all three
    const bv = validateBill(rawBill);
    const tv = validateTip(rawTip);
    const pv = validatePeople(rawPeople);

    // errors show only after user has touched a field
    setError(billInput,   billErr,   rawBill !== '' ? bv.msg : '');
    setError(customTip,   tipErr,    (rawTip !== '' || activeTip !== null) ? tv.msg : '');
    setError(peopleInput, peopleErr, rawPeople !== '' ? pv.msg : '');

    // only compute if all three are valid
    if (!bv.ok || !tv.ok || !pv.ok) {
      if (rawBill === '' && rawTip === '' && rawPeople === '') {
        outTip.textContent       = 'Rs 0.00';
        outTotal.textContent     = 'Rs 0.00';
        outPerPerson.textContent = 'Rs 0.00';
      }
      return;
}

    const bill   = bv.value;
    const tipPct = tv.value;
    const people = pv.value;

    const tipAmount  = bill * (tipPct / 100);
    const grandTotal = bill + tipAmount;
    const perPerson  = roundUp2(grandTotal / people);

    outTip.textContent       = fmt(tipAmount);
    outTotal.textContent     = fmt(grandTotal);
    outPerPerson.textContent = fmt(perPerson);
  }

// ── preset tip button interaction ──
tipBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const val = parseInt(btn.dataset.tip, 10);

      if (activeTip === val) {
        // clicking active preset deselects it
        activeTip = null;
        btn.classList.remove('active');
        btn.setAttribute('aria-pressed', 'false');
      } else {
        // select this preset, clear custom input
        activeTip = val;
        customTip.value = '';
        tipBtns.forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-pressed', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');
      }

      recalc();
    });
  });

// typing in custom tip field deactivates any preset
customTip.addEventListener('input', () => {
    activeTip = null;
    tipBtns.forEach(b => {
      b.classList.remove('active');
      b.setAttribute('aria-pressed', 'false');
    });
    recalc();
});

  // live update on bill and people fields
billInput.addEventListener('input', recalc);
peopleInput.addEventListener('input', recalc);

// ── reset ──
function reset() {
    billInput.value   = '';
    customTip.value   = '';
    peopleInput.value = '';
    activeTip         = null;

    tipBtns.forEach(b => {
      b.classList.remove('active');
      b.setAttribute('aria-pressed', 'false');
    });

    setError(billInput,   billErr,   '');
    setError(customTip,   tipErr,    '');
    setError(peopleInput, peopleErr, '');

    outTip.textContent       = 'Rs 0.00';
    outTotal.textContent     = 'Rs 0.00';
    outPerPerson.textContent = 'Rs 0.00';

    billInput.focus();
}

resetBtn.addEventListener('click', reset);

// Enter advances focus to next field (helps on mobile)
billInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); customTip.focus(); } });
  customTip.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); peopleInput.focus(); } });
  peopleInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); peopleInput.blur(); } });
    