const canvas = document.getElementById('paintCanvas');
const context = canvas.getContext('2d');
let points = [];

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
    context.fillStyle = "#ffffff"
    context.fillRect(0, 0, canvas.width, canvas.height);
}
/*
function distance(pointA, pointB) {
    const dx = pointA.x - pointB.x;
    const dy = pointA.y - pointB.y;
    return Math.sqrt(dx * dx + dy * dy);
}

function chooseCentroids(points, amount) {
    const centroids = [];
    for (let i = 0; i < amount; i++)
    {
        centroids.push(points[Math.floor(Math.random() * points.length)]);   
    }
    return centroids;
}

kMeanClusterization(points, amount)
{
    let centroids = chooseCentroids(points, amount)
    let clusters = [];
    for (let i = 0; i < 100; i++)
    {
        for (let k = 0; k < amount; k++)
        {
            clusters[k] = [];    
        }
        
        for (let j = 0; j < points.length; j++)
        {
            let minDistance = Infinity;
            let closestCluster = null;
            for (let n = 0; n < amount; n++) {
                const distance = distance(centroids[n], points[j]);

                if (distance < minDistance) {
                    minDistance = distance;
                    closestCluster = j
                }
            }
            clusters[closestCluster].push(points[i]);
        }

        let newCentroids = [];
        for (let m = 0; m < amount; i++) {
        if (clusters[i].length > 0) {
            const sumX = clusters[i].reduce((acc, point) => acc + point.x, 0);
            const sumY = clusters[i].reduce((acc, point) => acc + point.y, 0);
            const centroidX = sumX / clusters[i].length;
            const centroidY = sumY / clusters[i].length;
            newCentroids.push({ x: centroidX, y: centroidY });
        }
         else {
            newCentroids.push(centroids[i]);
        }
        }
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
        context.fillRect(clusters[1][i].x, clusters[1][i].y, 5, 5);
    }
}*/
