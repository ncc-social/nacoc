# Copyright (c) 2022, NACOC and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document
from frappe.model.mapper import get_mapped_doc
from frappe.utils import getdate, validate_email_address, today, add_years, format_datetime, cstr
from frappe import throw, _, scrub

class Exporter(Document):
	def validate(self):
		self.set_exporter_name()
		self.validate_date()
		self.validate_email()

	def set_exporter_name(self):
		self.exporter_name = ' '.join(filter(lambda x: x, [self.first_name, self.middle_name, self.last_name]))

	def validate_date(self):
		if self.date_of_birth and getdate(self.date_of_birth) >= getdate(today()):
			throw(_("Date of Birth cannot be today or a future date."))
	
	def validate_email(self):
		if self.personal_email:
			validate_email_address(self.personal_email, True)