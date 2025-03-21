-- Role Type
CREATE TYPE role AS ENUM ('USER', 'ADMIN', 'SUPERADMIN');

-- Center Table
CREATE TABLE center (
  id SERIAL PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  acronym TEXT NOT NULL,
  createdAt TIMESTAMPTZ DEFAULT now() NOT NULL,
  updatedAt TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT center_acronym_unique UNIQUE(acronym)
);

-- QualityLab Table
CREATE TABLE quality_lab (
  id SERIAL PRIMARY KEY NOT NULL,
  center_id INT NOT NULL,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  country TEXT NOT NULL,
  createdAt TIMESTAMPTZ DEFAULT now() NOT NULL,
  updatedAt TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT quality_lab_name_unique UNIQUE(name),
  FOREIGN KEY (center_id) REFERENCES center(id) ON DELETE CASCADE
);

-- Crop Table
CREATE TABLE crop (
  id SERIAL PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  crop_image_url TEXT,
  description TEXT,
  createdAt TIMESTAMPTZ DEFAULT now() NOT NULL,
  updatedAt TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT crop_name_unique UNIQUE(name)
);

-- CropTrial Table
CREATE TABLE crop_trial (
  id SERIAL PRIMARY KEY NOT NULL,
  crop_id INT NOT NULL,
  trial_id INT NOT NULL,
  createdAt TIMESTAMPTZ DEFAULT now() NOT NULL,
  updatedAt TIMESTAMPTZ DEFAULT now() NOT NULL,
  FOREIGN KEY (crop_id) REFERENCES crop(id) ON DELETE CASCADE,
  FOREIGN KEY (trial_id) REFERENCES trial(id) ON DELETE CASCADE
);

-- CropCommonName Table
CREATE TABLE crop_common_name (
  id SERIAL PRIMARY KEY NOT NULL,
  crop_id INT NOT NULL,
  common_name TEXT NOT NULL,
  createdAt TIMESTAMPTZ DEFAULT now() NOT NULL,
  updatedAt TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT crop_common_name_common_name_unique UNIQUE(common_name),
  FOREIGN KEY (crop_id) REFERENCES crop(id) ON DELETE CASCADE
);

-- Species Table
CREATE TABLE species (
  id SERIAL PRIMARY KEY NOT NULL,
  crop_id INT NOT NULL,
  name TEXT NOT NULL,
  createdAt TIMESTAMPTZ DEFAULT now() NOT NULL,
  updatedAt TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT species_name_unique UNIQUE(name),
  FOREIGN KEY (crop_id) REFERENCES crop(id) ON DELETE CASCADE
);

-- ProductType Table
CREATE TABLE product_type (
  id SERIAL PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  crop_id INT NOT NULL,
  createdAt TIMESTAMPTZ DEFAULT now() NOT NULL,
  updatedAt TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT product_type_name_unique UNIQUE(name),
  FOREIGN KEY (crop_id) REFERENCES crop(id) ON DELETE CASCADE
);

-- PhysiologicalStage Table
CREATE TABLE physiological_stage (
  id SERIAL PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  crop_id INT NOT NULL,
  createdAt TIMESTAMPTZ DEFAULT now() NOT NULL,
  updatedAt TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT physiological_stage_name_unique UNIQUE(name),
  FOREIGN KEY (crop_id) REFERENCES crop(id) ON DELETE CASCADE
);

-- NIRModel Table
CREATE TABLE nir_model (
  id SERIAL PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  wavelength_range TEXT NOT NULL,
  resolution TEXT NOT NULL,
  manufacturer TEXT NOT NULL,
  createdAt TIMESTAMPTZ DEFAULT now() NOT NULL,
  updatedAt TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT nir_model_name_unique UNIQUE(name)
);

-- NIRSData Table
CREATE TABLE nirs_data (
  id SERIAL PRIMARY KEY NOT NULL,
  study_id INT NOT NULL,
  sample_id INT NOT NULL,
  gid INT NOT NULL,
  plot_id INT NOT NULL,
  wavelength INT NOT NULL,
  value DOUBLE PRECISION NOT NULL,
  createdAt TIMESTAMPTZ DEFAULT now() NOT NULL,
  updatedAt TIMESTAMPTZ DEFAULT now() NOT NULL,
  FOREIGN KEY (study_id) REFERENCES study(id) ON DELETE CASCADE
);

