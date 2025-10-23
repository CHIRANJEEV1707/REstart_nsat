"""
Celery tasks for interactions app (reminders, notifications).
"""
from celery import shared_task
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
from datetime import timedelta
import logging

logger = logging.getLogger(__name__)


@shared_task
def send_reminder_email(subscription_id):
    """
    Send reminder email for a specific subscription.
    
    Args:
        subscription_id: ID of the ReminderSubscription
    """
    from .models import ReminderSubscription
    from exams.models import ExamDate
    from colleges.models import ImportantDate
    
    try:
        subscription = ReminderSubscription.objects.get(id=subscription_id)
        
        if not subscription.is_active:
            logger.info(f"Subscription {subscription_id} is inactive, skipping")
            return {'status': 'skipped', 'reason': 'inactive'}
        
        # Get target date based on subscription type
        target_date = None
        subject = ""
        message = ""
        
        if subscription.type == 'exam_date':
            exam_date = ExamDate.objects.filter(
                id=subscription.object_id
            ).first()
            if exam_date:
                target_date = exam_date.date
                subject = f"Reminder: {exam_date.exam.name} - {exam_date.get_type_display()}"
                message = f"This is a reminder that {exam_date.exam.name} {exam_date.get_type_display()} is on {exam_date.date}.\n\n"
                message += f"Details: {exam_date.description}\n"
                message += f"Visit: {exam_date.exam.application_url}"
        
        elif subscription.type == 'college_date':
            college_date = ImportantDate.objects.filter(
                id=subscription.object_id
            ).first()
            if college_date:
                target_date = college_date.date
                subject = f"Reminder: {college_date.college.name} - {college_date.get_type_display()}"
                message = f"This is a reminder that {college_date.college.name} {college_date.get_type_display()} is on {college_date.date}.\n\n"
                message += f"Details: {college_date.description}\n"
                message += f"Visit: {college_date.college.website_url}"
        
        if target_date and 'email' in subscription.channels:
            send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL if hasattr(settings, 'DEFAULT_FROM_EMAIL') else settings.EMAIL_HOST_USER,
                recipient_list=[subscription.user.email],
                fail_silently=False,
            )
            
            subscription.last_sent_at = timezone.now()
            subscription.save(update_fields=['last_sent_at'])
            
            logger.info(f"Sent reminder email to {subscription.user.email}")
            return {'status': 'success', 'subscription_id': subscription_id}
        
        return {'status': 'skipped', 'reason': 'no_email_channel'}
        
    except ReminderSubscription.DoesNotExist:
        logger.error(f"Subscription {subscription_id} not found")
        return {'status': 'error', 'message': 'Subscription not found'}
    except Exception as exc:
        logger.error(f"Error sending reminder email: {exc}")
        return {'status': 'error', 'message': str(exc)}


@shared_task
def check_and_send_reminders():
    """
    Check for upcoming dates and send reminders.
    This task runs daily via Celery Beat.
    """
    from .models import ReminderSubscription
    from exams.models import ExamDate
    from colleges.models import ImportantDate
    from django.contrib.contenttypes.models import ContentType
    
    logger.info("Starting reminder check task")
    
    today = timezone.now().date()
    reminders_sent = 0
    
    # Get all active subscriptions
    subscriptions = ReminderSubscription.objects.filter(is_active=True)
    
    for subscription in subscriptions:
        try:
            target_date = None
            
            # Get the target date based on content type
            if subscription.type == 'exam_date':
                exam_date = ExamDate.objects.filter(id=subscription.object_id).first()
                if exam_date:
                    target_date = exam_date.date
            
            elif subscription.type == 'college_date':
                college_date = ImportantDate.objects.filter(id=subscription.object_id).first()
                if college_date:
                    target_date = college_date.date
            
            # Check if we should send reminder
            if target_date:
                days_until = (target_date - today).days
                
                # Send reminder if it matches the days_before setting
                if days_until == subscription.days_before:
                    # Check if we haven't sent recently (within last 23 hours)
                    if not subscription.last_sent_at or \
                       (timezone.now() - subscription.last_sent_at) > timedelta(hours=23):
                        send_reminder_email.delay(subscription.id)
                        reminders_sent += 1
        
        except Exception as exc:
            logger.error(f"Error processing subscription {subscription.id}: {exc}")
            continue
    
    logger.info(f"Reminder check completed. Queued {reminders_sent} reminders")
    return {
        'status': 'completed',
        'reminders_queued': reminders_sent,
        'timestamp': timezone.now().isoformat()
    }


@shared_task
def send_review_approval_notification(review_id):
    """
    Send notification when a review is approved or rejected.
    
    Args:
        review_id: ID of the Review
    """
    from .models import Review
    
    try:
        review = Review.objects.get(id=review_id)
        
        if review.status == 'approved':
            subject = f"Your review for {review.college.name} has been approved"
            message = f"Hi {review.user.name or review.user.email},\n\n"
            message += f"Your review for {review.college.name} has been approved and is now visible to other users.\n\n"
            message += f"Thank you for contributing to the REstart community!"
        
        elif review.status == 'rejected':
            subject = f"Update on your review for {review.college.name}"
            message = f"Hi {review.user.name or review.user.email},\n\n"
            message += f"We're unable to approve your review for {review.college.name}.\n\n"
            if review.moderation_notes:
                message += f"Reason: {review.moderation_notes}\n\n"
            message += f"Please feel free to submit a revised review."
        
        else:
            return {'status': 'skipped', 'reason': 'invalid_status'}
        
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL if hasattr(settings, 'DEFAULT_FROM_EMAIL') else settings.EMAIL_HOST_USER,
            recipient_list=[review.user.email],
            fail_silently=False,
        )
        
        logger.info(f"Sent review notification to {review.user.email}")
        return {'status': 'success', 'review_id': review_id}
        
    except Review.DoesNotExist:
        logger.error(f"Review {review_id} not found")
        return {'status': 'error', 'message': 'Review not found'}
    except Exception as exc:
        logger.error(f"Error sending review notification: {exc}")
        return {'status': 'error', 'message': str(exc)}
