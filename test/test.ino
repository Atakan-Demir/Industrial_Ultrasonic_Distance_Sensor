#include <WiFi.h>
#include <ESPAsyncWebServer.h>
#include <SPIFFS.h>
#include <AsyncTCP.h>

// Replace with your network credentials
const char* ssid = "DmR 2.4";
const char* password = "12231551";

const char* PARAM_INPUT = "value";
const char* PARAM_INPUT1 = "maxdis";
const char* PARAM_INPUT2 = "offset";
String sliderValue = "44";
String maxdisValue = "356";
String offsetValue = "3";

AsyncWebServer server(80);
AsyncWebSocket ws("/ws");

String processor(const String& var) {
  if (var == "SLIDERVALUE") return sliderValue;
  if (var == "MAXDISVALUE") return maxdisValue;
  if (var == "OFFSETVALUE") return offsetValue;
  return String();
}

void notifyClients() {
  String message = "MinDis: " + sliderValue + "/MaxDis: " + maxdisValue + "/Offset: " + offsetValue;
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

void setup() {
  Serial.begin(115200);
  
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

  server.on("/", HTTP_GET, [](AsyncWebServerRequest *request){
    request->send(SPIFFS, "/index.html", String(), false, processor);
  });

  server.on("/style.css", HTTP_GET, [](AsyncWebServerRequest *request){
    request->send(SPIFFS, "/style.css", "text/css");
  });

  server.on("/main.js", HTTP_GET, [](AsyncWebServerRequest *request){
    request->send(SPIFFS, "/main.js", "text/javascript");
  });

  server.on("/slider", HTTP_GET, [](AsyncWebServerRequest *request){
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

  server.begin();
}

void loop() {
  ws.cleanupClients();
}
