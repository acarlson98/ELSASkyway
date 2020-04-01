#!/usr/bin/env python
import RPi.GPIO as GPIO, time

DIR = 20
STEP = 21
CW = 1
CCW = 0
SPR = 48

GPIO.setmode(GPIO.BCM)
GPIO.setup(DIR, GPIO.OUT)
GPIO.setup(STEP, GPIO.OUT)
# pw = GPIO.PWM(STEP, 500)
GPIO.output(DIR, CW)

for x in range(SPR):
    GPIO.output(STEP, 1)
    time.sleep(0.01)
    GPIO.output(STEP, 0)
    time.sleep(0.01)
    print("loop complete\n")

# def spinMotor(direction, num_steps):
#     GPIO.output(DIR, direction)
#     while num_steps>0:
#         pw.start(1)
#         time.sleep(0.01)
#         num_steps -= 1
#     pw.stop()
#     GPIO.cleanup()
#     return True

# direction_input = raw_input('Enter l for left and r for right: ')
# num_steps = input('How many steps?:')

# if direction_input == 'l':
#         spinMotor(False, num_steps)

# else:
#         spinMotor(True, num_steps)

