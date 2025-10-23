"""
Celery configuration for REstart project.
"""
import os
from celery import Celery
from celery.schedules import crontab

# Set the default Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

app = Celery('restart')

# Load configuration from Django settings with CELERY namespace
app.config_from_object('django.conf:settings', namespace='CELERY')

# Auto-discover tasks in all installed apps
app.autodiscover_tasks()

# Celery Beat Schedule for periodic tasks
app.conf.beat_schedule = {
    'check-upcoming-reminders': {
        'task': 'interactions.tasks.check_and_send_reminders',
        'schedule': crontab(hour=9, minute=0),  # Run daily at 9 AM
    },
    'update-college-elasticsearch-index': {
        'task': 'colleges.tasks.update_elasticsearch_index',
        'schedule': crontab(hour=2, minute=0),  # Run daily at 2 AM
    },
}


@app.task(bind=True, ignore_result=True)
def debug_task(self):
    print(f'Request: {self.request!r}')
