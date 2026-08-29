const fs = require('fs');

// Read the current index.html to extract the images
const indexHTML = fs.readFileSync('index.html', 'utf8');

// Regex to extract all img paths
const imgRegex = /<img src="([^"]+)"/g;
let match;
let images = [];
while ((match = imgRegex.exec(indexHTML)) !== null) {
  images.push(match[1]);
}

// Ensure unique images only
images = [...new Set(images)];

// Build the editor.html content
const editorHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Curation Editor | Miguel Madrigal</title>
  
  <link rel="stylesheet" href="styles/index.css">
  
  <style>
    body {
      background: #111;
      padding-top: 100px; /* space for the top bar */
    }
    
    .editor-topbar {
      position: fixed;
      top: 0; left: 0; right: 0;
      height: 80px;
      background: rgba(0,0,0,0.9);
      border-bottom: 1px solid #333;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 40px;
      z-index: 9999;
    }
    
    .editor-title {
      font-size: 1.2rem;
      font-weight: bold;
      color: #fff;
    }
    
    .export-btn {
      background: #fff;
      color: #000;
      border: none;
      padding: 10px 20px;
      font-size: 1rem;
      font-weight: 600;
      border-radius: 4px;
      cursor: pointer;
      transition: 0.2s ease;
    }
    
    .export-btn:hover {
      background: #ccc;
    }
    
    .editor-instructions {
      text-align: center;
      color: #888;
      margin-bottom: 30px;
      font-size: 0.9rem;
    }
    
    /* Make grid sortable */
    .sortable-grid {
      columns: 5;
      column-gap: 10px;
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 40px 80px;
    }
    
    .sortable-item {
      display: block;
      break-inside: avoid;
      margin-bottom: 10px;
      cursor: grab;
      position: relative;
    }
    
    .sortable-item:active {
      cursor: grabbing;
      opacity: 0.8;
      transform: scale(0.98);
    }
    
    .sortable-item img {
      width: 100%;
      height: auto;
      display: block;
      border-radius: 4px;
      pointer-events: none; /* prevents dragging the actual img element */
    }
    
    /* SortableJS Ghost styling */
    .sortable-ghost {
      opacity: 0.4;
      background: #333;
    }
  </style>
</head>
<body>

  <div class="editor-topbar">
    <div class="editor-title">Visual Layout Editor</div>
    <button class="export-btn" id="exportBtn">Export Curation</button>
  </div>
  
  <div class="editor-instructions">
    Click and drag the photos to change their order.<br>When you are finished, click the Export button and paste the result to your developer.
  </div>

  <div class="sortable-grid" id="photoGrid">
    ${images.map(img => \`<div class="sortable-item" data-id="\${img}"><img src="\${img}"></div>\`).join('\\n    ')}
  </div>

  <!-- SortableJS library -->
  <script src="https://cdn.jsdelivr.net/npm/sortablejs@latest/Sortable.min.js"></script>
  
  <script>
    // Initialize Sortable
    const grid = document.getElementById('photoGrid');
    const sortable = new Sortable(grid, {
      animation: 150,
      ghostClass: 'sortable-ghost',
      delay: 50, // slight delay helps distinguish drag from click
      delayOnTouchOnly: true
    });
    
    // Export Logic
    const exportBtn = document.getElementById('exportBtn');
    
    exportBtn.addEventListener('click', () => {
      // Get the current order of the data-id attributes
      const order = sortable.toArray();
      
      // Convert to JSON
      const json = JSON.stringify(order, null, 2);
      
      // Copy to clipboard
      navigator.clipboard.writeText(json).then(() => {
        const originalText = exportBtn.innerText;
        exportBtn.innerText = 'Copied to Clipboard!';
        exportBtn.style.background = '#4CAF50';
        exportBtn.style.color = '#fff';
        
        setTimeout(() => {
          exportBtn.innerText = originalText;
          exportBtn.style.background = '#fff';
          exportBtn.style.color = '#000';
        }, 3000);
      }).catch(err => {
        alert('Failed to copy. Please manually copy this text:\\n\\n' + json);
      });
    });
  </script>
</body>
</html>`;

fs.writeFileSync('editor.html', editorHTML);
console.log('editor.html generated successfully.');
