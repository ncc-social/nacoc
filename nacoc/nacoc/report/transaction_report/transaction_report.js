// Copyright (c) 2016, NCC and contributors
// For license information, please see license.txt
/* eslint-disable */

frappe.query_reports["Transaction Report"] = {
	"filters": [
		{
			"fieldname":"exporter",
			"label": __("Exporter"),
			"fieldtype": "Link",
			"options": "Exporter"
		},
        {
			"fieldname":"forwarder",
			"label": __("Forwarder"),
			"fieldtype": "Link",
			"options": "Forwarder"
		},
        {
			"fieldname":"consignee",
			"label": __("Consignee"),
			"fieldtype": "Link",
			"options": "Consignee"
		}
	]
};