"""
SmartSmile Email Service
Sends custom emails from SmartSmile instead of Supabase
"""
import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
import logging

logger = logging.getLogger(__name__)

# Email configuration - using Gmail SMTP
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
SMTP_USERNAME = "smartsmile.oralhealth@gmail.com"  # Your Gmail address
SMTP_PASSWORD = os.environ.get('SMTP_PASSWORD', '')  # App password from user
FROM_NAME = "SmartSmile"
FROM_EMAIL = "noreply@smartsmile.com"

# Fallback to Gmail if custom domain not available
FALLBACK_FROM_EMAIL = "smartsmile.oralhealth@gmail.com"


def get_email_credentials():
    """Get SMTP credentials from environment"""
    return {
        'username': os.environ.get('SMTP_USERNAME', SMTP_USERNAME),
        'password': os.environ.get('SMTP_PASSWORD', SMTP_PASSWORD),
        'from_name': os.environ.get('EMAIL_FROM_NAME', FROM_NAME),
        'from_email': os.environ.get('EMAIL_FROM_EMAIL', FALLBACK_FROM_EMAIL)
    }


def send_email(to_email: str, subject: str, html_content: str, text_content: Optional[str] = None) -> bool:
    """
    Send an email using Gmail SMTP
    
    Args:
        to_email: Recipient email address
        subject: Email subject line
        html_content: HTML version of the email body
        text_content: Plain text version (optional, auto-generated if not provided)
    
    Returns:
        True if email sent successfully, False otherwise
    """
    creds = get_email_credentials()
    
    logger.info(f"Attempting to send email to {to_email}")
    logger.info(f"Using username: {creds['username']}")
    logger.info(f"From email: {creds['from_email']}")
    logger.info(f"Password length: {len(creds['password'])}")
    
    if not creds['username'] or not creds['password']:
        logger.error("SMTP credentials not configured")
        return False
    
    # Auto-generate plain text if not provided
    if not text_content:
        # Simple conversion from HTML to text
        import re
        text_content = re.sub('<[^<]+?>', '', html_content)
        text_content = text_content.replace('&nbsp;', ' ')
    
    try:
        # Create message
        msg = MIMEMultipart('alternative')
        msg['From'] = f"{creds['from_name']} <{creds['from_email']}>"
        msg['To'] = to_email
        msg['Subject'] = subject
        
        # Attach plain text and HTML parts
        part1 = MIMEText(text_content, 'plain')
        part2 = MIMEText(html_content, 'html')
        
        msg.attach(part1)
        msg.attach(part2)
        
        # Connect to Gmail SMTP server (try port 465 with SSL first, then fall back to 587)
        try:
            # Try port 465 with SSL
            server = smtplib.SMTP_SSL(SMTP_SERVER, 465)
            server.login(creds['username'], creds['password'])
        except Exception as e:
            logger.info(f"Port 465 failed, trying port 587: {str(e)}")
            # Fall back to port 587 with TLS
            server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
            server.starttls()
            server.login(creds['username'], creds['password'])
        
        # Send email
        server.sendmail(creds['from_email'], to_email, msg.as_string())
        server.quit()
        
        logger.info(f"Email sent successfully to {to_email}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {str(e)}")
        return False


# ============================================
# EMAIL TEMPLATES
# ============================================

