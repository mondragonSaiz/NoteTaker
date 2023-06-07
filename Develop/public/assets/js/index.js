let noteTitle;
let noteText;
let saveNoteBtn;
let newNoteBtn;
let noteList;

if (window.location.pathname === "/notes.html") {
  noteTitle = document.querySelector(".note-title");
  noteText = document.querySelector(".note-textarea");
  saveNoteBtn = document.querySelector(".save-note");
  newNoteBtn = document.querySelector(".new-note");
  noteList = document.querySelector(".list-group");
}

// Show an element
const show = (elem) => {
  elem.style.display = "inline";
};

// Hide an element
const hide = (elem) => {
  elem.style.display = "none";
};

// activeNote is used to keep track of the note in the textarea
let activeNote = {};

const getNotes = () =>
  fetch("/api/notes", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((res) => res.json())
    .then((data) => data)
    .catch((err) => console.log("Oops, error :", err));

const saveNote = (note) =>
  fetch("/api/notes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(note),
  })
    .then((response) => response.json())
    .then((data) => data);

const deleteNote = (id) =>
  fetch(`/api/notes/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error("Error: " + response.status);
      }
    })
    .then((data) => data);

const renderActiveNote = () => {
  hide(saveNoteBtn);
  console.log("renderActiveNote() function Triggered");
  console.log("Active Note", activeNote);
  if (activeNote.id) {
    noteTitle.setAttribute("readonly", true);
    noteText.setAttribute("readonly", true);
    noteTitle.value = activeNote.title;
    noteText.value = activeNote.text;
  } else {
    noteTitle.removeAttribute("readonly");
    noteText.removeAttribute("readonly");
    noteTitle.value = "";
    noteText.value = "";
  }
};

const handleNoteSave = () => {
  console.log("handleNoteSave() TRIGERRED");
  const newNote = {
    title: noteTitle.value,
    text: noteText.value,
  };
  saveNote(newNote).then((data) => {
    console.log("SAVE NOTE DATA", data);
    getAndRenderNotes(data);
    renderActiveNote();
  });
};

// Delete the clicked note
const handleNoteDelete = (e) => {
  // Prevents the click listener for the list from being called when the button inside of it is clicked
  e.stopPropagation();

  const note = e.target;
  const noteId = JSON.parse(note.parentElement.getAttribute("data-note")).id;
  console.log("This is the ID to delete", noteId);
  if (activeNote.id === noteId) {
    activeNote = {};
  }

  deleteNote(noteId).then((data) => {
    //console.log("modified data", data.notes);
    getAndRenderNotes();
    renderActiveNote();
  });
};

// Sets the activeNote and displays it
const handleNoteView = (e) => {
  e.preventDefault();
  console.log("This is the child element :", e.target);
  console.log("This is the parent element :", e.target.parent);
  activeNote = JSON.parse(e.target.parentElement.getAttribute("data-note"));
  const noteId = JSON.parse(
    e.target.parentElement.getAttribute("data-note")
  ).id;
  console.log("This is the ID to delete", noteId);
  renderActiveNote(activeNote);
};

// Sets the activeNote to and empty object and allows the user to enter a new note
const handleNewNoteView = (e) => {
  activeNote = {};
  renderActiveNote();
};

const handleRenderSaveBtn = () => {
  console.log("KEYUPPP");
  if (!noteTitle.value.trim() || !noteText.value.trim()) {
    hide(saveNoteBtn);
  } else {
    show(saveNoteBtn);
  }
};

// Render the list of note titles
const renderNoteList = async (notes) => {
  // console.log("renderNoteList() TRIGGERED!!");
  // console.log("DATA : ", notes);
  // console.log("ELEMENT", noteList);
  let jsonNotes = await notes;

  console.log("JSON notes : ", jsonNotes);

  if (window.location.pathname === "/notes.html") {
    noteList.innerHTML = "";
    //console.log("ELEMENT 3", noteList);
  }

  //console.log("ELEMENT 2", noteList);
  let noteListItems = [];

  // Returns HTML element with or without a delete button
  const createLi = (text, delBtn = true) => {
    const liEl = document.createElement("li");
    liEl.classList.add("list-group-item");

    const spanEl = document.createElement("span");
    spanEl.classList.add("list-item-title");
    spanEl.innerText = text;
    spanEl.addEventListener("click", handleNoteView);

    liEl.append(spanEl);

    if (delBtn) {
      const delBtnEl = document.createElement("i");
      delBtnEl.classList.add(
        "fas",
        "fa-trash-alt",
        "float-right",
        "text-danger",
        "delete-note"
      );
      delBtnEl.addEventListener("click", handleNoteDelete);

      liEl.append(delBtnEl);
    }

    return liEl;
  };

  if (jsonNotes.length === 0) {
    noteListItems.push(createLi("No saved Notes", false));
  }

  jsonNotes.forEach((note) => {
    const li = createLi(note.title);
    li.dataset.note = JSON.stringify(note);
    li.classList.add("list-element");
    noteListItems.push(li);
  });

  console.log("NOTE LIST ITEMS ", noteListItems[0]);

  if (window.location.pathname === "/notes.html") {
    noteListItems.forEach((item) => noteList.append(item));
  }
};

// Gets notes from the db and renders them to the sidebar
const getAndRenderNotes = () =>
  getNotes().then((data) => {
    console.log("NOTE DATA", data);
    //console.log("getAndRenderNotes() function Data :", data);
    renderNoteList(data);
  });

if (window.location.pathname === "/notes.html") {
  saveNoteBtn.addEventListener("click", handleNoteSave);
  newNoteBtn.addEventListener("click", handleNewNoteView);
  noteTitle.addEventListener("keyup", handleRenderSaveBtn);
  noteText.addEventListener("keyup", handleRenderSaveBtn);
}

getAndRenderNotes();
