document.addEventListener("DOMContentLoaded", () => {
  const fileInput = document.getElementById("file-input");
  const fileText = document.querySelector(".file-text");
  const cropModal = document.getElementById("crop-modal");
  const modalImage = document.getElementById("modal-image-preview");
  const continueBtn = document.getElementById("continue-btn");
  const croppedPreview = document.getElementById("cropped-preview");
  const submitBtn = document.getElementById("submit-btn");
  const closeBtn = document.querySelector(".close-modal");

  let cropper;

  fileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const shortName = truncateFileName(file.name, 15);
    fileText.textContent = shortName;

    if (!["image/jpeg", "image/jpg", "image/png"].includes(file.type)) {
      alert("Please select a JPG, JPEG, or PNG file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (evt) => {
      modalImage.src = evt.target.result;
      cropModal.style.display = "flex";
      modalImage.onload = () => {
        if (cropper) cropper.destroy();
        cropper = new Cropper(modalImage, {
          aspectRatio: 1,
          viewMode: 1,
          autoCropArea: 1,
          zoomable: true,
          scalable: false,
          background: false,
        });
      };
    };
    reader.readAsDataURL(file);
  });

  continueBtn.addEventListener("click", () => {
    if (!cropper) return;
    const size = 300;
    const canvas = cropper.getCroppedCanvas({
      width: size,
      height: size,
      imageSmoothingQuality: "high",
    });

    const circleCanvas = document.createElement("canvas");
    circleCanvas.width = size;
    circleCanvas.height = size;
    const ctx = circleCanvas.getContext("2d");
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(canvas, 0, 0, size, size);

    const previewCtx = croppedPreview.getContext("2d");
    previewCtx.clearRect(0, 0, 150, 150);
    previewCtx.drawImage(circleCanvas, 0, 0, 150, 150);

    croppedPreview.style.display = "block";
    cropModal.style.display = "none";

    cropper.destroy();
    cropper = null;
  });

  function truncateFileName(name, maxLen = 20) {
    if (name.length <= maxLen) return name;

    const dotIndex = name.lastIndexOf(".");
    const ext = dotIndex > 0 ? name.slice(dotIndex) : "";
    const base = dotIndex > 0 ? name.slice(0, dotIndex) : name;

    const keep = Math.floor((maxLen - 3) / 2);
    const left = base.slice(0, keep);
    const right = base.slice(-keep);

    return `${left}...${right}${ext}`;
  }

  closeBtn.addEventListener("click", () => {
    cropModal.style.display = "none";

    if (cropper) {
      cropper.destroy();
      cropper = null;
    }

    fileInput.value = "";
    fileText.textContent = "No file chosen";

    const previewCtx = croppedPreview.getContext("2d");
    previewCtx.clearRect(0, 0, croppedPreview.width, croppedPreview.height);
    croppedPreview.style.display = "none";

    modalImage.src = "";
  });
});
