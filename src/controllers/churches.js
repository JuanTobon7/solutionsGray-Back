const serviceChurch = require('../services/churches')

exports.createChurch = async(req,res) => {
    try{        
        const {name,parentChurchId,address,stateId,countryId} = req.body
        const pastorId = req.user.id
        if(!name ||!address || !stateId || !countryId){
            res.status(400).send('Datos Incompletos')
        }

        const result = await serviceChurch.createChurch({name,parentChurchId,address,stateId,countryId,pastorId})

        if(result instanceof Error){
            res.status(400).send({message: result.message})
            return
        }
        console.log(result)
        res.status(200).send(`La iglesia ${result.name} que pastoreas fue creada exitosamente`)

    }catch(e){
        console.log(e)
    }
    
    


}