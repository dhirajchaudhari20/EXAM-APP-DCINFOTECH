import os
import time
import datetime
import subprocess
from zoneinfo import ZoneInfo  # <-- No need for pytz anymore

# Target shutdown time (1:00 PM IST)
target_hour = 13
target_minute = 0
IST = ZoneInfo("Asia/Kolkata")

def close_all_apps():
    print("\n[INFO] Closing all applications...")
    subprocess.call("taskkill /f /fi \"status eq running\"", shell=True)

def shutdown_system():
    print("[INFO] Shutting down system in 5 seconds...")
    os.system("shutdown /s /t 5")

def get_time_remaining(now, target):
    remaining = target - now
    total_seconds = int(remaining.total_seconds())
    minutes, seconds = divmod(total_seconds, 60)
    hours, minutes = divmod(minutes, 60)
    return f"{hours}h {minutes}m {seconds}s"
git add . && git commit -m "your awesome message" && git push

def main():
    print("🕒 Auto-shutdown script started. Waiting for 1:00 PM IST...")
    
    while True:
        now = datetime.datetime.now(tz=IST)
        target_time = now.replace(hour=target_hour, minute=target_minute, second=0, microsecond=0)

        if now >= target_time:
            close_all_apps()
            shutdown_system()
            break

        remaining_time = get_time_remaining(now, target_time)
        print(f"⌛ Time remaining until shutdown: {remaining_time}")
        time.sleep(30)

if __name__ == "__main__":
    main()
