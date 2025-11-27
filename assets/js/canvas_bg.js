loadScript = function() {

    G = {
        max_sources: 1,
        canvas_w: 100, // Default - updated in resizeCanvas
        canvas_h: 100,
        iteration: 0,
        max_iteration: 5000,
        growth_rate: 10, // Number of nodes to grow each iteration
        p_branch: 0.07, // Probability of a new branching node
        active_nodes: [], // List of coords of active nodes
        growth_angle: [], // List of the growth angle of nodes
        max_energy: 10,
        energy: [], // Key is string formatted coords, value is the energy level
        canvas: null,
        ctx: null,
        draw_nodes: []
    }

    B = {
        w: [-1, 2, 2, 3, 3, 4, 4, 5, 6, 6, 8],
        l: [-1, 15, 14, 12, 10, 7, 5, 4, 3, 2, 1]
    }

    function resizeCanvas()
    {
        G.canvas = document.querySelector("#canvas-bg")   // Get access to HTML canvas element
        G.ctx = G.canvas.getContext("2d")
        G.canvas_w = G.canvas.width = window.innerWidth
        G.canvas_h = G.canvas.height = window.innerHeight
    }

    function getRandom(min, max) {
        return Math.random() * (max-min) + min
    }

    function getRandomInt(min, max) {
        return Math.floor(getRandom(min, max));
    }

    // function compDist(x1, y1, x2, y2)
    // {
    //     return Math.sqrt( (y2-y1)*(y2-y1) + (x2-x1)*(x2-x1) )
    // }

    // function compAngle(x1, y1, x2, y2) {
    //     // Calculate the difference in coordinates
    //     const dx = x2 - x1;
    //     const dy = y2 - y1;
      
    //     // Use Math.atan2 to find the angle in radians
    //     const angleRad = Math.atan2(dy, dx);
    //     return angleRad

    //     // Convert radians to degrees if needed
    //     // const angleDeg = (angleRad * 180) / Math.PI;
      
    //     // return angleDeg;
    // }

    // Randomly initialise active nodes
    function initNodes()
    {
        // Generate sources
        for (i=0; i<G.max_sources; i++)
        {
            seed_x = getRandomInt(G.canvas_w*0.6, G.canvas_w*0.8) // getRandomInt(G.canvas_w/2-100, G.canvas_w/2+100) // 100 margin
            seed_y = G.canvas_h//getRandomInt(G.canvas_h/2-100,G.canvas_h/2+100)
            G.active_nodes.push([seed_x,seed_y])
            G.energy.push(G.max_energy)
            // G.growth_angle.push(getRandom(0,Math.PI*2))
            G.growth_angle.push(getRandom(-Math.PI/8,-Math.PI*7/8))
            G.draw_nodes.push([seed_x, seed_y, B.w[G.max_energy]])
        }
    }

    // Bias away from walls
    function genGrowthAngle(x, y, current_angle)
    {
        // if (x<-100)
        // {
        //     return getRandom(-3*Math.PI/8,3*Math.PI/8)
        // }

        // if (x>G.canvas_w+100)
        // {
        //     return getRandom(9*Math.PI/8,5*Math.PI/8)
        // }

        // if (y<-100)
        // {
        //     return getRandom(3*Math.PI/8,5*Math.PI/8)
        // }

        // if (y>G.canvas_h+100)
        // {
        //     return getRandom(-3*Math.PI/8,-9*Math.PI/8)
        // }
        
        return current_angle + getRandom(-Math.PI/9,Math.PI/9)
    }

    function growNodes()
    {
        // Loop over current active nodes and grow according to growth rate
        active_nodes_store = []
        energy_store = []
        growth_angle_store = []
        count = 0
        for (const [key, value] of Object.entries(G.active_nodes)) {

            e = G.energy[key]
            ang = G.growth_angle[key]

            p = getRandom(0,1)
            if (p > 0.6 || count >= G.growth_rate)
            {
                // Skip growth this iteration, store for later
                active_nodes_store.push(value)
                energy_store.push(e)
                growth_angle_store.push(ang)
                continue
            }

            // Grow the node along the angle of growth
            // The length and width according to the energy at the node

            grow_l = B.l[Math.ceil(e)]
            grow_w = B.w[Math.ceil(e)]

            x0 = value[0]
            y0 = value[1]
            for (i=0; i<grow_l; i++)
            {
                x1 = x0 + grow_w*0.5*Math.cos(ang)
                y1 = y0 + grow_w*0.5*Math.sin(ang)
                G.draw_nodes.push([x1,y1,grow_w,e])
                x0 = x1
                y0 = y1
                
                p = getRandom(0,1)
                if (p < G.p_branch)
                {
                    branch_ang = ang + getRandom(-Math.PI/9,Math.PI/9)
                    active_nodes_store.push([x0,y1])
                    energy_store.push(G.max_energy)
                    growth_angle_store.push(branch_ang)
                }
            }

            // If energy >=2, add final point to active nodes
            // Otherwise, the node stops growing
            if (e == 1)
            {
                continue
            }

            new_e = e-0.1
            new_ang = genGrowthAngle(x0,y0,ang)//ang + getRandom(-Math.PI/9,Math.PI/9)
            
            active_nodes_store.push([x0,y0])
            energy_store.push(new_e)
            growth_angle_store.push(new_ang)
            count++
            continue
        }

        G.active_nodes = active_nodes_store
        G.energy = energy_store
        G.growth_angle = growth_angle_store
    }

    function genRGBA(energy)
    {
        max_opacity = 0.7
        min_opacity = 0.05
        // What proportion of max is the current energy:
        d_energy = energy/G.max_energy
        cur_opacity = d_energy*(max_opacity-min_opacity) + min_opacity
        // return "rgba(158, 8, 93, "+String(cur_opacity)+")"

        red_max = 180
        red_min = 120
        red = parseInt((red_max-red_min)*(1-d_energy) + red_min)

        time_elapsed = Math.min(G.iteration,1200)/1200//G.max_iteration
        green_max = 220
        green_min = 120
        green = parseInt((green_max-green_min)*time_elapsed + green_min)
        
        // blue_max = 110
        // blue_min = 100
        blue = 113 //parseInt((green_max-green_min)*time_elapsed + green_min)
        
        return "rgba("+red+", "+green+", "+blue+", "+String(cur_opacity)+")"
        // return "rgba("+red+", 217, 113, "+String(cur_opacity)+")"
    }

    function drawNode(x, y, r, energy)
    {
        G.ctx.beginPath()
        G.ctx.fillStyle = genRGBA(energy*0.2)
        G.ctx.arc(x, y, r, 0, Math.PI * 2);
        G.ctx.fill()
        G.ctx.closePath()
        G.ctx.beginPath()
        G.ctx.fillStyle = genRGBA(energy)
        G.ctx.arc(x, y, r*0.3, 0, Math.PI * 2);
        G.ctx.fill()
        G.ctx.closePath()
    }

    function drawFrame()
    {
        // Draw all nodes in G.draw_nodes - nodes are added when growNodes is called
        for (const [key, value] of Object.entries(G.draw_nodes)) {
            drawNode(value[0], value[1], value[2], value[3])
        }

        // Reset
        G.draw_nodes = []
    }


    resizeCanvas()
    initNodes()

    // Draw seed
    drawFrame()

    pause = 0
    interval = window.setInterval(function(){
        
        if (pause)
        {
            return
        }

        G.iteration += 1
        
        if (G.iteration >= G.max_iteration) {
            console.log('break')
            clearInterval(interval)
        }

        growNodes()
        drawFrame()
        
    }, 50);

    $(".play-pause").click(function(){
        pause = (pause+1)%2
        $(".play-pause").toggleClass("pause")
    });

    return interval
}

$(function(){
    interval = loadScript()
    $(".restart").click(function(){
        clearInterval(interval)
        $(".play-pause").removeClass("pause")
        interval = loadScript()
    })
});

var canVibrate = "vibrate" in navigator || "mozVibrate" in navigator;
if (canVibrate && !("vibrate" in navigator))
{
    navigator.vibrate = navigator.mozVibrate;
}
navigator.vibrate(222);
// $(document).on('click', '.answer', function (eve) {
//     $this = $(this);

    
// }