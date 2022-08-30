import {InitPromptAnswers} from "../interfaces/InitPromptAnswers";
import {InitOptions} from "../interfaces/InitOptions";
import {FeatureType} from "../config/FeaturesPrompt";

export function mapUniqFeatures(answers: InitPromptAnswers & any): InitOptions {
  const features: string[] = [];

  Object.entries(answers)
    .filter(([key]) => key.startsWith("features"))
    .forEach(([key, value]: any[]) => {
      delete answers[key];
      features.push(...[].concat(value));
    });

  return {
    ...answers,
    features: [...new Set(features).values()] as FeatureType[]
  };
}
