const serviceDefault = require('../../services/ministries/default')

exports.registerAttends = async(req,res) => {
    try{        
        const { country_id, church_id, id: guide_id } = req.user;

        console.log('ID del guía:', guide_id);
        const{cc,name,email,eventId} = req.body
        if(!cc || !name || !eventId){
            res.status(400).send('Faltan Datos')
            return
        }
        const result = await serviceDefault.registerAttends({cc,name,email,eventId,country_id,church_id,guide_id});
        if(result instanceof Error){
            res.status(400).send({message:result.message})
            return
        }

        res.status(200).send(`La persona ${result.name} fue añadida exitosamente`)
    }catch(e){
        console.log(e)
        res.status(500).send('Error en el servidor',e)
    }
}