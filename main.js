// ----------------------------------------------
// 1. Canvas Setup & Basic Variables
// ----------------------------------------------
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Audio for success (place your actual sound file in assets/sounds/ding.mp3)
const successAudio = new Audio('assets/sounds/ding.mp3');

// We'll have two shapes: a circle and a square
// Each shape has: type, x, y, color, targetX, targetY, etc.
let shapes = [];

// Current dragging info
let currentShape = null;
let offsetX = 0;
let offsetY = 0;

// Distance threshold for "correct placement"
const SNAP_THRESHOLD = 30;

// ----------------------------------------------
// 2. Define Our Shapes
// ----------------------------------------------
function createShapes() {
  // Circle config
  shapes.push({
    type: 'circle',
    x: 100, y: 100,        // starting position
    radius: 40,
    color: 'red',
    targetX: 600,          // correct spot
    targetY: 120,
    isDragging: false
  });

  // Square config
  shapes.push({
    type: 'square',
    x: 100, y: 250,        // starting position
    size: 70,
    color: 'blue',
    targetX: 580,          // correct spot
    targetY: 300,
    isDragging: false
  });
}

// ----------------------------------------------
// 3. Drawing Function
// ----------------------------------------------
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw target outlines (where shapes should be placed)
  shapes.forEach(shape => {
    ctx.save();
    ctx.strokeStyle = 'gray';
    ctx.lineWidth = 3;
    ctx.beginPath();
    if (shape.type === 'circle') {
      ctx.arc(shape.targetX, shape.targetY, shape.radius, 0, Math.PI * 2);
    } else if (shape.type === 'square') {
      ctx.rect(shape.targetX - shape.size / 2, shape.targetY - shape.size / 2, shape.size, shape.size);
    }
    ctx.stroke();
    ctx.restore();
  });

  // Draw actual shapes
  shapes.forEach(shape => {
    ctx.save();
    ctx.fillStyle = shape.color;
    ctx.beginPath();
    if (shape.type === 'circle') {
      ctx.arc(shape.x, shape.y, shape.radius, 0, Math.PI * 2);
    } else if (shape.type === 'square') {
      ctx.rect(shape.x - shape.size / 2, shape.y - shape.size / 2, shape.size, shape.size);
    }
    ctx.fill();
    ctx.restore();
  });
}

// ----------------------------------------------
// 4. Mouse Event Handlers
// ----------------------------------------------
function onMouseDown(e) {
  const { offsetX: mouseX, offsetY: mouseY } = e;
  
  // Check if we clicked on a shape
  for (let shape of shapes) {
    if (isMouseOverShape(mouseX, mouseY, shape)) {
      currentShape = shape;
      shape.isDragging = true;

      // Calculate offsets so shape doesn't jump to cursor center
      if (shape.type === 'circle') {
        offsetX = mouseX - shape.x;
        offsetY = mouseY - shape.y;
      } else {
        offsetX = mouseX - shape.x;
        offsetY = mouseY - shape.y;
      }
      break;
    }
  }
}

function onMouseMove(e) {
  if (currentShape && currentShape.isDragging) {
    const { offsetX: mouseX, offsetY: mouseY } = e;
    // Update shape position
    currentShape.x = mouseX - offsetX;
    currentShape.y = mouseY - offsetY;
    draw();
  }
}

function onMouseUp(e) {
  if (currentShape) {
    currentShape.isDragging = false;
    checkPlacement(currentShape);
    currentShape = null;
    draw();
  }
}

// ----------------------------------------------
// 5. Helper Functions
// ----------------------------------------------
function isMouseOverShape(mx, my, shape) {
  if (shape.type === 'circle') {
    const dist = Math.sqrt((mx - shape.x) ** 2 + (my - shape.y) ** 2);
    return dist < shape.radius;
  } else {
    // Square
    const half = shape.size / 2;
    return (mx > shape.x - half &&
            mx < shape.x + half &&
            my > shape.y - half &&
            my < shape.y + half);
  }
}

// Check if shape is close to its target
function checkPlacement(shape) {
  let dist;
  if (shape.type === 'circle') {
    dist = Math.sqrt((shape.x - shape.targetX) ** 2 + (shape.y - shape.targetY) ** 2);
  } else {
    // Square
    dist = Math.sqrt((shape.x - shape.targetX) ** 2 + (shape.y - shape.targetY) ** 2);
  }

  if (dist < SNAP_THRESHOLD) {
    // Snap to correct spot
    if (shape.type === 'circle') {
      shape.x = shape.targetX;
      shape.y = shape.targetY;
    } else {
      shape.x = shape.targetX;
      shape.y = shape.targetY;
    }

    // Play success sound
    successAudio.currentTime = 0; // rewind sound to start
    successAudio.play().catch(() => {
      /* Some browsers require user gesture to play audio */
    });
  }
}

// ----------------------------------------------
// 6. Initialization
// ----------------------------------------------
function init() {
  createShapes();
  draw();

  // Listen for mouse events on canvas
  canvas.addEventListener('mousedown', onMouseDown);
  canvas.addEventListener('mousemove', onMouseMove);
  canvas.addEventListener('mouseup', onMouseUp);
}

// Start the game
init();
