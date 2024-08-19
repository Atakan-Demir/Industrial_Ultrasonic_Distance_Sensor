export function updateTransistorOutputBar(transistorValue, minDis = 30, maxDis = 4000, transX = 0, transY = 0) {
    const totalRange = 4000;
    const red_c = '#dc3545'
    const green_c = '#27a746'

    const bar1 = document.querySelector('.bar1');
    const bar2 = document.querySelector('.bar2');
    const bar3 = document.querySelector('.bar3');
    const bar4 = document.querySelector('.bar4');
    const bar5 = document.querySelector('.bar5');
    const bar6 = document.querySelector('.bar6');

    const barMarkMin = document.getElementById('bar-mark-min-t');
    const minMarkLabel = document.querySelector('#bar-mark-min-t .trans-mark-label');
    
    const barMarkMax = document.getElementById('bar-mark-max-t');
    const maxMarkLabel = document.querySelector('#bar-mark-max-t .trans-mark-label');

    const barMarkTransX = document.getElementById('bar-mark-trnx-t');
    const transXMarkLabel = document.querySelector('#bar-mark-trnx-t .trans-mark-label');

    const barMarkTransY = document.getElementById('bar-mark-trny-t');
    const transYMarkLabel = document.querySelector('#bar-mark-trny-t .trans-mark-label');



    bar1.style.width = '0%';
    bar2.style.width = '0%';
    bar3.style.width = '0%';
    bar4.style.width = '0%';
    bar5.style.width = '0%';
    bar6.style.width = '0%';

    // Helper function to set bar widths
    function setBarWidths(bar1Width, bar2Width, bar3Width, bar4Width, bar5Width, bar6Width) {
        bar1.style.width = bar1Width + '%';
        bar2.style.width = bar2Width + '%';
        bar3.style.width = bar3Width + '%';
        bar4.style.width = bar4Width + '%';
        bar5.style.width = bar5Width + '%';
        bar6.style.width = bar6Width + '%';
    }
    function setBarMarks(minDis, maxDis,transX,transY) {

        barMarkMin.style.right = (100 - (minDis / totalRange * 100)) + '%';
        minMarkLabel.innerText = minDis;

        barMarkMax.style.right = (100 - (maxDis / totalRange * 100)) + '%';
        maxMarkLabel.innerText = maxDis;

        
        barMarkTransX.style.right = (100 - (transX / totalRange * 100)) + '%';
        transXMarkLabel.innerText = transX;

        barMarkTransY.style.right = (100 - (transY / totalRange * 100)) + '%';
        transYMarkLabel.innerText = transY;

        if(transX==0){
            barMarkTransX.style.visibility = 'hidden';
        }else{
            barMarkTransX.style.visibility = 'visible';
        }
        if(transY==0){
            barMarkTransY.style.visibility = 'hidden';
        }else{
            barMarkTransY.style.visibility = 'visible';
        }
    }
    
    switch (transistorValue) {
        case "0":
            setBarMarks(minDis, maxDis,0,0);
            setBarWidths(30 / totalRange * 100, 100, 0, 0, 0, 0);
            // bar2 background color is red_c
            bar2.style.backgroundColor = red_c;
            break;
        case "1":
            setBarMarks(minDis, maxDis,0,0);
            setBarWidths(30 / totalRange * 100, (minDis - 30) / totalRange * 100, (totalRange-minDis)/totalRange*100, 0, 0,0);
            bar2.style.backgroundColor = red_c;
            bar3.style.backgroundColor = green_c;
            break;
        case "2":
            setBarMarks(minDis, maxDis,0,0);
            setBarWidths(30 / totalRange * 100, (minDis - 30) / totalRange * 100, (totalRange-minDis)/totalRange*100, 0, 0,0);
            bar2.style.backgroundColor = green_c;
            bar3.style.backgroundColor = red_c;
            break;
        case "3":
            setBarMarks(minDis, maxDis,0,0);
            setBarWidths(30 / totalRange * 100, (maxDis - 30) / totalRange * 100, (totalRange-maxDis)/totalRange*100, 0, 0,0);
            bar2.style.backgroundColor = red_c;
            bar3.style.backgroundColor = green_c;
            break;
        case "4":
            setBarMarks(minDis, maxDis,0,0);
            setBarWidths(30 / totalRange * 100, (maxDis - 30) / totalRange * 100, (totalRange-maxDis)/totalRange*100, 0, 0,0);
            bar2.style.backgroundColor = green_c;
            bar3.style.backgroundColor = red_c;
            break;
        case "5":
            setBarMarks(minDis, maxDis,0,0);
            setBarWidths(30 / totalRange * 100, (minDis - 30) / totalRange * 100, (maxDis - minDis) / totalRange * 100,((4000 - maxDis) / totalRange) * 100, 0,0);
           
            bar2.style.backgroundColor = red_c;
            bar3.style.backgroundColor = green_c;
            bar4.style.backgroundColor = red_c;
            break;
        case "6":
            setBarMarks(minDis, maxDis,transX,0);
            setBarWidths(30 / totalRange * 100, (transX - 30) / totalRange * 100, (maxDis - transX) / totalRange * 100,((4000 - maxDis) / totalRange) * 100, 0,0);
            bar2.style.backgroundColor = red_c;
            bar3.style.backgroundColor = green_c;
            bar4.style.backgroundColor = red_c;
            break;
        case "7":
            setBarMarks(minDis, maxDis,transX,0);
            setBarWidths(30 / totalRange * 100, (minDis - 30) / totalRange * 100, (transX - minDis) / totalRange * 100,((4000 - transX) / totalRange) * 100, 0,0);
            bar2.style.backgroundColor = red_c;
            bar3.style.backgroundColor = green_c;
            bar4.style.backgroundColor = red_c;
            break;
        case "8":
            setBarMarks(minDis, maxDis,transX,transY);
            setBarWidths(30 / totalRange * 100, (minDis - 30) / totalRange * 100,(transX - minDis) / totalRange * 100, (transY - transX) / totalRange * 100,(maxDis-transY)/totalRange*100,((4000 - maxDis) / totalRange) * 100);
            bar2.style.backgroundColor = red_c;
            bar3.style.backgroundColor = red_c;
            bar4.style.backgroundColor = green_c;
            bar5.style.backgroundColor = red_c;
            bar6.style.backgroundColor = red_c;
            break;
        case "9":
            setBarMarks(minDis, maxDis,transX,transY);
            setBarWidths(30 / totalRange * 100, (minDis - 30) / totalRange * 100,(transX - minDis) / totalRange * 100, (transY - transX) / totalRange * 100,(maxDis-transY)/totalRange*100,((4000 - maxDis) / totalRange) * 100);
            bar2.style.backgroundColor = red_c;
            bar3.style.backgroundColor = green_c;
            bar4.style.backgroundColor = red_c;
            bar5.style.backgroundColor = green_c;
            bar6.style.backgroundColor = red_c;
            break;
        default:
            break;

    }
}


