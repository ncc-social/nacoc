// Copyright (c) 2025, NACOC and contributors
// For license information, please see license.txt

frappe.query_reports["VMA Applications"] = {
	"filters": [
    {
      "fieldname": "employee",
      "label": "Employee",
      "fieldtype": "Link",
      "options": "Employee"
    },
    {
      "fieldname": "submission_date",
      "label": "Submission Date Range",
      "fieldtype": "DateRange"
    },
    {
      "fieldname": "rw_expiry_date",
      "label": "Road Worthiness Expiry Date Range",
      "fieldtype": "DateRange"
    }
  ],
};
