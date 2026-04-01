# Umurava AI Hackathon | Recruitment Screening Platform - Frontend

The modern, responsive, and intuitive recruiter dashboard designed for efficient talent shortlisting. This Next.js application provides a premium user experience with real-time AI-powered candidate insights and a mobile-first design strategy.

---

## 🎨 UI/UX Excellence

### Recruiter Experience
- **Interactive Dashboards**: Real-time visualization of job statistics and candidate engagement.
- **AI-Powered Insights**: Ranked shortlists with clear, explainable AI reasoning displays.
- **Multi-Source Ingestion**: Seamless interfaces for file uploads (PDF/CSV/XLSX) and Umurava platform imports.

### Responsive Design
Built using **Tailwind CSS**, the interface ensures a premium experience across all devices, from desktop monitors to mobile phones, with a breakpoints-optimized layout.

---

## 🏗️ Technical Architecture

### Tech Stack
- **Framework**: Next.js 14+ (App Router)
- **State Management**: Redux Toolkit (Slices for Auth, Jobs, Candidates)
- **Styling**: Tailwind CSS + Headless UI
- **Language**: TypeScript
- **Notifications**: React Hot Toast
- **Icons**: Lucide React

### State Architecture
The frontend employs a robust global state management system using **Redux Toolkit**:
- **Auth Slice**: Manages secure recruiter/talent sessions and profile persistence.
- **Jobs Slice**: Orchestrates job creation and management workflows.
- **Candidates Slice**: Handles local state for candidate lists and screening results.

---

## 🛠️ Setup & Environment Configuration

### Prerequisites
- Node.js 18.x+
- npm or yarn

### Environment Variables
Create a `.env.local` file in the `frontend/` root:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Installation & Execution
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test
```

---

## 📖 Mandatory Documentation

Detailed guides for our frontend strategies are available in the internal documentation:
- **[Architecture & Design](./docs/architecture.md)**
- **[User Workflow Guide](./docs/user-guide.md)**
- **[Testing & QA Procedures](./docs/testing-guide.md)**
- **[AI Decision Flow](./docs/ai-decision-flow.md)**

---

## 🚀 Key Modules

1. **Job Management**: Create and configure job evaluation criteria.
2. **Applicant Hub**: Centralized space for candidate ingestion and status tracking.
3. **Screening Lab**: Visualize AI scores, breakdowns, and rationale in an interactive board.
4. **Talent Profile**: Self-service profile management for candidates, including resume parsing.

---

## 📝 License
Built for the Umurava AI Hackathon. Distributed under the MIT License.
