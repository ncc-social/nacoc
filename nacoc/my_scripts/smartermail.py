import frappe
import requests
from frappe.utils import now_datetime, get_datetime, add_to_date

@frappe.whitelist(allow_guest=True)
def authenticate_admin():
    return authenticate_smartermail("admin")

@frappe.whitelist(allow_guest=True)
def authenticate_domain():
    return authenticate_smartermail("domain")

def authenticate_smartermail(auth_type):
    credentials = frappe.get_single("Dashboard Credentials")

    if auth_type == "admin":
        username = credentials.mail_admin_username
        password = credentials.get_password("mail_admin_password")
    else:
        username = credentials.mail_domain_username
        password = credentials.get_password("mail_domain_password")

    url = "https://mail.ncc.gov.gh/api/v1/auth/authenticate-user"
    response = requests.post(url, json={"username": username, "password": password})

    if response.status_code == 200:
        data = response.json()
        return {
            "accessToken": data.get("accessToken"),
            "refreshToken": data.get("refreshToken")
        }
    else:
        frappe.throw("Failed to authenticate with SmarterMail")


@frappe.whitelist(allow_guest=True)
def log_server_status():
    server_name = "mail.ncc.gov.gh"
    target_url = "https://one.one.one.one"  # The server you are monitoring

    try:
        response = requests.head(target_url, timeout=5)  # Check server status
        status = "Up" if response.status_code == 200 else "Down"
    except requests.RequestException:
        status = "Down"

    # Get current time and round to the minute
    current_time = now_datetime()
    current_minute_start = current_time.replace(second=0, microsecond=0)

    # Use Frappe cache to reduce database queries
    cache_key = f"server_status_log:{server_name}"
    last_logged_time = frappe.cache().get_value(cache_key)

    if last_logged_time:
        last_logged_time = frappe.utils.get_datetime(last_logged_time)
        if last_logged_time == current_minute_start:
            frappe.logger("server_status").info(f"Skipping duplicate log for {server_name} at {current_time}")
            return  # Skip logging if already logged for this minute

    # Insert new log entry
    doc = frappe.get_doc({
        "doctype": "Server Status Log",
        "server_name": server_name,
        "status": status,
        "timestamp": current_time
    })
    doc.insert(ignore_permissions=True)
    frappe.db.commit()

    # Update cache with the latest log time
    frappe.cache().set_value(cache_key, str(current_minute_start))

    frappe.logger("server_status").info(f"Logged {status} for {server_name} at {current_time}")



@frappe.whitelist(allow_guest=True)
def get_server_status_logs(server_name):
    """Fetches server uptime and downtime logs."""
    logs = frappe.get_all(
        "Server Status Log",
        filters={"server_name": server_name},
        fields=["server_name", "status", "timestamp"],
        order_by="timestamp desc",
        limit_page_length=60
    )
    return logs