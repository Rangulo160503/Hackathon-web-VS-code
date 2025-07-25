const API_BASE_URL = "https://hackathon-api-azavg2aqbdhjcafx.canadacentral-01.azurewebsites.net";

export const obtenerPuntos = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/Punto`);
    if (!response.ok) {
      throw new Error(`Error al obtener puntos: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("🛑 Error en obtenerPuntos:", error.message);
    return [];
  }
};
