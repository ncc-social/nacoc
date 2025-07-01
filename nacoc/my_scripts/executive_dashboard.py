import frappe
from frappe import _
from frappe.utils import formatdate, getdate, nowdate
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta
from collections import defaultdict
from urllib.parse import unquote
from hrms.hr.doctype.leave_application.leave_application import get_leave_details


@frappe.whitelist()
def get_total_employees_and_yearly_data(department=None):
    filters = {
        "status": "Active",
        "grade": ["in", ["ANDO", "DNDO", "NDO", "SNDO", "PNDO", "CNDO", "ANCO", "DNCO", "NCO", "SNCO", "PNCO", "CNCO", "DDG", "DG"]]
        }
    if department:
        filters["department"] = department

    # Total employees
    total = frappe.db.count("Employee", filters)

    # SQL filter clause
    sql_filter = "status = 'Active' AND date_of_joining IS NOT NULL"
    sql_params = []

    if department:
        sql_filter += " AND department = %s"
        sql_params.append(department)

    # Yearly joining data
    results = frappe.db.sql(f"""
        SELECT YEAR(date_of_joining) AS year, COUNT(*) as count
        FROM `tabEmployee`
        WHERE {sql_filter}
        GROUP BY YEAR(date_of_joining)
        ORDER BY YEAR(date_of_joining)
    """, sql_params, as_dict=True)

    years = [str(row["year"]) for row in results]
    counts = [row["count"] for row in results]

    return {
        "total_employees": total,
        "years": years,
        "counts": counts
    }

@frappe.whitelist()
def get_total_secondment(department=None):
    # Filters for employees with grade NOT in A1, A2, A3 or NULL
    filters = {
        "status": "Active",
    }
    if department:
        filters["department"] = department

    # Total employees (using frappe ORM)
    total = frappe.db.count("Employee", filters=filters) - frappe.db.count("Employee", {
        **filters,
        "grade": ["in", ["ANDO", "DNDO", "NDO", "SNDO", "PNDO", "CNDO", "ANCO", "DNCO", "NCO", "SNCO", "PNCO", "CNCO", "DDG", "DG"]],
    })

    # SQL filter clause for yearly data
    sql_filter = "status = 'Active' AND date_of_joining IS NOT NULL AND (grade NOT IN ('ANDO', 'DNDO', 'NDO', 'SNDO', 'PNDO', 'CNDO', 'ANCO', 'DNCO', 'NCO', 'SNCO', 'PNCO', 'CNCO', 'DDG', 'DG') OR grade IS NULL)"
    sql_params = []

    if department:
        sql_filter += " AND department = %s"
        sql_params.append(department)

    # Yearly joining data
    results = frappe.db.sql(f"""
        SELECT YEAR(date_of_joining) AS year, COUNT(*) as count
        FROM `tabEmployee`
        WHERE {sql_filter}
        GROUP BY YEAR(date_of_joining)
        ORDER BY YEAR(date_of_joining)
    """, sql_params, as_dict=True)

    years = [str(row["year"]) for row in results]
    counts = [row["count"] for row in results]

    return {
        "total_secondment": total,
        "years": years,
        "counts": counts
    }


@frappe.whitelist()
def get_new_hires_this_year(department=None):
    if department:
        department = unquote(department)

    current_year = getdate(nowdate()).year
    condition = "status = 'Active' AND YEAR(date_of_joining) = %s"
    params = [current_year]

    if department:
        condition += " AND department = %s"
        params.append(department)

    data = frappe.db.sql(f"""
        SELECT COUNT(*) AS count
        FROM `tabEmployee`
        WHERE {condition}
    """, params, as_dict=True)

    return {
        "count": data[0].count if data else 0
    }


@frappe.whitelist()
def get_exits_this_year(department=None):
    if department:
        department = unquote(department)

    current_year = getdate(nowdate()).year
    condition = "status != 'Active' AND YEAR(relieving_date) = %s"
    params = [current_year]

    if department:
        condition += " AND department = %s"
        params.append(department)

    data = frappe.db.sql(f"""
        SELECT COUNT(*) AS count
        FROM `tabEmployee`
        WHERE {condition}
    """, params, as_dict=True)

    return {
        "count": data[0].count if data else 0
    }


