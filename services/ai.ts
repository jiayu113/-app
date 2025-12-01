import { GoogleGenAI, Type } from "@google/genai";
import { Priority } from "../types";

// Initialize the API client
// Note: process.env.API_KEY is assumed to be available in the environment
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

interface AIProsposedTask {
  title: string;
  estimatedMinutes: number;
  priority: string;
}

export const breakDownGoal = async (goal: string): Promise<AIProsposedTask[]> => {
  try {
    const modelId = "gemini-2.5-flash"; // Using the fast, efficient model for task logic
    
    const response = await ai.models.generateContent({
      model: modelId,
      contents: `Please break down the following goal into a list of 3 to 6 actionable subtasks. Goal: "${goal}". For each task, estimate the time in minutes and assign a priority (HIGH, MEDIUM, LOW).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: {
                type: Type.STRING,
                description: "A clear, actionable task name in Chinese (if the goal was Chinese) or English.",
              },
              estimatedMinutes: {
                type: Type.INTEGER,
                description: "Estimated duration in minutes.",
              },
              priority: {
                type: Type.STRING,
                enum: ["HIGH", "MEDIUM", "LOW"],
                description: "Priority level of the task.",
              }
            },
            required: ["title", "estimatedMinutes", "priority"],
          },
        },
      },
    });

    if (response.text) {
      const tasks = JSON.parse(response.text) as AIProsposedTask[];
      return tasks;
    }
    return [];
  } catch (error) {
    console.error("Error breaking down goal:", error);
    throw error;
  }
};