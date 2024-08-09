const db = require('../databases/relationalDB')
const bcrypt = require('bcrypt')
const { v4: uuidv4 } = require('uuid')

exports.verifyInvitationsLead = async (id) => {
  console.log('id: ', id)
  const query = `
        SELECT 'in_invitations' AS source
        FROM invitations
        WHERE id = $1
        UNION ALL
        SELECT 'in_leads_pastor_churches' AS source
        FROM leads_pastor_churches
        WHERE id = $1;

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
        SELECT rt.*,s.name FROM refresh_token rt
        JOIN servants s ON s.id = rt.user_id
        WHERE rt.id = $1;
    `
  const result = await db.query(query, [rtoken])
  return result
}

exports.singUp = async (data) => {
  console.log('entramos a singUp service')
  let id, result
  do {
    id = uuidv4()
    result = await db.query('SELECT * FROM servants WHERE id = $1', [id])
  } while (result.length > 0)

  const query = `
        INSERT INTO servants (id, cc, name, email, password, country_id, rol_adm,church_id, phone_number)
        VALUES ($1, $2, $3, $4, $5, $6,(SELECT id FROM roles_administratives WHERE name = $7), $8,$9)
        RETURNING *;
      `
  const salt = await bcrypt.genSalt(12)
  const hashedPassword = await bcrypt.hash(data.password, salt)
  result = await db.query(query, [
    id,
    data.cc,
    data.name,
    data.email,
    hashedPassword,
    data.countryId,
    data.rol,
    data.churchId,
    data.phoneNumber
  ])
  if (result.rows.length === 0) {
    const error = new Error('Error en la Query')
    return error
  }

  return 'Usuario Creado Exitosamente'
}

exports.singIn = async (email, password) => {
  try {
    const query = `
            SELECT s.id as id,s.name,s.email,s.password,r.name as rol_name  FROM servants s
            JOIN roles_administratives r ON r.id = s.rol_adm 
            WHERE s.email = $1;
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
    if (process.env.NODE_ENV === 'develop') {
      console.log('error: ', e.message)
    }
  }
}

exports.createRefreshToken = async (data) => {
  let token, result
  do {
    token = uuidv4()
    result = await db.query('SELECT * FROM refresh_token WHERE id = $1', [token])
  } while (result.length > 0)

  const { userId, created, expires } = data
  const query = 'INSERT INTO refresh_token VALUES($1,$2,$3,$4) RETURNING *;'
  result = db.query(query, [token, userId, created, expires])

  return token
}

exports.createInvitationBoarding = async (email, inviterId, created, expires) => {
  try {
    const id = uuidv4()
    const query = `
        INSERT INTO invitations (id, inviter_id, email, created_at, expires_at)
        VALUES ($1, $2, $3, $4, $5) ON CONFLICT (email) DO NOTHING RETURNING *;
    `

    const result = await db.query(query, [id, inviterId, email, created, expires])

    if (result.rows.length === 0) {
      return new Error('Error al Insertar Dato')
    }
    const data = result.rows[0]
    return data
  } catch (e) {
    if (process.env.NODE_ENV === 'develop') {
      console.log('error: ', e.message)
    }
  }
}

exports.getInvitationBoarding = async (tokenId) => {
  if (!tokenId) {
    return new Error('Email no fue proporcionado')
  }
  console.log('here here')
  const query = `
        SELECT i.* ,s.church_id
        FROM invitations i
        JOIN servants s ON s.id = i.inviter_id 
        WHERE i.id = $1;
    `
  const result = await db.query(query, [tokenId])
  console.log('aqui tamos')
  if (result.rows.length === 0) {
    return 'No estas afiliado'
  }
  const info = result.rows[0]
  return { ...info, rol_name: 'User' }
}

exports.acceptInvitation = async (email) => {
  const query = 'UPDATE invitations SET status = \'accept\' WHERE email = $1 RETURNING *;'
  const result = await db.query(query, [email])
  if (result.rows.length === 0) {
    return new Error('Ups no estabas en nuestra base de datos como invitado')
  }
  console.log('result: ', result.rows[0])
  return result.rows[0]
}

exports.verifyChurchLead = async (email) => {
  if (!email) {
    return new Error('Email no fue proporcionado')
  }
  console.log('email: ', email)
  const query = 'SELECT * FROM leads_pastor_churches WHERE email = $1;'
  const result = await db.query(query, [email])
  if (result.rows.length === 0) {
    return new Error('Ups no te encuentras en nuestra base de datos, por favor contactanos')
  }
  const info = result.rows[0]
  return { ...info, rol_name: 'Pastor' }
}
