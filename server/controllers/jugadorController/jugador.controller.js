const Jugador = require('../../models/equipoModel/jugador');
const User = require('../../models/userModel/users');
const Notice = require('../../models/noticeModel/notice');
const Offer = require('../../models/offerModel/offer');
const Jornada = require('../../models/jornadaJugadorPuntos/jornada');
const Comunidad = require('../../models/comunidadModel/comunidad');
const Equipo = require('../../models/equipoModel/equipo');
const JornadaEquipo = require('../../models/jornadaJugadorPuntos/jornadaEquipo');
// const scrapePlayers = require("../../scrapping/jugadores_scrapping");
const jugadorController = {};
const cheerio = require("cheerio");
const axios = require('axios');
var moment = require('moment');

async function scrapePlayers() {
    const pageClasification = await axios.get('https://www.acb.com/club/index/temporada_id/2020/edicion_id/963');
    const players = [];
    const dataTeam = [];
    const $ = cheerio.load(pageClasification.data);
    $('.club').find(".foto").find("a").map((_,element) => {
        const enlace = $(element).attr('href');
        const equipo = $(element).find("img").attr('alt');
        const img  = $(element).find("img").attr('src');
        const data = {
            equipo: equipo,
            enlace: enlace,
            imagen: img
        }
        
        dataTeam.push(data);
    }).get();
    for (i = 0; i<dataTeam.length; i++){
        const pageContent = await axios.get('https://www.acb.com'.concat(dataTeam[i].enlace));
        const $ = cheerio.load(pageContent.data);
        $('.caja_miembro_plantilla.caja_jugador_medio_cuerpo').map((_, el) => {
            const pos = $(el).find(".posicion.roboto_condensed").text();
            const nombre = $(el).find(".nombre.roboto_condensed_bold").text();
            const img_jugador = $(el).find(".foto").find("img").attr("src");
            const player = {
                name: nombre,
                pos:pos,
                equipo: dataTeam[i].equipo,
                img_equipo: dataTeam[i].imagen,
                img_jugador: img_jugador
            }
            players.push(player);
        }).get();
    }
    return players;
}

jugadorController.createAllPlayers = async(req, res) => {
    scrapePlayers().then((result) => {
        result.forEach((player) => { 
            const newPlayer = new Jugador({
                name: player.name,
                position: player.pos,
                transferValue: 5000,
                status: 'Libre',
                realTeam: player.equipo,
                realTeamImg: player.img_equipo,
                playerImg: player.img_jugador,
                points: 0,
                puntuations: []
            })
            newPlayer.save();
        })
        res.status(200).send("Jugadores creados");
    })
    .catch((e) => {
        res.status(409).send("Fallo al recargar todos los jugadores");
    });
};

jugadorController.getAllFreePlayers = async(req, res) => { 
    Jugador.find({status:"Libre"}, (err,result) => {
        if(err){
            res.status(409).send("Error cargando jugadores");
        }else {
            res.status(200).send(result);
        }
    })
}

jugadorController.cargarPuntosJornada = async(req, res) => { 
    const {journeyNumber} = req.params;
    let players = await Jugador.find({}); 
    const allPuntosJugador = [];
    players.forEach((player) => {
        var puntos = Math.round(Math.random()  * (10 - (-5)) + (-5));
        player.points = puntos;
        allPuntosJugador.push(player);
    })

    const journeyDB = await Jornada.findOne({journeyNumber : journeyNumber});
    if(journeyDB != null) { 
        const newJourney = {
            journeyNumber: journeyNumber, 
            playersPoints: allPuntosJugador,
            date: new Date()
        }
        await Jornada.findByIdAndUpdate(journeyDB._id, {$set : newJourney}, (err,result) => {
            if(err){
                res.status(409).send("No se ha podido actualizar la jornada.");
            }else {
                res.status(200).send(result)
            }
        })
    }else {
        const journey = new Jornada({
            journeyNumber: journeyNumber, 
            playersPoints: allPuntosJugador,
            date: new Date()
        })
        journey.save();
        res.status(200).send(journey);
    }
}

