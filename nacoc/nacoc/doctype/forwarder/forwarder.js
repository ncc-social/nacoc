// Copyright (c) 2022, NACOC and contributors
// For license information, please see license.txt

// frappe.ui.form.on("Forwarder", "refresh", function(frm) {
// 	frappe.ui.form.on("Business Authorisation", {
// 			"business": function(frm) {
// 			frm.add_fetch("business", "business_name", "business_name");
// 			frm.add_fetch("business", "phone_number", "phone_number");
// 			frm.refresh_field("business");

// 		}
// 	});

// });

frappe.ui.form.on("Business Authorisation", "business", function(frm, cdt, cdn) {
    var d = locals[cdt][cdn];
        frappe.db.get_value("Business", {"name": d.business}, "business_name", function(value) {
            d.business_name = value.business_name;
        });
		frappe.db.get_value("Business", {"name": d.business}, "phone_number", function(value) {
            d.phone_number = value.phone_number;
        });
	frm.refresh_field("business_name","phone_number");
});

frappe.ui.form.on(cur_frm.doctype, {
    refresh: frm => {
        if (frm.doc.photo_id) {
            frm.set_df_property("view_photo_id", "options", `
                <object width="300" height="400" data="${ frm.doc.photo_id }"></object>
            `);
        }
		if (frm.doc.fingerprint_impressions) {
            frm.set_df_property("view_fingerprint", "options", `
                <object width="300" height="400" data="${ frm.doc.fingerprint_impressions }"></object>
            `);
        }
    }   
});

frappe.ui.form.on(cur_frm.doctype, {
    refresh: function(frm) {
        if(!frm.is_new()) {
            cur_frm.add_custom_button(__("Create as Exporter"), function() {
                frm.events.create_exporter(frm);
            });
        }
    },

    create_exporter: function(frm){
        frappe.call({
            method: "nacoc.nacoc.doctype.forwarder.custom.create_exporter",
            args:{
                docname: frm.doc.name
            },
            callback: function(r){
                var doc = frappe.model.sync(r.message);
                frappe.set_route('Form', 'Exporter', r.message.name);
            }
        });
    }
});