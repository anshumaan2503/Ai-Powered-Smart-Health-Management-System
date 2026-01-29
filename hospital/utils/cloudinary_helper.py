import cloudinary
import cloudinary.uploader
import os
from flask import current_app

def configure_cloudinary():
    """Configure Cloudinary with environment variables"""
    cloudinary.config(
        cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME', ''),
        api_key=os.getenv('CLOUDINARY_API_KEY', ''),
        api_secret=os.getenv('CLOUDINARY_API_SECRET', ''),
        secure=True
    )

def upload_pdf_to_cloudinary(file, appointment_id):
    """
    Upload a PDF file to Cloudinary
    
    Args:
        file: FileStorage object from Flask request
        appointment_id: Appointment ID for naming
        
    Returns:
        dict: Contains 'url' and 'public_id' of uploaded file
    """
    try:
        # Configure cloudinary if not already configured
        if not cloudinary.config().cloud_name:
            configure_cloudinary()
        
        # Check if Cloudinary is configured
        if not cloudinary.config().cloud_name:
            # Fallback to local storage if Cloudinary is not configured
            return None
            
        # Upload to Cloudinary
        result = cloudinary.uploader.upload(
            file,
            folder="medical_reports",
            resource_type="raw",  # For PDFs
            public_id=f"report_{appointment_id}",
            overwrite=True,
            format="pdf"
        )
        
        return {
            'url': result.get('secure_url'),
            'public_id': result.get('public_id')
        }
    except Exception as e:
        current_app.logger.error(f"Cloudinary upload error: {str(e)}")
        return None

def delete_pdf_from_cloudinary(public_id):
    """
    Delete a PDF file from Cloudinary
    
    Args:
        public_id: Public ID of the file to delete
        
    Returns:
        bool: True if successful, False otherwise
    """
    try:
        if not cloudinary.config().cloud_name:
            configure_cloudinary()
            
        result = cloudinary.uploader.destroy(public_id, resource_type="raw")
        return result.get('result') == 'ok'
    except Exception as e:
        current_app.logger.error(f"Cloudinary delete error: {str(e)}")
        return False
