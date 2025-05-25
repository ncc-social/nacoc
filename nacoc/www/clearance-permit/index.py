import frappe
from frappe import _

def get_context(context):
    docname = frappe.form_dict.get("docname")
    try:
        context.cp = frappe.get_doc("Clearance Permit", docname)
    except frappe.DoesNotExistError:
        # Set flag for template to show an error message
        context.doc_not_found = True
        context.docname = docname

    return context