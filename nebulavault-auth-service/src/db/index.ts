import pg from "pg";

// Not used but if you want to have some separate place to save user information, you can.
// Keep in mind that doing so will couple this service with another potentially which would defeat the purpose of this auth service.
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export default pool;
