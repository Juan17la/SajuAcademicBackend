# Saju Academic API Documentation

## Base URL
All endpoints are prefixed with `/v1`

## Authentication

### Register
```
POST /v1/auth/register
```
Body:
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

### Login
```
POST /v1/auth/login
```
Body:
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

### Refresh Token
```
POST /v1/auth/refresh
```
Body:
```json
{
  "refreshToken": "your-refresh-token"
}
```

### Change Password
```
POST /v1/auth/change-password
```
Headers: `Authorization: Bearer <token>`
Body:
```json
{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123"
}
```

## Classes

### List Classes
```
GET /v1/classes
```
Headers: `Authorization: Bearer <token>`

### Get Class by ID
```
GET /v1/classes/:id
```

### Create Class
```
POST /v1/classes
```
Body:
```json
{
  "name": "Mathematics 101",
  "score_type": "numeric"
}
```
Score types: `numeric`, `percentage`, `letters`

### Update Class
```
PATCH /v1/classes/:id
```
Body:
```json
{
  "name": "Mathematics 101",
  "score_type": "numeric"
}
```

### Delete Class
```
DELETE /v1/classes/:id
```

## Students

### List Students
```
GET /v1/classes/:classId/students
```

### Create Student
```
POST /v1/classes/:classId/students
```
Body:
```json
{
  "student_code": "S001",
  "first_name": "Alice",
  "last_name": "Smith"
}
```

### Import Students
```
POST /v1/classes/:classId/students/import
```
Body:
```json
{
  "students": "[S001, Alice, Smith]\n[S002, Bob, Johnson]\n[S003, Charlie, Brown]"
}
```

### Update Student
```
PATCH /v1/students/:id
```
Body:
```json
{
  "student_code": "S001",
  "first_name": "Alice",
  "last_name": "Smith",
  "is_active": true
}
```

### Delete Student
```
DELETE /v1/students/:id
```

## Activities

### List Activities
```
GET /v1/classes/:classId/activities
```

### Create Activity
```
POST /v1/classes/:classId/activities
```
Body:
```json
{
  "name": "Midterm Exam",
  "description": "Comprehensive midterm examination",
  "weight": 0.30,
  "activity_type": "exam"
}
```
Activity types: `assignment`, `project`, `quiz`, `exam`
Weight: Decimal between 0.0001 and 1.0 (e.g., 0.30 for 30%)

### Update Activity
```
PATCH /v1/activities/:id
```

### Delete Activity
```
DELETE /v1/activities/:id
```

## AI Description Improvement

### Improve Activity Description
```
POST /v1/activities/:id/ai-improve
```
Body:
```json
{
  "description": "Write a 5-page essay about climate change"
}
```
Response:
```json
{
  "original": "Write a 5-page essay about climate change",
  "improved": "Students will compose a comprehensive 5-page essay analyzing the causes, effects, and potential solutions to climate change...",
  "latency_ms": 2500
}
```

## Scores

### Get Scores by Class
```
GET /v1/classes/:classId/scores
```

### Get Scores by Activity
```
GET /v1/activities/:activityId/scores
```

### Get Scores by Student
```
GET /v1/students/:studentId/scores
```

### Bulk Update Scores
```
PUT /v1/activities/:activityId/scores
```
Body:
```json
{
  "scores": [
    {
      "student_id": "uuid",
      "value": 85
    },
    {
      "student_id": "uuid",
      "value": "A"
    }
  ]
}
```

## Attendance

### List Attendance Sessions
```
GET /v1/classes/:classId/attendance-sessions
```

### Create Attendance Session
```
POST /v1/classes/:classId/attendance-sessions
```
Body:
```json
{
  "session_date": "2024-01-15"
}
```

### Get Attendance Session
```
GET /v1/attendance-sessions/:id
```

### Bulk Update Attendance Records
```
PUT /v1/attendance-sessions/:id/records
```
Body:
```json
{
  "records": [
    {
      "student_id": "uuid",
      "status": "present"
    },
    {
      "student_id": "uuid",
      "status": "absent"
    }
  ]
}
```
Statuses: `present`, `absent`, `late`, `justified`

### Get Attendance Records
```
GET /v1/classes/:classId/attendance-records?date=2024-01-15&student_id=uuid
```

### Update Attendance Record
```
PATCH /v1/attendance-records/:id
```
Body:
```json
{
  "status": "present"
}
```

## Extra Points

### List Extra Points
```
GET /v1/classes/:classId/extra-points
```

### Create Extra Points
```
POST /v1/classes/:classId/extra-points
```
Body:
```json
{
  "student_id": "uuid",
  "points": 5,
  "reason": "Participation in class discussion"
}
```

### Delete Extra Points
```
DELETE /v1/extra-points/:id
```

## Dashboard

### Get Dashboard
```
GET /v1/classes/:classId/dashboard
```
Returns:
- Class info
- Summary statistics
- Attendance breakdown
- Top performing students
- At-risk students

## Export

### Export Class to Excel
```
POST /v1/classes/:classId/export
```
Returns: `.xlsx` file with sheets:
- Scores
- Attendance
- Extra Points
- Summary

## AI Provider Configuration

Set the following environment variables:
```
AI_PROVIDER=openai|groq|gemini
OPENAI_API_KEY=your-key
GROQ_API_KEY=your-key
GEMINI_API_KEY=your-key
```

If not configured, AI endpoints return 503 Service Unavailable.
