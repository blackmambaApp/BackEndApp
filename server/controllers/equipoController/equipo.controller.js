const User = require('../../models/userModel/users');
const Comunidad = require('../../models/comunidadModel/comunidad');
const Equipo = require('../../models/equipoModel/equipo');
const Jugador = require('../../models/equipoModel/jugador');
const teamController = {};
const shuffled = [];



teamController.getEquipoByComunidad = async (req, res) => {
    // const users = await User.find();
    // res.send(users);
}

teamController.createTeamInComunity = async(req, res) => {
    const {idComunidad,idUser} = req.params;
    var comunidad = new Comunidad()
    await Comunidad.findById(idComunidad).populate({path:'players'}).then(res => {
        comunidad = res;
    });
    const user = await User.findById(idUser);
    const players = []; //jugadores a los que aun hay que cambiarles el estado
    const finalPlayers = [];
    const playersFreeA = comunidad.players.filter(player => player.status === "Libre" && player.position ==="A")
    const shuffledFreeA = playersFreeA.sort(() => 0.5 - Math.random());
    players.push(shuffledFreeA.slice(0,1));
    players.push(shuffledFreeA.slice(1,2));
    //Players free who plays Base
    const playersFreeB = comunidad.players.filter(player => player.status === "Libre" && player.position ==="B")
    const shuffledFreeB =  playersFreeB.sort(() => 0.5 - Math.random());
    players.push(shuffledFreeB.slice(0,1));
    players.push(shuffledFreeB.slice(1,2));
    //Players free who plays Ala Pivot
    const playersFreeAP = comunidad.players.filter(player => player.status === "Libre" && player.position ==="AP")
    const shuffledFreeAP = playersFreeAP.sort(() => 0.5 - Math.random());
    players.push(shuffledFreeAP.slice(0,1));
    players.push(shuffledFreeAP.slice(1,2));
    //Players free who plays Escolta
    const playersFreeE = comunidad.players.filter(player => player.status === "Libre" && player.position ==="E")
    const shuffledFreeE = playersFreeE.sort(() => 0.5 - Math.random());
    players.push(shuffledFreeE.slice(0,1));
    players.push(shuffledFreeE.slice(1,2));
    //Players free who plays Pivot
    const playersFreeP = comunidad.players.filter(player => player.status === "Libre" && player.position ==="P")
    const shuffledFreeP = playersFreeP.sort(() => 0.5 - Math.random());
    players.push(shuffledFreeP.slice(0,1));
    players.push(shuffledFreeP.slice(1,2));
    players.forEach(player => {
        finalPlayers.push(player[0]);
    })
    let numPlayers = players.length;
    const newTeam = new Equipo({
        name: req.body.name,
        budget: comunidad.budget, 
        numPlayers: numPlayers,
        players: finalPlayers,
        comunidad: comunidad,
        user: user
    });
    console.log(finalPlayers);
    console.log(newTeam);
    await newTeam.save();

    finalPlayers.forEach(player => {
        var indice = comunidad.players.indexOf(player);
        player.status = 'conEquipo'
        comunidad.players.splice(indice, 1,player);    
    })
    await Comunidad.findByIdAndDelete(idComunidad, {$set: comunidad});
    res.status(200).send(newTeam);
};

changePlayerStatus = (player) => {
    Jugador.findByIdAndUpdate(player[0].id,{"status": "conEquipo"}, (err,result) => {
        if(err) {
            console.log("error actulizando del estado de los jugadores");
        }else { 
            console.log("Estado del jugador ", result.name, " actualizado a ", result.status);
            return result;
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
    await Equipo.findOne({user: idUser})
        .populate({path:'players'})
        .populate({path:'alignedPlayers'}).then(team => {
            res.status(200).send(team);
        })
}
module.exports = teamController;