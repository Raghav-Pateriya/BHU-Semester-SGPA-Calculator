const defaultGrades = [
  { grade: "S", point: 10 },
  { grade: "A", point: 9 },
  { grade: "B", point: 8 },
  { grade: "C", point: 7 },
  { grade: "D", point: 6 },
  { grade: "E", point: 5 },
  { grade: "F", point: 0 },
];

const state = {
  grades: structuredClone(defaultGrades),
  subjects: [
    { name: "", credit: 3, grade: "S" },
    { name: "", credit: 3, grade: "A" },
    { name: "", credit: 3, grade: "B" },
    { name: "", credit: 3, grade: "A" },
  ],
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

function getGradePoint(grade) {
  return state.grades.find((item) => item.grade === grade)?.point ?? 0;
}

function closeGradeMenu() {
  openGradeIndex = null;
  renderRows();
}

function renderGradeOptions(picker, selectedGrade, rowIndex) {
  picker.replaceChildren();
  const selectedPoint = getGradePoint(selectedGrade);

  const trigger = document.createElement("button");
  trigger.className = "grade-trigger";
  trigger.type = "button";
  trigger.setAttribute("aria-expanded", String(openGradeIndex === rowIndex));
  trigger.setAttribute("aria-haspopup", "listbox");
  trigger.innerHTML = `
    <span class="grade-value">
      <strong>${selectedGrade}</strong>
      <span>or</span>
      <b>${selectedPoint}</b>
    </span>
    <span class="grade-arrow" aria-hidden="true">v</span>
  `;
trigger.addEventListener("click", (event) => {
  event.stopPropagation();

  const wasOpen = openGradeIndex === rowIndex;
  openGradeIndex = wasOpen ? null : rowIndex;

  renderRows();
});

  picker.append(trigger);

  if (openGradeIndex !== rowIndex) {
    return;
  }

  const menu = document.createElement("div");
  menu.className = "grade-menu";
  menu.setAttribute("role", "listbox");

  state.grades.forEach(({ grade, point }) => {
    const option = document.createElement("button");
    option.className = `grade-option${grade === selectedGrade ? " is-selected" : ""}`;
    option.type = "button";
    option.dataset.grade = grade;
    option.dataset.rowIndex = rowIndex;
    option.setAttribute("role", "option");
    option.setAttribute("aria-label", `${grade} or ${point}`);
    option.setAttribute("aria-selected", String(grade === selectedGrade));
    option.innerHTML = `
      <strong>${grade}</strong>
      <span>or</span>
      <b>${point}</b>
    `;
    menu.append(option);
  });

  picker.append(menu);
}

function renderRows() {
  rowsElement.replaceChildren();
  emptyState.toggleAttribute("hidden", state.subjects.length > 0);

  state.subjects.forEach((subject, index) => {
    const row = rowTemplate.content.firstElementChild.cloneNode(true);
    row.classList.toggle("row-open", openGradeIndex === index);
    const nameInput = row.querySelector(".subject-input");
    const creditInput = row.querySelector(".credit-input");
    const gradeSelect = row.querySelector(".grade-select");
    const removeButton = row.querySelector(".remove-button");

    const rowIndex = row.querySelector(".row-index");
    rowIndex.textContent = index + 1;
    rowIndex.dataset.row = index + 1;
    nameInput.value = subject.name;
    nameInput.placeholder = `Subject ${index + 1}`;
    creditInput.value = subject.credit;
    renderGradeOptions(gradeSelect, subject.grade, index);

    nameInput.addEventListener("input", (event) => {
      state.subjects[index].name = event.target.value;
    });

    creditInput.addEventListener("input", (event) => {
      let value = Number(event.target.value);
      if (Number.isNaN(value) || value < 0) value = 0;
      if (value > 4) value = 4;
      state.subjects[index].credit = value;
      event.target.value = value;
      updateResult();
    });

    removeButton.addEventListener("click", () => {
      row.classList.add("row-exit");
      window.setTimeout(() => {
        state.subjects.splice(index, 1);
        renderRows();
        updateResult();
      }, 160);
    });

    rowsElement.append(row);
  });
}
function updateGradePointDisplays() {
  document.querySelectorAll(".grade-select").forEach((picker) => {
    const selectedGrade = picker.querySelector(".grade-trigger strong")?.textContent;

    if (!selectedGrade) return;

    const point = getGradePoint(selectedGrade);
    const pointElement = picker.querySelector(".grade-trigger .grade-value b");

    if (pointElement) {
      pointElement.textContent = point;
    }

    picker.querySelectorAll(".grade-option").forEach((option) => {
      const grade = option.dataset.grade;
      const optionPoint = getGradePoint(grade);
      const optionPointElement = option.querySelector("b");

      if (optionPointElement) {
        optionPointElement.textContent = optionPoint;
      }
    });
  });
}
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
    input.inputMode = "decimal";
    input.pattern = "[0-9]*[.]?[0-9]*";
    input.value = gradeItem.point;
    input.setAttribute("aria-label", `${gradeItem.grade} grade point`);
input.addEventListener("input", (event) => {
  let value = Math.round(Number(event.target.value));
  if (Number.isNaN(value) || value < 0) value = 0;
  if (value > 10) value = 10;
  state.grades[index].point = value;
  event.target.value = value;
  updateGradePointDisplays();
  updateResult();
});

    wrapper.append(label, input);
    gradeGrid.append(wrapper);
  });
}

function updateResult() {
  const totals = state.subjects.reduce(
    (summary, subject) => {
      const credit = Math.max(0, Number(subject.credit) || 0);
      const points = credit * getGradePoint(subject.grade);

      return {
        credits: summary.credits + credit,
        points: summary.points + points,
      };
    },
    { credits: 0, points: 0 },
  );

  const sgpa = totals.credits === 0 ? 0 : totals.points / totals.credits;
  sgpaValue.textContent = sgpa.toFixed(2);
  heroSgpa.textContent = sgpa.toFixed(2);
  heroCredits.textContent = `${totals.credits} credit${totals.credits === 1 ? "" : "s"} counted`;
}

function addSubject() {
  state.subjects.push({
    name: "",
    credit: 3,
    grade: "S",
  });
  renderRows();
  updateResult();
}

function clearSubjects() {
  state.subjects = [];
  renderRows();
  updateResult();
}

function resetCalculator() {
  state.grades = structuredClone(defaultGrades);
  state.subjects = [
    { name: "", credit: 3, grade: "S" },
    { name: "", credit: 3, grade: "A" },
    { name: "", credit: 3, grade: "B" },
    { name: "", credit: 3, grade: "A" },
  ];
  renderGradeGrid();
  openGradeIndex = null;
  renderRows();
  updateResult();
}

addSubjectButton.addEventListener("click", addSubject);
clearButton.addEventListener("click", clearSubjects);
resetButton.addEventListener("click", resetCalculator);
document.addEventListener(
  "pointerdown",
  (event) => {
    const option = event.target.closest(".grade-option");

    if (!option) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    state.subjects[Number(option.dataset.rowIndex)].grade = option.dataset.grade;
    openGradeIndex = null;
    renderRows();
    updateResult();
  },
  true,
);
document.addEventListener("click", () => {
  if (openGradeIndex !== null) {
    closeGradeMenu();
  }
});

renderGradeGrid();
renderRows();
updateResult();
