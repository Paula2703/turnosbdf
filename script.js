document.addEventListener("DOMContentLoaded", function () {
    generarCalendario();
});

let historialTurnos = [];

function guardarTurno() {
    let turnos = JSON.parse(localStorage.getItem("turnos")) || [];

    // **Guardar el estado previo antes de hacer cambios**
    historialTurnos.push(JSON.stringify(turnos));

    let turno = document.getElementById("turno").value;
    let fechaInicio = document.getElementById("fechaInicio").value;
    let fechaFin = document.getElementById("fechaFin").value;
    let duracionTurnoInput = document.getElementById("duracionTurno").value;
    let periodicidadInput = document.getElementById("periodicidad").value;

    let duracionTurno = duracionTurnoInput && !isNaN(duracionTurnoInput) && duracionTurnoInput.trim() !== "" ? parseInt(duracionTurnoInput) : 1;
    let periodicidad = periodicidadInput && !isNaN(periodicidadInput) && periodicidadInput.trim() !== "" ? parseInt(periodicidadInput) : null;

    if (!fechaInicio || !fechaFin) {
        alert("Por favor, selecciona una fecha de inicio y fin.");
        return;
    }

    let fechaActual = new Date(fechaInicio + "T00:00:00");
    let fechaFinal = new Date(fechaFin + "T00:00:00");

    while (fechaActual.getTime() <= fechaFinal.getTime()) {
        let fechaStr = fechaActual.toISOString().split("T")[0];

        let index = turnos.findIndex(t => t.fecha === fechaStr);
        if (index !== -1) {
            turnos[index].turno = turno;
        } else {
            turnos.push({ turno, fecha: fechaStr });
        }

        fechaActual.setUTCDate(fechaActual.getUTCDate() + 1);
    }

    // **Solo repetir el turno si el usuario ingresa periodicidad**
    if (periodicidad !== null) {
        let fechaRepeticion = new Date(fechaInicio + "T00:00:00");

        while (fechaRepeticion.getTime() <= new Date(2025, 11, 31).getTime()) {
            for (let i = 0; i < duracionTurno; i++) {
                let fechaStr = new Date(fechaRepeticion.getTime());
                fechaStr.setUTCDate(fechaStr.getUTCDate() + i);
                
                let fechaFormato = fechaStr.toISOString().split("T")[0];

                let index = turnos.findIndex(t => t.fecha === fechaFormato);
                if (index !== -1) {
                    turnos[index].turno = turno;
                } else {
                    turnos.push({ turno, fecha: fechaFormato });
                }
            }

            fechaRepeticion.setUTCDate(fechaRepeticion.getUTCDate() + periodicidad);
        }
    }

    localStorage.setItem("turnos", JSON.stringify(turnos));
    generarCalendario();
}



function generarCalendario() {
    let turnos = JSON.parse(localStorage.getItem("turnos")) || [];
    let calendario = document.getElementById("calendario");
    calendario.innerHTML = "";

    const nombresDias = ["Lu", "Mar", "Mi", "Jue", "Vi", "Sa", "Do"];

    for (let mes = 0; mes < 12; mes++) {
        let contenedorMes = document.createElement("div");
        contenedorMes.classList.add("mes");
        contenedorMes.innerHTML = `<h3>${new Date(2025, mes).toLocaleString('es', { month: 'long' })}</h3>`;

        let filaDias = document.createElement("div");
        filaDias.classList.add("fila-dias");
        nombresDias.forEach(dia => {
            let diaElemento = document.createElement("div");
            diaElemento.classList.add("dia-nombre");
            diaElemento.textContent = dia;
            filaDias.appendChild(diaElemento);
        });
        contenedorMes.appendChild(filaDias);

        let contenedorDias = document.createElement("div");
        contenedorDias.classList.add("contenedor-dias");

        let fechaInicial = new Date(2025, mes, 1);
        let primerDiaSemana = (fechaInicial.getDay() - 1 + 7) % 7;

        for (let i = 0; i < primerDiaSemana; i++) {
            let espacioVacio = document.createElement("div");
            espacioVacio.classList.add("dia", "vacio");
            contenedorDias.appendChild(espacioVacio);
        }

        for (let dia = 1; dia <= 31; dia++) {
            let fechaActual = new Date(2025, mes, dia);
            if (fechaActual.getMonth() !== mes) continue;

            let diaElemento = document.createElement("div");
            diaElemento.classList.add("dia");
            diaElemento.textContent = dia;

            let fechaStr = fechaActual.toISOString().split("T")[0];
            let turnoAsignado = turnos.find(t => t.fecha === fechaStr);

            if (turnoAsignado) {
                diaElemento.classList.add(turnoAsignado.turno);
            }

            contenedorDias.appendChild(diaElemento);
        }

        contenedorMes.appendChild(contenedorDias);
        calendario.appendChild(contenedorMes);
    }
}


function limpiarCalendario() {
    localStorage.removeItem("turnos");
    generarCalendario();
}

function deshacerUltimoMovimiento() {
    console.log("Historial antes de deshacer:", historialTurnos); // Debug para verificar el historial

    if (historialTurnos.length > 0) {
        let ultimoEstado = historialTurnos.pop();
        localStorage.setItem("turnos", ultimoEstado);

        console.log("Historial actualizado:", historialTurnos);

        generarCalendario();
    } else {
        alert("No hay cambios que deshacer.");
    }
}




