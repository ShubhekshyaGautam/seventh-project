from flask import Flask, request, jsonify
from flask_cors import CORS
from models import db, User, Task, TimeLog, Category
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from trained_model.predict import predict_risk_from_task
import os
import secrets
import random
from datetime import timedelta
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

app = Flask(__name__)
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'timemap.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
CORS(app)
db.init_app(app)

with app.app_context():
    db.create_all()

# ─────────────────────────────────────────────
#  EMAIL CONFIG  
# ─────────────────────────────────────────────
from dotenv import load_dotenv
load_dotenv()

EMAIL_ADDRESS  = os.getenv("EMAIL_ADDRESS")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")
# How to get App Password:
#   Google Account → Security → 2-Step Verification → App Passwords → Generate


# ─────────────────────────────────────────────
#  EMAIL HELPER
# ─────────────────────────────────────────────

def send_email(to_email, subject, html_body):
    """Sends an HTML email via Gmail SMTP. Returns True on success."""
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"]    = f"TimeMap <{EMAIL_ADDRESS}>"
        msg["To"]      = to_email
        msg.attach(MIMEText(html_body, "html"))

        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
            server.sendmail(EMAIL_ADDRESS, to_email, msg.as_string())
        return True
    except Exception as e:
        print(f"Email send failed: {e}")
        return False


def build_reminder_email(username, tasks):
    """Builds a nice HTML email body listing at-risk / due-soon tasks."""
    rows = ""
    for t in tasks:
        deadline_str = t['deadline']
        risk         = t['risk']
        days_left    = t['days_left']

        if risk == "High":
            risk_badge = '<span style="background:#fef2f2;color:#dc2626;padding:3px 10px;border-radius:20px;font-size:12px;font-weight:600;">🔴 High Risk</span>'
        elif risk == "Medium":
            risk_badge = '<span style="background:#fffbeb;color:#d97706;padding:3px 10px;border-radius:20px;font-size:12px;font-weight:600;">🟡 Medium Risk</span>'
        else:
            risk_badge = '<span style="background:#f0fdf4;color:#16a34a;padding:3px 10px;border-radius:20px;font-size:12px;font-weight:600;">🟢 Low Risk</span>'

        if days_left < 0:
            dl_text = '<span style="color:#dc2626;font-weight:600;">Overdue!</span>'
        elif days_left == 0:
            dl_text = '<span style="color:#d97706;font-weight:600;">Due Today!</span>'
        else:
            dl_text = f'<span style="color:#52525b;">{days_left} day(s) left</span>'

        rows += f"""
        <tr>
          <td style="padding:14px 16px;border-bottom:1px solid #e4e4e7;">
            <strong style="color:#18181b;font-size:14px;">{t['task_name']}</strong><br/>
            <span style="color:#a1a1aa;font-size:12px;">{t['category']}</span>
          </td>
          <td style="padding:14px 16px;border-bottom:1px solid #e4e4e7;text-align:center;">{risk_badge}</td>
          <td style="padding:14px 16px;border-bottom:1px solid #e4e4e7;text-align:center;font-size:13px;color:#52525b;">{deadline_str}</td>
          <td style="padding:14px 16px;border-bottom:1px solid #e4e4e7;text-align:center;">{dl_text}</td>
        </tr>
        """

    html = f"""
    <!DOCTYPE html>
    <html>
    <body style="margin:0;padding:0;background:#fafaf9;font-family:'Inter',Arial,sans-serif;">
      <div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e4e4e7;">

        <!-- Header -->
        <div style="background:linear-gradient(135deg,#c48b32,#e8a93e);padding:32px 36px;">
          <h1 style="margin:0;color:white;font-size:24px;font-weight:700;letter-spacing:-0.5px;">⏰ TimeMap Reminder</h1>
          <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">Hey <strong>{username}</strong>, here are your tasks that need attention!</p>
        </div>

        <!-- Body -->
        <div style="padding:28px 36px;">
          <p style="color:#52525b;font-size:14px;margin:0 0 20px;">
           
          </p>

          <!-- Task Table -->
          <table style="width:100%;border-collapse:collapse;border:1px solid #e4e4e7;border-radius:12px;overflow:hidden;">
            <thead>
              <tr style="background:#fdf3e3;">
                <th style="padding:12px 16px;text-align:left;font-size:12px;color:#a1a1aa;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Task</th>
                <th style="padding:12px 16px;text-align:center;font-size:12px;color:#a1a1aa;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Risk</th>
                <th style="padding:12px 16px;text-align:center;font-size:12px;color:#a1a1aa;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Deadline</th>
                <th style="padding:12px 16px;text-align:center;font-size:12px;color:#a1a1aa;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows}
            </tbody>
          </table>

          <!-- CTA -->
          <div style="text-align:center;margin-top:28px;">
            <a href="http://localhost:3000/dashboard"
               style="display:inline-block;background:#c48b32;color:white;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:600;font-size:14px;">
              Go to Dashboard →
            </a>
          </div>
        </div>

        <!-- Footer -->
        <div style="background:#fafaf9;padding:20px 36px;border-top:1px solid #e4e4e7;text-align:center;">
          <p style="margin:0;color:#a1a1aa;font-size:12px;">
            This reminder was sent by <strong style="color:#c48b32;">TimeMap</strong> based on your task deadlines and AI risk predictions.
          </p>
        </div>

      </div>
    </body>
    </html>
    """
    return html


