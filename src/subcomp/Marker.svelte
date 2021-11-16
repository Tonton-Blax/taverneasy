<script>
	import { getContext } from 'svelte';
	import { mapbox, key } from '../mapbox.js';
	import { onMount, createEventDispatcher } from 'svelte';
	import { isScrolling } from '../stores.js';

	const { getMap } = getContext(key);
	const mapMax = getMap();
	let markerdiv;
	let elPopup;

	export let lat;
	export let lon;
    export let currentStatus;
    export let title;
	export let horaires;
	export let svgmask;
	export let bgColor;
	export let titleColor;
	export let index;
	export let Alength;
	const dispatch = createEventDispatcher();

	onMount(async () => {

		const popup = new mapbox.Popup({ offset: 25 })
			.setDOMContent(elPopup);

		const marker = new mapbox.Marker(markerdiv)
			.setLngLat([lon, lat])
			.setPopup(popup)
			.addTo(mapMax);
	});

	function handleMarkerClick () {
		$isScrolling = true;
		dispatch('updateListPlease', {state:index});
	}

</script>

<div bind:this={markerdiv} 
	class="circle-background" 
	style="background-color:{bgColor}" 
	on:click={() => handleMarkerClick()} >

	<div class="picto" 
	style="-webkit-mask-box-image : url(./svg/cat/{svgmask});">	
	</div>

</div>

<div bind:this={elPopup} class="is-block has-text-centered is-centered popmax">
	<span>
		<h1 class="is-size-5 has-text-weight-semibold has-text-primary">
			{title}
		</h1>
		<p class="is-size-5 has-text-weight-bold has-text-warning {titleColor}">
			{currentStatus}
		</p> 
		{#if horaires !== "undefined"}
			{@html horaires}
		{/if}
	</span>
</div>

<style>
.popmax {
	max-width:20vw; 
	padding-top:8px;
}
.isbig {
	width:64px!important;
	height:64px!important;
	z-index:10;
	opacity:1;
}
.circle-background {
	border-radius: 50%;
	width: 32px;
	height: 32px;
	background-color : red;
	display:flex;
	justify-content: space-evenly;
	align-items: center;   
	cursor: pointer;
	box-shadow: none;
	transition :width 0.8s, height 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.undefined {
	background-color: white;
	-webkit-mask-image: url('../svg/university.svg');
	mask-image: url('../svg/university.svg');
	width: 24px;
	height: 24px;
	background-repeat: no-repeat;
}

.picto {
	background-color: white;
	width: 24px;
	height: 24px;
	background-repeat: no-repeat;
}

h1 {
	padding-left:2vw; 
	padding-right:2vw;
}
  
</style>