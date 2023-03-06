// Copyright (c) 2022, NACOC and contributors
// For license information, please see license.txt

// frappe.ui.form.on("EDF Airport", "onload", function(frm) {
//     cur_frm.set_query("business", function(doc) {
//         return {
//             "filters": [
// 				["Business Authorisation", "parent", "=", doc.forwarder],
// 				["Business Authorisation", "year", ">", "2016"]
// 			]
//         };
//     });
// });


frappe.ui.form.on('EDF Airport', {
	refresh: function(frm) {
		frm.set_query("business", function(frm, cdt, cdn) {
			// var a = locals[cdt][cdn];
			var d = new Date;
			return {
				get_query: 'nacoc.nacoc.doctype.transaction.query.fetch_business',
				filters: [
					["parent", "=", frm.forwarder],
					["year", "in", [
						(d.getFullYear()-1).toString(), 
						d.getFullYear().toString()
						]
					]
				],
			}
		});
	}
});

frappe.ui.form.on(cur_frm.doctype, {
    refresh: frm => {
        if (frm.doc.edf) {
            frm.set_df_property("view_edf", "options", `
                <object width="300" height="400" data="${ frm.doc.edf }"></object>
            `);

        }
		if (frm.doc.idg) {
            frm.set_df_property("view_idg", "options", `
                <object width="300" height="400" data="${ frm.doc.idg }"></object>
            `);
        }
		// if ( frm.doc.exporter.length > 0 ) {
        // //     frm.set_df_property("view_exporter", "options", `
        // //         <object width="100" height="100" data="${ frm.doc.exporter_photo }"></object>
        // //     `);
		// 	
        // }
		// $( frm.fields_dict.view_exporter.wrapper ).html( exp_photo );
    }
});
// Link formatter sample from Employee
frappe.form.link_formatters['Business Authorisation'] = function(value, doc) {
    if(doc.business_name && doc.business_name !== value) {
        return value + ':/ ' + doc.business_name;
    } else {
        return value;
    }
}

// frappe.ui.form.on("EDF Airport", "refresh", function(frm) {
// 	cur_frm.fields_dict['Business'].grid.get_field('business_name').get_query = function(doc, cdt, cdn) {
// 		return {
// 			"filters": [
// 				["Business Authorisation", "parent", "=", doc.forwarder],
// 				["Business Authorisation", "year", ">", "2016"]
// 			]
// 		}
// 	}
// });

// frappe.ui.form.on('EDF Airport', {
// 	refresh: function(frm) {
// 		var df = frappe.meta.get_docfield("Business Authorisation", "business", frm.doc.name);
// 		df.formatter = function(value, df, options, doc) {
// 			return value ? value + ': ' + doc.business_name: doc.business_name;
// 		}
// 	}
// })



frappe.ui.form.on("EDF Airport", "validate", function(frm) {
    var awbreg = /^[0-9]{3}[-][0-9]{8}$/;
    if (awbreg.test(frm.doc.awb) === true){
        frappe.msgprint(__("Airway Bill Number is invalid."));
        frappe.validated = false;
    }
});

// cur_frm.fields_dict.business.get_query = function(doc) {
// 	return {
// 		filters: [
// 			["Business Authorisation", "parent", "=", doc.forwarder],
// 			["Business Authorisation", "year", "=", "2021"]
// 		]
// 	}
// }

frappe.ui.form.on('EDF Airport', {
	refresh: function(frm) {
		//frm.add_fetch('exporter','exporter_name','exporter_name');
		frm.add_fetch('exporter','phone_number','exporter_phone_number');
		// frm.add_fetch('exporter','exporter_photo','exporter_photo');
		// frm.add_fetch('forwarder','forwarder_name','forwarder_name');
		frm.add_fetch('forwarder','phone_number','forwarder_phone_number');
		//frm.add_fetch('consignee','consignee_name','consignee_name');
		frm.add_fetch('consignee','consignee_country','consignee_country');
		frm.add_fetch('business','business_name','business_name');
	}
});

// cur_frm.set_query("business", function(doc) {
// 	return {
// 		query: "scd.security_check_desk.doctype.transaction.transaction.fetch_business",
// 		"filters": [
// 			["Business Authorisation", "parent", "=", doc.forwarder],
// 			["Business Authorisation", "year", "=", "2021"]
// 		]
// 	}
// });


// cur_frm.set_query("business", function(doc, cdt, cdn) {
// 	var d = locals[cdt][cdn];
// 	return{
// 		filters: [
// 			["Business Authorisation", "parent", "=", frm.forwarder],
// 			['Business Authorisation', "year", "in", [
// 				(d.getFullYear()-1).toString(), 
// 				d.getFullYear().toString()
// 				]
// 			]
// 		]
// 	}
// });

// frappe.ui.form.on('EDF Airport', {
// 	refresh: function(frm) {
// 		frm.set_query("business", function(doc, cdt, cdn) {
// 			var a = locals[cdt][cdn];
// 			var d = new Date;
// 			return{
// 				filters: [
// 					["Business Authorisation", "parent", "=", frm.forwarder],
// 					['Business Authorisation', "year", "in", [
// 						(d.getFullYear()-1).toString(), 
// 						d.getFullYear().toString()
// 						]
// 					]
// 				]
// 			}
// 		});
// 	}
// });

// frappe.ui.form.on('EDF Airport', {
// 	refresh: function(frm) {
// 		if(frm.doc.exporter) {
// 			var exp_photo = '<img src="' + frm.doc.exporter_photo + '">';
// 			$(frm.fields_dict.view_exporter.wrapper).html(exp_photo);
// 		}
// 	}
// });