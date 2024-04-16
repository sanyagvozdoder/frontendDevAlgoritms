const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let cities = [];
let pheromones = [];
let ants = [];
let showAnts = true;
let stopped = false;

const numAnts = 50;
const alpha = 1;
const beta = 2;
const evaporationRate = 0.1;
const Q = 1;
const maxIterations = 10000;
let animating = false;

canvas.addEventListener('click', function(event) {
    if (!animating) {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        cities.push({ x: x, y: y });

        resetData();
    }
});


function initPheromones() {
    for (let i = 0; i < cities.length; i++) {
        pheromones.push(new Array(cities.length).fill(1));
    }
}


function resetData() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pheromones = [];
    initPheromones();
    ants = [];
    for (let i = 0; i < numAnts; i++) {
        ants.push({
            tour: [],
            tourLength: 0,
            visited: new Array(cities.length).fill(false),
            currentIndex: 0
        });
    }
    draw();
}


function addCity(x, y) {
    cities.push({ x: x, y: y });
}

function stop() {
    stopped = true;
}
function calculateDistance(city1, city2) {
    return Math.sqrt(Math.pow(city1.x - city2.x, 2) + Math.pow(city1.y - city2.y, 2));
}


function updatePheromones() {
    pheromones = pheromones.map(row => row.map(val => val * (1 - evaporationRate)));
    for (let ant of ants) {
        for (let i = 0; i < ant.tour.length - 1; i++) {
            const city1 = ant.tour[i];
            const city2 = ant.tour[i + 1];
            pheromones[city1][city2] += Q / ant.tourLength;
            pheromones[city2][city1] += Q / ant.tourLength;
        }
    }
}


function chooseNextCity(antIndex) {
    const ant = ants[antIndex];
    const currentCity = ant.tour.length === 0 ? 0 : ant.tour[ant.tour.length - 1];
    const unvisitedCities = ant.visited.map((visited, index) => visited ? -1 : index);
    const probabilities = unvisitedCities.map(city => {
        if (city === -1) return 0;
        const pheromone = Math.pow(pheromones[currentCity][city], alpha);
        const attractiveness = 1 / calculateDistance(cities[currentCity], cities[city]);
        return pheromone * attractiveness;
    });
    const sum = probabilities.reduce((a, b) => a + b, 0);
    const selectedCity = selectRandomWithProbability(probabilities, sum);
    ant.tour.push(selectedCity);
    ant.visited[selectedCity] = true;
    ant.tourLength += calculateDistance(cities[currentCity], cities[selectedCity]);
}

function selectRandomWithProbability(probabilities, sum) {
    const threshold = Math.random() * sum;
    let total = 0;
    for (let i = 0; i < probabilities.length; i++) {
        total += probabilities[i];
        if (total >= threshold) {
            return i;
        }
    }
}


function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'blue';
    cities.forEach((city) => {
        ctx.beginPath();
        ctx.arc(city.x, city.y, 5, 0, Math.PI * 2);
        ctx.fill();
    });

    if (showAnts) {
        ctx.strokeStyle = 'red';
        ants.forEach(ant => {
            ctx.beginPath();
            ant.tour.forEach(cityIndex => {
                const city = cities[cityIndex];
                ctx.lineTo(city.x, city.y);
            });
            ctx.stroke();

            for (let ant of ants) {
                ant.currentIndex = (ant.currentIndex + 1) % 100; 
            }
        });

        updatePheromones();
    }
}

async function antColonyOptimization() {
    animating = true;
    for (let iteration = 0; iteration < maxIterations; iteration++) {
        ants.forEach((ant, index) => {
            if (ant.tour.length <= cities.length) {
                chooseNextCity(index);
            } else {
                ant.tourLength += calculateDistance(cities[ant.tour[cities.length - 1]], cities[ant.tour[0]]);

                ants[index] = {
                    tour: [],
                    tourLength: 0,
                    visited: new Array(cities.length).fill(false),
                    currentIndex: 0
                };
            }
        });

        if (stopped)
        {
            stopped = false;
            return;
        }

        draw();
        await new Promise(resolve => setTimeout(resolve, parseInt(document.getElementById("speed").value)));
    }
    animating = false;
}

document.getElementById("goslingCSS").addEventListener('click', () => { antColonyOptimization() });
document.getElementById("stop").addEventListener('click', () => { stop() });
document.getElementById("speedUp").addEventListener('click', () => { speedUp() });
document.getElementById("slowDown").addEventListener('click', () => { slowedReverb() });

resetData();