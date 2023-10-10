G = {
    node_size: 10,
    canvas_w: 100,
    canvas_h: 100,
    grid: [],
    nodes_x: 10,
    nodes_y: 10
}

function resizeCanvas()
{
    var canvas = document.querySelector("#canvas-bg")   // Get access to HTML canvas element
    var ctx = canvas.getContext("2d")
    G.canvas_w = canvas.width = window.innerWidth
    G.canvas_h = canvas.height = window.innerHeight
}

function initGrid()
{
    
}

// Randomly initialise active nodes
function initActive()
{
    window.innerWidth
    window.innerHeight
}

function drawFrame()
{

}

interval = window.setInterval(function(){
    
    G.i += 1
    if (G.i >= G.max_i) {
        clearInterval(interval)
    }
    
    drawFrame()
    
}, 5);       
