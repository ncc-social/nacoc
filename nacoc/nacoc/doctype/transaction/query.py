from __future__ import unicode_literals
import frappe
from frappe.model.document import Document

# @frappe.whitelist()
# def fetch_business(doctype, txt, searchfield, start, page_lan, filters):
# 	# business = filters.get('business')
# 	result = frappe.db.sql("""
# 		SELECT
# 			business
# 		FROM
# 			`tabBusiness Authorisation`
# 		""")
# 	return result


# @frappe.whitelist()
# def fetch_business(doctype, txt, searchfield, start, page_len, filters):
# 	cond = "1=1"
# 	if filters.get('Buiness Authorisation'):
# 		cond += " and business = '{}'".format(filters.get('business'))
# 	# if filters.get('inspection_type'):
# 	# 	cond += " and inspection_type = '{}'".format(filters.get('inspection_type'))
# 	return frappe.db.sql("""select business_name  from `tabBusiness Authorisation` 
# 			where  {cond}""".format(cond=cond))

# @frappe.whitelist()
# def fetch_business(doctype, txt, searchfield, start, page_len, filters):
# 	biz = frappe.db.sql("select business_name from `tabBusiness Authorisation`")
# 	return biz

@frappe.whitelist()
def fetch_business(doctype, txt, searchfield, start, page_len, filters):
	# biz = frappe.db.sql("""select name, business_name from `tabBusiness Authorisation`""")
	biz = frappe.db.get_all('Business Authorisation', fields=['name','business_name'])
	return biz


# @frappe.whitelist()
# def fetch_business(parent,year):
# 	return frappe.db.sql("""select business_name from `tabBusiness Authorisation` where parent=%s""", (filters.get("parent")))
# 	# return [x.business_name for x in biz]