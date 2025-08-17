import frappe
from frappe.utils import formatdate, nowdate, getdate, add_days

def send_weekly_leave_digest():
    today = getdate(nowdate())

    # Define weeks (Mon–Sun)
    week_start = add_days(today, -today.weekday())  
    week_end = add_days(week_start, 6)
    next_week_start = add_days(week_start, 7)
    next_week_end = add_days(week_end, 7)

    # Fetch approved leaves within the periods
    leaves = frappe.db.sql("""
        SELECT 
            la.employee_name,
            la.from_date,
            la.to_date,
            la.total_leave_days,
            d.parent_department,
            pd.department_name AS parent_department_name,
            pd.custom_department_email AS parent_department_email,
            d.department_name AS department_name
        FROM `tabLeave Application` la
        LEFT JOIN `tabDepartment` d ON la.department = d.name
        LEFT JOIN `tabDepartment` pd ON d.parent_department = pd.name
        WHERE la.workflow_state = 'Leave APPROVED'
          AND (
                la.from_date BETWEEN %s AND %s
             OR la.from_date BETWEEN %s AND %s
          )
    """, (week_start, week_end, next_week_start, next_week_end), as_dict=True)

    if not leaves:
        return

    # Group by parent department
    dept_map = {}
    all_this_week, all_next_week = [], []

    for leave in leaves:
        dept = leave.parent_department
        if not dept or not leave.parent_department_email:
            continue

        dept_map.setdefault(dept, {
            "email": leave.parent_department_email,
            "name": leave.parent_department_name,
            "this_week": [],
            "next_week": []
        })

        if week_start <= leave.from_date <= week_end:
            dept_map[dept]["this_week"].append(leave)
            all_this_week.append(leave)
        elif next_week_start <= leave.from_date <= next_week_end:
            dept_map[dept]["next_week"].append(leave)
            all_next_week.append(leave)

    # --- Table renderers ---
    def render_table(leaves, heading, show_dept=False):
        if not leaves:
            return f"<p><b>{heading}</b>: No employees going on leave in this period.</p>"
        table = f"""
        <p><b>{heading}</b></p>
        <table border="1" cellpadding="6" cellspacing="0" 
               style="border-collapse: collapse; font-family: Tahoma; font-size: 12px; width:100%;">
            <tr style="background-color: #f2f2f2; font-weight: bold;">
                <th>Employee</th>
                {"<th>Department</th>" if show_dept else ""}
                <th>From</th>
                <th>To</th>
                <th>Total Days</th>
            </tr>
        """
        for l in leaves:
            dept_col = f"<td>{l.department_name}</td>" if show_dept else ""
            table += f"""
            <tr>
                <td>{l.employee_name}</td>
                {dept_col}
                <td>{formatdate(l.from_date, "d MMM yyyy")}</td>
                <td>{formatdate(l.to_date, "d MMM yyyy")}</td>
                <td>{int(l.total_leave_days)}</td>
            </tr>
            """
        table += "</table>"
        return table

    # --- Send to Parent Departments ---
    for dept, info in dept_map.items():
        subject = f"Weekly Leave Digest - {info['name']}"
        intro = f"""
            <p>Hello,</p>
            <p>Below is a summary of employees under {info['name']} whose leave commenced this week and those scheduled for next week:</p>
        """
        body = intro
        body += render_table(info["this_week"], "Leaves Started This Week")
        body += "<br>"
        body += render_table(info["next_week"], "Leaves Starting Next Week")
        body += "<p>Regards,<br>Jupiter Platform</p>"

        frappe.sendmail(
            recipients=[info["email"]],
            subject=subject,
            message=body
        )

    # --- Send to HR Managers ---
    hr_managers = frappe.db.sql("""
        SELECT DISTINCT u.email
        FROM `tabUser` u
        JOIN `tabHas Role` r ON u.name = r.parent
        WHERE r.role = 'HR Manager' AND u.enabled = 1 AND u.email <> 'admin@example.com'
    """, as_dict=True)

    hr_emails = [u.email for u in hr_managers if u.email]
    if hr_emails:
        subject = "Weekly Leave Digest - All Departments"
        intro = """
            <p>Hello,</p>
            <p>Here is the consolidated summary of employees whose leave commenced this week and those starting next week:</p>
        """
        body = intro
        body += render_table(all_this_week, "Leaves Started This Week", show_dept=True)
        body += "<br>"
        body += render_table(all_next_week, "Leaves Starting Next Week", show_dept=True)
        body += "<p>Regards,<br>Jupiter Platform</p>"

        frappe.sendmail(
            recipients=hr_emails,
            cc=["hr@ncc.gov.gh","hrad@ncc.gov.gh"],
            subject=subject,
            message=body
        )
