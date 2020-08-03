<svelte:head>
	<link href="https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@300;400;700&display=swap" rel="stylesheet">
	<link href='https://api.mapbox.com/mapbox-gl-js/v1.10.0/mapbox-gl.css' rel='stylesheet' />
	<!-- <link rel="stylesheet" href="https://unpkg.com/bulmaswatch/lux/bulmaswatch.min.css"> -->
	
</svelte:head>

<script>
import { selectedItem, isBigArray } from './stores.js';
import List from './List.svelte';
import Map from './Map.svelte';
import Events2 from './Events2.svelte';
import Navigation from './Navigation.svelte';
import Modal from './subcomp/Modal.svelte'
import Formidable from './Formidable.svelte'
import { onMount } from 'svelte';
import {getPlaces, makeCategories, getWeather } from './utils/consts.js';
import axios from 'axios'
import { Snackbar } from 'svelma-pro'
import { fly,fade } from 'svelte/transition';
import { mobileViewport } from './stores.js';

export let name = "tavernasso"

let A; let ABackup; // <-- A : Données principales, 95% data des différents lieux
let ready = false;
let toggle = "events";
let reset=false;
let filtrage=false;
let fireForm = false;
let isFocused = false;
let toggleMenu = false;
let mapContainer;
let weather = []

	onMount(async () => {	
		localStorage.clear();
		
		//makeCategories("events").then((e) => console.log(e));
		$mobileViewport = window.matchMedia("(max-width: 768px)"); 
		weather = await getWeather();
		getPlaces("events")
			.then((p) => { 
				A = ABackup = p;
				console.log(p);
				if (toggle=="events") A = A.sort((a, b) => Date.parse(a.start_date.raw) - Date.parse(b.start_date.raw));
				isBigArray.set(Array(p.length).fill(false));
				ready=true;
		});
	});

	function handleSwitch (e) {

		reset=false;

		if (e.detail.text == 'update') {	
			ready = false;
			A = [...ABackup];

			if ($selectedItem && $selectedItem.type == 'category')
				A = A.filter(item => item.default_category == $selectedItem.id)
			else if ($selectedItem && $selectedItem.type == 'place')
				A = A.filter(item => item.id == $selectedItem.id)
			ready=true;
		}

		else if(e.detail.text == 'filtredate') {	
			ready = false;
			let  dates = e.detail.mode;
			A = [...ABackup];
			A = A.filter(item => Date.parse(item.start_date.raw) >= Date.parse(dates.start) && Date.parse(item.start_date.raw) <= Date.parse(dates.end));
			ready=true;
		}

		else if (e.detail.text == 'form') {	
			fireForm=true;
		}
		else if (e.detail.text == 'reset') {
			A = [...ABackup];
			$selectedItem = false;
		}

		else {
			ready=false;
			reset=true;
			toggle = e.detail.mode;

			getPlaces(toggle).then((p) => {
				A = p;
				if (toggle=="events") A = A.sort((a, b) => Date.parse(a.start_date.raw) - Date.parse(b.start_date.raw));
				ABackup = A;
				//console.log(A);
				$isBigArray = [];
				ready = true;
			});
		}
	}

	function fireSnack(props) {
		Snackbar.create({ message: 'Votre message a bien été envoyé', ...props })
	}

