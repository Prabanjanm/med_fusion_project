git checkout -b feature-name
git add .
git commit -m "feat: add login module"
git push -u origin feature-name
git pull origin feature-name

#to start the backend
pipenv run python -m uvicorn app.main:app --reload


| Role    | Username     | Password  |
| ------- | ------------ | --------- |
| CSR     | csr_user     | csr123    |
| NGO     | ngo_user     | ngo123    |
| CLINIC  | clinic_user  | clinic123 |
| AUDITOR | auditor_user | audit123  |

from app.auth.utils import hash_password
print("admin_user:", hash_password("admin123"))
print("csr_user:", hash_password("csr123"))
print("ngo_user:", hash_password("ngo123"))
print("clinic_user:", hash_password("clinic123"))
print("auditor_user:", hash_password("audit123"))


