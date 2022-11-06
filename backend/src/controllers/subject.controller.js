import { getConnection } from "../database/database";

const addSubject = async (req, res) => {
    try {
        const { nombre, facultad_idFacultad} = req.body;

        if (nombre === undefined || facultad_idFacultad === undefined)
            res.status(400).json({ message: "Bad Request. Please fill all fields" });
        const subject = { nombre, facultad_idFacultad};
        const connection = await getConnection();
        await connection.query("INSERT INTO asignatura SET ?", subject);
        res.json({message: "Subject added successfully"});
    } catch(error) {
        res.status(500).send(error.message);
    }
}

const getSubjects = async (req, res) => { // id ? Asignaturas de facultad : todas las asignaturas
    try {
        const connection = await getConnection();
        const {id} = req.query;
        let query;
        if (id === undefined)
            query = await connection.query(`SELECT a.nombre as nombreAsignatura, f.nombre as nombreFacultad
                                            FROM asignatura a JOIN facultad f ON a.facultad_idFacultad = f.idFacultad`);
        else
            query = await connection.query(`SELECT nombre as nombreAsignatura FROM asignatura WHERE facultad_idFacultad = ?`, id);
        res.json(query);

    } catch (error) {
        res.status(500).send(error.message);
    }
}

const getSubjectById = async (req, res) => {
    try {
        const connection = await getConnection();
        const {id} = req.params;
        const query = await connection.query(`SELECT nombre as nombreAsignatura FROM asignatura WHERE idAsignatura=?`, id);
        res.json(query);
    } catch (error) {
        res.status(500).send(error.message);
    }
}

const updateSubject = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, facultad_idFacultad} = req.body;

        if (nombre === undefined || facultad_idFacultad === undefined)
            res.status(400).json({message: "Bad Request. Please fill all fields"});
        const subject = { nombre, facultad_idFacultad };
        const connection = await getConnection();
        const query = await connection.query("UPDATE asignatura SET ? WHERE idAsignatura = ?", [subject, id]);
        res.json(query);
    } catch(error) {
        res.status(500).send(error.message);
    }
}

const deleteSubject = async (req, res) => {
    try {
        const {id} = req.params;
        const connection = await getConnection();
        const query = await connection.query("DELETE FROM asignatura WHERE idAsignatura = ?", id);
        res.json(query);
    } catch (error) {
        res.status(500).send(error.message);
    }
}

export const methods = {
    addSubject,
    getSubjects,
    getSubjectById,
    updateSubject,
    deleteSubject
};