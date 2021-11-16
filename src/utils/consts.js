Date.prototype.getWeek = function(){

  var day_miliseconds = 86400000,
      onejan = new Date(this.getFullYear(),0,1,0,0,0),
      onejan_day = (onejan.getDay()==0) ? 7 : onejan.getDay(),
      days_for_next_monday = (8-onejan_day),
      onejan_next_monday_time = onejan.getTime() + (days_for_next_monday * day_miliseconds),
      // If one jan is not a monday, get the first monday of the year
      first_monday_year_time = (onejan_day>1) ? onejan_next_monday_time : onejan.getTime(),
      this_date = new Date(this.getFullYear(), this.getMonth(),this.getDate(),0,0,0),// This at 00:00:00
      this_time = this_date.getTime(),
      days_from_first_monday = Math.round(((this_time - first_monday_year_time) / day_miliseconds));

  var first_monday_year = new Date(first_monday_year_time);

  return (days_from_first_monday>=0 && days_from_first_monday<364) ? Math.ceil((days_from_first_monday+1)/7) : 52;
}

String.prototype.splice = function(startIndex,length,insertString) {
  return this.substring(0,startIndex) + insertString + this.substring(startIndex + length);
};

import axios from 'axios';
//let categories;

let commerces;
let associations;
let events;
let liberales;
let eventsItems;
let items = {associations : [], commerces : [], liberales : []};
let weather;

//const API = 'http://192.168.1.142:8080/index.php/';
const API = 'https://maximeredval.fr/wp/';
/*
const WEATHERAPIKEY = "67cb859c2dcbc7136d2e382637f0aa80";
const WEATHERAPIID = "2973258";
const WEATHERAPI = "api.openweathermap.org/data/2.5/weather?id=2973258"
*/

const WEATHERAPIKEY = "1300b78552501da2240c9dddcd4762f078377305f9ca1b28c4b3f02699f76b5e";
const WEATHERAPI = "https://api.meteo-concept.com/api/forecast/daily?token=1300b78552501da2240c9dddcd4762f078377305f9ca1b28c4b3f02699f76b5e&insee=95607"