# ─────────────────────────────────────────────
#  ML RISK HELPERS  (unchanged from original)
# ─────────────────────────────────────────────

def calculate_completion_percentage(user_id, task_id, estimated_hours):
    logs = TimeLog.query.filter_by(user_id=user_id, task_id=task_id).all()
    total_minutes = sum(log.duration_minutes for log in logs)
    total_hours = total_minutes / 60
    if estimated_hours <= 0:
        return 0.0
    return min((total_hours / estimated_hours) * 100, 100.0)


def calculate_task_risk(task):
    completion = calculate_completion_percentage(task.user_id, task.id, task.estimated_hours)
    try:
        result = predict_risk_from_task(
            estimated_hours=task.estimated_hours,
            deadline=task.deadline,
            difficulty_level=task.difficulty_level,
            completion_percentage=completion,
        )
        return result['risk_level']
    except Exception as e:
        print(f"Risk prediction failed for task {task.id}: {e}")
        return task.ml_risk_prediction or 'Medium'


# ─────────────────────────────────────────────
#  EXISTING ROUTES  (all unchanged)
# ─────────────────────────────────────────────

@app.route('/')
def home():
    return jsonify({'message': 'TimeMap Backend Running!'})


@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email exists'}), 400
    user = User(
        username=data['username'],
        email=data['email'],
        password_hash=generate_password_hash(data['password'])
    )
    db.session.add(user)
    db.session.commit()
    return jsonify({'message': 'User created', 'user_id': user.id}), 201


@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(email=data['email']).first()
    if not user or not check_password_hash(user.password_hash, data['password']):
        return jsonify({'error': 'Invalid credentials'}), 401
    return jsonify({'user_id': user.id, 'username': user.username}), 200


@app.route('/api/categories', methods=['POST'])
def create_category():
    data = request.json
    cat = Category(user_id=data['user_id'], name=data['name'])
    db.session.add(cat)
    db.session.commit()
    return jsonify({'category_id': cat.id}), 201


@app.route('/api/categories/<int:user_id>', methods=['GET'])
def get_categories(user_id):
    cats = Category.query.filter_by(user_id=user_id).all()
    return jsonify({'categories': [{'id': c.id, 'name': c.name} for c in cats]})


@app.route('/api/tasks', methods=['POST'])
def create_task():
    data = request.json
    deadline = datetime.strptime(data['deadline'], '%Y-%m-%d')
    risk_result = predict_risk_from_task(
        estimated_hours=data['estimated_hours'],
        deadline=deadline,
        difficulty_level=data['difficulty_level'],
        completion_percentage=0.0,
    )
    task = Task(
        user_id=data['user_id'],
        task_name=data['task_name'],
        description=data.get('description', ''),
        category_id=data['category_id'],
        difficulty_level=data['difficulty_level'],
        estimated_hours=data['estimated_hours'],
        deadline=deadline,
        ml_risk_prediction=risk_result['risk_level'],
        status='Pending'
    )
    db.session.add(task)
    db.session.commit()
    return jsonify({'task_id': task.id, 'risk_prediction': risk_result}), 201


