# Industrial Ultrasonic Distance Sensor

Bu proje, endüstriyel ortamlarda kullanılmak üzere geliştirilmiş temassız bir ultrasonik mesafe ölçer sisteminin tüm kaynaklarını içerir. **product** klasörü altındaki `product.ino` son ürün yazılımını, `data/` klasörü ise web arayüzü ve dokümantasyonu barındırır. Diğer klasörler (`sensor`, `server`, `integration_test` ve `web_panel`) geliştirme ve test aşamalarında kullanılan modülleri içerir.

## Genel Bakış

Proje çekirdeği bir **ESP32** mikrokontrolcüsü üzerinde çalışır. ESP32, ultrasonik sensörden seri port üzerinden gelen mesafeyi okur ve hesaplar; ölçüm sonuçları entegre bir OLED ekranda gösterilir. Aynı zamanda Wi-Fi üzerinden barındırdığı web arayüzü ile cihaz parametrelerinin yapılandırılması sağlanır. Yazılımda `WiFi`, `ESPAsyncWebServer`, `SPIFFS`, `Preferences` ve `ModbusRtu` kütüphaneleri kullanılmıştır. Bu sayede kablosuz erişim, kalıcı parametre kaydı ve Modbus RTU gibi endüstriyel bir haberleşme arayüzü desteklenir.

### Ölçüm Yeteneği

Dokümantasyon sayfasındaki tabloya göre sensör 100 mm ile 3500 mm arasında mesafe ölçebilir ve çözünürlüğü 0.1 mm’dir. Çalışma frekansı 40 kHz olup -20°C ile 70°C sıcaklık aralığında kullanılabilir. Çıkış tipi analog veya dijitaldir ve besleme gerilimi 5V DC’dir. Doğruluk payı tam ölçeğin ±%1’i kadardır.

### Temel Özellikler

- **Wi-Fi ile uzaktan erişim:** ESP32, cihazı bir erişim noktasına bağlar ve web arayüzü sunar. Bu arayüzde minimum ve maksimum mesafe, offset, ölçüm aralığı, çıkış tipi ve Modbus/RTU parametreleri ayarlanabilir.
- **Modbus RTU desteği:** `ModbusRtu.h` kütüphanesi ve ilgili değişkenler sayesinde cihaz, endüstriyel otomasyon sistemlerine Modbus üzerinden bağlanabilir. Slave kimliği, baud hızı ve seri konfigürasyon parametreleri kod içinde tanımlanmıştır.
- **Çoklu çıkış seçenekleri:** Yazılımda röle ve transistor çıkışları için yapılandırma seçenekleri bulunur. `outputTypeValue`, `outputRevValue`, `transistorValue`, `relayValue` gibi değişkenler hem çıkış türünü hem de tersine çevirme ayarını yönetir.
- **OLED ekran:** 128×64 piksel boyutundaki SSD1306 ekran, anlık mesafeyi görüntüler.
- **Kalıcı yapılandırma:** `Preferences` kütüphanesi kullanılarak minimum mesafe, maksimum mesafe, offset, yüzde oranı ve çıkış ayarları hafızada saklanır. Cihaz açıldığında bu parametreler yüklenir; ilk çalıştırmada varsayılan değerler kaydedilir.

## Klasör Yapısı

| Klasör | İçerik / Amaç |
|---|---|
| `product/` | Son ürün yazılımı (`product.ino`) ve web arayüzü dosyaları. `data` alt klasöründeki HTML/CSS/JS dosyaları SPIFFS’e yüklenerek ESP32 üzerinden servis edilir. |
| `sensor/` | Ultrasonik sensörün temel okuma ve OLED gösterimi için hazırlanan örnek kod (`sensor.ino`). |
| `server/` | Basit bir web sunucusu örneği (`server.ino`). Wi-Fi bağlantısı ve parametre değişimini test etmek için kullanılır. |
| `web_panel/` | İlk geliştirme aşamasında kullanılan web paneli tasarımı. HTML, CSS ve JavaScript dosyaları içerir. |
| `integration_test/` | Farklı bileşenleri birleştirmek için hazırlanmış entegrasyon test kodu ve web sayfaları. |
| `ESP32-pinout-diagram.jpg` | ESP32 pin yerleşimini gösteren referans görsel. |

