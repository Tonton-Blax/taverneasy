
<script>
import { onMount } from 'svelte';
export let activeDropDown = false;
export let title;
export let dropDownItems
</script>

<div class="dropdown" on:click={() => activeDropDown = !activeDropDown} class:is-active={activeDropDown}>
  <div class="dropdown-trigger">
    <button class="button" aria-haspopup="true" aria-controls="dropdown-menu3">
      <span>{title}</span>
      <span class="icon is-small">
        <i class="fas fa-angle-down" aria-hidden="true"></i>
      </span>
    </button>
  </div>
  <div class="dropdown-menu" id="dropdown-menu3" role="menu" >
    <div class="dropdown-content">

      {#each dropDownItems as item}
        <p class="dropdown-item">
            {item}
        </p>
      {/each}

    </div>
  </div>
</div>

<style>
.dropdown {
    top:20vh;
    left:-35vw;
}
</style>