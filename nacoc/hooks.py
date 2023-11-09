from . import __version__ as app_version

app_name = "nacoc"
app_title = "NACOC"
app_publisher = "NACOC"
app_description = "NACOC Apps"
app_email = "social@ncc.gov.gh"
app_license = "MIT"

fixtures = [
    {"dt": "Workspace", "filters": [
        [
            "title", "in", [
                "NACOC",
                "Staff Zone"
            ]
        ]
    ]},
    {"dt": "Number Card", "filters": [
        [
            "document_type", "in", [
                "PCU Assessment",
                "MMU Vessel"
            ]
        ]
    ]},
    {"dt": "Document Naming Rule", "filters": [
        [
            "document_type", "in", [
                "PCU Assessment"
            ]
        ]
    ]},
    {"dt": "Dashboard Chart", "filters": [
        [
            "document_type", "in", [
                "PCU Assessment",
                "MMU Vessel"
            ]
        ]
    ]},
    {"dt": "Client Script", "filters": [
        [
            "module", "in", [
                "NACOC"
            ]
        ]
    ]},
    {"dt": "Role Profile", "filters": [
        [
            "role_profile", "in", [
                "Precursor Manager",
                "Precursor Officer",
                "NACOC Profile",
                "MMU Manager",
                "MMU Officer",
                "Aviance Officer",
                "Aviance Manager"
            ]
        ]
    ]},
    {"dt": "Custom DocPerm", "filters": [
        [
            "role", "in", [
                "Precursor Manager",
                "Precursor Officer",
                "NACOC User",
                "MMU Manager",
                "MMU Officer",
                "Aviance Officer",
                "Aviance Manager"
            ]
        ]
    ]},
    {"dt": "Role", "filters": [
        [
            "role_name", "in", [
                "Precursor Manager",
                "Precursor Officer",
                "NACOC User",
                "MMU Manager",
                "MMU Officer",
                "Aviance Officer",
                "Aviance Manager"
            ]
        ]
    ]},
    {"dt": "Module Profile", "filters": [
        [
            "module_profile_name", "in", [
                "NACOC Profile"
            ]
        ]
    ]}
]

# Includes in <head>
# ------------------

# include js, css files in header of desk.html
# app_include_css = "/assets/nacoc/css/nacoc.css"
# app_include_js = "/assets/nacoc/js/nacoc.js"

# include js, css files in header of web template
# web_include_css = "/assets/nacoc/css/nacoc.css"
# web_include_js = "/assets/nacoc/js/nacoc.js"

# include custom scss in every website theme (without file extension ".scss")
# website_theme_scss = "nacoc/public/scss/website"

# include js, css files in header of web form
# webform_include_js = {"doctype": "public/js/doctype.js"}
# webform_include_css = {"doctype": "public/css/doctype.css"}

# include js in page
# page_js = {"page" : "public/js/file.js"}

# include js in doctype views
# doctype_js = {"doctype" : "public/js/doctype.js"}
# doctype_list_js = {"doctype" : "public/js/doctype_list.js"}
# doctype_tree_js = {"doctype" : "public/js/doctype_tree.js"}
# doctype_calendar_js = {"doctype" : "public/js/doctype_calendar.js"}

# Home Pages
# ----------

# application home page (will override Website Settings)
# home_page = "login"

# website user home page (by Role)
# role_home_page = {
#	"Role": "home_page"
# }

# Generators
# ----------

# automatically create page for each record of this doctype
# website_generators = ["Web Page"]

# Jinja
# ----------

# add methods and filters to jinja environment
# jinja = {
#	"methods": "nacoc.utils.jinja_methods",
#	"filters": "nacoc.utils.jinja_filters"
# }

# Installation
# ------------

# before_install = "nacoc.install.before_install"
# after_install = "nacoc.install.after_install"

# Uninstallation
# ------------

# before_uninstall = "nacoc.uninstall.before_uninstall"
# after_uninstall = "nacoc.uninstall.after_uninstall"

# Desk Notifications
# ------------------
# See frappe.core.notifications.get_notification_config

# notification_config = "nacoc.notifications.get_notification_config"

# Permissions
# -----------
# Permissions evaluated in scripted ways

# permission_query_conditions = {
#	"Event": "frappe.desk.doctype.event.event.get_permission_query_conditions",
# }
#
# has_permission = {
#	"Event": "frappe.desk.doctype.event.event.has_permission",
# }

# DocType Class
# ---------------
# Override standard doctype classes

# override_doctype_class = {
#	"ToDo": "custom_app.overrides.CustomToDo"
# }

# Document Events
# ---------------
# Hook on document methods and events

# doc_events = {
#	"*": {
#		"on_update": "method",
#		"on_cancel": "method",
#		"on_trash": "method"
#	}
# }

# Scheduled Tasks
# ---------------

# scheduler_events = {
#	"all": [
#		"nacoc.tasks.all"
#	],
#	"daily": [
#		"nacoc.tasks.daily"
#	],
#	"hourly": [
#		"nacoc.tasks.hourly"
#	],
#	"weekly": [
#		"nacoc.tasks.weekly"
#	],
#	"monthly": [
#		"nacoc.tasks.monthly"
#	],
# }

# Testing
# -------

# before_tests = "nacoc.install.before_tests"

# Overriding Methods
# ------------------------------
#
# override_whitelisted_methods = {
#	"frappe.desk.doctype.event.event.get_events": "nacoc.event.get_events"
# }
#
# each overriding function accepts a `data` argument;
# generated from the base implementation of the doctype dashboard,
# along with any modifications made in other Frappe apps
# override_doctype_dashboards = {
#	"Task": "nacoc.task.get_dashboard_data"
# }

# exempt linked doctypes from being automatically cancelled
#
# auto_cancel_exempted_doctypes = ["Auto Repeat"]


# User Data Protection
# --------------------

# user_data_fields = [
#	{
#		"doctype": "{doctype_1}",
#		"filter_by": "{filter_by}",
#		"redact_fields": ["{field_1}", "{field_2}"],
#		"partial": 1,
#	},
#	{
#		"doctype": "{doctype_2}",
#		"filter_by": "{filter_by}",
#		"partial": 1,
#	},
#	{
#		"doctype": "{doctype_3}",
#		"strict": False,
#	},
#	{
#		"doctype": "{doctype_4}"
#	}
# ]

# Authentication and authorization
# --------------------------------

# auth_hooks = [
#	"nacoc.auth.validate"
# ]
