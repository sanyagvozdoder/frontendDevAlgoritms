const canvas = document.getElementById('paintCanvas');
const context = canvas.getContext('2d');
let points = [];

function distance(pointA, pointB) {
    const dx = pointA.x - pointB.x;
    const dy = pointA.y - pointB.y;
    return Math.sqrt(dx * dx + dy * dy);
}

function draw(event) {
    const x = event.clientX - canvas.offsetLeft;
    const y = event.clientY - canvas.offsetTop;
    points.push({ x, y });
    
    context.fillStyle = "#8c35c5";
    context.fillRect(x, y, 5, 5 );

}
canvas.addEventListener('click', draw);

function clear(context)
{
    points = []
    context.fillStyle = "white"
    context.fillRect(0, 0, canvas.width, canvas.height);
}


function chooseCentroids(points, amount) {
    const centroids = [];
    for (let i = 0; i < amount; i++)
    {
        centroids.push(points[Math.floor(Math.random() * points.length)]);   
    }
    return centroids;
}

function kMeanClusterization(points, amount)
{
    let centroids = chooseCentroids(points, amount)
    let clusters = [];

    for(let i = 0; i < amount; ++i){
        clusters.push([])
    }

    for (let i = 0; i < 100 ; i++)
    {
        for (let k = 0; k < amount; k++)
        {
            clusters[k] = [];    
        }
        
        for (let j = 0; j < points.length; j++)
        {
            let minDistance = Infinity;
            let closestCluster = 0;
            for (let n = 0; n < amount; n++) {
                const dist = distance(centroids[n], points[j]);

                if (dist < minDistance) {
                    minDistance = dist;
                    closestCluster = n;
                }
            }
            clusters[closestCluster].push(points[j]);
        }

        let newCentroids = [];
        for (let m = 0; m < amount; m++)
        {
            if (clusters[m].length > 0) 
            {
                const sumX = clusters[m].reduce((acc, point) => acc + point.x, 0);
                const sumY = clusters[m].reduce((acc, point) => acc + point.y, 0);
                const centroidX = sumX / clusters[m].length;
                const centroidY = sumY / clusters[m].length;
                newCentroids.push({ x: centroidX, y: centroidY });
            }
            else {
                newCentroids.push(centroids[m]);
            }
        }

        centroids = newCentroids;

    }
    return clusters;
}

function kMeanClusterizationOnCanvas(points, context)
{
    
    let clusters = kMeanClusterization(points, 3);


    for (let i = 0; i < clusters[0].length; i++)
    {
        context.fillStyle = 'purple';
        context.fillRect(clusters[0][i].x, clusters[0][i].y, 5, 5);
    }
    for (let i = 0; i < clusters[1].length; i++)
    {
        context.fillStyle = 'red';
        context.fillRect(clusters[1][i].x, clusters[1][i].y, 5, 5);
    }
    for (let i = 0; i < clusters[2].length; i++)
    {
        context.fillStyle = 'green';
        context.fillRect(clusters[2][i].x, clusters[2][i].y, 5, 5);
    }
}

function hierarchicalCusterization(points, amount)
{
    let clusters = points.map(points => [points]);
    while (clusters.length != amount) 
    {
        let dist = [];
        for (let i = 0; i < clusters.length; i++)
        {
            for (let j = i + 1; j < clusters.length; j++)
            {
                let distanciya = Math.min(...clusters[i].map(pointA => Math.min(...clusters[j].map(pointB => distance(pointA, pointB)))));
                dist.push({i, j, distanciya});
            }
        }

        let minDist = Math.min(...dist.map(dt => dt.distanciya));

        let newClusters = dist.filter(k => k.distanciya == minDist)[0];
        let newCluster = [...clusters[newClusters.i], ...clusters[newClusters.j]];

        clusters.splice(newClusters.j, 1);
        clusters.splice(newClusters.i, 1);

        clusters.push(newCluster);
    }

    return clusters;
}

function hierarchicalCusterizationOnCanvas(points, context)
{
    
    let clusters = hierarchicalCusterization(points, 3);


    for (let i = 0; i < clusters[0].length; i++)
    {
        context.fillStyle = 'blue';
        context.fillRect(clusters[0][i].x, clusters[0][i].y, 3, 3);
    }
    for (let i = 0; i < clusters[1].length; i++)
    {
        context.fillStyle = 'yellow';
        context.fillRect(clusters[1][i].x, clusters[1][i].y, 3, 3);
    }
    for (let i = 0; i < clusters[2].length; i++)
    {
        context.fillStyle = 'pink';
        context.fillRect(clusters[2][i].x, clusters[2][i].y, 3, 3);
    }
}

document.getElementById("algos").addEventListener('click', ()=>{kMeanClusterizationOnCanvas(points, context)});
document.getElementById("algos2").addEventListener('click', ()=>{hierarchicalCusterizationOnCanvas(points, context)});

document.getElementById("goslingCSS").addEventListener('click', () => { clear(context) });
