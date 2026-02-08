import uuid
import mimetypes
from app.core.supabase import supabase

BUCKET_NAME = "clinic-registers"


def upload_register_image(
    clinic_id: int,
    file_bytes: bytes,
    filename: str,
):
    file_path = f"clinic_{clinic_id}/{uuid.uuid4()}_{filename}"
    print(f"Uploading to Supabase: {file_path}")

    # 🔑 Detect correct content-type
    content_type, _ = mimetypes.guess_type(filename)
    if not content_type:
        content_type = "application/octet-stream"

    supabase.storage.from_(BUCKET_NAME).upload(
        path=file_path,
        file=file_bytes,
        file_options={"content-type": content_type},
    )

    print("Upload successful")

    return {
        "bucket": BUCKET_NAME,
        "path": file_path,
        "content_type": content_type,
    }



from urllib.parse import quote

def get_signed_file_url(bucket: str, path: str, expires_in: int = 3600):
    try:
        if not bucket or not path:
            return None

        # 🔒 Encode spaces & unsafe chars
        safe_path = quote(path, safe="/")

        response = supabase.storage.from_(bucket).create_signed_url(
            safe_path,
            expires_in,
        )
        return response["signedURL"]

    except Exception as e:
        print("SIGNED URL FAILED")
        print("Bucket:", bucket)
        print("Path:", path)
        print("Error:", e)
        return None


import uuid
from app.core.supabase import supabase


BUCKET_NAME = "org-documents"

def upload_org_document(file_bytes: bytes, filename: str, folder: str) -> str:
    unique_name = f"{uuid.uuid4()}_{filename}"
    path = f"{folder}/{unique_name}"

    supabase.storage.from_(BUCKET_NAME).upload(
        path=path,
        file=file_bytes,
        file_options={"content-type": "application/pdf"},
    )

    return path  # 🔑 ONLY PATH

