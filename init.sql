-- ============================================================
-- Saju Academic — Database Schema
-- Version 1.0 · June 2026
-- ============================================================

-- Enable UUID generation (PostgreSQL)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE score_type      AS ENUM ('numeric', 'percentage', 'letters');
CREATE TYPE activity_type   AS ENUM ('assignment', 'project', 'quiz', 'exam');
CREATE TYPE letter_grade    AS ENUM ('A', 'B', 'C', 'D', 'F-', 'F', 'F+');
CREATE TYPE attendance_status AS ENUM ('present', 'absent', 'late', 'justified');
CREATE TYPE ai_action       AS ENUM ('accepted', 'rejected', 'edited');


-- ============================================================
-- USERS
-- ============================================================

CREATE TABLE users (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name          VARCHAR(100) NOT NULL,
    last_name           VARCHAR(100) NOT NULL,
    email               VARCHAR(255) NOT NULL UNIQUE,
    password       TEXT        NOT NULL,
    last_login_at       TIMESTAMP,
    last_login_ip       INET,
    created_at          TIMESTAMP   NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users (email);


-- ============================================================
-- PASSWORD RESET TOKENS
-- ============================================================

CREATE TABLE password_reset_tokens (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    token_hash  TEXT        NOT NULL UNIQUE,
    expires_at  TIMESTAMP   NOT NULL,
    used        BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMP   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_prt_user_id ON password_reset_tokens (user_id);
CREATE INDEX idx_prt_token_hash ON password_reset_tokens (token_hash);


-- ============================================================
-- CLASSES
-- ============================================================

CREATE TABLE classes (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    name        VARCHAR(200) NOT NULL,
    score_type  score_type  NOT NULL,
    is_deleted  BOOLEAN     NOT NULL DEFAULT FALSE,
    deleted_at  TIMESTAMP,
    created_at  TIMESTAMP   NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP   NOT NULL DEFAULT NOW(),

    -- A teacher cannot have two active classes with the same name
    CONSTRAINT uq_classes_user_name UNIQUE (user_id, name)
);

CREATE INDEX idx_classes_user_id ON classes (user_id) WHERE is_deleted = FALSE;


-- ============================================================
-- STUDENTS
-- ============================================================

CREATE TABLE students (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id        UUID        NOT NULL REFERENCES classes (id) ON DELETE CASCADE,
    student_code    VARCHAR(50) NOT NULL,
    first_name      VARCHAR(100) NOT NULL,
    last_name       VARCHAR(100) NOT NULL,
    is_active       BOOLEAN     NOT NULL DEFAULT TRUE,
    added_at        TIMESTAMP   NOT NULL DEFAULT NOW(),

    -- Student codes must be unique within the same class
    CONSTRAINT uq_students_code_class UNIQUE (class_id, student_code)
);

CREATE INDEX idx_students_class_id ON students (class_id) WHERE is_active = TRUE;


-- ============================================================
-- ACTIVITIES
-- ============================================================

CREATE TABLE activities (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id        UUID            NOT NULL REFERENCES classes (id) ON DELETE CASCADE,
    name            VARCHAR(200)    NOT NULL,
    description     TEXT,
    weight          DECIMAL(5, 4)   NOT NULL CHECK (weight > 0 AND weight <= 1),
    activity_type   activity_type   NOT NULL,
    is_deleted      BOOLEAN         NOT NULL DEFAULT FALSE,
    deleted_at      TIMESTAMP,
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP       NOT NULL DEFAULT NOW()
);

-- Enforce total weight <= 100% per class at the application layer;
-- this index supports the weight-sum query efficiently
CREATE INDEX idx_activities_class_id ON activities (class_id) WHERE is_deleted = FALSE;


-- ============================================================
-- AI DESCRIPTION LOGS
-- ============================================================

CREATE TABLE ai_description_logs (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_id     UUID        NOT NULL REFERENCES activities (id) ON DELETE CASCADE,
    user_id         UUID        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    original_text   TEXT,
    ai_suggestion   TEXT        NOT NULL,
    action_taken    ai_action   NOT NULL,
    latency_ms      INTEGER     NOT NULL CHECK (latency_ms >= 0),
    created_at      TIMESTAMP   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ai_logs_activity_id ON ai_description_logs (activity_id);
CREATE INDEX idx_ai_logs_user_id     ON ai_description_logs (user_id);


-- ============================================================
-- SCORES
-- ============================================================

CREATE TABLE scores (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_id     UUID            NOT NULL REFERENCES activities (id) ON DELETE CASCADE,
    student_id      UUID            NOT NULL REFERENCES students (id) ON DELETE CASCADE,
    value_numeric   DECIMAL(8, 4),                    -- used for numeric / percentage
    value_letter    letter_grade,                     -- used for letters
    scored_by       UUID            NOT NULL REFERENCES users (id),
    scored_at       TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP       NOT NULL DEFAULT NOW(),

    -- One score per student per activity
    CONSTRAINT uq_scores_activity_student UNIQUE (activity_id, student_id),

    -- Exactly one value column must be populated
    CONSTRAINT chk_scores_one_value CHECK (
        (value_numeric IS NOT NULL AND value_letter IS NULL) OR
        (value_numeric IS NULL     AND value_letter IS NOT NULL)
    )
);

CREATE INDEX idx_scores_student_id  ON scores (student_id);
CREATE INDEX idx_scores_activity_id ON scores (activity_id);


-- ============================================================
-- ATTENDANCE SESSIONS
-- ============================================================

CREATE TABLE attendance_sessions (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id        UUID        NOT NULL REFERENCES classes (id) ON DELETE CASCADE,
    session_date    DATE        NOT NULL,
    created_by      UUID        NOT NULL REFERENCES users (id),
    created_at      TIMESTAMP   NOT NULL DEFAULT NOW(),

    -- One session per class per day
    CONSTRAINT uq_attendance_session_date UNIQUE (class_id, session_date)
);

CREATE INDEX idx_att_sessions_class_id ON attendance_sessions (class_id);


-- ============================================================
-- ATTENDANCE RECORDS
-- ============================================================

CREATE TABLE attendance_records (
    id                  UUID                PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id          UUID                NOT NULL REFERENCES attendance_sessions (id) ON DELETE CASCADE,
    student_id          UUID                NOT NULL REFERENCES students (id) ON DELETE CASCADE,
    status              attendance_status   NOT NULL,
    created_at          TIMESTAMP           NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP           NOT NULL DEFAULT NOW(),

    -- One record per student per session
    CONSTRAINT uq_attendance_record UNIQUE (session_id, student_id),

    -- Justification note only makes sense when status is 'justified'
    CONSTRAINT chk_justification CHECK (
        justification_note IS NULL OR status = 'justified'
    )
);

CREATE INDEX idx_att_records_session_id ON attendance_records (session_id);
CREATE INDEX idx_att_records_student_id ON attendance_records (student_id);


-- ============================================================
-- EXTRA POINTS
-- ============================================================

CREATE TABLE extra_points (
    id          UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id  UUID            NOT NULL REFERENCES students (id) ON DELETE CASCADE,
    class_id    UUID            NOT NULL REFERENCES classes (id) ON DELETE CASCADE,
    points      DECIMAL(6, 2)   NOT NULL CHECK (points <> 0),
    reason      TEXT,
    awarded_by  UUID            NOT NULL REFERENCES users (id),
    created_at  TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP       NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_extra_points_student_id ON extra_points (student_id);
CREATE INDEX idx_extra_points_class_id   ON extra_points (class_id);


-- ============================================================
-- EXPORT LOGS
-- ============================================================

CREATE TABLE export_logs (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id        UUID        NOT NULL REFERENCES classes (id) ON DELETE CASCADE,
    user_id         UUID        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    file_name       TEXT        NOT NULL,
    duration_ms     INTEGER     NOT NULL CHECK (duration_ms >= 0),
    created_at      TIMESTAMP   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_export_logs_class_id ON export_logs (class_id);
CREATE INDEX idx_export_logs_user_id  ON export_logs (user_id);


-- ============================================================
-- updated_at auto-update trigger
-- ============================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_classes_updated_at
    BEFORE UPDATE ON classes
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_activities_updated_at
    BEFORE UPDATE ON activities
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_scores_updated_at
    BEFORE UPDATE ON scores
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_attendance_records_updated_at
    BEFORE UPDATE ON attendance_records
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_extra_points_updated_at
    BEFORE UPDATE ON extra_points
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();