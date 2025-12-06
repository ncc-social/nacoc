# Copyright (c) 2025, NACOC and contributors
# For license information, please see license.txt


import frappe
from frappe.model.document import Document
from frappe.utils import today, getdate


class VehicleMaintenanceAllowance(Document):

    def before_save(self):
        """
        Clear the rejection reason when the user RESUBMITS
        (i.e., transitions from 'Reapply VMA' to any other workflow state).
        """
        if self.name and not self.is_new():
            old_doc = frappe.get_doc(self.doctype, self.name)
            old_state = old_doc.workflow_state
            new_state = self.workflow_state

            # Detect RESUBMIT
            if old_state == "Reapply VMA" and new_state != "Reapply VMA":
                self.custom_rejection_reason = None

    def validate(self):
        # Determine reference date for validation:
        # if a workflow "Sent to INTERNAL AUDIT for Review" comment exists, use its timestamp,
        # otherwise use today's date.
        reference_date = self.get_latest_internal_audit_date() or today()

        # run checks (will throw if invalid)
        self._validate_dates(reference_date)

    def get_latest_internal_audit_date(self):
        """Return latest yyyy-mm-dd or None"""
        row = frappe.db.sql(
            """
            SELECT creation
            FROM `tabComment`
            WHERE reference_doctype=%s
              AND reference_name=%s
              AND comment_type='Workflow'
              AND content=%s
            ORDER BY creation DESC
            LIMIT 1
            """,
            (self.doctype, self.name, "Sent to INTERNAL AUDIT for Review"),
            as_dict=True,
        )
        if not row:
            return None

        creation_val = row[0].get("creation")
        # creation_val may be a datetime.datetime or a string depending on DB/driver.
        if creation_val is None:
            return None
        if hasattr(creation_val, "date"):
            # datetime -> YYYY-MM-DD
            return creation_val.date().isoformat()
        # fallback for string or other types
        s = str(creation_val)
        return s[:10] if len(s) >= 10 else s

    def _fmt(self, date_str):
        # helper for dd-mm-yyyy representation
        if not date_str:
            return ""
        y, m, d = date_str.split("-")
        return f"{d}-{m}-{y}"

    def _validate_dates(self, reference_date):
        errors = []

        # expiry fields to check
        expiry_fields = [
            ("drivers_licence_expiry_date", "Driver's Licence"),
            ("road_worthiness_expiry_date", "Road Worthiness"),
            ("vehicle_insurance_expiry_date", "Vehicle Insurance"),
        ]

        for fieldname, label in expiry_fields:
            val = self.get(fieldname)
            if val:
                # compare date values (val and reference_date are yyyy-mm-dd)
                if getdate(val) < getdate(reference_date):
                    errors.append(
                        f"{label} has expired ({self._fmt(val)}) relative to reference date ({self._fmt(reference_date)})."
                    )

        # vehicle registration cannot be in the future relative to reference_date
        if self.vehicle_registration_date:
            if getdate(self.vehicle_registration_date) > getdate(reference_date):
                errors.append(
                    f"Vehicle Registration Date ({self._fmt(self.vehicle_registration_date)}) cannot be later than reference date ({self._fmt(reference_date)})."
                )

        if errors:
            frappe.throw("<br>".join(errors), title="Invalid Dates")
