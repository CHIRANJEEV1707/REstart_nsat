"""
Views for handling OAuth callback.
"""
from django.shortcuts import render, redirect
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
import requests
import json
import logging
from django.conf import settings
from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

User = get_user_model()
logger = logging.getLogger(__name__)

def get_tokens_for_user(user):
    """Generate JWT tokens for user"""
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }

@csrf_exempt
def google_callback(request):
    """
    Handle Google OAuth callback.
    This endpoint receives the authorization code from Google and exchanges it for tokens.
    """
    code = request.GET.get('code')
    error = request.GET.get('error')
    
    if error:
        logger.error(f"Google OAuth error: {error}")
        return HttpResponse(
            f"<h1>Authentication Error</h1><p>{error}</p>",
            status=400
        )
    
    if not code:
        logger.error("No authorization code received from Google")
        return HttpResponse(
            "<h1>Authentication Error</h1><p>No authorization code received</p>",
            status=400
        )
    
    # Exchange code for tokens
    try:
        token_url = "https://oauth2.googleapis.com/token"
        
        # Use the exact registered redirect URI instead of building it from the request
        # This ensures it matches what's in the Google Cloud Console
        redirect_uri = "http://localhost:8000/api/auth/google/callback"
        
        logger.info(f"Using redirect URI: {redirect_uri}")
        
        payload = {
            'code': code,
            'client_id': settings.GOOGLE_OAUTH2_CLIENT_ID,
            'client_secret': settings.GOOGLE_OAUTH2_CLIENT_SECRET,
            'redirect_uri': redirect_uri,
            'grant_type': 'authorization_code'
        }
        
        response = requests.post(token_url, data=payload)
        token_data = response.json()
        
        if 'error' in token_data:
            logger.error(f"Error exchanging code for tokens: {token_data['error']}")
            return HttpResponse(
                f"<h1>Authentication Error</h1><p>{token_data['error']}</p>",
                status=400
            )
        
        # Verify the ID token
        id_token_value = token_data.get('id_token')
        if id_token_value:
            try:
                # Verify the token
                idinfo = id_token.verify_oauth2_token(
                    id_token_value,
                    google_requests.Request(),
                    settings.GOOGLE_OAUTH2_CLIENT_ID
                )
                
                email = idinfo.get('email')
                name = idinfo.get('name', '')
                
                if email:
                    # Get or create user
                    user, created = User.objects.get_or_create(
                        email=email,
                        defaults={
                            'name': name,
                            'auth_provider': 'google',
                            # Set default values for required fields
                            'state': idinfo.get('locale', '').split('_')[1] if idinfo.get('locale') and len(idinfo.get('locale').split('_')) > 1 else '',
                            'class_level': 12,  # Default to 12th class
                            'target_degree': 'B.Tech',  # Default target degree
                            'budget_min': 100000,  # Default budget
                            'budget_max': 500000,  # Default budget
                        }
                    )
                    
                    # Generate JWT tokens
                    tokens = get_tokens_for_user(user)
                    
                    # Add tokens to the token_data
                    token_data['jwt_tokens'] = tokens
                    token_data['user'] = {
                        'email': user.email,
                        'name': user.name,
                        'is_new_user': created
                    }
                    
                    logger.info(f"User authenticated: {email} (New user: {created})")
            except ValueError as e:
                logger.error(f"Error verifying ID token: {e}")
        
        # For this demo, we'll display success with a script to close the popup
        return HttpResponse(f"""
            <html>
            <head>
                <title>Authentication Successful</title>
                <style>
                    body {{
                        font-family: Arial, sans-serif;
                        text-align: center;
                        margin-top: 50px;
                    }}
                    h1 {{
                        color: #4285F4;
                    }}
                    pre {{
                        text-align: left;
                        margin: 20px auto;
                        max-width: 800px;
                        background: #f5f5f5;
                        padding: 10px;
                        border-radius: 5px;
                        overflow: auto;
                    }}
                </style>
            </head>
            <body>
                <h1>Authentication Successful!</h1>
                <p>You can close this window and return to the application.</p>
                <p>User: {token_data.get('user', {}).get('email', 'Unknown')}</p>
                <pre>{json.dumps(token_data, indent=2)}</pre>
                <script>
                    // Send message to opener window
                    if (window.opener) {{
                        window.opener.postMessage({{
                            type: 'GOOGLE_AUTH_SUCCESS',
                            tokens: {json.dumps(token_data)}
                        }}, '*');
                        // Close the popup after 5 seconds
                        setTimeout(() => window.close(), 5000);
                    }}
                </script>
            </body>
            </html>
        """)
        
    except Exception as e:
        logger.exception(f"Error in Google callback: {str(e)}")
        return HttpResponse(
            f"<h1>Authentication Error</h1><p>{str(e)}</p>",
            status=500
        )