@app.route('/api/tasks/<int:user_id>', methods=['GET'])
def get_tasks(user_id):
    user  = User.query.get(user_id)
    
    # Safety check — if user not found, return empty
    if not user:
        return jsonify({'tasks': []}), 200
        
    tasks = Task.query.filter_by(user_id=user_id).all()
    for t in tasks:
        old_risk = t.ml_risk_prediction        # risk BEFORE recalculation
        new_risk = calculate_task_risk(t)      # risk NOW (ML recalculates)
        t.ml_risk_prediction = new_risk

        # ✅ If risk just became High AND we haven't already notified for High
    if (new_risk == 'High' 
        and t.last_notified_risk != 'High'
        and t.status != 'Completed'):

            # Send email immediately!
            category = Category.query.get(t.category_id)
            days_left = (t.deadline - datetime.utcnow()).days
            flagged = [{
                'task_name': t.task_name,
                'deadline':  t.deadline.strftime('%Y-%m-%d'),
                'risk':      new_risk,
                'days_left': days_left,
                'category':  category.name if category else 'General',
            }]
            subject   = f"🚨 TimeMap Alert: '{t.task_name}' is now HIGH RISK!"
            html_body = build_reminder_email(user.username, flagged)
            send_email(user.email, subject, html_body)
            print(f"🚨 High risk email sent to {user.email} for task: {t.task_name}")

            # Save so we don't email again for the same risk level
            t.last_notified_risk = 'High'

        # Reset notification if risk drops back down
    elif new_risk != 'High':
            t.last_notified_risk = new_risk

    db.session.commit()

    return jsonify({'tasks': [
        {
            'id': t.id,
            'task_name': t.task_name,
            'description': t.description,
            'subject_category': Category.query.get(t.category_id).name if t.category_id and Category.query.get(t.category_id) else None,
            'deadline': t.deadline.strftime('%Y-%m-%d'),
            'status': t.status,
            'risk': t.ml_risk_prediction
        } for t in tasks
    ]})


@app.route('/api/task/<int:task_id>', methods=['GET'])
def get_task(task_id):
    task = Task.query.get(task_id)
    if not task:
        return jsonify({'error': 'Task not found'}), 404
    task.ml_risk_prediction = calculate_task_risk(task)
    db.session.commit()
    return jsonify({'task': {
        'id': task.id,
        'task_name': task.task_name,
        'description': task.description,
        'subject_category': Category.query.get(task.category_id).name if task.category_id and Category.query.get(task.category_id) else None,
        'difficulty_level': task.difficulty_level,
        'estimated_hours': task.estimated_hours,
        'deadline': task.deadline.strftime('%Y-%m-%d'),
        'status': task.status,
        'risk': task.ml_risk_prediction
    }})


