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
    var comunidad = await Comunidad.findById(idComunidad).populate({path:'players'});
    var equipos = await Equipo.find({comunidad : comunidad}).populate({path:'players'});

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
    await newTeam.save();
    finalPlayers.forEach(player => {
        var indice = comunidad.players.indexOf(player);
        player.status = 'conEquipo'
        comunidad.players.splice(indice, 1,player);    
    })
    await Comunidad.findByIdAndUpdate(idComunidad, {$set: comunidad});
    res.status(200).send(newTeam);
};

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
module.exports = teamController;