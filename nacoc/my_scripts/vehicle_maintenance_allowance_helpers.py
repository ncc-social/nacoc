import frappe

@frappe.whitelist()
def get_latest_internal_audit_timestamp(docname):
    """
    Returns the creation timestamp (yyyy-mm-dd) of the latest Workflow comment
    whose content is exactly "Sent to INTERNAL AUDIT for Review".
    Returns None if no such comment exists.
    """
    row = frappe.db.sql(
        """
        SELECT creation
        FROM `tabComment`
        WHERE reference_doctype = %s
          AND reference_name = %s
          AND comment_type = 'Workflow'
          AND content = %s
        ORDER BY creation DESC
        LIMIT 1
        """,
        ("Vehicle Maintenance Allowance", docname, "Sent to INTERNAL AUDIT for Review"),
        as_dict=True,
    )
    if row:
        # return date part (yyyy-mm-dd)
        return row[0].creation.strftime('%Y-%m-%d')
    return None