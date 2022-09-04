from __future__ import unicode_literals
import frappe
from frappe import _
from frappe.utils import flt, cstr
from frappe.model.mapper import get_mapped_doc
from frappe.model.document import Document

@frappe.whitelist()
def create_exporter(docname):
    exporter_exist = frappe.db.exists("Exporter", {"forwarder_record": docname})
    if exporter_exist:
        frappe.throw(_("Forwarder already exists as an Exporter"))

    forwarder_info = frappe.get_doc("Forwarder", docname)
    new_exporter = frappe.new_doc("Exporter")
    new_exporter.first_name = forwarder_info.first_name
    new_exporter.middle_name = forwarder_info.middle_name
    new_exporter.last_name = forwarder_info.last_name
    new_exporter.exporter_photo = forwarder_info.forwarder_photo
    new_exporter.exporter_record = forwarder_info.name
    new_exporter.date_of_birth = forwarder_info.date_of_birth
    new_exporter.place_of_birth = forwarder_info.place_of_birth
    new_exporter.region_place_of_birth = forwarder_info.region_place_of_birth
    new_exporter.hometown = forwarder_info.hometown
    new_exporter.region_hometown = forwarder_info.region_hometown
    new_exporter.residential_address = forwarder_info.residential_address
    new_exporter.popular_landmark = forwarder_info.popular_landmark
    new_exporter.postal_address = forwarder_info.postal_address
    new_exporter.phone_number = forwarder_info.phone_number
    new_exporter.personal_email = forwarder_info.personal_email
    new_exporter.id_type = forwarder_info.id_type
    new_exporter.id_number = forwarder_info.id_number
    new_exporter.photo_id = forwarder_info.photo_id
    new_exporter.fingerprint_impressions = forwarder_info.fingerprint_impressions
    return new_exporter.as_dict()

@frappe.whitelist()
def get_events(start, end, filters=None):
	"""Returns events for Gantt / Calendar view rendering.
	:param start: Start date-time.
	:param end: End date-time.
	:param filters: Filters (JSON).
	"""
	# from frappe.desk.calendar import get_event_conditions
	# conditions = get_event_conditions("Workshop", filters)

	data = frappe.db.sql("""select name, forwarder_name, 
        concat(year(curdate()),"-", DATE_FORMAT(date_of_birth,'%m-%d')) as birthday 
        from tabForwarder order by birthday""", as_dict=True)

	return data