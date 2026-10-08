import type { CareerRoadmapResponse } from '../types/roadmap';
import type { CareerFormData } from '../components/CareerForm';

export async function generateRoadmapWithGemini(
  formData: CareerFormData
): Promise<CareerRoadmapResponse> {
  const response = await fetch('/api/generate-roadmap', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(formData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message =
      errorData.error ||
      errorData.details ||
      `HTTP error ${response.status}: Failed to generate career roadmap.`;
    throw new Error(message);
  }

  const parsedData: CareerRoadmapResponse = await response.json();

  if (!parsedData || !Array.isArray(parsedData.nodes) || parsedData.nodes.length === 0) {
    throw new Error('Gemini API returned an invalid or empty roadmap structure. Please try again.');
  }

  return parsedData;
}
