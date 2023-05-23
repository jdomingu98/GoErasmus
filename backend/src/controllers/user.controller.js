import { getConnection } from "../database/database"
import { methods as LogrosUtils } from "../libs/logros"
var cloudinary = require('cloudinary').v2
import * as authUtils from "../libs/authUtils"
cloudinary.config(process.env.CLOUDINARY_URL)
import { sendEmailToUser } from "../libs/sendEmail"
import {methods as logrosUtils} from "../libs/logros"

const getUsers = async (req, res) => {
    try {
        const connection = await getConnection()
        const query = await connection.query(`SELECT TRIM(CONCAT(u.nombre, ' ', u.apellido1, ' ', IFNULL(u.apellido2, ' '))) as nombreCompleto,
                                            u.idUsuario, u.nombreUsuario as nombreUsuario, u.email as emailUsuario,  u.cuentaActivada,
                                            IFNULL(f.nombre, "-") as nombreFacultad, IFNULL(r.nombre, "-") as nombreRol,
                                            DATE_FORMAT(u.fechaCreacionCuenta, "%d/%m/%Y %r") as fechaCreacionCuenta, u.urlFotoPerfil as imagenPerfil FROM Usuario u
                                            LEFT JOIN Facultad f ON u.facultad_idFacultad = f.idFacultad
                                            LEFT JOIN Rol r ON u.rol_idRol = r.idRol
                                            ORDER BY u.rol_idRol ASC, u.fechaCreacionCuenta DESC`)
        res.json(query)
    } catch (error) {
        res.status(500).send(error.message)
    }
}

const getUser = async (req, res) => {
    try {
        const connection = await getConnection()
        const { nombreUsuario } = req.params
        console.log(nombreUsuario)
        const result = await connection.query(`SELECT u.nombreUsuario, u.email, r.nombre as rol, u.urlFotoPerfil, f.nombre as facultad, un.nombre as universidad, c.nombre as ciudad, p.nombre as pais
        FROM usuario u LEFT JOIN rol r ON u.Rol_idRol=r.idRol LEFT JOIN facultad f ON u.facultad_idfacultad=f.idFacultad LEFT JOIN universidad un ON f.universidad_iduniversidad=un.iduniversidad
        LEFT JOIN ciudad c on un.iduniversidad=c.idCiudad left join pais p on c.pais_idpais=p.idpais WHERE u.nombreUsuario = '`+ nombreUsuario + `'`)
        console.log(result)
        res.json(result)
    } catch (error) {
        res.status(500).send(error.message)
    }
}

const getUserById = async (req, res) => {
    try {
        const connection = await getConnection()
        const { idUsuario } = req.params
        const result = await connection.query(`SELECT u.nombreUsuario, u.email, r.nombre as rol, u.urlFotoPerfil, f.nombre as facultad, un.nombre as universidad, c.nombre as ciudad, p.nombre as pais
        FROM usuario u LEFT JOIN rol r ON u.Rol_idRol=r.idRol LEFT JOIN facultad f ON u.facultad_idfacultad=f.idFacultad LEFT JOIN universidad un ON f.universidad_iduniversidad=un.iduniversidad
        LEFT JOIN ciudad c on un.iduniversidad=c.idCiudad left join pais p on c.pais_idpais=p.idpais WHERE u.idUsuario = '`+ idUsuario + `'`)
        console.log(result)
        res.json(result)
    } catch (error) {
        res.status(500).send(error.message)
    }
}

const deleteUser = async (req, res) => {
    try {
        const { id } = req.params
        const connection = await getConnection()
        const query = await connection.query("DELETE FROM usuario WHERE idUsuario = ?", id)
        res.json(query)
    } catch (error) {
        res.status(500).send(error.message)
    }
}

const getPaises = async (req, res) => {
    try {
        const connection = await getConnection()
        const result = await connection.query(`SELECT nombre FROM pais`)
        let array = []
        result.map(elem => array.push(elem.nombre))
        res.send(array)
    } catch (error) {
        res.status(500).send(error.message)
    }
}

const getCiudades = async (req, res) => {
    try {
        const connection = await getConnection()
        const { id } = req.params
        const result = await connection.query(`select d.nombre from ciudad d join pais p on p.idPais=d.pais_idPais where p.nombre like '%${id}%'`)
        let array = []
        result.map(elem => array.push(elem.nombre))
        res.send(array)
    } catch (error) {
        res.status(500).send(error.message)
    }
}
const getUniversidades = async (req, res) => {
    try {
        const connection = await getConnection()
        const { id } = req.params
        const result = await connection.query(`SELECT u.nombre FROM universidad u join ciudad d on d.idCiudad=u.ciudad_idCiudad where d.nombre like '%${id}%'`)
        let array = []
        result.map(elem => array.push(elem.nombre))
        res.send(array)
    } catch (error) {
        res.status(500).send(error.message)
    }
}
const getFacultades = async (req, res) => {
    try {
        const connection = await getConnection()
        const { id } = req.params
        const result = await connection.query(`SELECT f.nombre FROM facultad f join universidad u on f.universidad_idUniversidad=u.idUniversidad where u.nombre like '%${id}%'`)
        let array = []
        result.map(elem => array.push(elem.nombre))
        res.send(array)
    } catch (error) {
        res.status(500).send(error.message)
    }
}

