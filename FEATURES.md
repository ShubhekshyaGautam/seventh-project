# TimeMap Features Overview

TimeMap is a comprehensive productivity application with a React-based frontend and a Flask-based backend. Below is a detailed breakdown of the included features:

## Backend Features
Developed using Python, Flask, SQLAlchemy, and SQLite.

### 1. User Authentication & Management
* **Registration:** Users can sign up with a username, email, and password.
* **Login:** Secure authentication mechanism checking credentials against the database.
* **Security:** Passwords are hashed using `werkzeug.security` (generate_password_hash & check_password_hash) for secure storage.

### 2. Task Management API
* **Create Task:** Allows users to create tasks with attributes such as:
  * Task Name
  * Subject Category
  * Difficulty Level
  * Estimated Hours
  * Deadline
* **Fetch Tasks:** Retrieve all tasks associated with a specific user.
* **Update Task Status:** Ability to update the progress/status of a task (e.g., Pending, Completed).
* **Delete Task:** Remove tasks from the database.
* **ML Risk Prediction:** Tasks include a field for ML-based risk prediction to assess the likelihood of meeting deadlines (currently implemented with a placeholder 'Medium' value).

### 3. Time Logging
* Data models are prepared for recording the time spent on specific tasks.
* Captures the **duration** (in minutes), specific **date**, and **focus level** of the user during the work session.

---

## Frontend Features
Developed using React, Vite, React Router, and standard CSS.

### 1. Landing Page
* **Hero Section:** Introduction to the application's value proposition.
* **Features Showcase:** Highlights the key capabilities of TimeMap.
* **FAQ:** Frequently asked questions section.
* **Newsletter:** Subscription form for updates.
* **Journal/Blog:** Display of related articles or updates.

### 2. User Accounts
* **Login UI:** Interface for returning users to access their accounts.
* **Signup UI:** Interface for new users to create accounts.

### 3. Dashboard
* **Main Dashboard View:** A central hub providing an overview of the user's progress, upcoming tasks, and general statistics.

### 4. Task Management UI
* **My Tasks Page:** A dedicated view for users to see, manage, and interact with their task lists, deadlines, and statuses.

### 5. Focus Timer
* **Productivity Timer:** A built-in focus timer (similar to Pomodoro) allowing users to track their focused work sessions without leaving the application.

### 6. Calendar View
* **Visual Planning:** A calendar interface allowing users to visualize task deadlines, plan their schedules, and track daily commitments.
