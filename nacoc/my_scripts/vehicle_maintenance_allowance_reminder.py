import frappe
from frappe.utils import add_months, nowdate, getdate

def send_vehicle_maintenance_reminders():
    """Send reminders at T-2 and T-1 months before expiry dates."""
    today = getdate(nowdate())
    two_months_ahead = add_months(today, 2)
    one_month_ahead = add_months(today, 1)

    records = frappe.get_all(
        "Vehicle Maintenance Allowance",
        fields=[
            "name",
            "employee_name",
            "road_worthiness_expiry_date",
            "vehicle_insurance_expiry_date",
            "drivers_licence_expiry_date",
            "reminder_2m_sent",
            "reminder_1m_sent",
        ],
        filters={"docstatus": 1},  # Only submitted documents
    )

    for r in records:
        reminders = []
        for field, label in [
            ("road_worthiness_expiry_date", "Road Worthiness"),
            ("vehicle_insurance_expiry_date", "Vehicle Insurance"),
            ("drivers_licence_expiry_date", "Driver's Licence"),
        ]:
            expiry_date = r.get(field)
            if not expiry_date:
                continue

            expiry_date = getdate(expiry_date)

            # T-2 months
            if expiry_date == two_months_ahead and not r.reminder_2m_sent:
                reminders.append((label, "2 months"))
            # T-1 month
            elif expiry_date == one_month_ahead and not r.reminder_1m_sent:
                reminders.append((label, "1 month"))

        if not reminders:
            continue

        # Get email
        email = frappe.db.get_value("Employee", {"employee_name": r.employee_name}, "company_email")
        if not email:
            continue

        # Prepare message
        lines = "\n".join([f"• {label} — expires in {period}" for label, period in reminders])
        subject = f"Vehicle Document Expiry Reminder"
        message = f"""
        Dear {r.employee_name},

        The following vehicle document(s) are approaching their expiry date:

        {lines}

        Please ensure timely renewal to avoid missing out on your vehicle maintenance allowance.

        Regards,  
        Finance Department
        """

        # Send email
        frappe.sendmail(recipients=[email], subject=subject, message=message)

        # Update reminder flags (even for submitted docs)
        to_update = {}
        for _, period in reminders:
            if period == "2 months":
                to_update["reminder_2m_sent"] = 1
            elif period == "1 month":
                to_update["reminder_1m_sent"] = 1

        if to_update:
            frappe.db.set_value("Vehicle Maintenance Allowance", r.name, to_update, update_modified=False)

        frappe.logger().info(f"Reminder sent to {r.employee_name} for {reminders}")
