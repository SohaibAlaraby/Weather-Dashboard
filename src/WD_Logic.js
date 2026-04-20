
const APIKey = import.meta.env.VITE_WEATHER_API_KEY;

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
CelBtn.addEventListener("click",(event)=>{ changeTempUnit(WeatherData,true); });
FahBtn.addEventListener("click",(event)=>{ changeTempUnit(WeatherData,false); });

SearchInput.addEventListener("input",handleInput);
function changeTempUnit(data,isCel) {
    updateTempAndWeatherCondition(data.current,isCel);
    updateExtraWeatherInfo(data, isCel);
    createHourlyBar(data.forecast,isCel);
    createDaysBar(data.forecast, isCel);
    updateVisibilitySection(data, isCel);
    updateDewPointSection(data, isCel);
}
async function loadInitialData(event){
    const WeatherContainer = document.getElementById("WeatherAppContainer");
    const loader = document.getElementById('loader');
    const spinner = document.getElementById('spinner');
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve,ms));
    TryAgainbtn.classList.add("hidden");
    spinner.classList.remove("hidden");
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
    const baseURL = `${import.meta.env.BASE_URL}Icons/`;
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
//refactor done start
function setCityName(city) {
    const cityUI = document.getElementById("City");
    cityUI.textContent = city;
}
function setCountryName(country) {
    const countryUI = document.getElementById("Country");
    countryUI.textContent = country;
}
function updateCityAndCountryNames({name:city, country}) {
    setCityName(city);
    setCountryName(country);
}
function setDate(date){
    const DateUI = document.getElementById('Date');

    const Months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const Days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const DayName = Days[date.getDay()];
    const MonthName = Months[date.getMonth()];
    DateUI.textContent = `${DayName}, ${date.getDate()} ${MonthName} ${date.getFullYear()}`;

}
function setTime(time){
    const TimeUI = document.getElementById('Time');
    TimeUI.textContent = time.toLocaleTimeString('en-US',{
        hour12:true,
        hour:"2-digit",
        minute:"2-digit"
    }); 
}
function updateDateAndTime({localtime:time}) {
    const DateObj = new Date(time);
    setDate(DateObj);
    setTime(DateObj);
}

function setWeatherState(WeatherState){
    const WeatherStateUI = document.getElementById('WeatherCondition');
    WeatherStateUI.textContent = WeatherState;
}
function setMainTemp(temp_c,temp_f,isCel){
    const TempUI = document.getElementById('Temp');
    TempUI.textContent = isCel? temp_c : temp_f;
}
function setTempBtn(isCel) {
    const FahBtnUI = document.getElementById('FahrenheitBtn');
    const CelBtnUI = document.getElementById('CelciusBtn');
    if(!isCel) {
        FahBtnUI.classList.remove('deactive-unit');
        CelBtnUI.classList.add('deactive-unit');
        
    } else {
        FahBtnUI.classList.add('deactive-unit');
        CelBtnUI.classList.remove('deactive-unit');
    }
}
function updateTempAndWeatherCondition({temp_c, temp_f,condition:{text:WeatherText}},isCel) {
    setTempBtn(isCel);
    setMainTemp(temp_c,temp_f,isCel);
    setWeatherState(WeatherText);
}


function setFeelsLike(feelslike_c,feelslike_f,isCel) {
    const feelsLikeUI = document.getElementById('FeelsLikeTemp');
    feelsLikeUI.textContent = isCel? `${feelslike_c}°C`:`${feelslike_f}°F`;
}
function setMinMaxTemp(TempObj,isCel) {
    const maxTempUI = document.getElementById('MaxTemp');
    const minTempUI = document.getElementById('MinTemp');
    if(isCel) {
        maxTempUI.textContent = `${TempObj.maxtemp_c}°C`;
        minTempUI.textContent = `${TempObj.mintemp_c}°C`;
        return;
    }
    maxTempUI.textContent = `${TempObj.maxtemp_f}°F`;
    minTempUI.textContent = `${TempObj.mintemp_f}°F`;
}
function setWind(wind_kph,wind_mph,wind_dir,isSIUnits){
    const windUI = document.getElementById('WindSpeed');
    const winddirUI = document.getElementById('windDirection');
    windUI.textContent = isSIUnits?`${wind_kph} Km/h`:`${wind_mph} Mile/h`;
    winddirUI.textContent = wind_dir;
}
function setHumidity(humidity){
    const humidityUI = document.getElementById('HumidityPercent');
    humidityUI.textContent = humidity;
}
function updateExtraWeatherInfo({current:{feelslike_c,feelslike_f,wind_kph,wind_mph,humidity,wind_dir}, forecast:{forecastday:[{day:{maxtemp_c,mintemp_c,maxtemp_f,mintemp_f}}]}},isCel) {
    setFeelsLike(feelslike_c,feelslike_f,isCel);
    setMinMaxTemp({maxtemp_c,mintemp_c,maxtemp_f,mintemp_f},isCel);
    setHumidity(humidity);
    setWind(wind_kph,wind_mph,wind_dir,isCel);
    
}
//refactor done end

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
        changeTempUnit(data,true)
        updateCityAndCountryNames(data.location);
        updateDateAndTime(data.location);
        updateWeatherIcon(data.current);
        updateBackground(data.current);
        updateUVIndex(data);
        updateHumiditySection(data);
        updateAQISection(data);
        updateMoonSection(data.forecast);
        updateSunSection(data.forecast);
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
        <div class="HourByHourInfo" data-hour-index=${index} >
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

