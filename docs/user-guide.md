# User Guide - AI Recruitment Screening Platform

## Overview

This platform helps recruiters efficiently screen candidates using AI-powered evaluation. It supports importing candidates from Umurava Platform or uploading resumes in CSV, Excel, or PDF format.

## Getting Started

### 1. Create an Account

#### For Companies (Recruiters)
1. Click "Get Started" on the homepage
2. Select "Company (Hiring)" as your role
3. Fill in your details:
   - Full Name
   - Email
   - Phone (optional)
   - Company Name
   - Your Position (e.g., "HR Manager")
   - Password (minimum 6 characters)
4. Click "Create Account"
5. You'll be automatically logged in

#### For Talent (Job Seekers)
1. Click "Get Started" on the homepage
2. Select "Talent (Job Seeker)" as your role
3. Fill in your details:
   - Full Name
   - Email
   - Phone (optional)
   - Password (minimum 6 characters)
4. Click "Create Account"
5. You'll be automatically logged in

### 2. Sign In

If you already have an account:
1. Click "Sign In" on the homepage
2. Enter your email and password
3. Click "Sign In"

### 3. Create a Job Posting (Companies Only)

1. Navigate to the Jobs page
2. Click "Create New Job" button
3. Fill in the job details:
   - Job Title (e.g., "Senior Software Engineer")
   - Description (detailed job requirements)
   - Required Skills (add multiple skills)
   - Experience Level (entry, mid, senior, lead)
   - Education Level (high school, bachelors, masters, phd)
4. Adjust evaluation weights (must sum to 100%):
   - Skills Weight: How important are technical skills?
   - Experience Weight: How important is work experience?
   - Education Weight: How important is formal education?
   - Relevance Weight: How important is overall fit?
5. Click "Create Job"

### 2. Add Applicants

You have two options for adding applicants:

#### Option A: Upload Files

1. Open the job details page
2. Click "Upload Applicants"
3. Drag and drop or click to select files:
   - CSV files with columns: name, email, skills, experience, education
   - Excel files (.xlsx) with same format
   - PDF resumes (one per file)
4. Wait for upload to complete

#### Option B: Import from Umurava

1. Open the job details page
2. Click "Import from Umurava"
3. Search for talent profiles
4. Select candidates using checkboxes
5. Click "Import Selected"

### 3. Start Screening

1. From the job details page, click "Start Screening"
2. Configure screening options (optional):
   - Top N: Number of candidates to shortlist (default: 20)
   - Minimum Score: Filter candidates below this score (default: 0)
   - Custom Weights: Override job weights if needed
3. Click "Start Screening"
4. Wait for AI evaluation to complete (progress shown in real-time)

### 4. Review Results

Once screening completes, you'll see:

#### Table View
- Ranked list of candidates
- Match scores and recommendations
- Sort by rank, score, or name
- Filter by minimum score or recommendation

#### Card View
- Detailed candidate cards
- Expandable AI reasoning panels
- Strengths, gaps, and risks for each candidate
- Score breakdown by category

#### Analytics View
- Score distribution histogram
- Summary statistics (average score, top candidates)
- Visual insights into candidate pool

### 5. Export Results

- Click "Export CSV" for spreadsheet format
- Click "Export PDF" for professional report with top 3 candidates

## Understanding AI Evaluation

### Match Score (0-100%)
Weighted combination of four factors:
- Skills Score: Technical skills match
- Experience Score: Work experience relevance
- Education Score: Educational background fit
- Relevance Score: Overall job fit

### Recommendations
- **Strong Yes**: Excellent match, highly recommended
- **Yes**: Good match, recommended for interview
- **Maybe**: Potential match, consider with reservations
- **No**: Not a good fit for this role

### AI Reasoning
For each candidate, the AI provides:
- **Strengths**: What makes them a good fit
- **Gaps**: Areas where they fall short
- **Risks**: Potential concerns or red flags
- **Reasoning**: Detailed explanation of the evaluation

## Best Practices

### Creating Jobs
- Be specific in job descriptions
- List all required skills explicitly
- Adjust weights based on role priorities
- Use consistent terminology

### Adding Applicants
- Ensure CSV/Excel files have proper headers
- Use consistent date formats
- Include complete contact information
- Verify email addresses are valid

### Screening
- Start with default weights, adjust if needed
- Review top 10-20 candidates thoroughly
- Read AI reasoning to understand evaluations
- Use filters to focus on strong candidates

## Troubleshooting

### Upload Fails
- Check file format (CSV, XLSX, or PDF only)
- Verify file size (max 10MB for CSV/Excel, 5MB for PDF)
- Ensure required fields are present (name, email)

### Screening Takes Too Long
- Large candidate pools (100+) may take 5-10 minutes
- Check progress indicator for status
- Refresh page if stuck

### Results Look Wrong
- Review job weights - they heavily influence scores
- Check if job description matches required skills
- Consider regenerating screening with adjusted weights

## Tips for Best Results

1. **Write Clear Job Descriptions**: The AI uses this to evaluate relevance
2. **List Specific Skills**: Generic skills lead to generic matches
3. **Adjust Weights Thoughtfully**: Different roles need different priorities
4. **Review Multiple Candidates**: Don't rely solely on top match
5. **Read AI Reasoning**: Understand why candidates were ranked

## Support

For technical issues or questions:
- Check the API documentation in `docs/api-documentation.md`
- Review deployment guide in `docs/deployment-guide.md`
- Contact your system administrator
