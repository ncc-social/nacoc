frappe.provide('frappe.nacoc');

// Shared by the "Filter Assessment List" (PCU Assessment) and
// "Filter Precursor Assessment List" (Precursor Assessment) list view
// client scripts - both doctypes restrict the list to the user's
// permitted regions the same way.
frappe.nacoc.fetch_permitted_regions = async function () {
	try {
		const response = await frappe.call({
			method: 'nacoc.my_scripts.custom.get_permitted_regions',
		});
		return response.message || [];
	} catch (error) {
		console.error('Error fetching permitted regions:', error);
		return [];
	}
};

frappe.nacoc.apply_permitted_region_filter = async function (listview) {
	const permittedRegions = await frappe.nacoc.fetch_permitted_regions();

	if (permittedRegions.length > 0) {
		frappe.route_options = {
			region: ['in', permittedRegions],
		};
	} else {
		frappe.route_options = {};
	}
};

// Shared by the "Fetch Employee and Phone Number" (Vehicle Maintenance
// Allowance) and "Fetch Employee and Mobile Number" (Petra Data) form
// client scripts - both fetch the logged-in user's employee record the
// same way and only differ in which extra fields they copy across.
frappe.nacoc.fetch_logged_in_employee_info = function (frm, extra_fields) {
	extra_fields = extra_fields || [];

	frappe.call({
		type: 'GET',
		url: '/api/method/get_logged_in_employee_info',
		error: function (xhr) {
			let message = 'Failed to fetch employee info.';
			try {
				let response = JSON.parse(xhr.responseText);
				if (response && response.message && response.message.error) {
					message = response.message.error;
				}
			} catch (e) {
				// JSON parse failed, keep default message
			}
			frappe.msgprint({ title: __('Error'), indicator: 'red', message: message });
		},
		callback: function (response) {
			if (!response.message) return;

			if (response.message.error) {
				frappe.msgprint({ title: __('Error'), indicator: 'orange', message: response.message.error });
				return;
			}

			frm.set_value('employee_name', response.message.employee_name);
			frm.set_df_property('employee_name', 'read_only', 1);
			frm.set_value('phone_number', response.message.cell_number);

			extra_fields.forEach(function (fieldname) {
				if (fieldname in response.message) {
					frm.set_value(fieldname, response.message[fieldname]);
				}
			});
		},
	});
};
