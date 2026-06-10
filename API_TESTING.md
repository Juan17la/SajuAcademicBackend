# Saju Academic API Testing Guide

## Files Included

1. **`Saju_Academic_API.postman_collection.json`** - Complete API collection with all endpoints
2. **`Saju_Academic_API.postman_environment.json`** - Environment variables for local testing

## How to Import

### Postman
1. Open Postman
2. Click **Import** (top left)
3. Drag and drop both files, or select them
4. The collection will appear under "Collections"
5. The environment will appear under "Environments"

### Yaak
1. Open Yaak
2. Click **Import** or use keyboard shortcut
3. Select the collection file
4. Yaak supports Postman Collection v2.1 format natively

## Setup Instructions

### 1. Configure Environment
- Select the environment: `Saju Academic API - Local`
- The base URL is set to: `http://localhost:3000/v1`
- Update if your server runs on a different port

### 2. Start the Server
```bash
pnpm run dev
# or
npm run dev
```

### 3. Authentication Flow
1. Run **Auth > Register** first to create a user
2. Then run **Auth > Login** to get tokens
3. Copy the `accessToken` from the response
4. Paste it into the `auth_token` environment variable
5. The `refresh_token` is also saved for token refresh

### 4. Test Sequence (Recommended)

Follow this order to create dependencies:

1. **Auth**
   - Register (creates user)
   - Login (saves auth_token)

2. **Classes**
   - Create Class (saves class_id)
   - List Classes (verify)

3. **Students**
   - Create Student (saves student_id)
   - Import Students (creates multiple)
   - List Students (verify)

4. **Activities**
   - Create Activity (saves activity_id)
   - List Activities (verify)

5. **AI**
   - Improve Activity Description (requires AI provider config)

6. **Scores**
   - Bulk Update Scores (assigns grades)
   - Get Scores by Class (verify)

7. **Attendance**
   - Create Attendance Session (saves session_id)
   - Bulk Update Attendance Records
   - Get Attendance Records (verify)

8. **Extra Points**
   - Create Extra Points (saves extra_point_id)
   - List Extra Points (verify)

9. **Dashboard**
   - Get Dashboard (see analytics)

10. **Export**
    - Export Class to Excel (downloads file)

### 5. Cleanup (Optional)
- Delete Extra Points
- Delete Activity (soft delete)
- Delete Student (soft delete)
- Delete Class (soft delete)

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `base_url` | API base URL | `http://localhost:3000/v1` |
| `auth_token` | Bearer token from login | `eyJhbGciOiJIUzI1NiIs...` |
| `refresh_token` | Token for refresh | `eyJhbGciOiJIUzI1NiIs...` |
| `class_id` | Created class UUID | `550e8400-e29b-41d4-a716-446655440000` |
| `student_id` | First student UUID | `550e8400-e29b-41d4-a716-446655440001` |
| `student_id_2` | Second student UUID | `550e8400-e29b-41d4-a716-446655440002` |
| `student_id_3` | Third student UUID | `550e8400-e29b-41d4-a716-446655440003` |
| `activity_id` | Created activity UUID | `550e8400-e29b-41d4-a716-446655440010` |
| `session_id` | Attendance session UUID | `550e8400-e29b-41d4-a716-446655440020` |
| `record_id` | Attendance record UUID | `550e8400-e29b-41d4-a716-446655440021` |
| `extra_point_id` | Extra point UUID | `550e8400-e29b-41d4-a716-446655440030` |
| `api_key_placeholder` | Placeholder for API keys | `your-api-key-here` |

## Sample Data

The collection includes realistic sample data:
- **User**: john.doe@example.com
- **Class**: Mathematics 101
- **Students**: Alice, Bob, Charlie, Diana, Edward
- **Activity**: Midterm Exam (30% weight)
- **Scores**: Numeric (85, 92, 78) and Letter grades (A, B, C)
- **Attendance**: Present, Absent, Late, Justified

## AI Testing

To test the AI endpoint:
1. Set up an AI provider in `.env`:
   ```
   AI_PROVIDER=openai
   OPENAI_API_KEY=your-real-api-key
   ```
2. Or use: `groq`, `gemini` with their respective keys
3. The collection uses placeholder text - update the description in the request body

## Notes

- All authenticated endpoints use Bearer token from the environment
- UUIDs are managed through environment variables
- The collection uses soft deletes (is_deleted flag)
- Export returns a binary Excel file (.xlsx)
- Password recovery endpoints are stubs (return 503)

## Troubleshooting

**401 Unauthorized**: Check that `auth_token` is set and not expired

**404 Not Found**: Verify the UUID exists in the database

**409 Conflict**: Check unique constraints (class name, student code)

**422 Unprocessable**: Verify business rules (weight sum ≤ 100%, valid score type)

**503 Service Unavailable**: AI not configured or email service not set up
