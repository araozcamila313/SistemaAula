class Asiento {
    constructor(numero, fila, columna) {
        this.numero = numero;
        this.fila = fila;
        this.columna = columna;
        this.estado = "Disponible"; // Disponible, Ocupado, Bloqueado
        this.estudianteAsignado = null;
    }

    asignarEstudiante(estudiante) {
        if (this.estado !== "Disponible") {
            throw new Error("El asiento no está disponible.");
        }
        this.estudianteAsignado = estudiante;
        this.estado = "Ocupado";
    }

    liberarAsiento() {
        this.estudianteAsignado = null;
        this.estado = "Disponible";
    }
}
module.exports = Asiento;