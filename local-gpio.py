import paho.mqtt.client as mqtt
import RPi.GPIO as GPIO
import time
 
def on_connect(client, userdata, flag, rc):
    print("Connected with result code "+str(rc))
    client.subscribe("isyjp/gpio21")
 
def on_message(client, userdata, msg):
     print(msg.topic+" "+str(msg.payload))
     GPIO.output(21,1)

    if msg.payload == "up":
        # red light on
         GPIO.output(21,1)
        # yellow light on
         GPIO.output(20,1)
         print("up")
    if msg.payload == "down":
        # red light off
         GPIO.output(21,0)
        # yellow light on
         GPIO.output(20,1)
         print("down")
    if msg.payload == "left":
        # red light on
         GPIO.output(21,1)
        # yellow light off
         GPIO.output(20,0)
         print("left")
    if msg.payload == "right":
        # red light off
         GPIO.output(21,0)
        # yellow light off
         GPIO.output(20,0)
         print("right")
 
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