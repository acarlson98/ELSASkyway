import paho.mqtt.client as mqtt
import RPi.GPIO as GPIO
import time
import smtplib
 
DIR = 20
STEP = 21
CW = 1
CCW = 0
# SPR = 48
SPR = 6
DELAY = 0.1

def on_connect(client, userdata, flag, rc):
    print("Connected with result code "+str(rc))
    client.subscribe("isyjp/gpio21")
 
def on_message(client, userdata, msg):
     print(msg.topic+" "+str(msg.payload))
     GPIO.output(DIR,1)
     GPIO.output(STEP,1)

     if msg.payload == "right":
         GPIO.output(DIR, CW)
         for x in range(SPR):
            GPIO.output(STEP, 1)
            time.sleep(DELAY)
            GPIO.output(STEP, 0)
            time.sleep(DELAY)
         print("right")
     if msg.payload == "left":
         GPIO.output(DIR, CCW)
         for x in range(SPR):
            GPIO.output(STEP, 1)
            time.sleep(DELAY)
            GPIO.output(STEP, 0)
            time.sleep(DELAY)
         print("left")
     if msg.payload == "alert":
         # Split the payload so that the id can be accessed later
         delimit = msg.payload.split(" ")
         # start talking to the SMTP server for Gmail
         s = smtplib.SMTP('smtp.gmail.com', 587)
         s.starttls()
         s.ehlo()
         # now login as my gmail user
         username='acarlson98@gmail.com'
         password='uygsxbulxmzwlwvm'
         s.login(username,password)
         # the email objects
         replyto='elsa.unoteam5@gmail.com' # where a reply to will go
         sendto=['4022535372@vtext.com'] # list to send to
         sendtoShow='me@me.com' # what shows on the email as send to
         subject='Alert from ELSA System' # subject line 
         # compose the email. probably should use the email python module
         content="\nThe ELSA Emergency Notification System has been triggered\nFollow this link to observe.\nwww.unoteam5.com?room=" + delimit[1]
         mailtext='From: '+replyto+'\nTo: '+sendtoShow+'\n'
         mailtext=mailtext+'Subject:'+subject+'\n'+content
         # send the email
         s.sendmail(replyto, sendto, mailtext)
         # we're done
         rslt=s.quit()
         # print the result
         print('Sendmail result=' + str(rslt[1]))
         
 
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