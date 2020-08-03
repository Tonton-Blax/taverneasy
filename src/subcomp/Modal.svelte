 <svelte:window on:keydown={keydown} />
<script>
  import { scale } from 'svelte/transition';
  import { onDestroy, onMount } from 'svelte'
  import { createEventDispatcher } from 'svelte'
  const dispatch = createEventDispatcher()

  export let active = true
  export let title = 'Modal title' 
  export let animation = 'scale'
  export let animProps = { start: 1.2 }
  export let size = ''
  export let showClose = true 
  export let backdrop = true
  export let backdropClose = true
  export const subComponent = null
  export let onBody = true
  export let closeText = "Revenir aux événements";
  export let width = 'auto'
  export let height = ''

  let modal

  let pointEvent = backdrop ? 'unset' : 'none'

  $: {
    if (modal && active && onBody) {
      modal.parentNode.removeChild(modal)
      document.body.appendChild(modal)
    } else {
      modal = null
    }
  }
  onMount(() => {})

  function close() {
    modal = null
    active = false
    dispatch('closeEvent', '')
  }

  function keydown(e) {
    if (active && isEscKey(e)) {
      close()
    }
  }

  function isEscKey(e) {
	return e.keyCode && e.keyCode === 27
}

</script>

{#if active}
  <div class="modal {size} is-active" bind:this={modal} style="pointer-events: {pointEvent}">
    {#if backdrop}
      <div class="modal-background" on:click={e => { if (backdropClose) close() }} />
    {/if}
    <div class="modal-card" transition:scale style="width: {width};height: {height}">
      <header class="modal-card-head has-background-info has-text-weight-bold">
        <p class="modal-card-title has-text-white is-size-3 is-size-5-touch">{@html title.replace("**",'')}</p>
        {#if showClose}
          <button class="button is-warning" aria-label="close" on:click={close}>{closeText}</button>
        {/if}
      </header>
      <section class="modal-card-body has-text-black is-size-5">
        <slot />
      </section>
      <footer class="modal-footer">
        <slot name="footer" />
      </footer>
    </div>
  </div>
{/if}

<style lang="scss">
  .modal-footer {
    background-color: rgb(255, 255, 255);
    padding: 10px 20px;
    text-align: center;
  }
  
  .modal-card-head {
  flex-wrap: wrap;
  border-radius:0;
  }
  
  @media screen and (max-width: 768px) {
  
    header p {
      width: 80%;
      margin-bottom: 0.65em;
    }
    .card-footer {
      flex-direction: column;
      max-height: unset;
    }
  }

</style>