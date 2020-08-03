<script>

  import { activeListItem, activeMapItem, selectedItem, mobileViewport } from './stores.js';
  import AutoComplete from "./subcomp/Autocomplete.svelte";  
  import { createEventDispatcher, onMount, onDestroy } from 'svelte';
  import { getItems, getEventsItems } from './utils/consts';  
  import {Datepicker} from 'svelma-pro'
  import { fly } from 'svelte/transition';

  export let toggle = "commerces";
  export let A = [];
  export let toggleMenu = false;

  let items;
  const dispatch = createEventDispatcher();
  let modalOn = false;
  let pickerResult;
  let filtreDateIsOn = false;

  let placeholder = {"commerces" : "Quel commerce ", "events" : "Quel événement ", "liberales" : "Quelle profession ", "associations" : "Quelle association "  };

  $: toggle == 'events' ? items = getEventsItems(A) : items = getItems(A, toggle);

  onMount(async () => {
      if (!items)
        items = getItems(A, toggle);
  });

  // DATA SWITCH /////////////////////////////////////////////////////////////
	function switchData(text, mode) {
    if (text == 'update' && !$selectedItem) return
    toggleMenu = false;
    if (text == 'switch' && $selectedItem) 
      {$selectedItem = false; filtreDateIsOn = false;}

    dispatch('message', {
      text: text,
      mode: mode || 'undefined'
    });
  }

  function reset() {
     $selectedItem = false;
     switchData('reset');
  }

  function handleFiltreDate (e) {
    filtreDateIsOn = true;
    switchData('filtredate', {start : e.detail.time[0].start, end : e.detail.time[1].end});
  }

  function resetFiltreDate () {
    filtreDateIsOn = false;
    switchData('reset');
  }

</script>

