let myChart
let data_points = []//65, 59, 80, 81, 56, 55,40
let dates = [] //'January', 'February', 'March', 'April', 'May', 'June', 'July', 50
let extraInfo = [];
// "Info for January",
//             "Info for February",
//             "Info for March",
//             "Info for April",
//             "Info for May",
//             "startgdg 10/10\nsdfddgff  2/10 \nfgfgfdfd 3/10",
//             "Info for July"

let fullInfo=[];

let habit_data = {}
let total_points = [0, 0]





class Habit {
    constructor(name, max_points, svg = "journaling.svg") {
        this.svg = svg;
        this.name = name;
        this.max_points = max_points;
    }

    async checkImageExists(url) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = url;
        });
    }

    getHabitElement() {
        const habit = document.createElement('div');
        habit.setAttribute("class", "habit");
        habit.innerHTML = `<div class="habit-info">
                            <img src="solo leveling logos/${this.svg}" alt="habit icon">
                            <p class="habit-name">${this.name}</p>
                        </div>

                        <div class="habit-points">
                            <img class="key-entry" src="solo leveling asserts/keyboard.svg" alt="keyboard">
                            <p name="${this.name}" class="point-of-habit">0/${this.max_points}</p>
                        </div>`;
        return habit;
    }
}

async function updateTpoints() {
    tpoints.innerHTML = total_points[0] + "/" + total_points[1];
    setProgress(total_points[0] / total_points[1] * 100);
    score_points.innerHTML = total_points[0];
    max_points.innerHTML = total_points[1];
}

async function setPoints(newPoint, e) {
    total_points[0] += parseInt(newPoint) - habit_data[e.querySelector(".point-of-habit").getAttribute("name")][0];
    habit_data[e.querySelector(".point-of-habit").getAttribute("name")][0] = parseInt(newPoint);
    updateTpoints()
}

async function getTemplate() {
    let s = prompt("Enter the template no :");
    try {
        const response = await fetch(`http://localhost:3001/habbitTemplate/${s}`);
        const data = await response.json();
        const container = document.querySelector(".habit-container");

        if (container) {
            container.innerHTML = '';
            data.forEach(habits => {

                for (const [habitKey, habitValue] of Object.entries(habits)) {
                    habit_data[habitValue[0]] = [0, habitValue[1]]
                    total_points[1] += habitValue[1];
                    const habitElement = new Habit(habitValue[0], habitValue[1], habitValue[2]);
                    const habit = habitElement.getHabitElement();
                    container.appendChild(habit);

                }
            });

        } else {
            console.error("Habit container element not found in the DOM.");
        }
    } catch (err) {
        console.error('Error fetching data:', err);
    }
    const a = Array.from(document.querySelector(".habit-container").querySelectorAll(".habit"));
    a.forEach(e => {
        e.addEventListener("click", () => {

            let point = e.querySelector(".point-of-habit").innerHTML
            let p = point.split("/")
            if (parseInt(p[0]) < parseInt(p[1])) {
                point = (parseInt(p[0]) + 1) + "/" + p[1];
                e.querySelector(".point-of-habit").innerHTML = point
                let newPoint = parseInt(p[0]) + 1
                setPoints(newPoint, e)
            }



        })
        e.querySelector(".point-of-habit").addEventListener("click", (event) => {
            event.stopPropagation();
            let newPoint = prompt("Enter new value :");

            let point = e.querySelector(".point-of-habit").innerHTML
            let p = point.split("/")
            if (parseInt(newPoint) <= parseInt(p[1])) {
                point = (newPoint) + "/" + p[1];
                e.querySelector(".point-of-habit").innerHTML = point

                setPoints(newPoint, e)

            }

        })
        e.querySelector(".key-entry").addEventListener("click", (event) => {
            event.stopPropagation();
            let name=e.querySelector(".habit-name").innerHTML
            let point_info = prompt(`Enter new value and message for ${name} :`);

            let [newPoint, message] = point_info.split(":");

            if(message){
                habit_data[e.querySelector(".point-of-habit").getAttribute("name")].push(message)
            }


            let point = e.querySelector(".point-of-habit").innerHTML
            let p = point.split("/")
            // if (parseInt(newPoint) <= parseInt(p[1])) {
                point = (newPoint) + "/" + p[1];
                e.querySelector(".point-of-habit").innerHTML = point

                setPoints(newPoint, e)

            // }

        })

    });

    updateTpoints()


}


