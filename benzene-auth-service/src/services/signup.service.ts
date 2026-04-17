import pool from "../db";
import { Credential } from "../types/database";

/**
 * Creates a new user credential in the database.
 *
 * @param email - The email address of the user for whom the credentials are being created.
 * @param passwordHash - The hashed password that will be stored in the database for authentication purposes.
 * @returns A promise resolving to the created credential record from the database, including its unique ID.
 */
export async function createCredentials(
  email: string,
  passwordHash: string,
): Promise<Credential | null> {
  const result = await pool.query(
    `
      INSERT INTO credentials (email, password_hash)
      VALUES ($1, $2)
      RETURNING *
`,
    [email.toLowerCase().trim(), passwordHash],
  );

  return result.rows[0];
}
