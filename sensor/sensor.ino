#include "SPI.h"                                     // SPI kütüphanesini ekliyoruz
#include "Wire.h"                                    // Wire kütüphanesini ekliyoruz
#include "Adafruit_SSD1306.h"                        // Adafruit'in SSD1306 kütüphanesini ekliyoruz
int genislik = 128;                                  // OLED ekran genişliği (piksel olarak)
int yukseklik = 64;                                  // OLED ekran yüksekliği (piksel olarak)
int adres = 0x3C;                                    // 128x64 için 0x3C (bazı modüllerde 0x3D)
Adafruit_SSD1306 ekran(genislik, yukseklik, &Wire);  // Kütüphaneyi tanımlıyoruz

const int numReadings = 5;    // Ölçüm sayısı
float readings[numReadings];  // Ölçümleri tutacak dizi
int currentIndex = 0;         // Dizide gezinmek için indis
float total = 0.0;            // Toplam değer

const int buton1Pin = 36;
const int buton2Pin = 39;
const int buton3Pin = 34;
const int buton4Pin = 35;

int buton1State = 0;
int buton2State = 0;
int buton3State = 0;
int buton4State = 0;

#define RXD2 16
#define TXD2 17

unsigned char data[4] = {};
float distance;


void setup() {
  ekran.begin(SSD1306_SWITCHCAPVCC, adres);
  Serial.begin(115200);
  Serial2.begin(9600, SERIAL_8N1, RXD2, TXD2);
  pinMode(buton1Pin, INPUT);
  pinMode(buton2Pin, INPUT);
  pinMode(buton3Pin, INPUT);
  pinMode(buton4Pin, INPUT);
}

void loop() {
  do {
    for (int i = 0; i < 4; i++) {
      data[i] = Serial2.read();
    }
  } while (Serial2.read() == 0xff);

  Serial2.flush();

  if (data[0] == 0xff) {
    int sum;
    sum = (data[0] + data[1] + data[2]) & 0x00FF;
    if (sum == data[3]) {
      distance = (data[1] << 8) + data[2];
      if (distance > 30) {
        Serial.print("distance=");
        Serial.println(distance / 10);

        // Değerleri diziye ekleme ve toplamı güncelleme
        total = total - readings[currentIndex] + distance / 10;
        readings[currentIndex] = distance / 10;
        // Gezici indisini güncelleme
        currentIndex = (currentIndex + 1) % numReadings;

        // Ortalama hesaplama
        float average = total / numReadings;

        // Ortalamayı seri porta yazdırma
        Serial.print("Moving Average: ");
        Serial.print(average, 2);  // İki ondalık hassasiyetle yazdırma
        Serial.println(" cm");
        
        
      } else {
        Serial.println("Below the lower limit");
      }
    } else Serial.println("ERROR");
  }
  delay(1);


  ekran.clearDisplay();
  delay(1);
  yaziyaz(String(distance / 10), 10, 10);
  delay(1);

  buton1State = digitalRead(buton1Pin);
  buton2State = digitalRead(buton2Pin);
  buton3State = digitalRead(buton3Pin);
  buton4State = digitalRead(buton4Pin);

  if (buton1State == HIGH) {
    Serial.println("Buton 1 Basıldı.");
  }
  if (buton2State == HIGH) {
    Serial.println("Buton 2 Basıldı.");
  }
  if (buton3State == HIGH) {
    Serial.println("Buton 3 Basıldı.");
  }
  if (buton4State == HIGH) {
    Serial.println("Buton 4 Basıldı.");
  }
}

void yaziyaz(String metin, int cx, int cy) {
  ekran.setTextSize(3);  // Yazı boyutu
  ekran.setTextColor(SSD1306_WHITE);
  ekran.setCursor(cx, cy);  // Başlangıç konumu
  ekran.println(metin);
  ekran.display();
}