@frappe.whitelist()
def get_gender_distribution(department=None):

    if department:
        department = unquote(department)

    filters = "status = 'Active' AND gender IS NOT NULL"
    params = []

    if department:
        filters += " AND department = %s"
        params.append(department)

    data = frappe.db.sql(f"""
        SELECT gender, COUNT(*) AS count
        FROM `tabEmployee`
        WHERE {filters}
        GROUP BY gender
        ORDER BY gender DESC
    """, params, as_dict=True)

    labels = [row.gender for row in data]
    counts = [row.count for row in data]

    return {
        "labels": labels,
        "counts": counts
    }



@frappe.whitelist()
def get_employees_by_rank(department=None):

    if department:
        department = unquote(department)

    filters = "e.status = 'Active' AND g.custom_order <> 0"
    params = []

    if department:
        filters += " AND e.department = %s"
        params.append(department)

    data = frappe.db.sql(f"""
        SELECT 
            e.grade AS grade,
            e.gender,
            COUNT(*) AS count
        FROM `tabEmployee` e
        INNER JOIN `tabEmployee Grade` g ON e.grade = g.name
        WHERE {filters}
        GROUP BY e.grade, e.gender, g.custom_order
        ORDER BY g.custom_order ASC
    """, params, as_dict=True)

    male = defaultdict(int)
    female = defaultdict(int)
    labels = []

    for row in data:
        grade = row.grade
        if grade not in labels:
            labels.append(grade)

        if row.gender == 'Male':
            male[grade] = row.count
        elif row.gender == 'Female':
            female[grade] = row.count

    male_counts = [male[label] for label in labels]
    female_counts = [female[label] for label in labels]
    totals = [male[label] + female[label] for label in labels]

    return {
        "labels": labels,
        "male": male_counts,
        "female": female_counts,
        "totals": totals
    }

@frappe.whitelist()
def get_employees_by_dept():
    data = frappe.db.sql("""
        SELECT 
            d.department_name AS dept,
            COUNT(*) AS count
        FROM `tabEmployee` e
        INNER JOIN `tabDepartment` d ON e.department = d.name
        WHERE e.status = 'Active' AND e.department IS NOT NULL 
        GROUP BY e.department
        ORDER BY count DESC
        LIMIT 10
    """, as_dict=True)

    labels = [row.dept for row in data]
    counts = [row.count for row in data]

    return {
        "labels": labels,
        "counts": counts
    }


@frappe.whitelist()
def get_approved_leaves_this_month(department=None):
    where_clauses = [
        "workflow_state = 'Leave APPROVED'",
        "MONTH(to_date) = MONTH(CURDATE())",
        "YEAR(to_date) = YEAR(CURDATE())"
    ]
    params = []

    if department:
        where_clauses.append("department = %s")
        params.append(department)

    where_sql = " AND ".join(where_clauses)

    data = frappe.db.sql(f"""
        SELECT 
            UPPER(employee_name) AS employee,
            CASE 
                WHEN leave_type IN ('Annual Leave - JD', 'Annual Leave - SD') THEN 'ANNUAL LEAVE'
                ELSE UPPER(leave_type)
            END AS leave_type,
            DATE_FORMAT(from_date, '%%d-%%m-%%Y') AS start_date,
            DATE_FORMAT(to_date, '%%d-%%m-%%Y') AS end_date,
            total_leave_days AS leave_days
        FROM `tabLeave Application`
        WHERE {where_sql}
        ORDER BY employee_name
    """, params, as_dict=True)

    return data

@frappe.whitelist()
def get_birthdays_this_week(department=None):

    today = datetime.today()
    start_of_week = today - timedelta(days=today.weekday())  # Monday
    end_of_week = start_of_week + timedelta(days=6)  # Sunday

    start_str = start_of_week.strftime('%m-%d')
    end_str = end_of_week.strftime('%m-%d')

    condition = "status = 'Active' AND date_of_birth IS NOT NULL"
    params = []

    if department:
        condition += " AND department = %s"
        params.append(department)

    query = f"""
        SELECT 
            employee_name AS employee,
            cell_number,
            DATE_FORMAT(date_of_birth, '%%d %%M') AS dob
        FROM `tabEmployee`
        WHERE {condition}
        AND DATE_FORMAT(date_of_birth, '%%m-%%d') BETWEEN %s AND %s
        ORDER BY MONTH(date_of_birth), DAY(date_of_birth)
    """
    return frappe.db.sql(query, params + [start_str, end_str], as_dict=True)


