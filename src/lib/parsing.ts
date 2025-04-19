import Papa from "papaparse";
import * as XLSX from "xlsx";

import { getCropTraitIdMapForTraits } from "@/features/traits/db/crop-trait";
import { TraitSchema } from "@/features/traits/schemas/trait";

export interface NIRSData {
  studyId: number;
  sampleId: number;
  gid: number;
  plotId: number;
  wavelength: number;
  value: number;
}

export interface ParsedNirsDataFileRow {
  plotId: number;
  sampleId: number;
  qualityLabPlotNumber: number;
  spectrumData: Record<string, number>;
}

export interface ParsedTraitFileRow {
  sampleId: number;
  traitValues: Record<string, number>;
}

function isNumericString(str: string): boolean {
  if (typeof str !== "string") return false;
  const trimmed = str.trim();
  return (
    trimmed !== "" && !isNaN(parseFloat(trimmed)) && isFinite(Number(trimmed))
  );
}

export async function parseCsv(file: File): Promise<ParsedNirsDataFileRow[]> {
  const text = await file.text();
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
        if (!results.data) return resolve([]);

        const parsedRows: ParsedNirsDataFileRow[] = [];
        const headers = results.meta.fields;
        if (!headers) return reject(new Error("Could not detect CSV headers."));

        const plotIdHeader = headers.find(
          (h) => h?.toLowerCase() === "plot_id"
        );
        const sampleIdHeader = headers.find(
          (h) => h?.toLowerCase() === "sample_id"
        );
        const qlpNumberHeader = headers.find(
          (h) => h?.toLowerCase() === "qualitylabplotnumber"
        );

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
          // Use string as key for spectrumData
          const spectrumData: Record<string, number> = {};

          if (isNaN(plotId) || isNaN(sampleId) || isNaN(qualityLabPlotNumber)) {
            console.warn(
              `Skipping CSV row ${index + 2} due to invalid metadata.`
            );
            return;
          }

          for (const header of headers) {
            if (isNumericString(header)) {
              const value = parseFloat(row[header]);
              if (!isNaN(value) && isFinite(value)) {
                spectrumData[header.trim()] = value;
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

export async function parseXlsx(file: File): Promise<ParsedNirsDataFileRow[]> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) throw new Error("XLSX file contains no sheets.");

    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, {
      raw: true,
      defval: null,
    });

    if (!jsonData || jsonData.length === 0) return [];

    const parsedRows: ParsedNirsDataFileRow[] = [];
    const headers = Object.keys(jsonData[0]);

    const plotIdHeader = headers.find((h) => h?.toLowerCase() === "plot_id");
    const sampleIdHeader = headers.find(
      (h) => h?.toLowerCase() === "sample_id"
    );
    const qlpNumberHeader = headers.find(
      (h) => h?.toLowerCase() === "qualitylabplotnumber"
    );

    if (!plotIdHeader || !sampleIdHeader || !qlpNumberHeader) {
      throw new Error(
        "must contain 'plot_id', 'sample_id', and 'QualityLabPlotNumber' columns."
      );
    }

    jsonData.forEach((row, index) => {
      const rawPlotId = row[plotIdHeader!];
      const rawSampleId = row[sampleIdHeader!];
      const rawQlpNumber = row[qlpNumberHeader!];
      const plotId =
        typeof rawPlotId === "number"
          ? rawPlotId
          : parseInt(String(rawPlotId ?? ""), 10);
      const sampleId =
        typeof rawSampleId === "number"
          ? rawSampleId
          : parseInt(String(rawSampleId ?? ""), 10);
      const qualityLabPlotNumber =
        typeof rawQlpNumber === "number"
          ? rawQlpNumber
          : parseInt(String(rawQlpNumber ?? ""), 10);
      // Use string as key for spectrumData
      const spectrumData: Record<string, number> = {};

      if (isNaN(plotId) || isNaN(sampleId) || isNaN(qualityLabPlotNumber)) {
        console.warn(`Skipping XLSX row ${index + 2} due to invalid metadata.`);
        return;
      }

      for (const header of headers) {
        const trimmedHeader = header.trim();
        // Check if header looks like a wavelength number
        if (isNumericString(trimmedHeader)) {
          const rawValue = row[header];
          const value =
            typeof rawValue === "number"
              ? rawValue
              : parseFloat(String(rawValue ?? "NaN"));

          if (!isNaN(value) && isFinite(value)) {
            spectrumData[trimmedHeader] = value;
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
    return parsedRows;
  } catch (error: any) {
    console.error("Error parsing XLSX file:", error);
    throw new Error(`Failed to parse XLSX file: ${error.message}`);
  }
}

export async function parseNirsFile(
  file: File
): Promise<ParsedNirsDataFileRow[]> {
  const fileType = file.type;
  const fileNameLower = file.name.toLowerCase();

  if (fileType === "text/csv" || fileNameLower.endsWith(".csv")) {
    return await parseCsv(file);
  } else if (
    fileType ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    fileNameLower.endsWith(".xlsx")
  ) {
    return await parseXlsx(file);
  } else {
    throw new Error(
      `Unsupported file type: ${fileType || "unknown"}. Please upload CSV or XLSX.`
    );
  }
}

export function transformParsedNirsDataForDb(
  parsedData: ParsedNirsDataFileRow[],
  studyId: number,
  wavelengthRange?: { min: number; max: number }
): NIRSData[] {
  const nirsDataToInsert: NIRSData[] = [];
  if (!parsedData || parsedData.length === 0) {
    return nirsDataToInsert;
  }

  for (const row of parsedData) {
    for (const [wavelengthStr, value] of Object.entries(row.spectrumData)) {
      const wavelength = parseInt(wavelengthStr, 10);

      if (
        !isNaN(wavelength) &&
        isFinite(wavelength) &&
        typeof value === "number" &&
        isFinite(value)
      ) {
        if (wavelengthRange) {
          if (
            wavelength < wavelengthRange.min ||
            wavelength > wavelengthRange.max
          ) {
            throw new Error(
              `Data Quality Error: Wavelength ${wavelength} (SampleID: ${row.sampleId}, PlotID: ${row.plotId}) is outside the allowed range [${wavelengthRange.min}-${wavelengthRange.max}] for the selected NIR Model.`
            );
          }
        }

        const gid = row.qualityLabPlotNumber;

        if (isNaN(gid) || !isFinite(gid)) {
          continue;
        }

        nirsDataToInsert.push({
          studyId: studyId,
          sampleId: row.sampleId,
          gid: gid,
          plotId: row.plotId,
          wavelength: wavelength,
          value: value,
        });
      }
    }
  }
  return nirsDataToInsert;
}

async function parseTraitCsv(
  file: File,
  selectedTraitsToProcess: string[]
): Promise<ParsedTraitFileRow[]> {
  const text = await file.text();
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
        if (!results.data) return resolve([]);

        const parsedRows: ParsedTraitFileRow[] = [];
        const headers = results.meta.fields;
        if (!headers) return reject(new Error("Could not detect CSV headers."));

        // Find required metadata headers
        const sampleIdHeader = headers.find(
          (h) => h?.toLowerCase() === "qualitylabplotnumber"
        );

        if (!sampleIdHeader) {
          return reject(
            new Error("CSV must contain 'QualityLabPlotNumber' column.")
          );
        }

        const availableTraitHeaders = new Map<string, string>();
        const lowerCaseHeaders = new Map(
          headers.map((h) => [h.toLowerCase(), h])
        );

        for (const traitName of selectedTraitsToProcess) {
          const actualHeader = lowerCaseHeaders.get(traitName.toLowerCase());
          if (actualHeader) {
            availableTraitHeaders.set(traitName, actualHeader);
          } else {
            return reject(
              new Error(
                `Selected trait '${traitName}' not found as a column header in the CSV file.`
              )
            );
          }
        }

        // Process rows
        results.data.forEach((row, index) => {
          const sampleId = parseInt(row[sampleIdHeader!] ?? "", 10);

          const traitValues: Record<string, number> = {};

          if (isNaN(sampleId)) {
            return;
          }

          availableTraitHeaders.forEach((actualHeader, selectedTraitName) => {
            const value = parseFloat(row[actualHeader]);
            if (!isNaN(value) && isFinite(value)) {
              traitValues[selectedTraitName] = value;
            } else {
              console.warn(
                `Invalid value for trait '${selectedTraitName}' in CSV row ${index + 2}. Skipping value.`
              );
            }
          });

          if (Object.keys(traitValues).length > 0) {
            parsedRows.push({
              sampleId,
              traitValues,
            });
          } else {
            console.warn(
              `Skipping Trait CSV row ${index + 2}: No valid values found for selected traits.`
            );
          }
        });
        resolve(parsedRows);
      },
      error: (error: Error) => {
        reject(new Error(`CSV parsing failed: ${error.message}`));
      },
    });
  });
}

