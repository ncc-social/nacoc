from __future__ import unicode_literals
import frappe
from frappe import _
from frappe.utils import flt, cstr
from frappe.model.mapper import get_mapped_doc
from frappe.model.document import Document

@frappe.whitelist()
def get_events(start, end, filters=None):
	"""Returns events for Gantt / Calendar view rendering.
	:param start: Start date-time.
	:param end: End date-time.
	:param filters: Filters (JSON).
	"""
	# from frappe.desk.calendar import get_event_conditions
	# conditions = get_event_conditions("Workshop", filters)

	data = frappe.db.sql("""select name, exporter_name, 
        concat(year(curdate()),"-", DATE_FORMAT(date_of_birth,'%m-%d')) as birthday 
        from tabExporter order by birthday""", as_dict=True)

	return data