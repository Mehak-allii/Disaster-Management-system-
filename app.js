const API_BASE = "/api";
const state = {
  token: localStorage.getItem("disasterMisToken") || "",
  user: JSON.parse(localStorage.getItem("disasterMisUser") || "null"),
  view: "dashboard",
  cache: {},
  drawer: null,
  notice: null,
  sidebarOpen: false
};

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: "D" },
  { id: "incidents", label: "Incidents", icon: "I" },
  { id: "rescue", label: "Rescue", icon: "R" },
  { id: "resources", label: "Resources", icon: "S" },
  { id: "hospitals", label: "Hospitals", icon: "H" },
  { id: "finance", label: "Finance", icon: "F", permission: "MANAGE_FINANCE" },
  { id: "approvals", label: "Approvals", icon: "A" },
  { id: "admin", label: "Admin", icon: "U", role: "Administrator" }
];

const app = document.getElementById("app");

function hasPermission(permission) {
  return state.user?.permissions?.includes(permission) || hasRole("Administrator");
}

function hasRole(role) {
  return state.user?.roles?.includes(role);
}

function visibleNavItems() {
  return navItems.filter((item) => {
    if (item.role && !hasRole(item.role)) return false;
    if (item.permission && !hasPermission(item.permission)) return false;
    return true;
  });
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function pretty(value) {
  if (value === null || value === undefined || value === "") return "-";
  if (typeof value === "number") return Number.isInteger(value) ? value : value.toLocaleString(undefined, { maximumFractionDigits: 2 });
  if (typeof value === "string" && value.includes("T")) {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) return date.toLocaleString();
  }
  return String(value).replaceAll("_", " ");
}

