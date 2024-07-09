// src/middleware/validateNoSpecialChars.js
const validateNoSpecialChars = (req, res, next) => {
    const validate = (value) => {
      // Permitir letras, números, espacios, guiones, puntos, arrobas, rayas al piso
      const re = /^[a-zA-Z0-9\s\-_.@]+$/;
      return re.test(String(value));
    };
  
    const checkObject = (obj) => {
      for (const key in obj) {
        if (typeof obj[key] === 'object') {
          if (!checkObject(obj[key])) {
            return false;
          }
        } else if (!validate(obj[key])) {
          return false;
        }
      }
      return true;
    };
  
    if (!checkObject(req.query) || !checkObject(req.body) || !checkObject(req.params)) {
      return res.status(400).send({ message: 'Entrada inválida, caracteres especiales detectados' });
    }
  
    next();
  };
  
  module.exports = validateNoSpecialChars;
  