async function setProgress(value) {

    const progressBar = document.querySelector('.progress-bar');
    const progressText = document.getElementById('progress-text');


    const radius = progressBar.r.baseVal.value;
    const circumference = 2 * Math.PI * radius;


    progressBar.style.strokeDasharray = `${circumference} ${circumference}`;
    progressBar.style.strokeDashoffset = circumference;

    const offset = circumference - (value / 100) * circumference;
    progressBar.style.strokeDashoffset = offset;
    progressText.textContent = `${Math.floor(value)}%`;
}

async function DateFormater(currentDate){

    let dayOfWeek = currentDate.toLocaleDateString('en-US', { weekday: 'short' });
        let dayOfMonth = currentDate.getDate();
        let month = currentDate.toLocaleDateString('en-US', { month: 'short' });
        let year = currentDate.getFullYear();

        return`${dayOfWeek}-${dayOfMonth}-${month}-${year}`;

}

async function sendData() {
    let currentDate = new Date();

        
        let dayOfWeek = currentDate.toLocaleDateString('en-US', { weekday: 'short' });
        let dayOfMonth = currentDate.getDate();
        let month = currentDate.toLocaleDateString('en-US', { month: 'short' });
        let year = currentDate.getFullYear();

        let date = `${dayOfWeek} ${dayOfMonth} ${month} ${year}`;

    const payload = {
        date,
        total_points,
        habit_data
    };

    try {
        const response = await fetch('http://localhost:3001/saveData', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            console.log('Data sent successfully');
            await changeGraphInterval(6);
        } else {
            console.error('Error sending data:', response.statusText);
        }
    } catch (err) {
        console.error('Error sending data:', err);
    }

}


async function makeChart(dates,data_points,extraInfo) {
    const ctx = document.getElementById('myChart').getContext('2d');


    
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(108, 53, 210, 0.5)');
    gradient.addColorStop(1, 'rgba(108, 53, 210, 0)');

    

    function showTotalPoints(label,point, info) {
        alert(`${label}\n------------------------------------------------------------------------\n${info}\nValue: ${point}/100`);
    }


    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: 'Sample Data',
                data: data_points,
                backgroundColor: gradient, // Gradient fill under the line
                borderColor: '#6c35d2', // Line color
                borderWidth: 2,
                pointBackgroundColor: '#6c35d2',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: '#6c35d2',
                pointRadius: 5,
                pointHoverRadius: 7
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: 'white'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                x: {
                    ticks: {
                        color: 'white'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: 'white',
                        font: {
                            size: 14
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            const dataPoint = context.dataset.data[context.dataIndex];
                            return `Value: ${dataPoint}`;
                        },
                        afterLabel: function (context) {
                            const additionalInfo = extraInfo[context.dataIndex];
                            return `\n${additionalInfo}`;
                        }
                    },
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: '#6c35d2',
                    borderWidth: 1
                }
            },
            elements: {
                line: {
                    tension: 0.1 // No smoothing, straight lines
                }
            },
            animation: {
                duration: 2000,
                easing: 'easeInOutBounce'
            }
        }
    });
    document.getElementById('myChart').addEventListener('click', function (event) {
        const points = myChart.getElementsAtEventForMode(event, 'nearest', { intersect: true }, false);
        if (points.length) {
            const firstPoint = points[0];
            const label = myChart.data.labels[firstPoint.index];
            const value = myChart.data.datasets[firstPoint.datasetIndex].data[firstPoint.index];
            const info = fullInfo[firstPoint.index];
            showTotalPoints(label,value, info);
        }
    });
}

