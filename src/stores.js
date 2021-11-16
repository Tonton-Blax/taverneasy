import { writable } from 'svelte/store';

export const activeListItem = writable(0);
export const activeMapItem = writable(0);
export let selectedItem = writable({id:0, name:"",slug:"",type:"",index:0});
export let mobileViewport = writable({mob:0, touch:0});
export let isScrolling = writable(0);
export let pages = writable({
    commerces: {total : undefined, current :undefined},
    liberales: {total : undefined, current :undefined},
    places: {total : undefined, current :undefined},
    events: {total : undefined, current :undefined},
})