// /**
//  * no_autosave_attach.js
//  * Disable automatic form save after file upload
//  * Works per-doctype or globally
//  * Author: Aminu Tijani
//  */

// (function () {
//     // --- Configuration section ---
//     const DOCTYPES_WITH_DISABLED_AUTOSAVE = [
//         "Vehicle Maintenance Allowance", 
//         "Leave Application",
//         // Add more doctypes here, or use ['*'] for global
//     ];

//     frappe.ui.form.on(DOCTYPES_WITH_DISABLED_AUTOSAVE, {
//         refresh(frm) {
//             // Iterate over all attach-type fields
//             frm.fields_dict && Object.values(frm.fields_dict).forEach(df => {
//                 if (df.df.fieldtype === 'Attach' || df.df.fieldtype === 'Attach Image') {
//                     if (!df.__no_autosave_override__) {
//                         df.__no_autosave_override__ = true;

//                         // Keep a reference to the original upload handler
//                         const original = df.on_upload_complete;

//                         // Replace it with a safer version
//                         df.on_upload_complete = function (attachment) {
//                             if (!attachment) return;

//                             // Set the field value, but do NOT trigger frm.save()
//                             this.set_value(attachment.file_url);

//                             // Mark form dirty so Save button is active
//                             this.frm.dirty();

//                             // Notify user
//                             frappe.show_alert({
//                                 message: __('File attached successfully.'),
//                                 indicator: 'green'
//                             });

//                             // Optional: cleanup orphan files if unsaved
//                             window.addEventListener('beforeunload', () => {
//                                 if (!this.frm.is_dirty()) return;
//                                 frappe.call({
//                                     method: 'frappe.client.delete',
//                                     args: { doctype: 'File', name: attachment.name },
//                                     freeze: false
//                                 });
//                             });
//                         };
//                     }
//                 }
//             });
//         }
//     });
// })();

// (function () {
//     const DOCTYPES_WITH_DISABLED_AUTOSAVE = [
//         "Vehicle Maintenance Allowance", 
//         "Leave Application",
//     ];

//     frappe.ui.form.on(DOCTYPES_WITH_DISABLED_AUTOSAVE, {
//         onload_post_render(frm) {
//             // Defer to ensure controls are attached
//             setTimeout(() => disable_auto_save_for_form(frm), 500);
//         },
//         refresh(frm) {
//             // Also call on every refresh
//             setTimeout(() => disable_auto_save_for_form(frm), 500);
//         }
//     });

//     function disable_auto_save_for_form(frm) {
//         if (!frm || !frm.fields_dict) return;

//         Object.values(frm.fields_dict).forEach(df => {
//             if (df.df.fieldtype === 'Attach' || df.df.fieldtype === 'Attach Image') {
//                 const input = df.$input && df.$input[0];
//                 if (!input || df.__no_autosave_override__) return;

//                 df.__no_autosave_override__ = true;
//                 const original = df.on_upload_complete;

//                 df.on_upload_complete = function (attachment) {
//                     if (!attachment) return;
//                     this.set_value(attachment.file_url);
//                     this.frm.dirty();

//                     frappe.show_alert({
//                         message: __('File attached. Remember to save manually.'),
//                         indicator: 'green'
//                     });

//                     // optional cleanup if unsaved
//                     window.addEventListener('beforeunload', () => {
//                         if (!this.frm.is_dirty()) return;
//                         frappe.call({
//                             method: 'frappe.client.delete',
//                             args: { doctype: 'File', name: attachment.name },
//                             freeze: false
//                         });
//                     });
//                 };
//             }
//         });
//     }
// })();
