// ----------------------------------------------
// 1. Canvas Setup & Basic Variables
// ----------------------------------------------
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Score tracking
let score = 0;
const scoreDisplay = document.getElementById('scoreDisplay');

// Audio for success
const successAudio = new Audio('assets/sounds/ding.mp3');

// We'll hold multiple shape objects in an array
let shapes = [];
let currentShape = null;
let offsetX = 0;
let offsetY = 0;

// Distance threshold for snapping
const SNAP_THRESHOLD = 30;

// ----------------------------------------------
// 2. Define Our Shapes
// ----------------------------------------------
function createShapes() {
  // Circle config
  shapes.push({
    type: 'circle',
    x: 120, y: 100,
    radius: 40,
    color: 'red',
    targetX: 600, targetY: 100,
    isDragging: false,
    isPlaced: false // track if shape is already placed
  });

  // Square config
  shapes.push({
    type: 'square',
    x: 120, y: 200,
    size: 70,
    color: 'blue',
    targetX: 580, targetY: 220,
    isDragging: false,
    isPlaced: false
  });

  // Triangle config
  // We'll approximate a triangle by storing a bounding radius,
  // or you can store coordinates for a more accurate hit-test.
  shapes.push({
    type: 'triangle',
    x: 120, y: 300,
    size: 60,  // bounding circle radius
    color: 'green',
    targetX: 600, targetY: 320,
    isDragging: false,
    isPlaced: false
  });
}

// ----------------------------------------------
// 3. Drawing Function
// ----------------------------------------------
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw target outlines
  shapes.forEach(shape => {
    ctx.save();
    ctx.strokeStyle = 'gray';
    ctx.lineWidth = 3;
    ctx.beginPath();

    if (shape.type === 'circle') {
      ctx.arc(shape.targetX, shape.targetY, shape.radius, 0, Math.PI * 2);
    } else if (shape.type === 'square') {
      const half = shape.size / 2;
      ctx.rect(shape.targetX - half, shape.targetY - half, shape.size, shape.size);
    } else if (shape.type === 'triangle') {
      // Outline for triangle (equilateral)
      const half = shape.size / 2;
      ctx.moveTo(shape.targetX, shape.targetY - shape.size);
      ctx.lineTo(shape.targetX - half, shape.targetY);
      ctx.lineTo(shape.targetX + half, shape.targetY);
      ctx.closePath();
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
      const half = shape.size / 2;
      ctx.rect(shape.x - half, shape.y - half, shape.size, shape.size);
    } else if (shape.type === 'triangle') {
      // We'll draw an equilateral triangle
      const half = shape.size / 2;
      ctx.moveTo(shape.x, shape.y - shape.size);
      ctx.lineTo(shape.x - half, shape.y);
      ctx.lineTo(shape.x + half, shape.y);
      ctx.closePath();
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

  for (let shape of shapes) {
    if (isMouseOverShape(mouseX, mouseY, shape) && !shape.isPlaced) {
      currentShape = shape;
      shape.isDragging = true;

      // Calculate offsets to avoid jump
      offsetX = mouseX - shape.x;
      offsetY = mouseY - shape.y;
      break;
    }
  }
}

function onMouseMove(e) {
  if (currentShape && currentShape.isDragging) {
    const { offsetX: mouseX, offsetY: mouseY } = e;
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
  } else if (shape.type === 'square') {
    const half = shape.size / 2;
    return (mx > shape.x - half &&
            mx < shape.x + half &&
            my > shape.y - half &&
            my < shape.y + half);
  } else if (shape.type === 'triangle') {
    // Simplify by using bounding circle for hit-test
    const dist = Math.sqrt((mx - shape.x) ** 2 + (my - shape.y) ** 2);
    return dist < shape.size;
  }
}

function checkPlacement(shape) {
  // Distance to target
  let dist = Math.sqrt((shape.x - shape.targetX) ** 2 + (shape.y - shape.targetY) ** 2);

  if (dist < SNAP_THRESHOLD) {
    // Snap to correct spot
    shape.x = shape.targetX;
    shape.y = shape.targetY;
    shape.isPlaced = true;

    // Increase score ONLY if shape wasn't placed before
    // (If you want repeated placements to count, remove `isPlaced` logic)
    score += 10;
    updateScoreDisplay();

    // Play success sound
    successAudio.currentTime = 0;
    successAudio.play().catch(() => {
      // Catch error if browser blocks autoplay
    });
  }
}

function updateScoreDisplay() {
  scoreDisplay.innerText = score;
}

// Reset shapes to their initial positions (keep existing score)
function resetShapes() {
  shapes = [];
  createShapes();
  draw();
}

// Clear score to 0, then reset shapes
function clearScore() {
  score = 0;
  updateScoreDisplay();
  resetShapes();
}

// ----------------------------------------------
// 6. Initialization
// ----------------------------------------------
function init() {
  createShapes();
  draw();

  // Attach event listeners
  canvas.addEventListener('mousedown', onMouseDown);
  canvas.addEventListener('mousemove', onMouseMove);
  canvas.addEventListener('mouseup', onMouseUp);

  // Button events
  document.getElementById('resetBtn').addEventListener('click', resetShapes);
  document.getElementById('clearScoreBtn').addEventListener('click', clearScore);
}

// Start the game
init();