@frappe.whitelist()
def get_anniversaries_this_month(department=None):

    today = datetime.today()
    current_month = today.strftime('%m')
    current_year = today.year

    condition = "status = 'Active' AND date_of_joining IS NOT NULL"
    params = []

    if department:
        condition += " AND department = %s"
        params.append(department)

    query = f"""
        SELECT 
            employee_name AS employee,
            cell_number,
            DATE_FORMAT(date_of_joining, '%%d %%M') AS doj,
            TIMESTAMPDIFF(YEAR, date_of_joining, CURDATE()) AS years_completed
        FROM `tabEmployee`
        WHERE {condition}
        AND MONTH(date_of_joining) = %s
        ORDER BY DAY(date_of_joining)
    """
    return frappe.db.sql(query, params + [current_month], as_dict=True)

    
# Department Dashboard
@frappe.whitelist()
def get_departments():
    departments = frappe.get_all(
        "Department", 
        filters={"disabled": 0}, 
        fields=["name", "department_name"], 
        order_by="department_name ASC"
    )
    
    # Filter out the "All Departments" entry if it exists
    filtered_departments = [
        dept for dept in departments 
        if dept.get("department_name") != "All Departments"
    ]
    
    return filtered_departments


@frappe.whitelist()
def get_age_group_distribution(department=None):
    query = """
        SELECT 
            FLOOR(TIMESTAMPDIFF(YEAR, date_of_birth, CURDATE()) / 10) * 10 AS age_group,
            gender,
            COUNT(*) as count
        FROM `tabEmployee`
        WHERE status = 'Active' AND date_of_birth IS NOT NULL AND gender IS NOT NULL
    """
    params = []

    if department:
        query += " AND department = %s"
        params.append(department)

    query += " GROUP BY age_group, gender ORDER BY age_group, gender"

    raw_data = frappe.db.sql(query, params, as_dict=True)

    # Build structure: { "20-29": { "Male": 3, "Female": 2 } }
    grouped_data = {}
    total_by_group = {}

    for row in raw_data:
        age = int(row.age_group)
        label = f"{age}-{age + 9}"
        gender = row.gender
        count = row.count

        if label not in grouped_data:
            grouped_data[label] = {"Male": 0, "Female": 0}
            total_by_group[label] = 0

        grouped_data[label][gender] = count
        total_by_group[label] += count

    labels = list(grouped_data.keys())
    male_data = [grouped_data[label]["Male"] for label in labels]
    female_data = [grouped_data[label]["Female"] for label in labels]
    totals = [total_by_group[label] for label in labels]

    return {
        "labels": labels,
        "male": male_data,
        "female": female_data,
        "totals": totals
    }

@frappe.whitelist()
def get_upcoming_retirees(department=None):
    from datetime import datetime, timedelta
    from urllib.parse import unquote

    if department:
        department = unquote(department)

    query = """
        SELECT 
            e.employee_name AS employee,
            e.date_of_birth
        FROM `tabEmployee` e
        WHERE 
            e.status = 'Active'
            AND e.date_of_birth IS NOT NULL
    """
    params = []

    if department:
        query += " AND e.department = %s"
        params.append(department)

    data = frappe.db.sql(query, params, as_dict=True)

    upcoming = []
    today = datetime.today().date()

    for row in data:
        dob = row.date_of_birth
        if not dob:
            continue

        retirement_date = dob.replace(year=dob.year + 60)
        notify_date = retirement_date - timedelta(days=365)

        if today <= retirement_date <= today.replace(year=today.year + 2):
            upcoming.append({
                "employee": row.employee,
                "retirement_date": retirement_date.strftime("%d %b %Y"),
                "notify_date": notify_date.strftime("%d %b %Y")
            })

    # Sort by retirement date
    upcoming.sort(key=lambda x: datetime.strptime(x["retirement_date"], "%d %b %Y"))

    return upcoming


