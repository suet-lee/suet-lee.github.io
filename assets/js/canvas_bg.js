var canvas = document.querySelector("#canvas-bg")
var ctx = canvas.getContext('2d');

// Recursive function to draw branches
function drawBranch(x, y, length, angle, depth) {
if (depth === 0) return;

const newX = x + Math.cos(angle) * length;
const newY = y + Math.sin(angle) * length;

ctx.beginPath();
ctx.moveTo(x, y);
ctx.lineTo(newX, newY);
ctx.strokeStyle = 'green';
ctx.lineWidth = depth;
ctx.stroke();

// Recursively draw the child branches
drawBranch(newX, newY, length * 0.7, angle - 0.3, depth - 1);
drawBranch(newX, newY, length * 0.7, angle + 0.3, depth - 1);
}

// Start drawing the plant
const startX = canvas.width / 2;
const startY = canvas.height;
const initialLength = 100;
const initialAngle = -Math.PI / 2;
const initialDepth = 8;

drawBranch(startX, startY, initialLength, initialAngle, initialDepth)


// G = {
//     nodes: 5,
//     canvas_w: 100,
//     canvas_h: 100,
//     iteration: 0,
//     max_iteration: 100000,
//     active_nodes: []
// }

// function resizeCanvas()
// {
//     var canvas = document.querySelector("#canvas-bg")   // Get access to HTML canvas element
//     var ctx = canvas.getContext("2d")
//     G.canvas_w = canvas.width = window.innerWidth
//     G.canvas_h = canvas.height = window.innerHeight
// }

// // Randomly initialise active nodes
// function initNodes()
// {
//     for (i)
//     Math.random()
//     G.canvas_w
// }

// function drawFrame()
// {

// }


// resizeCanvas()
// initNodes()
// interval = window.setInterval(function(){
    
//     G.i += 1
//     if (G.i >= G.max_i) {
//         clearInterval(interval)
//     }
    
//     drawFrame()
    
// }, 5);       
