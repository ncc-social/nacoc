# Copyright (c) 2013, NCC and contributors
# For license information, please see license.txt

# from __future__ import unicode_literals
# # import frappe

# def execute(filters=None):
# 	columns, data = [], []
# 	return columns, data

from __future__ import unicode_literals
import frappe
from frappe import _
from frappe.utils import flt, cint

def execute(filters=None):
	if not filters: filters = {}

	columns = get_columns()
	data = get_transactions(filters)

	return columns, data

def get_columns():
	columns = [
		{
			"label": _("ID"),
			"fieldname": "name",
			"fieldtype": "Link",
			"options": "Transaction",
			"width": 100,
		},
		{
			"label": _("Transaction Date"),
			"fieldname": "date_of_transaction",
			"fieldtype": "Date",
			"width": 100,
		},
		{
			"label": _("Exporter"),
			"fieldname": "exporter_name",
			"fieldtype": "Data",
			"width": 180
		},
        {
			"label": _("Forwarder"),
			"fieldname": "forwarder_name",
			"fieldtype": "Data",
			"width": 180
		},
        {
			"label": _("Consignee"),
			"fieldname": "consignee_name",
			"fieldtype": "Data",
			"width": 180
		},
		{
			"fieldname":"quantity",
			"label": _("Quantity"),
			"fieldtype": "Int",
			"width": 80
		},
		{
			"fieldname":"weight",
			"label": _("Weight"),
			"fieldtype": "Float",
			"width": 100,
			"precision": 2
		},
		{
			"label": _("Cargo Description"),
			"fieldname": "cargo_description",
			"fieldtype": "Data",
			"width": 200
		},
		{
			"label": _("Country"),
			"fieldname": "consignee_country",
			"fieldtype": "Data",
			"width": 100
		}
	]
	
	return columns
	# return [
	# 	_("ID") + ":Data:80",
	# 	_("Transaction Date") + ":Date:100",
    #     _("Exporter") + ":Data:200",
    #     _("Forwarder") + ":Data:200",
    #     _("Consignee") + ":Data:200",
    #     _("Quantity") + ":Data:80",
    #     _("Weight")+ ":Float:100",
	# 	_("Cargo Description") + ":Data:200",
    #     _("Country") + ":Data:100"
	# ]
	
    # columns = [
    #     _("Transaction") + “:date:90”,
    #     _(“Remarks”) + “::200”,
    #     _(“Against Account”) + “::200”,
    #     _(“Amount”) + “:Float:100”,
    # ]
    # if filters.get("exporter"):
    #     columns += [
    #         _("Forwarder") + ":Data:200",
    #         _("Consignee")+ ":Data:100"
    #     ]
    #     columns += [
    #         _(“Voucher Type”) + “::120”
    #     ]
    # return columns

def get_transactions(filters):
	conditions = get_conditions(filters)
	return frappe.db.sql("""select name, date_of_transaction, exporter_name, forwarder_name, consignee_name,
	quantity, weight, cargo_description, consignee_country from tabTransaction 
	where docstatus < 2 %s order by date_of_transaction DESC""" % conditions, filters, as_dict=1)


def get_conditions(filters):
	conditions = ""
	if filters.get("exporter"):
		# conditions += " and exporter_name LIKE '%%s%%'" % filters["exporter_name"]
		conditions += " and exporter = %(exporter)s"
	if filters.get("forwarder"):
		# conditions += " and forwarder_name LIKE '%%s%%'" % filters["forwarder_name"]
		conditions += " and forwarder = %(forwarder)s"
	if filters.get("consignee"):
		# conditions += " and consignee_name LIKE '%%s%%'" % filters["consignee_name"]
		conditions += " and consignee = %(consignee)s"
# def get_conditions(filters) :
# 	conditions = []

# 	if filters.get("territory"):
# 		conditions.append(" and `tabLead`.territory=%(territory)s")

# 	if filters.get("status"):
# 		conditions.append(" and `tabLead`.status=%(status)s")
	
# 	return " ".join(conditions) if conditions else ""
	
	# if filters.get("month"):
	# 	month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov",
	# 		"Dec"].index(filters["month"]) + 1
	# 	conditions += " and month(date_of_birth) = '%s'" % month

	# if filters.get("company"): conditions += " and company = '%s'" % \
	# 	filters["company"].replace("'", "\\'")

	return conditions