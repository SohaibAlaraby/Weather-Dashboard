
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
CelBtn.addEventListener("click",(event)=>{ changeTempUnit(WeatherData,true,'CelciusBtn','FahrenheitBtn'); });
FahBtn.addEventListener("click",(event)=>{ changeTempUnit(WeatherData,false,'CelciusBtn','FahrenheitBtn'); });

SearchInput.addEventListener("input",handleInput);
function ChangeArialPressed(celBtnID,fahBtnID,isCel){
    const celBtn = document.getElementById(celBtnID);  
    const fahBtn = document.getElementById(fahBtnID);  
    if(!celBtn || !fahBtn) return;
    celBtn.ariaPressed = `${isCel}`;
    fahBtn.ariaPressed = `${!isCel}`;
}
function changeTempUnit(data,isCel,celBtnID,fahBtnID) {
    ChangeArialPressed(celBtnID,fahBtnID,isCel)
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
                data = await fetchWeatherData('Alexandria');
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
    if(!event.target.value || validateCityName(value)) deleteWarningMessage('WarningMessage');
}
function validateCityName(city) {
    const validPattern = /^[a-zA-Z\u0600-\u06FF\s\-']+$/;//allow [English Arabic space - ']
    if(city && validPattern.test(city)) return true;
    return false;
}
function createNewElement(tag,elementID,containerID){
        if(!containerID || !tag) return null;
        const container= document.getElementById(containerID);
        if (!container) return null;
        const element = document.createElement(tag);
        element.id = elementID;
        // SearchBarContainer.append(p);
        container.append(element);
        return element;
}
function showWarningMessage(warningElementID,warningContainerID,message) {
    if(!warningElementID) return;
    let warningElement = document.getElementById(warningElementID);
    if(!warningElement) {
        warningElement = createNewElement('p',warningElementID,warningContainerID);
        if(!warningElement) return;
    }
    warningElement.textContent=message;
    warningElement.classList.remove('hidden');
}
function deleteWarningMessage(warningElementID) {
    if(!warningElementID) return;
    let warningElement = document.getElementById(warningElementID);
    if(!warningElement) return;
    warningElement.classList.add('hidden');
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
function updateAppHeader({location}){
    updateCityAndCountryNames(location);
    updateDateAndTime(location);
}
function setWeatherState(WeatherState){
    const WeatherStateUI = document.getElementById('WeatherCondition');
    WeatherStateUI.textContent = WeatherState;
}
function setMainTemp(temp_c,temp_f,isCel){
    const TempUI = document.getElementById('Temp');
    TempUI.textContent = Math.round(isCel? temp_c : temp_f);
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

async function fetchWeatherData(cityName){
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
function updateMainInfoSection(data,isCel){
    updateTempAndWeatherCondition(data.current,isCel);
    updateExtraWeatherInfo(data, isCel);
    updateWeatherIcon(data.current);
}
function updateDetailedDataSections(data,isCel) {
        createHourlyBar(data.forecast,isCel);
        createDaysBar(data.forecast, isCel);
        updateVisibilitySection(data, isCel);
        updateDewPointSection(data, isCel);
        updateWeatherIcon(data.current);
        updateBackground(data.current);
        updateUVIndex(data);
        updateHumiditySection(data);
        updateAQISection(data);
        updateMoonSection(data.forecast);
        updateSunSection(data.forecast);
        updatePressureSection(data);
}
function updateWeatherDataInUI(data){

    try{
        updateAppHeader(data);
        updateMainInfoSection(data,true);
        updateDetailedDataSections(data,true);
        
    }catch(error) {
        console.error("UI update error:",error);
    }
}
async function searchBtnPressed(event) {

    event.preventDefault();
    let SearchInputContent = SearchInput.value.trim(); //trim all spaces from start and end
    let isValidContent = validateCityName(SearchInputContent);
    if(!isValidContent){ 
        showWarningMessage('WarningMessage','SearchContainer','Please input a valid city name');
        return;
    }
    deleteWarningMessage('WarningMessage');
    let data;
    try{
        data = await fetchWeatherData(SearchInputContent);
        if(data){
        WeatherData = data;
        console.log(WeatherData);
        updateWeatherDataInUI(data);
        }
    }catch(error){
        if(!navigator.onLine || error instanceof TypeError){
            showWarningMessage('WarningMessage','SearchContainer','Network error: Please check your connection.');
        } else  {
            showWarningMessage('WarningMessage','SearchContainer',error.message);
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
    const HourlyBarContainer = document.getElementById('TodayDetailedInfo');
    if (!HourlyBarContainer) return;

    const fragment = document.createDocumentFragment();

    hourArr.forEach((hour, index) => {
        const timeValue = new Date(hour.time);
        const displayTime = timeValue.toLocaleTimeString('en-US', {
            hour12: true,
            hour: "2-digit"
        });
        const isoTime = hour.time;

        const li = document.createElement('li');
        li.className = 'HourlyDailyCard';
        li.setAttribute('data-hour-index', index);
        li.setAttribute('tabindex', '0'); 
        li.innerHTML = `
            <time datetime='${isoTime}'>${displayTime}</time>
            <img src="https://${hour.condition.icon}" alt="${hour.condition.text}" aria-hidden="true">
            <span>${Math.round(isCel ? hour.temp_c : hour.temp_f)}°</span>
            <span class="centerVertically position-relative">
                <span class="material-symbols-outlined" aria-hidden="true">humidity_high</span>
                <span class="sr-only">Humidity:</span> ${hour.humidity}%
            </span>
        `;

        fragment.appendChild(li);
    });
    HourlyBarContainer.innerHTML = ''; 
    HourlyBarContainer.appendChild(fragment);
}

function createDaysBar({forecastday}, isCel) {
    
    const dailyForcastContainer = document.getElementById('NextDaysPrediction')
    if (!dailyForcastContainer) return;

    const fragment = document.createDocumentFragment();
    
    const dayNameFormatter = new Intl.DateTimeFormat('en-US', { weekday: 'long' });

    forecastday.forEach((day, index) => {
        const dateObj = new Date(day.date);
        
        let dayName = index === 0 ? "Today" : dayNameFormatter.format(dateObj);

        const { maxtemp_c, mintemp_c, maxtemp_f, mintemp_f, avghumidity } = day.day;
        const { icon, text } = day.day.condition;

        const max = Math.round(isCel ? maxtemp_c : maxtemp_f);
        const min = Math.round(isCel ? mintemp_c : mintemp_f);

        const li = document.createElement('li');
        li.className = 'HourlyDailyCard'; 
        li.setAttribute('data-day-index', index);
        li.setAttribute('tabindex', '0');

        li.innerHTML = `
            <time datetime="${day.date}">${dayName}</time>
            <img src="https://${icon}" alt="${text}" aria-hidden="true">
            <span class="centerVertically position-relative">
                <span class="material-symbols-outlined" aria-hidden="true">north</span>
                <span class="sr-only">Max temp:</span> ${max}° 
                <span class="material-symbols-outlined" aria-hidden="true">south</span>
                <span class="sr-only">Min temp:</span> ${min}°
            </span>
            <span class="centerVertically position-relative">
                <span class="material-symbols-outlined" aria-hidden="true">humidity_high</span>
                <span class="sr-only">Humidity:</span> ${avghumidity}%
            </span>
        `;

        fragment.appendChild(li);
    });

    dailyForcastContainer.innerHTML = '';
    dailyForcastContainer.appendChild(fragment);

}

function updateUVIndex({current:{uv:UVIndex}}){

    const UVdescription = document.getElementById("UVIndexDescription");
    const UVPointer = document.getElementById("UVPointer");
    const UVBar = document.getElementById("UVBar");
    const UVIndexValue = UVIndex.toFixed(1);
    UVBar.ariaValueNow=`${UVIndexValue}`
    UVPointer.textContent = UVIndexValue;
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

    const AQIStatus = document.getElementById('AQIState'); 
    const AQIBarContainer = document.getElementById('AQIBarContainer');
    const AQIBar = document.getElementById('AQIBarFill');

    AQIStatus.textContent = status;
    AQIBar.className = '';
    AQIBar.classList.add(`AQIBar2_${index }`);
    AQIBarContainer.ariaValueNow=`${index}`;

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
        item.title='Healthy';
        item.ariaLabel ='Healthy.';
    } else if (value <= orangeLimit) {
        item.classList.add('dot--orange');
        item.title='Moderate';
        item.ariaLabel ='Moderate.';
    } else {
        item.classList.add('dot--darkred');
        item.title='Unhealthy';
        item.ariaLabel ='Unhealthy.';
    }
}
function updateMoonSection({forecastday:[{astro:{moon_phase, moonrise, moonset}}]}){
    const MoonPhase = document.getElementById('MoonPhase');
    if(MoonPhase) {
        MoonPhase.textContent = moon_phase;
    }
    const MoonriseTime = document.getElementById('MoonriseTime');
    if(MoonriseTime) {
        MoonriseTime.textContent = moonrise;
        MoonriseTime.dateTime = moonrise;
    }
    const MoonsetTime = document.getElementById('MoonsetTime');
    if(MoonsetTime) {
        MoonsetTime.textContent = moonset;
        MoonsetTime.dateTime = moonset;
    }
    
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
        const element = document.getElementById(id)
        if(!element)return;
        element.textContent = Sun_vals[index];
        element.dateTime = Sun_vals[index];

    });
}

function updatePressureSection({current:{pressure_mb}}){
    const PressureID = 'PressureValue';
    const Pressure= document.getElementById(PressureID);
    Pressure.textContent = `${pressure_mb} mb`;
}
