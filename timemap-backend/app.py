from flask import Flask, request, jsonify
from flask_cors import CORS
from models import db, User, Task, TimeLog
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
import os
import secrets
from datetime import timedelta

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///timemap.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
CORS(app)
db.init_app(app)

with app.app_context():
    db.create_all()

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

    # FIX: check user exists first before calling check_password_hash
    if not user:
        return jsonify({'error': 'Invalid credentials'}), 401

    if not check_password_hash(user.password_hash, data['password']):
        return jsonify({'error': 'Invalid credentials'}), 401

    return jsonify({'user_id': user.id, 'username': user.username}), 200


# ✅ CREATE TASK
@app.route('/api/tasks', methods=['POST'])
def create_task():
    data = request.json

    task = Task(
        user_id=data['user_id'],
        task_name=data['task_name'],
        subject_category=data['subject_category'],
        difficulty_level=data['difficulty_level'],
        estimated_hours=data['estimated_hours'],
        deadline=datetime.strptime(data['deadline'], '%Y-%m-%d'),
        ml_risk_prediction='Medium',
        status='Pending'
    )

    db.session.add(task)
    db.session.commit()

    return jsonify({'task_id': task.id}), 201


# ✅ GET TASKS
@app.route('/api/tasks/<int:user_id>', methods=['GET'])
def get_tasks(user_id):
    tasks = Task.query.filter_by(user_id=user_id).all()

    return jsonify({'tasks': [
        {
            'id': t.id,
            'task_name': t.task_name,
            'deadline': t.deadline.strftime('%Y-%m-%d'),
            'status': t.status,
            'risk': t.ml_risk_prediction
        } for t in tasks
    ]})


# ✅ DELETE TASK
@app.route('/api/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    task = Task.query.get(task_id)

    if not task:
        return jsonify({'error': 'Task not found'}), 404

    db.session.delete(task)
    db.session.commit()

    return jsonify({'message': 'Task deleted'}), 200


# ✅ UPDATE TASK STATUS
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
if __name__ == '__main__':
    app.run(debug=True, port=5000)

# ✅ FORGOT PASSWORD
@app.route('/api/forgot-password', methods=['POST'])
def forgot_password():
    data = request.json

    # Check if email exists
    user = User.query.filter_by(email=data['email']).first()

    if not user:
        return jsonify({'error': 'Email not found'}), 404

    # Generate secure reset token
    reset_token = secrets.token_urlsafe(32)

    # Save token + expiration time
    user.reset_token = reset_token
    user.reset_token_expiration = datetime.utcnow() + timedelta(hours=1)

    db.session.commit()

    # Normally send email here
    # For now return token in response (testing purpose)
    return jsonify({
        'message': 'Password reset token generated',
        'reset_token': reset_token
    }), 200

# ✅ RESET PASSWORD
@app.route('/api/reset-password', methods=['POST'])
def reset_password():
    data = request.json

    token = data.get('token')
    new_password = data.get('new_password')

    user = User.query.filter_by(reset_token=token).first()

    if not user:
        return jsonify({'error': 'Invalid token'}), 400

    # Check token expiration
    if user.reset_token_expiration < datetime.utcnow():
        return jsonify({'error': 'Token expired'}), 400

    # Update password
    user.password_hash = generate_password_hash(new_password)

    # Clear token after successful reset
    user.reset_token = None
    user.reset_token_expiration = None

    db.session.commit()

    return jsonify({'message': 'Password reset successful'}), 200