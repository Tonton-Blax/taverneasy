<script>
  import { onMount, onDestroy } from 'svelte';
  import { scale } from 'svelte/transition';
  import { dicoClass, getProp, animate, dicoDay, writeWeather, getWeather, timeState, getDefaultCategory } from './utils/consts.js';
  import { activeListItem, activeMapItem, selectedItem, mobileViewport } from './stores.js';
  import {dicoIcons} from './utils/categories.js'
  import Modal from './subcomp/Modal.svelte'
  import Draggableframes from "./subcomp/Draggableframes.svelte";
  import DropDown from "./subcomp/DropDown.svelte";
  
  export let A = [];
  export let mapContainer;
  
  let rien=false;

    
  //Pour mapper les SVG en fonction de la catégorie
  let defaultCategory;

  //Index de l'élément visible
  let listRef;

  // Pour modal
  let active = false; let currentIndex; let currentTitle; let currentStreet;
  let bigify = false; let bigImageIndex;


  let firstTimeUpdate = true;
     
  let itemTop;
  export let weather = []
  
  onMount(async () => {

    let observer = new IntersectionObserver((entries, observer) => { 
      entries.forEach(entry => {
        if(entry.isIntersecting){
          itemTop = entry.target.getAttribute("idplace");
          if (itemTop !== $activeMapItem)
            activeMapItem.set(itemTop);
        }
      });
    },{threshold: 1});
    
    document.querySelectorAll('.timeline-item').forEach(o => observer.observe(o));
    //weather = await getWeather;
  });

  function setDefaultCategory (index, slug) {
      defaultCategory = index ;
      return dicoClass[slug];
    };

    
  function openModal (idx) {
    currentIndex = idx;
    if (!A[currentIndex].filteredImages)
      A[currentIndex].filteredImages = A[currentIndex].images.filter(e => !e.featured)
    currentTitle = A[idx].title.raw;
    currentStreet = A[idx].street;
    active = true;
  }


// Update list scroll position when active list item is updated via map
  const unsubscribeActiveListItem = activeListItem.subscribe(

    newActiveListItem => {
        if (listRef) {
          if ($mobileViewport.touch.matches)
           listRef.scrollTop = document.getElementById(`list-item-${newActiveListItem}`).offsetTop - 50; 
          else 
            listRef.scrollTop = document.getElementById(`list-item-${newActiveListItem}`).offsetTop - 350; 
        }
      }
    );

  // Suppr listener
  onDestroy(async () => unsubscribeActiveListItem)

  function handleBigify (e) {
    bigImageIndex = e.detail.idx+1;
    bigify = true;
  }

  function exists (url) {
    var img = new Image();
    img.src = url;
    return img.height != 0;
  }
  function niceDate (date) {
    return date.split("-").reverse().join("-");
  }

</script>

<!--  BIG MODAL -->


