/* script.js */
const stazioniData = [
    { distanza: 10, veicoli: [30, 25, 20, 15] },
    { distanza: 20, veicoli: [35, 30, 25, 20, 15] },
    { distanza: 30, veicoli: [35, 30, 25] },
    { distanza: 40, veicoli: [35, 30, 25, 20, 15, 10] },
    { distanza: 50, veicoli: [35, 30, 25, 20, 15, 10, 5] },
    { distanza: 60, veicoli: [35, 30, 25, 20, 15, 10, 5, 0] },
    { distanza: 70, veicoli: [35, 30, 25, 20, 15, 10, 5, 0] },
    { distanza: 80, veicoli: [35, 30, 25, 20, 15, 10, 5, 0] },
    { distanza: 90, veicoli: [35, 30] },
    { distanza: 100, veicoli: [35] }
];

let selectedStazioni = [];
let previousPath = [];

function createStazione(stazione, index) {
    const autostrada = document.getElementById('autostrada');
    const stazioneDiv = document.createElement('div');
    stazioneDiv.className = 'stazione';
    stazioneDiv.style.left = `${stazione.distanza * 5}px`;
    stazioneDiv.dataset.index = index;
    stazioneDiv.dataset.distanza = stazione.distanza;
    stazioneDiv.innerText = stazione.distanza;

    stazioneDiv.addEventListener('click', () => {
        if (selectedStazioni.length < 2) {
            stazioneDiv.classList.toggle('selected');
            if (stazioneDiv.classList.contains('selected')) {
                selectedStazioni.push(index);
            } else {
                selectedStazioni = selectedStazioni.filter(i => i !== index);
            }
        }
    });

    autostrada.appendChild(stazioneDiv);

    const maxAutonomia = Math.max(...stazione.veicoli);
    const autoDiv = document.createElement('div');
    autoDiv.className = 'auto';
    autoDiv.style.left = `${stazione.distanza * 5}px`;
    autoDiv.style.top = '60px';
    autoDiv.innerText = maxAutonomia;

    autostrada.appendChild(autoDiv);
}

function addStazioni() {
    stazioniData.forEach((stazione, index) => {
        createStazione(stazione, index);
    });
}

function clearPreviousPath() {
    previousPath.forEach(index => {
        document.querySelector(`[data-index="${index}"]`).classList.remove('visited');
    });
    previousPath = [];
}

function pianificaPercorso(stazioni, start, end) {
    const numStazioni = stazioni.length;
    const distanze = new Array(numStazioni).fill(Infinity);
    const predecessori = new Array(numStazioni).fill(-1);
    const visitate = new Array(numStazioni).fill(false);

    distanze[start] = 0;

    for (let i = 0; i < numStazioni - 1; i++) {
        let minDistanza = Infinity;
        let minIndex = -1;

        for (let j = 0; j < numStazioni; j++) {
            if (!visitate[j] && distanze[j] <= minDistanza) {
                minDistanza = distanze[j];
                minIndex = j;
            }
        }

        if (minIndex === -1) break;

        visitate[minIndex] = true;

        for (let j = 0; j < numStazioni; j++) {
            const maxAutonomia = Math.max(...stazioni[minIndex].veicoli);
            const distanzaAttuale = stazioni[minIndex].distanza;
            const distanzaSuccessiva = stazioni[j].distanza;
            if (!visitate[j] && distanzaSuccessiva <= distanzaAttuale + maxAutonomia) {
                if (distanze[minIndex] + 1 < distanze[j]) {
                    distanze[j] = distanze[minIndex] + 1;
                    predecessori[j] = minIndex;
                }
            }
        }
    }

    let percorso = [];
    for (let at = end; at !== -1; at = predecessori[at]) {
        percorso.push(at);
    }
    percorso.reverse();

    return percorso;
}

function planRoute() {
    if (selectedStazioni.length === 2) {
        clearPreviousPath();
        
        const [startIndex, endIndex] = selectedStazioni.sort((a, b) => a - b);

        const percorso = pianificaPercorso(stazioniData, startIndex, endIndex);

        if (percorso.length === 1 && percorso[0] === startIndex) {
            alert("Nessun percorso disponibile");
            return;
        }

        percorso.forEach(index => {
            document.querySelector(`[data-index="${index}"]`).classList.add('visited');
            previousPath.push(index);
        });

        visualizzaGrafo(percorso);

        selectedStazioni = [];
        document.querySelectorAll('.stazione').forEach(stazione => stazione.classList.remove('selected'));
    }
}

function visualizzaGrafo(percorso) {
    const grafo = document.getElementById('grafo');
    const svg = document.getElementById('grafo-svg');
    svg.innerHTML = `
        <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" 
                refX="0" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" />
            </marker>
        </defs>
    `;

    percorso.forEach((index, i) => {
        const stazione = stazioniData[index];
        const nodoDiv = document.createElement('div');
        nodoDiv.className = 'nodo';
        nodoDiv.style.left = `${i * 100 + 50}px`;
        nodoDiv.style.top = '100px';
        nodoDiv.innerText = stazione.distanza;

        grafo.appendChild(nodoDiv);

        if (i > 0) {
            const prevIndex = percorso[i - 1];
            const distanza = stazione.distanza - stazioniData[prevIndex].distanza;
            const maxAutonomia = Math.max(...stazioniData[prevIndex].veicoli);

            const x1 = (i - 1) * 100 + 70;
            const y1 = 120;
            const x2 = i * 100 + 50;
            const y2 = 120;

            const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
            line.setAttribute("x1", x1);
            line.setAttribute("y1", y1);
            line.setAttribute("x2", x2);
            line.setAttribute("y2", y2);
            line.setAttribute("class", "arrow");

            svg.appendChild(line);

            const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
            text.setAttribute("x", (x1 + x2) / 2);
            text.setAttribute("y", y1 - 10);
            text.setAttribute("fill", "white");
            text.setAttribute("font-size", "12");
            text.textContent = maxAutonomia;

            svg.appendChild(text);
        }
    });
}

addStazioni();
