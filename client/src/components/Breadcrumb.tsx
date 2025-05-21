import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

type BreadcrumbProps = {
  backTo: string;
  label: string;
};

export function Breadcrumb({ backTo, label }: BreadcrumbProps) {
  return (
    <div className="bg-gray-50 py-2 px-6 border-b border-gray-200">
      <div className="container mx-auto flex items-center">
        <Link href={backTo}>
          <Button variant="ghost" size="sm" className="flex items-center space-x-1 text-gray-600">
            <ArrowLeft className="h-4 w-4" />
            <span>{label}</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}