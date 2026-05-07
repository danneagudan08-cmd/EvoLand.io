(function () {
  function createButton() {
    const btn = document.createElement("button");
    btn.textContent = "+500 XP";

    Object.assign(btn.style, {
      position: "fixed",
      top: "10px",
      right: "10px",
      zIndex: "999999",
      padding: "12px 16px",
      borderRadius: "12px",
      border: "2px solid white",
      background: "orange",
      color: "black",
      fontWeight: "900"
    });

    btn.onclick = () => window.debugAddXP?.();
    btn.ontouchstart = e => {
      e.preventDefault();
      window.debugAddXP?.();
    };

    document.body.appendChild(btn);
  }

  window.addEventListener("load", createButton);
})();