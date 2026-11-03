class Estudiante {
    constructor(nombre, apellido, matricula) {
        this.nombre = nombre;
        this.apellido = apellido;
        this.matricula = matricula;
        this.asientoAsignado = null; 
        this.asistencia = "Ausente"; // Por defecto, nadie ha asistido
    }

    obtenerNombreCompleto() {
        return this.nombre + " " + this.apellido;
    }

    // NUEVO: Método para la toma de lista
    registrarAsistencia(estado) {
        if (estado === "Presente" || estado === "Ausente" || estado === "Atrasado") {
            this.asistencia = estado;
        } else {
            throw new Error("Estado de asistencia no válido.");
        }
    }
}
module.exports = Estudiante;