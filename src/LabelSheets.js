import React, { useRef, useState  } from "react";
import Papa from "papaparse";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

const LabelSheet = () => {
  const printRef = useRef();
  const [labels, setLables] = useState([]);

    // Define label and paper dimensions in inches
	const labelsPerPage = 10;
	const labelWidth = 4.6 * 96; // Convert inches to pixels
	const labelHeight = 3.15 * 96;
	const paperWidth = 12 * 96;
	const paperHeight = 18 * 96;

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      Papa.parse(file, {
        complete: (result) => {
			setLables(result.data.flat(1))
        },
        header: false, // Change to `true` if your CSV has headers
        skipEmptyLines: false,
      });
    }
  };


  const pages = [];
  for (let i = 0; i < labels.length; i += labelsPerPage) {
    pages.push(labels.slice(i, i + labelsPerPage));
  }

  const handleSavePDF = async () => {
    if (labels.length === 0) {
      alert("No labels to generate PDF!");
      return;
    }

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "in",
      format: [12, 18], // Custom paper size 12"x18"
    });

    for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
      await html2canvas(printRef.current.children[pageIndex], { scale: 2 }).then(
        (canvas) => {
          const imgData = canvas.toDataURL("image/png");
          if (pageIndex > 0) pdf.addPage();
          pdf.addImage(imgData, "PNG", 0, 0, 12, 18);
        }
      );
    }

    pdf.save("labels.pdf");
  };
  return (
	<div style={{ textAlign: "center", margin: "20px" }}>
	      <button disabled={pages.length === 0} onClick={() => handleSavePDF()} className="print-button">Save as PDF</button>
		  <input type="file" accept=".csv" onChange={handleFileUpload} />
       {/* Render multiple pages */}
	   <div ref={printRef}>
        {pages.map((page, pageIndex) => (
          <div
            key={pageIndex}
            style={{
              width: `${paperWidth}px`,
              height: `${paperHeight}px`,
              border: "2px solid black",
              display: "flex",
              flexWrap: "wrap",
              padding: "10px",
              backgroundColor: "#fff",
              margin: "20px auto",
			  alignItems: "center",
			  justifyContent: "center",
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
                  fontSize: "45px",
                  fontFamily: "Arial, sans-serif",
                  margin: "2px",
				  marginRight:"30px"
                }}
              >
                {label} {/* Adjust this to match API data */}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LabelSheet;
