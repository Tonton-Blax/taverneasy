
<svelte:window on:click={onDocumentClick} />
<script>

  // the list of items  the user can select from
  import { onMount } from 'svelte'
  export let items;


  // field of each item that's used for the labels in the list
  export let labelFieldName = undefined;
  export let keywordsFieldName = labelFieldName;
  export let valueFieldName = undefined;

  export let labelFunction = function(item) {
    if (item === undefined || item === null) {
      return "";
    }
    return labelFieldName ? item[labelFieldName] : item;
  };

  export let keywordsFunction = function(item) {
    if (item === undefined || item === null) {
      return "";
    }
    return keywordsFieldName ? item[keywordsFieldName] : item;
  };

  export let valueFunction = function(item) {
    if (item === undefined || item === null) {
      return item;
    }
    return valueFieldName ? item[valueFieldName] : item;
  };

  export let keywordsCleanFunction = function(keywords) {
    return keywords;
  };

  export let textCleanFunction = function(userEnteredText) {
    return userEnteredText;
  };

  export let beforeChange = function(oldSelectedItem, newSelectedItem) {
    return true;
  };
  export let onChange = function(newSelectedItem) {};

  export let selectFirstIfEmpty = false;

  export let minCharactersToSearch = 1;
  export let maxItemsToShowInList = 0;
  export let noResultsText = "No results found";

  let _placeholder;
  let resize=false;


  onMount(async () => { 
    _placeholder = `${placeholder}`;
  });

  function safeStringFunction(theFunction, argument) {
    if (typeof theFunction !== "function") {
      console.error(
        "Not a function: " + theFunction + ", argument: " + argument
      );
    }
    let originalResult;
    try {
      originalResult = theFunction(argument);
    } catch (error) {
      console.warn(
        "Error executing Autocomplete function on value: " +
          argument +
          " function: " +
          theFunction
      );
    }
    let result = originalResult;
    if (result === undefined || result === null) {
      result = "";
    }
    if (typeof result !== "string") {
      result = result.toString();
    }
    return result;
  }

  function safeLabelFunction(item) {
    // console.log("labelFunction: " + labelFunction);
    // console.log("safeLabelFunction, item: " + item);
    return safeStringFunction(labelFunction, item);
  }

  function safeKeywordsFunction(item) {
    // console.log("safeKeywordsFunction");
    const keywords = safeStringFunction(keywordsFunction, item);
    let result = safeStringFunction(keywordsCleanFunction, keywords);
    result = result.toLowerCase().trim();
    if (debug) {
      console.log(
        "Extracted keywords: '" +
          result +
          "' from item: " +
          JSON.stringify(item)
      );
    }
    return result;
  }

  // the text displayed when no option is selected
  export let placeholder = undefined;
  // apply a className to the control
  export let className = undefined;
  // generate an HTML input with this name, containing the current value
  export let name = undefined;
  // adds the disabled tag to the HTML input
  export let disabled = false;
  // add the title to the HTML input
  export let title = undefined;
  export let debug = false;

  // selected item state
  export let selectedItem = undefined;
  export let value = undefined;
  let text;
  let filteredTextLength = 0;

  function onSelectedItemChanged() {
    value = valueFunction(selectedItem);
    text = safeLabelFunction(selectedItem);
    onChange(selectedItem);
  }

  $: selectedItem, onSelectedItemChanged();

  // HTML elements
  let input;
  let list;

  // UI state
  let opened = false;
  let highlightIndex = -1;

  // view model
  let filteredListItems;

  let listItems = [];

  function prepareListItems() {
    let tStart;
    if (debug) {
      tStart = performance.now();
      console.log("prepare items to search");
      console.log("items: " + JSON.stringify(items));
    }
    const length = items ? items.length : 0;
    listItems = new Array(length);

    if (length > 0) {
      items.forEach((item, i) => {
        listItems[i] = getListItem(item);
      });
    }

    if (debug) {
      const tEnd = performance.now();
      console.log(
        listItems.length +
          " items to search prepared in " +
          (tEnd - tStart) +
          " milliseconds"
      );
    }
  }

  function getListItem(item) {
    return {
      // keywords representation of the item
      keywords: safeKeywordsFunction(item),
      // item label
      label: safeLabelFunction(item),
      // store reference to the origial item
      item: item
    };
  }

  $: items, prepareListItems();

  function prepareUserEnteredText(userEnteredText) {
    if (userEnteredText === undefined || userEnteredText === null) {
      return "";
    }

    const textFiltered = userEnteredText
      .replace(/[&/\\#,+()$~%.'":*?<>{}]/g, " ")
      .trim();

    filteredTextLength = textFiltered.length;

    if (minCharactersToSearch > 1) {
      if (filteredTextLength < minCharactersToSearch) {
        return "";
      }
    }

    const cleanUserEnteredText = textCleanFunction(textFiltered);
    const textFilteredLowerCase = cleanUserEnteredText.toLowerCase().trim();

    if (debug) {
      console.log(
        "Change user entered text '" +
          userEnteredText +
          "' into '" +
          textFilteredLowerCase +
          "'"
      );
    }
    return textFilteredLowerCase;
  }

  function search() {
    let tStart;
    if (debug) {
      tStart = performance.now();
      console.log("Searching user entered text: '" + text + "'");
    }

    const textFiltered = prepareUserEnteredText(text);

    if (textFiltered === "") {
      filteredListItems = listItems;
      closeIfMinCharsToSearchReached();
      if (debug) {
        console.log(
          "User entered text is empty set the list of items to all items"
        );
      }
      return;
    }

    const searchWords = textFiltered.split(" ");

    let tempfilteredListItems = listItems.filter(listItem => {
      const itemKeywords = listItem.keywords;

      let matches = 0;
      searchWords.forEach(searchWord => {
        if (itemKeywords.includes(searchWord)) {
          matches++;
        }
      });

      return matches >= searchWords.length;
    });

    const hlfilter = highlightFilter(textFiltered, ["label"]);
    const filteredListItemsHighlighted = tempfilteredListItems.map(hlfilter);

    filteredListItems = filteredListItemsHighlighted;
    closeIfMinCharsToSearchReached();
    if (debug) {
      const tEnd = performance.now();
      console.log(
        "Search took " +
          (tEnd - tStart) +
          " milliseconds, found " +
          filteredListItems.length +
          " items"
      );
    }
  }

  // $: text, search();

  function selectListItem(listItem) {
    if (debug) {
      console.log("selectListItem");
    }
    const newSelectedItem = listItem.item;
    if (beforeChange(selectedItem, newSelectedItem)) {
      selectedItem = newSelectedItem;
    }
  }

  function selectItem() {
    if (debug) {
      console.log("selectItem");
    }
    const listItem = filteredListItems[highlightIndex];
    selectListItem(listItem);
    close();
  }

  function up() {
    if (debug) {
      console.log("up");
    }

    open();
    if (highlightIndex > 0) highlightIndex--;
    highlight();
  }

  function down() {
    if (debug) {
      console.log("down");
    }

    open();
    if (highlightIndex < filteredListItems.length - 1) highlightIndex++;
    highlight();
  }

  function highlight() {
    if (debug) {
      console.log("highlight");
    }

    const query = ".selected";
    if (debug) {
      console.log("Seaching DOM element: " + query + " in " + list);
    }
    const el = list.querySelector(query);
    if (el) {
      if (typeof el.scrollIntoViewIfNeeded === "function") {
        if (debug) {
          console.log("Scrolling selected item into view");
        }
        el.scrollIntoViewIfNeeded();
      } else {
        if (debug) {
          console.warn(
            "Could not scroll selected item into view, scrollIntoViewIfNeeded not supported"
          );
        }
      }
    } else {
      if (debug) {
        console.warn("Selected item not found to scroll into view");
      }
    }
  }

  function onListItemClick(listItem) {
    if (debug) {
      console.log("onListItemClick");
    }

    selectListItem(listItem);
    close();
  }

  function onDocumentClick(e) {
    if (debug) {
      console.log(e.target);
    }
    if (!e.target.closest(".autocomplete")) {
      if (debug) {
        console.log("onDocumentClick outside");
      }
      placeholder = _placeholder;
      resize=false;
      close();
    } else {
      // if (debug) {
      //   console.log("onDocumentClick inside");
      // }
      // resetListToAllItemsAndOpen();
      resize=true;
      highlight();
    }
  }

  function onKeyDown(e) {
    if (debug) {
      console.log("onKeyDown");
    }
    resize=true;
    let key = e.key;
    if (key === "Tab" && e.shiftKey) key = "ShiftTab";
    const fnmap = {
      Tab: opened ? down.bind(this) : null,
      ShiftTab: opened ? up.bind(this) : null,
      ArrowDown: down.bind(this),
      ArrowUp: up.bind(this),
      Escape: onEsc.bind(this)
    };
    const fn = fnmap[key];
    if (typeof fn === "function") {
      e.preventDefault();
      fn(e);
    }
  }

  function onKeyPress(e) {
    if (debug) {
      console.log("onKeyPress");
    }

    if (e.key === "Enter") {
      e.preventDefault();
      resize = true;
      selectItem();
    }
  }

  function onInput(e) {
    if (debug) {
      console.log("onInput");
    }

    text = e.target.value;
    search();
    highlightIndex = 0;
    open();
  }

  function onInputClick() {
    if (debug) {
      console.log("onInputClick");
    }
    placeholder = _placeholder;
    resetListToAllItemsAndOpen();
  }

  function onEsc(e) {
    if (debug) {
      console.log("onEsc");
    }

    //if (text) return clear();
    e.stopPropagation();
    if (opened) {
      input.focus();
      close();
    }
  }

  function onFocus() {
    if (debug) {
      console.log("onFocus");
    }
    placeholder = '';
    resetListToAllItemsAndOpen();
    resize=true;
  }

  function resetListToAllItemsAndOpen() {
    if (debug) {
      console.log("resetListToAllItemsAndOpen");
    }

    filteredListItems = listItems;

    open();

    // find selected item
    if (selectedItem) {
      if (debug) {
        console.log(
          "Searching currently selected item: " + JSON.stringify(selectedItem)
        );
      }
      for (let i = 0; i < listItems.length; i++) {
        const listItem = listItems[i];
        if (debug) {
          console.log("Item " + i + ": " + JSON.stringify(listItem));
        }
        if (selectedItem == listItem.item) {
          highlightIndex = i;
          if (debug) {
            console.log(
              "Found selected item: " + i + ": " + JSON.stringify(listItem)
            );
          }
          highlight();
          break;
        }
      }
    }
  }

  function open() {
    if (debug) {
      console.log("open");
    }

    // check if the search text has more than the min chars required
    if (isMinCharsToSearchReached()) {
      return;
    }

    opened = true;
  }

  function close() {
    if (debug) {
      console.log("close");
    }
    opened = false;

    if (!text && selectFirstIfEmpty) {
      highlightFilter = 0;
      selectItem();
    }
  }

  function isMinCharsToSearchReached() {
    return (
      minCharactersToSearch > 1 && filteredTextLength < minCharactersToSearch
    );
  }

  function closeIfMinCharsToSearchReached() {
    if (isMinCharsToSearchReached()) {
      close();
    }
  }

  function clear() {
    if (debug) {
      console.log("clear");
    }

    text = "";
    setTimeout(() => input.focus());
  }

  function onBlur() {
    if (debug) {
      console.log("onBlur");
    }
    placeholder = _placeholder;
    resize=false;
    close();
  }
  // 'item number one'.replace(/(it)(.*)(nu)(.*)(one)/ig, '<b>$1</b>$2 <b>$3</b>$4 <b>$5</b>')
  function highlightFilter(q, fields) {
    const qs = "(" + q.trim().replace(/\s/g, ")(.*)(") + ")";
    const reg = new RegExp(qs, "ig");
    let n = 1;
    const len = qs.split(")(").length + 1;
    let repl = "";
    for (; n < len; n++) repl += n % 2 ? `<b>$${n}</b>` : `$${n}`;

    return i => {
      const newI = Object.assign({ highlighted: {} }, i);
      if (fields) {
        fields.forEach(f => {
          if (!newI[f]) return;
          newI.highlighted[f] = newI[f].replace(reg, repl);
        });
      }
      return newI;
    };
  }
</script>

<div class="{className} autocomplete select is-fullwidth" class:resize class:less-opaque={ !resize }>
  <input
    type="text"
    class="input autocomplete-input is-size-6-touch fas fa-search" class:empty={!resize}
    {placeholder}
    {name}
    {disabled}
    {title}
    bind:this={input}
    bind:value={text}
    on:input={onInput}
    on:focus={onFocus}
    on:keydown={onKeyDown}
    on:keypress={onKeyPress} />
    
  <div
    class="autocomplete-list {opened ? '' : 'hidden'} is-fullwidth"
    bind:this={list}>
    {#if filteredListItems && filteredListItems.length > 0}
      {#each filteredListItems as listItem, i}
        {#if maxItemsToShowInList <= 0 || i < maxItemsToShowInList}
          <div
            class="autocomplete-list-item {i === highlightIndex ? 'selected' : ''}"
            on:click={() => onListItemClick(listItem)}>
            {#if listItem.highlighted}
              {@html listItem.highlighted.label}
            {:else}
              {@html listItem.label}
            {/if}
          </div>
        {/if}
      {/each}

      {#if maxItemsToShowInList > 0 && filteredListItems.length > maxItemsToShowInList}
        <div class="autocomplete-list-item-no-results">
          ...{filteredListItems.length - maxItemsToShowInList} results not shown
        </div>
      {/if}
    {:else if noResultsText}
      <div class="autocomplete-list-item-no-results">{noResultsText}</div>
    {/if}
  </div>
</div>

<style lang="scss">
  * {
    font-family:inherit;
  }
  *::placeholder {
    color:#ccc!important;
  }
  .autocomplete {
    min-width: 20vw;
    max-width:25vw;
    border: none;
    margin-top:-12px;
  }
  .autocomplete * {
    box-sizing: border-box;
  }
  input.autocomplete-input {
    width: 100%;
    height: 48px;
    padding: 5px 30px;
    font-weight: 900;
    text-transform: uppercase;
    background:transparent;
    color:white;
    text-align: center;
  }

  input {
    height:48px;
  }

  .autocomplete-list {
    background: #fff;
    position: relative;
    width: 100%;
    overflow-y: auto;
    z-index: 99;
    padding: 10px 0;
    top: 0px;
    border: 1px solid #999;
    max-height: calc(15 * (1rem + 10px) + 15px);
    user-select: none;
  }
  .autocomplete-list:empty {
    padding: 0;
  }
  .autocomplete-list-item {
    padding: 5px 15px;
    color: #333;
    cursor: pointer;
    line-height: 1;
  }

  .autocomplete-list-item:hover,
  .autocomplete-list-item.selected {
    background-color: #2e69e2;
    color: #fff;
  }
  .autocomplete-list-item-no-results {
    padding: 5px 15px;
    color: #999;
    line-height: 1;
  }

  .autocomplete-list.hidden {
    display:
     none;
  }

  .select::after {
    margin-top:0px;
  }

  @media screen and (max-width: 1024px) {
    input.autocomplete-input {
      padding:0;
      height:42px;
      border:0px;
    }
    
    .select::after {
      display:none;
    }
    .autocomplete {
      margin-top:unset;
      padding: 1px 1px;
      min-width:unset;
      position: fixed;
      top: 73px;
      right: 20px;
      width: 42px;
      height:42px;
      z-index: 1;
      transition: all 0.3s ease-out;
    }
    .less-opaque {
      opacity:0.8;
    }
    .autocomplete-list-item * {
      opacity:1!important;
    }
    .autocomplete-list-item {
      line-height: 1.5em;
      font-size: 12px;
      font-weight: 500;
    }
    .resize {
      min-width:60vw;
    }
    input {
      width:100%;
      display:block;
    }
    .autocomplete * {
      transition: all 0.3s ease-out;
    }
    .empty {
     /* font-family: "fontawesome";*/
      font-style: normal;
      font-weight: normal;
      text-decoration: inherit;
    }    
  }
</style>  