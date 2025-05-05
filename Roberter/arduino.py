import serial
import time
from checken import ermittle_gewinner

arduino = serial.Serial('COM6', 9600)  

time.sleep(2) 

richtung = ermittle_gewinner()
arduino.write(richtung.encode())  # z.B. "links"

print(f"Gesendet: {richtung}")


time.sleep(5)