def get_welcome_email_template(user_name: str):
    """Welcome email template for new users"""
    subject = "Welcome to SmartSmile! 🦷"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f7fa; margin: 0; padding: 0;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #00e5ff 0%, #00b8d4 100%); padding: 40px 30px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: bold;">🦷 SmartSmile</h1>
                <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px;">Your Personal Oral Health Assistant</p>
            </div>
            
            <!-- Content -->
            <div style="padding: 40px 30px;">
                <h2 style="color: #333333; margin: 0 0 20px 0; font-size: 24px;">Welcome to SmartSmile, {user_name}!</h2>
                
                <p style="color: #666666; margin: 0 0 20px 0; font-size: 16px; line-height: 1.6;">
                    Thank you for joining SmartSmile! We're excited to have you as part of our community dedicated to better oral health.
                </p>
                
                <p style="color: #666666; margin: 0 0 20px 0; font-size: 16px; line-height: 1.6;">
                    With SmartSmile, you can:
                </p>
                
                <ul style="color: #666666; margin: 0 0 20px 0; font-size: 16px; line-height: 1.8; padding-left: 20px;">
                    <li>📸 Upload photos of your teeth for AI-powered analysis</li>
                    <li>🔍 Get instant screening results for oral conditions</li>
                    <li>📊 Track your oral health over time</li>
                    <li>📚 Learn about oral health best practices</li>
                    <li>🏥 Find nearby dental clinics</li>
                </ul>
                
                <p style="color: #666666; margin: 0 0 30px 0; font-size: 16px; line-height: 1.6;">
                    Ready to get started? Click the button below to complete your first oral health screening!
                </p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="https://smartsmile-oralhealth.com/screening" style="display: inline-block; background: linear-gradient(135deg, #00e5ff 0%, #00b8d4 100%); color: #ffffff; padding: 15px 40px; text-decoration: none; border-radius: 30px; font-size: 16px; font-weight: bold;">
                        Start Your First Screening
                    </a>
                </div>
                
                <hr style="border: none; border-top: 1px solid #eeeeee; margin: 30px 0;">
                
                <p style="color: #999999; margin: 0; font-size: 14px; text-align: center;">
                    If you have any questions, reply to this email or contact our support team.
                </p>
            </div>
            
            <!-- Footer -->
            <div style="background-color: #f5f7fa; padding: 20px 30px; text-align: center;">
                <p style="color: #999999; margin: 0; font-size: 12px;">
                    © 2024 SmartSmile. All rights reserved.<br>
                    Your Oral Health, Our Priority.
                </p>
            </div>
        </div>
    </body>
    </html>
    """
    
    text_content = f"""
    Welcome to SmartSmile, {user_name}!
    
    Thank you for joining SmartSmile! We're excited to have you as part of our community dedicated to better oral health.
    
    With SmartSmile, you can:
    - Upload photos of your teeth for AI-powered analysis
    - Get instant screening results for oral conditions
    - Track your oral health over time
    - Learn about oral health best practices
    - Find nearby dental clinics
    
    Ready to get started? Visit https://smartsmile-oralhealth.com/screening to complete your first oral health screening!
    
    If you have any questions, reply to this email or contact our support team.
    
    © 2024 SmartSmile. All rights reserved.
    Your Oral Health, Our Priority.
    """
    
    return subject, html_content, text_content


def get_password_reset_email_template(user_name: str, reset_link: str):
    """Password reset email template"""
    subject = "Reset Your SmartSmile Password 🔐"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f7fa; margin: 0; padding: 0;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #00e5ff 0%, #00b8d4 100%); padding: 40px 30px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: bold;">🦷 SmartSmile</h1>
                <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px;">Password Reset Request</p>
            </div>
            
            <!-- Content -->
            <div style="padding: 40px 30px;">
                <h2 style="color: #333333; margin: 0 0 20px 0; font-size: 24px;">Reset Your Password</h2>
                
                <p style="color: #666666; margin: 0 0 20px 0; font-size: 16px; line-height: 1.6;">
                    Hi {user_name},
                </p>
                
                <p style="color: #666666; margin: 0 0 20px 0; font-size: 16px; line-height: 1.6;">
                    We received a request to reset your SmartSmile password. Click the button below to create a new password:
                </p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="{reset_link}" style="display: inline-block; background: linear-gradient(135deg, #00e5ff 0%, #00b8d4 100%); color: #ffffff; padding: 15px 40px; text-decoration: none; border-radius: 30px; font-size: 16px; font-weight: bold;">
                        Reset Password
                    </a>
                </div>
                
                <p style="color: #666666; margin: 0 0 20px 0; font-size: 16px; line-height: 1.6;">
                    This link will expire in 24 hours for security purposes.
                </p>
                
                <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
                    <p style="color: #856404; margin: 0; font-size: 14px;">
                        <strong>⚠️ Security Notice:</strong> If you didn't request a password reset, please ignore this email or contact support immediately. Someone might be trying to access your account.
                    </p>
                </div>
                
                <hr style="border: none; border-top: 1px solid #eeeeee; margin: 30px 0;">
                
                <p style="color: #999999; margin: 0; font-size: 14px;">
                    If the button above doesn't work, copy and paste this link into your browser:<br>
                    <span style="color: #00e5ff;">{reset_link}</span>
                </p>
            </div>
            
            <!-- Footer -->
            <div style="background-color: #f5f7fa; padding: 20px 30px; text-align: center;">
                <p style="color: #999999; margin: 0; font-size: 12px;">
                    © 2024 SmartSmile. All rights reserved.<br>
                    Your Oral Health, Our Priority.
                </p>
            </div>
        </div>
    </body>
    </html>
    """
    
    text_content = f"""
    Reset Your Password - SmartSmile
    
    Hi {user_name},
    
    We received a request to reset your SmartSmile password. Click the link below to create a new password:
    
    {reset_link}
    
    This link will expire in 24 hours for security purposes.
    
    If you didn't request a password reset, please ignore this email or contact support immediately.
    
    © 2024 SmartSmile. All rights reserved.
    """
    
    return subject, html_content, text_content


