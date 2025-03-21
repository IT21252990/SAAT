class ReportSubmission:
    def __init__(self, module_code, submission_date, status, student_id, submission_report_url, analysis_report, aiContent, plagiarism, mark, marking_reference, summary):
        self.module_code = module_code
        self.submission_date = submission_date  # Default to current date if not provided
        self.status = status
        self.submission_report_url = submission_report_url  # URL of the uploaded PDF file
        self.analysis_report = analysis_report
        self.aiContent = aiContent
        self.plagiarism = plagiarism
        self.student_id = student_id
        self.mark = mark  # Marking score (0 to 100)
        self.marking_reference = marking_reference  # Reference to the Marking schema
        self.summary = summary  

    def to_dict(self):
        return {
            "module_code": self.module_code,
            "submission_date": self.submission_date,
            "status": self.status,
            "submission_report": self.submission_report_url,  # Store URL or path
            "analysis_report": self.analysis_report,
            "aiContent": self.aiContent,
            "plagiarism": self.plagiarism,
            "student_id": self.student_id,
            "mark": self.mark,
            "marking_reference": self.marking_reference,  # Reference to Marking schema
            "summary": self.summary
        }

    def save(self, db):
        db.collection("report_submissions").document(self.student_id).set(self.to_dict())
