document.getElementById('plotForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const params = new URLSearchParams();
    for (const [key, value] of formData.entries()) {
        params.append(key, value);
    }

    // Create the plotResult div dynamically
    document.getElementById('plotResult').innerHTML = `
    <div class="images">
        <div class="image">
            <h2>Euler's Method</h2>
            <img id="eulerPlot" src="" alt="Euler Plot">
        </div>
        <div class="image">
            <h2>Kinetic Energy</h2>
            <img id="kinetic" src="" alt="Kinetic Energy Plot">
        </div>
        <div class="image">
            <h2>velocity</h2>
            <img id="velocity" src="" alt="velocity Plot">
        </div>
    </div>

    `;

    try {
        const response = await fetch('/plot', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params.toString(),
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        console.log(data); // Log the response data for debugging
        document.getElementById('eulerPlot').src = `data:image/png;base64,${data.euler}`;
        document.getElementById('kinetic').src = `data:image/png;base64,${data.kinetic}`;
        document.getElementById('velocity').src = `data:image/png;base64,${data.velocity}`;
    } catch (error) {
        console.error('Error loading plots:', error);
    }
});


// Canvas 
const canvas = document.getElementById('simulationCanvas');
const ctx = canvas.getContext('2d');
// Ball properties

let y, v, startTime;
let isBouncing = false;



// Make the canvas responsive
function resizeCanvas() {
    canvas.width = Math.min(window.innerWidth * 0.9, 400); 
    y0_graph = parseFloat(document.getElementById('y0').value);
    canvas.height = 400
}
function showBtns(){
    document.getElementById('btns').style.display="flex"
}
function disappearBtns(){
    document.getElementById('btns').style.display="none"
}









const scale = document.getElementById("ps").value; // 1 meter = user input pixels
console.log(scale)
const gravity = 9.81; // Acceleration due to gravity in m/s²
let ballRadius = 20; // Ball radius in pixels

function startSimulation(event) {
    event.preventDefault();
    resizeCanvas();
    showBtns();

    // Initialize variables (convert meters to pixels)
    let y0_meters = parseFloat(document.getElementById('y0').value); // Starting height in meters
    let v0_meters = parseFloat(document.getElementById('v0').value); // Initial velocity in m/s
    r = parseFloat(document.getElementById('r').value);              // Restitution coefficient
    dt = parseFloat(document.getElementById('dt').value);            // Time step in seconds
    time_limit = parseFloat(document.getElementById('time_limit').value); // Max simulation time in seconds

    // Convert to pixels
    y = canvas.height - y0_meters * scale;  // Starting height from the bottom of the canvas
    v = -v0_meters * scale;                 // Initial velocity (negative because it goes upward)

    startTime = Date.now();
    isBouncing = true;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    requestAnimationFrame(simulate);
}

function simulate() {
    if (!isBouncing) return;

    const elapsedTime = (Date.now() - startTime) / 1000;
    if (elapsedTime > time_limit) {
        isBouncing = false;
        return;
    }

    // Update position and velocity using Euler's method (convert gravity to pixels)
    y += v * dt;
    v += gravity * scale * dt; // Gravity in pixels per second squared

    // Check for collision with the ground
    if (y >= canvas.height - ballRadius) { //thid means that the ball touches the ground
        y = canvas.height - ballRadius;
        v = -v * r; // Reverse velocity and apply restitution

        if (Math.abs(v) < 0.5 * scale) {
            v = 0;
            isBouncing = false;
        }
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBall();
    drawTimer(elapsedTime);

    if (isBouncing) {
        requestAnimationFrame(simulate);
    }
}

function drawBall() {
    ctx.beginPath();
    ctx.arc(canvas.width / 2, y, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = 'red';
    ctx.fill();
    ctx.stroke();
}

function drawTimer(elapsedTime) {
    ctx.font = '20px Arial';
    ctx.fillStyle = 'blue';
    ctx.fillText(`Time: ${elapsedTime.toFixed(2)}s`, 10, 30);

    // Convert position and velocity back to meters for display
    let y_meters = ((canvas.height - y) / scale).toFixed(2);
    let v_meters = (-v / scale).toFixed(2);

    ctx.fillStyle = 'green';
    ctx.fillText(`Y: ${y_meters} m`, 10, 60);
    ctx.fillText(`V: ${v_meters} m/s`, 10, 90);
}




















// Event listeners
document.getElementById('plotForm').addEventListener('submit', startSimulation);
document.getElementById('btn').addEventListener('click', resizeCanvas);
window.addEventListener('resize', resizeCanvas);

// Initialize the canvas size on load
resizeCanvas();




function resetSimulation() {
    isBouncing = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    y = 0;
    v = 0;
    disappearBtns()
}
function pauseSimulation() {
    isBouncing = false;
}
function continueSimulation() {
    if (!isBouncing) {
        isBouncing = true;
        startTime = Date.now();
        requestAnimationFrame(simulate);
    }
}
document.getElementById('resetButton').addEventListener('click', resetSimulation);
document.getElementById('pauseButton').addEventListener('click', pauseSimulation);
document.getElementById('continueButton').addEventListener('click', continueSimulation);