jugadorController.actualizaJugadoresComunidad = async(req, res) => { 
    const {journeyNumber} = req.params;

    const journeyDB = await Jornada.findOne({journeyNumber : journeyNumber});

    await Comunidad.find({}).then((comunidades) => {
        comunidades.forEach((comunidad) => {
            comunidad.players.forEach((player,index) => {
                //const playerWithPoints = filterAndReturnPlayer(journeyDB.playersPoints, player);
                const playerForPuntuations = journeyDB.playersPoints.filter(p => p.name === player.name)[0];
                player.points += playerForPuntuations.points
                if(player.puntuations === undefined) {
                    const arrayOfPoints = [];
                    arrayOfPoints.push(playerForPuntuations.points)
                    player.puntuations = arrayOfPoints
                }else{
                    player.puntuations.push(playerForPuntuations.points);
                }
                comunidad.players.splice(index, 1,player);    
            })
            comunidad.save();
        })
        console.log("Los jugadores se han actualizado correctamente en todas las comunidades");
        res.status(200).send("Los jugadores se han actualizado correctamente en todas las comunidades");
    }).catch((e) => {
        console.log("Los jugadores no se han actualizado correctamente en todas las comunidades");
        res.status(409).send("Los jugadores no se han actualizado correctamente en todas las comunidades");
    });
}

jugadorController.generarJornadasYPuntosPorEquipo = async (req,res) => {
    const {journeyNumber} = req.params;
    
    const journeyDB = await Jornada.findOne({journeyNumber : journeyNumber});

    if(journeyDB === null) { 
        res.status(409).send("No esta generada la jornada");
    }else {
        const date = moment();
        const comunidades = await Comunidad.find({}).populate({path:"teams"});
        comunidades.forEach(async (comunidad, index) => { 
            comunidad.teams.forEach((equipo, index) => { 
                if(moment(equipo.dateOfCreation).isBefore(moment(journeyDB.date))){
                    var points = 0;
                    const playersPuntuated = filterPlayersToPuntuate(journeyDB.playersPoints, equipo.players);
                    const playersAligned = filterPlayersToPuntuate(playersPuntuated, equipo.alignedPlayers);
                    const playersNotAligned = filterPlayersNotDuplicated(playersPuntuated, equipo.alignedPlayers);
                    const teamJourney = new JornadaEquipo ({
                        journey : journeyDB, 
                        team: equipo,
                        comunity: comunidad,
                        fecha : date, 
                        playersToPuntuate: playersPuntuated,
                        playersAligned : playersAligned
                    })
                    teamJourney.save();  
                    playersNotAligned.forEach((player, index)=> {
                        const playerTeam = equipo.players.filter(p => p.name === player.name);
                        playerTeam[0].points += player.points;
                        if(playerTeam[0].puntuations === undefined) {
                            const arrayOfPoints = [];
                            arrayOfPoints.push(player.points)
                            playerTeam[0].puntuations = arrayOfPoints
                        }else{
                            playerTeam[0].puntuations.push(player.points);
                        }
                        var indiceP = equipo.players.findIndex(player => player.name === playerTeam[0].name);
                        equipo.players.splice(indiceP, 1, playerTeam[0]); 
                    })
                    playersAligned.forEach((player, index) => {
                        const playerTeam = equipo.players.filter(p => p.name === player.name);
                        playerTeam[0].points += player.points;
                        points += player.points; //Importante sumar los puntos del player que es el que viene de la Jornada y tiene los nuevos puntos a sumar.
                        if(playerTeam[0].puntuations === undefined) {
                            const arrayOfPoints = [];
                            arrayOfPoints.push(player.points)
                            playerTeam[0].puntuations = arrayOfPoints
                        }else{
                            playerTeam[0].puntuations.push(player.points);
                        }
                        var indiceP = equipo.players.findIndex(player => player.name === playerTeam[0].name);
                        var indicePAligned = equipo.alignedPlayers.findIndex(player => player.name === playerTeam[0].name);
                        equipo.players.splice(indiceP, 1, playerTeam[0]); 
                        equipo.alignedPlayers.splice(indicePAligned, 1, playerTeam[0]); 
                    })
                    equipo.points += points;
                    equipo.save();
                }
            })    
        let content = 'Se ha cargado correctamente la jornada  '.concat(journeyDB.name).concat(' para todos los equipos de la comunidad ').concat(comunidad.name);
        const newNotice = new Notice({
        comunity: comunidad._id,
        content: content, 
        status: 'NotShowed',
        users: [],
        })
        
        newNotice.save();
    })
    console.log("Jornada cargada correctamente y puntuaciones asignadas a los equipos.");
    res.status(200).send("Jornada cargada correctamente y puntuaciones asignadas a los equipos.");
    }
}

