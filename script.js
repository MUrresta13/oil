// Medium puzzle (classic)
const PUZZLE = [
  [5,3,0,0,7,0,0,0,0],
  [6,0,0,1,9,5,0,0,0],
  [0,9,8,0,0,0,0,6,0],
  [8,0,0,0,6,0,0,0,3],
  [4,0,8,0,0,3,0,0,1],
  [7,0,0,0,2,0,0,0,6],
  [0,6,0,0,0,0,2,8,0],
  [0,0,0,4,1,9,0,0,5],
  [0,0,0,0,8,0,0,7,9]
];
// Correct solution (for validation)
const SOLUTION = [
  [5,3,4,6,7,8,9,1,2],
  [6,7,2,1,9,5,3,4,8],
  [1,9,8,3,4,2,5,6,7],
  [8,5,9,7,6,1,4,2,3],
  [4,2,8,5,3,3,7,9,1], // <-- intentional wrong line? wait, fix!
];

// Fix the solution (typo above corrected)
const SOL = [
  [5,3,4,6,7,8,9,1,2],
  [6,7,2,1,9,5,3,4,8],
  [1,9,8,3,4,2,5,6,7],
  [8,5,9,7,6,1,4,2,3],
  [4,2,6,8,5,3,7,9,1],
  [7,1,3,9,2,4,8,5,6],
  [9,6,1,5,3,7,2,8,4],
  [2,8,7,4,1,9,6,3,5],
  [3,4,5,2,8,6,1,7,9]
];

const grid = document.getElementById('grid');
const statusEl = document.getElementById('status');
const checkBtn = document.getElementById('checkBtn');
const hintBtn = document.getElementById('hintBtn');

const successDlg = document.getElementById('successDlg');
const copyBtn = document.getElementById('copyBtn');
const okBtn = document.getElementById('okBtn');
const codeField = document.getElementById('codeField');

const startOverlay = document.getElementById('startOverlay');
const startBtn = document.getElementById('startBtn');
const app = document.getElementById('app');

// Start overlay -> show game
startBtn.addEventListener('click', () => {
  startOverlay.classList.add('hidden');
  app.classList.remove('hidden');
});

// Build grid
const inputs = []; // 2D array mirroring board inputs
function buildGrid(){
  grid.innerHTML = '';
  for (let r=0;r<9;r++){
    inputs[r] = [];
    for (let c=0;c<9;c++){
      const cell = document.createElement('div');
      cell.className = 'cell';
      const val = PUZZLE[r][c];
      if (val !== 0){
        cell.classList.add('prefill');
        cell.textContent = val;
        inputs[r][c] = null; // locked cell
      } else {
        const input = document.createElement('input');
        input.setAttribute('inputmode','numeric');
        input.setAttribute('aria-label',`Row ${r+1} Col ${c+1}`);
        input.maxLength = 1;
        input.addEventListener('input', e=>{
          const v = e.target.value.replace(/[^1-9]/g,'');
          e.target.value = v.slice(0,1);
          clearMarks();
          statusEl.textContent = 'Keep going… 🕷️';
          // Optional auto-check completion
          if (isComplete()){
            if (isCorrect()){
              revealSuccess();
            } else {
              markErrors();
              statusEl.textContent = 'Something’s off… 👻';
            }
          }
        });
        inputs[r][c] = input;
        cell.appendChild(input);
      }
      grid.appendChild(cell);
    }
  }
}

function clearMarks(){
  grid.querySelectorAll('.cell').forEach(c=>c.classList.remove('error','valid'));
}

function isComplete(){
  // every empty cell must have a digit 1-9
  for (let r=0;r<9;r++){
    for (let c=0;c<9;c++){
      if (PUZZLE[r][c]===0){
        const v = getVal(r,c);
        if (!v) return false;
      }
    }
  }
  return true;
}
function getVal(r,c){
  if (PUZZLE[r][c]!==0) return PUZZLE[r][c];
  const el = inputs[r][c];
  const v = el && el.value ? parseInt(el.value,10) : 0;
  return v || 0;
}

function isCorrect(){
  // compare to SOL
  for (let r=0;r<9;r++){
    for (let c=0;c<9;c++){
      const v = getVal(r,c);
      if (v !== SOL[r][c]) return false;
    }
  }
  return true;
}

function markErrors(){
  for (let r=0;r<9;r++){
    for (let c=0;c<9;c++){
      if (PUZZLE[r][c]===0){
        const cell = grid.children[r*9+c];
        const v = getVal(r,c);
        if (v && v !== SOL[r][c]) cell.classList.add('error');
      }
    }
  }
}

checkBtn.addEventListener('click', ()=>{
  clearMarks();
  if (!isComplete()){
    statusEl.textContent = 'Not finished yet… 🦇';
    return;
  }
  if (isCorrect()){
    revealSuccess();
  } else {
    markErrors();
    statusEl.textContent = 'Not quite — red cells are wrong. 🕸️';
  }
});

hintBtn.addEventListener('click', ()=>{
  // fill 1 random empty cell with the correct value
  const empties = [];
  for (let r=0;r<9;r++) for (let c=0;c<9;c++)
    if (PUZZLE[r][c]===0 && !getVal(r,c)) empties.push([r,c]);
  if (!empties.length) return;
  const [r,c] = empties[Math.floor(Math.random()*empties.length)];
  inputs[r][c].value = String(SOL[r][c]);
  inputs[r][c].parentElement.classList.add('valid');
  statusEl.textContent = 'Hint placed. 🕯️';
  if (isComplete() && isCorrect()) revealSuccess();
});

// Success dialog
function revealSuccess(){
  statusEl.textContent = 'Perfect! 🎃';
  successDlg.showModal();
}
copyBtn.addEventListener('click', async ()=>{
  try{
    await navigator.clipboard.writeText(codeField.value);
    copyBtn.textContent = 'Copied!';
    setTimeout(()=>copyBtn.textContent='Copy code',900);
  }catch{}
});
okBtn.addEventListener('click', ()=> successDlg.close());

// Init
buildGrid();
