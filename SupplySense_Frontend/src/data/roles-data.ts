export type UserRole = "admin" | "inventory_manager";

export interface RoleDefinition {
  id: UserRole;
  title: string;
  badge: string;
  description: string;
  capabilities: string[];
  permissions: string[];
  onboarding: {
    title: string;
    subtitle: string;
    steps: {
      id: string;
      title: string;
      description: string;
      estimatedMinutes: number;
    }[];
  };
}

export const ENTERPRISE_ROLES: RoleDefinition[] = [
  {
    id: "admin",
    title: "Admin",
    badge: "Full Control",
    description: "Manage users, warehouses, configurations, and platform settings.",
    capabilities: [
      "User Management",
      "Warehouse Management",
      "Full Dashboard Access",
      "System Configuration",
    ],
    permissions: ["Full Access", "User Management", "System Configuration"],
    onboarding: {
      title: "Workspace Administrator Setup",
      subtitle: "Configure your enterprise tenant, invite team members, and link primary ERP nodes.",
      steps: [
        {
          id: "create_team",
          title: "Create Team & Access Policies",
          description: "Define organizational structure, SSO provisioning, and multi-factor enforcement.",
          estimatedMinutes: 2,
        },
        {
          id: "add_users",
          title: "Add Users & Assign Roles",
          description: "Invite department leads with pre-configured RBAC boundaries.",
          estimatedMinutes: 3,
        },
        {
          id: "configure_warehouses",
          title: "Configure Warehouses & ERP Sync",
          description: "Establish connections to SAP S/4HANA, NetSuite, and warehouse DC networks.",
          estimatedMinutes: 4,
        },
      ],
    },
  },
  {
    id: "inventory_manager",
    title: "Inventory Manager",
    badge: "Operations",
    description: "Monitor inventory, stockout risks, and replenishment recommendations.",
    capabilities: [
      "Inventory Visibility",
      "Reorder Recommendations",
      "Inventory Health Monitoring",
      "AI Insights",
    ],
    permissions: ["Inventory Visibility", "Reorder Actions", "Inventory Health Monitoring"],
    onboarding: {
      title: "Inventory Intelligence Setup",
      subtitle: "Calibrate safety stock thresholds, link distribution centers, and enable AI replenishment.",
      steps: [
        {
          id: "inventory_overview",
          title: "Inventory Overview & SKU Health",
          description: "Review live SKU telemetry, velocity classifications, and buffer thresholds.",
          estimatedMinutes: 2,
        },
        {
          id: "warehouse_setup",
          title: "Warehouse Setup & DC Routing",
          description: "Map primary DC nodes (Dallas, Chicago, Antwerp) and inter-facility transit times.",
          estimatedMinutes: 3,
        },
        {
          id: "stock_monitoring",
          title: "Stock Monitoring & P0 Alarms",
          description: "Configure automated alerts for stockouts under 7 days and high-velocity drift.",
          estimatedMinutes: 2,
        },
      ],
    },
  },
];
