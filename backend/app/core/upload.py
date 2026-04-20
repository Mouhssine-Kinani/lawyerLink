import os
import uuid
import io
from fastapi import UploadFile, HTTPException
from PIL import Image

ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"]
MAX_SIZE_MB = 2
MAX_DIMENSION = 400


def get_upload_dir(role: str) -> str:
    """Returns the upload directory based on role (client/lawyer)."""
    return f"uploads/profiles/{role}s"


async def save_profile_picture(file: UploadFile, role: str) -> str:
    """
    Validates, resizes, and saves a profile picture.
    Returns the URL path the frontend will use to display the image.
    """

    # 1. Check file type
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Only JPEG, PNG, and WEBP images are allowed"
        )

    # 2. Read file content
    content = await file.read()

    # 3. Check file size (max 2MB)
    size_mb = len(content) / (1024 * 1024)
    if size_mb > MAX_SIZE_MB:
        raise HTTPException(
            status_code=400,
            detail=f"Image must be smaller than {MAX_SIZE_MB}MB"
        )

    # 4. Open with Pillow and validate it's a real image
    try:
        image = Image.open(io.BytesIO(content))
        image.verify()  # catches corrupted files
        # re-open after verify (verify() closes the image)
        image = Image.open(io.BytesIO(content))
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Uploaded file is not a valid image"
        )

    # 5. Convert to RGB to avoid issues with PNG transparency (RGBA)
    if image.mode in ("RGBA", "P"):
        image = image.convert("RGB")

    # 6. Resize to max 400x400 keeping aspect ratio
    image.thumbnail((MAX_DIMENSION, MAX_DIMENSION))

    # 7. Generate unique filename
    extension = "jpg"  # we always save as jpg after RGB conversion
    filename = f"{uuid.uuid4()}.{extension}"
    upload_dir = get_upload_dir(role)
    filepath = os.path.join(upload_dir, filename)

    # 8. Save resized image to disk
    os.makedirs(upload_dir, exist_ok=True)
    with open(filepath, "wb") as f:
        image.save(f, format="JPEG", quality=85)

    # 9. Return URL path for frontend
    return f"/uploads/profiles/{role}s/{filename}"


def delete_profile_picture(image_url: str):
    """
    Deletes old profile picture from disk.
    Call this before saving a new one so old files don't pile up.
    """
    if not image_url:
        return

    # skip default avatar if you have one
    if image_url == "/uploads/profiles/default.jpg":
        return

    # convert URL path to actual file path
    filepath = image_url.lstrip("/")
    if os.path.exists(filepath):
        os.remove(filepath)