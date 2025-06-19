import apiClient from "../apiClient";

export async function getMedicinePerCoincidence(description: string) {
  try {
    const Response = await apiClient.get("/", {
      data: {
        description,
      },
    });
    console.log(Response);
    return Response.data;
  } catch (error) {
    console.log("error getting medicines", error);
    throw error;
  }
}
