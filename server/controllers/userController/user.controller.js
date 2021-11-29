const User = require('../../models/userModel/users');
const Comunidad = require('../../models/comunidadModel/comunidad');
const Equipo = require('../../models/equipoModel/equipo');
const Notice = require('../../models/noticeModel/notice');
const bcrypt = require('bcrypt-nodejs');
const userController= {};
const jwt = require('jsonwebtoken');

userController.getUsers = async (req, res) => {
    const users = await User.find();
    res.send(users);
}

userController.createUsers = async(req, res) => {
    const newUser = new User({
        rol: req.body.rol,
        firstName: req.body.firstName, 
        lastName: req.body.lastName, 
        nickName: req.body.nickName, 
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password)
    });
    var userByNickname = await User.findOne({nickName:req.body.nickName});
    var userByEmail = await User.findOne({email:req.body.email});
    if(userByNickname || userByEmail){
        res.status(400).send("El nombre de usuario o el email ya están registrados, por favor pruebe a introducir otros.");
    }else{
    await newUser.save();
    const expiresIn = 24*60*60;
    const token = await jwt.sign({_id:newUser._id}, 'secretKey',{expiresIn:expiresIn});
    const dataUser = {
        id:newUser._id,
        rol: newUser.rol,
        email:newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        nickName: newUser.nickName,
        password: newUser.password,
        accessToken:token,
        expiresIn:expiresIn
    }
    res.status(200).send(dataUser);
    }
};

userController.signUserAfterComunityCreate = async(req,res) => {
    const {email,password} = req.body;
    const user = await User.findOne({email});
    const comunidad = await Comunidad.findOne({users : user});
    if(!user){
        return res.status(401).send('El email no existe');
    }else { 
        const resultPass = password == user.password;
        if(resultPass){
            const expiresIn=30*60;
            const accessToken = jwt.sign({id:user._id}, 'SecretKey', {expiresIn:expiresIn});

            const dataUser = {
                id:user._id,
                rol: user.rol,
                email:user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                nickName: user.nickName,
                password: user.password,
                accessToken:accessToken,
                expiresIn:expiresIn,
                comunidad: comunidad
            }
            res.send({dataUser});
        }else { 
            res.status(409).send({message:'Algo ha ido mal.'})
        }
    }
}


userController.singnWithUser = async(req, res) => {
    const {nickName,password} = req.body;
    const user = await User.findOne({nickName});
    if(!user){
        return res.status(401).send('El usuario no existe');
    }else{
        const query = {users: user.id}
        const comunidad = await Comunidad.findOne(query);
        const resultPassword = bcrypt.compareSync(password, user.password);
        if(resultPassword){
            const expiresIn=30*60;
            const accessToken = jwt.sign({id:user._id}, 'SecretKey', {expiresIn:expiresIn});

            const dataUser = {
                id:user._id,
                rol: user.rol,
                email:user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                nickName: user.nickName,
                password: user.password,
                accessToken:accessToken,
                expiresIn:expiresIn,
                comunidad: comunidad
            }
            res.send({dataUser});
        }else { 
            res.status(409).send({message:'Algo ha ido mal.'})
        }
    }
}

userController.getOneUser = async(req, res) => {
    const {id} = req.params;
    const user = await User.findById(id);
    const query = {users: user.id}
    const comunidad = await Comunidad.findOne(query);
    const userRes = {
        id:user._id,
        rol: user.rol,
        email:user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        nickName: user.nickName,
        password: user.password,
        comunidad: comunidad
    }
    res.send(userRes);
};

userController.getOneUserByEmail = async(req, res) => {
    const {email} = req.params;
    const user = await User.findOne({email: email});
    res.send(user);
}

userController.deleteUser = async(req,res) => {
    const {id} = req.params;
    await User.findByIdAndDelete(id);
    res.json({
        status: 'Usuario eliminado'
    });
};

userController.updateUser = async(req,res) => {
    const{id} = req.params;
    const user = await User.findById(id); 
    const resultPassword = bcrypt.compareSync(req.body.password, user.password);

    if(resultPassword) {
        let password = user.password;
        if(!(req.body.newPassword === undefined || req.body.newPassword === null)){
            password = bcrypt.hashSync(req.body.newPassword)
        }
        const newUser = {
            id:req.body._id,
            rol: req.body.rol,
            email:req.body.email,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            nickName: req.body.nickName,
            password: password,
            comunidad: req.body.comunidad
        }
        await User.findByIdAndUpdate(id, {$set:newUser}, {new:true}, (err,result) => {
            if(err){
                res.status(203).send('Error actualizando usuario');
            }else{
                res.status(200).send(result);
            }
        });
    }else{
        res.status(204).send('Contraseña incorrecta');
    }
}

userController.leaveUserFromComunity = async(req, res) => { 
    const {userId, comunityId} = req.params; 
    const password = req.body.password;
    const user = await User.findById(userId); 
    const resultPassword = bcrypt.compareSync(password, user.password);
    if(resultPassword) {
        const equipo = await Equipo.findOne({user: user}); 

        const comunidad = await Comunidad.findById(comunityId).populate({path:'user'})
                                                              .populate({path:'teams'})
                                                              .populate({path:'owner'}); 

        comunidad.users.forEach((u,index) =>{
            if(u._id.toString() === user._id.toString()) {
                comunidad.users.splice(index, 1);
            }
        })

        comunidad.teams.forEach((eq, index) =>{
            if(eq._id.toString() === equipo._id.toString()) {
                comunidad.teams.splice(index, 1); 
            }
        })

        //Falseo del TEAM ADMIN
        teamAdmin = {
            _id: '00000000000000000000000admin',
            name: 'System Team',
            image: '/static/media/logo.ab694774.png',
        }

        equipo.players.forEach((playerTeam, idx) => {
            const player = comunidad.players.filter(p => p._id.toString() === playerTeam._id.toString())[0];
            const indxPC = comunidad.players.findIndex(p => p._id.toString() === playerTeam._id.toString())
            player.status = 'Libre';
            player.team = teamAdmin;
            comunidad.players.splice(indxPC, 1, player); 
        })

        user.comunidad = null;

        if(comunidad.owner._id.toString() === user._id.toString()){
            const user = comunidad.users[0];
            comunidad.owner = user; 
        }

        Equipo.deleteOne(equipo).then((doc) => {
            comunidad.save();
            user.save();
            let content = 'El usuario '.concat(user.firstName).concat(' dueño del equipo ').concat(equipo.name).concat(' ,ha abandonado la comunidad.');
            const newNotice = new Notice({
                comunity: comunityId,
                content: content,  
                status: 'NotShowed',
                type: 'TeamOut',
                users: [],
            });
            newNotice.save();
            res.status(200).send('Comunidad abandonada correctamente.')
        })
    } else{
        res.status(204).send('Contraseña incorrecta.')
    }


}

module.exports = userController;