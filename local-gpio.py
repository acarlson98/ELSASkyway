import paho.mqtt.client as mqtt
import RPi.GPIO as GPIO
import time
 
def on_connect(client, userdata, flag, rc):
    print("Connected with result code "+str(rc))
    client.subscribe("isyjp/gpio21")
 
def on_message(client, userdata, msg):
     print(msg.topic+" "+str(msg.payload))
     GPIO.output(21,1)
     GPIO.output(20,1)
     GPIO.output(16,1)
     GPIO.output(12,1)

    # 21 = red
    # 20 = yellow
    # 16 = blue
    # 12 = green

     if msg.payload == "up":
         GPIO.output(21,1)
         GPIO.output(20,0)
         GPIO.output(16,0)
         GPIO.output(12,0)
         print("up")
     if msg.payload == "down":
         GPIO.output(21,0)
         GPIO.output(20,1)
         GPIO.output(16,0)
         GPIO.output(12,0)
         print("down")
     if msg.payload == "left":
         GPIO.output(21,0)
         GPIO.output(20,0)
         GPIO.output(16,1)
         GPIO.output(12,0)
         print("left")
     if msg.payload == "right":
         GPIO.output(21,0)
         GPIO.output(20,0)
         GPIO.output(16,0)
         GPIO.output(12,1)
         print("right")
 
def on_disconnect():
    pass
 
GPIO.setmode(GPIO.BCM)
GPIO.setup(21, GPIO.OUT)
GPIO.setup(20, GPIO.OUT)
GPIO.setup(16, GPIO.OUT)
GPIO.setup(12, GPIO.OUT)
 
client = mqtt.Client()
client.on_connect = on_connect
client.on_disconnect = on_disconnect
client.on_message = on_message
 
client.connect("localhost",1883,60)
client.loop_forever()