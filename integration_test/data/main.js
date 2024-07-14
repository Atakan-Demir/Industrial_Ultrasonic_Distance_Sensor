document.addEventListener("DOMContentLoaded", function () {
  let paraForm = document.getElementById("paraForm");
  let refreshBTN = document.getElementById("btn-reset");

  let currentValues = {
    minDis: null,
    maxDis: null,
    offset: null,
    interval: null,
    distance: null,
    percent: null
  };

  var minDis;
  var maxDis;
  var offset;
  var interval;
  var distance;
  var percent;

  //bar
  var totalUnits = 4000;
  var blackSegmentWidth = 30;


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


    /**************************************** */
    source.addEventListener('MinDis', function (e) {
      document.getElementById("inputMinDis").value = e.data;
    }, false);

    source.addEventListener('MaxDis', function (e) {
      document.getElementById("inputMaxDis").value = e.data;
    }, false);

    source.addEventListener('OffsetVal', function (e) {
      document.getElementById("inputOffset").value = e.data;
    }, false);

    source.addEventListener('IntervalVal', function (e) {
      document.getElementById("inputInterval").value = e.data;
    }, false);
    source.addEventListener('PercentVal', function (e) {
        currentValues.percent = parseFloat(e.data);
        percent = parseFloat(e.data);
        document.getElementById("percentValue").innerHTML = e.data;

    }, false);


    source.addEventListener('DistanceVal', function (e) {
      var elm = document.getElementById("distanceValue");
      elm.innerHTML = e.data;
      var distance = parseFloat(e.data);
      if (distance < currentValues.minDis || distance > currentValues.maxDis) {
        elm.style.color = 'red';
      }
      else {
        elm.style.color = 'black';
      }
    }, false);

    /**************************************** */
  }




  function onLoad(event) {

    loadInitialValues();
  }

  paraForm.addEventListener("submit", (e) => {
    e.preventDefault(); // Formun varsayılan submit davranışını engelle
    minDis = document.getElementById("inputMinDis").value;
    maxDis = document.getElementById("inputMaxDis").value;
    offset = document.getElementById("inputOffset").value;
    interval = document.getElementById("inputInterval").value;


    if (minDis === "" || maxDis === "" || offset === "" || interval === "") {
      alert("Form bos olamaz!!");
    } else {
      if (minDis == currentValues.minDis && maxDis == currentValues.maxDis && offset == currentValues.offset && interval == currentValues.interval) {
        alert("degerler ayni. Parametre gönderimi yapamazsınız!");
      } else {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", "/param?value=" + minDis + "&maxdis=" + maxDis + "&offset=" + offset+ "&interval="+interval, true);
        xhr.onreadystatechange = function () {
          if (xhr.readyState == 4 && xhr.status == 200) {
            console.log('200 OK! Gönderim tamam.');
            updateFormValues(minDis, maxDis, offset, currentValues.distance, interval,percent);
          }
        };
        xhr.send();
      }
    }
  });


  function updateFormValues(minDis, maxDis, offset, distance, interval,percent) {
    currentValues.minDis = minDis;
    currentValues.maxDis = maxDis;
    currentValues.offset = offset;
    currentValues.distance = distance;
    currentValues.interval = interval;
    currentValues.percent = percent;



    document.getElementById("inputMinDis").value = minDis;
    document.getElementById("inputMaxDis").value = maxDis;
    document.getElementById("inputOffset").value = offset;
    document.getElementById("distanceValue").innerText = "distance: " + distance;
    document.getElementById("inputInterval").value = interval;
    document.getElementById("percentValue").innerText = percent;
    
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
        currentValues.interval = doc.getElementById('inputInterval').value;
        currentValues.percent = doc.getElementById('percentValue').innerText;
        updateFormValues(currentValues.minDis, currentValues.maxDis, currentValues.offset, currentValues.distance, currentValues.interval, currentValues.percent);
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
      //var offsetWidth = currentValues.offset / totalUnits * 100;
      console.log("percent: "+currentValues.percent);
      var offsetWidth = currentValues.percent * 100;

      elmOffset.style.left = offsetStart + '%';
      elmOffset.style.width = offsetWidth + '%';
      elmOffset.style.backgroundColor = '#FFB90F';

      console.log("Offset : "+offsetStart + "Offset Width : "+offsetWidth);
    } else {
      var offsetWidth = -currentValues.percent * 100;
      var offsetStart = (currentValues.maxDis / totalUnits * 100) - offsetWidth;
      console.log("Offset : "+offsetStart + "Offset Width : "+offsetWidth);
      elmOffset.style.left = offsetStart + '%';
      elmOffset.style.width = offsetWidth + '%';
      elmOffset.style.backgroundColor = 'red';
    }

    elmGreen.style.left = greenSegmentStart + '%';
    elmGreen.style.width = greenSegmentWidth + '%';
    elmGreen.innerText = "Min: " + currentValues.minDis + "mm - Max: " + currentValues.maxDis + "mm";
  }
});
