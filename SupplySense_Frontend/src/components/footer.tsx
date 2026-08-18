import Link from "next/link";
import { Boxes } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-[#E5E7EB] bg-white py-20 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1280px]">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-16">
          {/* Col 1: Brand & Status */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#111827] text-white">
                <Boxes className="h-5 w-5" />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-[#111827]">
                SupplySense
              </span>
            </Link>
            <p className="mt-4 text-sm text-[#6B7280] max-w-sm leading-relaxed font-medium">
              Enterprise AI Supply Chain Risk & Inventory Intelligence platform. Built for inventory
              managers, procurement directors, and operations teams.
            </p>

            <div className="mt-5 flex items-center gap-2.5">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#16A34A] animate-pulse" />
              <span className="text-xs font-mono font-semibold text-[#6B7280]">
                All Systems Operational (99.99% Uptime)
              </span>
            </div>
          </div>

          {/* Col 2: Product */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#111827] mb-4">
              Product
            </h4>
            <ul className="space-y-3 text-sm font-medium text-[#6B7280]">
              <li>
                <Link href="#features" className="hover:text-[#111827] transition-colors">
                  Inventory Command
                </Link>
              </li>
              <li>
                <Link href="#features" className="hover:text-[#111827] transition-colors">
                  Risk Intelligence
                </Link>
              </li>
              <li>
                <Link href="#features" className="hover:text-[#111827] transition-colors">
                  Demand Forecasting
                </Link>
              </li>
              <li>
                <Link href="#agents" className="hover:text-[#111827] transition-colors">
                  Autonomous AI Agents
                </Link>
              </li>
              <li>
                <Link href="#showcase" className="hover:text-[#111827] transition-colors">
                  Supplier Scorecards
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Resources */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#111827] mb-4">
              Resources
            </h4>
            <ul className="space-y-3 text-sm font-medium text-[#6B7280]">
              <li>
                <Link href="#demo" className="hover:text-[#111827] transition-colors">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="#demo" className="hover:text-[#111827] transition-colors">
                  API & Webhooks
                </Link>
              </li>
              <li>
                <Link href="#demo" className="hover:text-[#111827] transition-colors">
                  S&OP Frameworks
                </Link>
              </li>
              <li>
                <Link href="#demo" className="hover:text-[#111827] transition-colors">
                  Working Capital Calculator
                </Link>
              </li>
              <li>
                <Link href="#demo" className="hover:text-[#111827] transition-colors">
                  Security & SOC2
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Company & Legal */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#111827] mb-4">
              Company
            </h4>
            <ul className="space-y-3 text-sm font-medium text-[#6B7280]">
              <li>
                <Link href="#demo" className="hover:text-[#111827] transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="#demo" className="hover:text-[#111827] transition-colors">
                  Customer Stories
                </Link>
              </li>
              <li>
                <Link href="#demo" className="hover:text-[#111827] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="#demo" className="hover:text-[#111827] transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="#demo" className="hover:text-[#111827] transition-colors">
                  Contact Support
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-10 border-t border-[#E5E7EB] flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-[#6B7280]">
          <div>
            &copy; {new Date().getFullYear()} SupplySense Inc. All rights reserved. Enterprise Supply
            Chain Intelligence.
          </div>

          <div className="flex items-center gap-4 text-[#6B7280]">
            <span className="font-mono text-xs">v2.4.0-prod</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