@frappe.whitelist()
def get_paginated_employees(department=None, search=None, page=1, page_size=10, sort_by=None, sort_dir='asc'):
    page = int(page)
    page_size = int(page_size)
    offset = (page - 1) * page_size

    filters = ["e.status = 'Active'"]
    if department:
        filters.append(f"e.department = {frappe.db.escape(department)}")
    if search:
        search = f"%{search}%"
        filters.append(
            "(" +
            " OR ".join([
                f"e.employee_name LIKE {frappe.db.escape(search)}",
                f"e.date_of_birth LIKE {frappe.db.escape(search)}",
                f"e.date_of_joining LIKE {frappe.db.escape(search)}",
                f"e.cell_number LIKE {frappe.db.escape(search)}",
                f"d.department_name LIKE {frappe.db.escape(search)}"
            ]) +
            ")"
        )

    where_clause = f"WHERE {' AND '.join(filters)}" if filters else ""

    # Whitelist valid sortable fields to prevent SQL injection
    valid_sort_columns = {
        "employee_name": "e.employee_name",
        "date_of_birth": "e.date_of_birth",
        "date_of_joining": "e.date_of_joining",
        "department": "d.department_name",
        "cell_number": "e.cell_number"
    }

    sort_column = valid_sort_columns.get(sort_by, "e.employee_name")
    sort_direction = "DESC" if sort_dir and sort_dir.lower() == "desc" else "ASC"
    order_clause = f"ORDER BY {sort_column} {sort_direction}"

    # Main query
    data = frappe.db.sql(f"""
        SELECT
            e.name,
            e.employee_name,
            DATE_FORMAT(e.date_of_birth, '%d-%m-%Y') as date_of_birth,
            DATE_FORMAT(e.date_of_joining, '%d-%m-%Y') as date_of_joining,
            d.department_name as department,
            e.cell_number
        FROM `tabEmployee` e
        LEFT JOIN `tabDepartment` d ON e.department = d.name
        {where_clause}
        {order_clause}
        LIMIT {page_size} OFFSET {offset}
    """, as_dict=True)

    # Total count for pagination
    total = frappe.db.sql(f"""
        SELECT COUNT(*) FROM `tabEmployee` e
        LEFT JOIN `tabDepartment` d ON e.department = d.name
        {where_clause}
    """)[0][0]

    return {
        "data": data,
        "total": total,
        "page": page,
        "page_size": page_size
    }

@frappe.whitelist()
def get_all_employees(department=None, search=None):
    filters = ["e.status = 'Active'"]
    if department:
        filters.append(f"e.department = {frappe.db.escape(department)}")
    if search:
        search = f"%{search}%"
        filters.append(
            "(" +
            " OR ".join([
                f"e.employee_name LIKE {frappe.db.escape(search)}",
                f"e.date_of_birth LIKE {frappe.db.escape(search)}",
                f"e.date_of_joining LIKE {frappe.db.escape(search)}",
                f"e.cell_number LIKE {frappe.db.escape(search)}",
                f"d.department_name LIKE {frappe.db.escape(search)}"
            ]) +
            ")"
        )

    where_clause = f"WHERE {' AND '.join(filters)}" if filters else ""

    data = frappe.db.sql(f"""
        SELECT
            e.name,
            e.employee_name,
            DATE_FORMAT(e.date_of_birth, '%d-%m-%Y') as date_of_birth,
            DATE_FORMAT(e.date_of_joining, '%d-%m-%Y') as date_of_joining,
            d.department_name as department,
            e.cell_number
        FROM `tabEmployee` e
        LEFT JOIN `tabDepartment` d ON e.department = d.name
        {where_clause}
        ORDER BY e.employee_name ASC
    """, as_dict=True)

    return data

