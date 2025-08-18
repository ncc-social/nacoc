import frappe
from frappe.utils import add_months, get_first_day, get_last_day, today, formatdate

def send_monthly_leave_summary():
    # Get last month’s range
    first_day_last_month = get_first_day(add_months(today(), -1))
    last_day_last_month = get_last_day(add_months(today(), -1))

    # Query: distinct employees by leave_type within last month
    leave_data = frappe.db.sql("""
        SELECT leave_type, COUNT(DISTINCT employee) as cnt
        FROM `tabLeave Application`
        WHERE workflow_state = 'Leave APPROVED'
          AND from_date <= %(end)s
          AND to_date >= %(start)s
        GROUP BY leave_type
    """, {"start": first_day_last_month, "end": last_day_last_month}, as_dict=True)

    # Build "number card" style HTML (two per row)
    cards_html = ""
    for i, row in enumerate(leave_data):
        if i % 2 == 0:  # Start new row every 2 cards
            cards_html += "<tr>"
            
        cards_html += f"""
        <td width="50%" valign="top" style="padding:10px;">
            <div style="background:#f9f9f9; padding:20px; text-align:center; 
                      box-shadow:0 1px 3px rgba(0,0,0,0.1); border-radius:4px;">
                <div style="font-size:30px; font-weight:bold; color:#2c3e50;">{row.cnt}</div>
                <div style="font-size:14px; color:#7f8c8d;">{row.leave_type}</div>
            </div>
        </td>
        """
        
        if i % 2 == 1 or i == len(leave_data) - 1:  # Close row
            cards_html += "</tr>"

    if not cards_html:
        cards_html = "<tr><td colspan='2'>No employees took leave in the previous month.</td></tr>"

    html = f"""
    <div style="max-width:800px; margin:0 auto;">
        <h3 style="margin-bottom:10px; color:#333;">Monthly Leave Summary</h3>
        <p style="color:#555;">
            Here is the summary of employees who took leave during 
            <b>{formatdate(first_day_last_month, "MMMM YYYY")}</b>:
        </p>
        <table width="100%" cellpadding="0" cellspacing="0" 
               style="border-collapse:separate; border-spacing:10px;">
            {cards_html}
        </table>
    </div>
    """

    # Get HR Manager role users
    hr_users = frappe.get_all("Has Role", filters={"role": "HR Manager"}, fields=["parent"])
    hr_emails = [u.parent for u in hr_users if frappe.db.exists("User", u.parent)]
    hr_emails = [frappe.db.get_value("User", u.parent, "email") for u in hr_users]

    # Deduplicate & filter empty
    hr_emails = list({e for e in hr_emails if e})

    # Always CC hr@ncc.gov.gh
    recipients = hr_emails or []
    cc = ["hr@ncc.gov.gh"]

    if recipients:
        frappe.sendmail(
            recipients=recipients,
            cc=cc,
            subject=f"Leave Summary – {formatdate(first_day_last_month, 'MMMM YYYY')}",
            message=html
        )