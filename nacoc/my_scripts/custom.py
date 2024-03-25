import frappe

@frappe.whitelist()
def get_permitted_regions():
    user_email = frappe.session.user
    permitted_regions = frappe.get_all("User Permission",filters={"allow": "Region", "user": "tj@ncc.gov.gh"},fields=["name"])
    regions = [frappe.get_value("User Permission", perm["name"], "for_value") for perm in permitted_regions]
    return regions

@frappe.whitelist()
def update_book_status_on_issue(book):
    try:
        # Get the Book document
        book_doc = frappe.get_doc('Book', book)
        
        # Update the status of the book to "Issued"
        book_doc.status = 'Issued'
        book_doc.save()
        
        return "Book issued successfully"
    except Exception as e:
        frappe.log_error(frappe.get_traceback(), "update_book_status")
        return "An error occurred: " + str(e)

@frappe.whitelist()
def update_book_status_on_return(book, condition):
    try:
        # Get the Book document
        book_doc = frappe.get_doc('Book', book)
        
        # Update the status of the book with the condition value
        book_doc.status = condition
        
        # Save the updated book document
        book_doc.save()
        
        return "success"
    except Exception as e:
        frappe.log_error(frappe.get_traceback(), "update_book_status")
        return "An error occurred: " + str(e)

@frappe.whitelist()
def get_latest_issuance(book):
    try:
        # Query the Issue Log to retrieve the latest issuance of the selected book
        latest_issuance = frappe.get_all('Issue Book',
            filters={'book': book},  # Filter by book
            fields=['employee', 'issue_date', 'due_date'],
            order_by='issue_date DESC', limit=1)

        if latest_issuance:
            return latest_issuance[0]
        else:
            return None
    except Exception as e:
        frappe.log_error(frappe.get_traceback(), "get_latest_issuance")
        return None