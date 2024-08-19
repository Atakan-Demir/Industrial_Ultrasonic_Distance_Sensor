#include <WiFi.h>
#include <WiFiAP.h>
#include <ESPAsyncWebServer.h>
#include <SPIFFS.h>
#include <AsyncTCP.h>
#include <Wire.h>
#include <Adafruit_SSD1306.h>
#include <Preferences.h>

//modbus
/*
  Modbus slave(1, Serial);

  uint16_t au16data[7];
*/

Preferences preferences;

const char* resetNamespace = "reset";
const char* firstRunKey = "firstRun";
const char* mindisKey = "mindisValue";
const char* maxdisKey = "maxdisValue";
const char* offsetKey = "offsetValue";
const char* percentKey = "percentValue";
const char* outputTypeKey = "outputTypeValue";
const char* outputRevKey = "outputRevValue";
const char* transistorKey = "transistorValue";
const char* transXKey = "transXValue";
const char* transYKey = "transYValue";
const char* relayKey = "relayValue";
const char* relayXKey = "relayXValue";
const char* relayYKey = "relayYValue";
const char* intervalKey = "intervalValue";

// Seri iletişim ayarları
#define RXD2 16
#define TXD2 17

const char* ssid = "DmR 2.4";
const char* password = "12231551";

const char* PARAM_INPUT = "value";
const char* PARAM_INPUT1 = "maxdis";
const char* PARAM_INPUT2 = "offset";
const char* PARAM_INPUT3 = "interval";
const char* PARAM_OUTPUT =  "outputType";
const char* PARAM_OUTPUT1 =  "outputTypeRev";
const char* PARAM_OUTPUT2 =  "transistor";
const char* PARAM_OUTPUT3 =  "transXVal";
const char* PARAM_OUTPUT4 =  "transYVal";
const char* PARAM_OUTPUT5 = "relay";
const char* PARAM_OUTPUT6 = "relayXVal";
const char* PARAM_OUTPUT7 = "relayYVal";
String mindisValue = "30";
String maxdisValue = "4000";
String offsetValue = "0";
String percentValue = "0.0";
String outputTypeValue = "0";
String outputRevValue = "0";
String transistorValue = "0";
String transXValue = "40";
String transYValue = "50";
String relayValue ="0";
String relayXValue ="40";
String relayYValue ="50";
unsigned long interval = 0;

unsigned long previousMillis = 0;
unsigned long previousMillis1 = 0;

//distance
unsigned char data[4] = {};
float distance;
float distanceCalc;

// OLED ekran ayarları
const int SCREEN_WIDTH = 128;
const int SCREEN_HEIGHT = 64;
const int OLED_ADDRESS = 0x3C;
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire);

AsyncWebServer server(80);
AsyncEventSource events("/events");

String processor(const String& var) {
  if (var == "MINDISVALUE") {
    return mindisValue;
  }
  else if (var == "MAXDISVALUE") {
    return maxdisValue;
  }
  else if (var == "OFFSETVALUE") {
    return offsetValue;
  }
  else if (var == "DISTANCEVALUE") {
    return String(distance);
  }
  else if (var == "INTERVALVALUE") {
    return String(interval);
  }
  else if (var == "PERCENTVALUE") {
    return percentValue;
  }
  else if (var == "OUTPUTTYPEVALUE") {
    return outputTypeValue;
  }
  else if (var == "OUTPUTREVVALUE") {
    return outputRevValue;
  }
  else if (var == "TRANSISTORVALUE") {
    return transistorValue;
  }
  else if (var == "TXVALUE") {
    return transXValue;
  }
  else if (var == "TYVALUE") {
    return transYValue;
  }
  else if(var == "RELAYVALUE"){
    return relayValue;
  }
  else if(var == "RXVALUE"){
    return relayXValue;
  }
  else if(var=="RYVALUE"){
    return relayYValue;
  }
  return String();
}



// Parametreler
float minDis;
float maxDis;
float offset;
float percent;
String outputType;
String outputTypeRevers;
String transistor;
int transX;
int transY;
String relay;
int relayX;
int relayY;









