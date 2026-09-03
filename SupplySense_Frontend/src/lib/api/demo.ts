import apiClient from "./client";

export interface DemoStatusData {
  is_running: boolean;
  interval_seconds: number;
  total_events_fired: number;
  recent_events: Array<{
    event_id: string;
    event_type: string;
    timestamp: string;
    time_str: string;
    title: string;
    message: string;
    severity?: string;
    sku?: string;
    new_stock?: number;
    delay_days?: number;
    location?: string;
  }>;
}

export async function getDemoStatus(): Promise<DemoStatusData> {
  const res = await apiClient.get<{ success: boolean; data: DemoStatusData }>("/demo/status");
  return res.data.data;
}

export async function startDemoFeed(intervalSeconds: number = 6.0): Promise<DemoStatusData> {
  const res = await apiClient.post<{ success: boolean; data: DemoStatusData }>("/demo/start", {
    interval_seconds: intervalSeconds,
  });
  return res.data.data;
}

export async function stopDemoFeed(): Promise<DemoStatusData> {
  const res = await apiClient.post<{ success: boolean; data: DemoStatusData }>("/demo/stop");
  return res.data.data;
}

export async function triggerDemoEvent(eventType: string = "random"): Promise<any> {
  const res = await apiClient.post<{ success: boolean; data: any }>("/demo/trigger", {
    event_type: eventType,
  });
  return res.data.data;
}

export async function resetDemoData(): Promise<any> {
  const res = await apiClient.post<{ success: boolean; data: any }>("/demo/reset");
  return res.data.data;
}
