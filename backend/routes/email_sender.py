from flask_mail import Mail, Message
from flask import current_app

mail = Mail()

def send_email(subject, recipients, body):
    app = current_app._get_current_object()  # Get the current Flask app
    msg = Message(subject, recipients=recipients, body=body)
    
    try:
        with app.app_context():
            mail.send(msg)  # Send the email synchronously
    except Exception as e:
        print(f"Error sending email: {str(e)}")
        raise