void setup() {

  // EEPROM
  preferences.begin(resetNamespace, false);

  // ilk mi
  if (!preferences.getBool(firstRunKey, false)) {
    //Serial.println("First run...");


    preferences.putString(mindisKey, mindisValue);
    preferences.putString(maxdisKey, maxdisValue);
    preferences.putString(offsetKey, offsetValue);
    preferences.putString(percentKey, percentValue);
    preferences.putString(outputTypeKey, outputTypeValue);
    preferences.putString(outputRevKey, outputRevValue);
    preferences.putString(transistorKey, transistorValue);
    preferences.putString(transXKey, transXValue);
    preferences.putString(transYKey, transYValue);
    preferences.putString(relayKey, relayValue);
    preferences.putString(relayXKey, relayXValue);
    preferences.putString(relayYKey, relayYValue);
    preferences.putULong(intervalKey, interval);

    preferences.putBool(firstRunKey, true);

    delay(10);
    // Cihazı resetle
    ESP.restart();
  } else {
    //Serial.println("loading saved values...");

    // Load the saved values from Preferences
    mindisValue = preferences.getString(mindisKey, "30");
    maxdisValue = preferences.getString(maxdisKey, "4000");
    offsetValue = preferences.getString(offsetKey, "0");
    percentValue = preferences.getString(percentKey, "0.0");
    outputTypeValue = preferences.getString(outputTypeKey, "0");
    outputRevValue = preferences.getString(outputRevKey, "0");
    transistorValue = preferences.getString(transistorKey, "0");
    transXValue = preferences.getString(transXKey, "40");
    transYValue = preferences.getString(transYKey, "50");
    relayValue = preferences.getString(relayKey,"0");
    relayXValue = preferences.getString(relayXKey,"40");
    relayYValue = preferences.getString(relayYKey,"50");
    interval = preferences.getULong(intervalKey, 0);
  }

  preferences.end();

  setParam(mindisValue, maxdisValue, offsetValue, interval, percentValue, outputTypeValue, outputRevValue, transistorValue, transXValue, transYValue,relayValue,relayXValue,relayYValue);

  // OLED ekran başlatma
  display.begin(SSD1306_SWITCHCAPVCC, OLED_ADDRESS);
  display.clearDisplay();

  //modbus
  //Serial.begin(19200, SERIAL_8E1);

  // Seri portları başlatma
  Serial.begin(115200);
  Serial2.begin(9600, SERIAL_8N1, RXD2, TXD2);
  //Serial.println("1. interval: " + interval);

  if (!SPIFFS.begin(true)) {
    Serial.println("An Error has occurred while mounting SPIFFS");
    return;
  }
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi..");
  }

  Serial.println(WiFi.localIP());


  // HTML
  server.on("/", HTTP_GET, [](AsyncWebServerRequest * request) {
    AsyncWebServerResponse *response = request->beginResponse(SPIFFS, "/index.html", String(), false, processor);
    response->addHeader("Access-Control-Allow-Origin", "*");
    request->send(response);
  });

  server.on("/config", HTTP_GET, [](AsyncWebServerRequest * request) {
    request->send(SPIFFS, "/config.html", String(), false, processor);
  });

  server.on("/doc", HTTP_GET, [](AsyncWebServerRequest * request) {
    request->send(SPIFFS, "/documentation.html", String(), false, processor);
  });

  // Styles
  server.on("/css/style.css", HTTP_GET, [](AsyncWebServerRequest * request) {
    request->send(SPIFFS, "/css/style.css", "text/css");
  });
  server.on("/css/bootstrap.min.css", HTTP_GET, [](AsyncWebServerRequest * request) {
    request->send(SPIFFS, "/css/bootstrap.min.css", "text/css");
  });

  // Scripts
  server.on("/js/bootstrap.bundle.min.js", HTTP_GET, [](AsyncWebServerRequest * request) {
    request->send(SPIFFS, "/js/bootstrap.bundle.min.js", "text/javascript");
  });
  server.on("/js/bar.js", HTTP_GET, [](AsyncWebServerRequest * request) {
    request->send(SPIFFS, "/js/bar.js", "text/javascript");
  });
  server.on("/js/distance_indicator.js", HTTP_GET, [](AsyncWebServerRequest * request) {
    request->send(SPIFFS, "/js/distance_indicator.js", "text/javascript");
  });
  server.on("/js/language.js", HTTP_GET, [](AsyncWebServerRequest * request) {
    request->send(SPIFFS, "/js/language.js", "text/javascript");
  });
  server.on("/js/outputBar.js", HTTP_GET, [](AsyncWebServerRequest * request) {
    request->send(SPIFFS, "/js/outputBar.js", "text/javascript");
  });
  server.on("/js/main.js", HTTP_GET, [](AsyncWebServerRequest * request) {
    request->send(SPIFFS, "/js/main.js", "text/javascript");
  });

  // Assets
  server.on("/assets/ico/favicon.ico", HTTP_GET, [](AsyncWebServerRequest * request) {
    request->send(SPIFFS, "/assets/ico/favicon.ico", "image/x-icon");
  });
  server.on("/assets/ico/down-66.png", HTTP_GET, [](AsyncWebServerRequest * request) {
    request->send(SPIFFS, "/assets/ico/down-66.png", "image/png");
  });
  server.on("/assets/ico/up-66.png", HTTP_GET, [](AsyncWebServerRequest * request) {
    request->send(SPIFFS, "/assets/ico/up-66.png", "image/png");
  });
  server.on("/assets/ico/output-time-66.png", HTTP_GET, [](AsyncWebServerRequest * request) {
    request->send(SPIFFS, "/assets/ico/output-time-66.png", "image/png");
  });
  server.on("/assets/ico/object-48.png", HTTP_GET, [](AsyncWebServerRequest * request) {
    request->send(SPIFFS, "/assets/ico/object-48.png", "image/png");
  });
  server.on("/assets/ico/offset-66.png", HTTP_GET, [](AsyncWebServerRequest * request) {
    request->send(SPIFFS, "/assets/ico/offset-66.png", "image/png");
  });
  server.on("/assets/ico/sensor-48.png", HTTP_GET, [](AsyncWebServerRequest * request) {
    request->send(SPIFFS, "/assets/ico/sensor-48.png", "image/png");
  });

  // Flags
  server.on("/assets/ico/flags/turkey.png", HTTP_GET, [](AsyncWebServerRequest * request) {
    request->send(SPIFFS, "/assets/ico/flags/turkey.png", "image/png");
  });
  server.on("/assets/ico/flags/uk.png", HTTP_GET, [](AsyncWebServerRequest * request) {
    request->send(SPIFFS, "/assets/ico/flags/uk.png", "image/png");
  });
  server.on("/assets/ico/flags/spain.png", HTTP_GET, [](AsyncWebServerRequest * request) {
    request->send(SPIFFS, "/assets/ico/flags/spain.png", "image/png");
  });
  server.on("/assets/ico/flags/japan.png", HTTP_GET, [](AsyncWebServerRequest * request) {
    request->send(SPIFFS, "/assets/ico/flags/japan.png", "image/png");
  });
  server.on("/assets/ico/flags/italy.png", HTTP_GET, [](AsyncWebServerRequest * request) {
    request->send(SPIFFS, "/assets/ico/flags/italy.png", "image/png");
  });
  server.on("/assets/ico/flags/germany.png", HTTP_GET, [](AsyncWebServerRequest * request) {
    request->send(SPIFFS, "/assets/ico/flags/germany.png", "image/png");
  });
  server.on("/assets/ico/flags/france.png", HTTP_GET, [](AsyncWebServerRequest * request) {
    request->send(SPIFFS, "/assets/ico/flags/france.png", "image/png");
  });
  server.on("/assets/ico/flags/china.png", HTTP_GET, [](AsyncWebServerRequest * request) {
    request->send(SPIFFS, "/assets/ico/flags/china.png", "image/png");
  });

  // Fonts
  server.on("/assets/font/NunitoB.woff2", HTTP_GET, [](AsyncWebServerRequest * request) {
    request->send(SPIFFS, "/assets/font/NunitoB.woff2", "font/woff2");
  });
  server.on("/assets/font/NunitoB.woff", HTTP_GET, [](AsyncWebServerRequest * request) {
    request->send(SPIFFS, "/assets/font/NunitoB.woff", "font/woff");
  });
  server.on("/assets/font/NunitoI.woff2", HTTP_GET, [](AsyncWebServerRequest * request) {
    request->send(SPIFFS, "/assets/font/NunitoI.woff2", "font/woff2");
  });
  server.on("/assets/font/NunitoI.woff", HTTP_GET, [](AsyncWebServerRequest * request) {
    request->send(SPIFFS, "/assets/font/NunitoI.woff", "font/woff");
  });
  server.on("/assets/font/NunitoM.woff2", HTTP_GET, [](AsyncWebServerRequest * request) {
    request->send(SPIFFS, "/assets/font/NunitoM.woff2", "font/woff2");
  });
  server.on("/assets/font/NunitoM.woff", HTTP_GET, [](AsyncWebServerRequest * request) {
    request->send(SPIFFS, "/assets/font/NunitoM.woff", "font/woff");
  });






  server.on("/param", HTTP_GET, [](AsyncWebServerRequest * request) {
    String inputMessage;
    if (request->hasParam(PARAM_INPUT) && request->hasParam(PARAM_INPUT1) && request->hasParam(PARAM_INPUT2)) {

      String p1 = request->getParam(PARAM_INPUT)->value();  // min
      String p2 = request->getParam(PARAM_INPUT1)->value(); // max
      String p3 = request->getParam(PARAM_INPUT2)->value(); //offset
      String p4 = request->getParam(PARAM_INPUT3)->value(); //interval
      String p6 = request->getParam(PARAM_OUTPUT)->value(); //outputType
      String p7 = request->getParam(PARAM_OUTPUT1)->value(); //outputTypeRev
      String p8 = request->getParam(PARAM_OUTPUT2)->value(); //transistor
      String p9 = request->getParam(PARAM_OUTPUT3)->value(); //transXVal
      String p10 = request->getParam(PARAM_OUTPUT4)->value(); //transYVal
      String p11 = request->getParam(PARAM_OUTPUT5)->value(); //relay
      String p12 = request->getParam(PARAM_OUTPUT6)->value(); //relayXVal
      String p13 = request->getParam(PARAM_OUTPUT7)->value(); //relayYVal
      events.send(String(p1).c_str(), "MinDis", millis());
      events.send(String(p2).c_str(), "MaxDis", millis());
      events.send(String(p3).c_str(), "OffsetVal", millis());
      events.send(String(p4).c_str(), "IntervalVal", millis());
      unsigned long p4_ULong = strtoul(p4.c_str(), NULL, 10);
      events.send(String(p6).c_str(), "OutputVal", millis());
      events.send(String(p7).c_str(), "OutputValRev", millis());
      events.send(String(p8).c_str(), "TransistorVal", millis());
      events.send(String(p9).c_str(), "TransXVal", millis());
      events.send(String(p10).c_str(), "TransYVal", millis());
      events.send(String(p11).c_str(), "RelayVal", millis());
      events.send(String(p12).c_str(), "RelayXVal", millis());
      events.send(String(p13).c_str(), "RelayYVal", millis());
      writeEeprom(p1, p2, p3, p4_ULong, p6, p7, p8, p9, p10,p11,p12,p13);
      setParam(p1, p2, p3, p4_ULong, percentValue, p6, p7, p8, p9, p10,p11,p12,p13);
    } else {
      inputMessage = "No message sent";
    }
    Serial.println("MinDis: " + mindisValue + "/MaxDis: " + maxdisValue
                   + "/Offset: " + offsetValue + "/Interval: " + interval
                   + "/outputType: " + outputType + "/outputTypeRev: " + outputTypeRevers
                   + "/transistor: " + transistor + "/transX: " + transX + "/transY: " + transY
                   + "/relay: " + relay + "/relayX: "+ relayX + "/relayY: "+ relayY);
    request->send(200, "text/plain", "OK");

  });

  // Handle Web Server Events
  events.onConnect([](AsyncEventSourceClient * client) {
    if (client->lastId()) {
      Serial.printf("Client reconnected! Last message ID that it got is: %u\n", client->lastId());
    }
    client->send("hello!", NULL, millis(), 1000);
  });

  // Modbus setup

  server.addHandler(&events);
  server.begin();


  Serial.println("/outputTypeValue: " + outputTypeValue + "/outputRevValue: " + outputRevValue
                 + "/transistorValue: " + transistorValue +"/relayValue: " + relayValue);
  Serial.println("/outputType: " + outputType + "/outputTypeRev: " + outputTypeRevers
                 + "/transistor: " + transistor + "/transXVal" + transXValue + "/transYVal: " + transYValue
                 + "/relay: " + relayValue + "/relayXVal: "+ relayXValue + "/relayYVal: "+ relayYValue);

}
void loop() {
  // MODBUS OP
  //Serial.println("OTRV: "+ outputRevValue);
  // Ultrasonik sensör verilerini okuma
  unsigned long currentMillis = millis();
  if (currentMillis - previousMillis1 >= 50) {
    previousMillis1 = currentMillis;
    if (readSensorData()) {
      distanceCalc = distance + distance * percent;
      if (distanceCalc > 30 && distanceCalc < 4000) {
        //Serial.println("distance : " + String(distance / 10));

        if (currentMillis - previousMillis >= interval) { // çıkış süresi boyunca yapılacaklar
          previousMillis = currentMillis;
          events.send(String(distanceCalc).c_str(), "DistanceVal", millis());

          // Output Type
          switch (outputTypeValue.toInt()) { // toInt() ile integer değere dönüştürüyoruz
            case 0:
              // OFF
              break;
            case 1:
              // 4-20mA
              calcOutType1(outputTypeRevers != "1", minDis, maxDis, distanceCalc);
              break;
            case 2:
              // 0-10V
              calcOutType2(outputTypeRevers != "2", minDis, maxDis, distanceCalc);
              break;
            case 3:
              // 4-20mA / 0-10V
              if (outputTypeRevers == "1" || outputTypeRevers == "3") {
                calcOutType1(false, minDis, maxDis, distanceCalc);
              } else {
                calcOutType1(true, minDis, maxDis, distanceCalc);
              }
              if (outputTypeRevers == "2" || outputTypeRevers == "3") {
                calcOutType2(false, minDis, maxDis, distanceCalc);
              } else {
                calcOutType2(true, minDis, maxDis, distanceCalc);
              }
              break;
            default:
              // Anomali
              break;
          }

          // Transistor Value
          switch (transistorValue.toInt()) { 
            case 0:
              // OFF
              break;
            case 1:
              if (minDis < distanceCalc) {
                Serial.println("TransistörValue 1 : ");
              }
              break;
            case 2:
              if (minDis > distanceCalc) {
                Serial.println("TransistörValue 2 : ");
              }
              break;
            case 3:
              if (maxDis < distanceCalc) {
                Serial.println("TransistörValue 3 : ");
              }
              break;
            case 4:
              if (maxDis > distanceCalc) {
                Serial.println("TransistörValue 4 : ");
              }
              break;
            case 5:
              if (minDis < distanceCalc && distanceCalc < maxDis) {
                Serial.println("TransistörValue 5 : ");
              }
              break;
            case 6:
              if (transX < distanceCalc) {
                Serial.printf("TransistörValue 6 X:%d\n", transX);
              }
              break;
            case 7:
              if (transX > distanceCalc) {
                Serial.printf("TransistörValue 7 X:%d\n", transX);
              }
              break;
            case 8:
              if (transX < distanceCalc && distanceCalc < transY) {
                Serial.printf("TransistörValue 8 X:%d Y:%d\n", transX, transY);
              }
              break;
            case 9:
              if (minDis < distanceCalc && distanceCalc < transX) {
                Serial.printf("TransistörValue 9.1 X:%d Y:%d\n", transX, transY);
              } else if (transY < distanceCalc && distanceCalc < maxDis) {
                Serial.printf("TransistörValue 9.2 X:%d Y:%d\n", transX, transY);
              }
              break;
            default:
              // Anomali
              break;
          }

          // Relay Value
          switch (relayValue.toInt()) { 
            case 0:
              // OFF
              break;
            case 1:
              if (minDis < distanceCalc) {
                Serial.println("RelayValue 1 : ");
              }
              break;
            case 2:
              if (minDis > distanceCalc) {
                Serial.println("RelayValue 2 : ");
              }
              break;
            case 3:
              if (maxDis < distanceCalc) {
                Serial.println("RelayValue 3 : ");
              }
              break;
            case 4:
              if (maxDis > distanceCalc) {
                Serial.println("RelayValue 4 : ");
              }
              break;
            case 5:
              if (minDis < distanceCalc && distanceCalc < maxDis) {
                Serial.println("RelayValue 5 : ");
              }
              break;
            case 6:
              if (relayX < distanceCalc) {
                Serial.printf("RelayValue 6 X:%d\n", relayX);
              }
              break;
            case 7:
              if (relayX > distanceCalc) {
                Serial.printf("RelayValue 7 X:%d\n", relayX);
              }
              break;
            case 8:
              if (relayX < distanceCalc && distanceCalc < relayY) {
                Serial.printf("RelayValue 8 X:%d Y:%d\n", relayX, relayY);
              }
              break;
            case 9:
              if (minDis < distanceCalc && distanceCalc < relayX) {
                Serial.printf("RelayValue 9.1 X:%d Y:%d\n", relayX, relayY);
              } else if (relayY < distanceCalc && distanceCalc < maxDis) {
                Serial.printf("RelayValue 9.2 X:%d Y:%d\n", relayX, relayY);
              }
              break;
            default:
              // Anomali
              break;
          }
        }

      } else {
        Serial.println("Exceeding the lower or upper limit :" + String(distance) + "min:" + String(minDis) + "max:" + String(maxDis));
        events.send(String(distanceCalc).c_str(), "DistanceVal", millis());
      }
    } else {
      Serial.println("ERROR");
    }
  }

  // OLED ekranda değerleri gösterme
  display.clearDisplay();
  displayText(String(distance), 10, 10);

  //delay(60);
}



