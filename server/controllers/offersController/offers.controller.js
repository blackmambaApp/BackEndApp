const Comunidad = require('../../models/comunidadModel/comunidad');
const User = require('../../models/userModel/users');
const Equipo = require('../../models/equipoModel/equipo');
const Jugador = require('../../models/equipoModel/jugador');
const Offer = require('../../models/offerModel/offer');
const Notice = require('../../models/noticeModel/notice');
const offersController = {}; 
const moment = require('moment');
const Utiles = require('../../utiles/utils');

offersController.createOffer = async(req,res) => { 
    const offer = req.body; 
    let actualTeam = null;
    if(offer.actualTeam.name === 'System Team'){
        actualTeam = offer.actualTeam;
    }else{
        actualTeam = await Equipo.findOne({name : offer.actualTeam.name});
    }

    const newOffer = new Offer({
        comunity: offer.comunity,
        status: 'Pending',
        actualTeam: actualTeam,
        offerTeam: offer.offerTeam,
        player : offer.player,
        offerAmount : offer.offerAmount,
        dateOffer : offer.dateOffer
    })

    newOffer.save((err,doc) => {
        if(err) {
            console.log("Error al crear la oferta");
            res.status(204).send("Error al crear la oferta");
        }else { 
            res.status(200).send(doc);
        }
     }); 
}
 
offersController.acceptOffer = async (req,res) => { 
    const {offerId} = req.params; 

    let offer = await Offer.findById(offerId).populate({path:'player'}); 

    let allOffers = await Offer.find({comunity:offer.comunity});
    let indexOfActualOffer = allOffers.findIndex(o => o._id.toString() === offer._id.toString());
    allOffers.splice(indexOfActualOffer, 1); 
    
    let actualTeamId = offer.actualTeam._id; 
    let offerTeamId = offer.offerTeam._id; 
    //Ya es el ID pq es lo que se almacena en Base de Datos en el objeto Offer
    let comunityId = offer.comunity; 
    let playerId = offer.player._id; 
    
    const actualTeam = await Equipo.findById(actualTeamId);
    const offerTeam = await Equipo.findById(offerTeamId)
    const community = await Comunidad.findById(comunityId);
    const player = community.players.filter(p => p._id.toString() === playerId.toString())[0];
    const playerIndexComunity = community.players.findIndex(p => p._id.toString() === playerId.toString());
    
    
    let offersForThisTeamAndPlayer = allOffers.filter(o => o.actualTeam._id.toString() === actualTeam._id.toString() && o.player._id.toString() === player._id.toString());
    offersForThisTeamAndPlayer.forEach((offer) => {
        offer.status = 'Rejected';
        offer.save();
    })
    
    
    if (actualTeam === null) {
        offer.status = 'Inactive'; 
        offer.save();
        res.status(204).send('Oferta Inactiva porque el equipo que era dueño del jugador no existe')
    }
    
    if (offerTeam === null) { 
        offer.status = 'Inactive'; 
        offer.save();
        res.status(204).send('Oferta Inactiva porque el equipo que realizó la oferta por el jugador no existe')
    }

    const index = actualTeam.players.findIndex(playerT => playerT._id.toString() === playerId.toString());
    if(index > -1) {
        actualTeam.players.splice(index, 1);    
        player.status = 'ConEquipo'
        const offerTeamCopy = {
            _id: offerTeam._id,
            name: offerTeam.name,
            image: offerTeam.image
        };
        player.team = offerTeamCopy; 
        community.players.splice(playerIndexComunity, 1, player); 
        
        offerTeam.players.push(player); 
        offer.status = 'Accepted';
        offer.save();

        actualTeam.budget = actualTeam.budget + offer.offerAmount;
        offerTeam.budget = offerTeam.budget - offer.offerAmount;
        offerTeam.numPlayers = offerTeam.players.length;
        actualTeam.numPlayers = actualTeam.players.length;

        let content = 'El club '.concat(offerTeam.name)
                                .concat(' ha fichado al jugador ')
                                .concat(player.name)
                                .concat(' procedente del club ')
                                .concat(actualTeam.name)
                                .concat(' por valor de ')
                                .concat(Utiles.formatoES(offer.offerAmount))
                                .concat('€');
        const newNotice = new Notice({
            comunity: comunityId,
            content: content, 
            offer: offer, 
            status: 'NotShowed',
            type: 'Transfer',
            users: [],
        })

        newNotice.save();

        actualTeam.save((err,doc) => {
            if(err) {
                console.log("Error al guardar el equipo actual actualizando una oferta");
                res.status(409).send("Error al guardar el equipo actual actualizando una oferta");
            }else { 
                offerTeam.save((err,doc) => {
                    if(err) {
                        console.log("Error al guardar el equipo que realiza la oferta actualizando una oferta");
                        actualTeam.players.push(player);
                        actualTeam.save(); 
                        res.status(409).send("Error al guardar el equipo actual actualizando una oferta");
                    }else { 
                        community.save((err,doc) => {
                            if(err) {
                                res.status(409).send("Error actualizando comunidad de la oferta");
                            }else{
                                res.status(200).send(offer);
                            }
                        })
                    }
                });

            }
        });
    }
}

offersController.rejectOffer = async (req,res) => { 
    const {offerId} = req.params; 

    let offer = await Offer.findById(offerId)
                            .populate({path:'player'})

    offer.status = 'Rejected';
    offer.save((err,doc) => {
        if(err) {
            res.status(203).send("Error actualizando la oferta");
        }else{
            res.status(200).send(doc);
        }
    })


}

offersController.inactivateOffers = async (req,res) => { 
    const offers = await Offer.find({status : 'Pending'}); 
    let fechaActual = moment().utc();
    offers.forEach((offer) => {
        let fechaOferta = moment(offer.dateOfOffer).utc();
        if(fechaOferta.add(2,'days').isBefore(fechaActual)){
            offer.status = 'Inactive';
            offer.save();
        }
    })
}


offersController.getOffersToTeam = async (req,res) => {
    const {teamId} = req.params; 

    const equipo = await Equipo.findById(teamId); 

    if(equipo != null) { 
        const allOffers = await Offer.find().populate({path: 'player'});
        const offersRecived = allOffers.filter(o => o.actualTeam.name === equipo.name);
        const offersDone = allOffers.filter(o => o.offerTeam.name === equipo.name);;
        
        const ordenedOffersR = offersRecived.sort(Utiles.compareOffers);
        const ordenedOffersD = offersDone.sort(Utiles.compareOffers);
        
        const offers = [...ordenedOffersR, ...ordenedOffersD]; 
        res.status(200).send(offers);
    }else {
        res.status(203).send('No exiten ofertas')
    }
}

offersController.getOffersById = async (req,res) => {
    const {offerId} = req.params; 

    const offer = await Offer.findById(offerId)
                            .populate({path: 'player'});
    
    res.status(200).send(offer);
}

module.exports = offersController;
