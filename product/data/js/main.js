// main.js

import { updateSegments } from './bar.js';
import { updateLanguage } from './language.js';
import { updateDistanceIndicator } from './distance_indicator.js';

document.addEventListener("DOMContentLoaded", function () {
    const languageButtons = document.querySelectorAll('.dropdown-item');
    const path = window.location.pathname;

    // Sayfa yüklendiğinde, yerel depolamadan dil seçimini okuyun ve güncelleyin
    const savedLang = localStorage.getItem('lang') || 'en'; // varsayılan dil 'en'
    updateLanguage(savedLang);

    // Seçili dilin bayrağını ve adını güncelleyin
    const selectedButton = document.querySelector(`.dropdown-item[data-lang="${savedLang}"]`);
    if (selectedButton) {
        document.querySelector('.btn-secondary img').src = selectedButton.querySelector('img').src;
        document.querySelector('.btn-secondary').innerHTML = `<img src="${selectedButton.querySelector('img').src}" style="width: 24px;">&nbsp; ${savedLang.charAt(0).toUpperCase() + savedLang.slice(1)}`;

        // Tıklanan düğmeye 'active' ve 'bg-secondary' sınıfını ekleyin
        selectedButton.classList.add('active', 'bg-secondary');
    }

    languageButtons.forEach(button => {
        button.addEventListener('click', function () {
            const selectedLang = this.getAttribute('data-lang');
            if (selectedLang) {
                updateLanguage(selectedLang);
                localStorage.setItem('lang', selectedLang);
                document.querySelector('.btn-secondary img').src = this.querySelector('img').src;
                document.querySelector('.btn-secondary').innerHTML = `<img src="${this.querySelector('img').src}" style="width: 24px;">&nbsp; ${selectedLang.charAt(0).toUpperCase() + selectedLang.slice(1)}`;

                // Tüm düğmelerden 'active' sınıfını kaldırma
                languageButtons.forEach(btn => btn.classList.remove('active', 'bg-secondary'));

                // Tıklanan düğmeye 'active' ve 'bg-secondary' sınıfını ekleme
                this.classList.add('active', 'bg-secondary');
            } else {
                console.warn('Language attribute not found on button');
            }
        });
    });

    let currentValues = {
        minDis: null,
        maxDis: null,
        offset: null,
        interval: null,
        distance: null,
        percent: null,
        outputType: null,
        outputTypeRev: null,
        transistor: null
    };

    var minDis;
    var maxDis;
    var offset;
    var interval;
    var distance;
    var percent;
    var outputType;
    var outputTypeRev;
    var transistor;

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
            if (path === '/config' || path === '/config.html') {
                document.getElementById("inputMinDis").value = e.data;
            }

            currentValues.minDis = parseInt(e.data);
        }, false);

        source.addEventListener('MaxDis', function (e) {
            if (path === '/config' || path === '/config.html') {
                document.getElementById("inputMaxDis").value = e.data;
            }

            currentValues.maxDis = parseInt(e.data);
        }, false);

        source.addEventListener('OffsetVal', function (e) {
            if (path === '/config' || path === '/config.html') {
                document.getElementById("inputOffset").value = e.data;
            }

            currentValues.offset = parseInt(e.data);


        }, false);

        source.addEventListener('IntervalVal', function (e) {
            if (path === '/config' || path === '/config.html') {
                document.getElementById("inputInterval").value = e.data;
            }

            currentValues.interval = parseInt(e.data);
        }, false);
        source.addEventListener('PercentVal', function (e) {
            currentValues.percent = parseFloat(e.data);
            percent = parseFloat(e.data);
            if (path === '/' || path === '/index.html') {
                document.getElementById("percentValue").value = e.data;
            }
        }, false);

        source.addEventListener('OutputVal', function (e) {
            currentValues.outputType = e.data;
            outputType = e.data;

            if (path === '/config' || path === '/config.html') {
                document.getElementById("outputType").value = e.data;
            }

        }, false);

        source.addEventListener('OutputValRev', function (e) {
            currentValues.outputTypeRev = e.data;
            outputTypeRev = e.data;

            if (path === '/config' || path === '/config.html') {
                if (outputTypeRev === "0") {
                    document.getElementById("outputTypeReversCheck").checked = false;
                    document.getElementById("outputTypeRevers").disabled = true;
                    document.getElementById("outputTypeRevers").value = "0";
                } else{
                    document.getElementById("outputTypeReversCheck").checked = true;
                    document.getElementById("outputTypeRevers").disabled = false;
                    document.getElementById("outputTypeRevers").value = e.data;
                }
                
            }

        }, false);

        source.addEventListener('TransistorVal', function (e) {
            currentValues.transistor = e.data;
            transistor = e.data;
            if (path === '/config' || path === '/config.html') {
                document.getElementById("transistorOutput").value = e.data;
            }

        }, false);


        source.addEventListener('DistanceVal', function (e) {
            if (path === '/' || path === '/index.html') {
                var elm = document.getElementById("distanceValue");
                elm.innerHTML = parseInt(e.data);
                var distance = parseInt(e.data);
                updateDistanceIndicator(distance, currentValues.minDis, currentValues.maxDis);
                if (distance < currentValues.minDis || distance > currentValues.maxDis) {
                    elm.style.color = 'red';
                    console.log("Distance: " + distance + " Min: " + currentValues.minDis + " Max: " + currentValues.maxDis);
                }
                else {
                    elm.style.color = 'black';
                }
            } else {
                currentValues.distance = parseInt(e.data);
            }
        }, false);
    }


    /**************************************** */

    function onLoad(event) {

        loadInitialValues();
    }
    function updateFormValues(minDis, maxDis, offset, distance, interval, percent, outputType,outputTypeRev, transistor) {
        currentValues.minDis = minDis;
        currentValues.maxDis = maxDis;
        currentValues.offset = offset;
        currentValues.distance = distance;
        currentValues.interval = interval;
        currentValues.percent = percent;
        currentValues.outputType = outputType;
        currentValues.outputTypeRev = outputTypeRev;
        currentValues.transistor = transistor;

        //if config

        if (path === '/config' || path === '/config.html') {
            document.getElementById("inputMinDis").value = minDis;
            document.getElementById("inputMaxDis").value = maxDis;
            document.getElementById("inputOffset").value = offset;
            document.getElementById("inputInterval").value = interval;
            document.getElementById("outputType").value = outputType;
            document.getElementById("outputTypeRevers").value = outputTypeRev;
            document.getElementById("transistorOutput").value = transistor;
            document.getElementById("trans").innerText = transistor;
        }


        //document.getElementById("distanceValue").innerText = parseInt(distance);

        //document.getElementById("percentValue").innerText = percent;



        if (path === '/' || path === '/index.html') {
            updateSegments(currentValues);
            updateDistanceIndicator(distance);
        }


    }

    function loadInitialValues() {
        if (path === '/' || path === '/index.html') {
            var xhr = new XMLHttpRequest();
            xhr.open("GET", "/", true);
            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4 && xhr.status == 200) {
                    var parser = new DOMParser();
                    var doc = parser.parseFromString(xhr.responseText, "text/html");

                    currentValues.minDis = parseInt(doc.getElementById('mindisValue').innerText);
                    currentValues.maxDis = parseInt(doc.getElementById('maxdisValue').innerText);
                    currentValues.offset = parseInt(doc.getElementById('offsetValue').innerText);
                    currentValues.distance = doc.getElementById('distanceValue').innerText;
                    currentValues.interval = doc.getElementById('intervalValue').value;
                    currentValues.percent = doc.getElementById('percentValue').innerText;



                    updateFormValues(currentValues.minDis, currentValues.maxDis, currentValues.offset, currentValues.distance, currentValues.interval, currentValues.percent, currentValues.outputType, currentValues.transistor);
                }


            };
            xhr.send();

        }
        if (path === '/config' || path === '/config.html') {
            var xhr = new XMLHttpRequest();
            xhr.open("GET", "/config", true);
            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4 && xhr.status == 200) {
                    var parser = new DOMParser();
                    var doc = parser.parseFromString(xhr.responseText, "text/html");

                    currentValues.minDis = parseInt(doc.getElementById('inputMinDis').value);
                    currentValues.maxDis = parseInt(doc.getElementById('inputMaxDis').value);
                    currentValues.offset = parseInt(doc.getElementById('inputOffset').value);
                    currentValues.interval = doc.getElementById('inputInterval').value;

                    //currentValues.distance = doc.getElementById('distanceValue').innerText;

                    //currentValues.percent = doc.getElementById('percentValue').innerText;


                    var outputTypeValue = document.getElementById("out").innerText.trim();
                    currentValues.outputType = outputTypeValue;
                    var outputTypeSelect = document.getElementById("outputType");
                    outputTypeSelect.value = outputTypeValue;

                    var outputTypeRevValue = document.getElementById("outRev").innerText.trim();
                    currentValues.outputTypeRev = outputTypeRevValue;
                    var outputTypeRevSelect = document.getElementById("outputTypeRevers");
                    outputTypeRevSelect.value = outputTypeRevValue;
                    if(outputTypeRevValue!=="0"){
                        document.getElementById("outputTypeReversCheck").checked = true;
                        document.getElementById("outputTypeRevers").disabled = false;
                    }

                    var transistorValue = document.getElementById("trans").innerText.trim();
                    currentValues.transistor = transistorValue;
                    var transistorSelect = document.getElementById("transistorOutput");
                    transistorSelect.value = transistorValue;




                    updateFormValues(currentValues.minDis, currentValues.maxDis, currentValues.offset, currentValues.distance, currentValues.interval, currentValues.percent, currentValues.outputType,currentValues.outputTypeRev, currentValues.transistor);
                    //updateProgressBar();
                }
            };
            xhr.send();
        }

    }

    if (path === '/config' || path === '/config.html') {
        let paraForm = document.getElementById("paraForm");
        let outputTypeCheck = document.getElementById("outputTypeReversCheck");
        let outputTypeRevers = document.getElementById("outputTypeRevers");
        let outputTypeElmnt = document.getElementById("outputType");
        let outputTypeValue = document.getElementById("out");

        // outputType change event
        outputTypeElmnt.addEventListener("change", function () {
            if (outputTypeElmnt.value === "0") {
                outputTypeCheck.disabled = true;
                outputTypeCheck.checked = false;
                outputTypeRevers.disabled = true;
            } else {
                outputTypeCheck.disabled = false;
            }

            updateOutputTypeRevers();
        });

        // checkbox change event
        outputTypeCheck.addEventListener("change", function () {
            if (outputTypeCheck.checked) {
                outputTypeRevers.disabled = false;
                outputTypeRevers.value = outputTypeElmnt.value;
            } else {
                outputTypeRevers.disabled = true;
                outputTypeRevers.value = "0";
            }
        });

        console.log("OutputType: " + outputTypeValue.innerText.trim());
        if (outputTypeValue.innerText.trim() === "0") {
            outputTypeCheck.disabled = true;
        } else {
            outputTypeCheck.disabled = false;
        }
        
        
        paraForm.addEventListener("submit", (e) => {
            e.preventDefault(); // Formun varsayılan submit davranışını engelle
            minDis = document.getElementById("inputMinDis").value;
            maxDis = document.getElementById("inputMaxDis").value;
            offset = document.getElementById("inputOffset").value;
            interval = document.getElementById("inputInterval").value;
            outputType = document.getElementById("outputType").value;
            if(outputTypeCheck.checked){
                outputTypeRev = document.getElementById("outputTypeRevers").value;
            }else{
                outputTypeRev = "0";
            }
            
            transistor = document.getElementById("transistorOutput").value;

            console.log("D :" + distance);
            console.log("CD :" + currentValues.distance);


            if (minDis === "" || maxDis === "" || offset === "" || interval === "" || outputType === "" || outputTypeRev==="" || transistor === "") {
                alert("Form empty!!");
            } else {
                if (minDis == currentValues.minDis && maxDis == currentValues.maxDis && offset == currentValues.offset && interval == currentValues.interval && outputType == currentValues.outputType&&outputTypeRev==currentValues.outputTypeRev && transistor == currentValues.transistor) {
                    alert("degerler ayni. Parametre gönderimi yapamazsınız!");
                } else if (offset / currentValues.distance > 0.05) {
                    alert("Ofset %5'ten fazla olamaz!");

                } else if (offset / currentValues.distance * maxDis + maxDis > 4000 || offset / currentValues.distance * minDis + minDis < 30) {
                    console.log("Condition Block1: " + offset / currentValues.distance * maxDis + maxDis);
                    console.log("Condition Block2: " + offset / currentValues.distance * minDis + minDis);
                    alert("Ofset değeri sınır dışı! Lütfen kontrol ediniz. (30-4000)");

                }
                else {
                    console.log("Percent calculated: " + offset / currentValues.distance);
                    var xhr = new XMLHttpRequest();
                    xhr.open("GET", "/param?value=" + minDis + "&maxdis=" + maxDis + "&offset=" + offset + "&interval=" + interval + "&outputType=" + outputType +"&outputTypeRev="+outputTypeRev +"&transistor=" + transistor, true);
                    xhr.onreadystatechange = function () {
                        if (xhr.readyState == 4 && xhr.status == 200) {
                            console.log('200 OK! Gönderim tamam.');
                            updateFormValues(minDis, maxDis, offset, currentValues.distance, interval, percent, outputType, outputTypeRev, transistor);
                        }
                    };
                    xhr.send();
                }
            }
        });

        function updateOutputTypeRevers() {

            var selectedValue = outputTypeElmnt.value;
            // Tüm seçenekleri devre dışı bırak
            Array.from(outputTypeRevers.options).forEach(function(option) {
                if (selectedValue === "3") {
                    if(option.value === "0"){
                        option.disabled = true;

                    }else{
                        option.disabled = false;
                    }

                }else{
                    option.disabled = true;
                }
                
            });
    
            // Seçili değeri etkinleştir
            
            var matchingOption = outputTypeRevers.querySelector(`option[value="${selectedValue}"]`);
            if (matchingOption) {
                matchingOption.disabled = false;
                outputTypeRevers.value = selectedValue;
            }
        }
    
        
    
        // Başlangıç durumunu ayarla
        updateOutputTypeRevers();
    }



});
