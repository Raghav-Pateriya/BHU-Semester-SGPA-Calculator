const defaultGrades = [
  { grade: "S", point: 10 },
  { grade: "A", point: 9 },
  { grade: "B", point: 8 },
  { grade: "C", point: 7 },
  { grade: "D", point: 6 },
  { grade: "E", point: 5 },
  { grade: "F", point: 0 },
];

const defaultSubjects = [
  { name: "", credit: 3, grade: "S" },
  { name: "", credit: 3, grade: "A" },
  { name: "", credit: 3, grade: "B" },
  { name: "", credit: 3, grade: "A" },
];

const state = {
  grades: structuredClone(defaultGrades),
  subjects: structuredClone(defaultSubjects),
};

const rowsElement = document.querySelector("#subjectRows");
const rowTemplate = document.querySelector("#subjectRowTemplate");

const gradeGrid = document.querySelector("#gradeGrid");

const sgpaValue = document.querySelector("#sgpaValue");
const heroSgpa = document.querySelector("#heroSgpa");
const heroCredits = document.querySelector("#heroCredits");

const addSubjectButton = document.querySelector("#addSubjectButton");
const resetButton = document.querySelector("#resetButton");
const clearButton = document.querySelector("#clearButton");

const emptyState = document.querySelector("#emptyState");

let openGradeIndex = null;


/* -------------------------------------------------------
   HELPERS
------------------------------------------------------- */

function getGradePoint(grade) {
  const item = state.grades.find(
    (entry) => entry.grade === grade
  );

  return item ? Number(item.point) : 0;
}


function closeGradeMenu() {
  if (openGradeIndex === null) {
    return;
  }

  const currentPicker = rowsElement.querySelector(
    `[data-row-index="${openGradeIndex}"]`
  );

  if (currentPicker) {
    currentPicker.classList.remove("is-open");

    const trigger = currentPicker.querySelector(".grade-trigger");

    if (trigger) {
      trigger.setAttribute("aria-expanded", "false");
    }

    const menu = currentPicker.querySelector(".grade-menu");

    if (menu) {
      menu.remove();
    }
  }

  openGradeIndex = null;
}


/* -------------------------------------------------------
   GRADE MENU
------------------------------------------------------- */

function createGradeMenu(picker, rowIndex) {
  const menu = document.createElement("div");

  menu.className = "grade-menu";
  menu.setAttribute("role", "listbox");

  state.grades.forEach(({ grade, point }) => {

    const option = document.createElement("button");

    option.className = "grade-option";

    if (state.subjects[rowIndex].grade === grade) {
      option.classList.add("is-selected");
    }

    option.type = "button";

    option.dataset.grade = grade;
    option.dataset.rowIndex = rowIndex;

    option.setAttribute("role", "option");

    option.setAttribute(
      "aria-selected",
      String(state.subjects[rowIndex].grade === grade)
    );

    option.innerHTML = `
      <strong>${grade}</strong>
      <span>or</span>
      <b>${point}</b>
    `;

    option.addEventListener("click", (event) => {

      event.preventDefault();
      event.stopPropagation();

      state.subjects[rowIndex].grade = grade;

      updateGradeTrigger(picker, rowIndex);

      closeGradeMenu();

      updateResult();
    });

    menu.appendChild(option);
  });

  picker.appendChild(menu);
}


function updateGradeTrigger(picker, rowIndex) {

  const subject = state.subjects[rowIndex];

  const trigger = picker.querySelector(".grade-trigger");

  if (!trigger) {
    return;
  }

  const gradeStrong = trigger.querySelector(".grade-value strong");
  const gradePoint = trigger.querySelector(".grade-value b");

  if (gradeStrong) {
    gradeStrong.textContent = subject.grade;
  }

  if (gradePoint) {
    gradePoint.textContent = getGradePoint(subject.grade);
  }
}


function toggleGradeMenu(picker, rowIndex) {

  if (openGradeIndex === rowIndex) {
    closeGradeMenu();
    return;
  }

  closeGradeMenu();

  openGradeIndex = rowIndex;

  picker.classList.add("is-open");

  const trigger = picker.querySelector(".grade-trigger");

  if (trigger) {
    trigger.setAttribute("aria-expanded", "true");
  }

  createGradeMenu(picker, rowIndex);
}