function money(value) {
  const amount = Number(value || 0);
  return amount.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

function badge(value) {
  const key = String(value ?? "").toLowerCase().replaceAll(" ", "-");
  return `<span class="badge ${escapeHtml(key)}">${escapeHtml(pretty(value))}</span>`;
}

function notify(message, type = "success") {
  state.notice = { message, type };
  render();
  setTimeout(() => {
    state.notice = null;
    render();
  }, 3600);
}

async function api(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (state.token) headers.Authorization = `Bearer ${state.token}`;

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    body: options.body && typeof options.body !== "string" ? JSON.stringify(options.body) : options.body
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : {};
  if (!response.ok || data.success === false) {
    throw new Error(data.message || `Request failed (${response.status})`);
  }
  return data;
}

async function load(key, path) {
  try {
    state.cache[key] = { loading: true, data: state.cache[key]?.data || [] };
    render();
    const result = await api(path);
    state.cache[key] = { loading: false, data: result.data || result.user || result };
    render();
  } catch (error) {
    state.cache[key] = { loading: false, error: error.message, data: state.cache[key]?.data || [] };
    render();
  }
}

function getData(key, fallback = []) {
  const entry = state.cache[key];
  if (!entry || entry.loading) return fallback;
  return entry.data || fallback;
}

function initViewData() {
  if (!state.token) return;
  const loaders = {
    dashboard: [
      ["active", "/emergency/active-dashboard"],
      ["stats", "/emergency/stats"],
      ["lowStock", "/resources/low-stock"],
      ["hospitals", "/hospitals"],
      ["teams", "/rescue/teams"],
      ["notifications", "/admin/notifications"]
    ],
    incidents: [
      ["reports", "/emergency"],
      ["disasterTypes", "/emergency/disaster-types"]
    ],
    rescue: [
      ["teams", "/rescue/teams"],
      ["reports", "/emergency?status=pending"]
    ],
    resources: [
      ["resources", "/resources"],
      ["inventory", "/resources/inventory"],
      ["warehouses", "/resources/warehouses"],
      ["requests", "/resources/requests"],
      ["lowStock", "/resources/low-stock"]
    ],
    hospitals: [
      ["hospitals", "/hospitals"],
      ["bestHospitals", "/hospitals/best-available"]
    ],
    finance: [
      ["transactions", "/finance/transactions"],
      ["budget", "/finance/budget"],
      ["financeSummary", "/finance/summary"]
    ],
    approvals: [["approvals", "/approvals"]],
    admin: [
      ["users", "/admin/users"],
      ["roles", "/admin/roles"],
      ["audit", "/admin/audit-logs"],
      ["mis", "/admin/mis-report"]
    ]
  };

  (loaders[state.view] || []).forEach(([key, path]) => {
    if (!state.cache[key]) load(key, path);
  });
}

function table(rows, columns, emptyText = "No records found") {
  if (!rows?.length) return `<div class="empty">${emptyText}</div>`;
  return `
    <div class="table-wrap">
      <table>
        <thead><tr>${columns.map((col) => `<th>${escapeHtml(col.label)}</th>`).join("")}</tr></thead>
        <tbody>
          ${rows.map((row) => `<tr>${columns.map((col) => `<td>${col.render ? col.render(row) : escapeHtml(pretty(row[col.key]))}</td>`).join("")}</tr>`).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function authPage() {
  return `
    <main class="auth-page">
      <section class="auth-panel">
        <div class="brand">
          <div class="brand-mark">MIS</div>
          <div>Smart Disaster Response</div>
        </div>
        <div class="compact">
          <h1>Command center for disaster response.</h1>
          <p class="subtitle">Coordinate reports, rescue teams, warehouse stock, hospitals, finances, approvals, and audit visibility from one protected interface.</p>
        </div>
        <form class="form" data-action="login">
          <label class="field">
            <span>Email</span>
            <input name="email" type="email" autocomplete="email" required>
          </label>
          <label class="field">
            <span>Password</span>
            <input name="password" type="password" autocomplete="current-password" required>
          </label>
          ${state.notice ? `<div class="notice ${state.notice.type}">${escapeHtml(state.notice.message)}</div>` : ""}
          <button class="btn" type="submit">Sign in</button>
        </form>
      </section>
      <section class="auth-visual">
        <div class="compact">
          <h1>Live operations, accountable decisions.</h1>
        </div>
      </section>
    </main>
  `;
}

function shell() {
  const active = navItems.find((item) => item.id === state.view) || navItems[0];
  return `
    <div class="app-shell">
      <aside class="sidebar ${state.sidebarOpen ? "open" : ""}">
        <div class="brand">
          <div class="brand-mark">MIS</div>
          <div>Disaster Response</div>
        </div>
        <nav class="nav">
          ${visibleNavItems().map((item) => `
            <button class="${state.view === item.id ? "active" : ""}" data-view="${item.id}">
              <span class="nav-icon">${item.icon}</span>
              <span>${item.label}</span>
            </button>
          `).join("")}
        </nav>
        <div class="user-card">
          <div>
            <strong>${escapeHtml(state.user.firstName)} ${escapeHtml(state.user.lastName)}</strong>
            <p class="subtitle">${escapeHtml(state.user.email)}</p>
          </div>
          <div class="role-list">${state.user.roles.map((role) => `<span class="badge">${escapeHtml(role)}</span>`).join("")}</div>
          <button class="btn secondary" data-action="logout">Sign out</button>
        </div>
      </aside>
      <main class="main">
        <header class="topbar">
          <div class="toolbar">
            <button class="btn secondary mobile-menu" data-action="toggle-menu">Menu</button>
            <div>
              <h2>${active.label}</h2>
              <p class="subtitle">${topbarSubtitle(active.id)}</p>
            </div>
          </div>
          <button class="btn ghost" data-action="refresh">Refresh</button>
        </header>
        <section class="content">
          ${state.notice ? `<div class="notice ${state.notice.type}">${escapeHtml(state.notice.message)}</div>` : ""}
          ${viewContent()}
        </section>
      </main>
      ${drawer()}
    </div>
  `;
}

function topbarSubtitle(view) {
  const copy = {
    dashboard: "Operational pulse across emergencies, stock, teams, hospitals, and notifications.",
    incidents: "Emergency reports, severity queue, field submission, and status changes.",
    rescue: "Team availability, nearest-team dispatch, and assignment control.",
    resources: "Inventory, warehouses, low-stock alerts, requests, and allocations.",
    hospitals: "Capacity, admissions, recommended hospitals, and patient lookups.",
    finance: "Budgets, transactions, donations, expenses, and procurement.",
    approvals: "Pending requests, decisions, comments, and approval history.",
    admin: "Users, roles, audit activity, and MIS reporting."
  };
  return copy[view] || "";
}

function statCard(label, value, hint) {
  return `<article class="card stat"><span class="table-label">${label}</span><span class="stat-value">${escapeHtml(value)}</span><small>${escapeHtml(hint || "")}</small></article>`;
}

function viewContent() {
  const views = {
    dashboard: dashboardView,
    incidents: incidentsView,
    rescue: rescueView,
    resources: resourcesView,
    hospitals: hospitalsView,
    finance: financeView,
    approvals: approvalsView,
    admin: adminView
  };
  return (views[state.view] || dashboardView)();
}

function dashboardView() {
  const active = getData("active");
  const stats = getData("stats");
  const lowStock = getData("lowStock");
  const hospitals = getData("hospitals");
  const teams = getData("teams");
  const notifications = getData("notifications");
  const availableTeams = teams.filter((team) => team.availability_status === "available").length;
  const beds = hospitals.reduce((sum, h) => sum + Number(h.available_beds || 0), 0);

  return `
    <div class="grid stats">
      ${statCard("Active reports", active.length, "From active emergency view")}
      ${statCard("Low stock", lowStock.length, "Warehouse thresholds")}
      ${statCard("Available teams", availableTeams, `${teams.length} teams tracked`)}
      ${statCard("Open beds", beds, "Hospital capacity")}
    </div>
    <div class="grid two">
      <section class="card">
        <div class="section-head"><h3>Active Emergencies</h3><button class="btn secondary" data-view="incidents">Open</button></div>
        ${table(active.slice(0, 8), [
          { label: "Report", key: "report_id" },
          { label: "Type", key: "disaster_type" },
          { label: "Severity", render: (r) => badge(r.severity_level) },
          { label: "Status", render: (r) => badge(r.status) },
          { label: "Location", key: "address" }
        ])}
      </section>
      <section class="card">
        <div class="section-head"><h3>Notifications</h3><button class="btn secondary" data-action="refresh">Reload</button></div>
        ${table(notifications.slice(0, 8), [
          { label: "Message", key: "message" },
          { label: "Type", key: "type" },
          { label: "Created", key: "created_at" },
          { label: "State", render: (r) => badge(r.is_read ? "read" : "unread") }
        ], "No notifications")}
      </section>
    </div>
    <section class="card">
      <div class="section-head"><h3>Incident Analytics</h3></div>
      ${table(stats, [
        { label: "Disaster", key: "disaster_type" },
        { label: "Severity", render: (r) => badge(r.severity_level) },
        { label: "Total", key: "total" },
        { label: "Resolved", key: "resolved" },
        { label: "Pending", key: "pending" },
        { label: "Avg hours", key: "avg_resolution_hours" }
      ])}
    </section>
  `;
}

function incidentsView() {
  const reports = getData("reports");
  return `
    <div class="section-head">
      <div><h3>Emergency Reports</h3><p class="subtitle">Critical reports stay at the top of the response queue.</p></div>
      <button class="btn" data-drawer="incident">New report</button>
    </div>
    <section class="card">
      ${table(reports, [
        { label: "ID", key: "report_id" },
        { label: "Type", key: "disaster_type" },
        { label: "Severity", render: (r) => badge(r.severity_level) },
        { label: "Status", render: (r) => badge(r.status) },
        { label: "Reported by", key: "reported_by" },
        { label: "Address", key: "address" },
        { label: "Actions", render: (r) => `
          <div class="actions">
            ${hasPermission("VIEW_ALL_REPORTS") ? `<button class="btn secondary" data-drawer="status" data-id="${r.report_id}">Status</button>` : ""}
            <button class="btn ghost" data-drawer="nearest" data-id="${r.report_id}">Teams</button>
          </div>` }
      ])}
    </section>
  `;
}

function rescueView() {
  const teams = getData("teams");
  const pending = getData("reports");
  return `
    <div class="grid stats">
      ${statCard("Teams", teams.length, "All rescue units")}
      ${statCard("Available", teams.filter((team) => team.availability_status === "available").length, "Ready for assignment")}
      ${statCard("Assigned", teams.filter((team) => team.availability_status === "assigned").length, "Currently dispatched")}
      ${statCard("Pending reports", pending.length, "Waiting for dispatch")}
    </div>
    <section class="card">
      <div class="section-head"><h3>Rescue Teams</h3>${hasPermission("ASSIGN_TEAM") ? `<button class="btn" data-drawer="assign">Assign team</button>` : ""}</div>
      ${table(teams, [
        { label: "Team", key: "team_name" },
        { label: "Type", key: "team_type" },
        { label: "Status", render: (r) => badge(r.availability_status) },
        { label: "Capacity", key: "max_capacity" },
        { label: "Contact", key: "contact_number" },
        { label: "Assignments", key: "total_assignments" },
        { label: "Actions", render: (r) => `<button class="btn ghost" data-drawer="teamHistory" data-id="${r.team_id}">History</button>` }
      ])}
    </section>
  `;
}

function resourcesView() {
  const resources = getData("resources");
  const inventory = getData("inventory");
  const warehouses = getData("warehouses");
  const requests = getData("requests");
  const lowStock = getData("lowStock");
  return `
    <div class="grid stats">
      ${statCard("Resources", resources.length, "Catalog items")}
      ${statCard("Inventory rows", inventory.length, "Warehouse stock")}
      ${statCard("Warehouses", warehouses.length, "Managed locations")}
      ${statCard("Low stock", lowStock.length, "Threshold alerts")}
    </div>
    <div class="toolbar">
      ${hasPermission("SUBMIT_REPORT") ? `<button class="btn" data-drawer="resourceRequest">Request resources</button>` : ""}
      ${hasPermission("MANAGE_INVENTORY") ? `<button class="btn secondary" data-drawer="inventory">Update inventory</button>` : ""}
      ${hasPermission("APPROVE_RESOURCE_REQ") ? `<button class="btn secondary" data-drawer="allocate">Allocate</button>` : ""}
    </div>
    <section class="card">
      <div class="section-head"><h3>Inventory</h3></div>
      ${table(inventory, [
        { label: "Resource", key: "resource_name" },
        { label: "Type", key: "resource_type" },
        { label: "Warehouse", key: "warehouse" },
        { label: "Qty", key: "quantity" },
        { label: "Threshold", key: "threshold" },
        { label: "Status", render: (r) => badge(r.stock_status || "ok") }
      ])}
    </section>
    <section class="card">
      <div class="section-head"><h3>Resource Requests</h3></div>
      ${table(requests, [
        { label: "ID", key: "request_id" },
        { label: "Priority", render: (r) => badge(r.priority_level) },
        { label: "Status", render: (r) => badge(r.status) },
        { label: "Requested by", key: "requested_by" },
        { label: "Incident", key: "incident_address" },
        { label: "Created", key: "created_at" }
      ])}
    </section>
  `;
}

function hospitalsView() {
  const hospitals = getData("hospitals");
  const best = getData("bestHospitals");
  return `
    <div class="section-head">
      <div><h3>Hospital Capacity</h3><p class="subtitle">Capacity view is sorted by occupancy pressure.</p></div>
      ${hasPermission("ASSIGN_TEAM") ? `<button class="btn" data-drawer="admit">Admit patient</button>` : ""}
    </div>
    <div class="grid two">
      <section class="card">
        <h3>Recommended Hospitals</h3>
        ${table(best, [
          { label: "Hospital", key: "name" },
          { label: "Location", key: "location" },
          { label: "Type", key: "hospital_type" },
          { label: "Beds", key: "available_beds" }
        ], "No available hospitals")}
      </section>
      <section class="card">
        <h3>Capacity</h3>
        ${table(hospitals, [
          { label: "Hospital", key: "name" },
          { label: "Location", key: "location" },
          { label: "Available", key: "available_beds" },
          { label: "Total", key: "total_beds" },
          { label: "Occupancy", render: (r) => `${escapeHtml(pretty(r.occupancy_pct))}%` },
          { label: "Actions", render: (r) => `<button class="btn ghost" data-drawer="patients" data-id="${r.hospital_id}">Patients</button>` }
        ])}
      </section>
    </div>
  `;
}

function financeView() {
  const transactions = getData("transactions");
  const budget = getData("budget");
  const summary = getData("financeSummary");
  return `
    <div class="toolbar">
      <button class="btn" data-drawer="donation">Donation</button>
      <button class="btn secondary" data-drawer="expense">Expense</button>
      <button class="btn secondary" data-drawer="procurement">Procurement</button>
    </div>
    <div class="grid stats">
      ${statCard("Transactions", transactions.length, "Recent finance rows")}
      ${statCard("Allocated", money(budget.reduce((sum, row) => sum + Number(row.allocated_amount || 0), 0)), "All budgets")}
      ${statCard("Used", money(budget.reduce((sum, row) => sum + Number(row.used_amount || 0), 0)), "Tracked spend")}
      ${statCard("Budget lines", budget.length, "By disaster")}
    </div>
    <section class="card">
      <div class="section-head"><h3>Financial Summary</h3></div>
      ${table(summary, [
        { label: "Disaster", key: "disaster_type" },
        { label: "Year", key: "fiscal_year" },
        { label: "Allocated", render: (r) => money(r.allocated_amount) },
        { label: "Used", render: (r) => money(r.used_amount) },
        { label: "Remaining", render: (r) => money(r.remaining_budget) },
        { label: "Utilization", render: (r) => `${escapeHtml(pretty(r.utilization_pct))}%` }
      ])}
    </section>
    <section class="card">
      <div class="section-head"><h3>Transactions</h3></div>
      ${table(transactions, [
        { label: "ID", key: "transaction_id" },
        { label: "Type", render: (r) => badge(r.type) },
        { label: "Status", render: (r) => badge(r.status) },
        { label: "Amount", render: (r) => money(r.amount) },
        { label: "Reference", key: "reference_number" },
        { label: "Time", key: "timestamp" }
      ])}
    </section>
  `;
}

function approvalsView() {
  const approvals = getData("approvals");
  return `
    <div class="section-head">
      <div><h3>Approvals</h3><p class="subtitle">Resource requests move through approval history before allocation.</p></div>
      <button class="btn" data-drawer="submitApproval">Submit</button>
    </div>
    <section class="card">
      ${table(approvals, [
        { label: "ID", key: "approval_id" },
        { label: "Type", key: "request_type" },
        { label: "Request", key: "request_id" },
        { label: "Priority", render: (r) => badge(r.priority_level) },
        { label: "Status", render: (r) => badge(r.status) },
        { label: "Requested by", key: "requested_by" },
        { label: "Actions", render: (r) => `
          <div class="actions">
            <button class="btn ghost" data-drawer="approvalHistory" data-id="${r.approval_id}">History</button>
            ${hasPermission("APPROVE_RESOURCE_REQ") && r.status === "pending" ? `<button class="btn secondary" data-drawer="approve" data-id="${r.approval_id}">Decide</button>` : ""}
          </div>` }
      ])}
    </section>
  `;
}

function adminView() {
  const users = getData("users");
  const roles = getData("roles");
  const audit = getData("audit");
  const mis = getData("mis", {});
  return `
    <div class="grid stats">
      ${statCard("Users", users.length, "Registered accounts")}
      ${statCard("Roles", roles.length, "Permission groups")}
      ${statCard("Audit rows", audit.length, "Last 24 hours")}
      ${statCard("Regions", mis.incidentsByRegion?.length || 0, "MIS report")}
    </div>
    <section class="card">
      <div class="section-head"><h3>Users</h3><button class="btn" data-drawer="user">Register user</button></div>
      ${table(users, [
        { label: "Name", key: "full_name" },
        { label: "Email", key: "email" },
        { label: "Roles", key: "roles" },
        { label: "Status", render: (r) => badge(r.status) },
        { label: "Last login", key: "last_login" },
        { label: "Actions", render: (r) => `<button class="btn ghost" data-drawer="userStatus" data-id="${r.user_id}">Status</button>` }
      ])}
    </section>
    <section class="card">
      <div class="section-head"><h3>Audit Logs</h3></div>
      ${table(audit, [
        { label: "Entity", key: "entity_name" },
        { label: "ID", key: "entity_id" },
        { label: "Action", render: (r) => badge(r.action) },
        { label: "By", key: "performed_by" },
        { label: "IP", key: "ip_address" },
        { label: "Time", key: "timestamp" }
      ])}
    </section>
  `;
}

function drawer() {
  if (!state.drawer) return "";
  return `
    <div class="drawer open">
      <div class="drawer-backdrop" data-action="close-drawer"></div>
      <aside class="drawer-panel">
        ${drawerContent(state.drawer)}
      </aside>
    </div>
  `;
}

function formField(name, label, type = "text", required = false, options = "") {
  return `<label class="field"><span>${label}</span><input name="${name}" type="${type}" ${required ? "required" : ""} ${options}></label>`;
}

function selectField(name, label, values, required = false) {
  return `
    <label class="field">
      <span>${label}</span>
      <select name="${name}" ${required ? "required" : ""}>
        ${values.map((item) => `<option value="${escapeHtml(item.value)}">${escapeHtml(item.label)}</option>`).join("")}
      </select>
    </label>
  `;
}

function drawerHeader(title) {
  return `<div class="section-head"><h2>${title}</h2><button class="btn secondary" data-action="close-drawer">Close</button></div>`;
}

function drawerContent(drawerState) {
  const id = drawerState.id;
  const reportOptions = getData("reports").map((r) => ({ value: r.report_id, label: `#${r.report_id} ${r.address || r.disaster_type || ""}` }));
  const teamOptions = getData("teams").filter((t) => t.availability_status === "available").map((t) => ({ value: t.team_id, label: `${t.team_name} (${t.team_type})` }));
  const resourceOptions = getData("resources").map((r) => ({ value: r.resource_id, label: `${r.name} (${r.type})` }));
  const warehouseOptions = getData("warehouses").map((w) => ({ value: w.warehouse_id, label: w.location }));
  const requestOptions = getData("requests").map((r) => ({ value: r.request_id, label: `#${r.request_id} ${r.priority_level} ${r.status}` }));
  const hospitalOptions = getData("hospitals").map((h) => ({ value: h.hospital_id, label: `${h.name} (${h.available_beds || 0} beds)` }));
  const disasterTypeOptions = getData("disasterTypes").map((d) => ({ value: d.disaster_id, label: d.name }));
  const roleOptions = getData("roles").map((r) => ({ value: r.role_id, label: r.role_name }));

  const forms = {
    incident: `
      ${drawerHeader("New report")}
      <form class="form" data-action="create-incident">
        ${selectField("disasterId", "Disaster type", disasterTypeOptions, true)}
        ${selectField("severityLevel", "Severity", ["low", "medium", "high", "critical"].map((v) => ({ value: v, label: v })), true)}
        ${formField("latitude", "Latitude", "number", true, "step='0.0000001'")}
        ${formField("longitude", "Longitude", "number", true, "step='0.0000001'")}
        <label class="field"><span>Address</span><textarea name="address"></textarea></label>
        <button class="btn" type="submit">Submit report</button>
      </form>
    `,
    status: `
      ${drawerHeader("Update status")}
      <form class="form" data-action="update-report-status" data-id="${drawerState.recordId}">
        ${selectField("status", "Status", ["pending", "assigned", "in_progress", "resolved", "closed"].map((v) => ({ value: v, label: v })), true)}
        <button class="btn" type="submit">Save status</button>
      </form>
    `,
    nearest: `
      ${drawerHeader("Nearest teams")}
      <div data-load-nearest="${drawerState.recordId}">${nearestTeamsContent(drawerState.recordId)}</div>
    `,
    assign: `
      ${drawerHeader("Assign team")}
      <form class="form" data-action="assign-team">
        ${selectField("reportId", "Report", reportOptions, true)}
        ${selectField("teamId", "Team", teamOptions, true)}
        <label class="field"><span>Notes</span><textarea name="notes"></textarea></label>
        <button class="btn" type="submit">Assign</button>
      </form>
    `,
    teamHistory: `${drawerHeader("Team history")}${historyContent("teamHistory", drawerState.recordId)}`,
    resourceRequest: `
      ${drawerHeader("Request resources")}
      <form class="form" data-action="resource-request">
        ${selectField("priorityLevel", "Priority", ["low", "medium", "high", "critical"].map((v) => ({ value: v, label: v })), true)}
        ${selectField("reportId", "Related report", [{ value: "", label: "None" }, ...reportOptions])}
        <button class="btn" type="submit">Create request</button>
      </form>
    `,
    inventory: `
      ${drawerHeader("Update inventory")}
      <form class="form" data-action="update-inventory">
        ${selectField("resourceId", "Resource", resourceOptions, true)}
        ${selectField("warehouseId", "Warehouse", warehouseOptions, true)}
        ${formField("quantity", "Quantity", "number", true, "min='0'")}
        ${formField("threshold", "Threshold", "number", false, "min='0'")}
        <button class="btn" type="submit">Update stock</button>
      </form>
    `,
    allocate: `
      ${drawerHeader("Allocate resources")}
      <form class="form" data-action="allocate-resource">
        ${selectField("requestId", "Request", requestOptions, true)}
        ${selectField("resourceId", "Resource", resourceOptions, true)}
        ${selectField("warehouseId", "Warehouse", warehouseOptions, true)}
        ${formField("quantity", "Quantity", "number", true, "min='1'")}
        <button class="btn" type="submit">Allocate</button>
      </form>
    `,
    admit: `
      ${drawerHeader("Admit patient")}
      <form class="form" data-action="admit-patient">
        ${formField("name", "Patient name", "text", true)}
        ${selectField("condition", "Condition", ["stable", "serious", "critical", "recovering"].map((v) => ({ value: v, label: v })), true)}
        ${formField("bloodType", "Blood type")}
        ${formField("emergencyContact", "Emergency contact")}
        ${selectField("hospitalId", "Hospital", hospitalOptions, true)}
        <button class="btn" type="submit">Admit</button>
      </form>
    `,
    patients: `${drawerHeader("Patients")}${historyContent("patients", drawerState.recordId)}`,
    donation: financeForm("donation"),
    expense: financeForm("expense"),
    procurement: financeForm("procurement"),
    submitApproval: `
      ${drawerHeader("Submit approval")}
      <form class="form" data-action="submit-approval">
        ${selectField("requestType", "Request type", [{ value: "resource", label: "Resource" }], true)}
        ${selectField("requestId", "Request", requestOptions, true)}
        <button class="btn" type="submit">Submit</button>
      </form>
    `,
    approve: `
      ${drawerHeader("Approval decision")}
      <form class="form" data-action="decide-approval" data-id="${drawerState.recordId}">
        ${selectField("decision", "Decision", [{ value: "approve", label: "Approve" }, { value: "reject", label: "Reject" }], true)}
        <label class="field"><span>Comments</span><textarea name="comments"></textarea></label>
        <button class="btn" type="submit">Save decision</button>
      </form>
    `,
    approvalHistory: `${drawerHeader("Approval history")}${historyContent("approvalHistory", drawerState.recordId)}`,
    user: `
      ${drawerHeader("Register user")}
      <form class="form" data-action="register-user">
        ${formField("firstName", "First name", "text", true)}
        ${formField("lastName", "Last name", "text", true)}
        ${formField("email", "Email", "email", true)}
        ${formField("password", "Password", "password", true)}
        ${formField("phone", "Phone")}
        ${selectField("roleId", "Role", roleOptions, true)}
        <button class="btn" type="submit">Create user</button>
      </form>
    `,
    userStatus: `
      ${drawerHeader("User status")}
      <form class="form" data-action="user-status" data-id="${drawerState.recordId}">
        ${selectField("status", "Status", ["active", "inactive", "locked"].map((v) => ({ value: v, label: v })), true)}
        <button class="btn" type="submit">Update user</button>
      </form>
    `
  };

  return forms[id] || drawerHeader("Action");
}

function financeForm(type) {
  const titles = { donation: "Record donation", expense: "Record expense", procurement: "Record procurement" };
  const body = {
    donation: `
      ${formField("amount", "Amount", "number", true, "min='1' step='0.01'")}
      ${formField("donorName", "Donor name", "text", true)}
      ${selectField("donorType", "Donor type", ["individual", "organization", "government", "ngo"].map((v) => ({ value: v, label: v })), true)}
      ${formField("disasterId", "Disaster ID", "number")}
      ${formField("referenceNumber", "Reference number")}
    `,
    expense: `
      ${formField("amount", "Amount", "number", true, "min='1' step='0.01'")}
      ${formField("expenseType", "Expense type", "text", true)}
      ${formField("reportId", "Report ID", "number")}
      ${formField("referenceNumber", "Reference number")}
      <label class="field"><span>Description</span><textarea name="description"></textarea></label>
    `,
    procurement: `
      ${formField("amount", "Amount", "number", true, "min='1' step='0.01'")}
      ${formField("supplierName", "Supplier name", "text", true)}
      ${formField("procurementType", "Procurement type", "text", true)}
      ${formField("deliveryDate", "Delivery date", "date")}
      ${formField("resourceId", "Resource ID", "number")}
      ${formField("referenceNumber", "Reference number")}
    `
  };
  return `${drawerHeader(titles[type])}<form class="form" data-action="finance-${type}">${body[type]}<button class="btn" type="submit">Save</button></form>`;
}

function nearestTeamsContent(reportId) {
  const key = `nearest:${reportId}`;
  if (!state.cache[key]) {
    load(key, `/rescue/nearest/${reportId}`);
    return `<div class="notice">Loading nearest teams...</div>`;
  }
  return table(getData(key), [
    { label: "Team", key: "team_name" },
    { label: "Type", key: "team_type" },
    { label: "Distance", render: (r) => `${escapeHtml(pretty(r.distance_km))} km` },
    { label: "Status", render: (r) => badge(r.availability_status) },
    { label: "Contact", key: "contact_number" }
  ], "No available teams");
}

function historyContent(kind, id) {
  const paths = {
    teamHistory: `/rescue/history/${id}`,
    patients: `/hospitals/${id}/patients`,
    approvalHistory: `/approvals/${id}/history`
  };
  const key = `${kind}:${id}`;
  if (!state.cache[key]) {
    load(key, paths[kind]);
    return `<div class="notice">Loading...</div>`;
  }
  const rows = getData(key);
  if (kind === "patients") {
    return table(rows, [
      { label: "Name", key: "name" },
      { label: "Condition", render: (r) => badge(r.condition) },
      { label: "Status", render: (r) => badge(r.status) },
      { label: "Blood", key: "blood_type" },
      { label: "Admitted", key: "admitted_time" }
    ], "No patients");
  }
  if (kind === "approvalHistory") {
    return table(rows, [
      { label: "Action", render: (r) => badge(r.action) },
      { label: "By", key: "performed_by" },
      { label: "Time", key: "timestamp" },
      { label: "Comments", key: "comments" }
    ], "No history");
  }
  return table(rows, [
    { label: "Action", key: "action" },
    { label: "Time", key: "timestamp" },
    { label: "Team", key: "team_name" }
  ], "No history");
}

function formData(form) {
  const data = Object.fromEntries(new FormData(form).entries());
  Object.keys(data).forEach((key) => {
    if (data[key] === "") data[key] = null;
  });
  return data;
}

function clearCache(keys) {
  keys.forEach((key) => delete state.cache[key]);
}

async function handleForm(event) {
  const form = event.target.closest("form");
  if (!form) return;
  event.preventDefault();
  const action = form.dataset.action;
  const data = formData(form);

  try {
    if (action === "login") {
      const result = await api("/auth/login", { method: "POST", body: data });
      state.token = result.token;
      state.user = result.user;
      localStorage.setItem("disasterMisToken", result.token);
      localStorage.setItem("disasterMisUser", JSON.stringify(result.user));
      state.view = "dashboard";
      state.cache = {};
      notify("Signed in");
      initViewData();
      return;
    }

    const map = {
      "create-incident": ["/emergency", "POST", ["reports", "active", "stats"]],
      "update-report-status": [`/emergency/${form.dataset.id}/status`, "PATCH", ["reports", "active", "stats"]],
      "assign-team": ["/rescue/assign", "POST", ["teams", "reports", "active"]],
      "resource-request": ["/resources/requests", "POST", ["requests", "approvals"]],
      "update-inventory": ["/resources/inventory", "PATCH", ["inventory", "lowStock", "resources"]],
      "allocate-resource": ["/resources/allocate", "POST", ["requests", "inventory", "lowStock"]],
      "admit-patient": ["/hospitals/admit", "POST", ["hospitals", "bestHospitals"]],
      "submit-approval": ["/approvals", "POST", ["approvals"]],
      "register-user": ["/auth/register", "POST", ["users"]],
      "user-status": [`/admin/users/${form.dataset.id}/status`, "PATCH", ["users"]],
      "finance-donation": ["/finance/donation", "POST", ["transactions", "budget", "financeSummary"]],
      "finance-expense": ["/finance/expense", "POST", ["transactions", "budget", "financeSummary"]],
      "finance-procurement": ["/finance/procurement", "POST", ["transactions", "budget", "financeSummary"]]
    };

    if (action === "decide-approval") {
      const endpoint = `/approvals/${form.dataset.id}/${data.decision}`;
      await api(endpoint, { method: "PATCH", body: { comments: data.comments } });
      clearCache(["approvals", "requests"]);
    } else {
      const [path, method, keys] = map[action];
      await api(path, { method, body: data });
      clearCache(keys);
    }

    state.drawer = null;
    notify("Saved");
    initViewData();
  } catch (error) {
    notify(error.message, "error");
  }
}

function handleClick(event) {
  const viewButton = event.target.closest("[data-view]");
  if (viewButton) {
    state.view = viewButton.dataset.view;
    state.sidebarOpen = false;
    initViewData();
    render();
    return;
  }

  const drawerButton = event.target.closest("[data-drawer]");
  if (drawerButton) {
    state.drawer = { id: drawerButton.dataset.drawer, recordId: drawerButton.dataset.id };
    render();
    return;
  }

  const actionButton = event.target.closest("[data-action]");
  if (!actionButton) return;
  const action = actionButton.dataset.action;

  if (action === "logout") {
    api("/auth/logout", { method: "POST" }).catch(() => {});
    localStorage.removeItem("disasterMisToken");
    localStorage.removeItem("disasterMisUser");
    state.token = "";
    state.user = null;
    state.cache = {};
    state.drawer = null;
    render();
  }
  if (action === "refresh") {
    state.cache = {};
    initViewData();
    render();
  }
  if (action === "toggle-menu") {
    state.sidebarOpen = !state.sidebarOpen;
    render();
  }
  if (action === "close-drawer") {
    state.drawer = null;
    render();
  }
}

function render() {
  app.innerHTML = state.token && state.user ? shell() : authPage();
}

document.addEventListener("submit", handleForm);
document.addEventListener("click", handleClick);

render();
initViewData();
