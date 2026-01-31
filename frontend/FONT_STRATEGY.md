# Font Strategy Update

## Rules Applied
1.  **Global Font**: `Inter` is now the default font for the entire application.
2.  **Orbitron Usage**: Restricted strictly to:
    *   **Main Page Headings (`h1`)**: e.g., "Select Your Portal", "NGO Dashboard".
    *   **Role Titles**: "Corporate Donor", "NGO Partner", "Medical Clinic", "Official Auditor".
3.  **Everything Else**: Uses `Inter` for maximum readability (Body text, buttons, subtitles, forms).

## Changes Made
- **Global CSS**: Set `Inter` as default variable. Configured `h1` to use `Orbitron`.
- **Role Selection**: Explicitly applied `Orbitron` to the main heading and role cards.
- **Dashboards**: Removed `Orbitron` from action buttons to reduce visual noise. Buttons now use `Inter` (uppercase).
- **Clinic Request Form**: Removed `Orbitron` from form section headers and inputs for better usability.

## Result
The application now balances the "futuristic" feel (via Orbitron headings) with professional usability (via Inter body text), specifically fixing the over-use of Orbitron in dashboards and forms.
