# import frappe
# from frappe.utils import getdate
# from calendar import month_name

# @frappe.whitelist()
# def get_leave_report():
#     employees = frappe.get_all("Employee", fields=["name", "employee_number", "employee_name as full_name"])

#     results = []

#     for emp in employees:
#         emp_data = {
#             "employee_number": emp.employee_number,
#             "full_name": emp.full_name
#         }

#         # Fetch all relevant leave allocations for the employee
#         allocations = frappe.get_all("Leave Allocation", 
#             filters={"employee": emp.name, "docstatus": 1},
#             fields=["leave_type", "total_leaves_allocated"]
#         )

#         total_allocated = 0
#         leave_arrears = 0

#         for alloc in allocations:
#             if alloc.leave_type in ["Annual Leave - JD", "Annual Leave - SD"]:
#                 total_allocated += alloc.total_leaves_allocated
#                 if alloc.leave_type == "Annual Leave - JD" and alloc.total_leaves_allocated > 28:
#                     leave_arrears += alloc.total_leaves_allocated - 28
#                 elif alloc.leave_type == "Annual Leave - SD" and alloc.total_leaves_allocated > 36:
#                     leave_arrears += alloc.total_leaves_allocated - 36

#         leave_due = total_allocated - leave_arrears
#         emp_data["total_leaves_allocated"] = total_allocated
#         emp_data["leave_arrears"] = leave_arrears
#         emp_data["leave_due"] = leave_due

#         # Initialize months
#         monthly_leaves = {month_name[m][:3]: 0 for m in range(1, 13)}  # Jan, Feb, ..., Dec

#         leave_apps = frappe.get_all("Leave Application",
#             filters={
#                 "employee": emp.name,
#                 "docstatus": 1,
#                 "workflow_state": "Leave Approved"
#             },
#             fields=["from_date", "total_leave_days"]
#         )

#         for app in leave_apps:
#             month = getdate(app.from_date).strftime("%b")  # e.g., Jan
#             if month in monthly_leaves:
#                 monthly_leaves[month] += app.total_leave_days

#         emp_data.update(monthly_leaves)

#         total_taken = sum(monthly_leaves.values())
#         emp_data["outstanding_leave"] = total_allocated - total_taken

#         results.append(emp_data)

#     return results

import frappe
from frappe.utils import getdate
from calendar import month_name
from datetime import datetime

@frappe.whitelist()
def get_leave_report(year=None, department=None):
    # Ensure year is valid and not in the future
    current_year = datetime.now().year
    try:
        year = int(year or current_year)
    except ValueError:
        year = current_year

    if year > current_year:
        frappe.throw("You cannot generate a report for a future year.")

    # Fetch employees (with optional department filter)
    emp_filters = {}
    if department:
        emp_filters["department"] = department

    employees = frappe.get_all("Employee", filters=emp_filters,
        fields=["name", "employee_number", "employee_name as full_name"])

    results = []

    for emp in employees:
        emp_data = {
            "employee_number": emp.employee_number,
            "full_name": emp.full_name
        }

        # Get allocations filtered by year and employee
        allocations = frappe.get_all("Leave Allocation",
            filters={
                "employee": emp.name,
                "docstatus": 1
            },
            fields=["leave_type", "total_leaves_allocated", "from_date"]
        )

        total_allocated = 0
        leave_arrears = 0

        for alloc in allocations:
            from_date = getdate(alloc.from_date)
            if from_date.year != year:
                continue
            if alloc.leave_type in ["Annual Leave - JD", "Annual Leave - SD"]:
                total_allocated += alloc.total_leaves_allocated
                if alloc.leave_type == "Annual Leave - JD" and alloc.total_leaves_allocated > 28:
                    leave_arrears += alloc.total_leaves_allocated - 28
                elif alloc.leave_type == "Annual Leave - SD" and alloc.total_leaves_allocated > 36:
                    leave_arrears += alloc.total_leaves_allocated - 36

        leave_due = total_allocated - leave_arrears
        emp_data["total_leaves_allocated"] = total_allocated
        emp_data["leave_arrears"] = leave_arrears
        emp_data["leave_due"] = leave_due

        # Initialize monthly leave buckets
        monthly_leaves = {month_name[m][:3]: 0 for m in range(1, 13)}

        leave_apps = frappe.get_all("Leave Application",
            filters={
                "employee": emp.name,
                "docstatus": 1,
                "workflow_state": "Leave Approved"
            },
            fields=["from_date", "total_leave_days"]
        )

        for app in leave_apps:
            from_date = getdate(app.from_date)
            if from_date.year != year:
                continue
            month = from_date.strftime("%b")
            if month in monthly_leaves:
                monthly_leaves[month] += app.total_leave_days

        emp_data.update(monthly_leaves)

        total_taken = sum(monthly_leaves.values())
        emp_data["outstanding_leave"] = total_allocated - total_taken

        results.append(emp_data)

    return results
