// Copyright (c) 2022, NACOC and contributors
// For license information, please see license.txt

frappe.ui.form.on('Exporter', {
	// refresh: function(frm) {

	// }
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
