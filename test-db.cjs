const mysql = require('mysql2/promise');

async function test() {
  try {
    const conn = await mysql.createConnection({
      host: process.env.MYSQL_HOST || 'localhost',
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || '',
      database: process.env.MYSQL_DATABASE || 'taskFlow'
    });

    // Check users
    const [users] = await conn.execute('SELECT COUNT(*) as count FROM users');
    console.log('Users count:', users[0].count);

    // Check bug reports
    const [reports] = await conn.execute('SELECT COUNT(*) as count FROM bug_reports');
    console.log('Bug reports count:', reports[0].count);

    // Get recent bug reports
    const [recent] = await conn.execute('SELECT id, user_id, type, title, description, status, created_at FROM bug_reports ORDER BY created_at DESC LIMIT 5');
    console.log('Recent bug reports:', recent);

    await conn.end();
  } catch (err) {
    console.error('Database error:', err.message);
  }
}

test();