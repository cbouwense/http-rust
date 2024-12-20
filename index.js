// Global state
let storageKey = "gottapack";

/**
 * @param elem {EventTarget}
 * @returns {void}
 */
function updateCheckedState(elem) {
  if (elem) {
    const [item, state] = elem.id.split("-");
    // replace all underscores with spaces
    const itemName = item.replace(/_/g, " ");

    const oldLocalStorage = JSON.parse(localStorage.getItem(storageKey));

    let newState = "";
    switch (state) {
      case "packed":
        newState = elem.checked ? "packed" : "";
        document.getElementById(`${item}-staged`).checked = false;
        document.getElementById(`${item}-car`).checked = false;
        break;
      case "staged":
        newState = elem.checked ? "staged" : "packed";
        document.getElementById(`${item}-packed`).checked = true;
        document.getElementById(`${item}-car`).checked = false;
        break;
      case "car":
        newState = elem.checked ? "car" : "staged";
        document.getElementById(`${item}-packed`).checked = true;
        document.getElementById(`${item}-staged`).checked = true;
        break;
    }

    localStorage.setItem(
      storageKey,
      JSON.stringify({ ...oldLocalStorage, [itemName]: newState })
    );
  }

  const checkboxes = document
    .getElementById("packing-list")
    .querySelectorAll('input[type="checkbox"]');
  const packedCheckboxes = [...checkboxes].filter((checkbox) =>
    checkbox.id.includes("packed")
  );
  const stagedCheckboxes = [...checkboxes].filter((checkbox) =>
    checkbox.id.includes("staged")
  );
  const carCheckboxes = [...checkboxes].filter((checkbox) =>
    checkbox.id.includes("car")
  );

  const allPackedChecked = [...packedCheckboxes].every(
    (checkbox) => checkbox.checked
  );
  document.getElementById("all-packed").checked = allPackedChecked;

  const allStagedChecked = [...stagedCheckboxes].every(
    (checkbox) => checkbox.checked
  );
  document.getElementById("all-staged").checked = allStagedChecked;

  const allCarChecked = [...carCheckboxes].every(
    (checkbox) => checkbox.checked
  );
  document.getElementById("all-in-car").checked = allCarChecked;
}

/**
 * @param state {string} 'packed', 'staged', 'car'
 * @returns {void}
 */
function checkOrUncheckAll(state) {
  const checkboxes = document
    .getElementById("packing-list")
    .querySelectorAll('input[type="checkbox"]');
  const packedCheckboxes = [...checkboxes].filter((checkbox) =>
    checkbox.id.includes("packed")
  );
  const stagedCheckboxes = [...checkboxes].filter((checkbox) =>
    checkbox.id.includes("staged")
  );
  const carCheckboxes = [...checkboxes].filter((checkbox) =>
    checkbox.id.includes("car")
  );
  const relevantCheckboxes =
    state === "packed"
      ? packedCheckboxes
      : state === "staged"
      ? stagedCheckboxes
      : carCheckboxes;

  const allChecked = [...relevantCheckboxes].every(
    (checkbox) => checkbox.checked
  );
  const someAreChecked = [...relevantCheckboxes].some(
    (checkbox) => checkbox.checked
  );
  const noneAreChecked = !someAreChecked;

  // if all are checked, uncheck all, and vice versa
  const oldLocalStorage = JSON.parse(localStorage.getItem(storageKey));
  let newLocalStorage = {};
  switch (state) {
    case "packed":
      if (allChecked) {
        // uncheck all
        [...relevantCheckboxes].forEach(
          (checkbox) => (checkbox.checked = false)
        );
        Object.entries(oldLocalStorage).forEach(([key, value]) => {
          newLocalStorage[key] = "";
        });
      } else {
        // check all
        [...relevantCheckboxes].forEach(
          (checkbox) => (checkbox.checked = true)
        );
        Object.entries(oldLocalStorage).forEach(([key, value]) => {
          newLocalStorage[key] = "packed";
        });
      }
      stagedCheckboxes.forEach((checkbox) => (checkbox.checked = false));
      carCheckboxes.forEach((checkbox) => (checkbox.checked = false));

      break;
    case "staged":
      if (allChecked) {
        [...relevantCheckboxes].forEach(
          (checkbox) => (checkbox.checked = false)
        );
        Object.entries(oldLocalStorage).forEach(([key, value]) => {
          newLocalStorage[key] = "packed";
        });
      } else {
        [...relevantCheckboxes].forEach(
          (checkbox) => (checkbox.checked = true)
        );
        Object.entries(oldLocalStorage).forEach(([key, value]) => {
          newLocalStorage[key] = "staged";
        });
      }
      packedCheckboxes.forEach((checkbox) => (checkbox.checked = true));
      carCheckboxes.forEach((checkbox) => (checkbox.checked = false));
      break;
    case "car":
      if (allChecked) {
        [...relevantCheckboxes].forEach(
          (checkbox) => (checkbox.checked = false)
        );
        Object.entries(oldLocalStorage).forEach(([key, value]) => {
          newLocalStorage[key] = "staged";
        });
      } else {
        [...relevantCheckboxes].forEach(
          (checkbox) => (checkbox.checked = true)
        );
        Object.entries(oldLocalStorage).forEach(([key, value]) => {
          newLocalStorage[key] = "car";
        });
      }
      packedCheckboxes.forEach((checkbox) => (checkbox.checked = true));
      stagedCheckboxes.forEach((checkbox) => (checkbox.checked = true));
      break;
  }

  localStorage.setItem(storageKey, JSON.stringify(newLocalStorage));

  updateCheckedState();
}

