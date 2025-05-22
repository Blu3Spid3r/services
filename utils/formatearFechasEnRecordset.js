function formatearFechasEnRecordset(recordset, camposFecha = ['Fecha']) {
  return recordset.map(row => {
    const nuevo = { ...row }
    for (const campo of camposFecha) {
      if (row[campo] instanceof Date.UTC) {
        console.log(row[campo]);
        nuevo[campo] = row[campo] //.toLocaleString('sv-SE') // "YYYY-MM-DD HH:MM:SS"
        console.log(nuevo[campo]);
      }
    }
    return nuevo
  })
}

module.exports = { formatearFechasEnRecordset }
