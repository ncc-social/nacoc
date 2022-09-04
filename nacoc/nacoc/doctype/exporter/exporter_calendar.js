frappe.views.calendar["Exporter"] = {
	options: {
		header: {
			left: 'prev,next today',
			center: 'title',
			right: 'month'
		}
	},
    field_map: {
		"start": "birthday",
		"end": "birthday",
		"id": "name",
		"title": "exporter_name",
		"allDay": "allDay"
	},
	gantt: { // The values set here will override the values set in the object just for Gantt View
        order_by: "birthday",
    },
	get_events_method: "nacoc.nacoc.doctype.exporter.custom.get_events",
};