/* -------------------------------------------------------
   RENDER SUBJECT ROWS
------------------------------------------------------- */

function renderRows() {

  rowsElement.replaceChildren();

  emptyState.hidden = state.subjects.length !== 0;

  state.subjects.forEach((subject, index) => {

    const row = rowTemplate.content
      .firstElementChild
      .cloneNode(true);

    row.dataset.index = index;

    const rowIndex = row.querySelector(".row-index");

    const nameInput = row.querySelector(".subject-input");

    const creditInput = row.querySelector(".credit-input");

    const gradeSelect = row.querySelector(".grade-select");

    const removeButton = row.querySelector(".remove-button");


    /* Row number */

    rowIndex.textContent = index + 1;

    rowIndex.dataset.row = index + 1;


    /* Subject */

    nameInput.value = subject.name;

    nameInput.placeholder = `Subject ${index + 1}`;


    nameInput.addEventListener("input", (event) => {

      state.subjects[index].name = event.target.value;

    });


    /* Credits */

    creditInput.value = subject.credit;


    creditInput.addEventListener("input", (event) => {

      const rawValue = event.target.value;

      if (rawValue === "") {
        state.subjects[index].credit = 0;
        updateResult();
        return;
      }

      let value = Number(rawValue);

      if (!Number.isFinite(value)) {
        return;
      }

      if (value < 0) {
        value = 0;
      }

      if (value > 4) {
        value = 4;
      }

      state.subjects[index].credit = value;

      updateResult();
    });


    creditInput.addEventListener("blur", () => {

      let value = Number(creditInput.value);

      if (!Number.isFinite(value) || value < 0) {
        value = 0;
      }

      if (value > 4) {
        value = 4;
      }

      state.subjects[index].credit = value;

      creditInput.value = value;

      updateResult();
    });


    /* Grade picker */

    gradeSelect.dataset.rowIndex = index;

    const trigger = document.createElement("button");

    trigger.className = "grade-trigger";

    trigger.type = "button";

    trigger.setAttribute("aria-expanded", "false");

    trigger.setAttribute("aria-haspopup", "listbox");

    trigger.innerHTML = `
      <span class="grade-value">
        <strong>${subject.grade}</strong>
        <span>or</span>
        <b>${getGradePoint(subject.grade)}</b>
      </span>

      <span
        class="grade-arrow"
        aria-hidden="true"
      >
        ▾
      </span>
    `;

    trigger.addEventListener("click", (event) => {

      event.preventDefault();
      event.stopPropagation();

      toggleGradeMenu(gradeSelect, index);

    });

    gradeSelect.appendChild(trigger);


    /* Remove */

    removeButton.addEventListener("click", () => {

      row.classList.add("row-exit");

      window.setTimeout(() => {

        state.subjects.splice(index, 1);

        openGradeIndex = null;

        renderRows();

        updateResult();

      }, 160);

    });


    rowsElement.appendChild(row);

  });
}


/* -------------------------------------------------------
   GRADE POINT PANEL
------------------------------------------------------- */

function renderGradeGrid() {

  gradeGrid.replaceChildren();

  state.grades.forEach((gradeItem, index) => {

    const wrapper = document.createElement("label");

    wrapper.className = "grade-row";


    const label = document.createElement("span");

    label.className = "grade-label";

    label.textContent = gradeItem.grade;


    const input = document.createElement("input");

    input.type = "text";

    input.inputMode = "numeric";

    input.value = gradeItem.point;

    input.setAttribute(
      "aria-label",
      `${gradeItem.grade} grade point`
    );


    input.addEventListener("input", (event) => {

      const rawValue = event.target.value;

      if (rawValue === "") {
        state.grades[index].point = 0;
        updateGradePointDisplays();
        updateResult();
        return;
      }

      let value = Number(rawValue);

      if (!Number.isFinite(value)) {
        return;
      }

      value = Math.round(value);

      if (value < 0) {
        value = 0;
      }

      if (value > 10) {
        value = 10;
      }

      state.grades[index].point = value;

      updateGradePointDisplays();

      updateResult();

    });


    input.addEventListener("blur", () => {

      let value = Number(input.value);

      if (!Number.isFinite(value)) {
        value = 0;
      }

      value = Math.round(value);

      value = Math.max(0, Math.min(10, value));

      state.grades[index].point = value;

      input.value = value;

      updateGradePointDisplays();

      updateResult();

    });


    wrapper.append(label, input);

    gradeGrid.appendChild(wrapper);

  });
}