const COMMERCES = 'wp-json/geodir/v2/commerces';
const EVENTS = 'wp-json/geodir/v2/events';
const ASSOS = 'wp-json/geodir/v2/places'
const LIBERALES = 'wp-json/geodir/v2/liberales'
//const ASSOSCAT = 'wp-json/geodir/v2/places/categories'
const COMMERCESCAT = 'wp-json/geodir/v2/commerces/categories'
const OPTIONS = `?per_page=100`;
const URLFORM = 'http://taverneasy.fr/wp-json/contact-form-7/v1/contact-forms/430/feedback'

  export let dicoDay = {
    1 : 'Mo',
    2 : 'Tu',
    3 : 'We',
    4 : 'Th',
    5 : 'Fr',
    6 : 'Sa',
    7 : 'Su'
  }

  export let dicoDayFr = {
    'Mo' : 'Lu',
    'Tu' : 'Ma',
    'We' : 'Me',
    'Th' : 'Je',
    'Fr' : 'Ve',
    'Sa' : 'Sa',
    'Su' : 'Di'
  }

  export let dicoClass = {
    "alimentaire" : "shopping-cart",
    "services" : "home",
    "bien-etre" : "prescription-bottle-alt",
    "medical-1" : "stethoscope",
  }

  export let dicoColor = {
    "alimentaire" : "rgb(61, 38, 69)",
    "services" : "rgb(61, 38, 69)",
    "bien-etre" : "rgb(78, 103, 102) ",
    "medical-1" : "rgb(112, 5, 72)",
    "undefined" : "rgb(244, 232, 193)"
  }

  export let dicoraireCouleurs = {
    "Open now" : {color: "has-text-success", fr:"Ouvert"}, 
    "Closed now" : {color: "has-text-danger", fr:"Fermé"}, 
    "null" : {color:"has-text-warning", fr:"Horaires Indisponibles"},
    "undefined" : {color:"has-text-warning", fr:""}
  }

  export async function getWeather () {
      
    if (!weather) {
      if (!getWithExpiry('weather')) {
          let blub = await axios(WEATHERAPI);
          weather = blub.data;
          weather = weather.forecast;
          setWithExpiry('weather', weather, 900000);
          return weather;
      } else return weather = getWithExpiry('weather');
    }
    else return weather;
  }

  export function writeWeather(dateIn) {
    
    let mob = window.matchMedia("(max-width: 768px)"); 

    let icon = (fa, bul) => {
      return `<span class="icon is-medium ${bul || 'has-text-white'}"><i class="${fa}"></i></span>`
    }

    let rainString = {
      0 : !mob.matches ? "Et à priori, il ne pleuvra pas mais restons prudent" : icon('fas fa-sun', 'has-text-warning'),
      1 : !mob.matches ? "Et à priori, il ne pleuvra pas mais restons prudent" : icon('fas fa-cloud-sun', 'has-text-warning'),
      2 : !mob.matches ? "Peut-être quelques gouttes mais rien de bien méchant" : icon('fas fa-cloud-sun', 'has-text-warning'),
      3 : !mob.matches ? "Peut-être quelques gouttes mais rien de bien méchant" : icon('fas fa-cloud-sun', 'has-text-warning'),
      4 : !mob.matches ? "Et il est possible qu'il pleuve un peu" : icon('fas fa-cloud-sun-rain'),
      5 : !mob.matches ? "Et il est possible qu'il pleuve un peu" : icon('fas fa-cloud-sun-rain'),
      6 : !mob.matches ? "Et il est très problable qu'il pleuve" : icon('fas fa-cloud-rain'),
      7 : !mob.matches ? "Et il est fort problable qu'il pleuve" : icon('fas fa-cloud-rain'),
      8 : !mob.matches ? "Et il va pleuvoir" : icon('fas fa-cloud-rain'),
      9 : !mob.matches ? "Et il va pleuvoir" : icon('fas fa-cloud-rain'),
    }
    
    let today = new Date(Date.now())
    dateIn = new Date(dateIn)
    let diff = Math.ceil((dateIn.getTime() - today.getTime()) / (1000 * 3600 * 24));
    let str = "";
    //console.log("viewport", mob.matches);
    if (!weather || weather == undefined || diff > 13) return "";

    if (weather[diff].tmax >= 30) 
      str += !mob ? `Il va faire très chaud!  (max: ${weather[diff].tmax}°)` : `${weather[diff].tmin}° / ${weather[diff].tmax}°`
    else if (weather[diff].tmax > 25 && weather[diff].tmax < 30) 
      str += !mob ? `Il risque de faire plutôt chaud (max: ${weather[diff].tmax}°)` : `${weather[diff].tmin}° / ${weather[diff].tmax}°`
    else if (weather[diff].tmax < 27 &&  weather[diff].tmin > 11)
      str += !mob ? `Il devrait faire plutôt doux (max: ${weather[diff].tmax}°)` : `${weather[diff].tmin}° / ${weather[diff].tmax}°`
    else if (weather[diff].tmax < 22 &&  weather[diff].tmin > 12)
      str += !mob ? `Il devrait faire plutôt frais (max: ${weather[diff].tmax}° / &nbsp; min: ${weather[diff].tmin}°)` : `${weather[diff].tmin} / ${weather[diff].tmax}°`
    else if (weather[diff].tmax < 18 &&  weather[diff].tmin > 12)
      str += !mob ? `Il devrait faire plutôt très frais (max: ${weather[diff].tmax}° / &nbsp; min: ${weather[diff].tmin}°)` : `${weather[diff].tmin}° / ${weather[diff].tmax}°`
    else if (weather[diff].tmax < 15 &&  weather[diff].tmin > 5)
      str += !mob ? `Il devrait faire plutôt froid (max: ${weather[diff].tmax}° / &nbsp; min: ${weather[diff].tmin}°)` : `${weather[diff].tmin}° / ${weather[diff].tmax}°`
    else if (weather[diff].tmax < 10 &&  weather[diff].tmin > 0)
      str += !mob ? `Il devrait faire plutôt très froid (max: ${weather[diff].tmax} ° / &nbsp; min: ${weather[diff].tmin}°)` : `${weather[diff].tmin}° / ${weather[diff].tmax}°`
    else if (weather[diff].tmax < 5)
      str += !mob ? `Il devrait faire très très froid (max: ${weather[diff].tmax}° / &nbsp; min: ${weather[diff].tmin}°)` : `${weather[diff].tmin}° / ${weather[diff].tmax}°`
    else str+= `(max: ${weather[diff].tmax}° / &nbsp; min: ${weather[diff].tmin}°)`;

      str += "&nbsp;"
      str += rainString[Math.ceil(weather[diff].probarain / 10)];

    return (str.length == 2 ? "" : str)
  }


  export async function getPlaces (placeType) {
    switch (placeType) {
      case "commerces": return await getCommerces(); 
      case "associations": return await getAssos(); 
      case "events": return await getEvents();
      case "liberales": return await getLiberales();
      default : throw new Error ("Merci de passer un type de structure correc")
    }
  }

  async function getCommerces (options) {
    
    if (!commerces) {
      if (!getWithExpiry('localcommerces')) {
        const res = await axios(`${API}${COMMERCES}${options || OPTIONS}`);
        commerces = res.data;
        commerces = commerces.sort((a,b) => (a.title.raw > b.title.raw) ? 1 : ((b.title.raw > a.title.raw) ? -1 : 0))
        setWithExpiry('localcommerces', res.data, 900000);
        return commerces;
      } else return commerces = getWithExpiry('localcommerces');
    }
    else return commerces;
  }

  async function getLiberales (options) {
    
    if (!liberales) {
      if (!getWithExpiry('liberales')) {
        const res = await axios(`${API}${LIBERALES}${options || OPTIONS}`);
        liberales = res.data;
        liberales = liberales.sort((a,b) => (a.title.raw > b.title.raw) ? 1 : ((b.title.raw > a.title.raw) ? -1 : 0))
        setWithExpiry('liberales', res.data, 900000);
        return liberales;
      } else return liberales = getWithExpiry('liberales');
    }
    else return liberales;
  }

  async function getAssos (options) {
    if (!associations) {
      if (!getWithExpiry('localassos')) {
        const res = await axios(`${API}${ASSOS}${options || OPTIONS}`);
        associations = res.data;
        associations = associations.sort((a,b) => (a.title.raw > b.title.raw) ? 1 : ((b.title.raw > a.title.raw) ? -1 : 0))
        setWithExpiry('localassos', res.data, 900000);
        return associations;
      } else return associations = getWithExpiry('localassos');
    }
    else return associations;
  }

  async function getEvents (options) {
    if (!events) {
      if (!getWithExpiry('localevents')) {
        const res = await axios(`${API}${EVENTS}${options || OPTIONS}`);
        events = res.data;
        events = getUnique(events,'id');
        events.pop()
        setWithExpiry('localevents', events, 900000);
        return events;
      } else return events = getWithExpiry('localevents');
    }
    else return events;
  }

  function getUnique(originalArray, prop) {
    var newArray = [];
    var lookupObject  = {};

    for(var i in originalArray) {
       lookupObject[originalArray[i][prop]] = originalArray[i];
    }

    for(i in lookupObject) {
        newArray.push(lookupObject[i]);
    }
     return newArray;
  }

  export function getProp(obj, key) {
    return key.split(".").reduce(function(o, x) {
        return (typeof o == "undefined" || o === null) ? o : o[x];
    }, obj);
  }
  
  function getSafe(obj, props, defaultValue) {
    var res, isvoid = function(x){return typeof x === "undefined" || x === null;}
    if(!isvoid(obj)){
        if(isvoid(props)) props = [];
        if(typeof props  === "string") props = props.trim().split(".");
        if(props.constructor === Array){
            res = props.length>1 ? getSafe(obj[props.shift()],props,defaultValue) : obj[props[0]];
        }
    }
    return typeof res === "undefined" ? defaultValue: res;
  }

  export function getItems (obj, toggle) {
    if ((!items.associations.length && toggle=="associations") || (!items.commerces.length && toggle=="commerces")) {
      items[toggle] = [];
    
      let cats = []; let tmp = [];

      for (let i = 0; i < obj.length ; i++) {

        for (let x = 0; x < obj[i].post_category.length; x++) {
          if (obj[i].post_category[x].id == obj[i].default_category 
              && !tmp.includes(obj[i].post_category[x].name)) {

                tmp.push(obj[i].post_category[x].name);
                
                cats.push({
                  name : `■ Catégorie : ${obj[i].post_category[x].name}`,
                  slug : obj[i].post_category[x].slug,
                  id : obj[i].default_category,
                  type : 'category'
                });
          }
        }
        items[toggle][i] = {name : obj[i].title.rendered, type: 'place', index : i, id : obj[i].id}
      }
      items[toggle] = cats.concat(items[toggle]);
      tmp = []; cats = [];
    }
    return items[toggle];
  }

  export function getEventsItems (obj) {
    if (!eventsItems) {
      eventsItems = [];
      let cats = []; let tmp = [];

      for (let i = 0; i < obj.length ; i++) {

        for (let x = 0; x < obj[i].post_category.length; x++) {
          if (obj[i].post_category[x].id == obj[i].default_category 
              && !tmp.includes(obj[i].post_category[x].name)) {

                tmp.push(obj[i].post_category[x].name);
                
                cats.push({
                  name : `🖹 Catégorie : ${obj[i].post_category[x].name}`,
                  slug : obj[i].post_category[x].slug,
                  id : obj[i].default_category,
                  type : 'category'
                });
          }
        }
        eventsItems[i] = {name : obj[i].title.rendered.replace("**",''), type: 'place', index : i, id : obj[i].id}
      }
      eventsItems = cats.concat(eventsItems);
      tmp = []; cats = [];
    }
    return eventsItems;
  }

  export async function sendMail ( obj ) {
    
    let send = await axios.post (URLFORM,
		{
			'nomprenom': obj.nom,
			'adressemail': obj.email,
			'sujet': obj.sujet,
			'lemessage': obj.message
    });
    return send.data;
  }

  export function timeState (dateIn, dateOut) {
    
    let today = new Date(Date.now())
    dateIn = new Date(dateIn) || new Date.now();
    dateOut = new Date(dateOut);
    
    let y = dateIn.getYear() - today.getYear();
    let m = dateIn.getMonth() - today.getMonth();
    let w = dateIn.getWeek() - today.getWeek();
    let d = dateIn.getDay() - today.getDay();
    let diff = Math.ceil((dateIn.getTime() - today.getTime()) / (1000 * 3600 * 24));

    if (dateIn >= today && dateOut <= today)
      return "En ce moment"

    else if (dateIn >= today && dateOut >= today) {
      if (y >= 1 && diff > 180) return y > 1 ? "Dans plus d'un an" : "L'année prochaine";
      else if(diff >= 30)
         return diff <=58 ? "Le mois prochain" : (`Dans ${m} mois`).replace(/(\r\n|\n|\r)/gm," ").replace("-",""); 
      else if (diff >= 8 && diff < 30)
         return diff >= 7 && diff <= 14 ? "La semaine prochaine" : (`Dans ${Math.floor(diff / 7)} semaine`);
      else if (diff >= 0 && diff < 8) {
        if (diff == 1) return "Demain"
          else if (diff == 2) return "Après-Demain"
            else return `Dans ${diff} jour` + (diff >= 1 ? "s" :"");
      }
    }

    else if (dateIn <= today && dateOut <= today) 
      return "Précédemment"
  }

 export async function animate(element, to, duration) {
    if (duration <= 0) return;
    var difference = to - element.scrollTop;
    var perTick = difference / duration * 10;

    setTimeout(function() {
        element.scrollTop = element.scrollTop + perTick;
        if (element.scrollTop === to) return;
        animate(element, to, duration - 10);
    }, 10);
}


