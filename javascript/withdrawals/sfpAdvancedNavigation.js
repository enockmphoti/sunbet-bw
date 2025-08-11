export function sfpAdvancedNavigation() {
  let e = "sfp-advanced-navigation-js";
  StudioForm.forEach((t) => {
    ["studio-form", "sf"].forEach((r) => {
      let i = `${r}-${t.name}`,
        o = `[${i}^="to-"]`;
      document.querySelectorAll(o).forEach((r) => {
        !r.getAttribute(e) &&
          (r.setAttribute(e, ""),
          r.addEventListener("click", () => {
            let e = r.getAttribute(i).slice(3),
              o = t.logic.find((t) => t.name == e || t.index == e)?.index,
              d = [...Array(o + 1).keys()];
            console.log("Current Record:", t.record); // Debugging log
            console.log("Next Slide Index:", o); // Debugging log

            if (
              !(d[d.length - 1] > t.record[t.record.length - 1].index) ||
              t.reportValidity()
            ) {
              if (r.getAttribute("sfp-removed-slides")) {
                e = r.getAttribute("sfp-removed-slides");
                e.split(",").forEach((e) => {
                  d = d.filter((t) => t != e.trim());
                });
              }
              t.record = d;
              console.log("Updated Record:", t.record); // Debugging log

              // Update resolve to allow navigation
              StudioForm.withdraw_form.resolve = true;
              console.log("Resolve Updated:", StudioForm.withdraw_form.resolve); // Debugging log

              // Navigate to the next slide
              t.to(e);
              console.log(`Navigated to slide: ${e}`); // Debugging log
            }
          }));
      }),
        document.querySelectorAll(`[${i}="reset"]`).forEach((r) => {
          !r.getAttribute(e + "-reset") &&
            (r.setAttribute(e + "-reset", ""),
            r.addEventListener("click", () => {
              sfpMemoryWrite(t, {});
              StudioForm.withdraw_form.resolve = true; // Reset resolve
              console.log("Resolve Reset:", StudioForm.withdraw_form.resolve); // Debugging log
            }));
        });
    });
  });
}