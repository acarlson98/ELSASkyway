import paho.mqtt.client as mqtt
import RPi.GPIO as GPIO
import time
 
def on_connect(client, userdata, flag, rc):
    print("Connected with result code "+str(rc))
    client.subscribe("isyjp/gpio21")
 
def on_message(client, userdata, msg):
     print(msg.topic+" "+str(msg.payload))
     GPIO.output(21,1)
 
     if msg.payload == b"on":
         GPIO.output(21,1)
         print("on")
     else:
         GPIO.output(21,0)
         print("off")
 
def on_disconnect():
    pass
 
GPIO.setmode(GPIO.BCM)
GPIO.setup(21, GPIO.OUT)
 
client = mqtt.Client()
client.on_connect = on_connect
client.on_disconnect = on_disconnect
client.on_message = on_message
 
client.connect("localhost",1883,60)
client.loop_forever()