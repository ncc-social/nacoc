# Copyright (c) 2025, NACOC and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from datetime import datetime
from frappe import throw, _

class Training(Document):
	def validate(self):
		if not self.start_time_set:
			self.start_time = None
		if not self.end_time_set:
			self.end_time = None
		# Parse and normalize fields
		start_date = (
			datetime.strptime(self.start_date, "%Y-%m-%d").date()
			if isinstance(self.start_date, str)
			else self.start_date
		)
		end_date = (
			datetime.strptime(self.end_date, "%Y-%m-%d").date()
			if isinstance(self.end_date, str)
			else self.end_date
		)
		start_time = (
			datetime.strptime(self.start_time, "%H:%M:%S").time()
			if isinstance(self.start_time, str)
			else self.start_time
		) if self.start_time else None

		end_time = (
			datetime.strptime(self.end_time, "%H:%M:%S").time()
			if isinstance(self.end_time, str)
			else self.end_time
		) if self.end_time else None

		# 1. Check date range
		if start_date and end_date:
			if start_date > end_date:
				throw(_("Start Date must be less than or equal to End Date."))

		# 2. If both times are set, validate time order regardless of date
		if start_time and end_time:
			if start_time >= end_time:
				throw(_("Start Time must be earlier than End Time."))
		