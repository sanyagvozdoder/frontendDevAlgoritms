const canvas = document.getElementById('paintCanvas');
const context = canvas.getContext('2d');
let foodSources = [];
let antColonies  = [];
let walls = [];
let drCol = false;
let drWalls = false;
let drFood = false;



function draw(event)
{
    const x = event.clientX - canvas.offsetLeft;
    const y = event.clientY - canvas.offsetTop;
    if (drCol)
    {
        antColonies.push({ x, y });
    }
    else if (drWalls)
    {
        walls.push({ x, y });
    }
    else 
    {
        foodSources.push({ x, y });
    }
    
    context.fillRect(x, y, 15, 15);

}
canvas.addEventListener('click', draw);

function setWalls(context)
{
    drCol = false;
    drWalls = true;
    drFood = false;

    context.fillStyle = "grey";

}

function setColony(context)
{
    drCol = true;
    drWalls = false;
    drFood = false;

    context.fillStyle = "red";

}

function setFood(context)
{
    drCol = false;
    drWalls = false;
    drFood = true;

    context.fillStyle = "green";

}


function clear(context)
{
    foodSources = [];
    antColonies  = [];
    walls = [];
    context.fillStyle = "black"
    context.clearRect(0, 0, canvas.width, canvas.height);
}

document.getElementById("goslingCSS").addEventListener('click', () => { clear(context) });
document.getElementById("drawColonies").addEventListener('click', () => { setColony(context) });
document.getElementById("drawWalls").addEventListener('click', () => { setWalls(context) });
document.getElementById("drawFood").addEventListener('click', () => { setFood(context) });


