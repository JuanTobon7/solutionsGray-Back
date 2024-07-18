const defaultServices = require('../services/default')
const sendEmail = require('../services/sendEmail/email')

exports.sendLead = async (req,res) => {
    try{        
        const {churchName,countryId,email,pastorName} = req.body
        if( !churchName || !countryId || !email || !pastorName ){
            res.status(400).send('Datos faltantes')
        }

        const result = await defaultServices.sendLead({churchName,countryId,email,pastorName})
        console.log(result)
        if(result instanceof Error){
            res.status(400).send('Ups si ya haz enviado tu info espera')            
            return
        }
        
        const sendLead = await sendEmail.sendLead({churchName,countryId,email,pastorName})
        if(!sendLead){
            res.status(500).send('ups algo ocurrio en el server')            
        }
        res.status(200).send('Se ha guardado tu peticion, pronto te contactaremos')

    }catch(e){
        if(process.env.NODE_ENV === 'develop'){
            console.log(e.message)
        }
    }
}