</script>

	{#if !ready}

		<div class="spincontainer" out:fly="{{ y:2000, duration: 1200 }}">
			<div class="loadermax"></div>
			<div class = "break"></div>
			<h1 class="is-size-3 is-size-5-touch has-text-white prout">Récupération des données</h1>
		</div>
	{:else}
	<div class="container">

		{#if fireForm}
			<Modal on:close="{() => fireForm = false}" closeText = "Annuler et revenir" title="Faisons connaissance" width="40vw" bind:active={fireForm}>
				<Formidable on:fireSnack={() => fireSnack(e => e.detail.props)} bind:fireForm />
			</Modal>
		{/if}	
		
		<Navigation bind:A bind:toggle bind:toggleMenu on:message={(e)=>handleSwitch(e)} />

		<div class="columns" on:click|passive={()=>toggleMenu=false}>
			{#if toggle != "events"}
				<div class="paneman leftman" on:click={()=>isFocused=true}>
					<List {A} bind:toggle />
				</div>
				<div class="paneman rightman" on:click={()=>isFocused=false}>
					<Map bind:A bind:reset {toggle} />
				</div>
			{:else}
				<div class="paneman bigleft" on:click={()=>isFocused=true}>
					<Events2 bind:A bind:reset {mapContainer} {weather} />
				</div>
				<div class="paneman smallright" on:click={()=>isFocused=false} bind:this={mapContainer}>
					<Map bind:A bind:reset {toggle} />
				</div>
			{/if}
		</div>
	</div>
	{/if}


<style lang="scss" global>

/*	
	:global(:root) {
		--grey: #7f888f;
		--grey-light: #a8b4bd;
		--grey-lighter: #bfcdd8;
		--green: #4bbf73;
		--yellow: yellow;
		--blue: #1f9bcf;
		--red: #d9534f;
		--primary: #3a3a3a;
		--link: var(--grey);
		--sucess: var(--green);
		--info: var(--blue);
		--danger: var(--red);
	}

*/
	.container {
		max-width: unset!important;
	}

	@import "./style/global.sass";
	
	:global(:root) {
		--font-stack:'Oxygen', sans-serif
	}
	
	@import url('https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@300;400;700&display=swap');

	:global(.spaceupdown) {
		margin : 1em 0;
	}
	
	:global(body) {
		background-color: #3A3A3A;
	}

	.break {
		flex-basis: 100%;
		height: 0;
	}

	html::-webkit-scrollbar {
		display: none!important;
	}

	html {
		-ms-overflow-style: none;
		border-left: solid 1px darkgray;
		border-right: solid 1px darkgray;
	}

	.prout {
		margin-top:-30vh;
	}

	.loadermax {
		color: white;
		font-size: 36px;
		margin: 100px auto 0px auto;
		width: 1em;
		height: 1em;
		border-radius: 50%;
		position: relative;
		text-indent: -9999em;
		-webkit-animation: load4 1.3s infinite linear;
		animation: load4 1.3s infinite linear;
		-webkit-transform: translateZ(0);
		-ms-transform: translateZ(0);
		transform: translateZ(0);
	}

	.spincontainer {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-wrap: wrap;
		background-color: $info;
		min-height:100vh;
		z-index:2!important;
		width:100%;
	}

	.paneman {
		display: flex;
		flex-direction: column;
		max-height: 102vh;
		min-height:max-content;
		resize: none;
  		overflow: auto;
		background: #3a3a3a;
		z-index: 3;
	}

	.leftman {
		align-items: center;
		width: 33%;
		justify-content: center;
		min-height:90vh;
	}
	.bigleft {
		width:fill-available;
		width:-webkit-fill-available;
		width:-moz-fill-available;
		align-items: center;
		margin-left:-7em;
	}

	.rightman {
		justify-content: space-between;
		width: 67%;
		position: absolute;
		left: 33%;
		top:7vh;
	}
	.smallright {
		justify-content: space-between;
		width: 20%;
		position: fixed;
		right:0vw;
		max-height:95vh;
		align-self: center;
    	margin-top: 8vh;
		display:flex;
	}

	:global(.puce ul) {
		list-style: inside;
	}

	:global(.tag) {
		border-radius : 2em!important;
		border: 2px solid;
	}
	:global(.tag:not(body).is-warning) {
		background-color: transparent;
	}


	@-webkit-keyframes load4 {
	0%,
	100% {
		box-shadow: 0 -3em 0 0.2em, 2em -2em 0 0em, 3em 0 0 -1em, 2em 2em 0 -1em, 0 3em 0 -1em, -2em 2em 0 -1em, -3em 0 0 -1em, -2em -2em 0 0;
	}
	12.5% {
		box-shadow: 0 -3em 0 0, 2em -2em 0 0.2em, 3em 0 0 0, 2em 2em 0 -1em, 0 3em 0 -1em, -2em 2em 0 -1em, -3em 0 0 -1em, -2em -2em 0 -1em;
	}
	25% {
		box-shadow: 0 -3em 0 -0.5em, 2em -2em 0 0, 3em 0 0 0.2em, 2em 2em 0 0, 0 3em 0 -1em, -2em 2em 0 -1em, -3em 0 0 -1em, -2em -2em 0 -1em;
	}
	37.5% {
		box-shadow: 0 -3em 0 -1em, 2em -2em 0 -1em, 3em 0em 0 0, 2em 2em 0 0.2em, 0 3em 0 0em, -2em 2em 0 -1em, -3em 0em 0 -1em, -2em -2em 0 -1em;
	}
	50% {
		box-shadow: 0 -3em 0 -1em, 2em -2em 0 -1em, 3em 0 0 -1em, 2em 2em 0 0em, 0 3em 0 0.2em, -2em 2em 0 0, -3em 0em 0 -1em, -2em -2em 0 -1em;
	}
	62.5% {
		box-shadow: 0 -3em 0 -1em, 2em -2em 0 -1em, 3em 0 0 -1em, 2em 2em 0 -1em, 0 3em 0 0, -2em 2em 0 0.2em, -3em 0 0 0, -2em -2em 0 -1em;
	}
	75% {
		box-shadow: 0em -3em 0 -1em, 2em -2em 0 -1em, 3em 0em 0 -1em, 2em 2em 0 -1em, 0 3em 0 -1em, -2em 2em 0 0, -3em 0em 0 0.2em, -2em -2em 0 0;
	}
	87.5% {
		box-shadow: 0em -3em 0 0, 2em -2em 0 -1em, 3em 0 0 -1em, 2em 2em 0 -1em, 0 3em 0 -1em, -2em 2em 0 0, -3em 0em 0 0, -2em -2em 0 0.2em;
	}
	}
	@keyframes load4 {
	0%,
	100% {
		box-shadow: 0 -3em 0 0.2em, 2em -2em 0 0em, 3em 0 0 -1em, 2em 2em 0 -1em, 0 3em 0 -1em, -2em 2em 0 -1em, -3em 0 0 -1em, -2em -2em 0 0;
	}
	12.5% {
		box-shadow: 0 -3em 0 0, 2em -2em 0 0.2em, 3em 0 0 0, 2em 2em 0 -1em, 0 3em 0 -1em, -2em 2em 0 -1em, -3em 0 0 -1em, -2em -2em 0 -1em;
	}
	25% {
		box-shadow: 0 -3em 0 -0.5em, 2em -2em 0 0, 3em 0 0 0.2em, 2em 2em 0 0, 0 3em 0 -1em, -2em 2em 0 -1em, -3em 0 0 -1em, -2em -2em 0 -1em;
	}
	37.5% {
		box-shadow: 0 -3em 0 -1em, 2em -2em 0 -1em, 3em 0em 0 0, 2em 2em 0 0.2em, 0 3em 0 0em, -2em 2em 0 -1em, -3em 0em 0 -1em, -2em -2em 0 -1em;
	}
	50% {
		box-shadow: 0 -3em 0 -1em, 2em -2em 0 -1em, 3em 0 0 -1em, 2em 2em 0 0em, 0 3em 0 0.2em, -2em 2em 0 0, -3em 0em 0 -1em, -2em -2em 0 -1em;
	}
	62.5% {
		box-shadow: 0 -3em 0 -1em, 2em -2em 0 -1em, 3em 0 0 -1em, 2em 2em 0 -1em, 0 3em 0 0, -2em 2em 0 0.2em, -3em 0 0 0, -2em -2em 0 -1em;
	}
	75% {
		box-shadow: 0em -3em 0 -1em, 2em -2em 0 -1em, 3em 0em 0 -1em, 2em 2em 0 -1em, 0 3em 0 -1em, -2em 2em 0 0, -3em 0em 0 0.2em, -2em -2em 0 0;
	}
	87.5% {
		box-shadow: 0em -3em 0 0, 2em -2em 0 -1em, 3em 0 0 -1em, 2em 2em 0 -1em, 0 3em 0 -1em, -2em 2em 0 0, -3em 0em 0 0, -2em -2em 0 0.2em;
	}
	}
	@media screen and (min-width: 768px) and (max-width: 1366px) {
		.leftman {
			width:40%;
			z-index:10;
		}
		.rightman {
			width:60%;
		}
		.card {
			min-width: 32vw;
		}
		.list-item {
			max-width:100%;
		}
		.reveal-text {
			left:12%;
		}
	}

	@media screen and (max-width: 768px) {
		
		body {
			overflow-y: hidden;
		}
		.leftman, .rightman {
			width:100%;
		}
		.rightman {
			justify-content: auto;
			left:0;
			top:0;
			height:fit-content;
		}
		.leftman {
			
		}
		.bigleft {
			margin-left:0em;
		}

		.paneman {
			display: flex;
			max-height: auto;
			min-height: auto;
			resize: none;
			overflow: auto;
			background: #3a3a3a;
			z-index: auto;
		}

		body {
			max-width:100vw;
		}
		
		.smallright {
			width: 100%;
			position: fixed;
			right: 0vw;
			max-height: 20vh;
			bottom: 0vh;
			border-top: 5px solid white;
		}
		.button .is-outlined[disabled] {
			color:white;
		}
		.navbar-burger {
	    	margin-right: 20px!important;
    		margin-top: 20px;
    		width: 50px;
    		height: 50px;
		}
		.navbar-menu {
			background: #222!important;
			border:0px;
			padding: unset;
		}
	}

</style>