function getAQIState(index) {
    const AQI = {
        1:{status:"good"},
        2:{status:"moderate"},
        3:{status:"unhealthy for sensitive groups"},
        4:{status:"unhealthy"},
        5:{status:"very unhealthy"},
        6:{status:"hazardous"}
    }
    return AQI[index] || {status: "unknown"};
}
function updateAQISection({current:{air_quality}}){
    const {status} = getAQIState(air_quality["us-epa-index"]);
    const {'us-epa-index':index} = air_quality;

    const AQI_status = document.getElementById('AQIState'); 
    const AQI_bar = document.getElementById('AQIBarFill');

    AQI_status.textContent = status;
    AQI_bar.className = '';
    AQI_bar.classList.add(`AQIBar2_${index }`);

    updateAQIDetails(air_quality)
}

function updateAQIDetails({co,no2,o3,pm2_5,pm10,so2}) {
    const aqi_ids = ['PM10','PM25','CO','SO2','NO2','O3'];
    const aqi_values = [pm10,pm2_5,co,so2,no2,o3];
    const aqi_val_element = aqi_ids.map((i) => {
        return document.getElementById(i).querySelector('.aqi-value')
    });
    
    aqi_val_element.forEach((item,index) => {
        item.textContent = aqi_values[index];
    });   

    const aqi_dot = aqi_ids.map((i) => {
        return document.getElementById(i).querySelector('.dot')
    });
    aqi_dot.forEach((item, index) => {
        updateAQIDetailsDotColor(item,aqi_ids[index],aqi_values[index]);

    })

}
function updateAQIDetailsDotColor(item, type, value) {
    item.className = 'dot'; 

    const thresholds = {
        'PM10': [54, 150],
        'PM25': [12, 55],
        'CO':   [4400, 9400],
        'SO2':  [20, 200],
        'NO2':  [40, 180],
        'O3':   [100, 140]
    };

    const [greenLimit, orangeLimit] = thresholds[type];
    if (value <= greenLimit) {
        item.classList.add('dot--green');
    } else if (value <= orangeLimit) {
        item.classList.add('dot--orange');
    } else {
        item.classList.add('dot--darkred');
    }
}
function updateMoonSection({forecastday:[{astro:{moon_phase, moonrise, moonset}}]}){
    const Moon_ids = ['MoonPhase', 'MoonriseTime','MoonsetTime'];
    const Moon_vals = [moon_phase,moonrise,moonset];
    Moon_ids.forEach((id, index) => {
        document.getElementById(id).textContent = Moon_vals[index];
    });
    updateMoonPhaseImg(moon_phase)
}
function updateMoonPhaseImg(moon_phase){
    const Phases ={
        "New Moon" : "NewMoon.png",
       "Waxing Crescent" : "WaxingCrescent.png",
        "First Quarter" : "FirstQuarter.png",
        "Waxing Gibbous" : "WaxingGibbous.png",
        "Full Moon" : "Full.png",
        "Waning Gibbous" : "WaningGibbous.png",
        "Last Quarter" : "LastQuarter.png",
        "Waning Crescent" : "WaningCrescent.png"
    }

    const MoonImage =  document.getElementById('MoonImage');
    MoonImage.src = `Icons/${Phases[moon_phase]}`;
    MoonImage.alt = moon_phase;
}
function updateSunSection({forecastday:[{astro:{ sunrise, sunset}}]}){
    const Sun_ids = ['SunriseTime','SunsetTime'];
    const Sun_vals = [sunrise,sunset];
    Sun_ids.forEach((id, index) => {
        document.getElementById(id).textContent = Sun_vals[index];
    });
}