float calcOffset(float dist, String off) {

  return off.toFloat() / dist;

}

// Sensör verilerini okuma fonksiyonu
bool readSensorData() {

  do {
    for (int i = 0; i < 4; i++)
    {
      data[i] = Serial2.read();
    }
  } while (Serial2.read() == 0xff);


  Serial2.flush();

  if (data[0] == 0xff) {
    int sum = (data[0] + data[1] + data[2]) & 0x00FF;
    if (sum == data[3]) {
      distance = (data[1] << 8) + data[2];
      return true;
    }
  }
  return false;
}

void setParam(String p1, String p2, String p3, unsigned long p4, String p5, String p6, String p7, String p8, String p9, String p10, String p11, String p12,String p13) {
  minDis = p1.toFloat();
  maxDis = p2.toFloat();
  offset = p3.toFloat();
  interval = p4;
  percent = p5.toFloat();
  outputType = p6;
  outputTypeRevers = p7;
  transistor = p8;
  transX = p9.toInt();
  transY = p10.toInt();
  relay = p11;
  relayX = p12.toInt();
  relayY = p13.toInt();


  events.send(String(p6).c_str(), "OutputVal", millis());
  events.send(String(p7).c_str(), "OutputValRev", millis());
  events.send(String(p8).c_str(), "TransistorVal", millis());
  events.send(String(p9).c_str(), "TransXVal", millis());
  events.send(String(p10).c_str(), "TransYVal", millis());
}

