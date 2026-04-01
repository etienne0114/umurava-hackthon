# Testing Guide

## Overview

This guide covers testing strategies for the AI-Powered Recruitment Screening Platform.

## Manual Testing Workflow

### 1. Backend API Testing

#### Health Check
```bash
curl http://localhost:5000/api/health
```

Expected: `{"status":"ok","timestamp":"...","database":"connected"}`

#### Create Job
```bash
curl -X POST http://localhost:5000/api/jobs \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Senior Software Engineer",
    "description": "Looking for experienced developer",
    "requiredSkills": ["JavaScript", "React", "Node.js"],
    "experienceLevel": "senior",
    "educationLevel": "bachelors",
    "weights": {
      "skills": 0.4,
      "experience": 0.3,
      "education": 0.1,
      "relevance": 0.2
    }
  }'
```

#### Upload Applicants
```bash
curl -X POST http://localhost:5000/api/applicants/upload \
  -F "jobId=YOUR_JOB_ID" \
  -F "file=@docs/sample-applicants.csv"
```

#### Start Screening
```bash
curl -X POST http://localhost:5000/api/screening/start \
  -H "Content-Type: application/json" \
  -d '{
    "jobId": "YOUR_JOB_ID",
    "options": {
      "topN": 10,
      "minScore": 60
    }
  }'
```

### 2. Frontend Testing

#### Job Creation Flow
1. Navigate to http://localhost:3000
2. Click "Get Started" or "Jobs"
3. Click "Create New Job"
4. Fill in all fields
5. Adjust weight sliders (ensure they sum to 100%)
6. Submit form
7. Verify job appears in jobs list

#### Applicant Upload Flow
1. Open a job from the jobs list
2. Click "Upload Applicants"
3. Test CSV upload:
   - Use `docs/sample-applicants.csv`
   - Verify upload progress bar
   - Check success message
4. Test drag-and-drop functionality
5. Verify applicants appear in job details

#### Screening Flow
1. From job details page, click "Start Screening"
2. Configure options (optional)
3. Click "Start Screening"
4. Verify progress updates in real-time
5. Wait for completion
6. Navigate to screening results
7. Test all view modes (Table, Cards, Analytics)
8. Test export functions (CSV, PDF)

### 3. Error Handling Testing

#### Invalid File Upload
- Upload non-CSV/Excel/PDF file → Should show error
- Upload file > 10MB → Should show size error
- Upload CSV with missing columns → Should show validation error

#### Network Errors
- Stop backend server
- Try creating a job → Should show connection error
- Verify error boundary catches errors gracefully

#### Invalid Data
- Create job with weights not summing to 1.0 → Should show validation error
- Submit form with missing required fields → Should show field errors

## Automated Testing

### Backend Unit Tests (Future)
```bash
cd backend
npm test
```

Test coverage should include:
- Model validation
- Service methods
- Controller logic
- Utility functions (parsers, prompt builder)

### Frontend Unit Tests (Future)
```bash
cd frontend
npm test
```

Test coverage should include:
- Component rendering
- Redux slices and thunks
- Custom hooks
- Utility functions

### Integration Tests (Future)
```bash
npm run test:e2e
```

Test scenarios:
- Complete job creation to screening workflow
- File upload and parsing
- Gemini API integration
- Error recovery

## Performance Testing

### Load Testing
Use tools like Apache Bench or k6:

```bash
# Test job creation endpoint
ab -n 100 -c 10 -T 'application/json' \
  -p job-payload.json \
  http://localhost:5000/api/jobs
```

### Screening Performance
- Test with 10 applicants: Should complete in < 30 seconds
- Test with 50 applicants: Should complete in < 2 minutes
- Test with 100 applicants: Should complete in < 5 minutes

### Frontend Performance
- Lighthouse score should be > 90 for Performance
- First Contentful Paint < 1.5s
- Time to Interactive < 3s

## Security Testing

### Input Validation
- Test SQL injection attempts in text fields
- Test XSS attempts in job descriptions
- Test file upload with malicious files

### API Security
- Test rate limiting (should block after 100 requests/minute)
- Test CORS (should block requests from unauthorized origins)
- Test file size limits

## Accessibility Testing

### Keyboard Navigation
- Tab through all interactive elements
- Verify focus indicators are visible
- Test form submission with keyboard only

### Screen Reader Testing
- Test with NVDA (Windows) or VoiceOver (Mac)
- Verify all images have alt text
- Verify form labels are properly associated

### Color Contrast
- Use browser DevTools to check contrast ratios
- Verify all text meets WCAG AA standards (4.5:1 for normal text)

## Browser Compatibility

Test on:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Mobile Testing

Test on:
- iOS Safari
- Android Chrome
- Various screen sizes (320px to 1920px)

## Regression Testing Checklist

Before each release:
- [ ] All API endpoints return expected responses
- [ ] File uploads work for all formats
- [ ] Screening completes successfully
- [ ] Results display correctly
- [ ] Export functions work
- [ ] No console errors in browser
- [ ] No TypeScript compilation errors
- [ ] All links and navigation work
- [ ] Forms validate correctly
- [ ] Error messages are user-friendly

## Known Issues

Document any known issues here:
- None currently

## Test Data

Sample files available in `docs/`:
- `sample-applicants.csv` - CSV format with 5 sample applicants

## Monitoring in Production

### Key Metrics to Track
- API response times
- Screening completion rate
- Error rates by endpoint
- Gemini API usage and costs
- Database query performance

### Logging
- Backend logs: `backend/logs/combined.log`
- Error logs: `backend/logs/error.log`
- Frontend errors: Browser console + Vercel logs