const getLogros = async (req, res) => {
    try {
        const connection = await getConnection()
        const { id } = req.params
        //Obtener rol del usuario
        const rolQuery = await connection.query(`select r.idRol, r.nombre from usuario u join rol r on u.Rol_idRol=r.idRol where u.idUsuario=?`, id)
        const rol = rolQuery[0].nombre
        const idRol = rolQuery[0].idRol
        //logros usuario
        const usuarioLogro = await connection.query(`select * from usuariologro where usuario_idusuario = ?`, id)
        const array = []
        const cantidadLogrosRol = await connection.query(`select count(*) as cantidad from logro where rol_idRol = ?`, idRol)
        const cantidad = cantidadLogrosRol[0].cantidad
        if (usuarioLogro.length > 0) {
            usuarioLogro.map(elem => array.push(elem.logro_idLogro))
            const logrosProximos = await connection.query(`select descripcion from logro where idLogro not in (?) AND rol_idRol = ?`, [array, idRol])
            const logrosConseguidos = await connection.query(`select descripcion from logro where idLogro in (?)`, [array])
            const arrayConseguidos = []
            const arrayProximos = []
            logrosConseguidos.map(elem => arrayConseguidos.push(elem.descripcion))
            logrosProximos.map(elem => arrayProximos.push(elem.descripcion))
            res.send({ rol, cantidad, arrayConseguidos, arrayProximos })
        }else{
            const arrayProximos = []
            const logrosProximos = await connection.query(`select descripcion from logro where rol_idRol = ?`, [idRol])
            logrosProximos.map(elem => arrayProximos.push(elem.descripcion))
            let arrayConseguidos = []
            
            res.send({rol, cantidad, arrayConseguidos, arrayProximos })
        }
    } catch (error) {
        res.status(500).send(error.message)
    }
}

const uploadPicture = async (req, res) => {
    try {
        cloudinary.uploader.upload(req.files.file.tempFilePath, async (error, result) => { console.log(result, error) })
        res.json("ok")
    } catch (error) {
        res.status(500).send(error.message)
    }
}

const guardarDatos = async (req, res) => {
    try {
        let logroObtenido = false
        const { id } = req.params
        const body = req.body
        const connection = await getConnection()
        const datos = {}
        //checkImagen de peril
        if (req.files != null) {
            await cloudinary.uploader.upload(req.files.file.tempFilePath, async (error, result) => {
                if (error) {
                    res.status(500)
                    res.send(error)
                }
                datos['urlFotoPerfil'] = result.url
                //si no tenia el logro 3 insert usuariologro idusuario 3
                if(await logrosUtils.logrosCheck(id, 3)){
                    logroObtenido = true
                }
            })
        }
        //contraseña nueva 
        if(body['pass'].length > 0){
            const finalPass = await authUtils.encryptPassword(body['pass'])
            datos['contrasena'] = finalPass
        }
        //datos de nombre y email
        if(body['nombreUsuario'].length>0){
            datos['nombreUsuario'] = body['nombreUsuario']
        }
        if(body['email'].length>0){
            const email = body['email']
            const token = body['token']
            datos['email'] = email
            try{
                const subject = "Bienvenido a GoERASMUS"
                const activationLink = `http://localhost:4000/api/auth/${token}`
                const message = `Hola viajero,\nEstás a punto de empezar una larga travesía y el punto de partida es GoERASMUS, pero antes de ir al aeropuerto es necesario hacer la maleta o, en nuestro caso, pulsar el enlace a continuación para activar tu cuenta:\n${activationLink}\nEsperamos con ganas las anécdotas de tus viajes.\n\nUn saludo,\nEl equipo de GoERASMUS.`
                sendEmailToUser(email, subject, message)
            }catch{
                res.status(500).send("Error, no se ha podido enviar un correo al nuevo Email")
            }
            
        }
        //ubicacion
        const objectoFacultad = await connection.query(`select idfacultad from facultad where nombre like '${body['facultad']}'`)
        datos['facultad_idfacultad'] = objectoFacultad[0].idfacultad
        //console.log("datos", datos)
        //console.log("id:", id)
        await connection.query("UPDATE usuario SET ? where idUsuario = ?", [datos, id])
        //si no tenia logro 2 insert usuariologro idusuario 2
        if(await logrosUtils.logrosCheck(id, 2)){
            logroObtenido = true
            console.log("logroObetnido:", logroObtenido)
        }
        res.json(logroObtenido)
    } catch (error) {
        res.status(500).send(error.message)
    }
}

const prueba = async (req, res) => {
    try {
        const { idUsuario, idLogro } = req.params
        const query = await LogrosUtils.insertLogro(idUsuario, idLogro)
        res.json(query)
    } catch (error) {
        res.status(500).send(error.message)
    }
}


/*const resetPoints = async (req, res) => {
    try {
        const connection = await getConnection()
        await connection.query("SET SQL_SAFE_UPDATES = 0")
        await connection.query("UPDATE usuario SET cantidadPuntos = 0")
        await connection.query("SET SQL_SAFE_UPDATES = 1")
        res.json({ message: "Points reset successfully" })
    } catch (error) {
        res.status(500).send(error.message)
    }
}*/

export const methods = {
    getUsers,
    getUser,
    deleteUser,
    getPaises,
    getCiudades,
    getUniversidades,
    getFacultades,
    getLogros,
    uploadPicture,
    guardarDatos,
    //resetPoints,
    prueba,
    getUserById
}