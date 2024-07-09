#include <SPI.h>
#include <Wire.h>
#include <Adafruit_SSD1306.h>

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
float minDis=3.0;
float maxDis=400.0;
float offset=0.0;


void setup() {
  // OLED ekran başlatma
  display.begin(SSD1306_SWITCHCAPVCC, OLED_ADDRESS);
  display.clearDisplay();

  // Seri portları başlatma
  Serial.begin(115200);
  Serial2.begin(9600, SERIAL_8N1, RXD2, TXD2);

  // Buton pinlerini giriş olarak ayarlama
  for (int i = 0; i < NUM_BUTTONS; i++) {
    pinMode(buttonPins[i], INPUT);
  }
}

void loop() {
  // Ultrasonik sensör verilerini okuma
  if (readSensorData()) {

    if (distance > minDis * 10 && distance < maxDis * 10 ) {
      
      Serial.print("Distance: ");
      Serial.println(distance / 10);

      // Hareketli ortalama hesaplama
      updateMovingAverage(distance / 10);
      float average = total / NUM_READINGS;
      
      // Ortalamayı seri porta yazdırma
      Serial.print("Moving Average: ");
      Serial.print(average, 2);
      Serial.println(" cm");
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
