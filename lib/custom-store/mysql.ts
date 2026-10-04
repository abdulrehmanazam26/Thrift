import "server-only";
import mysql from "mysql2/promise";

const mysqlGlobal = globalThis as typeof globalThis & { thriftKaroMysqlPool?: mysql.Pool };

export function mysqlConfigured() {
  return Boolean(process.env.MYSQL_URL);
}

export function mysqlDb() {
  const url = process.env.MYSQL_URL;
  if (!url) throw new Error("MySQL is not configured.");
  if (!mysqlGlobal.thriftKaroMysqlPool) {
    mysqlGlobal.thriftKaroMysqlPool = mysql.createPool({
      uri: url,
      connectionLimit: 4,
      maxIdle: 2,
      idleTimeout: 30_000,
      enableKeepAlive: true,
      waitForConnections: true,
      queueLimit: 0,
    });
  }
  return mysqlGlobal.thriftKaroMysqlPool;
}

export async function storeSettings() {
  const [rows] = await mysqlDb().query<mysql.RowDataPacket[]>(
    "SELECT setting_key, setting_value FROM site_settings",
  );
  const values = new Map(rows.map((row) => [String(row.setting_key), String(row.setting_value)]));
  return { deliveryFee: Number(values.get("shipping_fee") || 250), checkoutEnabled: values.get("checkout_enabled") === "true" };
}
