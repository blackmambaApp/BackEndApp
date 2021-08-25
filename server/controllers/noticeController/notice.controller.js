const Comunidad = require('../../models/comunidadModel/comunidad');
const User = require('../../models/userModel/users');
const Equipo = require('../../models/equipoModel/equipo');
const Jugador = require('../../models/equipoModel/jugador');
const Offer = require('../../models/offerModel/offer');
const Notice = require('../../models/noticeModel/notice');
const noticeController = {}; 
const moment = require('moment');




noticeController.noticesNotShowedForUser = async(req,res) => {
    const {userId} = req.params;

    const notices = await Notice.find({users: {$ne:userId}});

    res.status(200).send(notices); 

}

noticeController.allNoticesForComunity = async(req, res) => {
    const {comunityId} = req.params;

    const notices = await Notice.find({comunity: comunityId})
                                .populate({path:'users'})
                                .populate([{
                                    path:'offer',
                                    populate: {
                                        path: 'player',
                                        model: 'Jugador'
                                    },
                                }]);
                                
    res.status(200).send(notices);
}

noticeController.markAsShow = async(req,res) => {
    const {userId, noticeId} = req.params;

    const notice = await Notice.findById(noticeId)
                               .populate({path:'users'})
                               .populate([{
                                    path:'offer',
                                    populate: {
                                        path: 'player',
                                        model: 'Jugador'
                                    },
                                }]);

    const user = await User.findById(userId);

    notice.users.push(user); 
    
    notice.save((err,doc) => { 
        if(err){
            res.status(204).send('Error actualizando la noticia');
        }else {
            res.status(200).send(notice);
        }
    })
    

}





module.exports = noticeController;


