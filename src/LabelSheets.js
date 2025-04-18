import React, { useRef, useState } from "react";
import Papa from "papaparse";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

const LabelSheet = () => {
  const containerRef = useRef();
  const [labels, setLabels] = useState([]);
  const [loader, setLoader] = useState(false);
  const [progress, setProgress] = useState(0);

  // A4 size in pixels (at 96 DPI)
  const paperWidth = 8.27 * 96;  // ≈ 794.88px
  const paperHeight = 11.69 * 96; // ≈ 1121.28px

  // Adjusted label size to fit 2x3 grid
  const labelWidth = 4.0 * 96;   // 384px
  const labelHeight = 3.40 * 96;
  const labelsPerPage = 6;

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      Papa.parse(file, {
        complete: (result) => {
          setLabels(result.data.flat(1));
        },
        header: false,
        skipEmptyLines: false,
      });
    }
  };

  const pages = [];
  for (let i = 0; i < labels.length; i += labelsPerPage) {
    pages.push(labels.slice(i, i + labelsPerPage));
  }

  const renderPageToDOM = (page) => {
    const div = document.createElement("div");
    div.style.width = `${paperWidth}px`;
    div.style.height = `${paperHeight}px`;
    div.style.display = "flex";
    div.style.flexWrap = "wrap";
    div.style.alignItems = "center";
    div.style.justifyContent = "center";
    div.style.padding = "10px";
    div.style.backgroundColor = "#fff";

    page.forEach((label) => {
      const labelDiv = document.createElement("div");
      labelDiv.style.width = `${labelWidth}px`;
      labelDiv.style.height = `${labelHeight}px`;
      labelDiv.style.border = "1px solid black";
      labelDiv.style.display = "flex";
      labelDiv.style.alignItems = "center";
      labelDiv.style.justifyContent = "flex-start";
      labelDiv.style.fontSize = "36px";
      labelDiv.style.fontFamily = "Arial, sans-serif";
      labelDiv.style.margin = "2px";
	  labelDiv.style.marginRight= "8px"
      labelDiv.innerText = label;
      div.appendChild(labelDiv);
    });

    return div;
  };

  const handleSavePDF = async () => {
    if (labels.length === 0) {
      alert("No labels to generate PDF!");
      return;
    }

    setLoader(true);
    setProgress(0);

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "in",
      format: "a4",
    });

    try {
      for (let i = 0; i < pages.length; i++) {
        const pageDOM = renderPageToDOM(pages[i]);
        containerRef.current.innerHTML = "";
        containerRef.current.appendChild(pageDOM);

        const canvas = await html2canvas(pageDOM, { scale: 2 });

        const blob = await new Promise((resolve) =>
          canvas.toBlob(resolve, "image/jpeg", 0.95)
        );

        const reader = new FileReader();
        const imageDataURL = await new Promise((resolve) => {
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(blob);
        });

        if (i > 0) pdf.addPage();
        pdf.addImage(imageDataURL, "JPEG", 0, 0, 8.27, 11.69);

        setProgress(Math.round(((i + 1) / pages.length) * 100));
      }

      pdf.save("labels.pdf");
    } catch (err) {
      console.error("PDF export failed:", err);
      alert("PDF export failed: " + err.message);
    } finally {
      setLoader(false);
      setProgress(0);
      containerRef.current.innerHTML = "";
    }
  };

  return (
    <div style={{ textAlign: "center", margin: "20px" }}>
      <input type="file" accept=".csv" onChange={handleFileUpload} />
      <button
        disabled={pages.length === 0 || loader}
        onClick={handleSavePDF}
        className="print-button"
      >
        {loader ? "Exporting..." : "Save as PDF"}
      </button>

      {loader && (
        <div style={{ marginTop: "10px" }}>
          <progress value={progress} max="100" />
          <div>{progress}%</div>
        </div>
      )}

      {/* Preview Section */}
      <div style={{ marginTop: "40px" }}>
        <h2>Preview</h2>
        {pages.map((page, pageIndex) => (
          <div
            key={pageIndex}
            style={{
              width: `${paperWidth}px`,
              height: `${paperHeight}px`,
              border: "2px solid black",
              margin: "4px",
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "flex-start",
              padding: "10px",
              backgroundColor: "#fff",
            }}
          >
            {page.map((label, index) => (
              <div
                key={index}
                style={{
                  width: `${labelWidth}px`,
                  height: `${labelHeight}px`,
                  border: "1px solid black",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "36px",
                  fontFamily: "Arial, sans-serif",
                  margin: "2px",
				  marginRight:"8px"
                }}
              >
                {label}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Hidden render container */}
      <div
        ref={containerRef}
        style={{ position: "absolute", left: "-9999px", top: "-9999px" }}
      ></div>
    </div>
  );
};

export default LabelSheet;