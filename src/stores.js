import { writable } from 'svelte/store';

export const activeListItem = writable(0);
export const activeMapItem = writable(0);
export let selectedItem = writable({id:0, name:"",slug:"",type:"",index:0});
export let isBigArray = writable(0);
export let mobileViewport = writable({mob:0, touch:0});
export let isScrolling = writable(0);