@frappe.whitelist()
def get_employee_details(employee_id):
    employee = frappe.db.sql("""
        SELECT 
            e.name,
            e.employee_name,
            e.image,
            e.department,
            e.designation,
            e.date_of_joining,
            e.date_of_birth,
            e.status,
            e.custom_personal_id_number,
            e.gender,
            e.ssnit_number,
            e.custom_staff_id,
            e.employee_number,
            e.grade,
            e.current_address,
            e.permanent_address,
            e.custom_hometown,
            e.custom_hometown_region,
            e.cell_number,
            e.custom_additional_mobile_number,
            e.personal_email,
            e.person_to_be_contacted,
            e.emergency_phone_number,
            e.relation,
            e.custom_acceptance_date,
            e.assumption_of_duty,
            e.final_confirmation_date,
            e.date_of_retirement,
            e.reports_to,
            e.image,
            d.department_name AS department_name,
            r.employee_name AS reports_to_name
        FROM `tabEmployee` e
        LEFT JOIN `tabDepartment` d ON e.department = d.name
        LEFT JOIN `tabEmployee` r ON e.reports_to = r.name
        WHERE e.name = %s
        LIMIT 1
    """, (employee_id,), as_dict=True)

    if not employee:
        frappe.throw("Employee not found", frappe.DoesNotExistError)

    return employee[0]

@frappe.whitelist()
def get_work_history(employee):
    employee_doc = frappe.get_doc("Employee", employee)
    history = []

    for row in employee_doc.internal_work_history:
        duration = ""
        from_date = row.from_date
        to_date = row.to_date or datetime.strptime(nowdate(), "%Y-%m-%d")

        if from_date:
            delta = relativedelta(to_date, from_date)
            parts = []
            if delta.years:
                parts.append(f"{delta.years} year{'s' if delta.years != 1 else ''}")
            if delta.months:
                parts.append(f"{delta.months} month{'s' if delta.months != 1 else ''}")
            if delta.days:
                parts.append(f"{delta.days} day{'s' if delta.days != 1 else ''}")
            duration = " ".join(parts) or "0 days"

        department_name = frappe.db.get_value("Department", row.department, "department_name") if row.department else ""

        history.append({
            "department": department_name,
            "from_date": formatdate(from_date, "dd MMM yyyy") if from_date else "",
            "to_date": formatdate(row.to_date, "dd MMM yyyy") if row.to_date else "Present",
            "duration": duration
        })

    return history


@frappe.whitelist()
def get_leave_history(employee):
    leave_history = frappe.db.get_all(
        "Leave Application",
        filters={
            "employee": employee,
            "workflow_state": "Leave APPROVED"
        },
        fields=["leave_type", "from_date", "to_date", "total_leave_days"],
        order_by="from_date desc"
    )

    # Format dates
    for leave in leave_history:
        leave["from_date"] = formatdate(leave["from_date"], "d MMM yyyy")
        leave["to_date"] = formatdate(leave["to_date"], "d MMM yyyy")

    from hrms.hr.doctype.leave_application.leave_application import get_leave_details
    leave_details = get_leave_details(employee=employee, date=nowdate())

    leave_balances = []
    for leave_type, info in (leave_details.get("leave_allocation", {}) or {}).items():
        leave_balances.append({
            "leave_type": leave_type,
            "allocated": info.get("total_leaves", 0),
            "used": info.get("leaves_taken", 0),
            "pending": info.get("leaves_pending_approval", 0),
            "balance": info.get("remaining_leaves", 0)
        })

    return {
        "leave_history": leave_history,
        "leave_balances": leave_balances
    }

# @frappe.whitelist()
# def get_training_history(employee):
#     rows = frappe.db.sql("""
#         SELECT 
#             t.name_of_programme, t.institution, t.venue, DATE_FORMAT(t.start_date, "%%d %%b %%Y") as start_date, DATE_FORMAT(t.end_date, "%%d %%b %%Y") as end_date
#         FROM `tabTraining` t
#         INNER JOIN `tabTrainees` tr ON t.name = tr.parent
#         WHERE tr.employee = %s
#         ORDER BY t.start_date DESC
#     """, employee, as_dict=True)

#     return rows

