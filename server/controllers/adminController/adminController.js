const Jugador = require('../../models/equipoModel/jugador');
const User = require('../../models/userModel/users');
const PuntosJugador = require('../../models/jornadaJugadorPuntos/jornadaEquipo');
const Offer = require('../../models/offerModel/offer');
const Jornada = require('../../models/jornadaJugadorPuntos/jornada');
const Comunidad = require('../../models/comunidadModel/comunidad');
const Equipo = require('../../models/equipoModel/equipo');
const Notice = require('../../models/noticeModel/notice');
const JornadaEquipo = require('../../models/jornadaJugadorPuntos/jornadaEquipo');
const Utiles = require('../../utiles/utils');

const adminController = {};



adminController.refreshAllComunityMarkets = async(req,res) => {

    const comunidades = await Comunidad.find({});
    
    comunidades.forEach((comunidad,index) => {
        const playersAbleToLeaveToMarket = comunidad.players.filter(player => player.status === 'Transferible' &&  player.team.name === 'System Team');
        playersAbleToLeaveToMarket.forEach((player) => {
            const indexOf = comunidad.players.findIndex(p => p._id.toString() === player._id.toString());
            player.status = 'Libre';
            comunidad.players.splice(indexOf, 1, player); 
        })
        //Hacemos un filtrado para evitar coger ninguno de los jugadores que acabamos de sacar del mercado. 
        var names = new Set(playersAbleToLeaveToMarket.map(player => player.name))
        const playersAbleToPushToMarket = comunidad.players.filter(player => player.status === 'Libre' &&  player.team.name === 'System Team' && !names.has(player.name));

        const playersToMarket = Utiles.getRandom(playersAbleToPushToMarket, 3);
        playersToMarket.forEach((player) => {
            const indexOf = comunidad.players.findIndex(p => p._id.toString() === player._id.toString());
            player.status = 'Transferible';
            comunidad.players.splice(indexOf, 1, player); 
        })
        
        comunidad.save((err,doc) => {
            if(err) {
                console.log("Error al refrescar el mercado");
                res.status(204).send("Error al refrescar el mercado");
            }else { 
                let content = 'El administrador ha refrescado el mercado.';
                const newNotice = new Notice({
                     comunity: comunidad._id,
                     content: content,  
                     status: 'NotShowed',
                     type: 'TeamIn',
                     users: [],
                 })
                 newNotice.save();
            }});
    });

    res.status(200).send('Mercados actualizados correctamente');
}

adminController.manageAdminOffers = async(req,res) => {

    const comunidades = await Comunidad.find({});

    comunidades.forEach(async(comunidad, index) => {
        let offersForComunity = await Offer.find({comunity : comunidad._id.toString()}).populate({path:'player'});
        let offersToAdmin = offersForComunity.filter(o => o.actualTeam.name === 'System Team');
        let comunidadPlayersOnMarketByAdmin = comunidad.players.filter(player => player.status === 'Transferible' && player.team.name === 'System Team');
        comunidadPlayersOnMarketByAdmin.forEach(async(player) => {
            let offersForAdminToPlayer = offersToAdmin.filter(o => o.player.name === player.name);
            if(offersForAdminToPlayer.length !== 0 && offersForAdminToPlayer.length === 1){
                let offerToAccept = offersForAdminToPlayer[0];
                if(player.transferValue - offerToAccept.offerAmount > 100){
                    offer.status = 'Rejected';
                    offer.save();
                }else{
                    player.status = 'ConEquipo';
                    let offerTeam = await Equipo.findOne({name : offerToAccept.offerTeam.name});
                    let indexOfPComunity = comunidad.players.findIndex(p => p.name === player.name);
                    const offerTeamCopy = {
                        _id: offerTeam._id,
                        name: offerTeam.name,
                        image: offerTeam.image
                    };
                    player.team = offerTeamCopy; 
                    comunidad.players.splice(indexOfPComunity, 1, player); 
                    offerTeam.players.push(player); 
                    offerToAccept.status = 'Accepted';
                
                    offerToAccept.budget = offerTeam.budget - offerToAccept.offerAmount;
                    offerToAccept.numPlayers = offerTeam.players.length;
                    offerToAccept.save();
                    offerTeam.save();

                    let content = 'El club '.concat(offerTeam.name).concat(' ha fichado al jugador ').concat(player.name).concat(' procedente del sistema por valor de ').concat(Utiles.formatoES(offerToAccept.offerAmount)).concat('€');
                    const newNotice = new Notice({
                        comunity: comunidad._id,
                        content: content, 
                        offer: offerToAccept, 
                        status: 'NotShowed',
                        type: 'Transfer',
                        users: [],
                    })
                    newNotice.save();
                    comunidad.save();
                }
            }else if(offersForAdminToPlayer.length !== 0 && offersForAdminToPlayer.length > 1){
                let offersForAdminToPlayerOrdered = offersForAdminToPlayer.sort(Utiles.compareOffersByAmount)
                offersForAdminToPlayerOrdered.forEach(async(offer, index) => {
                    if(index === 0){
                        if(player.transferValue - offer.offerAmount > 100){
                            offer.status = 'Rejected';
                            offer.save();
                        }else{
                            let offerTeam = await Equipo.findOne({name : offer.offerTeam.name});
                            let indexOfPComunity = comunidad.players.findIndex(p => p.name === player.name);
                            player.status = 'ConEquipo'
                            const offerTeamCopy = {
                                _id: offerTeam._id,
                                name: offerTeam.name,
                                image: offerTeam.image
                            };
                            player.team = offerTeamCopy; 

                            comunidad.players.splice(indexOfPComunity, 1, player); 

                            offerTeam.players.push(player); 
                            offer.status = 'Accepted';
                            offer.save();
                        
                            offerTeam.budget = offerTeam.budget - offer.offerAmount;
                            offerTeam.numPlayers = offerTeam.players.length;

                            let content = 'El club '.concat(offerTeam.name).concat(' ha fichado al jugador ').concat(player.name).concat(' procedente del sistema por valor de ').concat(Utiles.formatoES(offer.offerAmount)).concat('€');
                            const newNotice = new Notice({
                                comunity: comunidad._id,
                                content: content, 
                                offer: offer, 
                                status: 'NotShowed',
                                type: 'Transfer',
                                users: [],
                            })
                            newNotice.save();
                            offerTeam.save();
                            comunidad.save();
                        }
                    }else {
                        offer.status = 'Rejected';
                        offer.save();
                    }
                })
            }
        })
    })
}


module.exports = adminController;