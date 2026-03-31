import pool from "../db";

/**
 * Creates a new user credential in the database.
 *
 * @param email - The email address of the user for whom the credentials are being created.
 * @param passwordHash - The hashed password that will be stored in the database for authentication purposes.
 * @param name - The name of the user associated with the credentials being created.
 * @returns A promise resolving to the created credential record from the database, including its unique ID.
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
