document.addEventListener("DOMContentLoaded", function () {
  let paraForm = document.getElementById("paraForm");
  let refreshBTN = document.getElementById("btn-reset");

  let currentValues = {
    minDis: null,
    maxDis: null,
    offset: null
  };

  var minDis;
  var maxDis;
  var offset;

  //bar
  var totalUnits = 400;
  var blackSegmentWidth = 3;

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
        xhr.open("GET", "/slider?value=" + minDis + "&maxdis=" + maxDis + "&offset=" + offset, true);
        xhr.onreadystatechange = function () {
          if (xhr.readyState == 4 && xhr.status == 200) {
            console.log('200 OK! Gönderim tamam.');
            updateFormValues(minDis, maxDis, offset);
          }
        };
        xhr.send();
      }
    }
  });

  refreshBTN.addEventListener("click", (e) => {
    location.reload();
  });

  function updateFormValues(minDis, maxDis, offset) {
    currentValues.minDis = minDis;
    currentValues.maxDis = maxDis;
    currentValues.offset = offset;

    document.getElementById("inputMinDis").value = minDis;
    document.getElementById("inputMaxDis").value = maxDis;
    document.getElementById("inputOffset").value = offset;
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

        updateFormValues(currentValues.minDis, currentValues.maxDis, currentValues.offset);
        updateProgressBar();
      }
    };
    xhr.send();
  }

  // Sayfa yüklendiğinde mevcut değerleri yükle
  loadInitialValues();


  function updateProgressBar() {
    var elmBlack = document.getElementById('black-segment');
    var elmGreen = document.getElementById('green-segment');
    var elmOffset = document.getElementById('offset-segment');

    elmBlack.style.width = (blackSegmentWidth / totalUnits * 100) + '%';


    // Kullanıcının belirlediği minimum ve maksimum değerler arasında yeşil bar
    var greenSegmentStart = currentValues.minDis / totalUnits * 100;
    var greenSegmentWidth = (currentValues.maxDis - currentValues.minDis) / totalUnits * 100;

    if (currentValues.offset > 0) {
      // yeşil barın bitiş noktasından itibaren offset barını çizmek için

      var offsetStart = (currentValues.maxDis / totalUnits * 100);
      var offsetWidth = currentValues.offset / totalUnits * 100;


      elmOffset.style.left = offsetStart + '%';
      elmOffset.style.width = offsetWidth + '%';
      elmOffset.style.backgroundColor = '#FFB90F';

    }
    // else ters yönde offset barı çizmek için
    else {
      var offsetWidth = -currentValues.offset / totalUnits * 100;
      var offsetStart = (currentValues.maxDis / totalUnits * 100) - offsetWidth;

      elmOffset.style.left = offsetStart + '%';
      elmOffset.style.width = offsetWidth + '%';
      elmOffset.style.backgroundColor = 'red';
    }

    elmGreen.style.left = greenSegmentStart + '%';
    elmGreen.style.width = greenSegmentWidth + '%';

    // Yeşil barın başlangıç ve bitiş noktalarını göstermek için minimum ve maksimum değerleri ekrana yazdırabiliriz
    elmGreen.innerText = "Min: " + currentValues.minDis + "mm - Max: " + currentValues.maxDis + "mm";
  }

});
