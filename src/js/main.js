const FIRST_STAGE = 'NEW';
const SECOND_STAGE = 'PREPARATION';
const THIRD_STAGE = 'PREPAYMENT_INVOICE';

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

function getCategoryOfDeals(str, map) {
    let array = [];
    return array = map.get(str);
}

function getPlaceFromDeal(str) {
    if (str) {
        let dealIncompleteAddress = (str);
        let invalidCoordinates = dealIncompleteAddress.split('|');
        if (invalidCoordinates) {
            let destination = invalidCoordinates[1].split(';');
            return new Place(parseFloat(destination[0]), parseFloat(destination[1]));
        } else {
            return null;
        }
    } else {
        return null;
    }
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
        },
        {
            ID: "6",
            STAGE_ID: "PREPAYMENT_INVOICE",
            TITLE: "3-я стадия",
            UF_CRM_1598808869287: "",
        }
    ];

    result.forEach(el => {
        console.log(el);
        //получаем координаты и подготавливаем для вывода на карту
        let place = getPlaceFromDeal(el.UF_CRM_1598808869287);
        if (place) {
            let deal = new Deal(el.ID, el.STAGE_ID, el.TITLE, place);
            map.get(el.STAGE_ID).push(deal);
        }
    });

    for (let val of map.keys()) {
        console.log(map.get(val));
    }

    return map;
}

async function initMap() {
    const markers = [];
    let newDeals, serviceDeals, plannedDeals;
    let coordinates = 0;

    try {
        let dealsMap = await getDeals();
        newDeals = getCategoryOfDeals(FIRST_STAGE, dealsMap);
        serviceDeals = getCategoryOfDeals(SECOND_STAGE, dealsMap);
        plannedDeals = getCategoryOfDeals(THIRD_STAGE, dealsMap);
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

    let blueMarkers = newDeals.map((_pos) => new google.maps.Marker({
        position: _pos.place,
        icon: './src/img/blueMarker.svg'
    }));
    let yellowMarkers = serviceDeals.map((_pos) => new google.maps.Marker({
        position: _pos.place,
        icon: './src/img/yellowMarker.svg'
    }));
    let greenMarkers = plannedDeals.map((_pos) => new google.maps.Marker({
        position: _pos.place,
        icon: './src/img/greenMarker.svg'
    }));

    markers.push(...blueMarkers, ...yellowMarkers, ...greenMarkers);

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


