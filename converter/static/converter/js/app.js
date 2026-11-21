
const fileInput = document.getElementById("file-input");
const dropArea = document.getElementById("drop-area");
const fileInfo = document.getElementById("file-info");
const fileName = document.getElementById("file-name");
const removeButton = document.getElementById("remove-file");
const convertButton = document.getElementById("convert-button");

let selectedFile = null;

function selectFile(file) {
    if (!file) return;

    const allowedExtensions = [".docx", ".pptx"];
    const extension = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();

    if (!allowedExtensions.includes(extension)) {
        alert("Please select a DOCX or PPTX file.");
        return;
    }

    selectedFile = file;

    fileName.textContent = file.name;
    fileInfo.hidden = false;
    convertButton.disabled = false;
}

fileInput.addEventListener("change", () => {
    selectFile(fileInput.files[0]);
});

dropArea.addEventListener("dragover", (event) => {
    event.preventDefault();
    dropArea.classList.add("drag-over");
});

dropArea.addEventListener("dragleave", () => {
    dropArea.classList.remove("drag-over");
});

dropArea.addEventListener("drop", (event) => {
    event.preventDefault();
    dropArea.classList.remove("drag-over");

    selectFile(event.dataTransfer.files[0]);
});

removeButton.addEventListener("click", () => {
    selectedFile = null;
    fileInput.value = "";
    fileInfo.hidden = true;
    convertButton.disabled = true;
});

convertButton.addEventListener("click", () => {
    if (!selectedFile) return;

    alert("Upload interface is ready. Conversion will be implemented next.");
});

console.log("FileBridge initialized.");
