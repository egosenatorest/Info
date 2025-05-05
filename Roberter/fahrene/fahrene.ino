String command = "";

#define ENA 5
#define IN1 3
#define IN2 4
#define ENB 6
#define IN3 7
#define IN4 8

void setup() {
  Serial.begin(115200);
  while(!Serial); // Nur für Boards mit native USB nötig
  
  // Motortreiber-Pins initialisieren
  pinMode(ENA, OUTPUT);
  pinMode(IN1, OUTPUT);
  pinMode(IN2, OUTPUT);
  pinMode(ENB, OUTPUT);
  pinMode(IN3, OUTPUT);
  pinMode(IN4, OUTPUT);
  
  Serial.println("Roboter-Motortest gestartet");
  Serial.println("Verfügbare Befehle: 1-8 (Pins), L (Links), R (Rechts), F (Vorwärts), S (Stop)");
}

void loop() {
  if(Serial.available()){

command = Serial.readString();

  }
  if (command== "links") {
turnLeft();
  }
  if (Serial.available()) {
    char cmd = Serial.read();
    
    // Einzelne Pins testen
    if(cmd >= '1' && cmd <= '8') {
      int pin = cmd - '0';
      Serial.print("Teste Pin ");
      Serial.println(pin);
      pinMode(pin, OUTPUT);
      digitalWrite(pin, HIGH);
      delay(500);
      digitalWrite(pin, LOW);
      return;
    }
    
    // Motorfunktionen testen
    switch(cmd) {
      case 'L': 
        turnLeft();
        Serial.println("Linksdrehung aktiviert");
        break;
      case 'R':
        turnRight();
        Serial.println("Rechtsdrehung aktiviert");
        break;
      case 'F':
        moveForward();
        Serial.println("Vorwärtsfahrt aktiviert");
        break;
      case 'S':
        stopMotors();
        Serial.println("Motoren gestoppt");
        break;
    }
  }
}
void moveForward() {
  digitalWrite(IN1, HIGH);
  digitalWrite(IN2, LOW);
  digitalWrite(IN3, HIGH);
  digitalWrite(IN4, LOW);
  analogWrite(ENA, 200);
  analogWrite(ENB, 200);
}

void turnLeft() {
  digitalWrite(IN1, HIGH);
  digitalWrite(IN2, HIGH);
  digitalWrite(IN3, LOW);
  digitalWrite(IN4, LOW);
  analogWrite(ENA, 200);
  analogWrite(ENB, 200);
}

void turnRight() {
  digitalWrite(IN1, HIGH);
  digitalWrite(IN2, LOW);
  digitalWrite(IN3, LOW);
  digitalWrite(IN4, HIGH);
  analogWrite(ENA, 200);
  analogWrite(ENB, 200);
}

void stopMotors() {
  digitalWrite(IN1, LOW);
  digitalWrite(IN2, LOW);
  digitalWrite(IN3, LOW);
  digitalWrite(IN4, LOW);
  analogWrite(ENA, 0);
  analogWrite(ENB, 0);
}




 