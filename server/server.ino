// Import required libraries
#include "WiFi.h"
#include "ESPAsyncWebServer.h"
#include "SPIFFS.h"

// Replace with your network credentials
const char* ssid = "DmR 2.4";
const char* password = "12231551";



const char* PARAM_INPUT = "value";
const char* PARAM_INPUT1 = "maxdis";
const char* PARAM_INPUT2 = "offset";
String sliderValue = "44";
String maxdisValue = "356";
String offsetValue = "3";


// Create AsyncWebServer object on port 80
AsyncWebServer server(80);

// Replaces placeholder with LED state value
String processor(const String& var){
  
  
  if (var == "SLIDERVALUE"){
    return sliderValue;
  }
  if (var == "MAXDISVALUE"){
    return maxdisValue;
  }
  if (var == "OFFSETVALUE"){
    return offsetValue;
  }
  return String();
}
 
void setup(){
  // Serial port for debugging purposes
  Serial.begin(115200);


  // Initialize SPIFFS
  if(!SPIFFS.begin(true)){
    Serial.println("An Error has occurred while mounting SPIFFS");
    return;
  }

  // Connect to Wi-Fi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi..");
  }

  // Print ESP32 Local IP Address
  Serial.println(WiFi.localIP());

  // Route for root / web page
  server.on("/", HTTP_GET, [](AsyncWebServerRequest *request){
    request->send(SPIFFS, "/index.html", String(), false, processor);

  });
  
  // Route to load style.css file
  server.on("/style.css", HTTP_GET, [](AsyncWebServerRequest *request){
    request->send(SPIFFS, "/style.css", "text/css");
  });

   // Route to load style.css file
  server.on("/main.js", HTTP_GET, [](AsyncWebServerRequest *request){
    request->send(SPIFFS, "/main.js", "text/javascript");
  });

  // Send a GET request to <ESP_IP>/slider?value=<inputMessage>
  server.on("/slider", HTTP_GET, [] (AsyncWebServerRequest *request) {
    String inputMessage;
    // GET input1 value on <ESP_IP>/slider?value=<inputMessage>
    if (request->hasParam(PARAM_INPUT)&&request->hasParam(PARAM_INPUT1)&&request->hasParam(PARAM_INPUT2)) {
 
      inputMessage = request->getParam(PARAM_INPUT)->value();
      sliderValue = inputMessage;
      inputMessage = request->getParam(PARAM_INPUT1)->value();
      maxdisValue = inputMessage;
      inputMessage = request->getParam(PARAM_INPUT2)->value();
      offsetValue = inputMessage;
    }

    else {
      inputMessage = "No message sent";
    }
    Serial.println("MinDis: "+sliderValue+"/MaxDis: "+maxdisValue+"/Offset: "+offsetValue);
    request->send(200, "text/plain", "OK");

  });
  

  // Start server
  server.begin();
}
 
void loop(){

}
