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
    constructor(id, stage, company_id, title, place, comments) {
        this.id = id;
        this.stage = stage;
        this.company_id = company_id;
        this.title = title;
        this.place = place;
        this.comments = comments;
    }
}

function showCountOfDeals(arr) {
    return arr.map(el => el.place).length;
}

function getCategoryOfDeals(str, map) {
    let array = [];
    return array = map.get(str);
}

function getPlaceFromDeal(str) {
    if (!str || typeof str !== 'string') return null;
    let invalidCoordinates = str.split('|');
    if (!invalidCoordinates || invalidCoordinates.length !== 2) return null;
    let destination = invalidCoordinates[1].split(';');
    if (isNaN(Number(destination[0])) || isNaN(Number(destination[1]))) return null;
    return new Place(Number(destination[0]), Number(destination[1]));
}

async function getCompanyTitle(id) {
    return new Promise(resolve => {

        BX24.callMethod("crm.company.get", {
                id: id
            },
            function (result) {
                if (result.error()) {
                    throw new Error(result.error())
                }
                console.log(result.data())

                result.data().forEach(el => {
                    if (!el) {
                        console.log(`Компании с указанным ${id} не существует`)
                    } else {

                    }

                })
            }
        )
    })
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
            COMPANY_ID: "0",
            UF_CRM_1598808869287: "улица 10 лет Октября, 90к1, Омск, Russia|54.984951;73.4012343",
            COMMENTS: null
        },
        {
            ID: "8",
            STAGE_ID: "NEW",
            TITLE: "Дать сала Андрюшке",
            COMPANY_ID: "2",
            UF_CRM_1598808869287: "Исилькуль, Omsk Oblast, Russia|54.916529;71.266638",
            COMMENTS: null
        },
        {
            ID: "4",
            STAGE_ID: "PREPARATION",
            TITLE: "2-я стадия",
            COMPANY_ID: "0",
            UF_CRM_1598808869287: "улица Добровольского, 8, Омск, Russia|54.9991464;73.3605812",
            COMMENTS: null
        },
        {
            ID: "6",
            STAGE_ID: "PREPAYMENT_INVOICE",
            TITLE: "3-я стадия",
            COMPANY_ID: "2",
            UF_CRM_1598808869287: "Здание сельскохозяйственного училища, Институтская площадь, Омск, Russia|55.0225655;73.31209559999999",
            COMMENTS: null
        },
        {
            ID: "6",
            STAGE_ID: "PREPAYMENT_INVOICE",
            TITLE: "3-я стадия",
            COMPANY_ID: "2",
            UF_CRM_1598808869287: "Здание сельскохозяйственного училища, Институтская площадь, Омск, Russia",
            COMMENTS: null
        },
        {
            ID: "10",
            STAGE_ID: "NEW",
            COMPANY_ID: "2",
            TITLE: "Огрести от начальства",
            UF_CRM_1598808869287: "Пригородная улица, 17/2, Омск, Russia|55.022999;73.2624909",
            COMMENTS: ""
        }
    ];

    result.forEach(el => {
        console.log(el);
        //получаем координаты и подготавливаем для вывода на карту
        let place = getPlaceFromDeal(el.UF_CRM_1598808869287);
        if (place) {
            let deal = new Deal(el.ID, el.STAGE_ID, el.COMPANY_ID, el.TITLE, place, el.COMMENTS);
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
    let dealsMap, newDeals, serviceDeals, plannedDeals;
    let icon = {
        path: "M16.734,0C9.375,0,3.408,5.966,3.408,13.325c0,11.076,13.326,20.143,13.326,20.143S30.06,23.734,30.06,13.324        " +
            "C30.06,5.965,24.093,0,16.734,0z M16.734,19.676c-3.51,0-6.354-2.844-6.354-6.352c0-3.508,2.844-6.352,6.354-6.352        " +
            "c3.508-0.001,6.352,2.845,6.352,6.353C23.085,16.833,20.242,19.676,16.734,19.676z",
        fillOpacity: 0.8,
        anchor: new google.maps.Point(16, 32)
    };

    try {
        dealsMap = await getDeals();
        newDeals = getCategoryOfDeals(FIRST_STAGE, dealsMap);
        serviceDeals = getCategoryOfDeals(SECOND_STAGE, dealsMap);
        plannedDeals = getCategoryOfDeals(THIRD_STAGE, dealsMap);
    } catch (e) {

        // тут обрабатываем ошибку #{1}
        return console.error(e);
    }

    // создаем экземпляр карты
    const map = new google.maps.Map(
        document.getElementById('map'), {zoom: 6}
    );

    console.log(`На карте будет ${newDeals.length} новых сделок`);
    console.log(`На карте будет ${serviceDeals.length} сервисных сделок`);
    console.log(`На карте будет ${plannedDeals.length} запланированных сделок`);

    let blueMarkers = newDeals.map((_pos) => {
        return new google.maps.Marker({
            position: _pos.place,
            icon: Object.assign(icon, {fillColor: '#66afe9'})
        })
        // const infoWindow = new google.maps.InfoWindow({
        //     content: _pos.title,
        // });
    });
    let yellowMarkers = serviceDeals.map((_pos) => new google.maps.Marker({
        position: _pos.place,
        icon: Object.assign(icon, {fillColor: '#fff300'})
    }));
    let greenMarkers = plannedDeals.map((_pos) => new google.maps.Marker({
        position: _pos.place,
        icon: Object.assign(icon, {fillColor: '#00a74c'})
    }));

    markers.push(...blueMarkers, ...yellowMarkers, ...greenMarkers);

    markers.forEach((marker) => {
        let content;

        marker.addListener('click', () => {

            let position = marker.getPosition();

            for (let deals of dealsMap.keys()) {
                dealsMap.get(deals).forEach(el => {
                    if (position.lat() === el.place.lat && position.lng() === el.place.lng) {

                        content = el.title;
                    }
                })
            }
            console.log(content);
            const infoWindow = new google.maps.InfoWindow({
                content: content,
            });
            infoWindow.open(map, marker);
        })
    })

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