export function allHorairesHtml (jason, extraclass) {
  if (!jason.business_hours) return "Horaires indisponibles";
  let horairesString = [];
  let jeanpierre = Object.values(jason.business_hours.rendered.days);

  horairesString.push (`<table class="table is-striped is-narrow jeanpierre ${extraclass || ''}" style="margin:auto;"><tbody>`);
  horairesString.push (
    jeanpierre.map((e) => e.slots[1] 
      ? `<tr><td>${e.day_short} : </td><td>` + e.slots[0].range.replace(/\s+min/g,'') + '</td><td>' + e.slots[1].range.replace(/\s+min/g,'') + '</td></tr>' 
      : `<tr><td>${e.day_short} : </td><td colspan="2">` + e.slots[0].range.replace(/\s+min/g,'') + '</td></tr>' 
    ).join('').replace(/Closed/g, "Fermé")
  );
  horairesString+=`</tbody></table>`;
  return horairesString.replace(/,/g,'')
}

export function allHoraires (jason, toggle) {
  if (toggle != 'commerces' || !jason.business_hours) return;
  let horairesString = [];
  let jeanpierre = Object.values(jason.business_hours.rendered.days);

  horairesString.push (
    jeanpierre.map((e) => e.slots[1] 
      ? e.day_short + e.slots[0].range.replace(/\s+min/g,'') + ' | ' + e.slots[1].range.replace(/\s+min/g,'') 
      : e.day_short + e.slots[0].range.replace(/\s+min/g,'')
    )
  );
  return horairesString
}

