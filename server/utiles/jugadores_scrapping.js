const cheerio = require("cheerio");
const axios = require('axios');

async function scrapePlayers() {
    const pageClasification = await axios.get('https://www.acb.com/');
    const players = [];
    const dataTeam = [];
    const $ = cheerio.load(pageClasification.data);
    $('.contenedor_logos_equipos').map((_,element) => {
        const enlace = $(element).find("a").attr('href');
        const equipo = $(element).find("img").attr('alt');
        const data = {
            equipo: equipo,
            enlace: enlace
        }
        
        dataTeam.push(data);
    }).get();
    for (i = 0; i<dataTeam.length; i++){
        const pageContent = await axios.get('https://www.acb.com'.concat(dataTeam[i].enlace));
        const $ = cheerio.load(pageContent.data);
        $('.caja_miembro_plantilla.caja_jugador_medio_cuerpo').map((_, el) => {
            const pos = $(el).find(".posicion.roboto_condensed").text();
            const nombre = $(el).find(".nombre.roboto_condensed_bold").text();
            const player = {
                name: nombre,
                pos:pos,
                equipo: dataTeam[i].equipo
            }
            players.push(player);
        }).get();
    }
    return players;
}

module.exports = scrapePlayers();
