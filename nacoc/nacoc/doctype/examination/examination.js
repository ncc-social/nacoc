// Copyright (c) 2022, NACOC and contributors
// For license information, please see license.txt

frappe.ui.form.on('Examination', {
	
});

frappe.ui.form.on('Examination', {
	refresh: function(frm) {
		frm.set_query("cargo_import", function(frm, cdt, cdn) {
			return {
				filters: [
					["status", "=", "Tagged"]
				]
			}
		});
	}
});


frappe.ui.form.on('Examination', {
	refresh: function(frm) {
		frm.add_fetch('cargo_import','flight_number','flight_number');
		frm.add_fetch('cargo_import','flight_date','flight_date');
		frm.add_fetch('cargo_import','awb','awb');
		frm.add_fetch('cargo_import','weight','weight');
		frm.add_fetch('cargo_import','pieces','pieces');
		frm.add_fetch('cargo_import','description','description');
		frm.add_fetch('cargo_import','arrival_date','arrival_date');
		
		frm.add_fetch('officer','officer_name','officer_name');
		frm.add_fetch('supervisor','supervisor_name','supervisor_name');
		frm.add_fetch('forwarder','forwarder_name','forwarder_name');
		frm.add_fetch('consignee','consignee_name','consignee_name');
		
	}
});