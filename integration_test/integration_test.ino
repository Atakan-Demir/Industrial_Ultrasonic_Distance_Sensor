#include <WiFi.h>
#include <WiFiAP.h>
#include <ESPAsyncWebServer.h>
#include <SPIFFS.h>
#include <AsyncTCP.h>
#include <SPI.h>
#include <Wire.h>
#include <Adafruit_SSD1306.h>
#include <Preferences.h>

Preferences preferences;

const char* resetNamespace = "reset";
const char* firstRunKey = "firstRun";
const char* mindisKey = "mindisValue";
const char* maxdisKey = "maxdisValue";
const char* offsetKey = "offsetValue";
const char* percentKey = "percentValue";
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
String mindisValue = "30";
String maxdisValue = "4000";
String offsetValue = "0";
String percentValue = "0.0";
unsigned long interval = 0;

unsigned long previousMillis = 0;


unsigned char data[4] = {};
float distance;


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
  return String();
}



// Hareketli ortalama için ayarlar
const int NUM_READINGS = 5;
float readings[NUM_READINGS];
int currentIndex = 0;
float total = 0.0;




// Parametreler
float minDis;
float maxDis;
float offset;
float percent;


IPAddress local_IP(192, 168, 1, 140); // ESP32'nin IP adresi
IPAddress gateway(192, 168, 1, 1); // Genelde yönlendiricinin IP adresi
IPAddress subnet(255, 255, 255, 0);
IPAddress primaryDNS(8, 8, 8, 8);   // Google DNS
IPAddress secondaryDNS(8, 8, 4, 4);

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
    preferences.putULong(intervalKey, interval);

    preferences.putBool(firstRunKey, true);

    delay(2000);
    // Cihazı resetle
    ESP.restart();
  } else {
    //Serial.println("loading saved values...");

    // Load the saved values from Preferences
    mindisValue = preferences.getString(mindisKey, "30");
    maxdisValue = preferences.getString(maxdisKey, "4000");
    offsetValue = preferences.getString(offsetKey, "0");
    percentValue = preferences.getString(percentKey, "0.0");
    interval = preferences.getULong(intervalKey, 0);
  }

  preferences.end();

  setParam(mindisValue, maxdisValue, offsetValue, interval,percentValue);

  // OLED ekran başlatma
  display.begin(SSD1306_SWITCHCAPVCC, OLED_ADDRESS);
  display.clearDisplay();

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
  if (!WiFi.config(local_IP, gateway, subnet, primaryDNS, secondaryDNS)) {
    Serial.println("STA Failed to configure");
  }
  Serial.println(WiFi.localIP());



  server.on("/", HTTP_GET, [](AsyncWebServerRequest * request) {
    AsyncWebServerResponse *response = request->beginResponse(SPIFFS, "/index.html", String(), false, processor);
    response->addHeader("Access-Control-Allow-Origin", "*");
    request->send(response);
    //request->send(SPIFFS, "/index.html", String(), false, processor);
  });

  server.on("/style.css", HTTP_GET, [](AsyncWebServerRequest * request) {
    request->send(SPIFFS, "/style.css", "text/css");
  });

  server.on("/main.js", HTTP_GET, [](AsyncWebServerRequest * request) {
    request->send(SPIFFS, "/main.js", "text/javascript");
  });

  server.on("/param", HTTP_GET, [](AsyncWebServerRequest * request) {
    String inputMessage;
    if (request->hasParam(PARAM_INPUT) && request->hasParam(PARAM_INPUT1) && request->hasParam(PARAM_INPUT2)) {

      String p1 = request->getParam(PARAM_INPUT)->value();
      String p2 = request->getParam(PARAM_INPUT1)->value();
      String p3 = request->getParam(PARAM_INPUT2)->value(); //offset
      String p4 = request->getParam(PARAM_INPUT3)->value();
      events.send(String(p1).c_str(), "MinDis", millis());
      events.send(String(p2).c_str(), "MaxDis", millis());
      events.send(String(p3).c_str(), "OffsetVal", millis());
      events.send(String(p4).c_str(), "IntervalVal", millis());
      unsigned long p4_ULong = strtoul(p4.c_str(), NULL, 10);

      writeEeprom(p1, p2, p3, p4_ULong);
      setParam(p1, p2, p3, p4_ULong,percentValue);
    } else {
      inputMessage = "No message sent";
    }
    Serial.println("MinDis: " + mindisValue + "/MaxDis: " + maxdisValue + "/Offset: " + offsetValue + "/Interval: " + interval);
    request->send(200, "text/plain", "OK");

  });

  // Handle Web Server Events
  events.onConnect([](AsyncEventSourceClient * client) {
    if (client->lastId()) {
      Serial.printf("Client reconnected! Last message ID that it got is: %u\n", client->lastId());
    }
    client->send("hello!", NULL, millis(), 1000);
  });


  server.addHandler(&events);
  server.begin();



  delay(5000);
  Serial2.flush();
}

void loop() {
  Serial2.flush();
  // Ultrasonik sensör verilerini okuma
  unsigned long currentMillis = millis();
  if (readSensorData()) {
    if (distance + distance * percent  > minDis && distance + distance * percent < maxDis ) {
      // Hareketli ortalama hesaplama
      updateMovingAverage((distance + distance * percent) / 10);
      float average = total / NUM_READINGS;
      Serial.println("distance : " +String(distance / 10));

      if (currentMillis - previousMillis >= interval) {
        previousMillis = currentMillis;
        events.send(String((distance + distance * percent) / 10).c_str(), "DistanceVal", millis());
      }

    } else {
      Serial.println("Exceeding the lower or upper limit :" + String(distance / 10) + "min:" + String(minDis) + "max:" + String(maxDis));
      events.send(String(distance / 10).c_str(), "DistanceVal", millis());
    }
  } else {
    Serial.println("ERROR");
  }

  // OLED ekranda değerleri gösterme
  display.clearDisplay();
  displayText(String(distance / 10), 10, 10);

  delay(3);
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

void setParam(String p1, String p2, String p3, unsigned long p4,String p5) {
  minDis = p1.toFloat();
  maxDis = p2.toFloat();
  offset = p3.toFloat();
  interval = p4;
  percent = p5.toFloat();

}

void writeEeprom(String p1, String p2, String p3, unsigned long p4) {
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
    Serial.print("PERCENT: ");
    Serial.println(percentValue);
    percentValue = String(percent);
    
    preferences.putString(offsetKey, p3);
    preferences.putString(percentKey, percentValue);

  }
  if (p4 != interval) {
    interval = p4;
    preferences.putULong(intervalKey, interval);
  }

  preferences.end();
  delay(2000);
  events.send(percentValue.c_str(), "PercentVal", millis());

}


// Hareketli ortalama güncelleme fonksiyonu
void updateMovingAverage(float newValue) {
  total = total - readings[currentIndex] + newValue;
  readings[currentIndex] = newValue;
  currentIndex = (currentIndex + 1) % NUM_READINGS;
}



// OLED ekranda metin yazdırma fonksiyonu
void displayText(String text, int x, int y) {
  display.setTextSize(3);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(x, y);
  display.println(text);
  display.display();
}
