# Copyright (c) 2022, NACOC and contributors
# For license information, please see license.txt

import frappe, re
from frappe.model.document import Document
from frappe.model.naming import make_autoname

class BusinessAuthorisation(Document):
	def autoname(self):
		suffix = make_autoname("hash", self.doctype)
		self.name = self.business_name + " (" + suffix + ")"
