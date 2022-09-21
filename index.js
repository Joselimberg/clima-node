import * as dotenv from 'dotenv';
dotenv.config()

import { inquirerMenu, leerInput, listarLugares, pausa } from "./helpers/inquirer.js";
import { Busquedas } from "./models/busquedas.js";

const main = async() => {
    
    const busquedas =  new Busquedas();
    let opt;

    do {
        // Imprimir el menu
        opt = await inquirerMenu();

        switch (opt) {
            case 1:
                // Mostrar mensaje
                const termino = await leerInput('Ciudad: ')
                // Buscar los lugares
                const lugares = await busquedas.ciudad( termino );
                // Seleccionar el lugar
                const id = await listarLugares( lugares );
                if( id === '0' ) continue;

                const lugarSel = lugares.find(lugar => lugar.id === id);
                // console.log(lugarSel);
                const { nombre, lng, lat } = lugarSel;
                // Guardar en DB
                busquedas.agregarHistorial( nombre )
                // CLima
                const { temp, min, max, desc } = await busquedas.climaLugar( lat, lng );
                // Mostrar resultados
                console.clear();
                console.log('\n Información del lugar\n'.green);
                console.log('Ciudad:', nombre.green);
                console.log('Lat:', lat);
                console.log('Lng:', lng);
                console.log('Temperatura:', temp + ' °C');
                console.log('Minima:', min + ' °C');
                console.log('Máxima:', max + ' °C');
                console.log('Como está el clima:', desc.green);
            break;
            
            case 2:
                // busquedas.historial.forEach((lugar, i) => {
                busquedas.historialCapitalizado.forEach((lugar, i) => {
                    const idx = `${ i + 1 }.`.green;
                    console.log(` ${ idx } ${ lugar } `);
                });
            break;
        }

        await pausa();

    } while ( opt !== 0 );
}

main();