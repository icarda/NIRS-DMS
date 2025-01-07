-- Center Table
CREATE TABLE Center (
  CenterID SERIAL PRIMARY KEY,
  Name VARCHAR(100) NOT NULL UNIQUE,
  Acronym VARCHAR(50) NOT NULL UNIQUE
);

-- QualityLab Table
CREATE TABLE QualityLab (
  QualityLabID SERIAL PRIMARY KEY,
  CenterID INT NOT NULL,
  Name VARCHAR(100) NOT NULL UNIQUE,
  Location VARCHAR(255),
  Country VARCHAR(100),
  FOREIGN KEY (CenterID) REFERENCES Center(CenterID) ON DELETE CASCADE
);

-- Crop Table
CREATE TABLE Crop (
  CropID SERIAL PRIMARY KEY,
  Name VARCHAR(100) NOT NULL UNIQUE,
  CropImageUrl VARCHAR(255),
  Description TEXT
);

-- CropCommonName Table
CREATE TABLE CropCommonName (
  CommonNameID SERIAL PRIMARY KEY,
  CropID INT NOT NULL,
  CommonName VARCHAR(100) NOT NULL UNIQUE,
  FOREIGN KEY (CropID) REFERENCES Crop(CropID) ON DELETE CASCADE
);

-- Species Table
CREATE TABLE Species (
  SpeciesID SERIAL PRIMARY KEY,
  CropID INT NOT NULL,
  Name VARCHAR(100) NOT NULL UNIQUE,
  FOREIGN KEY (CropID) REFERENCES Crop(CropID) ON DELETE CASCADE
);

-- ProductType Table
CREATE TABLE ProductType (
  ProductTypeID SERIAL PRIMARY KEY,
  Name VARCHAR(100) NOT NULL UNIQUE,
  CropID INT NOT NULL,
  FOREIGN KEY (CropID) REFERENCES Crop(CropID) ON DELETE CASCADE
);

-- PhysiologicalStage Table
CREATE TABLE PhysiologicalStage (
  StageID SERIAL PRIMARY KEY,
  Name VARCHAR(100) NOT NULL UNIQUE,
  CropID INT NOT NULL,
  FOREIGN KEY (CropID) REFERENCES Crop(CropID) ON DELETE CASCADE
);

-- NIRModel Table
CREATE TABLE NIRModel (
  NIRModelID SERIAL PRIMARY KEY,
  Name VARCHAR(100) NOT NULL UNIQUE,
  Type VARCHAR(50),
  WavelengthRange VARCHAR(50),
  Resolution VARCHAR(50),
  Manufacturer VARCHAR(100)
);

-- Trial Table
CREATE TABLE Trial (
  TrialID SERIAL PRIMARY KEY,
  Name VARCHAR(100) NOT NULL,
  PlantingDate DATE,
  SoilType VARCHAR(100),
  Irrigation BOOLEAN,
  Location VARCHAR(100),
  Latitude DOUBLE PRECISION,
  Longitude DOUBLE PRECISION,
  AdditionalMetadata JSONB DEFAULT '{}',
  SpeciesID INT NOT NULL,
  CropID INT NOT NULL,
  FOREIGN KEY (CropID) REFERENCES Crop(CropID) ON DELETE CASCADE,
  FOREIGN KEY (SpeciesID) REFERENCES Species(SpeciesID) ON DELETE CASCADE,
);

-- TrialFertilizer Table
CREATE TABLE TrialFertilizer (
  TrialFertilizerID SERIAL PRIMARY KEY,
  TrialID INT NOT NULL,
  FertilizerType VARCHAR(100) NOT NULL,
  FertilizerAmount DOUBLE PRECISION,
  FOREIGN KEY (TrialID) REFERENCES Trial(TrialID) ON DELETE CASCADE
);

-- Study Table
CREATE TABLE Study (
  StudyID SERIAL PRIMARY KEY,
  TrialID INT NOT NULL,
  StudyCode VARCHAR(100) NOT NULL,
  ProductTypeID INT NOT NULL,
  NIRModelID INT NOT NULL,
  RequesterName VARCHAR(100),
  RequesterEmail VARCHAR(100),
  SampleDate DATE,
  PhysiologicalStageID INT NOT NULL,
  AdditionalMetadata JSONB DEFAULT '{}',
  QualityLabID INT NOT NULL,
  FOREIGN KEY (TrialID) REFERENCES Trial(TrialID) ON DELETE CASCADE,
  FOREIGN KEY (ProductTypeID) REFERENCES ProductType(ProductTypeID) ON DELETE CASCADE,
  FOREIGN KEY (NIRModelID) REFERENCES NIRModel(NIRModelID) ON DELETE CASCADE,
  FOREIGN KEY (PhysiologicalStageID) REFERENCES PhysiologicalStage(StageID) ON DELETE CASCADE,
  FOREIGN KEY (QualityLabID) REFERENCES QualityLab(QualityLabID) ON DELETE CASCADE,
  CONSTRAINT unique_study_code UNIQUE (StudyCode),
  CONSTRAINT unique_study_per_lab UNIQUE (QualityLabID, StudyCode),
  CONSTRAINT study_code_format CHECK (StudyCode ~ '^[A-Za-z0-9]+-[A-Za-z0-9]+-\d{4}-\d{2}-\d{2}$')
);

-- CropTrait Table
CREATE TABLE CropTrait (
  CropTraitID SERIAL PRIMARY KEY,
  CropID INT NOT NULL,
  TraitName VARCHAR(100) NOT NULL,
  Entity VARCHAR(100),
  MethodDescription TEXT,
  Unit VARCHAR(20),
  MinimumAllowed DOUBLE PRECISION,
  MaximumAllowed DOUBLE PRECISION,
  FOREIGN KEY (CropID) REFERENCES Crop(CropID) ON DELETE CASCADE,
  CONSTRAINT valid_range_check CHECK (
    MinimumAllowed IS NULL OR 
    MaximumAllowed IS NULL OR 
    MinimumAllowed <= MaximumAllowed
  )
);

-- Trait Table
CREATE TABLE Trait (
  TraitID SERIAL PRIMARY KEY,
  MeasuredValue DOUBLE PRECISION,
  PredictedValue DOUBLE PRECISION,
  Year INT NOT NULL,
  Unit VARCHAR(20),
  StudyID INT NOT NULL,
  CropTraitID INT NOT NULL,
  SampleID INT NOT NULL,
  FOREIGN KEY (StudyID) REFERENCES Study(StudyID) ON DELETE CASCADE,
  FOREIGN KEY (CropTraitID) REFERENCES CropTrait(CropTraitID) ON DELETE CASCADE,
  CONSTRAINT unique_sample_per_study UNIQUE (StudyID, SampleID)
);

-- NIRSData Table
CREATE TABLE NIRSData (
  NIRSDataID SERIAL PRIMARY KEY,
  StudyID INT NOT NULL,
  SampleID INT NOT NULL,
  GID INT NOT NULL,
  PlotID INT NOT NULL,
  Wavelength INT NOT NULL,
  Value DOUBLE PRECISION NOT NULL,
  FOREIGN KEY (StudyID) REFERENCES Study(StudyID) ON DELETE CASCADE,
  FOREIGN KEY (SampleID, StudyID) REFERENCES Trait(SampleID, StudyID)
);