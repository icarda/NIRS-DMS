export interface Trait {
  variable: string;
  name: string;
  entity: "Grain" | "Wort";
  method: string;
  unit: string;
}

export interface Crop {
  id: string;
  title: string;
  description: string;
  image: string;
  traits: Trait[];
}

export const crops: Crop[] = [
  {
    id: "barley",
    title: "Barley",
    description:
      "A versatile cereal grain primarily used in brewing and animal feed, known for its high nutritional value and brewing qualities.",
    image: "/barley.png",
    traits: [
      {
        variable: "BetaGlucan",
        name: "Grain Beta Glucan",
        entity: "Grain",
        method:
          "Measure grain Beta Glucan content by applying EBC method of analysis (betaglucan test Megazyme kit method).",
        unit: "%",
      },
      {
        variable: "Fe",
        name: "Grain Iron Content",
        entity: "Grain",
        method: "Use standard Iron content dry ash method.",
        unit: "mg/kg",
      },
      {
        variable: "Zn",
        name: "Grain Zinc Content",
        entity: "Grain",
        method: "Use standard Zinc content dry ash method.",
        unit: "mg/kg",
      },
      {
        variable: "FAN",
        name: "Free Amino Nitrogen content",
        entity: "Wort",
        method: "Use standard EBC method of analysis for wort viscosity.",
        unit: "ppm",
      },
      {
        variable: "Viscosity",
        name: "The viscosity of the wort",
        entity: "Wort",
        method: "Use standard EBC method of analysis for wort viscosity.",
        unit: "mPas",
      },
    ],
  },
  {
    id: "wheat",
    title: "Wheat",
    description:
      "A versatile cereal grain that is a worldwide staple food, known for its adaptability and high nutritional value.",
    image: "/placeholder.svg?height=600&width=600",
    traits: [
      {
        variable: "BetaGlucan",
        name: "Grain Beta Glucan",
        entity: "Grain",
        method:
          "Measure grain Beta Glucan content by applying EBC method of analysis (betaglucan test Megazyme kit method).",
        unit: "%",
      },
      {
        variable: "Fe",
        name: "Grain Iron Content",
        entity: "Grain",
        method: "Use standard Iron content dry ash method.",
        unit: "mg/kg",
      },
      {
        variable: "Zn",
        name: "Grain Zinc Content",
        entity: "Grain",
        method: "Use standard Zinc content dry ash method.",
        unit: "mg/kg",
      },
      {
        variable: "FAN",
        name: "Free Amino Nitrogen content",
        entity: "Wort",
        method: "Use standard EBC method of analysis for wort viscosity.",
        unit: "ppm",
      },
      {
        variable: "Viscosity",
        name: "The viscosity of the wort",
        entity: "Wort",
        method: "Use standard EBC method of analysis for wort viscosity.",
        unit: "mPas",
      },
    ],
  },
  {
    id: "rice",
    title: "Rice",
    description:
      "A staple food for more than half of the world's population, rice is known for its versatility and cultural significance.",
    image: "/placeholder.svg?height=600&width=600",
    traits: [
      {
        variable: "BetaGlucan",
        name: "Grain Beta Glucan",
        entity: "Grain",
        method:
          "Measure grain Beta Glucan content by applying EBC method of analysis (betaglucan test Megazyme kit method).",
        unit: "%",
      },
      {
        variable: "Fe",
        name: "Grain Iron Content",
        entity: "Grain",
        method: "Use standard Iron content dry ash method.",
        unit: "mg/kg",
      },
      {
        variable: "Zn",
        name: "Grain Zinc Content",
        entity: "Grain",
        method: "Use standard Zinc content dry ash method.",
        unit: "mg/kg",
      },
      {
        variable: "FAN",
        name: "Free Amino Nitrogen content",
        entity: "Wort",
        method: "Use standard EBC method of analysis for wort viscosity.",
        unit: "ppm",
      },
      {
        variable: "Viscosity",
        name: "The viscosity of the wort",
        entity: "Wort",
        method: "Use standard EBC method of analysis for wort viscosity.",
        unit: "mPas",
      },
    ],
  },
  {
    id: "corn",
    title: "Corn (Maize)",
    description:
      "A versatile crop used for food, feed, and fuel, corn is known for its high productivity and wide range of applications.",
    image: "/placeholder.svg?height=600&width=600",
    traits: [
      {
        variable: "BetaGlucan",
        name: "Grain Beta Glucan",
        entity: "Grain",
        method:
          "Measure grain Beta Glucan content by applying EBC method of analysis (betaglucan test Megazyme kit method).",
        unit: "%",
      },
      {
        variable: "Fe",
        name: "Grain Iron Content",
        entity: "Grain",
        method: "Use standard Iron content dry ash method.",
        unit: "mg/kg",
      },
      {
        variable: "Zn",
        name: "Grain Zinc Content",
        entity: "Grain",
        method: "Use standard Zinc content dry ash method.",
        unit: "mg/kg",
      },
      {
        variable: "FAN",
        name: "Free Amino Nitrogen content",
        entity: "Wort",
        method: "Use standard EBC method of analysis for wort viscosity.",
        unit: "ppm",
      },
      {
        variable: "Viscosity",
        name: "The viscosity of the wort",
        entity: "Wort",
        method: "Use standard EBC method of analysis for wort viscosity.",
        unit: "mPas",
      },
    ],
  },
];
