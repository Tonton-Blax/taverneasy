<script>
import { createEventDispatcher } from 'svelte';

export let images = [...Array(10).keys()];
export let video;

const dispatch = createEventDispatcher();


let slider;
let isDown = false;
let initPos;
let scrollLeft;
let active;
let isClicked;

let mDown = ( (e) => {
    isDown = true;
    active = true;
    initPos = e.pageX - slider.offsetLeft;
    scrollLeft = slider.scrollLeft;
});

let mLeave = () => {
    isDown = false;
    active=false;
};

let mUp = () => {
    isDown = false;
    active = false;
    isClicked = false;
};

let mMove = (e) => {
    if(!isDown) return;
    const x = e.pageX - slider.offsetLeft;
    const moveDelta = (x - initPos) * 3; //scroll-fast
    slider.scrollLeft = scrollLeft - moveDelta;
};

let mClick = (index) => {
   
    if (isDown) {
        isDown = false;
        return;
    }

    isClicked = true;
    isDown = false;
    bigify(index)

}

function bigify(idx) {
    if (idx < 0 || idx > 10) return
    dispatch('bigify', { idx: idx });
}

</script>

<div class="grid-container">
  <main class="grid-item main">
    <div class="items" bind:this={slider}
    on:mousedown={(e) => mDown(e)}
    on:mouseup={mUp}
    on:mouseleave={mLeave}
    on:mousemove|preventDefault={(e) => mMove(e)}
    class:active
    >
        {#if video}
          {@html video}
        {/if}
        {#each images as image, index}
        <div class="item item{index}"><img src={image} on:click={() => mClick(index)}> </div>
        {/each}

    </div>
  </main>
</div>

<style lang="scss">

:global(.items > iframe) {
  /*
    display:inline-block;
    max-height:20vh;
    max-width:22vw;
    min-width:  
    border-radius:1.4rem;
  */
    display: inline-flex;
    flex-direction: column;
    height: 20vh;
}

.grid-container {
  background: #fff;
  font-family: 'Rubik', sans-serif;
}

*::-webkit-scrollbar {
  display: none;
}
* {
    scrollbar-width: none;
}
@supports(display: grid) {

  .grid-container {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    grid-template-rows: auto 1fr auto;
    
    grid-template-areas:
      "main main main";
  }

  .grid-item {
    color: #fff;
    font-size: 1em;
    font-weight: 700;
  }

  img {
    height: 100%;
    width: auto;
    object-fit: cover;
    filter: drop-shadow(2px 4px 6px darkgrey);
  }

  main {
    grid-area: main;
    padding: 0;
    overflow-x: scroll;
    overflow-y: hidden;
  }

  .items {
    position: relative;
    width: 100%;
    overflow-x: scroll;
    overflow-y: hidden;
    white-space: nowrap;
    transition: all 0.2s;
    transform: scale(0.98);
    will-change: transform;
    user-select: none;
    cursor: pointer;
  }

  .items.active {
    cursor: grabbing;
    cursor: -webkit-grabbing;
    transform: scale(1);
  }

  .item {
    display: inline-block;
    height: 20vh;
    margin: 1em 0.5em;
  }
}

/*
@media screen and (max-width: 768px) {
  :global(.items > iframe) {

  }
}
*/


</style>