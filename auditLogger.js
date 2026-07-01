// utils/auditLogger.js
// ─────────────────────────────────────────────────────────────
// Centralized audit logging utility.
// Called from controllers after any critical write operation.
// ─────────────────────────────────────────────────────────────

const { getPool, sql } = require('../config/db');

/**
 * writeAuditLog
 * @param {object} params
 * @param {string} params.entityName  - Table/entity being changed
 * @param {number} params.entityId    - PK of the affected row
 * @param {string} params.action      - INSERT | UPDATE | DELETE | APPROVE | REJECT
 * @param {object} params.oldValue    - Previous state (for UPDATEs)
 * @param {object} params.newValue    - New state
 * @param {number} params.userId      - Who performed the action
 * @param {string} params.ipAddress   - Request IP
 */
const writeAuditLog = async ({ entityName, entityId, action, oldValue, newValue, userId, ipAddress }) => {
  try {
    const pool = await getPool();
    await pool.request()
      .input('entityName',  sql.VarChar(100),    entityName)
      .input('entityId',    sql.Int,              entityId)
      .input('action',      sql.VarChar(10),      action)
      .input('oldValue',    sql.NVarChar(sql.MAX), oldValue ? JSON.stringify(oldValue) : null)
      .input('newValue',    sql.NVarChar(sql.MAX), newValue ? JSON.stringify(newValue) : null)
      .input('userId',      sql.Int,              userId)
      .input('ipAddress',   sql.VarChar(45),      ipAddress || null)
      .query(`
        INSERT INTO audit_log (entity_name, entity_id, action, old_value, new_value, user_id, ip_address)
        VALUES (@entityName, @entityId, @action, @oldValue, @newValue, @userId, @ipAddress)
      `);
  } catch (err) {
    // Audit failures should never crash the main request
    console.error('[AUDIT LOG ERROR]', err.message);
  }
};

module.exports = { writeAuditLog };
