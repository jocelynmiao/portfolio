import { fetchJSON, renderProjects } from "../global.js";
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector(".projects");
renderProjects(projects, projectsContainer, "h2");

let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
let colors = d3.scaleOrdinal(d3.schemeTableau10);

let query = "";
let selectedIndex = -1;

function getFilteredProjects() {
  return projects.filter((project) => {
    const matchesSearch = Object.values(project)
      .join("\n")
      .toLowerCase()
      .includes(query.toLowerCase());

    const matchesYear =
      selectedIndex === -1 || project.year === data[selectedIndex]?.label;

    return matchesSearch && matchesYear;
  });
}

let data = [];

function getRolledData(projectsGiven) {
  return d3
    .rollups(
      projectsGiven,
      (v) => v.length,
      (d) => d.year,
    )
    .map(([year, count]) => ({ value: count, label: year }));
}

function renderPieChart(projectsGiven) {
  data = getRolledData(projectsGiven);

  const svg = d3.select("svg");
  svg.selectAll("path").remove();

  const sliceGenerator = d3.pie().value((d) => d.value);
  const arcData = sliceGenerator(data);
  const arcs = arcData.map((d) => arcGenerator(d));

  arcs.forEach((arc, i) => {
    svg
      .append("path")
      .attr("d", arc)
      .attr("fill", colors(i))
      .attr("class", i === selectedIndex ? "selected" : null)
      .on("click", () => {
        selectedIndex = selectedIndex === i ? -1 : i;
        applyFilters();
      });
  });

  const legend = d3.select(".legend");
  legend.selectAll("*").remove();
  data.forEach((d, i) => {
    legend
      .append("li")
      .attr(
        "class",
        i === selectedIndex ? "legend-item selected" : "legend-item",
      )
      .html(
        `<span class="swatch" style="--color:${colors(i)}"></span> ${d.label} <em>(${d.value})</em>`,
      );
  });
}

function applyFilters() {
  const searchFiltered = projects.filter((project) =>
    Object.values(project)
      .join("\n")
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  renderPieChart(searchFiltered);

  const fullyFiltered = getFilteredProjects();
  renderProjects(fullyFiltered, projectsContainer, "h2");
}

const searchInput = document.querySelector(".searchBar");
searchInput.addEventListener("input", (event) => {
  query = event.target.value;
  applyFilters();
});

applyFilters();
