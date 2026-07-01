-- =====================================================================
-- SECTION 9 — INDEXES
-- =====================================================================

CREATE INDEX idx_er_severity    ON emergency_report (severity_level);
CREATE INDEX idx_er_status      ON emergency_report ([status]);
CREATE INDEX idx_er_disaster    ON emergency_report (disaster_id);
CREATE INDEX idx_er_report_time ON emergency_report (report_time);
CREATE INDEX idx_er_status_sev  ON emergency_report ([status], severity_level);
CREATE INDEX idx_er_location    ON emergency_report (latitude, longitude);

CREATE INDEX idx_ra_resource    ON resource_allocation (resource_id);
CREATE INDEX idx_ra_request     ON resource_allocation (request_id);
CREATE INDEX idx_ra_warehouse   ON resource_allocation (warehouse_id);

CREATE INDEX idx_inv_qty        ON inventory (quantity, threshold);

CREATE INDEX idx_txn_timestamp  ON [transaction] ([timestamp]);
CREATE INDEX idx_txn_type       ON [transaction] ([type]);
CREATE INDEX idx_txn_type_time  ON [transaction] ([type], [timestamp]);

CREATE INDEX idx_al_timestamp   ON audit_log ([timestamp]);
CREATE INDEX idx_al_entity      ON audit_log (entity_name, entity_id);
CREATE INDEX idx_al_user        ON audit_log (user_id);

CREATE INDEX idx_ta_status      ON team_assignment ([status]);
CREATE INDEX idx_ta_team        ON team_assignment (team_id);
CREATE INDEX idx_ta_report      ON team_assignment (report_id);

CREATE INDEX idx_appr_status    ON approval ([status]);
CREATE INDEX idx_appr_type      ON approval (request_type);

CREATE INDEX idx_notif_user_read ON notification (user_id, is_read);
GO