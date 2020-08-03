<script context="module">
  let current;
</script>

<script>

  export let listItem;
  export let index;
  let telephone = false;
  import { scale } from 'svelte/transition';

  /** Animation to use when opening/closing
   * @svelte-prop {String} animation=slide
   * @values Any animation that ships with Svelte
   * */
  
  function toggle(bool) {
    if (current && current !== index) return false;
      else current = index;
    return telephone;  
  }
  
</script>

  {#if listItem.facebook}
    <a href={listItem.facebook} target="_blank"
    class="card-footer-item is-size-4 has-background-info has-text-white">
    <i class="fab fa-facebook-f"></i></a>
  {/if}

  {#if listItem.phone}
    <a href="tel:{listItem.phone}" target="_blank"
    class="card-footer-item is-size-4 has-background-success has-text-white"
    on:mouseenter={()=>telephone=true} on:mouseleave={()=>telephone=false} class:telephone={telephone}>
    {#if !telephone}
    <i class="fas fa-phone"></i>
    {/if}
    {#if telephone}
    &nbsp;&nbsp;<span in:scale|local="{{delay:60}}" style="font-weight:800">{listItem.phone}</span>
    {/if}
    </a>
  {:else}
    <div class="card-footer-item is-size-5 has-background-info has-text-white">
    <i class="far fa-frown-open"></i>
    &nbsp;&nbsp;Aucune information de contact
    </div>
  {/if}

  {#if listItem.website || listItem.email}
    <a href={listItem.website || listItem.email} target="_blank"
    class="card-footer-item is-size-4 has-background-info has-text-white">
    <i class="fas fa-globe"></i></a>
  {/if}

<style>

    .telephone {
        flex-grow:3;
        transition: all 0.5s ease-out;
        mix-blend-mode: normal;
        color:white;
    }

    a {
        text-decoration: none;
    }

</style>