## Kurulum ve Kullanım

1. **Depoyu klonlayın**

       git clone https://github.com/Atakan-Demir/Industrial_Ultrasonic_Distance_Sensor.git
       cd Industrial_Ultrasonic_Distance_Sensor

2. **Arduino IDE veya PlatformIO ayarları**
   - Kart tipi olarak **ESP32 Dev Module** seçin.
   - Uygun seri portu bağlayın.
   - Gerekli kütüphaneleri kurun: `ESPAsyncWebServer`, `AsyncTCP`, `Adafruit SSD1306`, `Preferences`, `ModbusRtu`.

3. **SPIFFS’e web dosyalarını yükleyin**
   - `product/data` klasöründeki içerikler (HTML, CSS, JS, assets) SPIFFS dosya sistemine yüklenmelidir.
   - Arduino IDE’de **ESP32 Sketch Data Upload** eklentisi ile bu klasörü karta yükleyin.

4. **Kodu derleyip karta yükleyin**
   - `product/product.ino` dosyasını açın.
   - Derleyin ve ESP32’ye yükleyin.
   - İlk çalıştırmada yazılım varsayılan parametreleri hafızaya kaydeder.

5. **Cihaza bağlanın**
   - ESP32 açıldıktan sonra tanımlı Wi-Fi ağına bağlanır ve IP adresini seri monitörde yazdırır.
   - Tarayıcıdan bu IP adresine giderek web arayüzüne ulaşabilirsiniz.
   - Buradan minimum mesafe, maksimum mesafe, offset, çıkış türü ve haberleşme parametreleri yapılandırılabilir.

6. **Modbus RTU kullanımı**
   - Cihaz, `Modbus slave` olarak yapılandırılmıştır.
   - Belirlenen baud hızı ve seri yapılandırması ile seri port **TXD2/RXD2** üzerinden veri sağlar.
   - `au16data` dizisi Modbus adreslerine karşılık gelen ölçüm ve parametre kayıtlarını tutar.

## Donanım Notları

Projede ESP32 tabanlı bir kontrol kartı, ultrasonik sensör, OLED ekran ve endüstriyel çıkış seçenekleri birlikte kullanılmaktadır. Depoda ayrıca bir ESP32 pin diyagramı görseli de bulunur. Bu görsel, bağlantı ve pin eşlemesi sırasında referans olarak kullanılabilir.

## Arayüz ve Yapılandırma

Son ürünün web arayüzü `product/data` altında yer alır. Bu arayüz üzerinden:

- Mesafe sınırları ayarlanabilir
- Offset değeri girilebilir
- Çıkış tipi seçilebilir
- Röle ve transistor davranışı yapılandırılabilir
- Modbus haberleşme parametreleri değiştirilebilir
- Dokümantasyon sayfasına erişilebilir

## Geliştirme Süreci

Bu repo yalnızca son ürünü değil, geliştirme sürecindeki ara adımları da içerir:

- `sensor/` temel sensör okuma denemeleri
- `server/` temel web sunucu prototipi
- `web_panel/` ilk arayüz tasarımı
- `integration_test/` modüllerin birlikte test edildiği sürüm
- `product/` son ve bütünleşik ürün

Bu yapı sayesinde projenin nasıl evrildiği de takip edilebilir.

## Katkı ve Geliştirme

Bu repo, daha önce geliştirilmiş bir donanım projesinin kaynaklarını arşivlemeyi amaçlamaktadır. Yeni özellik eklemek veya mevcut kodu iyileştirmek isterseniz fork alabilir ve pull request gönderebilirsiniz. Ayrıca hata bildirimleri ve öneriler için GitHub Issues bölümünü kullanabilirsiniz.

## Lisans

Projeye ilişkin açık bir lisans belirtilmemiştir. Kodu ve donanım tasarımlarını kullanmadan önce depo sahibi ile iletişime geçmeniz önerilir.