@frappe.whitelist()
def get_training_history(employee):
    rows = frappe.db.sql("""
        SELECT 
            YEAR(t.start_date) as year,
            t.name_of_programme,
            t.institution,
            t.venue,
            DATE_FORMAT(t.start_date, "%%d %%b %%Y") as start_date,
            DATE_FORMAT(t.end_date, "%%d %%b %%Y") as end_date
        FROM `tabTraining` t
        INNER JOIN `tabTrainees` tr ON t.name = tr.parent
        WHERE tr.employee = %s
        ORDER BY year DESC, t.start_date DESC
    """, employee, as_dict=True)

    return rows


@frappe.whitelist()
def get_employees_with_excess_leave(department=None):
    # Get current year
    current_year = datetime.now().year
    year_start = f"{current_year}-01-01"
    year_end = f"{current_year}-12-31"

    # Base query params
    query_params = {
        "year_start": year_start,
        "year_end": year_end,
    }

    # Base allocation query
    allocation_query = """
        SELECT 
            emp.name as employee,
            emp.employee_name,
            emp.department,
            dept.department_name,
            la.leave_type,
            la.total_leaves_allocated
        FROM 
            `tabEmployee` emp
        JOIN 
            `tabLeave Allocation` la ON la.employee = emp.name
        LEFT JOIN 
            `tabDepartment` dept ON emp.department = dept.name
        WHERE 
            emp.status = 'Active'
            AND la.docstatus = 1
            AND la.leave_type IN ('Annual Leave - JD', 'Annual Leave - SD')
            AND la.from_date <= %(year_end)s AND la.to_date >= %(year_start)s
    """

    if department:
        allocation_query += " AND emp.department = %(department)s"
        query_params["department"] = department

    allocations = frappe.db.sql(allocation_query, query_params, as_dict=True)

    if not allocations:
        return []

    employee_names = list({alloc['employee'] for alloc in allocations})
    if not employee_names:
        return []

    application_query = """
        SELECT 
            employee,
            leave_type,
            SUM(total_leave_days) as leaves_taken
        FROM 
            `tabLeave Application`
        WHERE 
            docstatus = 1
            AND status = 'Approved'
            AND employee IN %(employees)s
            AND leave_type IN ('Annual Leave - JD', 'Annual Leave - SD')
            AND (
                (YEAR(from_date) = %(current_year)s) OR
                (YEAR(to_date) = %(current_year)s)
            )
        GROUP BY 
            employee, leave_type
    """

    leave_taken = frappe.db.sql(application_query, {
        "current_year": current_year,
        "employees": employee_names
    }, as_dict=True)

    taken_dict = {(app['employee'], app['leave_type']): (app['leaves_taken'] or 0) for app in leave_taken}

    result = []
    excess_limits = {
        "Annual Leave - JD": 28,
        "Annual Leave - SD": 36
    }

    for alloc in allocations:
        leave_type = alloc['leave_type']
        max_allowed = excess_limits[leave_type]
        leaves_taken = taken_dict.get((alloc['employee'], leave_type), 0)
        remaining_leaves = float(alloc['total_leaves_allocated']) - float(leaves_taken)

        if remaining_leaves > max_allowed:
            result.append({
                "employee_name": alloc['employee_name'],
                "remaining_leaves": remaining_leaves,
                "department_name": alloc.get('department_name') or alloc['department']
            })

    result.sort(key=lambda x: x["remaining_leaves"], reverse=True)
    return result

@frappe.whitelist()
def get_experience_bins(department=None):
    from frappe.utils import nowdate
    from datetime import datetime
    from dateutil.relativedelta import relativedelta

    filters = {"status": "Active"}
    if department:
        filters["department"] = department

    employees = frappe.db.get_all("Employee", filters=filters, fields=["name", "date_of_joining", "gender"])
    now = datetime.strptime(nowdate(), "%Y-%m-%d")

    bins = ["0–2", "3–6", "7–10", "11–15", "16–20", "21–25", "26+"]
    male_counts = dict.fromkeys(bins, 0)
    female_counts = dict.fromkeys(bins, 0)
    total_years = dict.fromkeys(bins, 0.0)
    total_counts = dict.fromkeys(bins, 0)

    def get_bin(years):
        if years <= 2:
            return "0–2"
        elif years <= 6:
            return "3–6"
        elif years <= 10:
            return "7–10"
        elif years <= 15:
            return "11–15"
        elif years <= 20:
            return "16–20"
        elif years <= 25:
            return "21–25"
        else:
            return "26+"

    for emp in employees:
        if not emp.date_of_joining:
            continue
        years = relativedelta(now, emp.date_of_joining).years
        bin_label = get_bin(years)
        gender = (emp.gender or "").lower()

        if gender == "male":
            male_counts[bin_label] += 1
        elif gender == "female":
            female_counts[bin_label] += 1

        total_years[bin_label] += years
        total_counts[bin_label] += 1

    avg_years = [
        round(total_years[b] / total_counts[b], 1) if total_counts[b] else 0 for b in bins
    ]

    return {
        "labels": bins,
        "male": [male_counts[b] for b in bins],
        "female": [female_counts[b] for b in bins],
        "average": avg_years
    }

