const Comunidad = require('../../models/comunidadModel/comunidad');
const User = require('../../models/userModel/users');
const Jugador = require('../../models/equipoModel/jugador');
const comunidadController = {};



comunidadController.getOneComunidad = async (req, res) => {
    const {idUser} = req.params;
    await Comunidad.findOne({users:idUser})
                    .populate({path:"users"})
                    .populate({path:"owner"}).then(response => {
        res.status(200).send(response)
    });
}

comunidadController.getComunidades = async (req, res) => {  
    await Comunidad.find().populate({path:"users"}).then(comunidades => {
        res.send(comunidades);
    })
    
};

comunidadController.createComunidad = async(req, res) => {
    let type = 'Public'
    if(req.body.password != null){
        type = 'Private'
    }
    const players  = await Jugador.find({});
    teamAdmin = {
        _id: '00000000000000000000000admin',
        name: 'System Team',
        image: '/static/media/logo.ab694774.png',
    }
    players.forEach((player, index) => {
        player.team = teamAdmin;
        players.splice(index,1,player);
    })
    let user =  await User.findById(req.params.idUser);
    let users = [];
    users.push(user);
    const comunidad = new Comunidad({
        name:req.body.name, 
        password: req.body.password, 
        numIntegrants: req.body.numIntegrants,
        budget: req.body.budget,
        jugadoresMaximosMercado : req.body.jugadoresMaximosMercado,
        maxDaysPlayerOnMarket: req.body.maxDaysPlayerOnMarket,
        playersForUserInMarket: req.body.playersForUserInMarket,
        type: type,    
        players : players,
        owner: user, 
        users: users
    });
    await User.findByIdAndUpdate(req.params.idUser, {comunidad: comunidad}, {new:true}, function(err,response) {
        if(err){
            console.log("we hit an error" + err);
            res.send(404);
        }
    });
    await comunidad.save()
    .then(async res => {
        try {
            res.save();
        }catch(err) {
            throw new Error('Error creando la comunidad');
        }
    }).catch(error => {
        console.log(error)
    });
    res.send(comunidad);
};

comunidadController.addUserAndUpdateComunidad = async(req,res) => {
    const {idComunidad,idUser}  = req.params;
    //Comparar los usuarios de la comunidad en base de datos con los de la comunidad si se va a actualizar
    const comunidadBD = await Comunidad.findOne({users:idUser});
    const usersActuales = req.body.users;
    const userBD = await User.findById(idUser);
    
    if(comunidadBD != null){
        res.status(409).send("Ya estas registrado en una comunidad");
    }else{
        usersActuales.push(userBD)
        const newComunidad = {
            _id: idComunidad,
            name: req.body.name,
            password: req.body.password,
            numIntegrants: req.body.numIntegrants,
            budget: req.body.budget,
            type: req.body.type,
            jugadoresMaximosMercado : req.body.jugadoresMaximosMercado,
            maxDaysPlayerOnMarket: req.body.maxDaysPlayerOnMarket,
            playersForUserInMarket: req.body.playersForUserInMarket,
            users: usersActuales
        }
        await Comunidad.findByIdAndUpdate(idComunidad, {$set: newComunidad}, (err,result) => {
            if(err) {
                console.log(err)
                res.status(404);
            }else{
                console.log("Update correcto")
                return res.status(200).send(newComunidad);
            }
        });
    }
    
}
comunidadController.updateComunidad = async(req,res) => {
    const newComunidad = {
        _id: req.body._id,
        name: req.body.name,
        password: req.body.password,
        numIntegrants: req.body.numIntegrants,
        budget: req.body.budget,
        type: req.body.type,
        jugadoresMaximosMercado : req.body.jugadoresMaximosMercado,
        maxDaysPlayerOnMarket: req.body.maxDaysPlayerOnMarket,
        playersForUserInMarket: req.body.playersForUserInMarket,
        users: req.body.users
    }
    const idComunidad = req.body._id;
    await Comunidad.findByIdAndUpdate(idComunidad, {$set: newComunidad}, (err,result) => {
        if(err) {
            console.log(err)
            res.status(404);
        }else{
            console.log("Update correcto")
            return res.status(200).send(newComunidad);
        }
    });

}

module.exports = comunidadController;