<svelte:head>
<link href='https://api.mapbox.com/mapbox-gl-js/v1.11.1/mapbox-gl.css' rel='stylesheet' />
</svelte:head>

<script>

  import Marker from "./subcomp/Marker.svelte"
  import { activeListItem, activeMapItem, selectedItem, isScrolling } from './stores.js';
  import { createEventDispatcher, onMount, onDestroy, setContext } from 'svelte';
  import { dicoClass, dicoColor, dicoDayFr, getProp, allHorairesHtml, dicoraireCouleurs, getDefaultCategory } from './utils/consts';  
  import {dicoIcons} from './utils/categories.js'
  import { mapbox, key } from './mapbox.js';


  let container;
  let items;
  let placeHolder = 'http://maximeredval.fr/wp/wordpress/wp-content/uploads/2020/04/penguin.jpg/penguin.jpg';
  const dispatch = createEventDispatcher();
  let mapMax;
  let elements = [];
  let previousItem;
  let firstTimeUpdate = true;
  let defaultCategory = 0;
  const DEFAULTLON = 2.2167; const DEFAULTLAT = 49.0333;

  export let A = [];
  export let reset;
  export let toggle;


  setContext(key, {
		getMap: () => mapMax
	});
  
  onMount(async () => {

    mapMax = new mapbox.Map({ 
      container,
      style: 'mapbox://styles/redval/ck8niri3e2nd81ipdyf627w1y?optimize=true',
      center: [A[0].longitude, A[0].latitude],
      zoom: 14,
      maxBounds : [[2.1667,49],[2.2667,49.05]]
    });

    mapMax.on('load', function() {
      mapMax.addLayer({
        id: 'places',
        type: 'symbol',
        source: {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: A.map(generateFeature)
          }
        },
        layout: {
          'icon-allow-overlap': true
        }
      });
      mapMax.resize();
    });

    mapMax.addControl(
      new mapbox.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: false
        },
        trackUserLocation: true
      })
    );
    mapMax.addControl(new mapbox.NavigationControl({options:{showZoom : true}}));
  
    return () => {map.remove()};

  });

  function generateFeature({ title, featured_image, latitude, longitude }, index) {
    return {
      type: 'Feature',
      properties: {
        //description: `<b>${title.rendered || 'manque le titre'}</b>`,
        id: index
      },
      geometry: {
        type: 'Point',
        coordinates : [longitude, latitude]
      }
    };
  }
  
  function resetScroll () {
    setTimeout(()=>{$isScrolling = false}, 2000);
  }
    
  const unsubscribeActiveMapItem = activeMapItem.subscribe(newActiveMapItem => {
    if (mapMax &&!$isScrolling) {
      mapMax.flyTo({
        center: [getProp(A[newActiveMapItem], "longitude") || DEFAULTLON, getProp(A[newActiveMapItem], "latitude") || DEFAULTLAT ],
        zoom:17
      });

    }
    resetScroll()
  });

  onDestroy(async () => unsubscribeActiveMapItem);

</script>
<div id="map" bind:this={container}>
  {#if mapMax}
    {#each A as M, index (M.id)}
      <Marker lat={M.latitude} lon={M.longitude}
        horaires={allHorairesHtml(M)}
        title={M.title.rendered}
        currentStatus={
            toggle == "commerces" ?
              dicoraireCouleurs[getProp(M,'business_hours.rendered.extra.current_label')].fr :
              toggle == "events" ?
              M.start_date?.rendered : ""
          }
        svgmask={dicoIcons[getDefaultCategory(M)] ? dicoIcons[getDefaultCategory(M)].icon : 'undefined.svg'}
        bgColor = {dicoIcons[getDefaultCategory(M)] ? dicoIcons[getDefaultCategory(M)].color : "#FFF" }
        titleColor = {dicoraireCouleurs[getProp(M, 'business_hours.rendered.extra.current_label')].color}
        {index}
        Alength={A.length}
        on:updateListPlease={((e) => activeListItem.set(e.detail.state))}
      />
    {/each}
  {/if}
</div>

<style>

  :global(.mapboxgl-popup) {
    min-width:13vw;
    line-height: 2.5em!important;
    opacity: 0.85;
    z-index:50;
  }

  :global(.mapboxgl-map) {
    font-family:var(--font-stack)
  }

  :global(.mapboxgl-popup-close-button) {
    font-size:32px;
  }

  :global(.mapboxgl-popup-content p) {
    text-align: center;
    padding-top:1em;
  }

   :global(.mapboxgl-popup-content) {
    min-width: max-content;
  }

  :global(.mapboxgl-canvas-container) {
    height: 94.5vh;
  }

  #map:before {
    /*box-shadow: 20px 0 10px -10px rgba(0, 0, 0, 0.15) inset;*/
    content: '';
    height: 100%;
    left: 0;
    position: absolute;
    width: 20px;
    z-index: 90;
  }

  :global(.mapboxgl-ctrl-top-right) {
    top:30px!important;
    right:10px!important;
  }

	@media screen and (min-width: 768px) and (max-width: 1366px) {
		#map {
			position: relative; top: 0; right:0;
		}
	}



@media screen and (max-width: 768px) {
 :global(.mapboxgl-popup) {
    display:none!important;
  }
  #map {
    height: 35vh;
  }
  :global(.mapboxgl-canvas-container) {
    height: fit-content;
  }
  #map:before {
    box-shadow: none;
    content: none;
    z-index:auto;
  }
  :global(.mapboxgl-ctrl-top-right) {
    right: 90%!important;
  }
  :global(.mapboxgl-ctrl-logo) {
    display:none!important;
  }
}
@media screen and (max-width: 1024px)  {
  :global(.mapboxgl-ctrl-group:not(:empty)) {
    margin-top:-10px!important;
  }
  :global(.mapboxgl-ctrl-geolocate) {
      margin-bottom: 12px;
  }
}

</style>