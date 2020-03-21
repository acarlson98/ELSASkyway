import paho.mqtt.client as mqtt
import RPi.GPIO as GPIO
import time

def on_connect(client, userdata,flags, rc):
    print("Connected with result code "+str(rc))
    client.subscribe("elsa/neck")

def on_message(client, userdata, msg):
     print(msg.topic+" "+str(msg.payload))
     if msg.payload == "up":
         GPIO.output(21,1)
         GPIO.output(5,1)
     if msg.payload == "down":
         GPIO.output(21,0)
         GPIO.output(5,1)
     if msg.payload == "left":
         GPIO.output(12,1)
         GPIO.output(6,1)
     if msg.payload == "right":
         GPIO.output(12,0)
         GPIO.output(6,1)

GPIO.setmode(GPIO.BCM)
GPIO.setup(21, GPIO.OUT)

client = mqtt.Client()
client.on_connect = on_connect
client.on_message = on_message

client.tls_set("/etc/ssl/certs/ca-certificates.crt")

client.username_pw_set("kfcszpzx", "D9xolQj8HHgI")
client.connect("tailor.cloudmqtt.com", 22964)

client.loop_forever()
