<script>
  import { onMount, onDestroy } from 'svelte';
  import { fly } from 'svelte/transition';
  import { scale } from 'svelte/transition';
  import { getProp, dicoDay, allHorairesHtml, getDefaultCategory, dicoraireCouleurs } from './utils/consts.js';
  import  {dicoIcons} from './utils/categories.js'
  import { activeListItem, activeMapItem, selectedItem, mobileViewport } from './stores.js';
  import Collapse from './subcomp/Collapse.svelte'
  import Modal from './subcomp/Modal.svelte'
  import Footermax from './subcomp/Footermax.svelte'
  import Draggableframes from "./subcomp/Draggableframes.svelte";

  export let A = [];
  export let toggle = "commerces";

  let defaultCategory;
  let listRef;
  let readMore = [];
  let today; let tomorrow; let currentTime; let nextStatePlace;
  let telephone = false;
  let openHoraires=false;
  let firstTimeUpdate = true;
  let active = false; let currentIndex; let currentTitle; let bigify = false; let bigImageIndex;
  let displayPlus = false;
  
  const boutonText = {"associations" : "associations", "commerces" : "commerces", "liberales" : "Prof. libérales"};
  const dicoHorairesCouleur= {"Open now" : "#703688", "Closed now" : "#ff7518", "null" : "#e74c3c"}
  const dicoDayFr = {1 : 'Lundi', 2 : 'Mardi', 3 : 'Mercredi', 4 : 'Jeudi', 5 : 'Vendredi', 6 : 'Samedi', 7 : 'Dimanche'};

  let itemTop;

  onMount(async () => {
    today = new Date();
    currentTime = `${(today.getUTCHours()-(today.getTimezoneOffset()/60))%24}${today.getUTCMinutes()}`;
    today = today.getDay();
    today == 7 ? tomorrow = 1 : tomorrow = today +1;
    today = dicoDay[today];
    tomorrow = dicoDay[tomorrow];
    
    let observer = new IntersectionObserver((entries, observer) => { 
      entries.forEach(entry => {
        if(entry.isIntersecting){
          itemTop = entry.target.getAttribute("idplace");
          if (itemTop !== $activeMapItem)
            activeMapItem.set(itemTop);
        }
      });
    },{threshold: 0.5});

    document.querySelectorAll('.list-item').forEach(o => observer.observe(o));
  });

  function handleDefaultCategory (item) {
      defaultCategory = getDefaultCategory(item);
      return dicoIcons[defaultCategory] ? dicoIcons[defaultCategory].icon : 'undefined.svg';
    };

  function handleHoraires (i) {
    readMore[i] ? readMore[i]=false : readMore[i]=true; 
    let e = document.querySelector(`[idx="${i}"]`);
    e.classList.toggle("plie");
  }

  //VIEW UPDATE /////////////////////////////////////////////////////////////////////////////
    
  function nextState (index) {
    
    let lesjours = `business_hours.rendered.days.`;
    if (getProp(A[index], 'business_hours.rendered.extra.current_label') == 'Closed now')
    {
      // ON CHECKE SI C'EST LE MIDI ET QUAND QUE CA ROUVRE :
      if (getProp(A[index], lesjours+dicoDay[today]+'.slots.0.time.1') < currentTime 
      && currentTime < getProp(A[index], lesjours+dicoDay[today]+'.slots.1.time.0')) {
          nextStatePlace =  getProp(A[index], lesjours+dicoDay[today]+'.slots.1.time.0').splice(2, 0, "H");
          return (`Ouvre à : ${nextStatePlace}`);
      }
      // SINON ON CHERCHE LE PROCHAIN JOUR/HEURE D'OUVERTURE :
      else
      {
        for (let i = 0; i <= 7; i++) {
          if (getProp(A[index], lesjours+dicoDay[i]+'.slots.0.time.length')) {
              nextStatePlace =  getProp(A[index], lesjours+dicoDay[i]+'.slots.0.time.0').splice(2, 0, "H");
              return (`Ouvre ${dicoDayFr[i]} à : ${nextStatePlace}`);
              break;
          }
        }
      } 
    }
    else if (getProp(A[index], 'business_hours.rendered.extra.current_label') == 'Open now') 
      return nextStatePlace = 'Ouvert'
    else return `Horaires indisponibles`
  }

