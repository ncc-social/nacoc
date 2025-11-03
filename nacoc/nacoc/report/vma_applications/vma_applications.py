# Copyright (c) 2025, NACOC and contributors
# For license information, please see license.txt

# import frappe


import frappe
from frappe.utils import getdate, add_days, today

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

    data = frappe.db.sql(f"""
        SELECT
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
            creation
        FROM `tabVehicle Maintenance Allowance`
        {condition_str}
        ORDER BY creation DESC
    """, values, as_dict=True)

    # --- COLOR INDICATORS ---
    today_date = getdate(today())
    warning_threshold = add_days(today_date, 30)

    for d in data:
        expiry_dates = [
            d.get("road_worthiness_expiry_date"),
            d.get("vehicle_insurance_expiry_date"),
            d.get("drivers_licence_expiry_date")
        ]

        # Determine the nearest expiry among the three
        nearest_expiry = min(
            [getdate(e) for e in expiry_dates if e],
            default=None
        )

        if not nearest_expiry:
            d["status_color"] = "No Expiry"
        elif nearest_expiry < today_date:
            d["status_color"] = "Expired"
        elif nearest_expiry <= warning_threshold:
            d["status_color"] = "Expiring Soon"
        else:
            d["status_color"] = "Valid"

    return columns, data

