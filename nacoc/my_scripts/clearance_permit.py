import frappe
from frappe import _
from frappe.utils import now_datetime

@frappe.whitelist()
def get_next_clearance_permit_preview(precursor_chemical_code):
    if not precursor_chemical_code:
        frappe.throw(_("Precursor Chemical Code is required."))

    current_year = frappe.utils.now_datetime().year
    current_month = frappe.utils.now_datetime().strftime("%m")

    # Get current tracker or assume 0
    last_serial = frappe.db.get_value("Clearance Permit Serial Tracker", current_year, "last_serial") or 0
    next_serial = int(last_serial) + 1
    serial_padded = str(next_serial).zfill(5)

    return f"NCCCP{precursor_chemical_code}{current_year}{serial_padded}-{current_month}"


def before_insert(self):
    if not self.precursor_chemical_code:
        frappe.throw(_("Precursor Chemical Code is required to generate Permit No"))

    current_year = frappe.utils.now_datetime().year
    current_month = frappe.utils.now_datetime().strftime("%m")

    # Lock in and increment serial
    if frappe.db.exists("Clearance Permit Serial Tracker", current_year):
        tracker = frappe.get_doc("Clearance Permit Serial Tracker", current_year)
    else:
        tracker = frappe.get_doc({
            "doctype": "Clearance Permit Serial Tracker",
            "year": current_year,
            "last_serial": 0
        })
        tracker.insert(ignore_permissions=True)

    tracker.reload()
    new_serial = int(tracker.last_serial) + 1
    tracker.db_set("last_serial", new_serial)

    serial_padded = str(new_serial).zfill(5)
    self.permit_no = f"CP{self.precursor_chemical_code}{current_year}{serial_padded}-{current_month}"