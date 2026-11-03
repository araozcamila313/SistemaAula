const Asiento = require('./backend/asignacion_de_asientos/Asiento');
const Aula = require('./backend/asignacion_de_asientos/Aula');
const Estudiante = require('./backend/asignacion_de_asientos/Estudiante');

describe('Pruebas de Asignación de Asientos', () => {

    test('1. El aula debe crearse con 50 asientos (10 filas x 5 columnas)', () => {
        const aula = new Aula();
        expect(aula.asientos.length).toBe(50); // Cambiado a 50
    });

    test('2. No se debe poder asignar un asiento ya ocupado', () => {
        const asiento = new Asiento(1, 1, 1);
        asiento.asignarEstudiante("Ana Pérez");
        expect(() => {
            asiento.asignarEstudiante("Luis Gómez");
        }).toThrow("El asiento no está disponible.");
    });

    test('3. Al liberar un asiento, este vuelve a estar Disponible', () => {
        const asiento = new Asiento(1, 1, 1);
        asiento.asignarEstudiante("Ana Pérez");
        asiento.liberarAsiento();
        expect(asiento.estado).toBe("Disponible");
    });

    // --- PRUEBAS DE ASISTENCIA ---
    test('4. Un estudiante debe empezar como Ausente por defecto', () => {
        const alumno = new Estudiante("Carlos", "Ruiz", "2023001");
        expect(alumno.asistencia).toBe("Ausente");
    });

    test('5. El docente debe poder cambiar la asistencia a Presente', () => {
        const alumno = new Estudiante("Carlos", "Ruiz", "2023001");
        alumno.registrarAsistencia("Presente");
        expect(alumno.asistencia).toBe("Presente");
    });

});