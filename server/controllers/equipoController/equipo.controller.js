const User = require('../../models/userModel/users');
const Comunidad = require('../../models/comunidadModel/comunidad');
const Equipo = require('../../models/equipoModel/equipo');
const Notice = require('../../models/noticeModel/notice');
const JornadaEquipo = require('../../models/jornadaJugadorPuntos/jornadaEquipo');
const teamController = {};

teamController.getEquipoByComunidad = async (req, res) => {
    const {idComunidad} = req.params; 
    var equipos = await Equipo.find({comunidad : idComunidad}).populate({path:"user"}); 
    res.status(200).send(equipos);
}

teamController.createTeamInComunity = async(req, res) => {
    const {idComunidad,idUser} = req.params;
    
    var equipoBD = await Equipo.findOne({name: req.body.name});

    if(equipoBD !== null){
        res.status(204).send('UPS.Lo sentimos este nombre ya ha sido seleccionado');
    }else{    
        var comunidad = await Comunidad.findById(idComunidad).populate({path:"teams"});
        var equipos = await Equipo.find().where("comunidad", comunidad.toObject());
        
        let playerAsigned = [];
        equipos.forEach((equipo) => {
            equipo.players.forEach((player) => {
                playerAsigned.push(player);
            })
        })
        // let playersAbleToAsign = comunidad.players.concat(playerAsigned);
        var names = new Set(playerAsigned.map(player => player.name))
        let playersAbleToAsign = comunidad.players.filter(player => !names.has(player.name));

        const user = await User.findById(idUser);
        const players = []; //jugadores a los que aun hay que cambiarles el estado
        const finalPlayers = [];
        const playersFreeA = playersAbleToAsign.filter(player => player.status === "Libre" && player.position ==="A")
        const shuffledFreeA = playersFreeA.sort(() => 0.5 - Math.random());
        players.push(shuffledFreeA.slice(0,1));
        players.push(shuffledFreeA.slice(1,2));
        //Players free who plays Base
        const playersFreeB = playersAbleToAsign.filter(player => player.status === "Libre" && player.position ==="B")
        const shuffledFreeB =  playersFreeB.sort(() => 0.5 - Math.random());
        players.push(shuffledFreeB.slice(0,1));
        players.push(shuffledFreeB.slice(1,2));
        //Players free who plays Ala Pivot
        const playersFreeAP = playersAbleToAsign.filter(player => player.status === "Libre" && player.position ==="AP")
        const shuffledFreeAP = playersFreeAP.sort(() => 0.5 - Math.random());
        players.push(shuffledFreeAP.slice(0,1));
        players.push(shuffledFreeAP.slice(1,2));
        //Players free who plays Escolta
        const playersFreeE = playersAbleToAsign.filter(player => player.status === "Libre" && player.position ==="E")
        const shuffledFreeE = playersFreeE.sort(() => 0.5 - Math.random());
        players.push(shuffledFreeE.slice(0,1));
        players.push(shuffledFreeE.slice(1,2));
        //Players free who plays Pivot
        const playersFreeP = playersAbleToAsign.filter(player => player.status === "Libre" && player.position ==="P")
        const shuffledFreeP = playersFreeP.sort(() => 0.5 - Math.random());
        players.push(shuffledFreeP.slice(0,1));
        players.push(shuffledFreeP.slice(1,2));
        players.forEach(player => {
            finalPlayers.push(player[0]);
        })
        finalPlayers.forEach((player,index) => {
            player.status = 'ConEquipo';
            player.team = {name: req.body.name,image: req.body.image};
            finalPlayers.splice(index,1,player);
        })
        let numPlayers = players.length;

        const newTeam = new Equipo({
            name: req.body.name,
            image: req.body.image,
            budget: comunidad.budget, 
            numPlayers: numPlayers,
            players: finalPlayers,
            comunidad: comunidad,
            user: user
        });
        await newTeam.save((err,doc) => {
           if(err) {
               console.log("Error al crear el equipo");
               res.status(409).send("Error al crear el equipo");
           }else { 
               let content = 'El usuario '.concat(user.firstName).concat(' dueño del equipo ').concat(doc.name).concat(' ,se ha unido a la comunidad.');
               const newNotice = new Notice({
                    comunity: idComunidad,
                    content: content,  
                    status: 'NotShowed',
                    type: 'TeamIn',
                    users: [],
                })
                newNotice.save();
                res.status(200).send(doc);
           }
        });
    }
}

teamController.getJourneysForTeam = async(req, res) => {
    const{idTeam} = req.params; 
    
    var journeyTeam = await JornadaEquipo.find({team:idTeam}).populate({path:"journey"});

    res.status(200).send(journeyTeam);
    
}