async function parseTraitXlsx(
  file: File,
  selectedTraitsToProcess: string[]
): Promise<ParsedTraitFileRow[]> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) throw new Error("XLSX file contains no sheets.");
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, {
      raw: true,
      defval: null,
    });

    if (!jsonData || jsonData.length === 0) return [];

    const parsedRows: ParsedTraitFileRow[] = [];
    const headers = Object.keys(jsonData[0]);

    const sampleIdHeader = headers.find(
      (h) => h?.toLowerCase() === "qualitylabplotnumber"
    );

    if (!sampleIdHeader) {
      throw new Error("XLSX file must contain 'QualityLabPlotNumber' column.");
    }

    // Find which selected traits exist as headers
    const availableTraitHeaders = new Map<string, string>();
    const lowerCaseHeaders = new Map(headers.map((h) => [h.toLowerCase(), h]));

    for (const traitName of selectedTraitsToProcess) {
      const actualHeader = lowerCaseHeaders.get(traitName.toLowerCase());
      if (actualHeader) {
        availableTraitHeaders.set(traitName, actualHeader);
      } else {
        throw new Error(
          `Selected trait '${traitName}' not found as a column header in the XLSX file.`
        );
      }
    }

    // Process rows
    jsonData.forEach((row, index) => {
      const rawSampleId = row[sampleIdHeader!];
      const sampleId =
        typeof rawSampleId === "number"
          ? rawSampleId
          : parseInt(String(rawSampleId ?? ""), 10);

      const traitValues: Record<string, number> = {};

      if (isNaN(sampleId)) {
        console.warn(
          `Skipping Trait XLSX row ${index + 2} due to invalid IDs.`
        );
        return;
      }

      availableTraitHeaders.forEach((actualHeader, selectedTraitName) => {
        const rawValue = row[actualHeader];
        const value =
          typeof rawValue === "number"
            ? rawValue
            : parseFloat(String(rawValue ?? "NaN"));
        if (!isNaN(value) && isFinite(value)) {
          traitValues[selectedTraitName] = value;
        } else {
          console.warn(
            `Invalid value for trait '${selectedTraitName}' in XLSX row ${index + 2}. Skipping value.`
          );
        }
      });

      if (Object.keys(traitValues).length > 0) {
        parsedRows.push({
          sampleId,
          traitValues,
        });
      } else {
        console.warn(
          `Skipping Trait XLSX row ${index + 2}: No valid values found for selected traits.`
        );
      }
    });
    return parsedRows;
  } catch (error: any) {
    throw new Error(`Failed to parse XLSX file: ${error.message}`);
  }
}