def get_password_changed_email_template(user_name: str):
    """Password changed confirmation email"""
    subject = "Your SmartSmile Password Has Been Changed ✓"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f7fa; margin: 0; padding: 0;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #00e5ff 0%, #00b8d4 100%); padding: 40px 30px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: bold;">🦷 SmartSmile</h1>
                <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px;">Password Changed</p>
            </div>
            
            <!-- Content -->
            <div style="padding: 40px 30px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <div style="width: 80px; height: 80px; background-color: #34d399; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center;">
                        <span style="font-size: 40px;">✓</span>
                    </div>
                </div>
                
                <h2 style="color: #333333; margin: 0 0 20px 0; font-size: 24px; text-align: center;">Password Changed Successfully</h2>
                
                <p style="color: #666666; margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; text-align: center;">
                    Hi {user_name},
                </p>
                
                <p style="color: #666666; margin: 0 0 20px 0; font-size: 16px; line-height: 1.6;">
                    Your SmartSmile password has been successfully changed. You can now log in with your new password.
                </p>
                
                <div style="background-color: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin: 20px 0;">
                    <p style="color: #155724; margin: 0; font-size: 14px;">
                        <strong>✓ Security Confirmation:</strong> If you didn't change your password, please reset it immediately and contact support.
                    </p>
                </div>
                
                <hr style="border: none; border-top: 1px solid #eeeeee; margin: 30px 0;">
                
                <p style="color: #999999; margin: 0; font-size: 14px; text-align: center;">
                    If you have any questions, contact our support team.
                </p>
            </div>
            
            <!-- Footer -->
            <div style="background-color: #f5f7fa; padding: 20px 30px; text-align: center;">
                <p style="color: #999999; margin: 0; font-size: 12px;">
                    © 2024 SmartSmile. All rights reserved.<br>
                    Your Oral Health, Our Priority.
                </p>
            </div>
        </div>
    </body>
    </html>
    """
    
    text_content = f"""
    Password Changed Successfully - SmartSmile
    
    Hi {user_name},
    
    Your SmartSmile password has been successfully changed. You can now log in with your new password.
    
    If you didn't change your password, please reset it immediately and contact support.
    
    © 2024 SmartSmile. All rights reserved.
    """
    
    return subject, html_content, text_content


def get_email_verification_template(user_name: str, verification_link: str):
    """Email verification template"""
    subject = "Verify Your SmartSmile Email 📧"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f7fa; margin: 0; padding: 0;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #00e5ff 0%, #00b8d4 100%); padding: 40px 30px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: bold;">🦷 SmartSmile</h1>
                <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px;">Email Verification</p>
            </div>
            
            <!-- Content -->
            <div style="padding: 40px 30px;">
                <h2 style="color: #333333; margin: 0 0 20px 0; font-size: 24px;">Verify Your Email Address</h2>
                
                <p style="color: #666666; margin: 0 0 20px 0; font-size: 16px; line-height: 1.6;">
                    Hi {user_name},
                </p>
                
                <p style="color: #666666; margin: 0 0 20px 0; font-size: 16px; line-height: 1.6;">
                    Thank you for creating a SmartSmile account! Please verify your email address to get started:
                </p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="{verification_link}" style="display: inline-block; background: linear-gradient(135deg, #00e5ff 0%, #00b8d4 100%); color: #ffffff; padding: 15px 40px; text-decoration: none; border-radius: 30px; font-size: 16px; font-weight: bold;">
                        Verify Email
                    </a>
                </div>
                
                <p style="color: #666666; margin: 0 0 20px 0; font-size: 16px; line-height: 1.6;">
                    This verification link will expire in 7 days.
                </p>
                
                <hr style="border: none; border-top: 1px solid #eeeeee; margin: 30px 0;">
                
                <p style="color: #999999; margin: 0; font-size: 14px;">
                    If the button above doesn't work, copy and paste this link into your browser:<br>
                    <span style="color: #00e5ff;">{verification_link}</span>
                </p>
            </div>
            
            <!-- Footer -->
            <div style="background-color: #f5f7fa; padding: 20px 30px; text-align: center;">
                <p style="color: #999999; margin: 0; font-size: 12px;">
                    © 2024 SmartSmile. All rights reserved.<br>
                    Your Oral Health, Our Priority.
                </p>
            </div>
        </div>
    </body>
    </html>
    """
    
    text_content = f"""
    Verify Your Email Address - SmartSmile
    
    Hi {user_name},
    
    Thank you for creating a SmartSmile account! Please verify your email address:
    
    {verification_link}
    
    This verification link will expire in 7 days.
    
    © 2024 SmartSmile. All rights reserved.
    """
    
    return subject, html_content, text_content


