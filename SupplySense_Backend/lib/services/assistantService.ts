import apiClient from '@/lib/api/client';
import { DataSourceConfig } from '@/lib/config/dataSource';
import { AIMessage, ResponseType } from '@/types';

export const assistantService = {
  async askQuestion(question: string, context?: { page?: string; entityId?: string }): Promise<AIMessage> {
    if (DataSourceConfig.isApi) {
      const response = await apiClient.post('/api/v1/assistant/chat', { question, context });
      return response.data;
    }

    const qLower = question.toLowerCase();
    let content = "SupplySense AI model analyzed current telematics and ERP streams. Key observation: Stock rebalancing is recommended for high-demand microcontrollers before Wk 33.";
    let responseType: ResponseType = 'AGENT';
    let agentUsed = 'Inventory Risk Agent';
    let sources = undefined;

    if (qLower.includes('macbook') || qLower.includes('quantity') || qLower.includes('stock')) {
      responseType = 'DIRECT_TOOL';
      agentUsed = 'Inventory Database Tool';
      content = `### Direct Inventory Query Result\n- **Product**: Apple ProBook Ultra 15" (SKU-1002)\n- **Available Quantity**: **142 units** across global depots.\n- **Warehouse Allocation**: US-East Central (84 units), Oakland Terminal (58 units).\n- **Reorder Level Status**: Below Safety Threshold (500 units).`;
    } else if (qLower.includes('delayed') || qLower.includes('shipment')) {
      responseType = 'AGENT';
      agentUsed = 'Shipment Telematics Agent';
      content = `### In-Transit Shipment Overview\n- **Shipment**: SHP-9021 (Oceanic Express Lines, MV Horizon).\n- **Tracking ID**: \`TRK-8890123-US\`\n- **Route**: Shenzhen, China ➔ Oakland, CA, USA\n- **Delay Reason**: Weather delay in East China Sea + Oakland Berth queue.\n- **Revised ETA**: August 16, 2026 (+4 days delay).`;
    } else if (qLower.includes('supplier') || qLower.includes('delivery')) {
      responseType = 'AGENT';
      agentUsed = 'Supplier SLA Agent';
      content = `### Supplier Performance Insights\n- **Highest Risk Vendor**: EuroPower Lithium Components (Germany).\n- **Current On-Time Delivery**: **74%** (SLA target 92%).\n- **Impact**: Delayed shipment of battery cells for ANC soundbars by 5 days.`;
    } else if (qLower.includes('procurement') || qLower.includes('emergency') || qLower.includes('policy') || qLower.includes('sop')) {
      responseType = 'RAG';
      agentUsed = 'RAG Knowledge Agent (Qdrant Vector DB)';
      content = `### Emergency Procurement Policy\nAccording to corporate policy **SSE-EMG-POL-001**, when safety stock drops below 30% of threshold:\n1. Operations Manager can trigger expedited PO up to **$500,000** without prior board approval.\n2. Secondary verified regional vendor must be selected if lead time exceeds 10 business days.\n3. Air-freight surcharge is pre-authorized up to 15% of shipment valuation.`;
      sources = [
        {
          documentId: 'doc-sop-001',
          title: 'Emergency Procurement Policy.pdf',
          code: 'SSE-EMG-POL-001',
          section: 'Emergency Sourcing Protocols',
          page: 4,
          snippet: 'Section 4.2: Expedited Purchase Order Authorization thresholds and emergency supplier failover rules.'
        },
        {
          documentId: 'doc-sla-2026',
          title: 'Global Vendor SLA Governance Framework.docx',
          code: 'SSE-SLA-GOV-2026',
          section: 'Penalty & Alternative Sourcing',
          page: 12,
          snippet: 'Clause 8.1: Default provisions when primary supplier delays exceed 72 hours.'
        }
      ];
    } else if (qLower.includes('risk')) {
      responseType = 'AGENT';
      agentUsed = 'Supply Chain Risk Agent';
      content = `### Operational Threats Overview\n- **Composite Risk Score**: **78 / 100**\n- **Top Threat**: Port Clearance congestion at Oakland Hub.\n- **Inventory Breaches**: 2 SKUs currently in Critical status (<200 units).`;
    }

    return {
      id: `msg-${Date.now()}`,
      sender: 'assistant',
      content,
      responseType,
      agentUsed,
      sources,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  }
};
