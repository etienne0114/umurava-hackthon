import { ScreeningResult, Job } from '@/types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const exportToCSV = (results: ScreeningResult[], jobTitle: string) => {
  const headers = ['Rank', 'Name', 'Email', 'Match Score', 'Recommendation', 'Strengths', 'Gaps'];

  const rows = results.map((result) => {
    const applicant = (result as any).applicantId;
    return [
      result.rank,
      applicant?.profile?.name || 'N/A',
      applicant?.profile?.email || 'N/A',
      `${result.matchScore.toFixed(1)}%`,
      result.evaluation.recommendation,
      result.evaluation.strengths.join('; '),
      result.evaluation.gaps.join('; '),
    ];
  });

  const csvContent = [
    headers.join(','),
    ...rows.map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `${jobTitle.replace(/\s+/g, '_')}_screening_results.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToPDF = (results: ScreeningResult[], job: Job) => {
  const doc = new jsPDF();

  doc.setFontSize(20);
  doc.text('Screening Report', 14, 20);

  doc.setFontSize(12);
  doc.text(`Job: ${job.title}`, 14, 30);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 37);
  doc.text(`Total Candidates: ${results.length}`, 14, 44);

  const tableData = results.map((result) => {
    const applicant = (result as any).applicantId;
    return [
      result.rank,
      applicant?.profile?.name || 'N/A',
      `${result.matchScore.toFixed(1)}%`,
      result.evaluation.recommendation,
    ];
  });

  autoTable(doc, {
    startY: 55,
    head: [['Rank', 'Name', 'Match Score', 'Recommendation']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246] },
  });

  let yPosition = (doc as any).lastAutoTable.finalY + 15;

  doc.setFontSize(14);
  doc.text('Top 3 Candidates Details', 14, yPosition);
  yPosition += 10;

  results.slice(0, 3).forEach((result, index) => {
    const applicant = (result as any).applicantId;

    if (yPosition > 270) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`${index + 1}. ${applicant?.profile?.name || 'N/A'}`, 14, yPosition);
    yPosition += 7;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Match Score: ${result.matchScore.toFixed(1)}%`, 20, yPosition);
    yPosition += 6;

    doc.text('Strengths:', 20, yPosition);
    yPosition += 5;
    result.evaluation.strengths.forEach((strength) => {
      if (yPosition > 280) {
        doc.addPage();
        yPosition = 20;
      }
      const lines = doc.splitTextToSize(`• ${strength}`, 170);
      doc.text(lines, 25, yPosition);
      yPosition += lines.length * 5;
    });

    yPosition += 3;
    doc.text('Gaps:', 20, yPosition);
    yPosition += 5;
    result.evaluation.gaps.forEach((gap) => {
      if (yPosition > 280) {
        doc.addPage();
        yPosition = 20;
      }
      const lines = doc.splitTextToSize(`• ${gap}`, 170);
      doc.text(lines, 25, yPosition);
      yPosition += lines.length * 5;
    });

    yPosition += 10;
  });

  doc.save(`${job.title.replace(/\s+/g, '_')}_screening_report.pdf`);
};
