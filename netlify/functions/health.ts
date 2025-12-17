import { Handler } from "@netlify/functions";

export const handler: Handler = async (event, context) => {
    return {
        statusCode: 200,
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            status: "OK",
            timestamp: new Date().toISOString(),
            region: process.env.RIOT_REGION_PLATFORM || "unknown",
        }),
    };
};
