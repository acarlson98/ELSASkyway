import smtplib
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
content="\nThe ELSA Emergency Notification System has been triggered\nFollow this link to observe.\nwww.unoteam5.com" # content 

# compose the email. probably should use the email python module
mailtext='From: '+replyto+'\nTo: '+sendtoShow+'\n'
mailtext=mailtext+'Subject:'+subject+'\n'+content
# send the email
s.sendmail(replyto, sendto, mailtext)
# we're done
rslt=s.quit()
# print the result
print('Sendmail result=' + str(rslt[1]))