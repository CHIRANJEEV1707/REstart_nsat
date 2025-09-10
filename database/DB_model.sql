-- USERS TABLE
CREATE TABLE Users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    auth_provider VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    class_level SMALLINT NOT NULL,
    target_degree VARCHAR(255) NOT NULL,
    budget_min INT NOT NULL,
    budget_max INT NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

-- EXAMS TABLE
CREATE TABLE Exams (
    exams_id SERIAL PRIMARY KEY,
    code VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    overview TEXT NOT NULL,
    eligibility TEXT NOT NULL,
    pattern TEXT NOT NULL,
    syllabus_summary TEXT NOT NULL,
    application_url TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

-- EXAM DATES
CREATE TABLE exam_dates (
    id SERIAL PRIMARY KEY,
    exam_id INT NOT NULL,
    type VARCHAR(100) NOT NULL,
    date DATE NOT NULL,
    FOREIGN KEY (exam_id) REFERENCES Exams(exams_id) ON DELETE NO ACTION ON UPDATE NO ACTION
);

-- COLLEGES
CREATE TABLE colleges (
    college_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    state VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    location_lat DECIMAL(10,6) NOT NULL,
    location_lng DECIMAL(10,6) NOT NULL,
    accreditation TEXT NOT NULL,
    type VARCHAR(100) NOT NULL,
    fees_annual INT NOT NULL,
    fees_hostel INT NOT NULL,
    restart_score SMALLINT NOT NULL,
    ratings_count INT NOT NULL,
    reviews_avg DECIMAL(3,2) NOT NULL,
    website_url TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

-- COLLEGE_EXAMS (Many-to-Many)
CREATE TABLE college_exams (
    college_id INT NOT NULL,
    exam_id INT NOT NULL,
    PRIMARY KEY (college_id, exam_id),
    FOREIGN KEY (college_id) REFERENCES colleges(college_id) ON DELETE NO ACTION ON UPDATE NO ACTION,
    FOREIGN KEY (exam_id) REFERENCES Exams(exams_id) ON DELETE NO ACTION ON UPDATE NO ACTION
);

-- COLLEGE_DEGREES
CREATE TABLE college_degrees (
    id SERIAL PRIMARY KEY,
    college_id INT,
    degree VARCHAR(255),
    FOREIGN KEY (college_id) REFERENCES colleges(college_id) ON DELETE NO ACTION ON UPDATE NO ACTION
);

-- SCHOLARSHIPS
CREATE TABLE scholarships (
    id SERIAL PRIMARY KEY,
    college_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    criteria TEXT NOT NULL,
    FOREIGN KEY (college_id) REFERENCES colleges(college_id) ON DELETE NO ACTION ON UPDATE NO ACTION
);

-- PREP_PLANS
CREATE TABLE prep_plans (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    exam_id INT NOT NULL,
    status VARCHAR(100) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE NO ACTION ON UPDATE NO ACTION,
    FOREIGN KEY (exam_id) REFERENCES Exams(exams_id) ON DELETE NO ACTION ON UPDATE NO ACTION
);

-- PREP_WEEKS
CREATE TABLE prep_weeks (
    id SERIAL PRIMARY KEY,
    prep_plan_id INT,
    week_number INT,
    FOREIGN KEY (prep_plan_id) REFERENCES prep_plans(id) ON DELETE NO ACTION ON UPDATE NO ACTION
);

-- SAVED_COLLEGES (Many-to-Many)
CREATE TABLE saved_colleges (
    user_id INT NOT NULL,
    college_id INT NOT NULL,
    created_at TIMESTAMP,
    PRIMARY KEY (user_id, college_id),
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE NO ACTION ON UPDATE NO ACTION,
    FOREIGN KEY (college_id) REFERENCES colleges(college_id) ON DELETE NO ACTION ON UPDATE NO ACTION
);

-- REMINDERS
CREATE TABLE reminders (
    id SERIAL PRIMARY KEY,
    user_id INT,
    type VARCHAR(100),
    target_id INT,
    channels VARCHAR(255),
    created_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE NO ACTION ON UPDATE NO ACTION
);

-- REVIEWS
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    college_id INT NOT NULL,
    rating SMALLINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    tags JSON NOT NULL,
    status VARCHAR(100) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE NO ACTION ON UPDATE NO ACTION,
    FOREIGN KEY (college_id) REFERENCES colleges(college_id) ON DELETE NO ACTION ON UPDATE NO ACTION
);