// Update list position si active list item updatée via map
  const unsubscribeActiveListItem = activeListItem.subscribe(

    newActiveListItem => {
      if (listRef) {
        if ($mobileViewport.matches)
          listRef.scrollLeft = document.getElementById(`list-item-${newActiveListItem}`).offsetLeft;
        else
            listRef.scrollTop = document.getElementById(`list-item-${newActiveListItem}`).offsetTop - 150;
      }
    }
  );

  function handleBigify (e) {
    bigImageIndex = e;
    bigify = true;
  }

  function openModal (idx) {
    currentIndex = idx;
    currentTitle = A[idx].title.raw;
    active = true;
  }


  // Supr store/obsevable
  onDestroy(async () => unsubscribeActiveListItem);

</script>

<!--  BIG MODAL -->

{#if active}
	<Modal on:close="{() => active = false}" title={currentTitle} closeText={"Revenir à la liste"} width="40vw" bind:active>
  
    {#if !bigify}
      {#if A[currentIndex].images.length == 1}
        <div class="image-seule" on:click={(e) => handleBigify(0)}>
          <img src="{A[currentIndex].images[0].src}" alt="{currentTitle}">
        </div>
      {:else}
        <Draggableframes  images={A[currentIndex].images.map((e) => e.src || "./pingouins.jpg" )} 
          video={getProp(A[currentIndex], 'video')} 
          on:bigify={(e) => handleBigify(e.detail.idx)}
        />
      {/if}
      <div class="is-block">
        <article class="panel is-primary nolinks is-size-4 encart is-size-7-mobile">
          <p class="panel-heading has-text-centered">
            En un clic
          </p>
          <a href="mailto:{A[currentIndex].email}" class="panel-block" aria-hidden="true">
            <span class="panel-icon">
              <i class="fas fa-envelope-square circleicon" aria-hidden="true"></i>
            </span>
            e-mail
          </a>
          <a href="tel:{A[currentIndex].phone}" class="panel-block">
            <span class="panel-icon">
              <i class="fas fa-phone circleicon" aria-hidden="true"></i>
            </span>
            {A[currentIndex].phone}
          </a>
          <a class="panel-block" href={A[currentIndex].website}> 
            <span class="panel-icon">
              <i class="fas fa-book circleicon" aria-hidden="true"></i>
            </span>
            Site Web
          </a>
          <a class="panel-block" href={A[currentIndex].facebook}>
            <span class="panel-icon">
              <i class="fab fa-facebook-f circleicon" aria-hidden="true"></i>
            </span>
            Page Facebook
          </a>
        </article>
          <div class="pingouin is-size-6-touch">
            {@html A[currentIndex].specialdescription || A[currentIndex].content.rendered}
          </div>
          {#if allHorairesHtml(A[currentIndex], "is-fullwidth") != "undefined" && toggle!="associations"}
            <div class="modalhoraires is-size-6-mobile" style="float:left">
              <h2 class="title is-2" style="margin-top:15px;">Les horaires</h2>
              {@html allHorairesHtml(A[currentIndex], "is-fullwidth")}
            </div>
          {/if}
      </div>
    
    {:else if bigify}
    <div class="bigimage" transition:scale><img src = {A[currentIndex].images[bigImageIndex].src} height="100%" width="auto" alt="" on:click={() => bigify = false}></div>
    {/if}

    <span slot="footer" class="card-footer">
        <p class="card-footer-item is-size-6 has-background-primary has-text-white">
          <i class="fas fa-calendar-alt"></i>&nbsp; &nbsp; {A[currentIndex].street}</p>
        {#if toggle!="associations"}
        <p class="card-footer-item is-size-6 has-background-info has-text-white is-hidden-mobile">
          <i class="fas fa-clock"></i>&nbsp; &nbsp; {dicoraireCouleurs[getProp(A[currentIndex],'business_hours.rendered.extra.current_label')].fr}</p>
        {/if}
    </span>

	</Modal>
{/if}

<!-- FIN BIG MODAL -->

<div id="list-items" bind:this="{listRef}">
  <div class="head is-hidden-mobile">
    <h1 class="reveal-text">{boutonText[toggle].charAt(0).toUpperCase() + boutonText[toggle].slice(1).toUpperCase()}</h1>
    <div style="margin:30px 0px;"></div>
  </div>
{#await A then B}
{#each B as listItem, index}

<div class="list-item" id="list-item-{index}" categorie={listItem.default_category} idplace={index}>
    <div class="card" class:glowing={index == $activeListItem}>
			<div class="card-image">
				<figure class="image maximagecard" on:click={() => openModal(index)}>
					<img src="{listItem.featured_image.src || 'pingouins.jpg'}" alt="Placeholder image">
				</figure>
			</div>
			<div class="card-content">
				<div class="media">
					<div class="media-left">
						<figure class="image picto">

                  <img src={`./svg/cat/${handleDefaultCategory(listItem)}`} alt="Placeholder image">  

						</figure>
					</div>
					<div class="media-content">
						<p class="title is-4 is-6-max">{@html listItem.title.rendered}</p>
						<p class="subtitle is-6 is-8-max">{listItem.street}</p>
					</div>
				</div>
        {#if toggle!="associations"}
          <Collapse open={openHoraires} >
            <div class="sousrouvre is-size-4 is-size-6-mobile is-primary" slot="trigger">
              <div class="rouvre">
                <div 
                  on:mouseenter={() => displayPlus = true} on:mouseleave={() => displayPlus = false}
                  class="sousrouvre has-background-black-ter has-text-white is-size-4 is-size-6-mobile">
                  
                  {nextState(index)}
                  {#if displayPlus}
                    <span class="icon"><i class="fas fa-plus"></i></span>
                  {/if}
                </div>
              </div>
            </div>
            <div class="notification has-background-white">
              <div class="content horaireslist is-size-7-touch">
                {@html allHorairesHtml(listItem)}
              </div>
            </div>

          </Collapse>
        {/if}
      </div>

     <div class="content padd is-size-7-touch">
        {#if listItem.content.rendered.length > 250}            
            <p class="has-text-left puce deplie plie" idx="{index}">
            {@html listItem.specialdescription || listItem.content.rendered}</p>
            <p class="has-text-centered	spaceupdown">
              <button class="button is-primary is-hidden-mobile" 
              on:click={() => handleHoraires(index)}>
                {#if !readMore[index]}Lire la suite{:else}Réduire{/if}
              </button>
              <button class="button is-warning is-hidden-mobile" on:click={() => openModal(index)}>+ d'infos</button>
            </p>
        {:else} 
            {@html listItem.content.rendered}
            <p class="has-text-centered	spaceupdown">
            <button class="button is-warning is-hidden-mobile" on:click={() => openModal(index)}>+ d'infos</button>
            </p>
        {/if}
        <p style="margin:0.5em 0;text-align:center;">
        {#each listItem.post_category as tag}
          <span class="tag is-warning is-size-6 is-hidden-mobile has-text-centered">{tag.name}</span>&nbsp;
        {/each}
        </p>
    </div>
    <button class="button boutoninfo is-warning is-hidden-mobile" on:click={() => openModal(index)}>＋</button>
      <!-- Ferme à {listItem.business_hours.rendered.days[today].slots[1].time[1]} -->
        <footer class="card-footer" id="footer">
          <Footermax {index} {listItem} />
        </footer>
  </div>
</div>
{/each}
{/await}
</div>


<style lang="scss">

  .panel-heading {
    font-size: 1.1em;
    line-height: 1em;
    border-radius:0px;
  }
  .panel a {
    text-decoration:none;
  }

  :global(.bout) {
    border : 2px solid;
  }

  .panel a:visited {
    color:initial;
  }

  .grow {
    transform: scale(1.1);
  }

  .bigimage {
    cursor: zoom-out;
  }
  
  .image-seule {
    max-height:20vh;
    display:flex;
    margin-bottom:2em;
    cursor:pointer;
  }
  .image-seule img {
    width:100%;
    object-fit: cover;
  }

  .encart {
    position:relative;
    float: right;
    top: 0vw;
    right: 0;
    margin: auto;
    max-width: 25vw;  
    min-width: 14vw;
    margin-left:30px;
  }

  .encartleft {
    position:left;
    float:left;
    top:0vw;
    left:0;
    width:20vw;
    height:auto;
  }

  .notification {
    padding:0;
  }
  .horaireslist {
    margin-top:-10px;
    margin-bottom:-30px;
  }

  .maximagecard {
    max-height:270px;
    overflow:hidden;
    cursor:pointer;
  }

  .media {
    align-items: center;
  }
  .card-footer {
    max-height:2.5em;
  }

  .plie {
    max-height:200px;
    height:auto;
    overflow:hidden;
    text-overflow: ellipsis;
    content: "";
    background: -webkit-linear-gradient(#000, #fff);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    transition: all 0.5s ease-out;
  }

  .deplie {
    max-height:1080px;
    transition: all 0.5s ease-out;
  }

  #footer a:hover {
    text-decoration: none;
    mix-blend-mode: luminosity;
  }

  .rouvre {
    height:2em;
    width:100%;
    line-height: 2em;
    white-space: nowrap;
  }
  
  :global(.content > .jeanpierre) {
    font-size:15px;
  }

  :global(.sousrouvre) {  
    font-weight: 300;
    text-align: center;
    text-transform: uppercase;
  }
  
  .card {
    height: max-content;
    border: 1px solid darkgray;
    transition: all 0.4s ease-out;
    border:none;
    box-shadow: none;
  }

  .picto {
    width:36px!important;
    height:36px!important;
  }

  .content::not(.rouvre) {
    padding-left:1em;
    padding-right:1em;
    padding-bottom:1em;
  }

  .padd {
    padding:5px 1.5rem;
  }

  .boutoninfo {
    position: absolute;
    top: 1rem;
    right: 2rem;
    color:white;
  }


  :global(.content a, content a:visited, content a:active) {
    display : inline-block; 
    flex-direction: row;
    border-radius : 3px;
    padding : 0.3em 0.3em;
    margin-right: 0.3em;
    color : white;
    width : fit-content;
  }

  #list-items {
    display: flex;
    flex-wrap: wrap;
    overflow: scroll;
    justify-content: center;
    margin-top:10vh;
    scroll-behavior: smooth;
  }

  .list-item {
    font-size: 1.2em;
    line-height: 1.5em;
    width:  25vw;
    margin-bottom:25px;
    border-bottom:none!important;
  }

  .glowing {
    border: 2px solid #b5b5b5;
    outline: 8px solid #FFC857 !important
    //box-shadow: 0px 0px 28px 0px #3AB795;
  }

  img {
    width: 100%;
  }

  .head {
    margin: 30px 40px 0 40px;
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
  border-radius:0px;
	cursor: default;
  border: 4px solid white;
  min-width: 25vw;
  max-width: 50%;
  text-align: center;
}

.reveal-text::after {
		content: "";
		position: absolute;
		z-index: 999;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: $yellow;
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

	*::-webkit-scrollbar {
		width: 1em;
		height:auto;
	}

	/***scrollbar handle***/
	*::-webkit-scrollbar-thumb {
	background: $yellow;
	border-radius:2px;
  height: 6vh;
	}

	/***upper layer of the track***/
	*::-webkit-scrollbar-track-piece {
		background: transparent;
	}

	/***lower layer of the track***/
	*::-webkit-scrollbar-track {
		background: transparent;
	}

	/***square at the lower right corner***/
	*::-webkit-scrollbar-corner {
	background:transparent;
	}

  @media screen and (min-width: 768px) and (max-width: 1366px) {
    .reveal-text {
      font-size:2em;
    }
  }


  @media screen and (max-width: 768px) {

    .reveal-text {
      display:none;
    }

    #list-items {
      flex-flow: column wrap;
      overflow: scroll;
      overflow-y: hidden;
      -webkit-overflow-scrolling: touch;
      min-width: 100%;
    }

    .list-item {
      max-width: none;
      width: 80vw;
      font-size: 1em;
      margin: 0 15px;
      padding: 0;
      margin-top: 25vh;
      padding-bottom: 0;
    }

    .card {
      width: unset;
      margin-bottom: unset;
      height: unset;
      max-height: unset;
    }
    .card .media:not(:last-child) {
      margin-bottom:0.5em;
    }
    .padd {
      height:15vh;
    }
    .plie {
      max-height:100px!important;
    }
    .subtitle {
      height: 20px;
    }
    .horaireslist {
      margin-top:auto;
      margin-bottom:auto;
    }
    .maximagecard {
      max-height:120px;
    }
    .rouvre {
      line-height: 2em;
      margin:0;
    }

    .is-6-max {
      font-size:18px;
    }
    .is-8-max {
      font-size:14px;
    }
    :global(ul) {
      line-height: 1.7em;
    }
    .media * {
      overflow: hidden;
	  }
    :global(.modal-card) {
      min-width: 98vw;
    }
    .encart {
      max-width: 35vw;
    }
    .modalhoraires {
      display:flex;
      flex-flow: row wrap;  
    }
  }

  @media screen and (min-width: 768px) and (max-width: 1366px) {
    .list-item {
      width:50vw;
    }
  }

</style>
