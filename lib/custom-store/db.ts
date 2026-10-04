import "server-only";
import { mysqlConfigured } from "./mysql";

export function databaseConfigured() {
  return mysqlConfigured();
}