@frappe.whitelist()
def get_training_coverage(department=None):
    condition = "1=1"
    params = {}

    if department:
        condition = "e.department = %(department)s"
        params["department"] = department

    trained = frappe.db.sql(f"""
        SELECT 
            d.department_name,
            COUNT(DISTINCT tr.employee) AS trained_count
        FROM `tabTrainees` tr
        JOIN `tabTraining` t ON tr.parent = t.name
        JOIN `tabEmployee` e ON tr.employee = e.name
        LEFT JOIN `tabDepartment` d ON e.department = d.name
        WHERE {condition}
        GROUP BY d.department_name
    """, params, as_dict=True)

    total = frappe.db.sql(f"""
        SELECT 
            d.department_name,
            COUNT(*) AS total_count
        FROM `tabEmployee` e
        LEFT JOIN `tabDepartment` d ON e.department = d.name
        WHERE e.status = 'Active'
        {f"AND e.department = %(department)s" if department else ""}
        GROUP BY d.department_name
    """, params, as_dict=True)

    coverage = {}
    for row in total:
        dept_name = row["department_name"] or "Unknown"
        coverage[dept_name] = {"total": row["total_count"], "trained": 0}

    for row in trained:
        dept_name = row["department_name"] or "Unknown"
        if dept_name in coverage:
            coverage[dept_name]["trained"] = row["trained_count"]

    labels = list(coverage.keys())
    trained_vals = [coverage[d]["trained"] for d in labels]
    untrained_vals = [coverage[d]["total"] - coverage[d]["trained"] for d in labels]

    return {
        "labels": labels,
        "trained": trained_vals,
        "untrained": untrained_vals
    }



@frappe.whitelist()
def get_employees_missing_documents(department=None):
    filters = {"status": "Active"}
    if department:
        filters["department"] = department

    employees = frappe.db.sql("""
        SELECT 
            e.employee_name,
            d.department_name,
            e.custom_personal_id_number,
            e.person_to_be_contacted,
            e.emergency_phone_number
        FROM `tabEmployee` e
        LEFT JOIN `tabDepartment` d ON e.department = d.name
        WHERE e.status = 'Active'
        {condition}
    """.format(condition="AND e.department = %(department)s" if department else ""), {"department": department} if department else {}, as_dict=True)

    missing = []
    for emp in employees:
        gaps = []
        if not emp.custom_personal_id_number:
            gaps.append("Ghanacard")
        if not emp.person_to_be_contacted or not emp.emergency_phone_number:
            gaps.append("Emergency Contact")

        if gaps:
            missing.append({
                "employee_name": emp.employee_name,
                "department": emp.department_name,
                "missing": ", ".join(gaps)
            })

    return missing


@frappe.whitelist()
def get_employees_on_probation(department=None):
    filters = {
        "status": "Active",
        "final_confirmation_date": ["is", "not set"]
    }
    if department:
        filters["department"] = department

    employees = frappe.db.sql("""
        SELECT 
            e.employee_name,
            d.department_name,
            e.date_of_joining
        FROM `tabEmployee` e
        LEFT JOIN `tabDepartment` d ON e.department = d.name
        WHERE e.status = 'Active' AND e.final_confirmation_date IS NULL
        {condition}
    """.format(condition="AND e.department = %(department)s" if department else ""), {"department": department} if department else {}, as_dict=True)

    return employees