export function updateRelayOutputBar(relayValue, minDis = 30, maxDis = 4000, relayX = 0, relayY = 0) {
    const totalRange = 4000;
    const red_c = '#dc3545'
    const green_c = '#27a746'

    const bar1 = document.querySelector('.rbar1');
    const bar2 = document.querySelector('.rbar2');
    const bar3 = document.querySelector('.rbar3');
    const bar4 = document.querySelector('.rbar4');
    const bar5 = document.querySelector('.rbar5');
    const bar6 = document.querySelector('.rbar6');

    const barMarkMin = document.getElementById('bar-mark-min-r');
    const minMarkLabel = document.querySelector('#bar-mark-min-r .relay-mark-label');
    
    const barMarkMax = document.getElementById('bar-mark-max-r');
    const maxMarkLabel = document.querySelector('#bar-mark-max-r .relay-mark-label');

    const barMarkTransX = document.getElementById('bar-mark-rlyx-r');
    const transXMarkLabel = document.querySelector('#bar-mark-rlyx-r .relay-mark-label');

    const barMarkTransY = document.getElementById('bar-mark-rlyy-r');
    const transYMarkLabel = document.querySelector('#bar-mark-rlyy-r .relay-mark-label');




    bar1.style.width = '0%';
    bar2.style.width = '0%';
    bar3.style.width = '0%';
    bar4.style.width = '0%';
    bar5.style.width = '0%';
    bar6.style.width = '0%';

    // Helper function to set bar widths
    function setBarWidths(bar1Width, bar2Width, bar3Width, bar4Width, bar5Width, bar6Width) {
        bar1.style.width = bar1Width + '%';
        bar2.style.width = bar2Width + '%';
        bar3.style.width = bar3Width + '%';
        bar4.style.width = bar4Width + '%';
        bar5.style.width = bar5Width + '%';
        bar6.style.width = bar6Width + '%';
    }
    function setBarMarks(minDis, maxDis,relayX,relayY) {

        barMarkMin.style.right = (100 - (minDis / totalRange * 100)) + '%';
        minMarkLabel.innerText = minDis;

        barMarkMax.style.right = (100 - (maxDis / totalRange * 100)) + '%';
        maxMarkLabel.innerText = maxDis;

        
        barMarkTransX.style.right = (100 - (relayX / totalRange * 100)) + '%';
        transXMarkLabel.innerText = relayX;

        barMarkTransY.style.right = (100 - (relayY / totalRange * 100)) + '%';
        transYMarkLabel.innerText = relayY;

        if(relayX==0){
            barMarkTransX.style.visibility = 'hidden';
        }else{
            barMarkTransX.style.visibility = 'visible';
        }
        if(relayY==0){
            barMarkTransY.style.visibility = 'hidden';
        }else{
            barMarkTransY.style.visibility = 'visible';
        }
    }
    
    switch (relayValue) {
        case "0":
            setBarMarks(minDis, maxDis,0,0);
            setBarWidths(30 / totalRange * 100, 100, 0, 0, 0, 0);
            // bar2 background color is red_c
            bar2.style.backgroundColor = red_c;
            break;
        case "1":
            setBarMarks(minDis, maxDis,0,0);
            setBarWidths(30 / totalRange * 100, (minDis - 30) / totalRange * 100, (totalRange-minDis)/totalRange*100, 0, 0,0);
            bar2.style.backgroundColor = red_c;
            bar3.style.backgroundColor = green_c;
            break;
        case "2":
            setBarMarks(minDis, maxDis,0,0);
            setBarWidths(30 / totalRange * 100, (minDis - 30) / totalRange * 100, (totalRange-minDis)/totalRange*100, 0, 0,0);
            bar2.style.backgroundColor = green_c;
            bar3.style.backgroundColor = red_c;
            break;
        case "3":
            setBarMarks(minDis, maxDis,0,0);
            setBarWidths(30 / totalRange * 100, (maxDis - 30) / totalRange * 100, (totalRange-maxDis)/totalRange*100, 0, 0,0);
            bar2.style.backgroundColor = red_c;
            bar3.style.backgroundColor = green_c;
            break;
        case "4":
            setBarMarks(minDis, maxDis,0,0);
            setBarWidths(30 / totalRange * 100, (maxDis - 30) / totalRange * 100, (totalRange-maxDis)/totalRange*100, 0, 0,0);
            bar2.style.backgroundColor = green_c;
            bar3.style.backgroundColor = red_c;
            break;
        case "5":
            setBarMarks(minDis, maxDis,0,0);
            setBarWidths(30 / totalRange * 100, (minDis - 30) / totalRange * 100, (maxDis - minDis) / totalRange * 100,((4000 - maxDis) / totalRange) * 100, 0,0);
           
            bar2.style.backgroundColor = red_c;
            bar3.style.backgroundColor = green_c;
            bar4.style.backgroundColor = red_c;
            break;
        case "6":
            setBarMarks(minDis, maxDis,relayX,0);
            setBarWidths(30 / totalRange * 100, (relayX - 30) / totalRange * 100, (maxDis - relayX) / totalRange * 100,((4000 - maxDis) / totalRange) * 100, 0,0);
            bar2.style.backgroundColor = red_c;
            bar3.style.backgroundColor = green_c;
            bar4.style.backgroundColor = red_c;
            break;
        case "7":
            setBarMarks(minDis, maxDis,relayX,0);
            setBarWidths(30 / totalRange * 100, (minDis - 30) / totalRange * 100, (relayX - minDis) / totalRange * 100,((4000 - relayX) / totalRange) * 100, 0,0);
            bar2.style.backgroundColor = red_c;
            bar3.style.backgroundColor = green_c;
            bar4.style.backgroundColor = red_c;
            break;
        case "8":
            setBarMarks(minDis, maxDis,relayX,relayY);
            setBarWidths(30 / totalRange * 100, (minDis - 30) / totalRange * 100,(relayX - minDis) / totalRange * 100, (relayY - relayX) / totalRange * 100,(maxDis-relayY)/totalRange*100,((4000 - maxDis) / totalRange) * 100);
            bar2.style.backgroundColor = red_c;
            bar3.style.backgroundColor = red_c;
            bar4.style.backgroundColor = green_c;
            bar5.style.backgroundColor = red_c;
            bar6.style.backgroundColor = red_c;
            break;
        case "9":
            setBarMarks(minDis, maxDis,relayX,relayY);
            setBarWidths(30 / totalRange * 100, (minDis - 30) / totalRange * 100,(relayX - minDis) / totalRange * 100, (relayY - relayX) / totalRange * 100,(maxDis-relayY)/totalRange*100,((4000 - maxDis) / totalRange) * 100);
            bar2.style.backgroundColor = red_c;
            bar3.style.backgroundColor = green_c;
            bar4.style.backgroundColor = red_c;
            bar5.style.backgroundColor = green_c;
            bar6.style.backgroundColor = red_c;
            break;
        default:
            break;

    }
}