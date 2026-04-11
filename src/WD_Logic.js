

const APIKey = import.meta.env.VITE_WEATHER_API_KEY;
console.log(APIKey);
const SearchInput = document.getElementById("SearchIn");
const SearchBtn = document.getElementById("SearchBtn");
const CelBtn = document.getElementById('CelciusBtn');
const FahBtn = document.getElementById('FahrenheitBtn');
const SearchBarContainer = document.getElementById("SearchIn-SearchBtn");
const baseURL = "https://api.weatherapi.com/v1/forecast.json?"
let WeatherData;
let searchController;
class WeatherError extends Error {
    constructor(name,message) {
        super(message);
        this.name = name;
    }
}
const TryAgainbtn = document.getElementById('TryAgain');
window.addEventListener('load', loadInitialData);
TryAgainbtn.addEventListener('click',loadInitialData);
SearchBtn.addEventListener("click",searchBtnPressed);
CelBtn.addEventListener("click",(event)=>{
    updateTempAndWeatherCondition(WeatherData.current,true);
    updateExtraWeatherInfo(WeatherData, true);
    createHourlyBar(WeatherData.forecast,true);
    createDaysBar(WeatherData.forecast, true);
    updateVisibilitySection(WeatherData, true);
    updateDewPointSection(WeatherData, true);
});
FahBtn.addEventListener("click",(event)=>{
    updateTempAndWeatherCondition(WeatherData.current,false);
    updateExtraWeatherInfo(WeatherData, false);
    createHourlyBar(WeatherData.forecast,false);
    createDaysBar(WeatherData.forecast, false);
    updateVisibilitySection(WeatherData, false);
    updateDewPointSection(WeatherData, false);
});
SearchInput.addEventListener("input",handleInput);

async function loadInitialData(event){
    const WeatherContainer = document.getElementById("WeatherAppContainer");
    const loader = document.getElementById('loader');
    const spinner = document.getElementById('spinner');
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve,ms));
    spinner.classList.remove("hidden");
    TryAgainbtn.classList.add("hidden");
    let previousMessage = loader.querySelector('p');
    if(previousMessage){
        previousMessage.remove();
    }

    try {
        let data;
        let i = 0;
        while(true){
            try{
                data = await loadWeatherData('Alexandria');
            }catch{
                await delay(500);
            }
            
            if(data || i > 2) break;
            i++;
        }
        if(!data) throw new Error("Check Your Internet Connection");
            
        WeatherData = data;
        console.log(WeatherData);
        updateWeatherDataInUI(data);
        loader.classList.add('hidden');
        WeatherContainer.classList.remove("hidden");
    }catch(error){
        const WarningMessage = document.createElement('p');
        WarningMessage.textContent = error.message;
        WarningMessage.style.color = "red";
        spinner.classList.add("hidden");
        loader.prepend(WarningMessage);
        TryAgainbtn.classList.remove("hidden");

    }
}
function handleInput(event) {
    let value = event.target.value.trim();
    if(!event.target.value || validateCityName(value)) deleteWarningMessage();
}
function validateCityName(city) {
    const validPattern = /^[a-zA-Z\u0600-\u06FF\s\-']+$/;//allow [English Arabic space - ']
    if(city && validPattern.test(city)) return true;
    return false;
}
function showWarningMessage(message) {
    let p = SearchBarContainer.querySelector('p');
    if(!p) {
        p = document.createElement('p');
        p.textContent=message;
        p.classList.add("errorMessage");
        SearchBarContainer.append(p);
        return;
    }
    p.textContent=message;
}
function deleteWarningMessage() {
    let p = SearchBarContainer.querySelector('p');
    if(!p) return;
    p.remove();
}
function getWeatherGroup(code) {
    const groups = {
        sunny: [1000],
        cloudy: [1003, 1006, 1009],
        mist: [1030, 1135, 1147],
        rainy: [1063, 1150, 1153, 1180, 1183, 1186, 1189, 1192, 1195, 1240, 1243, 1246],
        thunder: [1087, 1273, 1276, 1279, 1282]
    };

    for (let groupName in groups) {
        if (groups[groupName].includes(code)) {
            return groupName;
        }
    }

    if (code >= 1066 && code <= 1264) return 'snowy';

    return 'sunny';
}

function updateBackground({condition:{code}, is_day}) {
    const groupName = getWeatherGroup(code);
    const body = document.body;
    body.classList.remove('bg-sunny','bg-clear','bg-cloudy','bg-mist','bg-rainy','bg-snowy','bg-thunder');
    if(groupName === 'sunny') {
        if(!is_day){
            body.classList.add(`bg-clear`);
            return;
        }
    }
    body.classList.add(`bg-${groupName}`);
}

