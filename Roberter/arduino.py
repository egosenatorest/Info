import serial
import time
from checken import ermittle_gewinner

arduino = serial.Serial('COM6', 9600)  # COM-Port anpassen!

time.sleep(2)  # Kurz warten bis Verbindung steht

richtung = ermittle_gewinner()
arduino.write(richtung.encode())  # z.B. "links"

print(f"Gesendet: {richtung}")


time.sleep(5)