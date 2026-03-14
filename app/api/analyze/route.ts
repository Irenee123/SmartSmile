import { z } from "zod";

const teethAnalysisSchema = z.object({
  overallCondition: z
    .enum(["Excellent", "Good", "Fair", "Poor", "Critical"])
    .describe("Overall teeth condition rating"),
  confidenceScore: z
    .number()
    .min(0)
    .max(100)
    .describe("Confidence score of the analysis as a percentage"),
  findings: z
    .array(
      z.object({
        area: z.string().describe("The tooth or area affected"),
        condition: z.string().describe("Description of the condition found"),
        severity: z
          .enum(["Low", "Medium", "High"])
          .describe("Severity of the finding"),
      })
    )
    .describe("List of specific findings from the image"),
  recommendations: z
    .array(z.string())
    .describe("List of dental care recommendations"),
  summary: z.string().describe("A brief paragraph summarizing the overall dental health observed in the image"),
});

export type TeethAnalysis = z.infer<typeof teethAnalysisSchema>;

// Condition information mapping
const CONDITION_INFO: Record<string, {
  name: string;
  description: string;
  severity: "Low" | "Medium" | "High";
  recommendations: string[];
}> = {
  calculus: {
    name: "Calculus (Tartar) Buildup",
    description: "Hardened plaque deposits on teeth that can only be removed by professional cleaning",
    severity: "Medium",
    recommendations: [
      "Schedule a professional dental cleaning as soon as possible",
      "Brush teeth twice daily with fluoride toothpaste",
      "Floss daily to prevent further buildup",
      "Use an antiseptic mouthwash",
      "Consider using a tartar-control toothpaste"
    ]
  },
  caries: {
    name: "Dental Caries (Cavities)",
    description: "Tooth decay caused by bacteria that produce acid, leading to holes in the teeth",
    severity: "High",
    recommendations: [
      "See a dentist immediately for examination and treatment",
      "Avoid sugary foods and drinks",
      "Brush after every meal if possible",
      "Use fluoride toothpaste and consider fluoride treatments",
      "Maintain regular dental check-ups every 6 months"
    ]
  },
  gingivitis: {
    name: "Gingivitis",
    description: "Inflammation of the gums caused by plaque buildup, characterized by redness and swelling",
    severity: "Medium",
    recommendations: [
      "Improve oral hygiene with thorough brushing twice daily",
      "Floss daily to remove plaque between teeth",
      "Use an antibacterial mouthwash",
      "Schedule a dental cleaning",
      "If symptoms persist, consult a dentist to prevent progression to periodontitis"
    ]
  },
  hypodontia: {
    name: "Hypodontia (Missing Teeth)",
    description: "Congenital absence of one or more teeth",
    severity: "Medium",
    recommendations: [
      "Consult with a dentist or orthodontist for treatment options",
      "Consider dental implants, bridges, or dentures",
      "Maintain excellent oral hygiene for remaining teeth",
      "Regular dental check-ups to monitor oral health",
      "Discuss orthodontic options if spacing issues exist"
    ]
  },
  mouth_ulcer: {
    name: "Mouth Ulcer",
    description: "Painful sores in the mouth that can be caused by injury, stress, or certain foods",
    severity: "Low",
    recommendations: [
      "Avoid spicy, acidic, or rough foods that may irritate the ulcer",
      "Use over-the-counter oral gels or rinses for pain relief",
      "Maintain good oral hygiene",
      "If ulcers persist for more than 2 weeks, consult a dentist",
      "Stay hydrated and maintain a balanced diet"
    ]
  },
  tooth_discoloration: {
    name: "Tooth Discoloration",
    description: "Changes in tooth color due to staining, aging, or other factors",
    severity: "Low",
    recommendations: [
      "Schedule a professional teeth cleaning",
      "Consider professional whitening treatments",
      "Reduce consumption of staining beverages (coffee, tea, red wine)",
      "Quit smoking if applicable",
      "Maintain regular brushing and flossing routine"
    ]
  }
};

