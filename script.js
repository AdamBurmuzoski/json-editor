let originalJson; // Store the original JSON object

function uploadFile() {
  const fileInput = document.getElementById('fileInput');
  const file = fileInput.files[0];
  const reader = new FileReader();
  originalFileName = file.name;

  document.getElementById('spinner').style.display = 'block';

  reader.onload = function (event) {
    const fileContent = event.target.result;
    document.getElementById('jsonInput').value = fileContent;

    document.getElementById('spinner').style.display = 'none';
  };
  reader.readAsText(file);
}

function displayJsonTree(data, element, path = '') {
  if (typeof data === 'object' && !Array.isArray(data)) {
    const ul = document.createElement('ul');
    ul.dataset.type = 'object';
    ul.style.display = '';
    const icon = document.createElement('span');
    icon.textContent = '▾ ';
    icon.className = 'icon';
    icon.style.userSelect = 'none';
    icon.style.cursor = 'pointer';
    icon.addEventListener('click', () => {
      ul.style.display = ul.style.display === '' ? 'none' : '';
      icon.textContent = ul.style.display === '' ? '▾ ' : '▸ ';
    });

    for (const key in data) {
      const li = document.createElement('li');
      const keySpan = document.createElement('span');
      keySpan.textContent = `${key}: `;
      keySpan.className = 'key';
      li.appendChild(keySpan);
      displayJsonTree(data[key], li, path ? `${path}.${key}` : key);
      ul.appendChild(li);
    }

    element.appendChild(icon);
    element.appendChild(ul);
  } else if (Array.isArray(data)) {
    const ul = document.createElement('ul');
    ul.dataset.type = 'array';
    ul.style.display = '';
    const icon = document.createElement('span');
    icon.textContent = '▾ ';
    icon.className = 'icon';
    icon.style.userSelect = 'none';
    icon.style.cursor = 'pointer';
    icon.addEventListener('click', () => {
      ul.style.display = ul.style.display === '' ? 'none' : '';
      icon.textContent = ul.style.display === '' ? '▾ ' : '▸ ';
    });

    data.forEach((item, index) => {
      const li = document.createElement('li');
      displayJsonTree(item, li, `${path}[${index}]`);
      ul.appendChild(li);
    });

    element.appendChild(icon);
    element.appendChild(ul);
  } else {
    const span = document.createElement('span');
    span.textContent = data;
    span.className = 'value';
    span.dataset.path = path;
    span.addEventListener('click', () => makeValueEditable(span));
    element.appendChild(span);
  }
}

function convertToTree() {
  const jsonInput = document.getElementById('jsonInput').value;
  let json;
  try {
    json = JSON.parse(jsonInput);
  } catch (error) {
    console.error('Invalid JSON format:', error);
    return;
  }

  originalJson = JSON.parse(jsonInput);
  const jsonTree = document.getElementById('jsonTree');
  jsonTree.innerHTML = '';
  displayJsonTree(json, jsonTree);
}

function makeValueEditable(element) {
  const currentValue = element.textContent;
  const input = document.createElement('input');
  input.type = 'text';
  input.value = currentValue;
  input.className = 'value editable';

  const updateValue = () => {
    const newValue = input.value;
    const path = element.dataset.path;
    let obj = originalJson;
    const parts = path.split(/\.|\[|\]\./).filter(Boolean);
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i].includes(']') ? parseInt(parts[i]) : parts[i];
      obj = obj[part];
    }
    const lastPart = parts[parts.length - 1].includes(']') ? parseInt(parts[parts.length - 1]) : parts[parts.length - 1];
    obj[lastPart] = newValue;

    const span = document.createElement('span');
    span.textContent = newValue;
    span.className = 'value';
    span.dataset.path = element.dataset.path;
    span.addEventListener('click', () => makeValueEditable(span));
    input.parentNode.replaceChild(span, input);
  };

  input.addEventListener('blur', updateValue);
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      updateValue();
    }
  });

  element.parentNode.replaceChild(input, element);
  input.focus();
}

function downloadJSON() {
  const json = JSON.stringify(originalJson, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = originalFileName || 'modified.json';
  link.click();
}

class TypeWriter {
    constructor(txtElement, words, wait = 3000) {
      this.txtElement = txtElement;
      this.words = words;
      this.txt = '';
      this.wordIndex = 0;
      this.wait = parseInt(wait, 10);
      this.isDeleting = false;
      this.type();
    }
  
    type() {
      // Current index of word
      const current = this.wordIndex % this.words.length;
      // Get full text of current word
      const fullTxt = this.words[current];
  
      // Check if deleting
      if (this.isDeleting) {
        // Remove char
        this.txt = fullTxt.substring(0, this.txt.length - 1);
      } else {
        // Add char
        this.txt = fullTxt.substring(0, this.txt.length + 1);
      }
  
      // Insert txt into element
      this.txtElement.innerHTML = `<span class="txt">${this.txt}</span>`;
  
      // Initial type speed
      let typeSpeed = 300;
  
      if (this.isDeleting) {
        typeSpeed /= 2; // Slow down when deleting
      }
  
      // If word is complete
      if (!this.isDeleting && this.txt === fullTxt) {
        // Make pause at the end
        typeSpeed = this.wait;
        this.isDeleting = true;
      } else if (this.isDeleting && this.txt === '') {
        this.isDeleting = false;
        // Move to next word
        this.wordIndex++;
        // Pause before starting to type
        typeSpeed = 500;
      }
  
      setTimeout(() => this.type(), typeSpeed);
    }
  }
  
  // Initialize when the DOM is fully loaded
  document.addEventListener('DOMContentLoaded', init);
  
  function init() {
    const txtElement = document.querySelector('.txt-type');
    const words = JSON.parse(txtElement.getAttribute('data-words'));
    const wait = txtElement.getAttribute('data-wait');
    // Start the TypeWriter effect
    new TypeWriter(txtElement, words, wait);
  }
  