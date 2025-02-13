export const TRIALS = [
  {
    trial: "BW",
    trialPlantingDate: new Date(),
    crop: "wheat",
    soilType: "clay",
    location: "Sample Location",
    coordinates: "33.2315, -8.1515",
    irrigation: true,
    fertilizers: [
      { type: "nitrogen", amount: 23 },
      { type: "phosphorus", amount: 12 },
    ],
  },
  {
    trial: "FF-23",
    trialPlantingDate: new Date(Date.now() - 3600 * 24 * 1000),
    crop: "corn",
    soilType: "loam",
    location: "Sample Location 2",
    coordinates: "33.2315, -8.1515",
    irrigation: false,
    fertilizers: [{ type: "nitrogen", amount: 23 }],
  },
];