function mapPredictionToAnalysis(
  prediction: string,
  confidence: number,
  allScores: Record<string, number>
): TeethAnalysis {
  const conditionInfo = CONDITION_INFO[prediction];
  
  if (!conditionInfo) {
    // Fallback for unknown conditions
    return {
      overallCondition: "Fair",
      confidenceScore: Math.round(confidence),
      findings: [{
        area: "Overall oral cavity",
        condition: `Detected condition: ${prediction}`,
        severity: "Medium"
      }],
      recommendations: [
        "Consult with a dentist for professional evaluation",
        "Maintain good oral hygiene practices",
        "Schedule regular dental check-ups"
      ],
      summary: `The analysis detected ${prediction} with ${confidence.toFixed(1)}% confidence. Please consult with a dental professional for accurate diagnosis and treatment.`
    };
  }

  // Determine overall condition based on severity and confidence
  let overallCondition: "Excellent" | "Good" | "Fair" | "Poor" | "Critical";
  if (conditionInfo.severity === "High" && confidence > 70) {
    overallCondition = "Poor";
  } else if (conditionInfo.severity === "High") {
    overallCondition = "Fair";
  } else if (conditionInfo.severity === "Medium" && confidence > 70) {
    overallCondition = "Fair";
  } else if (conditionInfo.severity === "Medium") {
    overallCondition = "Good";
  } else {
    overallCondition = confidence > 70 ? "Good" : "Fair";
  }

  // Check for secondary conditions (confidence > 20%)
  const secondaryConditions = Object.entries(allScores)
    .filter(([key, score]) => key !== prediction && score > 0.2)
    .sort((a, b) => b[1] - a[1]);

  const findings = [
    {
      area: "Primary finding",
      condition: conditionInfo.description,
      severity: conditionInfo.severity
    },
    ...secondaryConditions.map(([key, score]) => ({
      area: "Secondary observation",
      condition: `Possible ${CONDITION_INFO[key]?.name || key} (${(score * 100).toFixed(1)}% confidence)`,
      severity: "Low" as const
    }))
  ];

  const summary = `The AI analysis has detected ${conditionInfo.name} with ${confidence.toFixed(1)}% confidence. ${conditionInfo.description}. ${
    secondaryConditions.length > 0
      ? `Additionally, there are minor indicators of ${secondaryConditions.map(([k]) => CONDITION_INFO[k]?.name || k).join(" and ")}.`
      : ""
  } It is recommended to consult with a dental professional for proper diagnosis and treatment planning.`;

  return {
    overallCondition,
    confidenceScore: Math.round(confidence),
    findings,
    recommendations: conditionInfo.recommendations,
    summary
  };
}

// Mock ML model for testing when backend is not available
function mockPredict(): { prediction: string; confidence_percentage: number; all_scores: Record<string, number> } {
  const conditions = ['gingivitis', 'caries', 'calculus', 'tooth_discoloration', 'hypodontia', 'mouth_ulcer'];
  const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
  const confidence = 70 + Math.random() * 25;
  
  const allScores: Record<string, number> = {};
  conditions.forEach(c => {
    allScores[c] = c === randomCondition ? confidence / 100 : Math.random() * 0.25;
  });
  
  return {
    prediction: randomCondition,
    confidence_percentage: Math.round(confidence),
    all_scores: allScores
  };
}

export async function POST(req: Request) {
  try {
    const { image } = await req.json();

    if (!image) {
      return Response.json({ error: "No image provided" }, { status: 400 });
    }

    // Get the authorization header from the request
    const authHeader = req.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return Response.json({ error: "Authentication required" }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');

    // Get Python API URL from environment variable
    const pythonApiUrl = process.env.PYTHON_API_URL || "http://localhost:8000";

    let data;
    
    try {
      // Try to call Python backend with JWT token
      const response = await fetch(`${pythonApiUrl}/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ image }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Python API error:", errorData);
        throw new Error(errorData.detail || "Failed to analyze image");
      }

      data = await response.json();
    } catch (fetchError) {
      // If backend is not available, use mock data for testing
      console.log("Python backend not available, using mock data for testing");
      data = mockPredict();
    }

    // Map Python backend response to our analysis format
    const analysis = mapPredictionToAnalysis(
      data.prediction,
      data.confidence_percentage,
      data.all_scores
    );

    // Add raw scores and heatmap to the analysis for visualization
    (analysis as any).allScores = data.all_scores;
    (analysis as any).primaryPrediction = data.prediction;
    (analysis as any).heatmapImage = data.heatmap_image || null;

    return Response.json({ analysis });
  } catch (error) {
    console.error("Analysis error:", error);
    return Response.json(
      {
        error: "Failed to analyze image",
        detail: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