def get_screening_result_email_template(user_name: str, result_data: dict):
    """Screening result notification email"""
    condition = result_data.get('condition', 'Unknown')
    risk_level = result_data.get('risk_level', 'Unknown')
    confidence = result_data.get('confidence', 0)
    
    risk_colors = {
        'low': '#34d399',
        'moderate': '#fbbf24',
        'high': '#f87171'
    }
    risk_color = risk_colors.get(risk_level.lower(), '#666666')
    
    subject = f"Your SmartSmile Screening Results - {condition} 🦷"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f7fa; margin: 0; padding: 0;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #00e5ff 0%, #00b8d4 100%); padding: 40px 30px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: bold;">🦷 SmartSmile</h1>
                <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px;">Screening Results</p>
            </div>
            
            <!-- Content -->
            <div style="padding: 40px 30px;">
                <h2 style="color: #333333; margin: 0 0 20px 0; font-size: 24px;">Your Screening Results</h2>
                
                <p style="color: #666666; margin: 0 0 20px 0; font-size: 16px; line-height: 1.6;">
                    Hi {user_name},
                </p>
                
                <p style="color: #666666; margin: 0 0 20px 0; font-size: 16px; line-height: 1.6;">
                    Your recent oral health screening has been completed. Here are your results:
                </p>
                
                <!-- Results Card -->
                <div style="background-color: #f8f9fa; border-radius: 10px; padding: 25px; margin: 20px 0;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                        <span style="color: #666666; font-size: 14px;">Condition</span>
                        <span style="color: #333333; font-size: 18px; font-weight: bold;">{condition}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                        <span style="color: #666666; font-size: 14px;">Risk Level</span>
                        <span style="color: {risk_color}; font-size: 18px; font-weight: bold; text-transform: uppercase;">{risk_level}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="color: #666666; font-size: 14px;">Confidence</span>
                        <span style="color: #333333; font-size: 18px; font-weight: bold;">{confidence}%</span>
                    </div>
                </div>
                
                <div style="background-color: #e3f2fd; border-left: 4px solid #00e5ff; padding: 15px; margin: 20px 0;">
                    <p style="color: #1565c0; margin: 0; font-size: 14px;">
                        <strong>ℹ️ Note:</strong> This is an AI-powered screening result. Please consult with a dental professional for proper diagnosis and treatment.
                    </p>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="https://smartsmile-oralhealth.com/results" style="display: inline-block; background: linear-gradient(135deg, #00e5ff 0%, #00b8d4 100%); color: #ffffff; padding: 15px 40px; text-decoration: none; border-radius: 30px; font-size: 16px; font-weight: bold;">
                        View Full Results
                    </a>
                </div>
                
                <hr style="border: none; border-top: 1px solid #eeeeee; margin: 30px 0;">
                
                <p style="color: #999999; margin: 0; font-size: 14px; text-align: center;">
                    Need to consult a dentist? <a href="https://smartsmile-oralhealth.com/dentist" style="color: #00e5ff;">Find a dental clinic near you</a>
                </p>
            </div>
            
            <!-- Footer -->
            <div style="background-color: #f5f7fa; padding: 20px 30px; text-align: center;">
                <p style="color: #999999; margin: 0; font-size: 12px;">
                    © 2024 SmartSmile. All rights reserved.<br>
                    Your Oral Health, Our Priority.
                </p>
            </div>
        </div>
    </body>
    </html>
    """
    
    text_content = f"""
    Your SmartSmile Screening Results
    
    Hi {user_name},
    
    Your recent oral health screening has been completed. Here are your results:
    
    Condition: {condition}
    Risk Level: {risk_level}
    Confidence: {confidence}%
    
    Note: This is an AI-powered screening result. Please consult with a dental professional for proper diagnosis and treatment.
    
    View full results at: https://smartsmile-oralhealth.com/results
    
    Need to consult a dentist? Find a dental clinic near you: https://smartsmile-oralhealth.com/dentist
    
    © 2024 SmartSmile. All rights reserved.
    """
    
    return subject, html_content, text_content


# ============================================
# CONVENIENCE FUNCTIONS
# ============================================

def send_welcome_email(to_email: str, user_name: str) -> bool:
    """Send welcome email to new user"""
    subject, html, text = get_welcome_email_template(user_name)
    return send_email(to_email, subject, html, text)


def send_password_reset_email(to_email: str, user_name: str, reset_link: str) -> bool:
    """Send password reset email"""
    subject, html, text = get_password_reset_email_template(user_name, reset_link)
    return send_email(to_email, subject, html, text)


def send_password_changed_email(to_email: str, user_name: str) -> bool:
    """Send password changed confirmation"""
    subject, html, text = get_password_changed_email_template(user_name)
    return send_email(to_email, subject, html, text)


def send_email_verification(to_email: str, user_name: str, verification_link: str) -> bool:
    """Send email verification"""
    subject, html, text = get_email_verification_template(user_name, verification_link)
    return send_email(to_email, subject, html, text)


def send_screening_result_email(to_email: str, user_name: str, result_data: dict) -> bool:
    """Send screening result notification"""
    subject, html, text = get_screening_result_email_template(user_name, result_data)
    return send_email(to_email, subject, html, text)