function generateCheckboxItem(itemName, isPacked, isStaged, isInCar) {
  const itemNameWithoutSpaces = itemName.replace(/ /g, "_");

  const li = document.createElement("li");

  const checkbox1 = document.createElement("input");
  checkbox1.type = "checkbox";
  checkbox1.id = itemNameWithoutSpaces + "-packed";
  checkbox1.onclick = function () {
    updateCheckedState(this);
  };
  if (isPacked) checkbox1.checked = true;
  if (isStaged) checkbox1.checked = true;
  if (isInCar) checkbox1.checked = true;

  const checkbox2 = document.createElement("input");
  checkbox2.type = "checkbox";
  checkbox2.id = itemNameWithoutSpaces + "-staged";
  checkbox2.onclick = function () {
    updateCheckedState(this);
  };
  if (isStaged) checkbox2.checked = true;
  if (isInCar) checkbox2.checked = true;

  const checkbox3 = document.createElement("input");
  checkbox3.type = "checkbox";
  checkbox3.id = itemNameWithoutSpaces + "-car";
  checkbox3.onclick = function () {
    updateCheckedState(this);
  };
  if (isInCar) checkbox3.checked = true;

  const span = document.createElement("span");
  span.textContent = itemName;

  const button = document.createElement("button");
  button.textContent = "delete";
  button.onclick = function () {
    deleteItem(this);
  };

  const checkboxDiv = document.createElement("div");
  checkboxDiv.style.display = "flex";
  checkboxDiv.style.alignItems = "center";
  checkboxDiv.style.textAlign = "center";

  checkboxDiv.appendChild(checkbox1);
  checkboxDiv.appendChild(checkbox2);
  checkboxDiv.appendChild(checkbox3);
  checkboxDiv.appendChild(span);
  li.appendChild(checkboxDiv);
  li.appendChild(button);

  document.getElementById("packing-list").appendChild(li);
}

function addNewItem() {
  const itemName = document.getElementById("new-item").value;
  if (!itemName) return;
  // If item already exists, do nothing
  if (document.getElementById(itemName.replace(/ /g, "_") + "-packed")) return;
  if (document.getElementById(itemName.replace(/ /g, "_") + "-staged")) return;
  if (document.getElementById(itemName.replace(/ /g, "_") + "-car")) return;

  generateCheckboxItem(itemName);
  document.getElementById("new-item").value = "";

  const oldLocalStorage = JSON.parse(localStorage.getItem(storageKey));
  const newLocalStorage = { ...oldLocalStorage, [itemName]: "" };
  localStorage.setItem(storageKey, JSON.stringify(newLocalStorage));

  updateCheckedState();
}

function deleteItem(item) {
  const itemName = item.parentElement.querySelector("span").textContent;
  document.getElementById(
    itemName.replace(/ /g, "_") + "-packed"
  ).checked = false;
  document.getElementById(
    itemName.replace(/ /g, "_") + "-staged"
  ).checked = false;
  document.getElementById(itemName.replace(/ /g, "_") + "-car").checked = false;
  item.parentElement.remove();

  const oldLocalStorage = JSON.parse(localStorage.getItem(storageKey));
  const newLocalStorage = { ...oldLocalStorage };
  delete newLocalStorage[itemName];
  localStorage.setItem(storageKey, JSON.stringify(newLocalStorage));

  updateCheckedState();
}

function reset() {
  localStorage.removeItem(storageKey);
  location.reload();
}

async function init() {
  window.reset = reset;
  window.addNewItem = addNewItem;

  const page = window.location.pathname.replaceAll("/", "");
  if (page) {
    storageKey += "-" + page;
  }

  // Store in the form
  // "gottapack": {
  //   "brush":  "packed",
  //   "phone":  "staged",
  //   "wallet": "car"
  // };
  const storedItems = localStorage.getItem(storageKey);

  if (storedItems) {
    const itemNames = [];
    const items = JSON.parse(storedItems);
    Object.entries(items).forEach(([itemName, state]) => {
      itemNames.push(itemName);
      generateCheckboxItem(
        itemName,
        state === "packed",
        state === "staged",
        state === "car"
      );
    });
  } else {
    const res = await fetch(`./defaultItems.json`);
    const defaultItems = await res.json();

    const freshLocalState = {};
    defaultItems.forEach((item) => {
      generateCheckboxItem(item);
      freshLocalState[item] = "";
    });

    localStorage.setItem(storageKey, JSON.stringify(freshLocalState));
  }

  // Do once on page load
  updateCheckedState();
}
