"""
Script to seed the database with dummy data for testing.
"""
import os
import random
import django
from datetime import timedelta

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

# Disable Elasticsearch integration completely
os.environ['DJANGO_ELASTICSEARCH_DSL_AUTOSYNC'] = 'false'

# Monkey patch the signal handlers before Django setup
from django.apps import apps
apps.ready = False  # Reset app registry ready status

# Disable Elasticsearch signals completely
def _dummy_handler(*args, **kwargs):
    pass

# Import and patch before Django setup
import django_elasticsearch_dsl.signals
django_elasticsearch_dsl.signals.handle_save = _dummy_handler
django_elasticsearch_dsl.signals.handle_pre_delete = _dummy_handler
django_elasticsearch_dsl.signals.handle_delete = _dummy_handler

django.setup()

from django.utils import timezone
from django.db import transaction
from django.contrib.contenttypes.models import ContentType

from users.models import User
from colleges.models import College, Degree, CollegeDegree, Scholarship, ImportantDate
from exams.models import Exam, ExamDate
from interactions.models import Shortlist, ReminderSubscription, Review


def create_users(count=5):
    """Create dummy users"""
    print('Creating users...')
    
    # States for random assignment
    states = ['Delhi', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Uttar Pradesh']
    
    # Create regular users
    users = []
    for i in range(count):
        email = f'user{i+1}@example.com'
        try:
            # Try to get existing user
            user = User.objects.get(email=email)
            print(f'  - Using existing user: {user.email}')
        except User.DoesNotExist:
            # Create new user
            user = User.objects.create_user(
                email=email,
                password='password123',
                name=f'Test User {i+1}',
                state=random.choice(states),
                class_level=random.choice([10, 11, 12]),
                target_degree=random.choice(['B.Tech', 'B.Sc', 'BBA', 'MBBS']),
                budget_min=random.randint(50000, 200000),
                budget_max=random.randint(300000, 1000000),
            )
            print(f'  - Created user: {user.email}')
        
        users.append(user)
    
    return users


def create_exams(count=3):
    """Create dummy exams"""
    print('Creating exams...')
    
    exam_data = [
        {
            'code': 'JEE-MAIN',
            'name': 'Joint Entrance Examination - Main',
            'overview': 'National level entrance exam for admission to engineering colleges in India.',
            'eligibility': 'Students who have passed class 12th or equivalent exam.',
            'pattern': 'Multiple choice questions on Physics, Chemistry, and Mathematics.',
            'syllabus_summary': 'Class 11 and 12 NCERT syllabus for PCM subjects.',
            'application_url': 'https://jeemain.nta.nic.in/',
        },
        {
            'code': 'JEE-ADV',
            'name': 'Joint Entrance Examination - Advanced',
            'overview': 'Entrance exam for admission to IITs.',
            'eligibility': 'Top 2,50,000 candidates who qualify JEE Main.',
            'pattern': 'Multiple choice and numerical value questions on PCM.',
            'syllabus_summary': 'Advanced topics in Physics, Chemistry, and Mathematics.',
            'application_url': 'https://jeeadv.ac.in/',
        },
        {
            'code': 'NEET',
            'name': 'National Eligibility cum Entrance Test',
            'overview': 'Entrance exam for medical colleges in India.',
            'eligibility': 'Students who have passed class 12th with Biology.',
            'pattern': 'Multiple choice questions on Physics, Chemistry, and Biology.',
            'syllabus_summary': 'Class 11 and 12 NCERT syllabus for PCB subjects.',
            'application_url': 'https://neet.nta.nic.in/',
        },
        {
            'code': 'BITSAT',
            'name': 'BITS Admission Test',
            'overview': 'Entrance exam for admission to BITS Pilani campuses.',
            'eligibility': 'Students who have passed class 12th with PCM.',
            'pattern': 'Computer-based test with MCQs on PCM and English.',
            'syllabus_summary': 'Class 11 and 12 syllabus for PCM subjects.',
            'application_url': 'https://www.bitsadmission.com/',
        },
        {
            'code': 'MHT-CET',
            'name': 'Maharashtra Common Entrance Test',
            'overview': 'State-level entrance exam for engineering and pharmacy courses in Maharashtra.',
            'eligibility': 'Students who have passed HSC with PCM/PCB.',
            'pattern': 'Multiple choice questions on PCM/PCB.',
            'syllabus_summary': 'Maharashtra State Board HSC syllabus.',
            'application_url': 'https://cetcell.mahacet.org/',
        },
    ]
    
    exams = []
    for i in range(min(count, len(exam_data))):
        data = exam_data[i]
        exam, created = Exam.objects.get_or_create(code=data['code'], defaults=data)
        exams.append(exam)
        
        if created:
            # Create exam dates
            today = timezone.now().date()
            ExamDate.objects.create(
                exam=exam,
                type='registration_start',
                date=today - timedelta(days=60),
                description=f'{exam.code} Registration Opens'
            )
            ExamDate.objects.create(
                exam=exam,
                type='registration_end',
                date=today - timedelta(days=30),
                description=f'{exam.code} Registration Closes'
            )
            ExamDate.objects.create(
                exam=exam,
                type='exam_date',
                date=today + timedelta(days=30),
                description=f'{exam.code} Exam Day'
            )
            ExamDate.objects.create(
                exam=exam,
                type='result_date',
                date=today + timedelta(days=60),
                description=f'{exam.code} Results'
            )
            
            print(f'  - Created exam: {exam.code} - {exam.name}')
        else:
            print(f'  - Using existing exam: {exam.code} - {exam.name}')
    
    return exams


def create_degrees():
    """Create common degree programs"""
    print('Creating degrees...')
    
    degree_data = [
        {'name': 'B.Tech Computer Science', 'degree_type': 'ug', 'duration_years': 4},
        {'name': 'B.Tech Electronics', 'degree_type': 'ug', 'duration_years': 4},
        {'name': 'B.Tech Mechanical', 'degree_type': 'ug', 'duration_years': 4},
        {'name': 'B.Tech Civil', 'degree_type': 'ug', 'duration_years': 4},
        {'name': 'B.Tech Chemical', 'degree_type': 'ug', 'duration_years': 4},
        {'name': 'B.Sc Computer Science', 'degree_type': 'ug', 'duration_years': 3},
        {'name': 'B.Sc Physics', 'degree_type': 'ug', 'duration_years': 3},
        {'name': 'B.Sc Mathematics', 'degree_type': 'ug', 'duration_years': 3},
        {'name': 'BBA', 'degree_type': 'ug', 'duration_years': 3},
        {'name': 'M.Tech Computer Science', 'degree_type': 'pg', 'duration_years': 2},
        {'name': 'M.Tech Electronics', 'degree_type': 'pg', 'duration_years': 2},
        {'name': 'MBA', 'degree_type': 'pg', 'duration_years': 2},
    ]
    
    degrees = []
    for data in degree_data:
        degree, created = Degree.objects.get_or_create(**data)
        degrees.append(degree)
        if created:
            print(f'  - Created degree: {degree.name}')
        else:
            print(f'  - Using existing degree: {degree.name}')
    
    return degrees


def create_colleges(count=10, exams=None, degrees=None):
    """Create dummy colleges with related data"""
    print('Creating colleges...')
    
    # Data for random assignment
    states = ['Delhi', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Uttar Pradesh']
    cities = {
        'Delhi': ['New Delhi', 'Delhi'],
        'Maharashtra': ['Mumbai', 'Pune', 'Nagpur'],
        'Karnataka': ['Bangalore', 'Mysore', 'Mangalore'],
        'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai'],
        'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Noida'],
    }
    college_types = ['government', 'private', 'deemed', 'autonomous']
    
    colleges = []
    for i in range(count):
        state = random.choice(states)
        city = random.choice(cities[state])
        
        try:
            # Try to get existing college
            college = College.objects.get(name=f'Test College {i+1}')
            print(f'  - Using existing college: {college.name} ({college.city}, {college.state})')
        except College.DoesNotExist:
            # Create new college
            college = College(
                name=f'Test College {i+1}',
                description=f'This is a test college for {city}, {state}.',
                status='published',  # Make sure status is set
                state=state,
                city=city,
                location_lat=random.uniform(8.0, 37.0),
                location_lng=random.uniform(68.0, 97.0),
                accreditation=['NAAC A+', 'NBA'] if random.choice([True, False]) else ['NAAC B'],
                type=random.choice(college_types),
                fees_annual=random.randint(50000, 500000),
                fees_hostel=random.randint(30000, 150000),
                restart_score=random.randint(60, 95),
                ratings_count=random.randint(10, 200),
                reviews_avg=round(random.uniform(3.0, 4.8), 2),
                website_url=f'https://college{i+1}.example.com',
            )
            # Save without triggering signals
            college.save(update_fields=None)
            print(f'  - Created college: {college.name} ({college.city}, {college.state})')
            
            # Associate with random exams
            if exams:
                for exam in random.sample(list(exams), k=min(random.randint(1, 3), len(exams))):
                    college.exams_required.add(exam)
            
            # Add degrees
            if degrees:
                for degree in random.sample(list(degrees), k=min(random.randint(3, 8), len(degrees))):
                    CollegeDegree.objects.create(
                        college=college,
                        degree=degree,
                        seats_available=random.randint(30, 120)
                    )
            
            # Add scholarships
            scholarship_names = ['Merit Scholarship', 'Sports Scholarship', 'Need-based Scholarship']
            for name in random.sample(scholarship_names, k=random.randint(1, 3)):
                Scholarship.objects.create(
                    college=college,
                    name=name,
                    criteria=f'Eligibility criteria for {name}',
                    amount=random.randint(10000, 100000)
                )
            
            # Add important dates
            today = timezone.now().date()
            ImportantDate.objects.create(
                college=college,
                type='admission_start',
                date=today + timedelta(days=random.randint(10, 30)),
                description='Admission process begins'
            )
            ImportantDate.objects.create(
                college=college,
                type='admission_end',
                date=today + timedelta(days=random.randint(40, 60)),
                description='Last date for applications'
            )
        
        colleges.append(college)
    
    return colleges