function updateWeatherIcon({is_day, condition:{code,text:WeatherCondition}}) {
    const weatherIconUI = document.getElementById('WeatherIcon');
    const baseURL = './src/assets/Icons/';
    const groupName = getWeatherGroup(code);
    weatherIconUI.alt = WeatherCondition;
    if(groupName === 'sunny'){
        weatherIconUI.src = is_day? `${baseURL}sunny.png`:`${baseURL}clear.png`;
    } else if(groupName === 'cloudy') {
        weatherIconUI.src = is_day?`${baseURL}CloudDay.png`:`${baseURL}CloudNight.png`;
    }else{
        weatherIconUI.src = `${baseURL}${groupName}.png`;
    }

}
function updateCityAndCountryNames({name:city, country}) {
    const cityUI = document.getElementById("City");
    cityUI.textContent = city;
    const countryUI = document.getElementById("Country");
    countryUI.textContent = country;
}
function updateDateAndTime({localtime:time}) {
    const Months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const Days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    const DateTimeUI = document.getElementById('Date-Time');
    const localtime = new Date(time);

    const DateUI = DateTimeUI.querySelector('#Date');
    const day = Days[localtime.getDay()];
    const month = Months[localtime.getMonth()]; 
    DateUI.textContent = `${day}, ${localtime.getDate()} ${month} ${localtime.getFullYear()}`;
    const TimeUI = DateTimeUI.querySelector('#Time');
    TimeUI.textContent = localtime.toLocaleTimeString('en-US',{
        hour12:true,
        hour:"2-digit",
        minute:"2-digit"
    }); 
}
function updateTempAndWeatherCondition({temp_c, temp_f,condition:{text:WeatherText}},isCel) {
    const TempWeatherConditionContainer = document.getElementById('Temp-Units-WeatherCondition');
    const TempUI = TempWeatherConditionContainer.querySelector('#Temp');
    const WeatherUI = TempWeatherConditionContainer.querySelector('#WeatherCondition');
    const FahBtnUI = TempWeatherConditionContainer.querySelector('#FahrenheitBtn');
    const CelBtnUI = TempWeatherConditionContainer.querySelector('#CelciusBtn');
    if(!isCel) {
        TempUI.textContent = temp_f;
        FahBtnUI.classList.remove('deactive-unit');
        CelBtnUI.classList.add('deactive-unit');
        
    } else {
        TempUI.textContent = temp_c;
        FahBtnUI.classList.add('deactive-unit');
        CelBtnUI.classList.remove('deactive-unit');
    }
    WeatherUI.textContent = WeatherText; 
}
function updateExtraWeatherInfo({current:{feelslike_c,feelslike_f,wind_kph,wind_mph,humidity,wind_dir}, forecast:{forecastday:[{day:{maxtemp_c,mintemp_c,maxtemp_f,mintemp_f}}]}},isCel) {
    const feelsLikeUI = document.getElementById('FeelsLikeTemp');
    const maxTempUI = document.getElementById('MaxTemp');
    const minTempUI = document.getElementById('MinTemp');
    const humidityUI = document.getElementById('HumidityPercent');
    const windUI = document.getElementById('WindSpeed');
    const winddirUI = document.getElementById('windDirection');
    if(!isCel){
        feelsLikeUI.textContent = `${feelslike_f}°F`;
        maxTempUI.textContent = maxtemp_f;
        minTempUI.textContent = mintemp_f;
        windUI.textContent = `${wind_mph} Mile/h`;
        
    } else {
        feelsLikeUI.textContent = `${feelslike_c}°C`;
        maxTempUI.textContent = maxtemp_c;
        minTempUI.textContent = mintemp_c;
        windUI.textContent = `${wind_kph} Km/h`;
    }
    humidityUI.textContent = humidity;
    
    winddirUI.textContent = wind_dir;

}

