let listAllJobs;
let listCtegory;
let listCtegoryJobe;
let dictClass = {};
let listJob = [];

const select = document.querySelector("select");
const container = document.querySelector(".container");
const allJobs = document.querySelector(".button-all-jobs");
const home = document.querySelector(".button-home");
const buttonSavedJobs = document.querySelector(".button-saved-jobs");
const buttinCearch = document.querySelector(".cearch-button");
const inputCearch = document.querySelector(".input-cearch");
const optionDefolte = document.querySelector(".defolte");

const setSessionStorage = function () {
  sessionStorage.setItem("dictClass", JSON.stringify(dictClass));
};

const getSessionStorage = function () {
  data = JSON.parse(sessionStorage.getItem("dictClass"));
  data ? (dictClass = data) : (dictClass = {});
};
getSessionStorage();

const setLocalStorageJobs = function () {
  localStorage.setItem("listJob", JSON.stringify(listJob));
};

const getLocalStorageJobs = function () {
  data = JSON.parse(localStorage.getItem("listJob"));
  data ? (listJob = data) : (listJob = []);
};
getLocalStorageJobs();

document.addEventListener("DOMContentLoaded", function () {
  // getSessionStorage();
  console.log("h");
  if (!dictClass || !dictClass.name) return;
  createLode();
});

const createLode = function () {
  switch (dictClass.name) {
    case "allJobs":
      createAllJobs();
      break;

    case "category":
      createJobCategory(dictClass.value);
      break;

    case "home":
      createHome();
      break;

    case "savedJobs":
      createSavedJobs();
      break;

    case "cearch":
      // console.log(dictClass.value);
      createCearch(dictClass.value);
    default:
  }
};

select.addEventListener("change", function (e) {
  const nameJob = e.target.value;
  if (!nameJob) return;

  document.querySelector("select").blur();

  createJobCategory(nameJob);
});

const createJobCategory = function (nameJob) {
  optionDefolte.textContent = nameJob;

  getJobs(
    `https://remotive.com/api/remote-jobs?category=${nameJob}&&limit=20`
  ).then((data) => {
    listCtegoryJobe = data.jobs;
    // console.log(listCtegoryJobe);

    removeMinuo();
    bildCard(listCtegoryJobe);

    dictClass.name = "category";
    dictClass.value = nameJob;
    setSessionStorage();
  });
};

allJobs.addEventListener("click", function () {
  createAllJobs();
});

const createAllJobs = function () {
  getJobs("https://remotive.com/api/remote-jobs?limit=20").then((data) => {
    listAllJobs = data.jobs;

    removeMinuo();

    bildCard(listAllJobs);

    dictClass.name = "allJobs";
    setSessionStorage();
  });
};

home.addEventListener("click", function () {
  createHome();
});

const createHome = function () {
  removeMinuo();
  dictClass.name = "home";
  setSessionStorage();
};

buttonSavedJobs.addEventListener("click", function () {
  createSavedJobs();
});

const createSavedJobs = function () {
  if (!listJob) return;

  removeMinuo();

  bildCard(listJob);

  dictClass.name = "savedJobs";
  setSessionStorage();
};

buttinCearch.addEventListener("click", function (e) {
  createCearch(inputCearch.value);
});

const createCearch = function (input) {
  if (!input) return;
  getJobs(
    `https://remotive.com/api/remote-jobs?search=${input}&&limit=20`
  ).then((data) => {
    console.log(data);
    const listCearch = data.jobs;

    removeMinuo();
    bildCard(listCearch);

    dictClass.name = "cearch";
    dictClass.value = input;
    setSessionStorage();
  });
};

window.addEventListener("storage", function (e) {
  listJob = JSON.parse(e.newValue);
  setLocalStorageJobs();
  createLode();
});

const getJobs = function (url) {
  return fetch(`${url}`).then((response) => {
    if (!response.ok) throw new Error(`${response.status}`);
    return response.json();
  });
};

const removeMinuo = function () {
  container.querySelectorAll(".card").forEach((card) => card.remove());
};

const createOption = function (option) {
  const newOption = document.createElement("option");

  newOption.value = option;
  newOption.text = option;

  select.appendChild(newOption);
};

const bildCard = function (listJobs) {
  listJobs.forEach((job) => {
    console.log(job);

    listJob.forEach((jobSave) => console.log(typeof jobSave.id, typeof job.id));
    const jobHtml = `
      <div class="card" data-id=${job.id} style="width: 18rem;">
      <div class="name">${
        listJobs[0] === listJob[0]
          ? job.company_name
          : "Compeny name : " + job.company_name
      }</div> 
      <div class="img">
      <img class="logo" src="${job.company_logo ? job.company_logo : ""}"></img>
      </div>
      <div class="scrollable-content scrollable">
      ${
        listJobs[0] === listJob[0]
          ? job.scrollable
          : job.title + "at" + job.company_name + job.description
      }

        </div>
        <div class="card-footer">
          <button class="save button-card" id=${
            job.id
          } style= "background-color: ${
      listJob.find((jobSave) => +jobSave.id === +job.id)
        ? "#d78bba"
        : "rgb(137, 186, 238)"
    }"> ${
      listJob.find((jobSave) => +jobSave.id === +job.id) ? "remove" : "save"
    }</button>
          <button class="button-card see-job"><a href="${
            job.url
          }">see job</a></button>
        </div>
        <div class="type"><p>${
          listJobs[0] === listJob[0] ? job.job_type : "type : " + job.job_type
        }</p></div>
      </div>
    `;

    container.insertAdjacentHTML("beforeend", jobHtml);
  });
};

container.addEventListener("click", function (e) {
  // e.stopImmediatePropagation();
  savedJobs(e);
});

const savedJobs = function (elJob) {
  const buttonSave = elJob.target.closest(".save");
  if (!buttonSave) return;

  const card = elJob.target.closest(".card");

  if (listJob.find((job) => job.id === card.dataset.id)) {
    removeJob(card);
    changeStyle(card, buttonSave);
    return;
  }

  listJob.push({
    id: card.dataset.id,
    company_name: card.querySelector(".name").textContent,
    company_logo: card.querySelector("img").getAttribute("src"),
    scrollable: card.querySelector(".scrollable-content").textContent,
    job_type: card.querySelector(".type").textContent,
  });

  setLocalStorageJobs();

  changeStyle(card, buttonSave);
};

const changeStyle = function (elJob, buttonSave) {
  if (listJob.find((job) => job.id === elJob.dataset.id)) {
    buttonSave.style.backgroundColor = "#d78bba";
    buttonSave.textContent = "remove";
  } else {
    buttonSave.style.backgroundColor = "rgb(137, 186, 238)";
    buttonSave.textContent = "save";
  }
};

const removeJob = function (card) {
  listJob.forEach((job, i) => {
    if (job.id === card.dataset.id) {
      listJob.splice(i, 1);

      setLocalStorageJobs();

      if (dictClass.name === "savedJobs") createSavedJobs();
    }
  });
};

getJobs("https://remotive.com/api/remote-jobs/categories").then((category) => {
  listCtegory = category.jobs;

  listCtegory.forEach((el) => {
    createOption(el.slug);
  });
});

function h() {
  console.log("k");
}
