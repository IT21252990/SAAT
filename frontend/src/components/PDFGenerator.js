// src/components/PDFGenerator.js

import { jsPDF } from "jspdf";

const generatePDF = (assignment, moduleName) => {
  const doc = new jsPDF();

  // Add border around the page content
  doc.rect(10, 10, 190, 277); // (x, y, width, height)

  // Set font for module name and assignment name 
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  const moduleAndAssignmentText = `${moduleName || "Unknown Module"} - ${assignment.name}`;
  const textWidth = doc.getStringUnitWidth(moduleAndAssignmentText) * doc.internal.getFontSize() / doc.internal.scaleFactor;
  const x = (doc.internal.pageSize.width - textWidth) / 2; // Center the text
  doc.text(moduleAndAssignmentText, x, 30); // Module Name and Assignment Name

  // Set font for description and deadline 
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");

  const descriptionText = `Description: ${assignment.description}`;
  const deadlineText = `Deadline: ${assignment.deadline}`;

  doc.text(descriptionText, 20, 50);
  doc.text(deadlineText, 20, 60);


  let yPosition = 70; 

  // Assignment Details Section 
  doc.setFont("helvetica", "bold");
  doc.text("Details:", 20, yPosition); 
  yPosition += 10; 

  doc.setFont("helvetica", "normal");
  assignment.details.forEach((detail) => {
    doc.setFont("helvetica", "bold");
    doc.text(detail.topic, 20, yPosition); // Detail Topic
    yPosition += 10;
    doc.setFont("helvetica", "normal");
    doc.text(detail.description, 20, yPosition); // Detail Description
    yPosition += 10;

    if (detail.subtopics) {
      detail.subtopics.forEach((subtopic) => {
        doc.setFont("helvetica", "bold");
        doc.text(`  Subtopic: ${subtopic.topic}`, 30, yPosition); // Subtopic Topic
        yPosition += 10;
        doc.setFont("helvetica", "normal");
        doc.text(`    ${subtopic.description}`, 40, yPosition); // Subtopic Description
        yPosition += 10;
      });
    }
  });

  yPosition += 10;

  // Marking Criteria Section 
  doc.setFont("helvetica", "bold");
  doc.text("Marking Criteria:", 20, yPosition); 
  yPosition += 10; 

  doc.setFont("helvetica", "normal");
  Object.entries(assignment.marking_criteria).forEach(([type, criteria]) => {
    doc.setFont("helvetica", "bold");
    doc.text(`${type.charAt(0).toUpperCase() + type.slice(1)} Marking Criteria:`, 20, yPosition);
    yPosition += 10;

    criteria.forEach((item) => {
      doc.setFont("helvetica", "normal");
      doc.text(`    ${item.criteria}: ${item.allocated_mark} marks`, 30, yPosition); 
      yPosition += 10;
    });
  });

  // Add page number at the bottom of the page
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setFontSize(10);
    doc.text(`Page ${i} of ${pageCount}`, 180, 285); // Footer: Page number
  }

  // Save PDF
  doc.save(`${assignment.name}_Details.pdf`);
};

export default generatePDF;
