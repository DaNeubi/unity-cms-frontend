//#region url
top.postMessage(
  {
    type: 'update-url',
    url: location.href,
  },
  '*',
);

// eslint-disable-next-line no-undef
navigation.addEventListener('navigate', () => {
  top.postMessage(
    {
      type: 'update-url',
      url: location.href,
    },
    '*',
  );
});
//#endregion

//#region title
top.postMessage(
  {
    type: 'update-title',
    title: document.title,
  },
  '*',
);

new MutationObserver(function () {
  top.postMessage(
    {
      type: 'update-title',
      title: document.title,
    },
    '*',
  );
}).observe(document.querySelector('title'), {
  subtree: true,
  characterData: true,
  childList: true,
});
//#endregion

//#region input
const trackedInputTypes = ['text', 'number', 'password', 'search'];

function checkFocusConditions(element) {
  if (element instanceof HTMLInputElement) {
    if (trackedInputTypes.includes(element.type)) {
      return true;
    }

    return false;
  }

  if (element instanceof HTMLTextAreaElement) {
    return true;
  }

  return false;
}

document.addEventListener('focusin', (event) => {
  if (checkFocusConditions(event.target)) {
    top.postMessage(
      {
        type: 'update-focus',
        focus: true,
      },
      '*',
    );
  }
});

document.addEventListener('focusout', (event) => {
  if (checkFocusConditions(event.target)) {
    top.postMessage(
      {
        type: 'update-focus',
        focus: false,
      },
      '*',
    );
  }
});
//#endregion

//#region prevent new tab clicks
document.addEventListener('auxclick', (event) => {
  if (event.button === 1) {
    event.preventDefault();
    top.postMessage(
      {
        type: 'open-tab',
        url: event.target.href,
      },
      '*',
    );
  }
});

document.addEventListener('click', (event) => {
  if (event.button == 0 && (event.ctrlKey || event.shiftKey)) {
    event.preventDefault();
    event.stopPropagation();
    top.postMessage(
      {
        type: 'open-tab',
        url: event.target.href,
      },
      '*',
    );
    return false;
  }
});
//#endregion
