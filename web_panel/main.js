document.addEventListener("DOMContentLoaded", function () {
  let paraForm = document.getElementById("paraForm");
  let refreshBTN = document.getElementById("btn-reset");

  let currentValues = {
    minDis: null,
    maxDis: null,
    offset: null,
    distance: null
  };

  var minDis;
  var maxDis;
  var offset;
  var distance;

  //bar
  var totalUnits = 400;
  var blackSegmentWidth = 3;


  window.addEventListener('load', onLoad);

  if (!!window.EventSource) {
    var source = new EventSource('/events');

    source.addEventListener('open', function (e) {
        console.log("Events Connected");
    }, false);
    source.addEventListener('error', function (e) {
        if (e.target.readyState != EventSource.OPEN) {
            console.log("Events Disconnected");
        }
    }, false);

    source.addEventListener('message', function (e) {
        console.log("message", e.data);
    }, false);



    source.addEventListener('MinDis', function (e) {
        document.getElementById("inputMinDis").value = e.data;
    }, false);

    source.addEventListener('MaxDis', function (e) {
        document.getElementById("inputMaxDis").value = e.data;
    }, false);

    source.addEventListener('OffsetVal', function (e) {
        document.getElementById("inputOffset").value = e.data;
    }, false);

    source.addEventListener('DistanceVal', function (e) {
        var elm = document.getElementById("distanceValue");
        elm.innerHTML = e.data;
        var distance = parseFloat(e.data);
        if (distance<currentValues.minDis||distance>currentValues.maxDis) {
          elm.style.color='red';
        }
        else{
          elm.style.color='black';
        }
      }, false);

}




  function onLoad(event) {

    loadInitialValues();
  }

  paraForm.addEventListener("submit", (e) => {
    e.preventDefault(); // Formun varsayılan submit davranışını engelle
    minDis = document.getElementById("inputMinDis").value;
    maxDis = document.getElementById("inputMaxDis").value;
    offset = document.getElementById("inputOffset").value;

    if (minDis === "" || maxDis === "" || offset === "") {
      alert("Form bos olamaz!!");
    } else {
      if (minDis == currentValues.minDis && maxDis == currentValues.maxDis && offset == currentValues.offset) {
        alert("degerler ayni. Parametre gönderimi yapamazsınız!");
      } else {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", "/param?value=" + minDis + "&maxdis=" + maxDis + "&offset=" + offset, true);
        xhr.onreadystatechange = function () {
          if (xhr.readyState == 4 && xhr.status == 200) {
            console.log('200 OK! Gönderim tamam.');
            updateFormValues(minDis, maxDis, offset, currentValues.distance);
          }
        };
        xhr.send();
      }
    }
  });


  function updateFormValues(minDis, maxDis, offset, distance) {
    currentValues.minDis = minDis;
    currentValues.maxDis = maxDis;
    currentValues.offset = offset;
    currentValues.distance = distance;

    document.getElementById("inputMinDis").value = minDis;
    document.getElementById("inputMaxDis").value = maxDis;
    document.getElementById("inputOffset").value = offset;
    document.getElementById("distanceValue").innerText = "distance: " + distance;
    updateProgressBar();
  }

  function loadInitialValues() {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "/", true);
    xhr.onreadystatechange = function () {
      if (xhr.readyState == 4 && xhr.status == 200) {
        var parser = new DOMParser();
        var doc = parser.parseFromString(xhr.responseText, "text/html");

        currentValues.minDis = doc.getElementById('inputMinDis').value;
        currentValues.maxDis = doc.getElementById('inputMaxDis').value;
        currentValues.offset = doc.getElementById('inputOffset').value;
        currentValues.distance = doc.getElementById('distanceValue').innerText.split(': ')[1];

        updateFormValues(currentValues.minDis, currentValues.maxDis, currentValues.offset, currentValues.distance);
        updateProgressBar();
      }
    };
    xhr.send();
  }

  
    function updateProgressBar() {
      var elmBlack = document.getElementById('black-segment');
      var elmGreen = document.getElementById('green-segment');
      var elmOffset = document.getElementById('offset-segment');
  
      elmBlack.style.width = (blackSegmentWidth / totalUnits * 100) + '%';
  
      var greenSegmentStart = currentValues.minDis / totalUnits * 100;
      var greenSegmentWidth = (currentValues.maxDis - currentValues.minDis) / totalUnits * 100;
  
      if (currentValues.offset > 0) {
        var offsetStart = (currentValues.maxDis / totalUnits * 100);
        var offsetWidth = currentValues.offset / totalUnits * 100;
  
        elmOffset.style.left = offsetStart + '%';
        elmOffset.style.width = offsetWidth + '%';
        elmOffset.style.backgroundColor = '#FFB90F';
  
      } else {
        var offsetWidth = -currentValues.offset / totalUnits * 100;
        var offsetStart = (currentValues.maxDis / totalUnits * 100) - offsetWidth;
  
        elmOffset.style.left = offsetStart + '%';
        elmOffset.style.width = offsetWidth + '%';
        elmOffset.style.backgroundColor = 'red';
      }
  
      elmGreen.style.left = greenSegmentStart + '%';
      elmGreen.style.width = greenSegmentWidth + '%';
      elmGreen.innerText = "Min: " + currentValues.minDis + "mm - Max: " + currentValues.maxDis + "mm";
    }
  });
  