function filterAndReturnPlayer(players, selectedPlayer) {
    var playerToReturn = {};
    let i = 0;
    while (i <= players.length){
        if(players[i].name === selectedPlayer.name){
            selectedPlayer.points +=  players[i].points
            playerToReturn = selectedPlayer;
            break;
        }
        i += 1;
    }
    if(playerToReturn === null) {
        return null;
    }else{
        return playerToReturn;
    }
}

function filterPlayersToPuntuate(journeyPlayers, alignedPlayers) {
    let playersToPuntuate = [];
    if(alignedPlayers.length !== 0){
        var names = new Set(alignedPlayers.map(player => player.name));
        const validPlayers = journeyPlayers.filter(player => names.has(player.name));
        Array.prototype.push.apply(playersToPuntuate,validPlayers);
    }
    return playersToPuntuate;
}

function filterPlayersNotDuplicated(journeyPlayers, alignedPlayers) {
    let playersToPuntuate = [];
    if(alignedPlayers.length !== 0){
        var names = new Set(alignedPlayers.map(player => player.name));
        const validPlayers = journeyPlayers.filter(player => !names.has(player.name));
        Array.prototype.push.apply(playersToPuntuate,validPlayers);
    }
    return playersToPuntuate;
}


//Actualizamos el estado en el mercado del jugador. 
jugadorController.actualizaJugadorDelEquipoYComunidad = async(req,res) => {
    const {idTeam,idPlayer,status} = req.params; 
    const equipo = await Equipo.findById(idTeam);
    const jugador = await Jugador.findById(idPlayer);
    let jugadorEnAlineacion = false;
    equipo.alignedPlayers.forEach((player) => {
        if(player._id ===  jugador._id.toString()){
            jugadorEnAlineacion = true;
        }
    })
    if(jugadorEnAlineacion === false){
        const equipoCopy = {
            _id: equipo._id,
            name: equipo.name,
            image: equipo.image
        };
        var i = 0;
        while(i < equipo.players.length) {
            if(idPlayer === equipo.players[i]._id.toString()){
                const offers = await Offer.find({player: equipo.players[i]}); 
                offers.forEach((offer) => {
                    offer.status = 'Inactive'
                    offer.save()
                })
                equipo.players[i].team =  equipoCopy;
                equipo.players[i].status = status;
                equipo.players.splice(i, 1, equipo.players[i]);
                break;
            }
            i += 1;  
        }
        const idComunidad = equipo.comunidad.toString();
        const comunidad = await Comunidad.findById(idComunidad);
        var j = 0;
        while(j < comunidad.players.length) {
            if(idPlayer === comunidad.players[j]._id.toString()){
                comunidad.players[j].team = equipoCopy;
                comunidad.players[j].status = status;
                comunidad.players.splice(j, 1, comunidad.players[j]);
                break;
            }
            j += 1;
        }
        equipo.save();
        comunidad.save();
        res.status(200).send(equipo);
    }else {
        res.status(204).send('Jugador en alineacion no puede pasar al mercado.');
    }
}

module.exports = jugadorController;