-- Trial Table
CREATE TABLE trial (
  id SERIAL PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  planting_date DATE NOT NULL,
  soil_type TEXT NOT NULL,
  irrigation BOOLEAN NOT NULL,
  location TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  additional_metadata JSONB DEFAULT '{}',
  species_id INT NOT NULL,
  crop_id INT NOT NULL,
  createdAt TIMESTAMPTZ DEFAULT now() NOT NULL,
  updatedAt TIMESTAMPTZ DEFAULT now() NOT NULL,
  FOREIGN KEY (crop_id) REFERENCES crop(id) ON DELETE CASCADE,
  FOREIGN KEY (species_id) REFERENCES species(id) ON DELETE CASCADE
);

-- TrialFertilizer Table
CREATE TABLE trial_fertilizer (
  id SERIAL PRIMARY KEY NOT NULL,
  trial_id INT NOT NULL,
  fertilizer_type TEXT NOT NULL,
  fertilizer_amount DOUBLE PRECISION NOT NULL,
  createdAt TIMESTAMPTZ DEFAULT now() NOT NULL,
  updatedAt TIMESTAMPTZ DEFAULT now() NOT NULL,
  FOREIGN KEY (trial_id) REFERENCES trial(id) ON DELETE CASCADE
);

-- Study Table
CREATE TABLE study (
  id SERIAL PRIMARY KEY NOT NULL,
  trial_id INT NOT NULL,
  study_code TEXT NOT NULL,
  product_type_id INT NOT NULL,
  nir_model_id INT NOT NULL,
  requester_name TEXT NOT NULL,
  requester_email TEXT NOT NULL,
  sample_date DATE NOT NULL,
  physiological_stage_id INT NOT NULL,
  additional_metadata JSONB DEFAULT '{}',
  quality_lab_id INT NOT NULL,
  createdAt TIMESTAMPTZ DEFAULT now() NOT NULL,
  updatedAt TIMESTAMPTZ DEFAULT now() NOT NULL,
  FOREIGN KEY (trial_id) REFERENCES trial(id) ON DELETE CASCADE,
  FOREIGN KEY (product_type_id) REFERENCES product_type(id) ON DELETE CASCADE,
  FOREIGN KEY (nir_model_id) REFERENCES nir_model(id) ON DELETE CASCADE,
  FOREIGN KEY (physiological_stage_id) REFERENCES physiological_stage(id) ON DELETE CASCADE,
  FOREIGN KEY (quality_lab_id) REFERENCES quality_lab(id) ON DELETE CASCADE
);

-- Trait Table
CREATE TABLE trait (
  id SERIAL PRIMARY KEY NOT NULL,
  trait_name TEXT NOT NULL,
  measured_value DOUBLE PRECISION,
  predicted_value DOUBLE PRECISION,
  year INT NOT NULL,
  unit TEXT NOT NULL,
  study_id INT NOT NULL,
  crop_id INT NOT NULL,
  sample_id INT NOT NULL,
  createdAt TIMESTAMPTZ DEFAULT now() NOT NULL,
  updatedAt TIMESTAMPTZ DEFAULT now() NOT NULL,
  FOREIGN KEY (study_id) REFERENCES study(id) ON DELETE CASCADE,
  FOREIGN KEY (crop_id) REFERENCES crop(id) ON DELETE CASCADE
);

-- User Table
CREATE TABLE user (
  id SERIAL PRIMARY KEY NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role role DEFAULT 'USER' NOT NULL,
  location TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  country TEXT NOT NULL,
  center_id INT NOT NULL,
  position TEXT NOT NULL,
  emailVerified TIMESTAMPTZ,
  createdAt TIMESTAMPTZ DEFAULT now() NOT NULL,
  updatedAt TIMESTAMPTZ DEFAULT now() NOT NULL,
  FOREIGN KEY (center_id) REFERENCES center(id) ON DELETE NO ACTION
);

-- Account Table
CREATE TABLE account (
  user_id INT NOT NULL,
  type TEXT NOT NULL,
  provider TEXT NOT NULL,
  provider_account_id TEXT NOT NULL,
  refresh_token TEXT,
  access_token TEXT,
  expires_at INT,
  token_type TEXT,
  scope TEXT,
  id_token TEXT,
  session_state TEXT,
  FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);