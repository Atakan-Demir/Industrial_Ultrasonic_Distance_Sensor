// bar.js
export function updateSegments(currentValues) {
    console.log("Current Values: " + JSON.stringify(currentValues));
    var totalUnits = 4000;
    var blackSegmentWidth = 30;

    var elmBlack = document.getElementById('black-segment');
    var elmGreen = document.getElementById('green-segment');
    var elmOffset = document.getElementById('offset-segment');

    elmBlack.style.width = (blackSegmentWidth / totalUnits * 100) + '%';

    var greenSegmentStart = currentValues.minDis / totalUnits * 100;
    var greenSegmentWidth = (currentValues.maxDis - currentValues.minDis) / totalUnits * 100;

    // offset'i kaldır
    currentValues.offset=0;
    if (currentValues.offset > 0) {
        var offsetStart = (currentValues.maxDis / totalUnits * 100);
        var offsetWidth = currentValues.percent * 100;

        elmOffset.style.left = offsetStart + '%';
        elmOffset.style.width = offsetWidth + '%';
        elmOffset.style.backgroundColor = '#FFB90F';

        console.log("Offset : " + offsetStart + " Offset Width : " + offsetWidth);
    } else {
        var offsetWidth = -currentValues.percent * 100;
        var offsetStart = (currentValues.maxDis / totalUnits * 100) - offsetWidth;
        console.log("Offset : " + offsetStart + " Offset Width : " + offsetWidth);
        elmOffset.style.left = offsetStart + '%';
        elmOffset.style.width = offsetWidth + '%';
        elmOffset.style.backgroundColor = '#e74a3b';
    }

    elmGreen.style.left = greenSegmentStart + '%';
    elmGreen.style.width = greenSegmentWidth + '%';
    elmGreen.innerText = "";
}
