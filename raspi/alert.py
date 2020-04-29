import paho.mqtt.client as mqtt
import time
import smtplib

def on_connect(client, userdata, flag, rc):
    print("Connected with result code "+str(rc))
    client.subscribe("isyjp/alert")
 
def on_message(client, userdata, msg):
     print(msg.topic+" "+str(msg.payload))
     # start talking to the SMTP server for Gmail
     s = smtplib.SMTP('smtp.gmail.com', 587)
     s.starttls()
     s.ehlo()
     # now login as my gmail user
     username='acarlson98@gmail.com'
     password='uygsxbulxmzwlwvm'
     s.login(username,password)
     print("Login Done")
     # the email objects
     replyto='elsa.unoteam5@gmail.com' # where a reply to will go
     sendto=['4022535372@vtext.com'] # list to send to
     sendtoShow='me@me.com' # what shows on the email as send to
     subject='Alert from ELSA System' # subject line 
     # compose the email. probably should use the email python module
     content="\nThe ELSA Emergency Notification System has been triggered\nFollow this link to observe.\nwww.unoteam5.com?room=" + str(msg.payload)
     print("Content Done")
     mailtext='From: '+replyto+'\nTo: '+sendtoShow+'\n'
     mailtext=mailtext+'Subject:'+subject+'\n'+content
     # send the email
     s.sendmail(replyto, sendto, mailtext)
     print("Send Done")
     # we're done
     rslt=s.quit()
     # print the result
     print('Sendmail result=' + str(rslt[1]))
         
 
def on_disconnect():
    pass
 
client = mqtt.Client()
client.on_connect = on_connect
client.on_disconnect = on_disconnect
client.on_message = on_message
 
client.connect("localhost",1883,60)
client.loop_forever()