teamController.actualizaComunidadConEquipo = async(req, res) => {
    const {idComunidad, idTeam} = req.params;
    
    var comunidad = await Comunidad.findById(idComunidad).populate({path:"teams"});
    var equipo = await Equipo.findById(idTeam);
    const equipoCopy = {
        _id: equipo._id,
        name: equipo.name,
        image: equipo.image
    };
    equipo.players.forEach((player) => {
        var indice = comunidad.players.findIndex(p => p._id.toString() === player._id.toString());
        player.status = 'ConEquipo';
        player.team = equipoCopy;
        comunidad.players.splice(indice, 1,player);  
    })
    comunidad.teams.push(equipo);
    await Comunidad.findByIdAndUpdate(idComunidad, {$set: comunidad}, (err,result) => {
    if(err) {
            res.status(409).send("Se ha producido un error al actualizar la comunidad");
        }
        if(result) {
            res.status(200).send(comunidad);
        }
    });

}

teamController.changeAlignmentForTheTeam = async (req,res) => { 
    const { idTeam }= req.params;
    const team = await Equipo.findById(idTeam);
    const newAlignement = []
    newAlignement.push(req.body.base);
    newAlignement.push(req.body.escolta);
    newAlignement.push(req.body.alaPivot);
    newAlignement.push(req.body.pivot);
    newAlignement.push(req.body.alero);
    
    if(team != null){
        await Equipo.findByIdAndUpdate(idTeam, {$set: {alignedPlayers : newAlignement}}, (err,result) => {
            if(err) {
                console.log(err)
                res.status(404);
            }else{
                console.log("Update correcto")
                return res.status(200).send(newAlignement);
            }
        }); 
    }
}

teamController.getTeamByUserId = async(req,res) => { 
    const {idUser} = req.params; 
    await Equipo.findOne({user: idUser}).then(team => {
            res.status(200).send(team);
    }).catch((e) => {
        res.status(409);
    })
}

teamController.updateTeam = async(req, res) => {
    const team = req.body;
    const id = team._id;

    Equipo.findByIdAndUpdate(id, {$set: team}, (err, result) => {
        if(err) {
            console.log(err)
            res.status(404);
        }else{
            console.log("Update correcto")
            return res.status(200).send(team);
        }
    } )
}

teamController.deleteTeamAndExitComunity = async(req, res) => {
    const {idTeam, nickName} = req.params;
    const user = await User.findOne({nickName: nickName});
    const comunidadEsOwner = await Comunidad.findOne({owner: user}).populate({path: "users"});
    const comunidadUser = await Comunidad.findOne({users: user});
    const equipo = await Equipo.findById(idTeam).populate({path:"comunidad"});
    const comunidad = equipo.comunidad;
    
    await Equipo.deleteOne(equipo).then(async (result) => {
        equipo.players.forEach((player) => {
            var playerComunity = comunidad.players.filter(p => p.name == player.name)[0];
            playerComunity.status = "Libre";
            var indice = comunidad.players.findIndex(p => p.name == player.name);
            comunidad.players.splice(indice, 1, playerComunity);
        })
        let mensaje = [];
        if(comunidadEsOwner != null) {
            if (comunidad._id.toString() === comunidadEsOwner._id.toString()) { 
                const users = comunidadEsOwner.users;
                //Menos el jugador que queremos eliminar
                if((users.length - 1) === 0){
                    await Comunidad.deleteOne(comunidad);
                    user.comunidad = null;
                    user.save();
                    mensaje.push("Comunidad eliminada.");
                }else{
                    var indexOfUserToDeleteFromArray = users.findIndex(u => u.id == user.id); 
                    users.splice(indexOfUserToDeleteFromArray, 1); 
                    comunidad.owner = users[0];
                    var indexTeam = comunidad.teams.findIndex(team => team._id.toString() === equipo._id.toString());
                    if (indexTeam > -1){
                        comunidad.teams.splice(indexTeam, 1);
                        mensaje.push("Equipo eliminado de la comunidad."); 
                    }
                    var indexUser = comunidad.users.findIndex(u => u._id.toString() === user._id.toString());
                    if (indexUser > -1) { 
                        comunidad.users.splice(indexUser, 1);
                        mensaje.push("Jugador eliminado de la comunidad.")
                    }
                    user.comunidad = null; 
                    user.save();
                    comunidad.save();
                }
            }
        }else if(comunidadUser != null) {
            const users = comunidadUser.users;
            if((users.length - 1) === 0){
                await Comunidad.deleteOne(comunidad);
                user.comunidad = null;
                user.save();
                mensaje.push("Comunidad eliminada.");
            }else{
                var indexTeam = comunidad.teams.findIndex(team => team._id.toString() === equipo._id.toString());
                if (indexTeam > -1){
                    comunidad.teams.splice(indexTeam, 1);
                }
                var indexUser = comunidad.users.findIndex(u => u._id.toString() === user._id.toString());
                if (indexUser > -1) { 
                    comunidad.users.splice(indexUser, 1);
                }
                user.comunidad = null; 
                user.save();
                comunidad.save();
            }
        }
        mensaje.push("Equipo eliminado")
        res.status(200).send(mensaje);
    }).catch((err) => {
        res.status(409).send("El equipo no se ha podido borrar");
    })
    
}
module.exports = teamController;