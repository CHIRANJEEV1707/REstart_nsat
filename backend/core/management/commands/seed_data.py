"""
Management command to seed the database with dummy data for testing.
"""
import random
from datetime import date, timedelta
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from users.models import User
from colleges.models import College, Degree, CollegeDegree, Scholarship, ImportantDate
from exams.models import Exam, ExamDate
from interactions.models import Shortlist, ReminderSubscription, Review


class Command(BaseCommand):
    help = 'Seeds the database with dummy data for testing'

    def add_arguments(self, parser):
        parser.add_argument(
            '--users',
            type=int,
            default=5,
            help='Number of users to create'
        )
        parser.add_argument(
            '--colleges',
            type=int,
            default=10,
            help='Number of colleges to create'
        )
        parser.add_argument(
            '--exams',
            type=int,
            default=3,
            help='Number of exams to create'
        )

    def handle(self, *args, **options):
        num_users = options['users']
        num_colleges = options['colleges']
        num_exams = options['exams']

        self.stdout.write(self.style.SUCCESS(f'Starting to seed database...'))
        
        with transaction.atomic():
            # Create users
            self.create_users(num_users)
            
            # Create exams
            exams = self.create_exams(num_exams)
            
            # Create degrees
            degrees = self.create_degrees()
            
            # Create colleges
            colleges = self.create_colleges(num_colleges, exams, degrees)
            
            # Create interactions
            self.create_interactions(User.objects.all(), colleges)
        
        self.stdout.write(self.style.SUCCESS(f'Successfully seeded database!'))
        self.stdout.write(f'Created {num_users} users')
        self.stdout.write(f'Created {num_colleges} colleges')
        self.stdout.write(f'Created {num_exams} exams')
        self.stdout.write(f'Created {len(degrees)} degrees')

    def create_users(self, count):
        """Create dummy users"""
        self.stdout.write('Creating users...')
        
        # States for random assignment
        states = ['Delhi', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Uttar Pradesh']
        
        # Create regular users
        for i in range(count):
            user = User.objects.create_user(
                email=f'user{i+1}@example.com',
                password='password123',
                name=f'Test User {i+1}',
                state=random.choice(states),
                class_level=random.choice([10, 11, 12]),
                target_degree=random.choice(['B.Tech', 'B.Sc', 'BBA', 'MBBS']),
                budget_min=random.randint(50000, 200000),
                budget_max=random.randint(300000, 1000000),
            )
            self.stdout.write(f'  - Created user: {user.email}')
        
        return User.objects.all()

    def create_exams(self, count):
        """Create dummy exams"""
        self.stdout.write('Creating exams...')
        
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
            exam = Exam.objects.create(**data)
            exams.append(exam)
            
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
            
            self.stdout.write(f'  - Created exam: {exam.code} - {exam.name}')
        
        return exams

    def create_degrees(self):
        """Create common degree programs"""
        self.stdout.write('Creating degrees...')
        
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
                self.stdout.write(f'  - Created degree: {degree.name}')
            else:
                self.stdout.write(f'  - Using existing degree: {degree.name}')
        
        return degrees

    def create_colleges(self, count, exams, degrees):
        """Create dummy colleges with related data"""
        self.stdout.write('Creating colleges...')
        
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
            
            college = College.objects.create(
                name=f'Test College {i+1}',
                description=f'This is a test college for {city}, {state}.',
                status='published',
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
            colleges.append(college)
            
            # Associate with random exams
            for exam in random.sample(list(exams), k=min(random.randint(1, 3), len(exams))):
                college.exams_required.add(exam)
            
            # Add degrees
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
            
            self.stdout.write(f'  - Created college: {college.name} ({college.city}, {college.state})')
        
        return colleges

    def create_interactions(self, users, colleges):
        """Create user interactions with colleges"""
        self.stdout.write('Creating user interactions...')
        
        for user in users:
            # Save some colleges
            saved_colleges = random.sample(list(colleges), k=min(random.randint(2, 5), len(colleges)))
            for college in saved_colleges:
                Shortlist.objects.create(
                    user=user,
                    college=college
                )
                self.stdout.write(f'  - User {user.email} saved college: {college.name}')
            
            # Create reminders
            for college in random.sample(saved_colleges, k=min(random.randint(1, 3), len(saved_colleges))):
                from django.contrib.contenttypes.models import ContentType
                college_content_type = ContentType.objects.get_for_model(college)
                ReminderSubscription.objects.create(
                    user=user,
                    type='college_date',
                    content_type=college_content_type,
                    object_id=college.id,
                    channels=['email', 'push']
                )
                self.stdout.write(f'  - User {user.email} set reminder for: {college.name}')
            
            # Create reviews
            for college in random.sample(list(colleges), k=min(random.randint(1, 3), len(colleges))):
                Review.objects.create(
                    user=user,
                    college=college,
                    rating=random.randint(3, 5),
                    title=f'My experience at {college.name}',
                    body=f'This is a test review for {college.name}. The campus is great and faculty is helpful.',
                    tags=['campus', 'faculty', 'placements'],
                    status='approved'
                )
                self.stdout.write(f'  - User {user.email} reviewed college: {college.name}')
