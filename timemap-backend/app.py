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

app = Flask(__name__)
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'timemap.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
CORS(app)
db.init_app(app)

with app.app_context():
    db.create_all()


# ---- ML risk helpers ----

def calculate_completion_percentage(user_id, task_id, estimated_hours):
    """Derives completion % from logged TimeLog minutes vs estimated hours."""
    logs = TimeLog.query.filter_by(user_id=user_id, task_id=task_id).all()
    total_minutes = sum(log.duration_minutes for log in logs)
    total_hours = total_minutes / 60

    if estimated_hours <= 0:
        return 0.0

    percentage = (total_hours / estimated_hours) * 100
    return min(percentage, 100.0)


def calculate_task_risk(task):
    """Recalculates a task's risk level right now, based on current time + logged progress."""
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
        # If the model fails for any reason, don't crash the request —
        # fall back to whatever was last stored (or 'Medium' if nothing yet)
        print(f"Risk prediction failed for task {task.id}: {e}")
        return task.ml_risk_prediction or 'Medium'


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

    if not user:
        return jsonify({'error': 'Invalid credentials'}), 401

    if not check_password_hash(user.password_hash, data['password']):
        return jsonify({'error': 'Invalid credentials'}), 401

    return jsonify({'user_id': user.id, 'username': user.username}), 200


# ✅ CREATE CATEGORY
@app.route('/api/categories', methods=['POST'])
def create_category():
    data = request.json
    cat = Category(user_id=data['user_id'], name=data['name'])
    db.session.add(cat)
    db.session.commit()
    return jsonify({'category_id': cat.id}), 201

# ✅ GET CATEGORIES
@app.route('/api/categories/<int:user_id>', methods=['GET'])
def get_categories(user_id):
    cats = Category.query.filter_by(user_id=user_id).all()
    return jsonify({'categories': [{'id': c.id, 'name': c.name} for c in cats]})

# ✅ CREATE TASK  (now predicts risk immediately instead of hardcoding 'Medium')
@app.route('/api/tasks', methods=['POST'])
def create_task():
    data = request.json

    deadline = datetime.strptime(data['deadline'], '%Y-%m-%d')

    # New task, nothing logged yet, so completion starts at 0
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

    return jsonify({
        'task_id': task.id,
        'risk_prediction': risk_result
    }), 201


# ✅ GET TASKS  (risk is recalculated live, since time passing changes it)
@app.route('/api/tasks/<int:user_id>', methods=['GET'])
def get_tasks(user_id):
    tasks = Task.query.filter_by(user_id=user_id).all()

    for t in tasks:
        t.ml_risk_prediction = calculate_task_risk(t)
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


# ✅ GET TASK  (also recalculated live)
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

# ✅ FORGOT PASSWORD
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

    return jsonify({
        'message': 'OTP generated successfully',
        'otp': otp
    }), 200

# ✅ RESET PASSWORD
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

    hashed_password = generate_password_hash(new_password)
    user.password_hash = hashed_password
    user.reset_otp = None
    user.reset_otp_expiration = None

    db.session.commit()

    return jsonify({'message': 'Password reset successful'}), 200

if __name__ == '__main__':
    app.run(debug=True, port=5000)