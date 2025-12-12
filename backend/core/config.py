"""
Configuration settings for WL-Drop backend
"""

import os
from typing import Optional
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings"""
    
    # Server configuration
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # File upload settings
    UPLOAD_DIR: str = "./uploads"
    MAX_FILE_SIZE: int = 10 * 1024 * 1024 * 1024  # 10GB
    CHUNK_SIZE: int = 1024 * 1024  # 1MB chunks
    
    # Cleanup settings
    AUTO_CLEANUP_HOURS: int = 24  # Auto delete files after 24 hours
    
    # CORS
    CORS_ORIGINS: list = ["*"]
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
