# Feature 3: Breast Cancer Risk Calculator (Gail Model)

**Category:** Public Website  
**Access:** Public (no login required)  
**Priority:** Core

---

## Overview

A multi-step interactive form that estimates breast cancer risk using the Gail Model algorithm.

---

## Algorithm

**Gail Model:** Standard breast cancer risk assessment model used clinically worldwide.

---

## Functionality

### Step 1: User Input

Collect the following information:
- Current age (numeric, required)
- Age at first menstrual period (numeric, required)
- Age at first live birth (numeric, optional)
- Number of past breast biopsies (numeric, required)
- Family history of breast cancer (yes/no, required)
  - If yes: specify relationship (mother, sister, aunt, other relatives)

### Step 2: Risk Calculation

- Calculate risk score using Gail Model algorithm
- Determine risk level category:
  - **Low Risk**: Score < 1.3%
  - **Moderate Risk**: Score 1.3% - 2.5%
  - **High Risk**: Score > 2.5%

### Step 3: Results Display

- Display calculated risk score as percentage
- Show risk level with color coding
- Personalized recommendation based on risk tier:
  - **Low**: Regular self-examination, healthy lifestyle
  - **Moderate**: Increased monitoring, consult doctor
  - **High**: Urgent medical consultation recommended
- Reset button to recalculate with new values
- Option to save results (with user login)
- Printable results format

---

## Implementation Requirements

- Form validation for all inputs
- Client-side or server-side Gail Model calculation
- Clear error messages for invalid inputs
- Progress indicator for multi-step form
- Accessibility compliance (WCAG 2.1)
- Mobile-responsive design
- Clear result presentation with visual hierarchy
- Recommendation messaging system
- Print-to-PDF functionality

---

## UI Components

- Step 1: Input form with labeled fields
- Step 2: Results display with charts/visualizations
- Risk level color-coded badge
- Recommendation box
- Reset button
- Print button
- Save results button (if logged in)

---

## Technical Stack

- React/TypeScript frontend
- Gail Model algorithm library
- Tailwind CSS for styling
- Print.js or similar for PDF generation

---

## Security Considerations

- No storage of personal medical data without user consent
- If storing results, encrypt sensitive data
- Privacy notice before any data collection

---

## API Endpoints

- `POST /calculator/risk` - Calculate risk score
- `POST /calculator/results` - Save user results (authenticated)
- `GET /calculator/results` - Retrieve saved results (authenticated)

---

## Database Requirements (Optional)

If storing results:

### Risk Calculator Results Table
- `result_id` (PK)
- `user_id` (FK, optional)
- `age`
- `age_at_first_period`
- `age_at_first_birth`
- `biopsies_count`
- `family_history` (boolean)
- `risk_score` (decimal)
- `risk_level` (enum)
- `created_at`

---

## Educational Content

Display information about:
- What the Gail Model measures
- Limitations of the calculator
- When to consult a doctor
- Link to relevant articles
- Disclaimer about medical advice
