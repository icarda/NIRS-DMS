import Papa from "papaparse";

interface ParsedFileRow {
  plotId: number;
  sampleId: number;
  qualityLabPlotNumber: number;
  spectrumData: Record<string, number>;
}

function isNumericString(str: string): boolean {
  if (typeof str !== "string") return false;
  const trimmed = str.trim();
  return (
    trimmed !== "" && !isNaN(parseFloat(trimmed)) && isFinite(Number(trimmed))
  );
}

export async function parseCsv(file: File): Promise<ParsedFileRow[]> {
  const text = await file.text();

  // 2. Parse using PapaParse
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, string>>(text, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
      complete: (results) => {
        if (results.errors.length > 0) {
          return reject(
            new Error(
              `Error parsing CSV structure: ${results.errors[0].message}`
            )
          );
        }
        // empty file or only have headers
        if (!results.data || results.data.length === 0) {
          return resolve([]);
        }

        const parsedRows: ParsedFileRow[] = [];
        const headers = results.meta.fields;
        if (!headers) {
          return reject(new Error("Could not detect headers in CSV file."));
        }

        const plotIdHeader = headers.find(
          (h) => h?.toLowerCase() === "plot_id"
        );
        const sampleIdHeader = headers.find(
          (h) => h?.toLowerCase() === "sample_id"
        );
        const qlpNumberHeader = headers.find(
          (h) => h?.toLowerCase() === "qualitylabplotnumber"
        );

        // Check if required headers were found
        if (!plotIdHeader || !sampleIdHeader || !qlpNumberHeader) {
          return reject(
            new Error(
              "CSV must contain 'plot_id', 'sample_id', and 'QualityLabPlotNumber' columns."
            )
          );
        }

        results.data.forEach((row, index) => {
          const plotId = parseInt(row[plotIdHeader!] ?? "", 10);
          const sampleId = parseInt(row[sampleIdHeader!] ?? "", 10);
          const qualityLabPlotNumber = parseInt(
            row[qlpNumberHeader!] ?? "",
            10
          );
          const spectrumData: Record<string, number> = {};

          if (isNaN(plotId) || isNaN(sampleId) || isNaN(qualityLabPlotNumber)) {
            return;
          }

          for (const header of headers) {
            if (isNumericString(header)) {
              const wavelength = parseFloat(header.trim());
              const value = parseFloat(row[header]);

              if (
                !isNaN(wavelength) &&
                isFinite(wavelength) &&
                !isNaN(value) &&
                isFinite(value)
              ) {
                spectrumData[wavelength] = value;
              }
            }
          }

          parsedRows.push({
            plotId,
            sampleId,
            qualityLabPlotNumber,
            spectrumData,
          });
        });
        resolve(parsedRows);
      },
      error: (error: Error) => {
        reject(new Error(`CSV parsing failed: ${error.message}`));
      },
    });
  });
}
