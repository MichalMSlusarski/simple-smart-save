document.addEventListener("DOMContentLoaded", async () => {
  const dateFormatSelect = document.getElementById("dateFormat");
  const separatorSelect = document.getElementById("separator");
  const saveBtn = document.getElementById("saveBtn");
  const status = document.getElementById("status");

  const stored = await chrome.storage.sync.get(["dateFormat", "separator"]);
  if (stored.dateFormat) dateFormatSelect.value = stored.dateFormat;
  if (stored.separator) separatorSelect.value = stored.separator;

  saveBtn.addEventListener("click", async () => {
    const dateFormat = dateFormatSelect.value;
    const separator = separatorSelect.value;

    await chrome.storage.sync.set({ dateFormat, separator });

    status.textContent = "✅ Settings saved!";
    status.classList.add("success");

    setTimeout(() => {
      status.textContent = "";
      status.classList.remove("success");
    }, 2000);
  });
});