{#if $mobileViewport.matches}

  <div class="is-size-7-touch">
    <AutoComplete 
      items={items}
      inputSize={"25px"}
      placeholder =  {'?'}
      className={"has-background-primary"}
      labelFieldName="name"
      bind:selectedItem={$selectedItem}
      onChange={() => switchData('update')} 
    />

    {#if $selectedItem.id}
          <span class="icon is-large iconreset-mobile has-text-warning" on:click={reset}>
            <i class="fas fa-times-circle"></i>
          </span>
          
    {/if}
  </div>

{/if}

<nav class="navbar is-primary" role="navigation" aria-label="main navigation">
  <div class="navbar-menu" class:is-active={toggleMenu} >
      <div class="navbar-start">
          
          <button class="button navbar-item is-size-6 is-warning is-outlined menuitem-mobile" style={$mobileViewport ? "" : "margin-left:15px" }
            on:click={() => switchData('switch', 'commerces')} disabled={toggle=='commerces'} >Commerces</button>
          <hr class="navbar-divider">
          <button class="button navbar-item is-size-6 is-warning is-outlined menuitem-mobile" 
            on:click={() => switchData('switch', 'associations')} disabled={toggle=='associations'} >Associations</button>
          <hr class="navbar-divider">
          <button class="button navbar-item is-size-6 is-warning is-outlined menuitem-mobile" 
            on:click={() => switchData('switch', 'liberales')} disabled={toggle=='liberales'} >Prof. libérales</button>
          <hr class="navbar-divider">  
          <button class="button navbar-item is-size-6 is-warning is-outlined menuitem-mobile" disabled={toggle=='events'}
            on:click={() => switchData('switch', 'events')}>Evénements</button>
          <hr class="navbar-divider">  

        {#if !$mobileViewport.matches}
          <div class="navbar-item filtre is-size-7-touch autocomplete-mobile" class:maxwidth={$selectedItem.id}>
            <AutoComplete 
              items={items}
              placeholder =  {`${placeholder[toggle]}recherchez-vous ?`}
              className={"filtre"}
              labelFieldName="name"
              bind:selectedItem={$selectedItem}
              onChange={() => switchData('update')} 
            />

            {#if $selectedItem.id}
                  <span class="icon is-large" on:click={reset}>
                    <i class="fas fa-times-circle"></i>
                  </span>
                  
            {/if}
        </div>
        {/if}

        <div class="navbar-item datemax">
        {#if toggle=="events"}
          
            <Datepicker bind:pickerResult pickerRule="rangeChoice" i18n="EN" inputClass={"datemax-content"} placeholder={"Filtrer par date"}
            on:dateChecked={(e) => handleFiltreDate(e)} />
          

          {#if filtreDateIsOn}
                <span class="icon is-large"on:click={resetFiltreDate}>
                  <i class="fas fa-times-circle"></i>
                </span>
          {/if}
        {/if}
        </div>
      </div>


      <div class="navbar-end">
        <div class="navbar-item fitcontent">
          <button id="boutoncontact" class="button is-outlined is-warning navbar-item is-size-6" style="margin-right:20px;"
            on:click={() => switchData('form')}>Nous contacter</button>
        </div>

        <div class="navbar-item logo is-hidden-mobile"><img src="./logomin.svg" alt="taverneasy" width="auto" height="38px"></div>
      </div>
</div>
  <div class="navbar-brand">
      

    <button role="button" class="navbar-burger burger" class:is-active={toggleMenu} on:click={() => toggleMenu = !toggleMenu} 
    aria-label="menu" aria-expanded="false" data-target="navbarBasicExample">
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
    </button>
    
  </div>

</nav>

<style lang="scss">

.logo {
  width:100%;
  height:64px;
  margin:auto;
  max-width:150px;
  margin-left:-20px;
}

.navbar {
  align-items: center;
  box-shadow: 0px 7px 2px 0px rgba(0, 0, 0, 0.15);
  max-height: 64px;
  margin-left: -1px;
}

.navbar-start {
  align-items: center;
  padding-left:10px;
}

:global(.datemax-content) {
  background-color:transparent;
  color:white;
  height:48px!important;
}

.button {
  margin-right:8px;
  height:48px;
  padding:0 20px;
}

.selmax {
  background-color: rgba(0, 0, 0, 0)!important;
  color:white;
}

.datemax {
  margin-bottom:4px;
  width:265px;
  height:48px;
}

.filtre p {
  color: white;
  margin-top: 8px;
  font-weight: 600;
}

.filtre .fas {
  font-size: 18px;
  cursor:pointer;
}

:global(.navbar-item .control .icon) {
  top:5px;
}

:global(::placeholder) {
  color:#555!important;
  bottom: -38%;
}

select {
  border : none;
}

select option {
  color:black;
}

@media screen and (min-width: 1024px) {

  .navbar {
    position:fixed!important;
    min-width:100vmax;
    margin-top:10px;
  }
}

@media screen and (max-width: 1024px) {
  .iconreset-mobile {
    position: fixed;
    top: 111px;
    right: 22px;
    z-index: 1;
    transform: scale(2.5);
  }
  .navbar {
    height:0px;
    min-height:0px;
  }
  .navbar-divider {
    display: block;
  }
  .navbar-brand {
    align-items: center;
  }
  .navbar-burger {
    background-color: $yellow;
    margin-right:6px;
    opacity:0.7;
    width:40px;
    height:40px;
  }

  .navbar-brand > .is-active {
    left: -38%!important;
    bottom: 3vh!important;
    opacity: 1!important;
  }

  .navbar .button {
    margin-left: auto;
    margin-right: auto;
    height:40px;
  }
  .navbar-menu.is-active {
    animation: navAnim .2s ease-in-out;
  }
  .navbar-start {
    padding-left:0px;
  }
  
  .filtre {
      top: 0;
      left:0;    
  }

  .filtre .icon {
    position: absolute;
    top: 5px;
    right: -15%;
  }

  .filtre .fas, .datemax .fas {
    font-size: 24px;
  }

  .maxwidth {
    max-width: 25vw;
  }

  .logo {
    margin-left: initial;
   }

  .is-active {
    border:none;
  }
  .menuitem-mobile {
    border: none;
    font-weight:100;
    font-size:larger;
    color:white;
    text-transform: uppercase;
  }

  .fitcontent {
    width:100%;
    display:flex;
    justify-content:center;
  }

  .navbar-end {
    display:flex;
    justify-content: flex-end;
  }

  .navbar-end .icon {
    position: absolute;
    top: 7vh;
    left: 2vw;
  }

  .datemax {
    margin-left: initial;
    width: 100%;
  }
  .navbar-menu {
    background: $yellow;
  }
  #boutoncontact {
    margin-right:unset!important;
    margin:auto!important;
  }
  :global(.datemax input) {
    height:40px;
    max-height:40px;
    text-align: center!important;
  }
  :global(.navbar-item .control .icon) {
    top:2px;
  }

  @keyframes navAnim {
    0% {
      display: none;
      opacity: 0;
      height: 0;
    }
    1% {
      display: block;
      opacity: 0;
    }
    100% {
      opacity: 1;
      height: 396px;
    }
  }
}


</style>