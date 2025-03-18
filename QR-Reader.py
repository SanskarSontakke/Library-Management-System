import cv2
import pyzbar.pyzbar as pyzbar
import time

try:
    import RPi.GPIO as GPIO
    HAS_GPIO = True
except ImportError:
    print("RPi.GPIO library not found. Buzzer functionality will be disabled.")
    HAS_GPIO = False

BUZZER_PIN = 3  # GPIO 3 (BCM mode)

def activate_buzzer(duration_seconds=0.1):
    """Activates the buzzer for a specified duration."""
    if HAS_GPIO:
        GPIO.output(BUZZER_PIN, GPIO.HIGH)  # Turn buzzer ON (assuming HIGH is active)
        time.sleep(duration_seconds)
        GPIO.output(BUZZER_PIN, GPIO.LOW)   # Turn buzzer OFF

def decode_single_qr_code():
    """
    Reads QR codes from a USB camera feed, decodes the first detected QR code,
    prints the decoded data, and then exits.  Activates buzzer on start and decode.
    """
    if HAS_GPIO:
        GPIO.setmode(GPIO.BCM)
        GPIO.setup(BUZZER_PIN, GPIO.OUT)
        GPIO.output(BUZZER_PIN, GPIO.LOW) # Initialize buzzer OFF

    try:
        if HAS_GPIO:
            activate_buzzer(0.1) # Buzzer activation on camera start

        cap = cv2.VideoCapture(0)

        if not cap.isOpened():
            print("Error: Could not open camera.")
            return None

        while(True):
            ret, frame = cap.read()
            if not ret:
                print("Error: Could not read frame.")
                break

            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            decoded_objects = pyzbar.decode(gray)

            if decoded_objects:
                for obj in decoded_objects:
                    data = obj.data.decode("utf-8")
                    print(data)
                    if HAS_GPIO:
                        activate_buzzer(0.1) # Buzzer activation on QR code decode
                    cap.release()
                    cv2.destroyAllWindows()
                    return data
                break

            if cv2.waitKey(1) & 0xFF == ord('q'):
                break

        cap.release()
        cv2.destroyAllWindows()
        return None
    except Exception as e:
        print(f"An error occurred: {e}")
        return None
    finally:
        if HAS_GPIO:
            GPIO.cleanup()


if __name__ == "__main__":
    decoded_data = decode_single_qr_code()
    if decoded_data:
        pass
    else:
        pass