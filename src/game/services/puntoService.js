
const isProd = process.env.NODE_ENV === "production";

const API_BASE_URL = isProd
  ? "https://hackathon-api-azavg2aqbdhjcafx.canadacentral-01.azurewebsites.net"
  : "/api";

export const obtenerPuntos = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/Punto`);
    if (!response.ok) {
      throw new Error("Error al obtener puntos");
    }
    return await response.json();
  } catch (error) {
    console.error("Error en puntoService:", error);
    return [];
  }
};
