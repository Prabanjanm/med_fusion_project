# Typography Unification - Orbitron Font System

## ✅ Orbitron Font Applied Globally

### Primary Font
**Orbitron** - Futuristic, tech-focused, gaming-style font
- Perfect for blockchain/CSR/tech platform aesthetic
- Consistent across all pages and components

### Files Updated

#### 1. **Global Styles**
- ✅ `global.css` - Set `--font-family: 'Orbitron'`
  - Body text: Orbitron
  - Headings (h1-h6): Orbitron, bold (700), with glow effect
  - Letter-spacing: 0.05em

#### 2. **Authentication Pages**
- ✅ `Auth.css` - Login/Registration pages use Orbitron

#### 3. **Home Page**
- ✅ `Home.css` - Landing page uses Orbitron

#### 4. **Dashboard Components**
- ✅ `Table.css` - Table headers
- ✅ `SummaryCard.css` - Card labels and values
- ✅ `StatusBadge.css` - Status badges
- ✅ `Sidebar.css` - Sidebar brand name
- ✅ `HistoryStyles.css` - History page titles and search
- ✅ `FormStyles.css` - Form sections and inputs
- ✅ `AnimatedButton.css` - Button text
- ✅ `AuditTrail.css` - Audit page headers
- ✅ `WizardModal.css` - Wizard modal titles and buttons

### Typography Hierarchy

```css
/* Global Font Variable */
--font-family: 'Orbitron', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

/* Body */
body {
  font-family: 'Orbitron', sans-serif !important;
  font-weight: 400;
}

/* Headings */
h1, h2, h3, h4, h5, h6 {
  font-family: 'Orbitron', sans-serif !important;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-shadow: 0 0 20px rgba(67, 97, 238, 0.3);
}

/* Buttons, Inputs, Labels */
.btn, .input-field, .badge {
  font-family: 'Orbitron', sans-serif;
  font-weight: 600-700;
  letter-spacing: 0.5px-2px;
  text-transform: uppercase;
}
```

### Monospace Font (Code Only)
- **JetBrains Mono** - Used only for:
  - Transaction hashes in `BlockchainToast.css`
  - Code blocks in `AuditTrail.css`
  - Technical data in `WizardModal.css`

### Design Aesthetic
- **Futuristic**: Tech-forward, blockchain-ready
- **Bold**: Strong, confident typography
- **Consistent**: Same font everywhere (except code)
- **Gaming-style**: Neon glow effects, uppercase text
- **High-tech**: Perfect for CSR/audit/compliance platform

### Font Loading
Ensure Orbitron is loaded in `index.html`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
```

### User Experience
```
Login (Orbitron) → Dashboard (Orbitron) → Forms (Orbitron) → Tables (Orbitron) → Audit (Orbitron)
```

**One cohesive, futuristic, tech-forward experience across the entire application!** 🚀
