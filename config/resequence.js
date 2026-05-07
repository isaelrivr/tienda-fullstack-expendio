const { rawPool } = require('./db');

/**
 * Mapa de claves foráneas: qué columnas en qué tablas apuntan al id de cada tabla.
 */
const FK_MAP = {
  sucursales:  [
    { tabla: 'empleados',     columna: 'sucursal_id' },
    { tabla: 'ventas',        columna: 'sucursal_id' }
  ],
  empleados:   [
    { tabla: 'ventas',        columna: 'empleado_id' }
  ],
  clientes:    [
    { tabla: 'ventas',        columna: 'cliente_id'  }
  ],
  proveedores: [
    { tabla: 'productos',     columna: 'proveedor_id' }
  ],
  productos:   [
    { tabla: 'detalle_venta', columna: 'producto_id' }
  ],
  ventas:      [
    { tabla: 'detalle_venta', columna: 'venta_id' }
  ]
};

/**
 * Después de eliminar el registro con `deletedId` de `tabla`,
 * decrementa en 1 todos los IDs mayores al eliminado
 * y actualiza las claves foráneas relacionadas.
 */
function resequenceAfterDelete(tabla, deletedId) {
  return new Promise((resolve, reject) => {
    rawPool.getConnection((err, conn) => {
      if (err) return reject(err);

      let isReleased = false;
      const releaseConn = () => {
        if (!isReleased) {
          conn.release();
          isReleased = true;
        }
      };

      const run = (sql, params, cb) => conn.query(sql, params, (e, r) => cb(e, r));

      run('SET FOREIGN_KEY_CHECKS = 0', [], (err) => {
        if (err) { releaseConn(); return reject(err); }

        const fks = FK_MAP[tabla] || [];
        let fkIndex = 0;

        const nextFk = () => {
          if (fkIndex >= fks.length) return updateMain();
          const { tabla: tRel, columna } = fks[fkIndex++];
          run(
            `UPDATE \`${tRel}\` SET \`${columna}\` = \`${columna}\` - 1 WHERE \`${columna}\` > ?`,
            [deletedId],
            (err) => {
              if (err) { releaseConn(); return reject(err); }
              nextFk();
            }
          );
        };

        const updateMain = () => {
          run(
            `UPDATE \`${tabla}\` SET id = id - 1 WHERE id > ?`,
            [deletedId],
            (err) => {
              run('SET FOREIGN_KEY_CHECKS = 1', [], () => {
                releaseConn();
                if (err) return reject(err);
                resolve();
              });
            }
          );
        };

        nextFk();
      });
    });
  });
}

module.exports = { resequenceAfterDelete };
