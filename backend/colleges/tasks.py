"""
Celery tasks for colleges app.
"""
from celery import shared_task
from django.core.management import call_command
from django.utils import timezone
import logging

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3)
def update_elasticsearch_index(self):
    """
    Update Elasticsearch index for colleges.
    This task rebuilds the entire index to ensure data consistency.
    """
    try:
        logger.info("Starting Elasticsearch index update for colleges")
        call_command('search_index', '--rebuild', '-f', '--models', 'colleges.College')
        logger.info("Successfully updated Elasticsearch index for colleges")
        return {'status': 'success', 'timestamp': timezone.now().isoformat()}
    except Exception as exc:
        logger.error(f"Error updating Elasticsearch index: {exc}")
        raise self.retry(exc=exc, countdown=300)  # Retry after 5 minutes


@shared_task(bind=True)
def process_bulk_college_import(self, csv_file_path, admin_user_id):
    """
    Process bulk import of colleges from CSV file.
    
    Args:
        csv_file_path: Path to the CSV file
        admin_user_id: ID of the admin user who initiated the import
    """
    from .models import College
    from users.models import User
    import csv
    
    try:
        admin_user = User.objects.get(id=admin_user_id)
        logger.info(f"Starting bulk college import by user {admin_user.email}")
        
        imported_count = 0
        error_count = 0
        errors = []
        
        with open(csv_file_path, 'r', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            
            for row_num, row in enumerate(reader, start=2):
                try:
                    # Create or update college
                    college, created = College.objects.update_or_create(
                        name=row['name'],
                        defaults={
                            'description': row.get('description', ''),
                            'state': row['state'],
                            'city': row['city'],
                            'type': row.get('type', 'private'),
                            'fees_annual': int(row.get('fees_annual', 0)),
                            'fees_hostel': int(row.get('fees_hostel', 0)),
                            'restart_score': int(row.get('restart_score', 0)),
                            'website_url': row.get('website_url', ''),
                            'status': row.get('status', 'draft'),
                        }
                    )
                    imported_count += 1
                    
                except Exception as e:
                    error_count += 1
                    errors.append(f"Row {row_num}: {str(e)}")
                    logger.error(f"Error importing row {row_num}: {e}")
        
        result = {
            'status': 'completed',
            'imported': imported_count,
            'errors': error_count,
            'error_details': errors[:10],  # First 10 errors
            'timestamp': timezone.now().isoformat()
        }
        
        logger.info(f"Bulk import completed: {imported_count} imported, {error_count} errors")
        return result
        
    except Exception as exc:
        logger.error(f"Fatal error in bulk import: {exc}")
        return {
            'status': 'failed',
            'error': str(exc),
            'timestamp': timezone.now().isoformat()
        }


@shared_task
def update_college_statistics(college_id):
    """
    Update college statistics like average rating and review count.
    
    Args:
        college_id: ID of the college to update
    """
    from .models import College
    from interactions.models import Review
    from django.db.models import Avg, Count
    
    try:
        college = College.objects.get(id=college_id)
        
        # Calculate statistics from approved reviews
        stats = Review.objects.filter(
            college=college,
            status='approved'
        ).aggregate(
            avg_rating=Avg('rating'),
            review_count=Count('id')
        )
        
        college.reviews_avg = stats['avg_rating'] or 0.0
        college.ratings_count = stats['review_count'] or 0
        college.save(update_fields=['reviews_avg', 'ratings_count', 'updated_at'])
        
        logger.info(f"Updated statistics for college {college.name}")
        return {'status': 'success', 'college_id': college_id}
        
    except College.DoesNotExist:
        logger.error(f"College with id {college_id} not found")
        return {'status': 'error', 'message': 'College not found'}
    except Exception as exc:
        logger.error(f"Error updating college statistics: {exc}")
        return {'status': 'error', 'message': str(exc)}
