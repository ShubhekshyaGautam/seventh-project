from flask import Flask, request, jsonify
from flask_cors import CORS
from models import db, User, Task, TimeLog
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
import os

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
    if user and check_password_hash(user.password_hash, data['password']):
        return jsonify({'user_id': user.id, 'username': user.username}), 200
    return jsonify({'error': 'Invalid credentials'}), 401

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
        ml_risk_prediction='Medium'
    )
    db.session.add(task)
    db.session.commit()
    return jsonify({'task_id': task.id}), 201

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

if __name__ == '__main__':
    app.run(debug=True, port=5000)