export async function makeCategories (slug) {
  const res = await axios(`http://192.168.1.142:8080/wp-json/geodir/v2/${slug}/categories${OPTIONS}`);
  let h = res.data;
  let r = {};

    for (let i = 0; i < h.length; i++) {
      let jeanpierre = h[i].icon.src ? h[i].icon.src.split('/').slice(-1)[0] : h[i].image.src ? h[i].image.src.split('/').slice(-1)[0]  : "undefined.svg";
      
      if (jeanpierre.substring(jeanpierre.length -3 ) == "png") 
        jeanpierre = "undefined.svg";
      r[h[i].slug] = {name : h[i].name, icon: jeanpierre, color : "#"+((1<<24)*Math.random()|0).toString(16)};
    }
    return r;
}

export function getDefaultCategory (item) {

  for (let x = 0; x < item.post_category.length; x++) {
    if (item.post_category[x].id == item.default_category) {
      return item.post_category[x].slug;
    }
  }
  if (item.post_category[item.post_category.length]) 
    return item.post_category[item.post_category.length].slug
      else return ""
  
}

function setWithExpiry(key, value, ttl) {
  const now = new Date()
  
  // `item` is an object which contains the original value
  // as well as the time when it's supposed to expire
	const item = {
		value: value,
		expiry: now.getTime() + ttl
	}
	localStorage.setItem(key, JSON.stringify(item))
}

function getWithExpiry(key) {
	const itemStr = localStorage.getItem(key)
	// if the item doesn't exist, return null
	if (!itemStr) {
		return null
	}
	const item = JSON.parse(itemStr)
	const now = new Date()
	// compare the expiry time of the item with the current time
	if (now.getTime() > item.expiry) {
		// If the item is expired, delete the item from storage
		// and return null
		localStorage.removeItem(key)
		return null
	}
	return item.value
}

