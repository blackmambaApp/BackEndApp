const Comunidad = require('../../models/comunidadModel/comunidad');
const User = require('../../models/userModel/users');
const Jugador = require('../../models/equipoModel/jugador');
const comunidadController = {};



comunidadController.getOneComunidad = async (req, res) => {
    const {idComunidad} = req.params;
    await Comunidad.findById(idComunidad).then(response => {
        res.send(response)
    });
}

comunidadController.getComunidades = async (req, res) => {  
    await Comunidad.find().populate({path:"users"}).populate({path:"players"}).then(comunidades => {
        res.send(comunidades);
    })
    
};

comunidadController.createComunidad = async(req, res) => {
    let type = 'Public'
    if(req.body.password != null){
        type = 'Private'
    }
    const players  = await Jugador.find({});
    let user =  await User.findById(req.params.idUser);
    let users = [];
    users.push(user);
    const comunidad = new Comunidad({
        name:req.body.name, 
        password: req.body.password, 
        numIntegrants: req.body.numIntegrants,
        budget: req.body.budget,
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

comunidadController.updateComunidad = async(req,res) => {
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
    
};

module.exports = comunidadController;