def create_interactions(users, colleges):
    """Create user interactions with colleges"""
    print('Creating user interactions...')
    
    for user in users:
        # Save some colleges
        saved_colleges = random.sample(list(colleges), k=min(random.randint(2, 5), len(colleges)))
        for college in saved_colleges:
            shortlist, created = Shortlist.objects.get_or_create(
                user=user,
                college=college
            )
            if created:
                print(f'  - User {user.email} saved college: {college.name}')
            else:
                print(f'  - User {user.email} already saved college: {college.name}')
        
        # Create reminders
        for college in random.sample(saved_colleges, k=min(random.randint(1, 3), len(saved_colleges))):
            college_content_type = ContentType.objects.get_for_model(college)
            reminder, created = ReminderSubscription.objects.get_or_create(
                user=user,
                content_type=college_content_type,
                object_id=college.id,
                defaults={
                    'type': 'college_date',
                    'channels': ['email', 'push']
                }
            )
            if created:
                print(f'  - User {user.email} set reminder for: {college.name}')
            else:
                print(f'  - User {user.email} already has reminder for: {college.name}')
        
        # Create reviews
        for college in random.sample(list(colleges), k=min(random.randint(1, 3), len(colleges))):
            review, created = Review.objects.get_or_create(
                user=user,
                college=college,
                defaults={
                    'rating': random.randint(3, 5),
                    'title': f'My experience at {college.name}',
                    'body': f'This is a test review for {college.name}. The campus is great and faculty is helpful.',
                    'tags': ['campus', 'faculty', 'placements'],
                    'status': 'approved'
                }
            )
            if created:
                print(f'  - User {user.email} reviewed college: {college.name}')
            else:
                print(f'  - User {user.email} already reviewed college: {college.name}')


def seed_database(num_users=5, num_colleges=10, num_exams=3):
    """Main function to seed the database"""
    print('Starting to seed database...')
    
    with transaction.atomic():
        # Create users
        users = create_users(num_users)
        
        # Create exams
        exams = create_exams(num_exams)
        
        # Create degrees
        degrees = create_degrees()
        
        # Create colleges
        colleges = create_colleges(num_colleges, exams, degrees)
        
        # Create interactions
        create_interactions(users, colleges)
    
    print('Successfully seeded database!')
    print(f'Created/updated {num_users} users')
    print(f'Created/updated {num_colleges} colleges')
    print(f'Created/updated {num_exams} exams')
    print(f'Created/updated {len(degrees)} degrees')


if __name__ == '__main__':
    seed_database()
