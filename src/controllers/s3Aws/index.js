const { S3Client, DeleteObjectCommand } = require('@aws-sdk/client-s3')
const multer = require('multer')
const multerS3 = require('multer-s3')

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
})

exports.upload = multer({
  storage: multerS3({
    s3,
    bucket: process.env.AWS_S3_BUCKET_NAME,
    key: (req, file, cb) => {
      const fileName = `users/${req.user.id}-${Date.now()}-${file.originalname}`
      cb(null, fileName)
    },
    contentType: multerS3.AUTO_CONTENT_TYPE // Detecta automáticamente el tipo MIME correcto
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // Tamaño máximo del archivo (5 MB)
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png/
    const isValidType = fileTypes.test(file.mimetype)
    if (isValidType) {
      return cb(null, true)
    }
    cb(new Error('Solo se permiten archivos de tipo imagen (jpeg, jpg, png).'))
  }
}).single('photo') // Nombre del campo en el formulario

exports.deleteObject = async (fileName) => {
  try {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: fileName
    }

    await s3.send(new DeleteObjectCommand(params))
    console.log(`Archivo eliminado: ${fileName}`)
    return { success: true, message: 'Archivo eliminado exitosamente.' }
  } catch (error) {
    console.error('Error al eliminar el archivo:', error.message)
    return { success: false, message: 'Error al eliminar el archivo.', error: error.message }
  }
}
