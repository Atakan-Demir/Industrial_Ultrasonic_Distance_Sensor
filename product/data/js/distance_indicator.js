export function updateDistanceIndicator(distance, minDis, maxDis) {

    const totalDistance = maxDis - minDis;
    const bar = document.querySelector('.bar');
    const indicator = document.querySelector('.indicator');
    const barContainer = document.querySelector('.bar-container');


    function updateGauge(x) {
        if (x < 0) x = 0;
        if (x > totalDistance) x = totalDistance;

        const percentage = (x / totalDistance) * 100;
        bar.style.width = percentage + '%';
        indicator.style.left = 'calc(' + percentage + '% - 15px)'; // 15px to center the object image
    }

    
    updateGauge(distance-minDis);
}