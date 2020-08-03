<script>
    import {sendMail } from './utils/consts.js';
    import { createEventDispatcher } from 'svelte'

    let formFields = { nom: "", email : "", sujet: "", message: ""};
    let inputError = false; let computing;
    const dispatch = createEventDispatcher();
    export let fireForm;

	function fireSnack(props) {
        
        if (!props) return
        dispatch('fireSnack', {
        props: props,
        });
    }

    function handleFormEmail () {
    if (!formFields.email || !formFields.email.match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/))
        inputError = true;
    else inputError = false;
    } 

    function handleFormSubmit () {
    computing = true;
    sendMail(formFields)
        .then((e) => {
            e.status == 'mail_sent' ? 
            fireSnack({ type: 'is-light', position: 'is-top' }) 
            : fireSnack({ message: "Oups! Une erreur s'est produite", type: 'is-danger', actionText: 'Recommencer', position: 'is-top' });
            fireForm = false; computing = false;
        });	
	}
    
</script>

<div class="container content box">

    <h1 class="title">Une info à communiquer, une question ?<br> C'est par ici.</h1>
    <p class="subtitle">Si vous êtes un professionnel et que vous souhaitez préciser une information, laissez-nous vos coordonnées ici et nous reviendrons vers vous au plus vite.</p>

    <form method="post" action="#">
        <div class="field">
            <p class="control has-icons-left">
                <input type="text" name="name" id="nom" class="input" bind:value={formFields.nom} placeholder="Votre nom">
                <span class="icon is-left">
                    <i class="fas fa-user"></i>
                </span>
            </p>
        </div>

        <div class="field">
            <p class="control has-icons-left">
                <input class="input" id="email" type="email" placeholder="Votre e-mail" bind:value={formFields.email} on:blur|preventDefault={()=>handleFormEmail()}>
                <span class="icon is-left">
                <i class="fas fa-envelope"></i>
                </span>
                {#if inputError}<span class="help is-danger">Attention! Votre e-mail est invalide</span>{/if}
            </p>
        </div>

        <div class="field">
            <div class="control">
                <div class="select">
                    <select name="reason" id="sujet" class="regular-text" bind:value={formFields.sujet}>
                        <option>Pourquoi nous contactez-vous ?</option>
                        <option value="positive">Une question</option>
                        <option value="negative">Un complément d'informations</option>
                        <option value="suggestion">Une suggestion, une remarque</option>
                    </select>
                </div>
            </div>
        </div>
        <div class="field">
            <label class="label" style="font-weight:200;">Votre message (moins de 250 caractères)</label>
            <p class="control">
                <textarea name="message" id="message" class="textarea" bind:value={formFields.message}></textarea>
            </p>
        </div>
        <div class="field">
            <button type="submit" class="button is-primary" class:is-loading={computing} disabled="{inputError}" on:click|preventDefault={handleFormSubmit}>Envoyer</button>
        </div>
    </form>
</div>

<style>	

.field input, .field textarea, .field select {
    border:1px solid #ccc;
}

</style>