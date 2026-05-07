const mysql = require('mysql2');

const pool = mysql.createPool({
  host:             process.env.DB_HOST     || 'localhost',
  user:             process.env.DB_USER     || 'root',
  password:         process.env.DB_PASSWORD || 'rootpassword',
  database:         process.env.DB_NAME     || 'expendio',
  waitForConnections: true,
  connectionLimit:  10,
  queueLimit:       0
});

// Verificar conexión al iniciar
pool.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Error al conectar con la base de datos:', err.message);
    return;
  }
  console.log('✅ Conexión a la base de datos establecida correctamente.');
  connection.release();
});

module.exports        = pool.promise();
module.exports.rawPool = pool;