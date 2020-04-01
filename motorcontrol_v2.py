import RPi.GPIO as GPIO

from RpiMotorLib import RpimotorLib

GPIO_pins = (14, 15, 18)
direction = 20
step = 21

mymotortest = RpiMotorLib.A4988Nema(direction, step, GPIO_pins, "A4988")

#motor_go(direction, steptype, steps, step delay, verbose, init delay)
mymotortest.motor_go(False, "1/4", 200, .01, False, .05)
 
 