async function loadWeatherData(cityName){
    try{
        /*
        if user fetch multiple times abort all previous fetches
        and keep only the newest one
        */
        if(!cityName || !validateCityName(cityName)) return;
        const url = prepareURL(cityName,baseURL);
        const {signal,TimeoutID} = prepareNewRequest();
        const response = await fetch(url,{signal});
        clearTimeout(TimeoutID);
        if(!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error.message||"Something wents wrong");
        }
        const data = await response.json();
        return data;
    } catch(error) {
        if(error.name ==='AbortError') {
            console.log('Previous request is cancelled');
        } else  {
            throw error;
        }
    }
    

}
function updateWeatherDataInUI(data){

    try{
        updateCityAndCountryNames(data.location);
        updateDateAndTime(data.location);
        updateTempAndWeatherCondition(data.current, true);
        updateExtraWeatherInfo(data, true);
        updateWeatherIcon(data.current);
        updateBackground(data.current);
        createHourlyBar(data.forecast,true);
        createDaysBar(data.forecast, true);
        updateUVIndex(data);
        updateHumiditySection(data);
        updateVisibilitySection(data, true);
        updateDewPointSection(data, true);
        updateAQISection(data);
    }catch(error) {
        console.error("UI update error:",error);
    }
}
async function searchBtnPressed(event) {
    event.preventDefault();
    let SearchInputContent = SearchInput.value.trim(); //trim all spaces from start and end
    let isValidContent = validateCityName(SearchInputContent);
    if(!isValidContent){ 
        showWarningMessage("Please input a valid city name");
        return;
    }
    deleteWarningMessage();
    let data;
    try{
        data = await loadWeatherData(SearchInputContent);
        if(data){
        WeatherData = data;
        console.log(WeatherData);
        updateWeatherDataInUI(data);
        }
    }catch(error){
        if(!navigator.onLine || error instanceof TypeError){
            showWarningMessage("Network error: Please check your connection.");
        } else  {
            showWarningMessage(error.message);
        }
        return;
    }
    
    
    
}
function prepareNewRequest() {
    if(searchController) {
        searchController.abort()
    }
    searchController = new AbortController();
    const TimeoutID = setTimeout(()=>{ 
    searchController.abort()
    }, 10000);
    return {signal:searchController.signal, TimeoutID: TimeoutID};
}

function prepareURL(city,baseURL){
    const params = new URLSearchParams({
        key: APIKey,
        q: city,
        days: 3,//fetch one day until finishing the ui
        aqi: "yes"

    });
    return `${baseURL}${params}`;
}
function createHourlyBar({forecastday:[{hour:hourArr}]},isCel){
    const HourlyBarContainer = document.getElementById("TodayDetailedInfo");
    HourlyBarContainer.innerHTML = hourArr.map((hour,index) => {
        let Time = new Date(hour.time).toLocaleTimeString('en-US',{
        hour12:true,
        hour:"2-digit"
    });

        return `
        <div class="HourByHourInfo" data-hour-index =${index} >
            <span>${Time}</span>
            <img src="https://${hour.condition.icon}" alt="${hour.condition.text}">
            <span>${isCel?hour.temp_c:hour.temp_f}°</span>
            <span class="centerVertically"><span class="material-symbols-outlined">humidity_high</span> ${hour.humidity}%</span>
        </div>
        `
    }).join('');
}

function createDaysBar({forecastday}, isCel) {
    const DaysBarContainer = document.getElementById('NextDaysPrediction');
    const Days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    DaysBarContainer.innerHTML = forecastday.map((day,index) => {
        let dateObj= new Date(day.date);
        let dayName = index === 0? "Today" : Days[dateObj.getDay()];
        let [maxtemp, mintemp] = isCel?[day.day.maxtemp_c, day.day.mintemp_c]:[day.day.maxtemp_f, day.day.mintemp_f];
        let humidity = day.day.avghumidity;
        return `
        <div class="DayByDayInfo" data-day-index =${index} >
            <span>${dayName}</span>
            <img src="https://${day.day.condition.icon}" alt="${day.day.condition.text}">
            <span class="centerVertically"><span class="material-symbols-outlined">north</span> ${maxtemp}° <span class="material-symbols-outlined">south</span> ${mintemp}°</span>
            <span class="centerVertically"><span class="material-symbols-outlined">humidity_high</span> ${humidity}%</span>
        </div>
        ` 
    }).join('');

}

function updateUVIndex({current:{uv:UVIndex}}){
    //{current:{uv:UVIndex}}
    const UVdescription = document.getElementById("UVIndexDescribtion");
    const UVPointer = document.getElementById("UVPointer");
    UVPointer.textContent = UVIndex.toFixed(1);
    let percentage = (UVIndex/11)*100;
    percentage = percentage>100? 100 : percentage;   
    UVPointer.style.left = `${percentage}%`;
    if(0 <= UVIndex && 3 > UVIndex) {
        UVdescription.textContent = "low";
        UVPointer.style.backgroundColor = '#289500';
    } else if(3 <= UVIndex && 6 > UVIndex) {
        UVdescription.textContent = "moderate";
        UVPointer.style.backgroundColor = '#f7e400';
    } else if(6 <= UVIndex && 8 > UVIndex) {
        UVdescription.textContent = "high";
        UVPointer.style.backgroundColor = '#f85900';
    } else if(8 <= UVIndex && 11 > UVIndex) {
        UVdescription.textContent = "very high";
        UVPointer.style.backgroundColor = '#d8001d';
    } else if(11 <= UVIndex) {
        UVdescription.textContent = "extreme";
        UVPointer.style.backgroundColor = '#6b49c8';
    } else {
        const UVIndexContainer= document.getElementById("UVIndex");
        UVIndexContainer.style.display = "none";
    } 
    
}