{#if active}
	<Modal on:close="{() => active = false}" title={currentTitle} width="75vw" bind:active>

    {#if !bigify}
      <Draggableframes 
        images={A[currentIndex].filteredImages.map((e) => e.src || "./imageavenir.jpg" )} 
        video={getProp(A[currentIndex], 'video')}
        on:bigify={(e) => handleBigify(e)}
      />

      <div class="columns is-centered">
        <div class="column has-text-centered is-3">
          <a href="mailto:{A[currentIndex].email}" class="button is-primary is-fullwidth"><i class="fas fa-envelope-square" aria-hidden="true"></i>&nbsp;e-mail</a>
        </div>
        <div class="column has-text-centered is-3">
          <a href="tel:{A[currentIndex].phone}" class="button is-primary is-fullwidth"><i class="fas fa-phone" aria-hidden="true"></i>&nbsp;{A[currentIndex].phone}</a>
        </div>
        <div class="column has-text-centered is-3">
          <a href={A[currentIndex].website} class="button is-primary is-fullwidth"><i class="fas fa-book" aria-hidden="true"></i>&nbsp;Site Web</a>
        </div>
        <div class="column has-text-centered is-3">
          <a href={A[currentIndex].facebook} class="button is-primary is-fullwidth"><i class="fab fa-facebook-f" aria-hidden="true"></i>&nbsp;Page Facebook</a>
        </div>
      </div>

      <div class="columns">
        <div class = "column is-one-quarter">
          <img src="{A[currentIndex].featured_image.src}" height="{A[currentIndex].featured_image.height}" width="{A[currentIndex].featured_image.height}">
          <h3 style="padding:2vh 0;">{currentStreet}</h3>
        </div>
        <div class="column is-three-quarters">
          {@html A[currentIndex].content.rendered}
        </div>
      </div>
    
    {:else if bigify}
    <div class="bigimage" transition:scale><img src = {A[currentIndex].images[bigImageIndex].src} height="100%" width="auto" alt="" on:click={() => bigify = false}></div>
    {/if}

    <span slot="footer" class="card-footer modalfooter">
      {#if A[currentIndex].start_date.raw != A[currentIndex].end_date.raw}
        <p class="card-footer-item is-size-4 has-background-primary has-text-white is-size-7-touch">
          <i class="fas fa-calendar-alt"></i>&nbsp; &nbsp; Du {niceDate(A[currentIndex].start_date.rendered)} au {niceDate(A[currentIndex].end_date.rendered)}</p>
        {:else}
        <p class="card-footer-item is-size-4 has-background-primary has-text-white is-size-7-touch">
          <i class="fas fa-calendar-alt"></i>&nbsp; &nbsp; Le {niceDate(A[currentIndex].start_date.raw)}</p>
      {/if}
      {#if A[currentIndex].start_time.raw == A[currentIndex].end_time.raw}
        <p class="card-footer-item is-size-4 has-background-info has-text-white is-size-7-touch">
          <i class="fas fa-clock"></i>&nbsp; &nbsp; A {A[currentIndex].start_time.raw}</p>
        {:else}
        <p class="card-footer-item is-size-4 has-background-info has-text-white is-size-7-touch">
          <i class="fas fa-clock"></i>&nbsp; &nbsp; De {A[currentIndex].start_time.raw} à {A[currentIndex].end_time.raw}</p>
      {/if}
      {#if A[currentIndex].event_reg_fees}
        <p class="card-footer-item is-size-4 has-background-warning has-text-white is-size-7-touch" ><i class="fas fa-ticket"></i>
            &nbsp; &nbsp;Prix :&nbsp;{A[currentIndex].event_reg_fees > 0 ? A[currentIndex].event_reg_fees +" €" : "Gratuit"}</p>
        {:else}
        <p class="card-footer-item is-size-4 has-background-warning has-text-white is-size-7-touch" ><i class="fas fa-ticket"></i>
            &nbsp; &nbsp;Entrée gratuite</p>
      {/if}
    </span> 

	</Modal>
{/if}

<!-- FIN BIG MODAL -->

<!-- <DropDown title={"Filtrer les événements"} dropDownItems={["Voir tout", "Cette semaine", "Ce week-end", "la semaine prochaine", "Le week-end prochain", "Le mois prochain"]}/> -->

  <div class="timeline is-warning"  bind:this="{listRef}">
  <div id="list-items">
  <div class="head is-hidden-mobile">
    <h1 class="reveal-text">ÉVÉNEMENTS</h1>
    <div style="margin:30px 0px;"></div>
  </div>
  
  {#each A as listItem, index}

  <div class="timeline-item is-warning" id="list-item-{index}" categorie={listItem.default_category} idplace={index}>
    <div class="timeline-marker is-warning">
    <div class="marker-text is-size-6-mobile is-size-3-tablet is-size-3" style="line-height:1.2em;">
      
      {timeState(listItem.start_date.raw, listItem.end_date.raw)}<br>
      <p class="is-size-6 is-size-7-touch">{@html writeWeather(listItem.start_date.raw)}</p>
    </div>
    </div>
    <div class="timeline-content">

  <div class="list-item">
      <div class="card is-horizontal" class:glowing={index == $activeListItem ||index == $activeMapItem}>
        <div class="card-image">
          <div class="image is-pointer">
            <img src="{listItem.featured_image.src || './imageavenir.jpg'}" alt="Placeholder image" on:click={() => openModal(index)} >
          </div>
        </div>
    <div class="card-stacked">
        <div class="card-content">
          <div class="media">
            <div class="media-left is-hidden-touch">
              <figure class="image picto">
                {#each listItem.post_category as cat, index}
                  {#if (cat.id == listItem.default_category)}
                      <img src={dicoIcons[getDefaultCategory(listItem)] ? "./svg/cat/"+dicoIcons[getDefaultCategory(listItem)].icon : './svg/cat/undefined.svg'} alt="Placeholder image">  
                    {/if}
                  {/each} 
              </figure>            
            </div>

            <div class="media-content">
              <p class="title is-4 is-6-max">{@html listItem.title.rendered.trim().replace("**","<br>")}</p>
              <p class="subtitle is-6 is-8-max is-size-7-touch">{listItem.street.split(",")[0].trim()}</p>
              {#if listItem.tlphone}
              <a href="tel:{listItem.tlphone}"> ☎ {listItem.tlphone}</a>
              {/if}
              
              {#each listItem.post_category as tag, index}
                {#if index < 3}
                    <div class="tags-events">#{tag.name}&nbsp;</div>
                {/if}
              {/each}

            </div>
          </div>

            <div class="rouvre">
              <div class="sousrouvre-event has-background-primary is-size-5 is-size-7-touch">
                {#if listItem.start_date.rendered != listItem.end_date.rendered}
                  Du {listItem.start_date.rendered} au {listItem.end_date.rendered}
                {:else}
                  Le {listItem.start_date.raw.split("-").reverse().join("/")} de {listItem.start_time.raw} à {listItem.end_time.raw}
                {/if}
              </div>
            </div>
        </div>

        <div class="content padd maxcontent is-size-6 is-only-desktop">
              <p class="has-text-left puce plie">
               <!-- {@html listItem.content.rendered.substring(0,250)}-->
              </p>        
        </div>
        <button class="button boutoninfo is-warning is-hidden-mobile" on:click={() => openModal(index)}>＋</button>
              
        <footer class="card-footer" id="footer">
        <a href="#" on:click={() => openModal(index)} class="card-footer-item is-size-5 is-size-6-touch has-background-warning has-text-white" >+ d'infos</a>
        {#if listItem.facebook}
          <a href={listItem.facebook} target="_blank" class="card-footer-item is-size-5 is-size-6-touch has-background-primary has-text-white" ><i class="fab fa-facebook-f"></i></a>
        {/if}
        {#if listItem.website}
          <a href={listItem.website} target="_blank" class="card-footer-item is-size-5 is-size-6-touch has-background-info has-text-white" ><i class="fas fa-globe"></i></a>
        {/if}
        {#if listItem.email}
          <a href=mailto:{listItem.email} target="_blank" class="card-footer-item is-size-5 is-size-6-touch has-background-link has-text-white" ><i class="fas fa-envelope-square"></i></a>
        {/if}

        </footer>
    </div>

    </div>
  </div>
  </div></div><!-- VOILA -->
  {/each}
    
  </div> <!-- FIN DIV TIMELINE -->
    {#if rien}
      <div>
      <h1 class="title" style="margin-top:30vh">C'est le désert par ici...</h1>
      <h2 class="subtitle">Nous n'avons rien trouvé pour ces dates</h2>
      </div>
    {/if}
  </div>

<style lang="scss">

  .timeline .timeline-item::before {
    left:-2rem;
  }
  .timeline .timeline-item .timeline-marker {
    height: 48px;
    width: 48px;
    left: -2rem;
    top:10rem;
  }
   .timeline .timeline-item {
     justify-content: flex-start;
   }
  
  .timeline {    
    display: flex;
    flex-wrap: wrap;
    overflow: scroll;
    margin: 0 auto;
    width:100%;
    scroll-behavior: smooth;
    align-content: center;
  }

  #list-items {
    margin-top: 12vh;
  }

  .marker-text {
    color: white;
    text-align: right;
    position: relative;
    right: 21vw;
    width: 20vw;
  }

  .marker-text p {
    margin-left: 42px;
    line-height:1.5em;
  }

  .is-pointer {
    cursor: pointer;
  }
  
  .bigimage {
    cursor: zoom-out;
  }

  .encartleft {
    position:left;
    float:left;
    top:0vw;
    left:0;
    width:20vw;
    height:auto;
  }
/*
  .card {
    height: 32vh;
    width: 47vw;
    min-height: 32vh;
    overflow:hidden;
    transition: all 0.3s ease-out;
  }
*/
  .card.is-horizontal {
    display: flex;
    height: 34vh;
    width: 47vw;
    transition: all 0.4s ease-out;
  }
  .card-image {
    display: flex;
    position: relative;
    flex-flow : column;
  }
  .card-image .image {
    display: flex;
    position: relative;
    border-right: 1px solid $turquoise;
    overflow: hidden;
    width: 20vw;
  }
  .card-image .image img {
    object-fit:cover;
    height: fill-available;
    height: moz-fill-available;
    height: webkit-fill-available;
  }

  .card.is-horizontal .card-image {
    height: auto;
  }
  .card.is-horizontal .card-stacked {
    flex-direction: column;
    flex: 1 1 auto;
    display: flex;
    position: relative;
  }

  .card.is-horizontal .card-stacked .card-content {
    flex-grow: 1;
  }

  .card.is-fullimage {
    background-color: transparent;
  }

  .card.is-fullimage .card-image {
    color: #fff !important;
  }

  .card.is-fullimage .card-image .card-stacked {
    position: absolute;
    bottom: 0;
    width: 100%;
    background: linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.65) 100%);
    text-shadow: 0px 0px 2px #000000;
  }

  .card.is-fullimage .card-image .card-stacked .card-footer {
    border-color: transparent;
  }

  .card.is-fullimage .card-image .card-stacked .title,
  .card.is-fullimage .card-image .card-stacked .subtitle {
    color: inherit;
  }
  .card.is-fullimage .card-image .card-stacked a {
    color: inherit;
  }
  .card.is-fullimage .card-image .card-stacked a:hover {
    text-decoration: underline;
  }

  .card-footer {
    max-height:2.5em;
  }

  a:hover {
    text-decoration:none!important;
  }

  .plie {
   text-overflow: ellipsis;
    content: "";
    background: -webkit-linear-gradient(#3a3a3a, #fff);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-top:-5rem;
  }

  #footer a:hover {
    color: black!important;
    text-decoration: none;
    filter: hue-rotate(45deg) saturate(10%);
  }
  
  .media-content a {
    padding-right: 10px;
  }

  :global(.card .card-stacked) {
    max-height:  -moz-available;
    max-height: -webkit-fill-available;
    max-height: fill-available;
  }

  .rouvre {
    height:2em;
    width:100%;
    line-height: 2em;
    padding:0 10px;
  }
  
  .sousrouvre-event {  
    color:white;
    font-weight: 700;
    text-align: center;
  }
  
  .picto {
    width:24px!important;
    height:24px!important;
  }

  .content::not(.rouvre) {
    padding-left:1em;
    padding-right:1em;
    padding-bottom:1em;
  }

  :global(.maxcontent h1, .maxcontent h2, .maxcontent h3, .maxcontent h4) {
    font-size: unset!important;
  }

  .tags-events {
    display:inline-block;
    font-size:14px;
  }

  .padd {
    padding:5px 1.5rem!important;
    max-height: 0;    
  }

  .boutoninfo {
    position: absolute;
    top: 1rem;
    left: -4rem;
    color:white;
  }

  .list-item {
    font-size: 1.2em;
    line-height: 1.5em;
    margin-bottom: 25px;
  }

  .glowing {
    outline: none;
    border: 8px solid #FFC857!important;
  }

  img {
    width: 100%;
  }

  .head {
    margin: 0 auto;
  }


* {
	--delay: 500ms;
	--duration: 800ms;
	--iterations: 1;
}

.reveal-text,
.reveal-text::after {
	-webkit-animation-delay: var(--animation-delay, 2s);
	        animation-delay: var(--animation-delay, 2s);
	-webkit-animation-iteration-count: var(--iterations, 1);
	        animation-iteration-count: var(--iterations, 1);
	-webkit-animation-duration: var(--duration, 800ms);
	        animation-duration: var(--duration, 800ms);
	-webkit-animation-fill-mode: both;
	        animation-fill-mode: both;
	-webkit-animation-timing-function: cubic-bezier(0.0, 0.0, 0.2, 1);
	        animation-timing-function: cubic-bezier(0.0, 0.0, 0.2, 1);
}

.reveal-text {
	--animation-delay: var(--delay, 0);
	--animation-duration: var(--duration, 800ms);
	--animation-iterations: var(--iterations, 1);
	position: relative;
	font-size: 3em;
	-webkit-animation-name: clip-text;
	        animation-name: clip-text;
	color: white;
  padding: 0.5em 0.7em;
	white-space: nowrap;
  font-weight:800;
	cursor: default;
  border: 4px solid white;
  text-align: center;
  width:100%;
}

.reveal-text::after {
		content: "";
		position: absolute;
		z-index: 999;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: $green;
		-webkit-transform: scaleX(0);
		        transform: scaleX(0);
		-webkit-transform-origin: 0 50%;
		        transform-origin: 0 50%;  
		pointer-events: none;
		-webkit-animation-name: text-revealer;
		        animation-name: text-revealer;
	}


@-webkit-keyframes clip-text {
	from {
		-webkit-clip-path: inset(0 100% 0 0);
		        clip-path: inset(0 100% 0 0);
	}
	to {
		-webkit-clip-path: inset(0 0 0 0);
		        clip-path: inset(0 0 0 0);
	}
}


@keyframes clip-text {
	from {
		-webkit-clip-path: inset(0 100% 0 0);
		        clip-path: inset(0 100% 0 0);
	}
	to {
		-webkit-clip-path: inset(0 0 0 0);
		        clip-path: inset(0 0 0 0);
	}
}


@-webkit-keyframes text-revealer {
	
	0%, 50% {
		-webkit-transform-origin: 0 50%;
		        transform-origin: 0 50%;
	}
	
	60%, 100% {
		-webkit-transform-origin: 100% 50%;
		        transform-origin: 100% 50%;		
	}

	
	60% {
		-webkit-transform: scaleX(1);
		        transform: scaleX(1);
	}
	
	100% {
		-webkit-transform: scaleX(0);
		        transform: scaleX(0);
	}
}


@keyframes text-revealer {
	
	0%, 50% {
		-webkit-transform-origin: 0 50%;
		        transform-origin: 0 50%;
	}
	
	60%, 100% {
		-webkit-transform-origin: 100% 50%;
		        transform-origin: 100% 50%;		
	}

	
	60% {
		-webkit-transform: scaleX(1);
		        transform: scaleX(1);
	}
	
	100% {
		-webkit-transform: scaleX(0);
		        transform: scaleX(0);
	}
}
::-webkit-scrollbar {
    all:initial!important;
     width: 4em;
}

@media screen and (max-width: 1024px) {
  
  .reveal-text {
    font-size:2em;
  }

  .card.is-horizontal {
    display: flex;
    width:63vw;
    height:55vw;
  }

  .timeline {
    padding-right:14px;
    align-content:flex-end;
    padding-bottom:16vh!important;
  }
  .timeline .timeline-item::before {
    left:0.7rem;
  }
  .list-item {
    font-size:1em;
  }
  
  .timeline .timeline-item .timeline-marker {
    left: 0.7rem;
    top: 5rem;
    width:24px!important;
    height:24px!important;
  }

  .marker-text {
    right:22vw;
    width:22vw;
    top:4vh;
  }

  .rouvre {
    margin:0;
  }

  .sousrouvre-event {
    padding: 2px;
    line-height: 15px;
    font-size:9px!important;
  }
  .media-content {
    line-height:1em;
    margin-top:-1em;
  }
  .tags-events {
    font-size:10px;
  }
  .subtitle {
    display:none;
  }
  .title {
    font-size:10px;
  }
  .card-footer * {
    font-size: 10px!important;
  }
  
}


@media screen and (min-width: 768px) and (max-width: 1650px) {
  
  .sousrouvre-event {
    font-size:12px!important;
  }
  .is-only-desktop {
    display:none;
  }
  .rouvre {
    padding:0px;
    line-height:1.5em
  }

  .modalfooter { 
    flex-direction: column;
    max-height: unset;
    line-height:0.5em;
  }
  .is-6-max {
    font-size:14px!important;
  }

}

</style>
