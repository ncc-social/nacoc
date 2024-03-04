import frappe

@frappe.whitelist()

def get_permitted_regions():
    user_email = frappe.session.user
    permitted_regions = frappe.get_all("User Permission",filters={"allow": "Region", "user": "tj@ncc.gov.gh"},fields=["name"])
    regions = [frappe.get_value("User Permission", perm["name"], "for_value") for perm in permitted_regions]
    return regions