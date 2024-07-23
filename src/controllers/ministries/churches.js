const serviceChurch = require('../../services/ministries/churches')
const serviceEmail = require('../../services/sendEmail/email')
const moment = require('moment-timezone')

exports.createChurch = async(req,res) => {
    try{        
        const {name,parentChurchId,address,stateId,countryId} = req.body
        const pastorId = req.user.id
        if(!name ||!address || !stateId || !countryId){
            res.status(400).send('Datos Incompletos')
            return
        }

        const result = await serviceChurch.createChurch({name,parentChurchId,address,stateId,countryId,pastorId})

        if(result instanceof Error){
            res.status(400).send({message: result.message})
            return
        }

        const resultEmail = await serviceEmail
        console.log(result)
        res.status(200).send(`La iglesia ${result.name} que pastoreas fue creada exitosamente`)
        
    }catch(e){
        console.log(e)
    }
}


// Obtener la fecha actual en la zona horaria del usuario, Convertimos tambien la fecha del evento a la zona horaria del usuario,
// Verificamos si el evento es al menos 4 días en el futuro
//Creamos cultos en la iglesia, ojo son disintos a los eventos de los grupos


exports.createWorshipService = async(req,res) => {
    try{

        const {name,date,typeEvent,userTimezone} = req.body
        if( !name || !date || !typeEvent || !userTimezone){
            res.status(400).send('Datos incompletos')
            return
        }
        const churchId = req.user.church_id
        const eventDateInUserTZ = moment.tz(date, userTimezone);
        const currentDateInUserTZ = moment.tz(new Date(), userTimezone);

        const daysDifference = eventDateInUserTZ.diff(currentDateInUserTZ, 'days');

        if (daysDifference < 4) {
            res.status(400).send({ message: 'No se pueden programar culto con menos de 4 dias de anterioridad' });
            return;
        }
        //para guardar la fecha en base a la zona horaria del usuario y no del server
        const dateWhorship = eventDateInUserTZ.format('YYYY-MM-DD HH:mm')
        const result = await serviceChurch.createWorshipService({name,dateWhorship,churchId,typeEvent})        
        if(result instanceof Error){
            res.status(400).send({message: `Ups hubo un error ${result.message}`})
            return
        }
        
        res.status(200).send({message: 'Culto creado exitosamente'})

    }catch(e){    
        res.status(500).send({message: `Ups hubo un error ${e}`})
        return
    }

}

exports.createRolesServants = async(req,res) => {
    try{        
        console.log('here roles servants')
        const name = req.body.name
        if(!name){
            res.status(400).send({message: 'Faltan Datos'})
            return
        }
        
        const result = await serviceChurch.createRolesServants(name)
        if(result instanceof Error){
            res.status(400).send({message:`Ups algo paso ${result.message}`})
            return
        }
        
        res.status(200).send({message: `El rol ha sido correctamente creado ${result}`})    
    }catch(e){
        res.status(500).send({message: e})        
    }
}
//añadimos servicios o privilegios para los servidores de la iglesia
exports.assignServices = async(req,res) => {
    try{        
        console.log('assing services controller begin')
        const {servantId,rolServantId,eventId} = req.body
        
        if(!rolServantId || !eventId || !servantId){
            res.status(400).send('Ups faltan datos')
            return
        }
        
        const result = await serviceChurch.assignServices({rolServantId,eventId,servantId})
        if(result instanceof Error){
            res.status(400).send({message: result.message})
            return
        }         
        
        // // const emailResult = await serviceEmail.sendAssignedService(result)
        // // if(emailResult instanceof Error){
        // //     throw emailResult.message
        // //     return
        // // }
        res.status(200).send({message: 'el servicio fue asignado correctamente'})
    }catch(e){
        res.status(500).send({message: e})        
    }
}

//se creara un curso
exports.registerCourse = async(req,res) => {
    try{        
        const {name,publisher,description} = req.body
        if(!name || !publisher || !description ){
            res.status(400).send('Faltan datos para registrar el curso en cuestion')
        }
        
        const result = await serviceChurch.registerCourse({name,publisher,description})
        if(result instanceof Error){ 
            res.status(400).send({message: result.message})
        }
        
        res.status(200).send(`Se ha registrado exitosamente el curso ${name}`)
    }catch(e){
        console.log(e)
        res.status(500).send('Ups algo fallo en el servidor',e)
    }

}
 //se asignara un curso