async function fetchDataForDate(date) {
    try {
        const response = await fetch(`http://localhost:3001/habbitData/${date}`);
        
        if (!response.ok) {
            if (response.status === 404) {
                console.log(`Data not found for date ${date}`);
                return null; 
            }
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
            const data = await response.json();
            return data; 
        
        
        
    } catch (error) {
        console.error('Error fetching data of habits:', error);
        return null;
    }
}

async function ArrayToString(habits){
    let s=""
    let j=""
    for (const habit in habits) {
        if (habits.hasOwnProperty(habit)) {
            let element=habits[habit];
            if(element[0]!=element[1]){
                s+=`${habit}: ${element[0]}/${element[1]}\n`;
                
            }
            if(element.length>2){
                j+=`${habit}: ${element[0]}/${element[1]}    reason : ${element[2]}\n`;
            }else{
                j+=`${habit}: ${element[0]}/${element[1]}\n`
            }
        }
    }
  
    return [s,j];
}

async function changeGraphInterval(value){
    data_points=[]
    dates=[]
    fullInfo=[]
    extraInfo=[]
    let currentDate = new Date();
    for (let i = value; i >= 0; i--) {
        let c=new Date()
        c.setDate(currentDate.getDate() - i);
        const specificDate = await DateFormater(c); 
        console.log(specificDate);
        
       await fetchDataForDate(specificDate)
        .then(async data => {
            if(data){
                let point=data.total_points;
                data_points.push(Math.floor((point[0]/point[1])*100))
                dates.push(data.date.split(" ")[1]+" "+data.date.split(" ")[2])
                let [s,j]= await ArrayToString(data.habit_data);
                fullInfo.push(j);
                extraInfo.push(s);
                
                
            }
            
        })
        .catch(error => {});
    }
    await makeChart(dates, data_points, extraInfo);
}

async function main() {
    await getTemplate();

    habit_save_btn.addEventListener("click", (e) => {
        sendData()
    })
    

    await changeGraphInterval(7)
    await makeChart(dates,data_points,extraInfo)
    
    // interval_for_graph.addEventListener("change",async (e)=>{
    //     console.log(parseInt(e.target.value));
    //     await changeGraphInterval(e.target.value)
    // })









    
   

}
main()
























































function generateCalendar(month, year) {
    const daysContainer = document.querySelector('.days');
    const monthHeader = document.querySelector('.month > h2');
    daysContainer.innerHTML = '';

    // Update month header
    const monthName = new Date(year, month, 1).toLocaleString('en-US', { month: 'long' });
    const yearString = year.toString();
    monthHeader.textContent = `${monthName} ${yearString}`;

    // Get the first day of the month
    const firstDay = new Date(year, month, 1);
    const startDay = firstDay.getDay(); // 0 (Sun) to 6 (Sat)

    // Get the number of days in the month
    const lastDay = new Date(year, month + 1, 0);
    const totalDays = lastDay.getDate();

    // Generate days of the week headers
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    daysOfWeek.forEach(day => {
        const dayElement = document.createElement('div');
        dayElement.classList.add('day');
        dayElement.textContent = day;
        daysContainer.appendChild(dayElement);
    });

    // Fill in the days of the month
    for (let i = 0; i < startDay; i++) {
        const placeholderDay = document.createElement('div');
        placeholderDay.classList.add('day', 'placeholder');
        daysContainer.appendChild(placeholderDay);
    }

    for (let day = 1; day <= totalDays; day++) {
        const dayElement = document.createElement('div');
        dayElement.classList.add('day');
        dayElement.textContent = day;
        if (day === currentDate.getDate() && month === currentDate.getMonth() && year === currentDate.getFullYear()) {
            dayElement.classList.add('today');
        }
        daysContainer.appendChild(dayElement);
    }
}






// Get the current date
const currentDate = new Date();

// Generate the calendar for the current month and year
generateCalendar(currentDate.getMonth(), currentDate.getFullYear());
// // Set the initial progress value
// setProgress(progressValue);



