const db = require('../../databases/relationalDB')
const { getSession } = require('../../databases/graphsDB')
const { v4: uuidv4 } = require('uuid')

exports.createGroups = async (data) => {
  let query, id, result
  do {
    id = uuidv4()
    query = 'SELECT id FROM group_churches WHERE id = $1'
    result = await db.query(query, [id])
  } while (result.rows.length > 0)
  query = `
      INSERT INTO group_churches (id,name,latitude,longitude,church_id,leader_id)
      VALUES ($1,$2,$3,$4,$5,$6)
      RETURNING *
      `
  result = await db.query(query, [id, data.name, data.latitude, data.longitude, data.churchId, data.leaderId])
  if (result.rows.length === 0) {
    return new Error('Error al crear el grupo')
  }
  const strategyId = uuidv4()
  query = 'INSERT INTO strategies (id,name,group_id) VALUES ($1,$2,$3) RETURNING *'
  const response = await db.query(query, [strategyId, data.strategyName, id])
  if (response.rows.length === 0) {
    return new Error('Error al crear el grupo')
  }

  return { ...response.rows[0], groupId: id }
}

exports.getGroups = async (churchId) => {
  const query = `
    SELECT g.*,p.first_name,p.last_name,p.phone,p.email,p.avatar 
    FROM group_churches g
    LEFT JOIN group_integrants gi ON g.id = gi.group_id
    LEFT JOIN people p ON gi.person_id = p.id 
    WHERE g.church_id = $1
  `
  const result = await db.query(query, [churchId])
  if (result.rows.length === 0) {
    return new Error('No hay grupos')
  }
  return result.rows
}
exports.getMyInfoGroup = async (id) => {
  const query = `
    SELECT 
        g.*,
        s.id as strategy_id 
    FROM group_churches g
    JOIN strategies s ON g.id = s.group_id
    WHERE g.id = (SELECT group_id FROM group_integrants WHERE person_id = $1 LIMIT 1)
  `
  const result = await db.query(query, [id])
  if (result.rows.length === 0) {
    return new Error('No hay grupos')
  }
  return result.rows[0]
}

exports.getMyGroup = async (id) => {
  const query = `
    SELECT 
        p.id,
        p.first_name, 
        p.last_name, 
        p.phone, 
        p.email, 
        p.avatar 
    FROM group_integrants gi
    JOIN people p ON gi.person_id = p.id
    WHERE gi.group_id = $1
  `
  const result = await db.query(query, [id])
  if (result.rows.length === 0) {
    return new Error('No hay grupos')
  }
  return result.rows
}

exports.addPersonStrategie = async (data) => {
  const session = getSession() // Obtiene la sesión activa de Neo4j
  console.log('session', session)
  try {
    const { personId, strategyId, rol, groupId, leaderId } = data
    console.log('data in addPersonStrategie', data)

    // Insertamos la persona en la base de datos relacional (sin cambios aquí)
    const query = `
      INSERT INTO group_integrants (group_id, person_id, id) 
      VALUES ($1, $2, $3)
      RETURNING *
    `
    const result = await db.query(query, [groupId, personId, uuidv4()])
    if (result.rows.length === 0) {
      console.log('Error al agregar persona al grupo', result.rows)
      return new Error('Error al agregar persona al grupo')
    }

    // Crear la persona en el grafo
    const createQuery = `
      CREATE (p:Persona {id: $personId, estrategiaId: $strategyId, rol: $rol, leaderId: $leaderId})
      RETURN p
    `
    const createResult = await session.run(createQuery, { personId, strategyId, rol, leaderId })

    if (createResult.records.length === 0) {
      console.log('Error al crear la persona en el grafo', createResult.records)
      return new Error('Error al crear la persona en el grafo')
    }

    // Retorna la persona creada
    return createResult.records[0].get('p').properties
  } catch (err) {
    console.log(`Error al agregar persona a la estrategia: ${err}`)
    return new Error('Error al agregar persona a la estrategia')
  }
}

exports.getStrategyById = async (strategyId) => {
  const session = getSession() // Obtiene la sesión activa de Neo4j
  try {
    console.log('Cargando personas con la estrategia:', strategyId)

    // Consulta para obtener las personas con el strategyId, ordenadas por leaderId
    const query = `
      MATCH (p:Persona {estrategiaId: $strategyId})
      RETURN p
      ORDER BY p.leaderId
    `

    const result = await session.run(query, { strategyId })

    if (result.records.length === 0) {
      console.log('No se encontraron personas con esta estrategia')
      return new Error('No se encontraron personas con esta estrategia')
    }

    // Retorna las personas encontradas, extrayendo las propiedades de cada nodo
    return result.records.map(record => record.get('p').properties)
  } catch (err) {
    console.log(`Error al obtener personas con estrategia: ${err}`)
    return new Error('Error al obtener personas con estrategia')
  }
}

exports.getAttendanceGroup = async (data) => {
  const query = `
    SELECT e.id,e.date,a.person_id FROM events e
    JOIN attendees a ON e.id = a.event_id
    WHERE e.group_id = $1 AND e.date = $2
  `
  const result = await db.query(query, [data.groupId, data.date])
  if (result.rows.length === 0) {
    return new Error('No hay asistencias')
  }
  return result.rows
}

exports.getServicesGroup = async (data) => {
  const query = `
    SELECT e.*,tws.name as worship_name FROM events e
    LEFT JOIN types_whorship_service tws  ON tws.id = e.worship_service_type_id
    JOIN group_churches g ON e.group_id = g.id
   
    WHERE g.id = $1 AND e.date BETWEEN $2 AND $3;`
  const result = await db.query(query, [data.groupId, data.minDate, data.maxDate])
  if (result.rows.length === 0) {
    return new Error('No hay cultos programados')
  }
  return result.rows
}

exports.createWorshipServices = async (data) => {
  let query, result, id
  try {
    do {
      id = uuidv4()
      query = 'SELECT * FROM events WHERE id = $1;'
      result = await db.query(query, [id])
    } while (result.rows.length > 0)
    query = 'INSERT INTO events (id,worship_service_type_id,date,group_id,sermon_tittle,description) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *;'
    console.log('data in createWorshipServices: ', data)
    result = await db.query(query, [id, data.typeWorshipId, data.userDate, data.groupId, data.sermonTittle, data.description])
    if (result.rows.length === 0) {
      return new Error('Ups algo fallo al guardar el culto')
    }
    return result.rows[0]
  } catch (e) {
    console.log(e)
    return e
  }
}
