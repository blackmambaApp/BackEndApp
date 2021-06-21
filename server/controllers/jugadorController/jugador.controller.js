const Jugador = require('../../models/equipoModel/jugador');
const User = require('../../models/userModel/users');
// const scrapePlayers = require("../../scrapping/jugadores_scrapping");
const jugadorController = {};
const cheerio = require("cheerio");
const axios = require('axios');

async function scrapePlayers() {
    const pageClasification = await axios.get('https://www.acb.com/');
    const players = [];
    const dataTeam = [];
    const $ = cheerio.load(pageClasification.data);
    $('.contenedor_logos_equipos').find("a").map((_,element) => {
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
                playerImg: player.img_jugador
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

module.exports = jugadorController;