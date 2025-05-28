import frappe
from frappe.utils import now_datetime
import os

def send_leave_month_notifications():
    today = now_datetime()
    current_month = today.strftime('%B')

    leave_records = frappe.get_all(
        "Leave Months",
        filters={"leave_year": today.year},
        fields=[
            "name", "employee_name", "employee_email", "department_name",
            "department_email", "first_month", "second_month"
        ]
    )

    # Load email templates
    employee_template = frappe.get_doc("Email Template", "Employee Email Template")
    department_template = frappe.get_doc("Email Template", "Department Email Template")
    hr_template = frappe.get_doc("Email Template", "HR Email Template")

    department_map = {}
    all_employees = []

    for record in leave_records:
        if record.first_month == current_month or record.second_month == current_month:

            # Render email for employee
            employee_context = {
                "employee_name": record.employee_name,
                "current_month": current_month
            }
            subject = frappe.render_template(employee_template.subject, employee_context)
            message = frappe.render_template(employee_template.response, employee_context)

            frappe.sendmail(
                recipients=[record.employee_email],
                subject=subject,
                message=message
            )

            # Map employees per department
            department_map.setdefault(
                (record.department_name, record.department_email), []
            ).append(record.employee_name)
            all_employees.append(record.employee_name)

    # Send emails to departments
    for (department_name, dept_email), employees in department_map.items():
        dept_context = {
            "department_name": department_name,
            "current_month": current_month,
            "employees": employees
        }
        dept_subject = frappe.render_template(department_template.subject, dept_context)
        dept_message = frappe.render_template(department_template.response, dept_context)

        frappe.sendmail(
            recipients=[dept_email],
            subject=dept_subject,
            message=dept_message
        )

    # Send email to HR
    hr_department_map = {}
    for (dept_name, _), employees in department_map.items():
        hr_department_map[dept_name] = employees
    
    hr_context = {
        "current_month": current_month,
        "departments": hr_department_map
    }
    hr_subject = frappe.render_template(hr_template.subject, hr_context)
    hr_message = frappe.render_template(hr_template.response, hr_context)

    frappe.sendmail(
        recipients=["hr@ncc.gov.gh"],
        subject=hr_subject,
        message=hr_message
    )

@frappe.whitelist()
def get_months(doctype, txt, searchfield, start, page_len, filters):
    return frappe.db.sql("""
        SELECT name, name FROM `tabMonth`
        WHERE name LIKE %(txt)s
        ORDER BY month_index ASC
        LIMIT %(start)s, %(page_len)s
    """, {
        "txt": f"%{txt}%",
        "start": start,
        "page_len": page_len
    })

@frappe.whitelist()
def get_months_after(doctype, txt, searchfield, start, page_len, filters):
    first_month = filters.get('first_month')
    index = frappe.db.get_value("Month", first_month, "month_index")

    return frappe.db.sql("""
        SELECT name, name FROM `tabMonth`
        WHERE month_index > %(index)s AND name LIKE %(txt)s
        ORDER BY month_index ASC
        LIMIT %(start)s, %(page_len)s
    """, {
        "index": index,
        "txt": f"%{txt}%",
        "start": start,
        "page_len": page_len
    })