void writeEeprom(String p1, String p2, String p3, unsigned long p4, String p6, String p7, String p8, String p9, String p10, String p11, String p12,String p13) {
  Serial.println("Eeproma gelen p7: " + p7);
  delay(2000);
  preferences.begin(resetNamespace, false);
  if (p1 != mindisValue) {
    mindisValue = p1;
    preferences.putString(mindisKey, p1);
  }
  if (p2 != maxdisValue) {
    maxdisValue = p2;
    preferences.putString(maxdisKey, p2);
  }
  if (p3 != offsetValue) {
    offsetValue = p3;
    percent = calcOffset(distance, offsetValue);
    percentValue = String(percent);


    preferences.putString(offsetKey, p3);
    preferences.putString(percentKey, percentValue);

  }
  if (p4 != interval) {
    interval = p4;
    preferences.putULong(intervalKey, interval);
  }
  if (p6 != outputTypeValue) {
    outputTypeValue = p6;
    preferences.putString(outputTypeKey, outputTypeValue);
  }
  if (String(p7) != outputRevValue) {
    outputRevValue = String(p7);
    preferences.putString(outputRevKey, outputRevValue);
  }
  if (p8 != transistorValue) {
    transistorValue = p8;
    preferences.putString(transistorKey, transistorValue);
  }
  if (p9 != transXValue) {
    transXValue = p9;
    preferences.putString(transXKey, transXValue);
  }
  if (p10 != transYValue) {
    transYValue = p10;
    preferences.putString(transYKey, transYValue);
  }
  if(p11 != relayValue){
    relayValue=p11;
    preferences.putString(relayKey,relayValue);
  }
  if(p12 != relayXValue){
    relayXValue=p12;
    preferences.putString(relayXKey,relayXValue);
  }
  if(p13 != relayYValue){
    relayYValue=p13;
    preferences.putString(relayYKey,relayYValue);
  }



  preferences.end();
  delay(10);
  events.send(percentValue.c_str(), "PercentVal", millis());
  //////////
}

void calcOutType1(float flag, float minD, float maxD, float dist) {
  if (flag) {
    int y = map(dist, minD, maxD, 652, 3265);
    //Serial.println("4-20mA OUT: " + String(y));
  } else {
    int y = map(dist, maxD, minD, 652, 3265);
    //Serial.println("4-20mA OUT Reversed: " + String(y));
  }
}

void calcOutType2(float flag, float minD, float maxD, float dist) {
  if (flag) {
    unsigned long y = map(dist, minD, maxD, 0, 32767);
    //Serial.println("0-10V OUT: " + String(y));
  } else {
    int y = map(dist, maxD, minD, 0, 32767);
    //Serial.println("0-10V OUT Reversed: " + String(y));
  }
}



// OLED ekranda metin yazdırma fonksiyonu
void displayText(String text, int x, int y) {
  display.setTextSize(3);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(x, y);
  display.println(text);
  display.display();
}