export async function parseTraitFile(
  file: File,
  selectedTraitsToProcess: string[]
): Promise<ParsedTraitFileRow[]> {
  if (!selectedTraitsToProcess || selectedTraitsToProcess.length === 0) {
    return [];
  }

  const fileType = file.type;
  const fileNameLower = file.name.toLowerCase();

  if (fileType === "text/csv" || fileNameLower.endsWith(".csv")) {
    return await parseTraitCsv(file, selectedTraitsToProcess);
  } else if (
    fileType ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    fileNameLower.endsWith(".xlsx")
  ) {
    return await parseTraitXlsx(file, selectedTraitsToProcess);
  } else {
    throw new Error(
      `Unsupported file type for Trait upload: ${fileType || "unknown"}. Please upload CSV or XLSX.`
    );
  }
}

export async function transformTraitDataForDb(
  parsedData: ParsedTraitFileRow[],
  studyId: number,
  year: number,
  cropId: number
): Promise<TraitSchema[]> {
  const traitDataToInsert: TraitSchema[] = [];
  if (!parsedData || parsedData.length === 0) {
    return traitDataToInsert;
  }

  const uniqueTraitNames = new Set<string>();
  parsedData.forEach((row) => {
    Object.keys(row.traitValues).forEach((traitName) =>
      uniqueTraitNames.add(traitName)
    );
  });
  const traitNamesArray = Array.from(uniqueTraitNames);

  if (traitNamesArray.length === 0) {
    return [];
  }

  const cropTraitMap = await getCropTraitIdMapForTraits(
    cropId,
    traitNamesArray
  );

  if (cropTraitMap.size === 0) {
    throw new Error(
      `None of the traits in the file are defined for Crop ID ${cropId}.`
    );
  }

  for (const row of parsedData) {
    for (const [traitName, measuredValue] of Object.entries(row.traitValues)) {
      const cropTraitDetails = cropTraitMap.get(traitName)!;

      const { id: cropTraitId, min, max } = cropTraitDetails;

      if (min !== null && measuredValue < min) {
        throw new Error(
          `Data Quality Error: Trait '${traitName}' value ${measuredValue} (SampleID: ${row.sampleId}) is less than minimum allowed value (${min}).`
        );
      }
      if (max !== null && measuredValue > max) {
        throw new Error(
          `Data Quality Error: Trait '${traitName}' value ${measuredValue} (SampleID: ${row.sampleId}) is greater than maximum allowed value (${max}).`
        );
      }

      if (cropTraitId !== undefined) {
        traitDataToInsert.push({
          studyId: studyId,
          sampleId: row.sampleId,
          year: year,
          traitName: traitName,
          measuredValue: measuredValue,
          cropTraitId: cropTraitId,
          predictedValue: null,
        });
      } else {
        throw new Error(
          `Trait '${traitName}' not found in CropTraitTable for Crop ID ${cropId}.`
        );
      }
    }
  }

  return traitDataToInsert;
}
