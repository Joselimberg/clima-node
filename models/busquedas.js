import * as fs from 'fs';
import axios from 'axios';
// const axios = require('axios').default;

class Busquedas {
    historial = [];
    dbpath = './db/database.json';

    constructor() {
        //leer DB si existe
        this.leerDB();
    }

    get historialCapitalizado() {
        // Capitalizar cada palabra
        return this.historial.map( lugar => {
            let palabras = lugar.split(' ');
            palabras = palabras.map( p => p[0].toUpperCase() + p.substring(1) );
            return palabras.join(' ');
        });
    }

    get ParamsMapbox() {
        return {
            'access_token': process.env.MAPBOX_KEY,
            'limit': 5,
            'language': 'es'
        }
    }

    get ParamsOpenweather() {
        return {
            appid: process.env.OPENWEATHER_KEY,
            units: 'metric',
            lang: 'es',
        }
    }

    async ciudad ( lugar = '' ) {
        try {
            //peticion http
            const instance = axios.create({
                baseURL: `https://api.mapbox.com/geocoding/v5/mapbox.places/${ lugar }.json`,
                params: this.ParamsMapbox
            });
            const resp = await instance.get();
            return resp.data.features.map(lugar => ({
                id: lugar.id,
                nombre: lugar.place_name,
                lng: lugar.center[0],
                lat: lugar.center[1],
            }));
        } catch (error) {
            return [];
        }
    }

    async climaLugar( lat, lon ) {
        try {
            //peticion http
            // instancia de axios.create()
            const instance = axios.create({
                baseURL: `https://api.openweathermap.org/data/2.5/weather`,
                params: { ...this.ParamsOpenweather, lat, lon, }
            });
            // resp.data
            const resp = await instance.get();
            const { weather, main } = resp.data;
            
            return {
                desc: weather[0].description,
                min: main.temp_min,
                max: main.temp_max,
                temp: main.temp
            }
        } catch (error) {
            console.log(error);
        }
    }

    agregarHistorial( lugar = '' ){
        // prevenir duplicados
        if( this.historial.includes( lugar.toLocaleLowerCase() ) ){
            return;
        }
        
        this.historial = this.historial.splice(0,5);


        this.historial.unshift( lugar.toLocaleLowerCase() );
        // Grrabar en db
        this.guardarDB();
    }

    guardarDB() {
        
        const payload = {
            historial: this.historial,
        }
        fs.writeFileSync( this.dbpath, JSON.stringify( payload ) );
    }

    leerDB() {
        if( !fs.existsSync( this.dbpath ) ) return null;
    
        const info = fs.readFileSync( this.dbpath, { encoding:'utf-8' } );
        const data = JSON.parse(info);
        // console.log(data);
        this.historial = data.historial;

        // Debe de existir.... 
        // const info ... readFilesSync.... path ... {encoding:utf-8}
        // const data = JSON.parse( info );
        // this.historial = data.historial
    }
}

export{ Busquedas };