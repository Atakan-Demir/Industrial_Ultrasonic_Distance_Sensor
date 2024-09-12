// main.js

import { updateSegments } from './bar.js';
import { updateLanguage } from './language.js';
import { updateDistanceIndicator } from './distance_indicator.js';
import { updateTransistorOutputBar,updateRelayOutputBar } from './outputBar.js';

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
        transistor: null,
        transistorX: null,
        transistorY: null,
        relay: null,
        relayX: null,
        relayY: null,
        select: null,
        baud: null,
        com: null,
        slave: null,

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
    var transistorX;
    var transistorY;
    var relay;
    var relayX;
    var relayY;
    var select;
    var baud;
    var com;
    var slave;

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
                } else {
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

        source.addEventListener('TransXVal', function (e) {
            currentValues.transistorX = e.data;
            transistorX = e.data;
            if (path === '/config' || path === '/config.html') {
                document.getElementById("transistorInputX").value = e.data;
            }

        }, false);

        source.addEventListener('TransYVal', function (e) {
            currentValues.transistorY = e.data;
            transistorY = e.data;
            if (path === '/config' || path === '/config.html') {
                document.getElementById("transistorInputY").value = e.data;
            }
        }, false);

        source.addEventListener('RelayVal', function (e) {
            currentValues.relay = e.data;
            relay = e.data;
            if (path === '/config' || path === '/config.html') {
                document.getElementById("relayOutput").value = e.data;
                console.log("Relay: " + e.data);
            }

            //updateRelayOutputBar(e.data, currentValues.minDis, currentValues.maxDis);
        }, false);

        source.addEventListener('RelayXVal', function (e) {
            currentValues.relayX = e.data;
            relayX = e.data;
            if (path === '/config' || path === '/config.html') {
                document.getElementById("relayInputX").value = e.data;
                console.log("RelayX: " + e.data);
            }
        }
        , false);

        source.addEventListener('RelayYVal', function (e) {
            currentValues.relayY = e.data;
            relayY = e.data;
            if (path === '/config' || path === '/config.html') {
                document.getElementById("relayInputY").value = e.data;
                console.log("RelayY: " + e.data);
            }
        }, false);


        source.addEventListener('SelectVal', function (e) {
            currentValues.select = e.data;
            select = e.data;
            if (path === '/config' || path === '/config.html') {
                document.getElementById("select").value = e.data;
                document.getElementById("datasourceSelect").value = e.data;

            }
        }, false);


        source.addEventListener('BaudVal', function (e) {
            currentValues.baud = e.data;
            baud = e.data;
            if (path === '/config' || path === '/config.html') {
                document.getElementById("baud").value = e.data;
                document.getElementById("baudRate").value = e.data;
            }
        }, false);

        source.addEventListener('ComVal', function (e) {
            currentValues.com = e.data;
            com = e.data;
            if (path === '/config' || path === '/config.html') {
                document.getElementById("com").value = e.data;
                document.getElementById("comtype").value = e.data;

            }
        }, false);

        source.addEventListener('SlaveVal', function (e) {
            currentValues.slave = e.data;
            slave = e.data;
            if (path === '/config' || path === '/config.html') {
                document.getElementById("slaveId").value = e.data;
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
    function updateFormValues(minDis, maxDis, offset, distance, interval, percent, outputType, outputTypeRev, transistor, transistorX, transistorY, relay, relayX, relayY, select, baud, com, slave) {
        currentValues.minDis = minDis;
        currentValues.maxDis = maxDis;
        currentValues.offset = offset;
        currentValues.distance = distance;
        currentValues.interval = interval;
        currentValues.percent = percent;
        currentValues.outputType = outputType;
        currentValues.outputTypeRev = outputTypeRev;
        currentValues.transistor = transistor;
        currentValues.transistorX = transistorX;
        currentValues.transistorY = transistorY;
        currentValues.relay = relay;
        currentValues.relayX = relayX;
        currentValues.relayY = relayY;
        currentValues.select = select;
        currentValues.baud = baud;
        currentValues.com = com;
        currentValues.slave = slave;

        

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
            //document.getElementById("out").innerText = outputType;
            //document.getElementById("outRev").innerText = outputTypeRev;
            document.getElementById("transistorInputX").value = transistorX;
            document.getElementById("transistorInputY").value = transistorY;
            document.getElementById("relayOutput").value = relay;
            document.getElementById("rly").innerText = relay;
            console.log("RelayXXX: " + relayX);
            document.getElementById("relayInputX").value = parseInt(relayX);
            document.getElementById("relayInputY").value = parseInt(relayY);
            document.getElementById("select").value = select;
            document.getElementById("datasourceSelect").value = select;
            document.getElementById("baud").value = baud;
            document.getElementById("baudRate").value = baud;
            document.getElementById("com").value = com;
            document.getElementById("comtype").value = com;
            document.getElementById("slaveId").value = slave

            
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
                    //currentValues.outputType = doc.getElementById('out').innerText;
                    //currentValues.outputTypeRev = doc.getElementById('outRev').innerText;
                    currentValues.transistor = doc.getElementById("trans").innerText;
                    currentValues.transistorX = parseInt(doc.getElementById("transX").innerText);
                    currentValues.transistorY = parseInt(doc.getElementById("transY").innerText);
                    currentValues.relay = doc.getElementById("rly").innerText;
                    currentValues.relayX = parseInt(doc.getElementById("rlyX").innerText);
                    currentValues.relayY = parseInt(doc.getElementById("rlyY").innerText);
                    currentValues.select = doc.getElementById("select").value;
                    currentValues.baud = doc.getElementById("baud").value;
                    currentValues.com = doc.getElementById("com").value;
                    currentValues.slave = doc.getElementById("slaveId").value;




                    updateTransistorOutputBar(currentValues.transistor, currentValues.minDis, currentValues.maxDis, currentValues.transistorX, currentValues.transistorY);
                    updateRelayOutputBar(currentValues.relay, currentValues.minDis, currentValues.maxDis, currentValues.relayX, currentValues.relayY);
                    updateFormValues(currentValues.minDis, currentValues.maxDis, currentValues.offset, currentValues.distance, currentValues.interval, currentValues.percent, currentValues.outputType, currentValues.transistor, currentValues.transistorX, currentValues.transistorY,currentValues.relay, currentValues.relayX, currentValues.relayY, currentValues.select, currentValues.baud, currentValues.com, currentValues.slave);
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
                    if (outputTypeRevValue !== "0") {
                        document.getElementById("outputTypeReversCheck").checked = true;
                        document.getElementById("outputTypeRevers").disabled = false;
                    }

                    var transistorValue = document.getElementById("trans").innerText.trim();
                    currentValues.transistor = transistorValue;
                    var transistorSelect = document.getElementById("transistorOutput");
                    transistorSelect.value = transistorValue;


                    currentValues.transistorX = doc.getElementById("transistorInputX").value;
                    currentValues.transistorY = doc.getElementById("transistorInputY").value;
                    if (transistorValue === "6" || transistorValue === "7") {
                        document.getElementById("transistorInputX").disabled = false;

                        document.getElementById("transistorInputY").disabled = true;

                    } else if (transistorValue === "8" || transistorValue === "9") {
                        document.getElementById("transistorInputX").disabled = false;
                        document.getElementById("transistorInputY").disabled = false;
                    } else {
                        document.getElementById("transistorInputX").disabled = true;
                        document.getElementById("transistorInputY").disabled = true;

                    }

                    var relayValue = document.getElementById("rly").innerText.trim();
                    currentValues.relay = relayValue;
                    var relaySelect = document.getElementById("relayOutput");
                    relaySelect.value = relayValue;

                    console.log("Relay Value: " + relayValue);

                    currentValues.relayX = doc.getElementById("relayInputX").value;
                    currentValues.relayY = doc.getElementById("relayInputY").value;

                    console.log("Relay X: " + currentValues.relayX + " Relay Y: " + currentValues.relayY);
                    if (relayValue === "6" || relayValue === "7") {
                        document.getElementById("relayInputX").disabled = false;
                        document.getElementById("relayInputY").disabled = true;
                    } else if (relayValue === "8" || relayValue === "9") {
                        document.getElementById("relayInputX").disabled = false;
                        document.getElementById("relayInputY").disabled = false;
                    } else {
                        document.getElementById("relayInputX").disabled = true; 
                        document.getElementById("relayInputY").disabled = true;
                    }
                    
                    var selectValue = doc.getElementById("select").innerText.trim();
                    currentValues.select = selectValue;
                    var selectElmnt = document.getElementById("datasourceSelect");
                    selectElmnt.value = selectValue;

                    var baudValue = doc.getElementById("baud").innerText.trim();
                    currentValues.baud = baudValue;
                    var baudElmnt = document.getElementById("baudRate");
                    baudElmnt.value = baudValue;

                    var comValue = doc.getElementById("com").innerText.trim();
                    currentValues.com = comValue;
                    var comElmnt = document.getElementById("comtype");
                    comElmnt.value = comValue;

                    currentValues.slave = doc.getElementById("slaveId").value;

                    updateTransistorOutputBar(transistorValue, currentValues.minDis, currentValues.maxDis, currentValues.transistorX, currentValues.transistorY);
                    updateRelayOutputBar(relayValue, currentValues.minDis, currentValues.maxDis, currentValues.relayX, currentValues.relayY);
                    updateFormValues(currentValues.minDis, currentValues.maxDis, currentValues.offset, currentValues.distance, currentValues.interval, currentValues.percent, currentValues.outputType, currentValues.outputTypeRev, currentValues.transistor, currentValues.transistorX, currentValues.transistorY, currentValues.relay, currentValues.relayX, currentValues.relayY, currentValues.select, currentValues.baud, currentValues.com, currentValues.slave);
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

        let transistorOutputElmnt = document.getElementById("transistorOutput");
        let transistorInputX = document.getElementById("transistorInputX");
        let transistorInputY = document.getElementById("transistorInputY");

        let relayOutputElmnt = document.getElementById("relayOutput");
        let relayInputX = document.getElementById("relayInputX");
        let relayInputY = document.getElementById("relayInputY");

        //transistorOutput change event
        transistorOutputElmnt.addEventListener("change", function () {
            if (transistorOutputElmnt.value === "6" || transistorOutputElmnt.value === "7") {
                transistorInputX.disabled = false;
                transistorInputY.disabled = true;

            } else if (transistorOutputElmnt.value === "8" || transistorOutputElmnt.value === "9") {
                transistorInputX.disabled = false;
                transistorInputY.disabled = false;
            } else {
                transistorInputX.disabled = true;
                transistorInputY.disabled = true;
            }
        });
        // relay output change event

        relayOutputElmnt.addEventListener("change", function () {
            if (relayOutputElmnt.value === "6" || relayOutputElmnt.value === "7") {
                relayInputX.disabled = false;
                relayInputY.disabled = true;
            } else if (relayOutputElmnt.value === "8" || relayOutputElmnt.value === "9") {
                relayInputX.disabled = false;
                relayInputY.disabled = false;
            } else {
                relayInputX.disabled = true;
                relayInputY.disabled = true;
            }
        });

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
            if (outputTypeCheck.checked) {
                outputTypeRev = document.getElementById("outputTypeRevers").value;
            } else {
                outputTypeRev = "0";
            }

            transistor = document.getElementById("transistorOutput").value;
            transistorX = document.getElementById("transistorInputX").value;
            transistorY = document.getElementById("transistorInputY").value;


            relay = document.getElementById("relayOutput").value;
            relayX = document.getElementById("relayInputX").value;
            relayY = document.getElementById("relayInputY").value;

            select = document.getElementById("datasourceSelect").value;
            baud = document.getElementById("baudRate").value;
            com = document.getElementById("comtype").value;
            slave = document.getElementById("slaveId").value;

            console.log("D :" + distance);
            console.log("CD :" + currentValues.distance);



            function validateForm() {

                // Değerlerin boş olup olmadığını kontrol et
                if (minDis === "" || maxDis === "" || offset === "" || interval === "" || outputType === "" || outputTypeRev === "" || transistor === "" || transistorX === "" || transistorY === "" || relay === "" || relayX === "" || relayY === "" || select === "" || baud === "" || com === "" || slave === "") {
                    alert("Form empty!!");
                    return false;
                }

                // Transistör X ve Y değerlerini kontrol et
                if (transistor === "6" || transistor === "7") {
                    if (transistorX === "" || isNaN(transistorX)) {
                        alert("Transistor X değeri boş veya geçersiz!");
                        return false;
                    }
                    else if (parseInt(transistorX) < minDis || parseInt(transistorX) > maxDis) {
                        alert("Transistor X değeri sınır dışı! Lütfen kontrol ediniz. (" + minDis + "-" + maxDis + ")");
                        return false;
                    }
                } else if (transistor === "8" || transistor === "9") {
                    if (transistorX === "" || isNaN(transistorX) || transistorY === "" || isNaN(transistorY)) {
                        alert("Transistor X veya Y değeri boş veya geçersiz!");
                        return false;
                    } else if (parseInt(transistorX) === parseInt(transistorY)) {
                        alert("Transistor X ve Y değeri aynı olamaz!");
                        return false;
                    } else if (parseInt(transistorX) > parseInt(transistorY)) {
                        alert("Transistor X değeri Y değerinden büyük olamaz!");
                        return false;
                    } else if (parseInt(transistorX) < minDis || parseInt(transistorX) > maxDis || parseInt(transistorY) < minDis || parseInt(transistorY) > maxDis) {
                        alert("Transistor X veya Y değeri sınır dışı! Lütfen kontrol ediniz. (" + minDis + "-" + maxDis + ")");
                        return false;
                    }
                }

                // Röle X ve Y değerlerini kontrol et
                if (relay === "6" || relay === "7") {
                    if (relayX === "" || isNaN(relayX)) {
                        alert("Relay X değeri boş veya geçersiz!");
                        return false;
                    }
                    else if (parseInt(relayX) < minDis || parseInt(relayX) > maxDis) {
                        alert("Relay X değeri sınır dışı! Lütfen kontrol ediniz. (" + minDis + "-" + maxDis + ")");
                        return false;
                    }
                } else if (relay === "8" || relay === "9") {
                    if (relayX === "" || isNaN(relayX) || relayY === "" || isNaN(relayY)) {
                        alert("Relay X veya Y değeri boş veya geçersiz!");
                        return false;
                    } else if (parseInt(relayX) === parseInt(relayY)) {
                        alert("Relay X ve Y değeri aynı olamaz!");
                        return false;
                    } else if (parseInt(relayX) > parseInt(relayY)) {
                        alert("Relay X değeri Y değerinden büyük olamaz!");
                        return false;
                    } else if (parseInt(relayX) < minDis || parseInt(relayX) > maxDis || parseInt(relayY) < minDis || parseInt(relayY) > maxDis) {
                        alert("Relay X veya Y değeri sınır dışı! Lütfen kontrol ediniz. (" + minDis + "-" + maxDis + ")");
                        return false;
                    }
                }

                // Diğer kontroller
                if (minDis == currentValues.minDis && maxDis == currentValues.maxDis && offset == currentValues.offset && interval == currentValues.interval && outputType == currentValues.outputType && outputTypeRev == currentValues.outputTypeRev && transistor == currentValues.transistor && transistorX == currentValues.transistorX && transistorY == currentValues.transistorY && relay == currentValues.relay && relayX == currentValues.relayX && relayY == currentValues.relayY && select == currentValues.select && baud == currentValues.baud && com == currentValues.com && slave == currentValues.slave) {
                    alert("Değerler aynı. Parametre gönderimi yapamazsınız!");
                    return false;
                } else if (offset / currentValues.distance > 0.05) {
                    alert("Ofset %5'ten fazla olamaz!");
                    return false;
                } else if (offset / currentValues.distance * maxDis + maxDis > 4000 || offset / currentValues.distance * minDis + minDis < 30) {
                    console.log("Condition Block1: " + offset / currentValues.distance * maxDis + maxDis);
                    console.log("Condition Block2: " + offset / currentValues.distance * minDis + minDis);
                    alert("Ofset değeri sınır dışı! Lütfen kontrol ediniz. (30-4000)");
                    return false;
                }

                return true;
            }

            function submitForm() {
                if (!validateForm()) {
                    return; // Form geçerli değilse işlem yapma
                }

                // Form geçerliyse verileri gönder
                console.log("Percent calculated: " + offset / currentValues.distance);
                var xhr = new XMLHttpRequest();
                xhr.open("GET", "/param?value=" + minDis + "&maxdis=" + maxDis + "&offset=" + offset + "&interval=" + interval + "&outputType=" + outputType + "&outputTypeRev=" + outputTypeRev + "&transistor=" + transistor + "&transXVal=" + transistorX + "&transYVal=" + transistorY+"&relay="+relay+"&relayXVal="+relayX+"&relayYVal="+relayY+"&selectVal="+select+"&baudVal="+baud+"&comVal="+com+"&slaveVal="+slave, true);
                xhr.onreadystatechange = function () {
                    if (xhr.readyState == 4 && xhr.status == 200) {
                        console.log('200 OK! Gönderim tamam.');
                        updateFormValues(minDis, maxDis, offset, currentValues.distance, interval, percent, outputType, outputTypeRev, transistor, transistorX, transistorY, relay, relayX, relayY, select, baud, com, slave);
                        updateTransistorOutputBar(transistor, minDis, maxDis, transistorX, transistorY);
                        updateRelayOutputBar(relay, minDis, maxDis, relayX, relayY);
                        loadInitialValues();

                    }
                };
                xhr.send();

                
            }


            submitForm();
        });

        function updateOutputTypeRevers() {

            var selectedValue = outputTypeElmnt.value;
            // Tüm seçenekleri devre dışı bırak
            Array.from(outputTypeRevers.options).forEach(function (option) {
                if (selectedValue === "3") {
                    if (option.value === "0") {
                        option.disabled = true;

                    } else {
                        option.disabled = false;
                    }

                } else {
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
