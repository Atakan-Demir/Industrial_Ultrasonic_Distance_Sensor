#include <WiFi.h>
#include <ESPAsyncWebServer.h>
#include <SPIFFS.h>
#include <AsyncTCP.h>
#include <SPI.h>
#include <Wire.h>
#include <Adafruit_SSD1306.h>
// Replace with your network credentials
const char* ssid = "DmR 2.4";
const char* password = "12231551";

const char* PARAM_INPUT = "value";
const char* PARAM_INPUT1 = "maxdis";
const char* PARAM_INPUT2 = "offset";
String sliderValue = "44";
String maxdisValue = "356";
String offsetValue = "3";
float randomValue = 0.0; // Rastgele değer için değişken

AsyncWebServer server(80);
AsyncWebSocket ws("/ws");

String processor(const String& var) {
  if (var == "SLIDERVALUE") return sliderValue;
  if (var == "MAXDISVALUE") return maxdisValue;
  if (var == "OFFSETVALUE") return offsetValue;
  if (var == "RANDOMVALUE") return String(randomValue);
  return String();
}

void notifyClients() {
  String message = "MinDis: " + sliderValue + "/MaxDis: " + maxdisValue + "/Offset: " + offsetValue + "/Random: " + String(randomValue);
  ws.textAll(message);
}

void handleWebSocketMessage(void *arg, uint8_t *data, size_t len) {
  AwsFrameInfo *info = (AwsFrameInfo*)arg;
  if (info->final && info->index == 0 && info->len == len && info->opcode == WS_TEXT) {
    data[len] = 0;
    if (strcmp((char*)data, "getValues") == 0) {
      notifyClients();
    }
  }
}

void onEvent(AsyncWebSocket *server, AsyncWebSocketClient *client, AwsEventType type, void *arg, uint8_t *data, size_t len) {
  switch (type) {
    case WS_EVT_CONNECT:
      Serial.println("WebSocket client connected");
      break;
    case WS_EVT_DISCONNECT:
      Serial.println("WebSocket client disconnected");
      break;
    case WS_EVT_DATA:
      handleWebSocketMessage(arg, data, len);
      break;
    case WS_EVT_PONG:
    case WS_EVT_ERROR:
      break;
  }
}


// OLED ekran ayarları
const int SCREEN_WIDTH = 128;
const int SCREEN_HEIGHT = 64;
const int OLED_ADDRESS = 0x3C;
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire);

// Hareketli ortalama için ayarlar
const int NUM_READINGS = 5;
float readings[NUM_READINGS];
int currentIndex = 0;
float total = 0.0;

// Buton pinleri
const int buttonPins[] = {36, 39, 34, 35};
const int NUM_BUTTONS = sizeof(buttonPins) / sizeof(buttonPins[0]);
int buttonStates[NUM_BUTTONS];

// Seri iletişim ayarları
#define RXD2 16
#define TXD2 17

unsigned char data[4] = {};
float distance;


// Parametreler
float minDis = 3.0;
float maxDis = 400.0;
float offset = 0.0;


void setup() {
  // OLED ekran başlatma
  display.begin(SSD1306_SWITCHCAPVCC, OLED_ADDRESS);
  display.clearDisplay();

  // Seri portları başlatma
  Serial.begin(115200);
  Serial2.begin(9600, SERIAL_8N1, RXD2, TXD2);
  if (!SPIFFS.begin(true)) {
    Serial.println("An Error has occurred while mounting SPIFFS");
    return;
  }

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi..");
  }

  Serial.println(WiFi.localIP());

  ws.onEvent(onEvent);
  server.addHandler(&ws);

  server.on("/", HTTP_GET, [](AsyncWebServerRequest * request) {
    request->send(SPIFFS, "/index.html", String(), false, processor);
  });

  server.on("/style.css", HTTP_GET, [](AsyncWebServerRequest * request) {
    request->send(SPIFFS, "/style.css", "text/css");
  });

  server.on("/main.js", HTTP_GET, [](AsyncWebServerRequest * request) {
    request->send(SPIFFS, "/main.js", "text/javascript");
  });

  server.on("/slider", HTTP_GET, [](AsyncWebServerRequest * request) {
    String inputMessage;
    if (request->hasParam(PARAM_INPUT) && request->hasParam(PARAM_INPUT1) && request->hasParam(PARAM_INPUT2)) {
      inputMessage = request->getParam(PARAM_INPUT)->value();
      sliderValue = inputMessage;
      inputMessage = request->getParam(PARAM_INPUT1)->value();
      maxdisValue = inputMessage;
      inputMessage = request->getParam(PARAM_INPUT2)->value();
      offsetValue = inputMessage;
    } else {
      inputMessage = "No message sent";
    }
    Serial.println("MinDis: " + sliderValue + "/MaxDis: " + maxdisValue + "/Offset: " + offsetValue);
    request->send(200, "text/plain", "OK");
    notifyClients();
  });


  randomSeed(analogRead(0)); // Rastgele sayı üretmek için seed oluştur

  server.begin();
  // Buton pinlerini giriş olarak ayarlama
  for (int i = 0; i < NUM_BUTTONS; i++) {
    pinMode(buttonPins[i], INPUT);
  }
}

void loop() {
  // Ultrasonik sensör verilerini okuma
  if (readSensorData()) {

    if (distance > minDis * 10 && distance < maxDis * 10 ) {
/*
      Serial.print("Distance: ");
      Serial.println(distance / 10);
*/
      // Hareketli ortalama hesaplama
      updateMovingAverage(distance / 10);
      float average = total / NUM_READINGS;
      randomValue = distance / 10;
      /*
      // Ortalamayı seri porta yazdırma
      Serial.print("Moving Average: ");
      Serial.print(average, 2);
      Serial.println(" cm");
      */
      
    } else {
      Serial.println("Exceeding the lower or upper limit");
    }
  } else {
    Serial.println("ERROR");
  }

  // OLED ekranda değerleri gösterme
  display.clearDisplay();
  displayText(String(distance / 10), 10, 10);

  // Buton durumlarını okuma
  readButtonStates();
  notifyClients(); // WebSocket üzerinden istemcilere rastgele sayıyı gönder
  ws.cleanupClients();
  delay(3);  // 100ms bekleyerek ölçüm tekrarı
}

// Sensör verilerini okuma fonksiyonu
bool readSensorData() {
  while (Serial2.available() < 4) {
    // Verinin tamamlanmasını bekliyoruz
  }

  for (int i = 0; i < 4; i++) {
    data[i] = Serial2.read();
  }

  if (data[0] == 0xff) {
    int sum = (data[0] + data[1] + data[2]) & 0x00FF;
    if (sum == data[3]) {
      distance = (data[1] << 8) + data[2];
      return true;
    }
  }
  return false;
}

// Hareketli ortalama güncelleme fonksiyonu
void updateMovingAverage(float newValue) {
  total = total - readings[currentIndex] + newValue;
  readings[currentIndex] = newValue;
  currentIndex = (currentIndex + 1) % NUM_READINGS;
}

// Buton durumlarını okuma ve seri porta yazdırma fonksiyonu
void readButtonStates() {
  for (int i = 0; i < NUM_BUTTONS; i++) {
    buttonStates[i] = digitalRead(buttonPins[i]);
    if (buttonStates[i] == HIGH) {
      Serial.print("Button ");
      Serial.print(i + 1);
      Serial.println(" pressed.");
    }
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