function updateHumiditySection({current:{humidity}}){
    const HumidityValue = document.getElementById("HumidityDescription");
    const HumidityBar= document.getElementById("HumidityBar2");
    HumidityValue.textContent = `${humidity}%`;
    HumidityBar.style.width = `${humidity}%`
    HumidityBar.setAttribute('aria-valuenow', humidity);
    
}

function updateVisibilitySection({current:{vis_km,vis_miles}}, isCel){
    const VisibilityValue = document.getElementById("VisibilityValue");
    const VisibilityDescription = document.getElementById("VisibilityDescription");
    const value = isCel ? vis_km : vis_miles;
    const unit = isCel ? "km" : "miles";
    VisibilityValue.textContent = `${value} ${unit}`;
    if(vis_km < 1) {
        VisibilityDescription.textContent = 'very poor visibility  ';
    } else if(vis_km < 4) {
        VisibilityDescription.textContent = 'poor visibility';
    } else if(vis_km < 10) {
        VisibilityDescription.textContent = 'good Visibility';
    } else if(vis_km >= 10) {
        VisibilityDescription.textContent = 'clear view';
    }
}

function updateDewPointSection({current:{dewpoint_c,dewpoint_f}}, isCel){
    const DewPointValue = document.getElementById("DewPointValue");
    const DewPointDescription = document.getElementById("DewPointDescription");
    const value = isCel ? dewpoint_c : dewpoint_f;
    const unit = isCel ? "°C" : "°F";
    DewPointValue.textContent = `${value} ${unit}`;
    if(dewpoint_c < 10) {
        DewPointDescription.textContent = 'dry and crisp air';
    } else if(dewpoint_c < 16) {
        DewPointDescription.textContent = 'pleasant and comfortable air';
    } else if(dewpoint_c < 21) {
        DewPointDescription.textContent = 'a bit humid and sticky air';
    } else if(dewpoint_c < 24) {
        DewPointDescription.textContent = 'uncomfortable and muggy air';
    } else if (dewpoint_c >= 24) {
        DewPointDescription.textContent = 'very oppressive and humid air!';
    }
}

function getAQIDetails(index) {
    const AQI = {
        1:{status:"good", color:"#00e100", general_advice:"great day for outdoor exercise!", sensitive_advice:"perfect air quality for everyone", icon:"🏃‍♂️‍➡️"},
        2:{status:"moderate", color:"#ffff00", general_advice:"a good day to be outside", sensitive_advice:"limit prolonged outdoor exertion if you have asthma", icon:"🚶‍♂️‍➡️"},
        3:{status:"unhealthy for sensitive groups", color:"#ff7e00", general_advice:"it's okay to be outside, but take breaks", sensitive_advice:"avoid outdoor activities. Stay indoors if possible", icon:"⚠️"},
        4:{status:"unhealthy", color:"#ff0000", general_advice:"wear a mask if you're outside for long", sensitive_advice:"stay indoors with air purification on", icon:"😷"},
        5:{status:"very unhealthy", color:"#8f3f97", general_advice:"avoid all outdoor physical activities", sensitive_advice:"strictly stay indoors. Dangerous for respiratory health.", icon:"🤢"},
        6:{status:"hazardous", color:"#7e0023", general_advice:"dangerous for respiratory health", sensitive_advice:"dangerous for respiratory health", icon:"☠️"}
    }
    return AQI[index] || {status: "unknown", color:"#ccc", advice:"no data available!"};
}

function updateAQISection({current:{air_quality}}){
    const {status, color, general_advice, sensitive_advice, icon} = getAQIDetails(air_quality["us-epa-index"]);
    const {co, no2, o3, pm2_5, pm10, so2, 'us-epa-index':index} = air_quality;
    const AQI_status = document.getElementById('AQIState'); 
    const AQI_bar = document.getElementById('AQIBar2');
    AQI_status.textContent = status;
    AQI_bar.className = '';
    AQI_bar.classList.add(`AQIBar2_${index }`);
}
