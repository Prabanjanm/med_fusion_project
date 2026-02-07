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



def get_signed_file_url(bucket: str, path: str, expires_in: int = 3600):
    response = supabase.storage.from_(bucket).create_signed_url(
        path,
        expires_in
    )
    return response["signedURL"]


import uuid
from app.core.supabase import supabase

DOCUMENT_BUCKET = "org-documents"


def upload_org_document(
    entity: str,        # "csr" | "ngo"
    entity_uid: str,    # CSR-XXXX / NGO-XXXX
    file_bytes: bytes,
    filename: str,
    content_type: str,
):
    """
    Upload CSR / NGO documents to Supabase bucket
    """
    file_path = f"{entity}/{entity_uid}/{uuid.uuid4()}_{filename}"

    supabase.storage.from_(DOCUMENT_BUCKET).upload(
        file_path,
        file_bytes,
        {"content-type": content_type},
    )

    return {
        "bucket": DOCUMENT_BUCKET,
        "path": file_path,
    }