@app.route('/api/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    task = Task.query.get(task_id)
    if not task:
        return jsonify({'error': 'Task not found'}), 404
    db.session.delete(task)
    db.session.commit()
    return jsonify({'message': 'Task deleted'}), 200


@app.route('/api/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    task = Task.query.get(task_id)
    if not task:
        return jsonify({'error': 'Task not found'}), 404
    data = request.json
    if 'status' in data:
        task.status = data['status']
    db.session.commit()
    return jsonify({'message': 'Task updated'}), 200


@app.route('/api/forgot-password', methods=['POST'])
def forgot_password():
    data = request.json
    user = User.query.filter_by(email=data['email']).first()
    if not user:
        return jsonify({'error': 'Email not found'}), 404
    otp = str(random.randint(100000, 999999))
    user.reset_otp = otp
    user.reset_otp_expiration = datetime.utcnow() + timedelta(minutes=10)
    db.session.commit()
    return jsonify({'message': 'OTP generated successfully', 'otp': otp}), 200


@app.route('/api/reset-password', methods=['POST'])
def reset_password():
    data = request.json
    otp = data.get('otp')
    new_password = data.get('new_password')
    if not otp or not new_password:
        return jsonify({'error': 'OTP and new password required'}), 400
    user = User.query.filter_by(reset_otp=otp).first()
    if not user:
        return jsonify({'error': 'Invalid OTP'}), 400
    if user.reset_otp_expiration < datetime.utcnow():
        return jsonify({'error': 'OTP expired'}), 400
    user.password_hash = generate_password_hash(new_password)
    user.reset_otp = None
    user.reset_otp_expiration = None
    db.session.commit()
    return jsonify({'message': 'Password reset successful'}), 200


# ─────────────────────────────────────────────
#  NEW — EMAIL REMINDER ROUTES
# ─────────────────────────────────────────────

@app.route('/api/reminders/check/<int:user_id>', methods=['GET'])
def check_reminders(user_id):
    """
    Returns tasks for a user that are high risk OR due within 3 days.
    Used by the frontend to show the Notifications page.
    """
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    tasks = Task.query.filter_by(user_id=user_id).filter(Task.status != 'Completed').all()
    now   = datetime.utcnow()

    flagged = []
    for t in tasks:
        risk      = calculate_task_risk(t)
        days_left = (t.deadline - now).days
        category  = Category.query.get(t.category_id)

        # Flag if High risk OR deadline within 3 days
        if risk == 'High' or days_left <= 3:
            flagged.append({
                'id':        t.id,
                'task_name': t.task_name,
                'deadline':  t.deadline.strftime('%Y-%m-%d'),
                'risk':      risk,
                'days_left': days_left,
                'status':    t.status,
                'category':  category.name if category else 'General',
            })

    # Sort: overdue first, then by days_left ascending
    flagged.sort(key=lambda x: x['days_left'])

    return jsonify({
        'email':   user.email,
        'tasks':   flagged,
        'count':   len(flagged)
    }), 200


@app.route('/api/reminders/send/<int:user_id>', methods=['POST'])
def send_reminder(user_id):
    """
    Sends a reminder email to the user listing their high-risk / due-soon tasks.
    Can be triggered manually (per user) from the frontend.
    """
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    tasks = Task.query.filter_by(user_id=user_id).filter(Task.status != 'Completed').all()
    now   = datetime.utcnow()

    flagged = []
    for t in tasks:
        risk      = calculate_task_risk(t)
        days_left = (t.deadline - now).days
        category  = Category.query.get(t.category_id)

        if risk == 'High' or days_left <= 3:
            flagged.append({
                'task_name': t.task_name,
                'deadline':  t.deadline.strftime('%Y-%m-%d'),
                'risk':      risk,
                'days_left': days_left,
                'category':  category.name if category else 'General',
            })

    if not flagged:
        return jsonify({'message': 'No at-risk tasks — no email sent.'}), 200

    flagged.sort(key=lambda x: x['days_left'])

    subject    = f"⏰ TimeMap: You have {len(flagged)} task(s) needing attention!"
    html_body  = build_reminder_email(user.username, flagged)
    success    = send_email(user.email, subject, html_body)

    if success:
        return jsonify({'message': f'Reminder sent to {user.email}', 'tasks_flagged': len(flagged)}), 200
    else:
        return jsonify({'error': 'Failed to send email. Check your Gmail config.'}), 500


@app.route('/api/reminders/send-all', methods=['POST'])
def send_all_reminders():
    """
    Sends reminder emails to ALL users who have high-risk or due-soon tasks.
    Call this from a scheduler (e.g. cron job) once a day.
    """
    users   = User.query.all()
    now     = datetime.utcnow()
    results = []

    for user in users:
        tasks = Task.query.filter_by(user_id=user.id).filter(Task.status != 'Completed').all()
        flagged = []

        for t in tasks:
            risk      = calculate_task_risk(t)
            days_left = (t.deadline - now).days
            category  = Category.query.get(t.category_id)

            if risk == 'High' or days_left <= 3:
                flagged.append({
                    'task_name': t.task_name,
                    'deadline':  t.deadline.strftime('%Y-%m-%d'),
                    'risk':      risk,
                    'days_left': days_left,
                    'category':  category.name if category else 'General',
                })

        if not flagged:
            results.append({'user': user.email, 'status': 'skipped — no at-risk tasks'})
            continue

        flagged.sort(key=lambda x: x['days_left'])
        subject   = f"⏰ TimeMap: You have {len(flagged)} task(s) needing attention!"
        html_body = build_reminder_email(user.username, flagged)
        success   = send_email(user.email, subject, html_body)

        results.append({
            'user':          user.email,
            'status':        'sent' if success else 'failed',
            'tasks_flagged': len(flagged)
        })

    return jsonify({'results': results}), 200


if __name__ == '__main__':
    app.run(debug=True, port=5000)
