const inputs = ['name', 'class', 'level','hitpoints','armorclass'];
const boxes = ['inventory' ,'spells','backstory','attacks','weak-resist'];
const CHAR_KEY = 'characterList';
let currentChar = null;

// Load character list
function loadCharacterList() {
  const select = document.getElementById('charSelect');
  const characters = JSON.parse(localStorage.getItem(CHAR_KEY)) || [];
  select.innerHTML = '';
  characters.forEach(char => {
    const option = document.createElement('option');
    option.value = char;
    option.textContent = char;
    select.appendChild(option);
  });
  if (characters.length > 0) {
    select.value = characters[0];
    currentChar = characters[0];
    loadCharacter(currentChar);
  }



  function loadSelectedCharacter() {
  const selected = document.getElementById('charSelect').value;
  if (!selected) return alert('Select a character to load.');
  saveToLocalStorage(); // save current before switching
  currentChar = selected;
  loadCharacter(currentChar);
}
}

// Create new character
function createCharacter() {
  const name = document.getElementById('newCharName').value.trim();
  if (!name) return alert('Enter a name!');
  const characters = JSON.parse(localStorage.getItem(CHAR_KEY)) || [];
  if (characters.includes(name)) return alert('Character already exists!');
  characters.unshift(name);
  localStorage.setItem(CHAR_KEY, JSON.stringify(characters));
  currentChar = name;
  saveToLocalStorage();
  loadCharacterList();
  document.getElementById('newCharName').value = '';
}

// Delete character
function deleteCharacter() {
  if (!currentChar) return;
  const characters = JSON.parse(localStorage.getItem(CHAR_KEY)) || [];
  const index = characters.indexOf(currentChar);
  if (index !== -1) characters.splice(index, 1);
  localStorage.setItem(CHAR_KEY, JSON.stringify(characters));
  localStorage.removeItem('char_' + currentChar);
  loadCharacterList();
}

// Switch character
document.getElementById('charSelect').addEventListener('change', function () {
  saveToLocalStorage(); // save current before switching
  currentChar = this.value;
  loadCharacter(currentChar);
});

// Save and Load Functions
function saveToLocalStorage() {
  if (!currentChar) return;
  const data = {};
  inputs.forEach(id => {
    data[id] = document.getElementById(id).value;
  });
  boxes.forEach(id => {
    const el = document.getElementById(id);
    data[id] = {
      content: el.innerText,
      top: el.style.top,
      left: el.style.left,
      width: el.style.width,
      height: el.style.height
    };
  });
  localStorage.setItem('char_' + currentChar, JSON.stringify(data));
}

function loadCharacter(name) {
  const data = JSON.parse(localStorage.getItem('char_' + name));
  if (!data) return;

  inputs.forEach(id => {
    document.getElementById(id).value = data[id] || '';
  });

  boxes.forEach(id => {
    const el = document.getElementById(id);
    const box = data[id];
    if (box) {
      el.innerText = box.content || '';
      el.style.top = box.top || '0px';
      el.style.left = box.left || '0px';
      el.style.width = box.width || '250px';
      el.style.height = box.height || '150px';
    }
  });
}

// Existing dragging + input listeners
boxes.forEach(id => {
  const el = document.getElementById(id);
  el.onmousedown = function (e) {
    if (e.target !== el) return;
    let shiftX = e.clientX - el.getBoundingClientRect().left;
    let shiftY = e.clientY - el.getBoundingClientRect().top;

    function moveAt(pageX, pageY) {
      el.style.left = pageX - shiftX + 'px';
      el.style.top = pageY - shiftY + 'px';
    }

    function onMouseMove(e) {
      moveAt(e.pageX, e.pageY);
    }

    document.addEventListener('mousemove', onMouseMove);

    el.onmouseup = function () {
      document.removeEventListener('mousemove', onMouseMove);
      el.onmouseup = null;
      saveToLocalStorage();
    };
  };

  el.ondragstart = () => false;
  el.addEventListener('input', saveToLocalStorage);
});

inputs.forEach(id => {
  document.getElementById(id).addEventListener('input', saveToLocalStorage);
});

// Export / Import
function downloadCharacter() {
  if (!currentChar) return;
  const data = JSON.parse(localStorage.getItem('char_' + currentChar));
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${data.name || 'character'}.json`;
  a.click();
}

document.getElementById('upload').addEventListener('change', function (e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (event) {
    try {
      const data = JSON.parse(event.target.result);
      const name = data.name || prompt('Enter a name for this character:');
      if (!name) return;
      currentChar = name;
      let list = JSON.parse(localStorage.getItem(CHAR_KEY)) || [];
      if (!list.includes(name)) list.unshift(name);
      localStorage.setItem(CHAR_KEY, JSON.stringify(list));
      localStorage.setItem('char_' + name, JSON.stringify(data));
      loadCharacterList();
    } catch (err) {
      alert('Invalid JSON file.');
    }
  };
  reader.readAsText(file);
});

// On page load
loadCharacterList();