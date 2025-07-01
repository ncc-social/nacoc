# Copyright (c) 2025, NACOC and contributors
# For license information, please see license.txt

import frappe
from frappe import _, bold
from frappe.model.document import Document
from hrms.hr.doctype.leave_application.leave_application import get_leave_balance_on
from hrms.hr.doctype.leave_ledger_entry.leave_ledger_entry import create_leave_ledger_entry


class EmployeeLeaveAdjustment(Document):

	def validate(self):
		self.validate_non_zero_adjustment()
		self.validate_over_allocation()
		self.validate_leave_balance()

	def validate_non_zero_adjustment(self):
		if self.leaves_to_adjust == 0:
			frappe.throw("Enter a non-zero to adjust.")

	def validate_over_allocation(self):
		max_leaves_allowed = frappe.db.get_value("Leave Type", self.leave_type, "max_leaves_allowed")
		new_allocation = self.allocated_leaves + self.leaves_to_adjust
		if new_allocation > max_leaves_allowed:
			frappe.throw(_("Allocation is greater than maximum allowed {0} for leave type {1}").format(frappe.bold(max_leaves_allowed), frappe.bold(self.leave_type)))

	def validate_leave_balance(self):
		leave_balance = get_leave_balance_on(employee=self.employee, leave_type=self.leave_type,date=self.posting_date)
		if leave_balance < abs(self.leaves_to_adjust):
			frappe.throw(_("Reduction is more than {0}'s available leave balance {1} for leave type {2}").format(
				frappe.bold(self.employee_name),
				frappe.bold(leave_balance),
				frappe.bold(self.leave_type)
			))

	def on_submit(self):
		self.create_leave_ledger_entry(submit=True)

	def on_cancel(self):
		self.create_leave_ledger_entry(submit=False)


	def create_leave_ledger_entry(self,submit=True):
		is_lwp = frappe.db.get_value("Leave Type", self.leave_type, "is_lwp")

		args = dict(
			leaves=self.leaves_to_adjust,
			from_date=self.from_date,
			to_date=self.to_date,
			is_lwp=is_lwp
		)

		create_leave_ledger_entry(self,args,submit)