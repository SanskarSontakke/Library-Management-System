import time
import os
import RPi.GPIO as GPIO

# --- Setup GPIO ---
RELAY_PIN = 2  # GPIO 2 (BCM mode)
TEMP_THRESHOLD = 45  # Temperature threshold in °C
COOLING_WAIT_TIME = 60  # Time to wait after fan turns on (in seconds)
NORMAL_WAIT_TIME = 5    # Regular temperature check interval (in seconds)

GPIO.setmode(GPIO.BCM)
GPIO.setup(RELAY_PIN, GPIO.OUT)
GPIO.output(RELAY_PIN, GPIO.HIGH)  # Relay OFF initially (Active Low)

# --- Function to get CPU temperature ---
def get_cpu_temp():
    try:
        temp_str = os.popen("vcgencmd measure_temp").readline()
        temp_val = float(temp_str.replace("temp=", "").replace("'C\n", ""))
        return temp_val
    except Exception as e:
        print("Error reading temperature:", e)
        return 0.0

# --- Main loop ---
try:
    while True:
        temp = get_cpu_temp()
        print(f"CPU Temp: {temp}°C")

        if temp > TEMP_THRESHOLD:
            print(">> High temperature detected! Turning fan ON (Relay ON)")
            GPIO.output(RELAY_PIN, GPIO.LOW)  # Turn ON relay (fan ON)
            time.sleep(COOLING_WAIT_TIME)

            # Recheck temp after cooling wait
            temp = get_cpu_temp()
            print(f"Rechecking temperature after cooling: {temp}°C")

            if temp <= TEMP_THRESHOLD:
                print(">> Temperature normalized. Turning fan OFF (Relay OFF)")
                GPIO.output(RELAY_PIN, GPIO.HIGH)  # Turn OFF relay (fan OFF)
            else:
                print(">> Temperature still high. Keeping fan ON for another cycle.")
                # (Fan remains ON, loop will repeat and wait another 60 sec)
        else:
            print(">> Temperature normal. Fan remains OFF.")
            GPIO.output(RELAY_PIN, GPIO.HIGH)  # Keep fan OFF

        time.sleep(NORMAL_WAIT_TIME)

except KeyboardInterrupt:
    print("\nExiting gracefully...")
finally:
    GPIO.output(RELAY_PIN, GPIO.HIGH)  # Ensure fan is OFF
    GPIO.cleanup()
