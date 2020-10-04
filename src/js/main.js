class Place {
    constructor(lat, long) {
        this.lat = lat;
        this.lng = long;
    }
}

class Deal {
    constructor(id, stage, title, place) {
        this.id = id;
        this.stage = stage;
        this.title = title;
        this.place = place;
    }
}

const FIRST_STAGE = 'NEW';
const SECOND_STAGE = 'PREPARATION';
const THIRD_STAGE = 'PREPAYMENT_INVOICE';

function getCategoryOfDeals(str, map) {
    let array = [];
    return array = map.get(str);
}

function getPlaceFromDeal(str) {
    let dealIncompleteAddress = (str);
    let invalidCoordinates = dealIncompleteAddress.split('|');
    let destination = invalidCoordinates[1].split(';');
    return new Place(parseFloat(destination[0]), parseFloat(destination[1]));
}

async function getDeals() {
    const map = new Map([
        [FIRST_STAGE, []],
        [SECOND_STAGE, []],
        [THIRD_STAGE, []]
    ]);
    const result = [
        {
            ID: '2',
            STAGE_ID: "NEW",
            TITLE: "Анализ заправок.",
            UF_CRM_1598808869287: "улица 10 лет Октября, 90к1, Омск, Russia|54.984951;73.4012343"
        },
        {
            ID: "8",
            STAGE_ID: "NEW",
            TITLE: "Дать сала Андрюшке",
            UF_CRM_1598808869287: "Исилькуль, Omsk Oblast, Russia|54.916529;71.266638"
        },
        {
            ID: "4",
            STAGE_ID: "PREPARATION",
            TITLE: "2-я стадия",
            UF_CRM_1598808869287: "улица Добровольского, 8, Омск, Russia|54.9991464;73.3605812"
        },
        {
            ID: "6",
            STAGE_ID: "PREPAYMENT_INVOICE",
            TITLE: "3-я стадия",
            UF_CRM_1598808869287: "Здание сельскохозяйственного училища, Институтская площадь, Омск, Russia|55.0225655;73.31209559999999",
        }
    ];

    result.forEach(el => {
        console.log(el);
        //получаем координаты и подготавливаем для вывода на карту
        let place = getPlaceFromDeal(el.UF_CRM_1598808869287);
        let deal = new Deal(el.ID, el.STAGE_ID, el.TITLE, place);
        map.get(el.STAGE_ID).push(deal);
    })

    for (let val of map.keys()) {
        console.log(map.get(val));
    }

    return map;
}

async function initMap() {
    let  dealsMap = new Map()
    const marker = {
        path: 'M245.791,0C153.799,0,78.957,74.841,78.957,166.833c0,36.967,21.764,93.187,68.493,176.926\
        c31.887,57.138,63.627,105.4,64.966,107.433l22.941,34.773c2.313,3.507,6.232,5.617,10.434,5.617s8.121-2.11,10.434-5.617\
        l22.94-34.771c1.326-2.01,32.835-49.855,64.967-107.435c46.729-83.735,68.493-139.955,68.493-176.926\
        C412.625,74.841,337.783,0,245.791,0z M322.302,331.576c-31.685,56.775-62.696,103.869-64.003,105.848l-12.508,18.959\
        l-12.504-18.954c-1.314-1.995-32.563-49.511-64.007-105.853c-43.345-77.676-65.323-133.104-65.323-164.743\
        C103.957,88.626,167.583,25,245.791,25s141.834,63.626,141.834,141.833C387.625,198.476,365.647,253.902,322.302,331.576z M245.791,73.291c-51.005,0-92.5,41.496-92.5,92.5s41.495,92.5,92.5,92.5s92.5-41.496,92.5-92.5\
\t\t\tS296.796,73.291,245.791,73.291z M245.791,233.291c-37.22,0-67.5-30.28-67.5-67.5s30.28-67.5,67.5-67.5\
\t\t\tc37.221,0,67.5,30.28,67.5,67.5S283.012,233.291,245.791,233.291z',
        // anchor: ( 0,  0)
    };
    const blueMarker = 'src/img/blueMarker.png';
    const yellowMarker = 'src/img/yellowMarker.png';
    const markers = [];
    let deals, newDeals;
    let coordinates

    try {

        dealsMap = await getDeals();
        newDeals = getCategoryOfDeals(FIRST_STAGE, dealsMap);
        coordinates = newDeals.map(deal => deal.place);
    } catch (e) {
        // тут обрабатываем ошибку #{1}
        return console.error(e);
    }

    // создаем экземпляр карты
    const map = new google.maps.Map(
        document.getElementById('map'), {zoom: 6}
    );

    // let labels = 'ABC';
    console.log(`На карте будет ${coordinates.length} маркеров`);
    // const infowindow = new google.maps.InfoWindow({
    //     content: 'Hello Moto!'
    // });


    let greenMarkers = newDeals.map((_pos) => new google.maps.Marker({
        position: _pos.place,
        icon: marker
    }));


    markers.push(...greenMarkers);


    console.log(markers);

    // импровизированное центрование отметок
    if (Array.isArray(markers) && markers.length) {
        const avg = markers.reduce((prev, cur) => [prev[0] + cur.position.lat(), prev[1] + cur.position.lng()], [0, 0]);

        map.setCenter({
            lat: avg[0] / markers.length,
            lng: avg[1] / markers.length,
        });
    }


    // Add a marker clusterer to manage the markers.
    const markerCluster = new MarkerClusterer(
        map,
        markers,
        {imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'}
    );

}

// function include(url) {
//     let script = document.createElement('script');
//     script.setAttribute('defer', '');
//     script.src = url;
//     let scripts = document.getElementsByTagName('body');
//     scripts[0].appendChild(script);
// }
//
// include('https://maps.googleapis.com/maps/api/js?key=AIzaSyBOXjzORCt4qtazCEkxJqXyajzsMnUcnyU&callback=initMap');