function updateGradePointDisplays() {

  document
    .querySelectorAll(".grade-select")
    .forEach((picker) => {

      const rowIndex = Number(
        picker.dataset.rowIndex
      );

      if (
        !Number.isInteger(rowIndex) ||
        !state.subjects[rowIndex]
      ) {
        return;
      }

      const subject = state.subjects[rowIndex];

      const triggerPoint = picker.querySelector(
        ".grade-trigger .grade-value b"
      );

      const triggerGrade = picker.querySelector(
        ".grade-trigger .grade-value strong"
      );

      if (triggerGrade) {
        triggerGrade.textContent = subject.grade;
      }

      if (triggerPoint) {
        triggerPoint.textContent =
          getGradePoint(subject.grade);
      }


      picker
        .querySelectorAll(".grade-option")
        .forEach((option) => {

          const grade = option.dataset.grade;

          const pointElement = option.querySelector("b");

          if (pointElement) {
            pointElement.textContent =
              getGradePoint(grade);
          }

          option.classList.toggle(
            "is-selected",
            grade === subject.grade
          );

          option.setAttribute(
            "aria-selected",
            String(grade === subject.grade)
          );

        });

    });
}


/* -------------------------------------------------------
   RESULT
------------------------------------------------------- */

function updateResult() {

  const totals = state.subjects.reduce(
    (summary, subject) => {

      const credit =
        Math.max(
          0,
          Number(subject.credit) || 0
        );

      const point =
        getGradePoint(subject.grade);

      summary.credits += credit;

      summary.points +=
        credit * point;

      return summary;

    },
    {
      credits: 0,
      points: 0,
    }
  );


  const sgpa =
    totals.credits === 0
      ? 0
      : totals.points / totals.credits;


  const formattedSgpa =
    sgpa.toFixed(2);


  sgpaValue.textContent =
    formattedSgpa;

  heroSgpa.textContent =
    formattedSgpa;


  const creditText =
    Number.isInteger(totals.credits)
      ? totals.credits
      : totals.credits.toFixed(2);


  heroCredits.textContent =
    `${creditText} credit${
      totals.credits === 1 ? "" : "s"
    } counted`;
}


/* -------------------------------------------------------
   ACTIONS
------------------------------------------------------- */

function addSubject() {

  state.subjects.push({
    name: "",
    credit: 3,
    grade: "S",
  });

  openGradeIndex = null;

  renderRows();

  updateResult();


  /* Scroll new row into view on mobile */

  const rows =
    rowsElement.querySelectorAll("tr");

  const lastRow =
    rows[rows.length - 1];

  if (
    lastRow &&
    window.innerWidth <= 560
  ) {
    requestAnimationFrame(() => {

      lastRow.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });

    });
  }
}


function clearSubjects() {

  closeGradeMenu();

  state.subjects = [];

  renderRows();

  updateResult();

}


function resetCalculator() {

  closeGradeMenu();

  state.grades =
    structuredClone(defaultGrades);

  state.subjects =
    structuredClone(defaultSubjects);

  renderGradeGrid();

  renderRows();

  updateResult();

}


/* -------------------------------------------------------
   EVENT LISTENERS
------------------------------------------------------- */

addSubjectButton.addEventListener(
  "click",
  addSubject
);

clearButton.addEventListener(
  "click",
  clearSubjects
);

resetButton.addEventListener(
  "click",
  resetCalculator
);


/*
  Close dropdown when user taps/clicks outside it.
*/

document.addEventListener(
  "pointerdown",
  (event) => {

    const picker =
      event.target.closest(".grade-select");

    if (picker) {
      return;
    }

    closeGradeMenu();

  }
);


/*
  Prevent accidental page scrolling
  when interacting with dropdown.
*/

document.addEventListener(
  "touchstart",
  (event) => {

    const option =
      event.target.closest(".grade-option");

    if (option) {
      event.stopPropagation();
    }

  },
  { passive: true }
);


/* -------------------------------------------------------
   INITIAL RENDER
------------------------------------------------------- */

renderGradeGrid();

renderRows();

updateResult();
