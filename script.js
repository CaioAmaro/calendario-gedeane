const monthSelect = document.getElementById('monthSelect');
const yearInput = document.getElementById('yearInput');
const generateButton = document.getElementById('generateButton');
const calendar = document.getElementById('calendar');
const workerNameInput = document.getElementById('workerName');
const addWorkerButton = document.getElementById('addWorkerButton');
const workerList = document.getElementById('workerList');
const vacationSelect = document.getElementById('vacationSelect');
const markVacationButton = document.getElementById('markVacationButton');
const holidayDate = document.getElementById('holidayDate');
const holidayName = document.getElementById('holidayName');
const holidayType = document.getElementById('holidayType');
const addHolidayButton = document.getElementById('addHolidayButton');
const vacationStartDate = document.getElementById('vacationStartDate');
const vacationEndDate = document.getElementById('vacationEndDate');
const notesList = document.getElementById('notesList');

let workers = [];
let holidays = [];
let onVacation = new Map();
let notes = [];

// Populando meses no seletor
const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

months.forEach((month, index) => {
    const option = document.createElement('option');
    option.value = index;
    option.textContent = month;
    monthSelect.appendChild(option);
});

addWorkerButton.addEventListener('click', () => {
    const name = workerNameInput.value.trim();
    if (name) {
        workers.push(name);
        updateWorkerList();
        updateVacationSelect();
        workerNameInput.value = '';
        alert(`Funcionário ${name} adicionado!`);
    } else {
        alert('Por favor, insira um nome válido.');
    }
});

function updateWorkerList() {
    workerList.innerHTML = '';
    workers.forEach(worker => {
        const li = document.createElement('li');
        li.textContent = worker;
        workerList.appendChild(li);
    });
}

function updateVacationSelect() {
    vacationSelect.innerHTML = '';
    workers.forEach(worker => {
        const option = document.createElement('option');
        option.value = worker;
        option.textContent = worker;
        vacationSelect.appendChild(option);
    });
}

markVacationButton.addEventListener('click', () => {
    const name = vacationSelect.value;
    const startDate = new Date(vacationStartDate.value);
    const endDate = new Date(vacationEndDate.value);
    
    if (name && vacationStartDate.value && vacationEndDate.value) {
        onVacation.set(name, { start: startDate, end: endDate });
        addNote(`${name} saiu de férias de ${startDate.toLocaleDateString()} a ${endDate.toLocaleDateString()}.`);
        alert(`${name} marcado como de férias de ${startDate.toLocaleDateString()} a ${endDate.toLocaleDateString()}!`);
        generateCalendar(parseInt(monthSelect.value), parseInt(yearInput.value)); // Regenerar o calendário
    } else {
        alert('Selecione um funcionário e defina as datas de férias.');
    }
});

function addNote(note) {
    if (!notes.includes(note)) { // Evitar anotações duplicadas
        notes.push(note);
        const li = document.createElement('li');
        li.textContent = note;
        notesList.appendChild(li);
    }
}

generateButton.addEventListener('click', () => {
    const month = parseInt(monthSelect.value);
    const year = parseInt(yearInput.value);
    generateCalendar(month, year);
});

addHolidayButton.addEventListener('click', () => {
    const date = new Date(holidayDate.value);
    if (holidayName.value && holidayDate.value) {
        holidays.push({
            date: date.toISOString().split('T')[0],
            name: holidayName.value,
            type: holidayType.value,
        });
        holidayName.value = '';
        holidayDate.value = '';
        alert(`Feriado ${holidayName.value} adicionado!`);
        generateCalendar(parseInt(monthSelect.value), parseInt(yearInput.value)); // Regenerar o calendário
    }
});

function generateCalendar(month, year) {
    calendar.innerHTML = '';
    notesList.innerHTML = ''; // Limpar anotações anteriores
    notes = []; // Reiniciar o array de notas

    const daysOfWeek = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
    daysOfWeek.forEach(day => {
        const dayCard = document.createElement('div');
        dayCard.className = 'card day';
        dayCard.textContent = day;
        calendar.appendChild(dayCard);
    });

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    let workerIndex = 0;
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const card = document.createElement('div');
        card.className = 'card';

        // Ajuste para considerar sábado (6) e domingo (0) como dias não trabalháveis
        if (date.getDay() === 0 || date.getDay() === 6) {
            card.classList.add('non-working');
        }

        holidays.forEach(holiday => {
            if (holiday.date === date.toISOString().split('T')[0]) {
                card.classList.add('holiday');
                card.innerHTML = `${day}<br>(${holiday.name})<br>${holiday.type}`;
            }
        });

        if (!card.classList.contains('holiday') && !card.classList.contains('non-working') && workers.length > 0) {
            let assigned = false;

            for (let i = 0; i < workers.length; i++) {
                const worker = workers[workerIndex];
                const vacation = onVacation.get(worker);

                if (!vacation || (date < vacation.start || date > vacation.end)) {
                    card.classList.add('worker');
                    card.innerHTML = `${day}<br>${worker}`;
                    assigned = true;
                    workerIndex = (workerIndex + 1) % workers.length;
                    break;
                }

                workerIndex = (workerIndex + 1) % workers.length;
            }

            if (!assigned) {
                card.textContent = day;
            }
        }

        if (!card.classList.contains('holiday') && !card.classList.contains('worker')) {
            card.textContent = day;
        }

        calendar.appendChild(card);
    }

    // Adicionar as notas sobre funcionários em férias
    onVacation.forEach((value, key) => {
        const { start, end } = value;
        addNote(`${key} está de férias de ${start.toLocaleDateString()} a ${end.toLocaleDateString()}.`);
    });
}

// Função para imprimir
document.getElementById('printButton').addEventListener('click', () => {
    const month = monthSelect.value;
    const year = yearInput.value;
    const calendarHTML = calendar.innerHTML;
    const notesHTML = notesList.innerHTML;

    const printWindow = window.open('', '', 'height=500,width=800');
    printWindow.document.write(`
        <html>
            <head>
                <title>Imprimir Calendário</title>
                <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        margin: 20px;
                    }
                    h1, h2 {
                        text-align: center;
                    }
                    #calendar {
                        display: grid;
                        grid-template-columns: repeat(7, 1fr);
                        gap: 10px;
                        margin-top: 20px;
                    }
                    .card {
                        border: 1px solid #ccc;
                        padding: 10px;
                        text-align: center;
                        background-color: #f9f9f9;
                    }
                    .card.worker {
                        background-color: #d4edda; /* Cor para trabalhador */
                    }
                    .card.holiday {
                        background-color: #f8d7da; /* Cor para feriado */
                    }
                    .card.non-working {
                        background-color: #e2e3e5; /* Cor para não trabalhável */
                    }
                    @media print {
                        body {
                            -webkit-print-color-adjust: exact; /* Para garantir que as cores sejam impressas */
                            print-color-adjust: exact;
                        }
                    }
                </style>
            </head>
            <body>
                <h1>Calendário de Limpeza - ${new Date(year, month).toLocaleString('pt-BR', { month: 'long' })} ${year}</h1>
                <div id="calendar">${calendarHTML}</div>
                <h2>Anotações</h2>
                <div id="notes">${notesHTML}</div>
            </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
});
