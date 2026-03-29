import pool from "../db";

/**
 * Creates a new user credential in the database.
 *
 * @param email
 * @param passwordHash
 * @param name
 * @returns
 */
export async function createCredentials(
  email: string,
  passwordHash: string,
  name: string,
): Promise<Credential> {
  const result = await pool.query(
    `
      INSERT INTO credentials (email, password_hash, name)
      VALUES ($1, $2, $3)
      RETURNING id
      `,
    [email, passwordHash, name],
  );

  return result.rows[0];
}
