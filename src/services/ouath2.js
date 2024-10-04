const db = require('../databases/relationalDB')
const bcrypt = require('bcrypt')
const { v4: uuidv4 } = require('uuid')

exports.verifyInvitationsLead = async (id) => {
  console.log('id in verifyInvitation and Lead: ', id)
  const query = `
        SELECT 'in_invitations' AS source
        FROM invitations
        WHERE person_id = $1
        UNION ALL
        SELECT 'in_leads_pastor_churches' AS source
        FROM leads
        WHERE person_id = $1;

    `
  const result = await db.query(query, [id])
  console.log(result.rows)
  if (result.rows.length === 0) {
    return { in_invitations: false, in_leads_pastor_churches: false }
  }

  const sources = result.rows.map(row => row.source)
  return {
    in_invitations: sources.includes('in_invitations'),
    in_leads_pastor_churches: sources.includes('in_leads_pastor_churches')
  }
}

exports.getInfoFromValidToken = async (rtoken) => {
  if (!rtoken) {
    return new Error('token invalido')
  }
  const query = `
        SELECT 
        p.id,
        p.first_name,
        p.last_name,
        rt.expires_at,
        r.name as rol_name
        FROM refresh_tokens rt
        LEFT JOIN users s ON s.person_id = rt.user_id
        LEFT JOIN people p ON p.id = s.person_id
        LEFT JOIN user_role r ON r.id = s.rol_user_id
        WHERE rt.id = $1;
    `
  const result = await db.query(query, [rtoken])
  if (result.rows.length === 0) {
    return new Error('token invalido')
  }
  const payload = {
    userId: result.rows[0].id,
    rolName: result.rows[0].rol_name,
    expiresAt: result.rows[0].expires_at
  }
  return payload
}

exports.singUp = async (data) => {
  let query
  query = 'UPDATE people SET type_person_id = (SELECT id FROM types_people WHERE name LIKE \'Usuario\') WHERE id = $1;'
  await db.query(query, [data.personId])
  query = `
        INSERT INTO users (person_id, password,rol_user_id)
        VALUES ($1, $2,(SELECT id FROM user_role WHERE name LIKE $3))
        RETURNING *;
      `
  const salt = await bcrypt.genSalt(12)
  const hashedPassword = await bcrypt.hash(data.password, salt)
  const result = await db.query(query, [
    data.personId,
    hashedPassword,
    data.rol
  ])
  if (result.rows.length === 0) {
    const error = new Error('Ups algo paso al insertar el usuario')
    return error
  }

  return 'Usuario Creado Exitosamente'
}

exports.singIn = async (email, password) => {
  try {
    console.log('email: ', email)
    console.log('password: ', password)
    const query = `
            SELECT p.*,s.password,r.name as rol_name  FROM users s
            LEFT JOIN people p ON p.id = s.person_id
            JOIN user_role r ON r.id = s.rol_user_id
            WHERE p.email = $1;
        `
    const result = await db.query(query, [email])

    if (result.rows.length === 0) {
      const error = new Error('Ups email incorrecto')
      return error
    }
    const user = result.rows[0] // Cambiar 'data' a 'user'

    const hashedPassword = user.password

    if (await !bcrypt.compare(password, hashedPassword)) {
      const error = new Error('Ups contraseña incorrecta')
      return error
    }

    return user // Devolver el dato con el nuevo nombre
  } catch (e) {
    if (process.env.NODE_ENV === 'development') {
      console.log('error: ', e.message)
    }
  }
}

exports.createRefreshToken = async (data) => {
  let token, result
  do {
    token = uuidv4()
    result = await db.query('SELECT * FROM refresh_tokens WHERE id = $1', [token])
  } while (result.length > 0)

  const { userId, created, expires } = data
  const query = 'INSERT INTO refresh_tokens VALUES($1,$2,$3,$4) RETURNING *;'
  result = db.query(query, [token, userId, created, expires])

  return token
}

exports.createInvitationBoarding = async (personId, inviterId, created, expires) => {
  try {
    let query = `
      SELECT * FROM invitations WHERE person_id = $1;
    `
    let result = await db.query(query, [personId])
    if (result.rows.length > 0) {
      return new Error('La persona ya tiene una invitacion')
    }
    query = `
        INSERT INTO invitations (person_id, inviter_id, created_at, updated_at,status)
        VALUES ($1, $2, $3, $4,$5) RETURNING *;        
    `
    const status = 'pendiente'
    result = await db.query(query, [personId, inviterId, created, expires, status])

    if (result.rows.length === 0) {
      return new Error('Error al Insertar Dato')
    }
    const data = result.rows[0]
    return data
  } catch (e) {
    if (process.env.NODE_ENV === 'development') {
      console.log('error: ', e.message)
    }
  }
}

exports.getInvitationBoarding = async (tokenId) => {
  if (!tokenId) {
    return new Error('Email no fue proporcionado')
  }
  console.log('here here', tokenId, '\n\n\n\n\n\n')
  const query = `
        SELECT i.* ,p.church_id,p.first_name, p.last_name, p.email, p.phone
        FROM invitations i
        JOIN people p ON p.id = i.person_id
        WHERE i.person_id = $1;
    `
  const result = await db.query(query, [tokenId])
  console.log('aqui tamos')
  if (result.rows.length === 0) {
    return 'No estas afiliado'
  }
  const info = result.rows[0]
  return { ...info, rol_name: 'User' }
}

exports.acceptInvitation = async (personId) => {
  console.log('personId: ', personId)
  let query = 'UPDATE invitations SET status = \'aceptado\' WHERE person_id = $1 RETURNING *;'
  let result = await db.query(query, [personId])
  if (result.rows.length === 0) {
    return new Error('Ups no estabas en nuestra base de datos como invitado')
  }
  query = 'SELECT email FROM people WHERE id = $1;'
  result = await db.query(query, [personId])
  console.log('result: ', result.rows[0])
  return result.rows[0]
}

exports.verifyChurchLead = async (personId) => {
  if (!personId) {
    return new Error('No deberias estar aqui')
  }
  const query = `SELECT l.*,p.* FROM leads l 
  JOIN people p ON p.id = l.person_id
  WHERE person_id = $1;`
  const result = await db.query(query, [personId])
  if (result.rows.length === 0) {
    return new Error('Ups no te encuentras en nuestra base de datos, por favor contactanos')
  }
  const info = result.rows[0]
  return { ...info, rol_name: 'Pastor' }
}
