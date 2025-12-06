# Copyright (c) 2025, NACOC and contributors
# For license information, please see license.txt

# import frappe


import frappe
from frappe.utils import getdate, add_days, today
from datetime import datetime

def execute(filters=None):
    filters = filters or {}

    columns = [
        {"label": "Employee", "fieldname": "employee_name", "fieldtype": "Data", "width": 150},
        {"label": "Phone No", "fieldname": "phone_number", "fieldtype": "Data", "width": 120},
        {"label": "Vehicle No", "fieldname": "vehicle_number", "fieldtype": "Data", "width": 120},
        {"label": "Vehicle Type", "fieldname": "vehicle_type", "fieldtype": "Data", "width": 120},
        {"label": "Vehicle Registration Date", "fieldname": "vehicle_registration_date", "fieldtype": "Date", "width": 120},
        {"label": "Road Worthiness Expiry Date", "fieldname": "road_worthiness_expiry_date", "fieldtype": "Date", "width": 150},
        {"label": "Insurance Expiry Date", "fieldname": "vehicle_insurance_expiry_date", "fieldtype": "Date", "width": 150},
        {"label": "Driver's Licence Expiry Date", "fieldname": "drivers_licence_expiry_date", "fieldtype": "Date", "width": 160},
        {"label": "Bank", "fieldname": "bank_name", "fieldtype": "Data", "width": 150},
        {"label": "Branch", "fieldname": "branch_name", "fieldtype": "Data", "width": 150},
        {"label": "A/C Type", "fieldname": "bank_account_type", "fieldtype": "Data", "width": 80},
        {"label": "A/C No", "fieldname": "account_number", "fieldtype": "Data", "width": 100},
        {"label": "Submission Date", "fieldname": "creation", "fieldtype": "Datetime", "width": 180},
        {"label": "Status", "fieldname": "status_color", "fieldtype": "Data", "width": 100}
    ]

    conditions = []
    values = {}

    # --- FILTERS ---
    if filters.get("employee"):
        conditions.append("(employee_name = %(employee)s)")
        values["employee"] = filters.get("employee")

    # Date Range for submission
    if filters.get("submission_date"):
        start_date, end_date = filters["submission_date"]
        conditions.append("DATE(creation) BETWEEN %(start)s AND %(end)s")
        values["start"] = start_date
        values["end"] = end_date

    # Road Worthiness Expiry date range
    if filters.get("rw_expiry_date"):
        rw_start, rw_end = filters["rw_expiry_date"]
        conditions.append("DATE(road_worthiness_expiry_date) BETWEEN %(rw_start)s AND %(rw_end)s")
        values["rw_start"] = rw_start
        values["rw_end"] = rw_end

    condition_str = " AND ".join(conditions)
    if condition_str:
        condition_str = "WHERE " + condition_str

    # Select name and keep original creation as submission_creation.
    data = frappe.db.sql(
        f"""
        SELECT
            name AS docname,
            employee_name,
            phone_number,
            vehicle_type,
            vehicle_number,
            vehicle_registration_date,
            road_worthiness_expiry_date,
            vehicle_insurance_expiry_date,
            drivers_licence_expiry_date,
            bank_name,
            branch_name,
            bank_account_type,
            account_number,
            creation AS submission_creation
        FROM `tabVehicle Maintenance Allowance`
        {condition_str}
    """,
        values,
        as_dict=True,
    )

    # For each row, try to get the latest workflow comment creation for the "Sent to INTERNAL AUDIT for Review" entry.
    for d in data:
        row = frappe.db.sql(
            """
            SELECT creation
            FROM `tabComment`
            WHERE reference_doctype = %s
              AND reference_name = %s
              AND comment_type = 'Workflow'
              AND content = %s
            ORDER BY creation DESC
            LIMIT 1
            """,
            (
                "Vehicle Maintenance Allowance",
                d.get("docname"),
                "Sent to INTERNAL AUDIT for Review",
            ),
            as_dict=True,
        )
        if row:
            d["creation"] = row[0]["creation"]
        else:
            d["creation"] = d.get("submission_creation")

    # --- COLOR INDICATORS ---
    today_date = getdate(today())
    warning_threshold = add_days(today_date, 30)

    for d in data:
        # Map friendly names to the expiry date fields
        expiry_map = {
            "Road Worthiness": d.get("road_worthiness_expiry_date"),
            "Insurance": d.get("vehicle_insurance_expiry_date"),
            "Driver's Licence": d.get("drivers_licence_expiry_date"),
        }

        expired = []
        expiring_soon = []

        for name, date_val in expiry_map.items():
            if not date_val:
                continue
            date_obj = getdate(date_val)
            if date_obj < today_date:
                expired.append(name)
            elif date_obj <= warning_threshold:
                expiring_soon.append(name)

        # Build a clear status message listing which documents are affected
        if expired and expiring_soon:
            d["status_color"] = (
                "Expired: "
                + ", ".join(expired)
                + "; Expiring Soon: "
                + ", ".join(expiring_soon)
            )
        elif expired:
            d["status_color"] = "Expired: " + ", ".join(expired)
        elif expiring_soon:
            d["status_color"] = "Expiring Soon: " + ", ".join(expiring_soon)
        else:
            # If all expiry fields are empty, indicate no expiry recorded
            if not any(expiry_map.values()):
                d["status_color"] = "No Expiry"
            else:
                d["status_color"] = "Valid"

    # Sort by the chosen creation datetime (fallback to submission_creation or epoch)
    def _sort_key(x):
        val = x.get("creation") or x.get("submission_creation")
        if isinstance(val, str):
            try:
                return datetime.fromisoformat(val)
            except Exception:
                return datetime.min
        return val or datetime.min

    data.sort(key=_sort_key, reverse=True)

    return columns, data
