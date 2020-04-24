import paho.mqtt.client as mqtt
import RPi.GPIO as GPIO
import time
import smtplib
 
DIR = 20
STEP = 21
CW = 1
CCW = 0
SPR = 12
DELAY = 0.025

def on_connect(client, userdata, flag, rc):
    print("Connected with result code "+str(rc))
    client.subscribe("isyjp/gpio21")
 
def on_message(client, userdata, msg):
     print(msg.topic+" "+str(msg.payload))
     GPIO.output(DIR,1)
     GPIO.output(STEP,1)

     if msg.payload == "right":
         GPIO.output(DIR, CCW)
         for x in range(SPR):
            GPIO.output(STEP, 1)
            time.sleep(DELAY)
            GPIO.output(STEP, 0)
            time.sleep(DELAY)
         print("right")
     if msg.payload == "left":
         GPIO.output(DIR, CW)
         for x in range(SPR):
            GPIO.output(STEP, 1)
            time.sleep(DELAY)
            GPIO.output(STEP, 0)
            time.sleep(DELAY)
         print("left")
 
def on_disconnect():
    pass
 
GPIO.setmode(GPIO.BCM)
GPIO.setup(21, GPIO.OUT)
GPIO.setup(20, GPIO.OUT)
 
client = mqtt.Client()
client.on_connect = on_connect
client.on_disconnect = on_disconnect
client.on_message = on_message
 
client.connect("localhost",1883,60)
client.loop_forever()