const path = require('path');
const handlebars = require('handlebars');
const fs = require('fs');
const transporter = require('./transport');

// Función para leer y compilar la plantilla
const compileTemplate = (templateName, data) => {
    const filePath = path.join(__dirname, '../../templates', `${templateName}.html`);
    try {
        if (!fs.existsSync(filePath)) {
            throw new Error(`El archivo no existe en la ruta: ${filePath}`);
        }
        const source = fs.readFileSync(filePath, 'utf8');
        const template = handlebars.compile(source);
        return template(data);
    } catch (error) {
        console.error(`Error leyendo la plantilla desde ${filePath}:`, error);
        throw error;
    }
};

exports.sendInvitationOnBoarding = async (email, ministerio) => {
    try {        
        const htmlToSend = compileTemplate('invitationBoarding', { ministerio });
        const mailOptions = {
            from: process.env.USER_EMAIL_INVITATION,
            to: email,
            subject: `Ven y Haz Parte del Ministerio ${ministerio}`,
            html: htmlToSend
        };
        const result = await transporter.transporterGmail.sendMail(mailOptions)

        if (!result) {
            throw new Error('Algo falló al enviar la invitación');
        }
        return result
    } catch (error) {
        console.error('Error en sendInvitationOnBoarding:', error);
    }
};

exports.sendLead = async(data) => {
    try{
        const {church_name,pastor_name,email,country_id,token} = data
        const htmlToSend = compileTemplate('leadsChurch',{church_name,pastor_name,email,country_id,token})
        const mailOptions = {
            from: process.env.USER_EMAIL_INVITATION,
            to: process.env.EMAIL_ATTEND,
            html: htmlToSend
        }
        const result = await transporter.transporterGmail.sendMail(mailOptions)
        if (!result) {
            throw new Error('Algo falló al enviar la invitación');
        }
        return result
    }catch(error) {
        console.error('Error en sendLead:', error);
    }
}
