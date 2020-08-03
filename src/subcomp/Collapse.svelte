<script context="module">
  let current;
</script>

<script>

  import {slide} from 'svelte/transition'

  export let open = true
  let idx;

  
  function toggle() {
    if (current && current !== idx) open = false;
      else open = !open;
    current = idx;
  }
  
</script>

<div class="collapse">
  <div class="collapse-trigger bout" on:click={toggle}>
    <slot name="trigger" />
  </div>
  {#if open}
    <div class="collapse-content" transition:slide>
      <slot />
    </div>
  {/if}
</div>

<style>
.bout {
    cursor: pointer;
}
</style>