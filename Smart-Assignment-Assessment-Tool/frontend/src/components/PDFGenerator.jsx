import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";

const generatePDF = (assignment, moduleName, marking) => {
  const doc = new jsPDF();

  // Enhanced color scheme
  const colors = {
    primary: [41, 128, 185],      // Professional blue
    secondary: [52, 73, 94],      // Dark gray
    accent: [231, 76, 60],        // Red accent
    success: [39, 174, 96],       // Green
    light: [236, 240, 241],       // Light gray
    white: [255, 255, 255],
    text: [44, 62, 80],           // Dark text
    lightText: [127, 140, 141]    // Light text
  };

  // Set margins and initial position
  const margin = 20;
  let yPosition = margin;
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const contentWidth = pageWidth - margin * 2;

  // Helper function to add decorative elements
  const addDecoративeLine = (y, color = colors.primary) => {
    doc.setDrawColor(...color);
    doc.setLineWidth(0.8);
    doc.line(margin, y, pageWidth - margin, y);
    doc.setDrawColor(0, 0, 0); // Reset to black
    doc.setLineWidth(0.1);
  };

  // Helper function to add section background
  const addSectionBackground = (y, height, color = colors.light) => {
    doc.setFillColor(...color);
    doc.rect(margin + 5, y - 5, contentWidth - 10, height, 'F');
  };

  // Enhanced page break function
  const checkPageBreak = (requiredSpace = 20) => {
    if (yPosition + requiredSpace > pageHeight - margin - 25) {
      doc.addPage();
      yPosition = margin + 15;
      return true;
    }
    return false;
  };

  // Add watermark/background pattern
  const addWatermark = () => {
    doc.setGState(new doc.GState({opacity: 0.05}));
    doc.setFontSize(80);
    doc.setTextColor(...colors.primary);
    doc.text('ASSIGNMENT', pageWidth/2, pageHeight/2, {
      align: 'center',
      angle: 45
    });
    doc.setGState(new doc.GState({opacity: 1}));
  };

  // Add header with modern design
  const addHeader = () => {
    // Header background
    doc.setFillColor(...colors.primary);
    doc.rect(0, 0, pageWidth, 35, 'F');
    
    // Header gradient effect (simulated with overlapping rectangles)
    doc.setFillColor(41, 128, 185, 0.8);
    doc.rect(0, 25, pageWidth, 10, 'F');
    
    // Assignment title
    doc.setTextColor(...colors.white);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    const headerText = assignment.name || "Assignment Details";
    const headerLines = doc.splitTextToSize(headerText, contentWidth - 40);
    doc.text(headerLines, margin + 20, 22);
    
    // Module badge
    if (moduleName) {
      const moduleText = `Module: ${moduleName}`;
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text(moduleText, pageWidth - margin - 20, 22, { align: 'right' });
    }
    
    yPosition = 50;
  };

  // Add status badge
  const addStatusBadge = (text, x, y, color = colors.success) => {
    const textWidth = doc.getTextWidth(text) + 8;
    doc.setFillColor(...color);
    doc.roundedRect(x, y - 5, textWidth, 12, 2, 2, 'F');
    doc.setTextColor(...colors.white);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(text, x + 4, y + 2);
    doc.setTextColor(...colors.text);
  };

  // Enhanced info box
  const addInfoBox = (title, content) => {
    checkPageBreak(35);
    
    // Box background
    addSectionBackground(yPosition, 25, colors.light);
    
    // Icon and title
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...colors.primary);
    doc.text(title, margin + 15, yPosition + 8);
    
    // Content
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...colors.text);
    const contentLines = doc.splitTextToSize(content, contentWidth - 40);
    doc.text(contentLines, margin + 15, yPosition + 18);
    
    yPosition += Math.max(25, contentLines.length * 5 + 15);
    return yPosition;
  };

  // Start document creation
  addWatermark();
  addHeader();

  // Assignment description with enhanced styling
  if (assignment.description) {
    addInfoBox("Description", assignment.description);
  }

  // Deadline with visual emphasis
  if (assignment.deadline) {
    checkPageBreak(25);
    
    const deadlineDate = new Date(assignment.deadline);
    const isUrgent = deadlineDate - new Date() < 7 * 24 * 60 * 60 * 1000; // 7 days
    const badgeColor = isUrgent ? colors.accent : colors.success;
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...colors.text);
    doc.text("Deadline:", margin + 15, yPosition);
    
    addStatusBadge(assignment.deadline, margin + 70, yPosition - 3, badgeColor);
    yPosition += 20;
  }

  // Assignment Details Section with modern card design
  checkPageBreak(30);
  
  // Section header
  addDecoративeLine(yPosition - 5);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...colors.secondary);
  doc.text("Assignment Details", margin + 15, yPosition + 8);
  yPosition += 20;

  if (assignment.details && assignment.details.length > 0) {
    assignment.details.forEach((detail, index) => {
      checkPageBreak(30);
      
      // Detail card background
      addSectionBackground(yPosition, 20, [248, 249, 250]);
      
      // Main topic with numbering
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...colors.primary);
      const topicLines = doc.splitTextToSize(`${index + 1}. ${detail.topic}`, contentWidth - 40);
      doc.text(topicLines, margin + 20, yPosition + 8);
      yPosition += topicLines.length * 6 + 8;

      // Description
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...colors.text);
      const detailLines = doc.splitTextToSize(detail.description, contentWidth - 50);
      doc.text(detailLines, margin + 25, yPosition);
      yPosition += detailLines.length * 5 + 5;

      // Subtopics with enhanced styling
      if (detail.subtopics && detail.subtopics.length > 0) {
        detail.subtopics.forEach((subtopic, subIndex) => {
          checkPageBreak(20);
          
          // Subtopic bullet
          doc.setFillColor(...colors.primary);
          doc.circle(margin + 30, yPosition - 2, 1.5, 'F');
          
          doc.setFontSize(12);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(...colors.secondary);
          const subtopicTitleLines = doc.splitTextToSize(`${String.fromCharCode(97 + subIndex)}. ${subtopic.topic}`, contentWidth - 60);
          doc.text(subtopicTitleLines, margin + 35, yPosition);
          yPosition += subtopicTitleLines.length * 5 + 3;

          doc.setFontSize(10);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(...colors.text);
          const subtopicLines = doc.splitTextToSize(subtopic.description, contentWidth - 70);
          doc.text(subtopicLines, margin + 40, yPosition);
          yPosition += subtopicLines.length * 5 + 5;
        });
      }

      yPosition += 10;
    });
  } else {
    addInfoBox("Notice", "No assignment details available.");
  }

  // Deliverables Section with modern design
  checkPageBreak(30);
  addDecoративeLine(yPosition - 5);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...colors.secondary);
  doc.text("Deliverables", margin + 15, yPosition + 8);
  yPosition += 20;
  
  const submissionTypes = marking?.submission_types || assignment.submission_types || {};
  const submissionWeights = marking?.submission_type_weights || assignment.submission_type_weights || {};

  if (Object.keys(submissionTypes).length > 0) {
    const enabledTypes = Object.entries(submissionTypes)
      .filter(([_, isAccepted]) => isAccepted);
    
    if (enabledTypes.length > 0) {
      enabledTypes.forEach(([type], index) => {
        checkPageBreak(15);
        
        const weight = submissionWeights[type] || 0;
        
        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...colors.text);
        doc.text(`${type.charAt(0).toUpperCase() + type.slice(1)}`, margin + 20, yPosition);
        
        if (weight > 0) {
          addStatusBadge(`${weight}%`, margin + 120, yPosition - 3, colors.primary);
        }
        
        yPosition += 12;
      });

      // Total weight summary
      const totalWeight = Object.keys(submissionTypes).reduce((total, type) => {
        return submissionTypes[type] ? total + (submissionWeights[type] || 0) : total;
      }, 0);
      
      if (totalWeight > 0) {
        checkPageBreak(15);
        addDecoративeLine(yPosition);
        yPosition += 8;
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...colors.primary);
        doc.text(`Total Weight: ${totalWeight}%`, margin + 20, yPosition);
        yPosition += 15;
      }
    }
  } else {
    addInfoBox("Notice", "No submission types specified.");
  }

  // Enhanced Marking Criteria Section
  checkPageBreak(30);
  addDecoративeLine(yPosition - 5);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...colors.secondary);
  doc.text("Marking Criteria", margin + 15, yPosition + 8);
  yPosition += 20;

  // Enhanced criteria table function
  const addCriteriaTable = (criteria, type) => {
    if (!criteria || criteria.length === 0) return yPosition;

    const typeWeight = submissionWeights[type] || 0;
    
    checkPageBreak(50);
    
    // Subsection header with background
    addSectionBackground(yPosition, 15, colors.primary);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...colors.white);
    const criteriaTitle = `${type.charAt(0).toUpperCase() + type.slice(1)} Criteria${typeWeight > 0 ? ` (${typeWeight}%)` : ''}`;
    doc.text(criteriaTitle, margin + 15, yPosition + 8);
    yPosition += 20;

    // Prepare table data with better formatting
    const tableData = criteria.map(criterion => [
      criterion.criterion || criterion.name || 'N/A',
      criterion.low_description || criterion.lowDescription || 'N/A',
      criterion.medium_description || criterion.mediumDescription || 'N/A', 
      criterion.high_description || criterion.highDescription || 'N/A',
      `${criterion.weightage || criterion.weight || 0}%`
    ]);

    // Enhanced table with better responsive design
    autoTable(doc, {
      startY: yPosition,
      head: [['Criteria', 'Needs Improvement', 'Satisfactory', 'Excellent', 'Weight']],
      body: tableData,
      margin: { left: margin + 5, right: margin + 5 },
      styles: {
        fontSize: 9,
        cellPadding: 4,
        overflow: 'linebreak',
        valign: 'top',
        halign: 'left',
        textColor: colors.text,
        lineColor: [200, 200, 200],
        lineWidth: 0.1
      },
      headStyles: {
        fillColor: colors.primary,
        textColor: colors.white,
        fontStyle: 'bold',
        fontSize: 10,
        halign: 'center'
      },
      alternateRowStyles: {
        fillColor: [248, 249, 250]
      },
      columnStyles: {
        0: { 
          cellWidth: 'auto',
          fontStyle: 'bold',
          fillColor: [241, 245, 249],
          minCellWidth: 25
        },
        1: { cellWidth: 'auto', minCellWidth: 30 },
        2: { cellWidth: 'auto', minCellWidth: 30 },
        3: { cellWidth: 'auto', minCellWidth: 30 },
        4: { 
          cellWidth: 20, 
          halign: 'center', 
          fontStyle: 'bold',
          fillColor: [241, 245, 249]
        }
      },
      tableWidth: 'auto',
      tableLineColor: [200, 200, 200],
      tableLineWidth: 0.1,
      didDrawPage: (data) => {
        // Add page border if table spans multiple pages
        if (data.pageNumber > 1) {
          addDecoративeLine(margin + 10);
        }
      }
    });

    yPosition = doc.lastAutoTable.finalY + 15;
    return yPosition;
  };

  // Enhanced simple criteria list
  const addSimpleCriteriaList = (criteria, type) => {
    if (!criteria || criteria.length === 0) return yPosition;

    const typeWeight = submissionWeights[type] || 0;
    
    checkPageBreak(25);
    
    // Subsection header
    addSectionBackground(yPosition, 15, colors.primary);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...colors.white);
    const criteriaTitle = `${type.charAt(0).toUpperCase() + type.slice(1)} Criteria${typeWeight > 0 ? ` (${typeWeight}%)` : ''}`;
    doc.text(criteriaTitle, margin + 15, yPosition + 8);
    yPosition += 25;

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...colors.text);
    
    criteria.forEach((item, index) => {
      checkPageBreak(12);
      
      // Bullet point with color
      doc.setFillColor(...colors.primary);
      doc.circle(margin + 20, yPosition - 2, 1.5, 'F');
      
      const criteriaText = `${item.criteria || item.criterion || 'Criterion'}: ${item.allocated_mark || item.marks || 'N/A'} marks`;
      const criteriaLines = doc.splitTextToSize(criteriaText, contentWidth - 50);
      doc.text(criteriaLines, margin + 25, yPosition);
      yPosition += criteriaLines.length * 5 + 3;
    });

    yPosition += 10;
    return yPosition;
  };

  // Process marking criteria
  let hasCriteria = false;

  if (marking && marking.criteria) {
    Object.keys(submissionTypes).forEach(type => {
      if (submissionTypes[type] && marking.criteria[type] && marking.criteria[type].length > 0) {
        yPosition = addCriteriaTable(marking.criteria[type], type);
        hasCriteria = true;
      }
    });
  } else if (assignment.marking_criteria) {
    Object.keys(submissionTypes).forEach(type => {
      if (submissionTypes[type] && assignment.marking_criteria[type] && assignment.marking_criteria[type].length > 0) {
        yPosition = addSimpleCriteriaList(assignment.marking_criteria[type], type);
        hasCriteria = true;
      }
    });
  }

  if (!hasCriteria) {
    addInfoBox("Notice", "No marking criteria available for this assignment.");
  }

  // Enhanced Summary Section
  if (marking && marking.criteria) {
    checkPageBreak(40);
    addDecoративeLine(yPosition - 5);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...colors.secondary);
    doc.text("Summary", margin + 15, yPosition + 8);
    yPosition += 25;

    // Summary cards
    let totalCriteria = 0;
    Object.keys(marking.criteria).forEach(type => {
      if (marking.criteria[type]) {
        totalCriteria += marking.criteria[type].length;
      }
    });

    // Stats boxes
    const stats = [
      { label: "Total Criteria", value: totalCriteria },
      { label: "Scheme", value: marking.title || "Default" },
      { label: "Status", value: marking.status || "Active" }
    ];

    stats.forEach((stat, index) => {
      const xPos = margin + 15 + (index * 55);
      
      // Stat box background
      doc.setFillColor(...colors.light);
      doc.roundedRect(xPos, yPosition, 50, 25, 3, 3, 'F');
      
      // Value
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...colors.primary);
      doc.text(String(stat.value), xPos + 5, yPosition + 12);
      
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...colors.lightText);
      doc.text(stat.label, xPos + 5, yPosition + 22);
    });
  }

  // Enhanced footer for all pages
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    
    // Footer background
    doc.setFillColor(...colors.light);
    doc.rect(0, pageHeight - 20, pageWidth, 20, 'F');
    
    // Page numbers with style
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...colors.lightText);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth/2, pageHeight - 8, { align: 'center' });
    
    // Generation timestamp
    const timestamp = new Date().toLocaleDateString();
    doc.text(`Generated: ${timestamp}`, margin, pageHeight - 8);
    
    // Assignment name in footer
    doc.text(assignment.name || 'Assignment', pageWidth - margin, pageHeight - 8, { align: 'right' });
  }

  // Save with enhanced filename
  const cleanFilename = (assignment.name || 'Assignment')
    .replace(/[^a-z0-9\s]/gi, '')
    .replace(/\s+/g, '_')
    .substring(0, 50); // Limit length
  
  doc.save(`${cleanFilename}_Details.pdf`);
};

export default generatePDF;