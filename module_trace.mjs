import("file:///" + process.cwd().replace(/\\/g, "/") + "/src/views/DashboardUI.js")
  .then(m => console.log("DASHBOARDUI LOADED OK"))
  .catch(e => console.error("MODULE GRAPH CRASH:", e.message, e.stack));
