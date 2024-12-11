from multiprocessing import Process
import smtplib
import logging

def send_email(to_email, subject, body):
    try:
        with smtplib.SMTP("smtp.gmail.com", 587) as server:
            server.starttls()
            server.login("celicdorde@gmail.com", "vppl jsvi kurr fhrt")  # Koristi App Password
            message = f"Subject: {subject}\n\n{body}"
            server.sendmail("celicdorde@gmail.com", to_email, message)
            logging.info(f"Email sent to {to_email}")
    except Exception as e:
        logging.error(f"Error sending email: {str(e)}")

def trigger_email(to_email, subject, body):
    process = Process(target=send_email, args=(to_email, subject, body))
    process.start()
