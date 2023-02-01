import { getConnection } from "../database/database"

const addFaculty = async (req, res) => {
    try {
        const { nombre, universidad_idUniversidad } = req.body

        if (nombre === undefined ||  universidad_idUniversidad === undefined)
            res.status(400).json({message: "Bad Request. Please fill all fields"})
        const faculty = { nombre, universidad_idUniversidad }
        const connection = await getConnection()

        await connection.query("INSERT INTO facultad SET ?", faculty)
        res.json({message: "Faculty added successfully"})
    } catch(error) {
        res.status(500).send(error.message)
    }
}

const getFaculties = async (req, res) => {
    try {
        const connection = await getConnection()
        let {name} = req.query
        let query
        if (name === undefined)
            query = await connection.query(`SELECT f.idFacultad, f.nombre as nombreFacultad, u.nombre as nombreUniversidad
                                            FROM Facultad f LEFT JOIN Universidad u ON f.universidad_idUniversidad = u.idUniversidad
                                            ORDER BY nombreFacultad ASC`)
        else
            query = await connection.query(`SELECT f.nombre as nombreFacultad FROM Facultad f
                                            JOIN Universidad u ON u.idUniversidad = f.universidad_idUniversidad
                                            WHERE u.nombre = ? ORDER BY nombreFacultad ASC`, name)
        res.json(query)
    } catch (error) {
        res.status(500).send(error.message)
    }
}

const updateFaculty = async (req, res) => {
    try {
        const { id } = req.params
        const { nombre, universidad_idUniversidad } = req.body

        if(id === undefined || nombre === undefined || universidad_idUniversidad === undefined )
            res.status(400).json({message: "Bad Request. Please fill all fields"})

        let faculty
        if (universidad_idUniversidad > 0)
            faculty = { nombre, universidad_idUniversidad }
        else
            faculty = { nombre }
        const connection = await getConnection()
        const query = await connection.query("UPDATE facultad SET ? WHERE idFacultad = ?", [faculty, id])
        res.json(query)
    } catch(error) {
        res.status(500).send(error.message)
    }
}

const deleteFaculty = async (req, res) => {
    try {
        const {id} = req.params
        const connection = await getConnection()
        const query = await connection.query("DELETE FROM facultad WHERE idFacultad = ?", id)
        res.json(query)
    } catch(error) {
        res.status(500).send(error.message)
    }
}

export const methods = {
    addFaculty,
    getFaculties,
    updateFaculty,
    deleteFaculty
}