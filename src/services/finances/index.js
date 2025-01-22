const db = require('../../databases/relationalDB')
const { v4: uuidv4 } = require('uuid')

exports.getTypesContributions = async () => {
  const query = 'SELECT * FROM types_contributions;'
  const result = await db.query(query)
  if (result.rows.length === 0) {
    return new Error('Ups no hay tipos de contribuciones por mostrar')
  }
  return result.rows
}

exports.saveContributions = async (data) => {
  let id, query, result
  do {
    id = uuidv4()
    query = `
              SELECT * FROM contributions WHERE id = $1;
          `
    result = await db.query(query, [id])
  } while (result.rows.length > 0)
  query = `
      INSERT INTO contributions (id,person_id,event_id,currency_id)
      VALUES ($1,$2,$3,$4) RETURNING *;
    `
  result = await db.query(query, [id, data.personId, data.eventId, data.currencyId])
  if (result.rows.length === 0) {
    return new Error('Ups algo fallo al registrar la contribución')
  }
  return result.rows[0]
}

exports.saveDetailsContributions = async (data) => {
  let id, query, result
  do {
    id = uuidv4()
    query = `
              SELECT * FROM details_contributions WHERE id = $1;
          `
    result = await db.query(query, [id])
  }
  while (result.rows.length > 0)
  query = `
      INSERT INTO details_contributions 
      (id,contribution_id,type_contribution_id,amount)
      VALUES ($1,$2,$3,$4) RETURNING *;
    `
  result = await db.query(query, [id, data.contributionId, data.type, data.amount])
  if (result.rows.length === 0) {
    return new Error('Ups algo fallo al registrar la contribución')
  }
  return result.rows[0]
}

exports.getOfferings = async (eventId) => {
  const query = `
     SELECT 
      tc.name AS type_contribution, 
      SUM(dc.amount) AS amount,        
      COUNT(c.id) AS quantity_contributions
    FROM contributions c
    LEFT JOIN details_contributions dc ON c.id = dc.contribution_id AND c.event_id = $1
    RIGHT JOIN types_contributions tc ON dc.type_contribution_id = tc.id
    GROUP BY type_contribution;
  
  
    `
  const result = await db.query(query, [eventId])
  if (result.rows.length === 0) {
    return new Error('Ups no hay ofrendas por mostrar')
  }
  return result.rows
}

exports.getCurrency = async () => {
  console.log('entro')
  const query = `
  SELECT tp.*,c.name as country_name FROM types_currencies tp
  JOIN countries c ON tp.country_id = c.id
   WHERE currency_type IS NOT NULL;`
  const result = await db.query(query)
  if (result.rows.length === 0) {
    return new Error('No hay monedas en la base de datos')
  }
  return result.rows
}

exports.getFinances = async (data) => {
  const query = `
    SELECT 
      tc.name AS type_contribution,
      SUM(dc.amount) AS amount,
      TO_CHAR(e.date, 'YYYY-MM') AS month,
      tp.currency_type AS currency,
      tp.currency_symbol AS symbol
    FROM events e
    JOIN contributions c ON c.event_id = e.id
    JOIN details_contributions dc ON c.id = dc.contribution_id
    JOIN types_contributions tc ON dc.type_contribution_id = tc.id
    JOIN types_currencies tp ON c.currency_id = tp.id    
    WHERE e.church_id = $1 AND e.date BETWEEN $2 AND $3
    GROUP BY type_contribution, month, tp.currency_type, tp.currency_symbol,amount;
  `
  const result = await db.query(query, [data.churchId, data.minDate, data.maxDate])
  if (result.rows.length === 0) {
    return new Error('Ups no hay contribuciones por mostrar')
  }
  return result.rows
}

exports.getReportOfferings = async (eventId) => {
  const query = `
    SELECT 
      c.person_id AS person_id,
      tc.name AS type_contribution,
      SUM(dc.amount) AS amount,
      tp.currency_type AS currency,
      tp.currency_symbol AS symbol,
      COUNT(c.id) AS quantity_contributions
    FROM contributions c
    JOIN details_contributions dc ON c.id = dc.contribution_id AND c.event_id = $1
    RIGHT JOIN types_contributions tc ON dc.type_contribution_id = tc.id
    JOIN types_currencies tp ON c.currency_id = tp.id
    WHERE c.event_id = $1
    GROUP BY type_contribution, c.person_id, tp.currency_type, tp.currency_symbol;    
  `
  const result = await db.query(query, [eventId])
  if (result.rows.length === 0) {
    return new Error('Ups no hay ofrendas por mostrar')
  }
  return result.rows
}
