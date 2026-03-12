import frappe
from frappe import _

def get_context(context):
    # Get current user
    user = frappe.session.user

    if not "Executive Dashboard" in frappe.get_roles(user):
        frappe.throw('<span style="color: red;">Sorry! You do not have the permission to access this page.</span>', frappe.PermissionError)

    # Get user document to access full name and other details
    user_doc = frappe.get_doc("User", user)

    # Add full name to context
    context.full_name = user_doc.full_name
    context.user_image = user_doc.user_image or ""

    # If you specifically want the role profile (the DocType that groups multiple roles)
    # Note: Role Profile is optional in Frappe, so user might not have one
    context.role_profile = user_doc.role_profile_name if hasattr(user_doc, 'role_profile_name') else None
    
    
    return context